from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session

import models
import schemas
import database
from services import proveedor_service
from utils.security import get_current_user
from utils.role_verification import verify_admin_or_usuario

router = APIRouter()


@router.post(
    "/", response_model=schemas.ProveedorResponse, status_code=status.HTTP_201_CREATED
)
def crear_proveedor(
    proveedor: schemas.ProveedorCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(verify_admin_or_usuario),
):
    """Permite al Jefe de Bodega registrar un nuevo proveedor"""
    # Verificar si ya existe un proveedor con el mismo código
    db_proveedor = proveedor_service.get_proveedor_by_codigo(
        db, codigo=proveedor.codigo
    )
    if db_proveedor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un proveedor con el código {proveedor.codigo}",
        )
    return proveedor_service.create_proveedor(db=db, proveedor=proveedor)


@router.get("/", response_model=List[schemas.ProveedorResponse])
def listar_proveedores(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
):
    """Permite al Jefe de Bodega consultar los proveedores registrados"""
    proveedores = proveedor_service.get_proveedores(
        db, skip=skip, limit=limit, search=search
    )
    return proveedores


@router.get("/{proveedor_id}", response_model=schemas.ProveedorResponse)
def obtener_proveedor(
    proveedor_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(verify_admin_or_usuario),
):
    """Permite al Jefe de Bodega consultar la información de un proveedor específico"""
    db_proveedor = proveedor_service.get_proveedor(db, proveedor_id=proveedor_id)
    if db_proveedor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proveedor con ID {proveedor_id} no encontrado",
        )
    return db_proveedor


@router.put(
    "/{proveedor_id}",
    response_model=schemas.ProveedorResponse,
    status_code=status.HTTP_200_OK,
)
def editar_proveedor(
    proveedor_id: int,
    proveedor: schemas.ProveedorCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(verify_admin_or_usuario),
):
    """Permite al Jefe de Bodega editar la información de un proveedor"""
    db_proveedor = proveedor_service.update_proveedor(
        db, proveedor_id=proveedor_id, proveedor=proveedor
    )
    if db_proveedor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proveedor con ID {proveedor_id} no encontrado",
        )
    return db_proveedor


@router.delete("/{proveedor_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_provedor(
    proveedor_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(verify_admin_or_usuario),
):
    """Permite al Jefe de Bodega eliminar un proveedor"""
    db_proveedor = proveedor_service.delete_proveedor(db, proveedor_id=proveedor_id)
    if db_proveedor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proveedor con ID {proveedor_id} no encontrado",
        )
