from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session

import models
import schemas
import database
from services import categoria_service
from utils.security import get_current_user
from utils.role_verification import verify_admin_or_usuario

router = APIRouter()


@router.post(
    "/", response_model=schemas.CategoriaResponse, status_code=status.HTTP_201_CREATED
)
def crear_categoria(
    categoria: schemas.CategoriaCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(verify_admin_or_usuario),
):
    """Permite al Jefe de Bodega registrar una nueva categoría"""
    # Verificar si ya existe una categoría con el mismo código
    db_categoria = categoria_service.get_categoria_by_codigo(
        db, codigo=categoria.codigo
    )
    if db_categoria:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe una categoría con el código {categoria.codigo}",
        )

    # Verificar si ya existe una categoría con el mismo nombre
    db_categoria_nombre = categoria_service.get_categoria_by_nombre(
        db, nombre=categoria.nombre
    )
    if db_categoria_nombre:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe una categoría con el nombre {categoria.nombre}",
        )

    return categoria_service.create_categoria(db=db, categoria=categoria)


@router.get("/", response_model=List[schemas.CategoriaResponse])
def listar_categorias(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
):
    """Permite al Jefe de Bodega consultar las categorías registradas"""
    categorias = categoria_service.get_categorias(
        db, skip=skip, limit=limit, search=search
    )
    return categorias


@router.get("/activas", response_model=List[schemas.CategoriaResponse])
def listar_categorias_activas(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Obtener solo las categorías activas (útil para formularios de productos)"""
    categorias = categoria_service.get_categorias_activas(db)
    return categorias


@router.get("/{categoria_id}", response_model=schemas.CategoriaResponse)
def obtener_categoria(
    categoria_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(verify_admin_or_usuario),
):
    """Permite al Jefe de Bodega consultar la información de una categoría específica"""
    db_categoria = categoria_service.get_categoria(db, categoria_id=categoria_id)
    if db_categoria is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Categoría con ID {categoria_id} no encontrada",
        )
    return db_categoria


@router.put(
    "/{categoria_id}",
    response_model=schemas.CategoriaResponse,
    status_code=status.HTTP_200_OK,
)
def editar_categoria(
    categoria_id: int,
    categoria: schemas.CategoriaCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(verify_admin_or_usuario),
):
    """Permite al Jefe de Bodega editar la información de una categoría"""
    # Verificar si la categoría existe
    db_categoria_existente = categoria_service.get_categoria(db, categoria_id=categoria_id)
    if db_categoria_existente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Categoría con ID {categoria_id} no encontrada",
        )

    # Verificar si ya existe otra categoría con el mismo código
    db_categoria_codigo = categoria_service.get_categoria_by_codigo(
        db, codigo=categoria.codigo
    )
    if db_categoria_codigo and db_categoria_codigo.id != categoria_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe otra categoría con el código {categoria.codigo}",
        )

    # Verificar si ya existe otra categoría con el mismo nombre
    db_categoria_nombre = categoria_service.get_categoria_by_nombre(
        db, nombre=categoria.nombre
    )
    if db_categoria_nombre and db_categoria_nombre.id != categoria_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe otra categoría con el nombre {categoria.nombre}",
        )

    db_categoria = categoria_service.update_categoria(
        db, categoria_id=categoria_id, categoria=categoria
    )
    return db_categoria


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(
    categoria_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(verify_admin_or_usuario),
):
    """Permite al Jefe de Bodega eliminar una categoría"""
    # Verificar si la categoría existe
    db_categoria = categoria_service.get_categoria(db, categoria_id=categoria_id)
    if db_categoria is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Categoría con ID {categoria_id} no encontrada",
        )

    # Verificar si la categoría tiene productos asociados
    productos_count = categoria_service.count_productos_por_categoria(db, categoria_id)
    if productos_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede eliminar la categoría porque tiene {productos_count} producto(s) asociado(s). Primero mueva o elimine los productos.",
        )

    success = categoria_service.delete_categoria(db, categoria_id=categoria_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al eliminar la categoría",
        )


@router.get("/{categoria_id}/productos/count")
def contar_productos_categoria(
    categoria_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Contar cuántos productos tiene una categoría"""
    db_categoria = categoria_service.get_categoria(db, categoria_id=categoria_id)
    if db_categoria is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Categoría con ID {categoria_id} no encontrada",
        )

    count = categoria_service.count_productos_por_categoria(db, categoria_id)
    return {"categoria_id": categoria_id, "productos_count": count}
