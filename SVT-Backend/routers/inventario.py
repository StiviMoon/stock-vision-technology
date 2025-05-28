from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
from services import inventory_service
from schemas import (
    # Bodegas
    BodegaCreate,
    BodegaUpdate,
    BodegaResponse,
    # Stock
    StockBodegaResponse,
    StockConsolidado,
    AlertaStock,
    # Movimientos
    MovimientoInventarioCreate,
    MovimientoInventarioResponse,
    AjusteInventarioCreate,
    TransferenciaInventarioCreate,
    InventarioFisicoCreate,
    # Reportes
    KardexResponse,
)
from utils.security import get_current_user
from models import User

import models

router = APIRouter(
    prefix="/inventario",
    tags=["inventario"],
    responses={404: {"description": "Not found"}},
)

# ==================== ENDPOINTS DE BODEGA ====================


@router.get("/bodegas", response_model=List[BodegaResponse])
def get_bodegas(
    skip: int = 0,
    limit: int = 100,
    solo_activas: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtener todas las bodegas"""
    return inventory_service.get_bodegas(db, skip, limit, solo_activas)


@router.get("/bodegas/{bodega_id}", response_model=BodegaResponse)
def get_bodega(
    bodega_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtener una bodega por ID"""
    bodega = inventory_service.get_bodega(db, bodega_id)
    if not bodega:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bodega con ID {bodega_id} no encontrada",
        )
    return bodega


@router.post("/bodegas", response_model=BodegaResponse)
def create_bodega(
    bodega: BodegaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Crear una nueva bodega (solo ADMIN)"""
    if current_user.rol != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para crear bodegas",
        )
    return inventory_service.create_bodega(db, bodega)


@router.put("/bodegas/{bodega_id}", response_model=BodegaResponse)
def update_bodega(
    bodega_id: int,
    bodega_update: BodegaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Actualizar una bodega (solo ADMIN)"""
    if current_user.rol != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para actualizar bodegas",
        )
    return inventory_service.update_bodega(db, bodega_id, bodega_update)


# ==================== ENDPOINTS DE STOCK ====================


@router.get("/stock/producto/{producto_id}", response_model=StockConsolidado)
def get_stock_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtener el stock consolidado de un producto"""
    return inventory_service.get_stock_consolidado(db, producto_id)


@router.get("/stock/bodega/{bodega_id}", response_model=List[StockBodegaResponse])
def get_stock_bodega(
    bodega_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtener todo el stock de una bodega"""
    return inventory_service.get_stock_bodega(db, bodega_id)


@router.get("/stock/alertas", response_model=List[AlertaStock])
def get_alertas_stock(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Obtener productos con stock bajo o sin stock"""
    return inventory_service.get_productos_stock_bajo(db)


# ==================== ENDPOINTS DE MOVIMIENTOS ====================


@router.post("/movimientos", response_model=MovimientoInventarioResponse)
def create_movimiento(
    movimiento: MovimientoInventarioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Crear un movimiento de inventario genérico"""
    return inventory_service.create_movimiento(db, movimiento, current_user.id)


@router.post("/ajuste", response_model=MovimientoInventarioResponse)
def ajustar_inventario(
    ajuste: AjusteInventarioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Realizar un ajuste de inventario"""
    return inventory_service.ajustar_inventario(db, ajuste, current_user.id)


@router.post("/transferencia")
def transferir_entre_bodegas(
    transferencia: TransferenciaInventarioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Realizar una transferencia entre bodegas"""
    return inventory_service.transferir_entre_bodegas(
        db, transferencia, current_user.id
    )


@router.post("/inventario-fisico", response_model=List[MovimientoInventarioResponse])
def realizar_inventario_fisico(
    inventario: InventarioFisicoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Realizar un inventario físico y ajustar diferencias"""
    if current_user.rol not in ["ADMIN", "SUPERVISOR"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para realizar inventario físico",
        )
    return inventory_service.inventario_fisico(db, inventario, current_user.id)


# ==================== ENDPOINTS DE REPORTES ====================


@router.get("/kardex/{producto_id}", response_model=KardexResponse)
def get_kardex(
    producto_id: int,
    fecha_inicio: Optional[datetime] = Query(None),
    fecha_fin: Optional[datetime] = Query(None),
    bodega_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtener el kardex (historial de movimientos) de un producto"""
    return inventory_service.get_kardex(
        db, producto_id, fecha_inicio, fecha_fin, bodega_id
    )


@router.get("/movimientos", response_model=List[MovimientoInventarioResponse])
def get_movimientos(
    skip: int = 0,
    limit: int = 100,
    producto_id: Optional[int] = Query(None),
    bodega_id: Optional[int] = Query(None),
    tipo_movimiento: Optional[str] = Query(None),
    fecha_inicio: Optional[datetime] = Query(None),
    fecha_fin: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtener movimientos de inventario con filtros"""
    query = db.query(models.MovimientoInventario)

    if producto_id:
        query = query.filter(models.MovimientoInventario.producto_id == producto_id)
    if bodega_id:
        query = query.filter(
            (models.MovimientoInventario.bodega_origen_id == bodega_id)
            | (models.MovimientoInventario.bodega_destino_id == bodega_id)
        )
    if tipo_movimiento:
        query = query.filter(
            models.MovimientoInventario.tipo_movimiento == tipo_movimiento
        )
    if fecha_inicio:
        query = query.filter(
            models.MovimientoInventario.fecha_movimiento >= fecha_inicio
        )
    if fecha_fin:
        query = query.filter(models.MovimientoInventario.fecha_movimiento <= fecha_fin)

    return (
        query.order_by(models.MovimientoInventario.fecha_movimiento.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
