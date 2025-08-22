from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session

import models
import schemas
import database
from services import producto_service
from utils.security import get_current_user
from utils.role_verification import verify_jefe_bodega_or_admin

router = APIRouter()


@router.post(
    "/",
    response_model=schemas.ProductoDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
def crear_producto(
    producto: schemas.ProductoCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(verify_jefe_bodega_or_admin),
):
    """
    RF1.1: Permite al Jefe de Bodega registrar un nuevo producto con todos sus detalles.
    """
    # Verificar si ya existe un producto con el mismo SKU
    db_producto = producto_service.get_producto_by_sku(db, sku=producto.sku)
    if db_producto:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un producto con el SKU {producto.sku}",
        )
    return producto_service.create_producto(db=db, producto=producto)


@router.get("/", response_model=List[schemas.ProductoListResponse])
def listar_productos(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    sku: Optional[str] = None,
    nombre: Optional[str] = None,
    categoria: Optional[str] = None,
    proveedor_id: Optional[int] = None,
):
    productos = producto_service.get_productos(
        db,
        skip=skip,
        limit=limit,
        sku=sku,
        nombre=nombre,
        categoria=categoria,
        proveedor_id=proveedor_id,
    )
    return productos


@router.get("/{producto_id}", response_model=schemas.ProductoDetailResponse)
def obtener_producto(
    producto_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),  # Cambiado aquí
):
    db_producto = producto_service.get_producto(db, producto_id=producto_id)
    if db_producto is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado",
        )
    return db_producto


@router.put("/{producto_id}", response_model=schemas.ProductoDetailResponse)
def actualizar_producto(
    producto_id: int,
    producto: schemas.ProductoUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(verify_jefe_bodega_or_admin),
):
    """
    RF1.3: Permite al Jefe de Bodega actualizar la información de un producto.
    """
    db_producto = producto_service.update_producto(
        db, producto_id=producto_id, producto_update=producto
    )
    if db_producto is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado",
        )
    return db_producto


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(verify_jefe_bodega_or_admin),
):
    """
    RF1.4: Permite al Jefe de Bodega eliminar un producto.
    """
    result = producto_service.delete_producto(db, producto_id=producto_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado",
        )
    return None
