from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from fastapi import HTTPException, status
import models
from schemas import ProductoCreate, ProductoUpdate


def get_producto(db: Session, producto_id: int):
    """Obtener un producto por su ID con los datos del proveedor"""
    return (
        db.query(models.Producto)
        .filter(models.Producto.id == producto_id)
        .options(joinedload(models.Producto.proveedor))
        .first()
    )


def get_producto_by_sku(db: Session, sku: str):
    """Obtener un producto por su SKU"""
    return db.query(models.Producto).filter(models.Producto.sku == sku).first()


def get_productos(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    sku: str = None,
    nombre: str = None,
    categoria: str = None,
    proveedor_id: int = None,
):
    """Obtener productos con filtros opcionales"""
    query = db.query(models.Producto).options(joinedload(models.Producto.proveedor))

    # Aplicar filtros si se proporcionan
    if sku:
        query = query.filter(models.Producto.sku.ilike(f"%{sku}%"))
    if nombre:
        query = query.filter(models.Producto.nombre.ilike(f"%{nombre}%"))
    if categoria:
        query = query.filter(models.Producto.categoria.ilike(f"%{categoria}%"))
    if proveedor_id:
        query = query.filter(models.Producto.proveedor_id == proveedor_id)

    return query.order_by(models.Producto.nombre).offset(skip).limit(limit).all()


def create_producto(db: Session, producto: ProductoCreate):
    """Crear un nuevo producto"""
    # Verificar si el proveedor existe
    proveedor = (
        db.query(models.Proveedor)
        .filter(models.Proveedor.id == producto.proveedor_id)
        .first()
    )
    if not proveedor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proveedor con ID {producto.proveedor_id} no encontrado",
        )

    # Crear el producto con el stock inicial como stock actual
    db_producto = models.Producto(
        sku=producto.sku,
        nombre=producto.nombre,
        descripcion=producto.descripcion,
        categoria=producto.categoria,
        precio_unitario=producto.precio_unitario,
        proveedor_id=producto.proveedor_id,
        stock_actual=producto.stock_inicial,
        stock_minimo=producto.stock_minimo,
    )
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto


def update_producto(db: Session, producto_id: int, producto_update: ProductoUpdate):
    """Actualizar un producto existente"""
    db_producto = (
        db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    )
    if not db_producto:
        return None

    # Si se actualiza el proveedor, verificar que exista
    if producto_update.proveedor_id is not None:
        proveedor = (
            db.query(models.Proveedor)
            .filter(models.Proveedor.id == producto_update.proveedor_id)
            .first()
        )
        if not proveedor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Proveedor con ID {producto_update.proveedor_id} no encontrado",
            )

    # Actualizar solo los campos que vienen en la solicitud
    update_data = producto_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:  # Actualizamos solo campos no nulos
            setattr(db_producto, key, value)

    db.commit()
    db.refresh(db_producto)
    return db_producto


def delete_producto(db: Session, producto_id: int):
    """Eliminar un producto por su ID"""
    db_producto = (
        db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    )
    if not db_producto:
        return False

    db.delete(db_producto)
    db.commit()
    return True
