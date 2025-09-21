from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func
from fastapi import HTTPException, status
from datetime import datetime, timezone
from typing import Optional
import models
from schemas import (
    BodegaCreate,
    BodegaUpdate,
    AjusteInventarioCreate,
    TransferenciaInventarioCreate,
    InventarioFisicoCreate,
    MovimientoInventarioCreate,
    TipoMovimientoEnum,
    MotivoMovimientoEnum,
)

# ==================== FUNCIONES DE BODEGA ====================


def get_bodegas(
    db: Session, skip: int = 0, limit: int = 100, solo_activas: bool = True
):
    """Obtener todas las bodegas"""
    query = db.query(models.Bodega)
    if solo_activas:
        query = query.filter(models.Bodega.activa)
    return query.offset(skip).limit(limit).all()


def get_bodega(db: Session, bodega_id: int):
    """Obtener una bodega por ID"""
    return db.query(models.Bodega).filter(models.Bodega.id == bodega_id).first()


def create_bodega(db: Session, bodega: BodegaCreate):
    """Crear una nueva bodega"""
    if db.query(models.Bodega).filter(models.Bodega.codigo == bodega.codigo).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe una bodega con el código {bodega.codigo}",
        )

    db_bodega = models.Bodega(**bodega.dict())
    db.add(db_bodega)
    db.commit()
    db.refresh(db_bodega)
    return db_bodega


def update_bodega(db: Session, bodega_id: int, bodega_update: BodegaUpdate):
    """Actualizar una bodega"""
    db_bodega = get_bodega(db, bodega_id)
    if not db_bodega:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bodega con ID {bodega_id} no encontrada",
        )

    update_data = bodega_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_bodega, key, value)

    db.commit()
    db.refresh(db_bodega)
    return db_bodega


def delete_bodega(db: Session, bodega_id: int):
    """Eliminar una bodega (soft delete)"""
    db_bodega = get_bodega(db, bodega_id)
    if not db_bodega:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bodega con ID {bodega_id} no encontrada",
        )

    # Verificar si la bodega tiene stock
    stock_count = db.query(models.StockBodega).filter(
        models.StockBodega.bodega_id == bodega_id
    ).count()

    if stock_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede eliminar la bodega {db_bodega.nombre} porque tiene {stock_count} productos en stock. Primero debe transferir o eliminar el stock.",
        )

    # Soft delete - marcar como inactiva
    db_bodega.activa = False
    db.commit()

    return {"message": f"Bodega {db_bodega.nombre} eliminada exitosamente"}


# ==================== FUNCIONES DE STOCK ====================


def get_stock_producto(db: Session, producto_id: int, bodega_id: Optional[int] = None):
    """Obtener el stock de un producto en todas las bodegas o en una específica"""
    query = db.query(models.StockBodega).filter(
        models.StockBodega.producto_id == producto_id
    )

    if bodega_id:
        query = query.filter(models.StockBodega.bodega_id == bodega_id)

    return query.all()


def get_stock_bodega(db: Session, bodega_id: int):
    """Obtener todo el stock de una bodega"""
    return (
        db.query(models.StockBodega)
        .filter(
            models.StockBodega.bodega_id == bodega_id, models.StockBodega.cantidad > 0
        )
        .options(
            joinedload(models.StockBodega.producto),
            joinedload(models.StockBodega.bodega),
        )
        .all()
    )


def get_stock_consolidado(db: Session, producto_id: int):
    """Obtener el stock consolidado de un producto en todas las bodegas"""
    # Primero, actualizar el stock total del producto
    stock_total_real = actualizar_stock_total_producto(db, producto_id)

    # Obtener el producto actualizado
    producto = (
        db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    )

    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado",
        )

    # Obtener stocks por bodega
    stocks = (
        db.query(models.StockBodega)
        .filter(models.StockBodega.producto_id == producto_id)
        .options(
            joinedload(models.StockBodega.producto),
            joinedload(models.StockBodega.bodega),
        )
        .all()
    )

    # Determinar el estado del stock
    if stock_total_real == 0:
        estado = "SIN_STOCK"
    elif stock_total_real <= producto.stock_minimo:
        estado = "STOCK_BAJO"
    else:
        estado = "NORMAL"

    # Commit para guardar la actualización del stock_actual
    db.commit()

    return {
        "producto": producto,
        "stock_total": stock_total_real,
        "stock_por_bodega": stocks,
        "estado": estado,
    }


def get_productos_stock_bajo(db: Session):
    """Obtener productos con stock bajo o sin stock"""
    # Primero actualizar todos los stocks
    productos = db.query(models.Producto).all()
    for producto in productos:
        actualizar_stock_total_producto(db, producto.id)

    db.commit()

    # Ahora obtener productos con stock bajo
    productos_alerta = (
        db.query(models.Producto)
        .filter(models.Producto.stock_actual <= models.Producto.stock_minimo)
        .all()
    )

    alertas = []
    for producto in productos_alerta:
        porcentaje = (
            (producto.stock_actual / producto.stock_minimo * 100)
            if producto.stock_minimo > 0
            else 0
        )
        alertas.append(
            {
                "producto": producto,
                "stock_actual": producto.stock_actual,
                "stock_minimo": producto.stock_minimo,
                "porcentaje_alerta": porcentaje,
            }
        )

    return alertas


# ==================== FUNCIONES DE MOVIMIENTOS ====================


def create_movimiento(
    db: Session, movimiento: MovimientoInventarioCreate, usuario_id: int
):
    """Crear un movimiento de inventario genérico"""
    # Validar producto
    producto = (
        db.query(models.Producto)
        .filter(models.Producto.id == movimiento.producto_id)
        .first()
    )
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {movimiento.producto_id} no encontrado",
        )

    # Crear el movimiento
    db_movimiento = models.MovimientoInventario(
        **movimiento.dict(), usuario_id=usuario_id, stock_anterior=producto.stock_actual
    )

    # Actualizar stock según el tipo de movimiento
    if movimiento.tipo_movimiento in [
        TipoMovimientoEnum.ENTRADA,
        TipoMovimientoEnum.AJUSTE_POSITIVO,
    ]:
        producto.stock_actual += movimiento.cantidad
    elif movimiento.tipo_movimiento in [
        TipoMovimientoEnum.SALIDA,
        TipoMovimientoEnum.AJUSTE_NEGATIVO,
    ]:
        if producto.stock_actual < movimiento.cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente. Stock actual: {producto.stock_actual}",
            )
        producto.stock_actual -= movimiento.cantidad

    db_movimiento.stock_posterior = producto.stock_actual

    db.add(db_movimiento)
    db.commit()
    db.refresh(db_movimiento)
    return db_movimiento


def ajustar_inventario(db: Session, ajuste: AjusteInventarioCreate, usuario_id: int):
    """Realizar un ajuste de inventario"""
    # Validar producto y bodega
    producto = (
        db.query(models.Producto)
        .filter(models.Producto.id == ajuste.producto_id)
        .first()
    )
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {ajuste.producto_id} no encontrado",
        )

    bodega = (
        db.query(models.Bodega).filter(models.Bodega.id == ajuste.bodega_id).first()
    )
    if not bodega:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bodega con ID {ajuste.bodega_id} no encontrada",
        )

    # Obtener o crear stock en bodega
    stock_bodega = (
        db.query(models.StockBodega)
        .filter(
            and_(
                models.StockBodega.producto_id == ajuste.producto_id,
                models.StockBodega.bodega_id == ajuste.bodega_id,
            )
        )
        .first()
    )

    if not stock_bodega:
        stock_bodega = models.StockBodega(
            producto_id=ajuste.producto_id,
            bodega_id=ajuste.bodega_id,
            cantidad=0,
            ubicacion="A1",
        )
        db.add(stock_bodega)
        db.flush()

    # Guardar stock anterior
    stock_anterior_bodega = stock_bodega.cantidad
    stock_anterior_total = producto.stock_actual

    # IMPORTANTE: La cantidad en ajuste ya viene con signo (positivo o negativo)
    # Si es positivo, sumamos. Si es negativo, restamos.
    cantidad_cambio = ajuste.cantidad  # Esta cantidad ya tiene el signo correcto

    # Determinar tipo de movimiento basado en el signo
    if cantidad_cambio >= 0:
        tipo_movimiento = models.TipoMovimiento.AJUSTE_POSITIVO
        cantidad_movimiento = abs(cantidad_cambio)  # Para el registro del movimiento
    else:
        tipo_movimiento = models.TipoMovimiento.AJUSTE_NEGATIVO
        cantidad_movimiento = abs(cantidad_cambio)  # Para el registro del movimiento

        # Validar stock suficiente para ajuste negativo
        if stock_bodega.cantidad < cantidad_movimiento:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente en bodega. Stock actual: {stock_bodega.cantidad}, intentando restar: {cantidad_movimiento}",
            )

    # ACTUALIZAR STOCK: Sumar/restar la cantidad (no reemplazar)
    stock_bodega.cantidad += (
        cantidad_cambio  # cantidad_cambio ya tiene el signo correcto
    )

    # Crear movimiento con la cantidad absoluta
    db_movimiento = models.MovimientoInventario(
        producto_id=ajuste.producto_id,
        tipo_movimiento=tipo_movimiento,
        cantidad=cantidad_movimiento,  # Siempre positiva en el movimiento
        bodega_origen_id=(
            ajuste.bodega_id
            if tipo_movimiento == models.TipoMovimiento.AJUSTE_NEGATIVO
            else None
        ),
        bodega_destino_id=(
            ajuste.bodega_id
            if tipo_movimiento == models.TipoMovimiento.AJUSTE_POSITIVO
            else None
        ),
        motivo=ajuste.motivo,
        observaciones=ajuste.observaciones,
        usuario_id=usuario_id,
        stock_anterior=stock_anterior_bodega,
        stock_posterior=stock_bodega.cantidad,
    )

    db.add(db_movimiento)

    # Actualizar stock total del producto
    actualizar_stock_total_producto(db, ajuste.producto_id)

    db.commit()
    db.refresh(db_movimiento)

    # Log para debugging
    print("Ajuste completado:")
    print(f"  - Producto: {producto.nombre} (ID: {ajuste.producto_id})")
    print(f"  - Bodega: {bodega.nombre} (ID: {ajuste.bodega_id})")
    print(f"  - Tipo: {tipo_movimiento}")
    print(
        f"  - Cantidad cambio: {cantidad_cambio} ({'+' if cantidad_cambio >= 0 else ''}{cantidad_cambio})"
    )
    print(f"  - Stock bodega: {stock_anterior_bodega} -> {stock_bodega.cantidad}")
    print(
        f"  - Stock total producto: {stock_anterior_total} -> {producto.stock_actual}"
    )

    return db_movimiento


def transferir_entre_bodegas(
    db: Session, transferencia: TransferenciaInventarioCreate, usuario_id: int
):
    """Realizar una transferencia entre bodegas"""
    if transferencia.bodega_origen_id == transferencia.bodega_destino_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La bodega de origen y destino no pueden ser la misma",
        )

    # Validar producto
    producto = (
        db.query(models.Producto)
        .filter(models.Producto.id == transferencia.producto_id)
        .first()
    )
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {transferencia.producto_id} no encontrado",
        )

    # Validar bodegas
    bodega_origen = (
        db.query(models.Bodega)
        .filter(models.Bodega.id == transferencia.bodega_origen_id)
        .first()
    )
    bodega_destino = (
        db.query(models.Bodega)
        .filter(models.Bodega.id == transferencia.bodega_destino_id)
        .first()
    )

    if not bodega_origen or not bodega_destino:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bodega de origen o destino no encontrada",
        )

    # Obtener stock en bodega origen
    stock_origen = (
        db.query(models.StockBodega)
        .filter(
            and_(
                models.StockBodega.producto_id == transferencia.producto_id,
                models.StockBodega.bodega_id == transferencia.bodega_origen_id,
            )
        )
        .first()
    )

    if not stock_origen or stock_origen.cantidad < transferencia.cantidad:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock insuficiente en bodega origen. Stock actual: {stock_origen.cantidad if stock_origen else 0}",
        )

    # Obtener o crear stock en bodega destino
    stock_destino = (
        db.query(models.StockBodega)
        .filter(
            and_(
                models.StockBodega.producto_id == transferencia.producto_id,
                models.StockBodega.bodega_id == transferencia.bodega_destino_id,
            )
        )
        .first()
    )

    if not stock_destino:
        stock_destino = models.StockBodega(
            producto_id=transferencia.producto_id,
            bodega_id=transferencia.bodega_destino_id,
            cantidad=0,
        )
        db.add(stock_destino)

    # Crear movimiento de salida
    movimiento_salida = models.MovimientoInventario(
        producto_id=transferencia.producto_id,
        tipo_movimiento=TipoMovimientoEnum.TRANSFERENCIA_SALIDA,
        cantidad=transferencia.cantidad,
        bodega_origen_id=transferencia.bodega_origen_id,
        bodega_destino_id=transferencia.bodega_destino_id,
        motivo=MotivoMovimientoEnum.TRANSFERENCIA,
        observaciones=transferencia.observaciones,
        usuario_id=usuario_id,
        stock_anterior=stock_origen.cantidad,
        stock_posterior=stock_origen.cantidad - transferencia.cantidad,
    )

    # Crear movimiento de entrada
    movimiento_entrada = models.MovimientoInventario(
        producto_id=transferencia.producto_id,
        tipo_movimiento=TipoMovimientoEnum.TRANSFERENCIA_ENTRADA,
        cantidad=transferencia.cantidad,
        bodega_origen_id=transferencia.bodega_origen_id,
        bodega_destino_id=transferencia.bodega_destino_id,
        motivo=MotivoMovimientoEnum.TRANSFERENCIA,
        observaciones=transferencia.observaciones,
        usuario_id=usuario_id,
        stock_anterior=stock_destino.cantidad,
        stock_posterior=stock_destino.cantidad + transferencia.cantidad,
    )

    # Actualizar stocks
    stock_origen.cantidad -= transferencia.cantidad
    stock_destino.cantidad += transferencia.cantidad

    db.add_all([movimiento_salida, movimiento_entrada])
    db.commit()

    actualizar_stock_total_producto(db, transferencia.producto_id)

    db.commit()

    return {
        "movimiento_salida": movimiento_salida,
        "movimiento_entrada": movimiento_entrada,
    }


def get_kardex(
    db: Session,
    producto_id: int,
    fecha_inicio: Optional[datetime] = None,
    fecha_fin: Optional[datetime] = None,
    bodega_id: Optional[int] = None,
):
    """Obtener el kardex (historial de movimientos) de un producto"""
    query = (
        db.query(models.MovimientoInventario)
        .filter(models.MovimientoInventario.producto_id == producto_id)
        .options(
            joinedload(models.MovimientoInventario.producto),
            joinedload(models.MovimientoInventario.usuario),
            joinedload(models.MovimientoInventario.bodega_origen),
            joinedload(models.MovimientoInventario.bodega_destino),
        )
    )

    if fecha_inicio:
        query = query.filter(
            models.MovimientoInventario.fecha_movimiento >= fecha_inicio
        )
    if fecha_fin:
        query = query.filter(models.MovimientoInventario.fecha_movimiento <= fecha_fin)
    if bodega_id:
        query = query.filter(
            (models.MovimientoInventario.bodega_origen_id == bodega_id)
            | (models.MovimientoInventario.bodega_destino_id == bodega_id)
        )

    movimientos = query.order_by(
        models.MovimientoInventario.fecha_movimiento.desc()
    ).all()

    # Obtener producto
    producto = (
        db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    )
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado",
        )

    return {
        "producto": producto,
        "movimientos": movimientos,
        "stock_actual": producto.stock_actual,
    }


def inventario_fisico(db: Session, inventario: InventarioFisicoCreate, usuario_id: int):
    """Realizar un inventario físico y ajustar las diferencias"""
    movimientos_creados = []

    for item in inventario.items:
        # Obtener stock actual en bodega
        stock_bodega = (
            db.query(models.StockBodega)
            .filter(
                and_(
                    models.StockBodega.producto_id == item.producto_id,
                    models.StockBodega.bodega_id == item.bodega_id,
                )
            )
            .first()
        )

        if not stock_bodega:
            # Crear registro de stock si no existe
            stock_bodega = models.StockBodega(
                producto_id=item.producto_id, bodega_id=item.bodega_id, cantidad=0
            )
            db.add(stock_bodega)

        diferencia = item.cantidad_contada - stock_bodega.cantidad

        if diferencia != 0:
            # Crear ajuste por la diferencia
            ajuste = AjusteInventarioCreate(
                producto_id=item.producto_id,
                bodega_id=item.bodega_id,
                cantidad=diferencia,
                motivo=MotivoMovimientoEnum.CONTEO_FISICO,
                observaciones=f"Inventario físico. {inventario.observaciones or ''}",
            )

            movimiento = ajustar_inventario(db, ajuste, usuario_id)
            movimientos_creados.append(movimiento)

    return movimientos_creados


# ==================== FUNCIONES AUXILIARES ====================


def actualizar_stock_total_producto(db: Session, producto_id: int):
    """Actualizar el stock total de un producto sumando todas las bodegas"""
    # Calcular el stock total sumando todas las bodegas
    stock_total = (
        db.query(func.sum(models.StockBodega.cantidad))
        .filter(models.StockBodega.producto_id == producto_id)
        .scalar()
        or 0
    )

    # Actualizar el producto
    producto = (
        db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    )

    if producto:
        producto.stock_actual = stock_total
        producto.fecha_actualizacion = datetime.now(timezone.utc)
        db.flush()  # Usar flush en lugar de commit para que sea parte de la transacción
        print(
            f"✅ Stock actualizado para producto {producto_id}: {stock_total}"
        )  # Debug

    return stock_total
