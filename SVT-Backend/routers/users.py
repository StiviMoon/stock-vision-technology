# routers/users.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

import models
import schemas
import database
from services.user_service import UserService
from utils.roles import require_permission, require_admin, Permission
from utils.security import get_current_user

router = APIRouter()


# Obtener usuario actual autenticado
@router.get("/me", response_model=schemas.UserResponse)
def get_user_me(current_user: models.User = Depends(get_current_user)):
    """Obtener información del usuario autenticado"""
    return current_user


# Obtener todos los usuarios (solo para administradores)
@router.get("/", response_model=List[schemas.UserListResponse])
def get_users(
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros a retornar"),
    active_only: bool = Query(True, description="Mostrar solo usuarios activos"),
    search: Optional[str] = Query(None, description="Buscar por nombre, apellido o email"),
    role: Optional[schemas.UserRoleEnum] = Query(None, description="Filtrar por rol"),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(require_permission(Permission.READ_USER)),
):
    """Obtener lista de usuarios con filtros y paginación"""
    user_service = UserService(db)

    if search:
        users = user_service.search_users(search, skip, limit)
    elif role:
        users = user_service.get_users_by_role(role, skip, limit)
    elif active_only:
        users = user_service.get_active_users(skip, limit)
    else:
        users = user_service.get_all_users(skip, limit)

    return users


# Obtener un usuario por ID
@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Obtener un usuario específico por ID"""
    # Verificar permisos: admin o el propio usuario
    if current_user.rol != models.UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para ver este usuario"
        )

    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return user


# Crear nuevo usuario (solo para administradores)
@router.post("/", response_model=schemas.UserResponse)
def create_user(
    user_data: schemas.UserCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(require_permission(Permission.CREATE_USER)),
):
    """Crear un nuevo usuario"""
    user_service = UserService(db)
    return user_service.create_user(user_data)


# Endpoint de prueba temporal (sin autenticación)
@router.post("/test", response_model=schemas.UserResponse)
def create_user_test(
    user_data: schemas.UserCreate,
    db: Session = Depends(database.get_db),
):
    """Crear un nuevo usuario (endpoint de prueba sin autenticación)"""
    user_service = UserService(db)
    return user_service.create_user(user_data)


# Actualizar usuario
@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    user_data: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Actualizar información de un usuario"""
    # Verificar permisos: admin o el propio usuario
    if current_user.rol != models.UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para actualizar este usuario"
        )

    user_service = UserService(db)
    updated_user = user_service.update_user(user_id, user_data)

    if not updated_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return updated_user


# Actualizar rol de usuario (solo para administradores)
@router.put("/{user_id}/role", response_model=dict)
def update_user_role(
    user_id: int,
    role_data: schemas.RoleUpdateRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(require_permission(Permission.UPDATE_USER)),
):
    """Actualizar el rol de un usuario"""
    user_service = UserService(db)
    updated_user = user_service.update_user_role(user_id, role_data.new_role)

    if not updated_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {
        "message": f"Rol de '{updated_user.email}' actualizado a '{updated_user.rol.value}'",
        "user_id": updated_user.id,
        "new_role": updated_user.rol.value
    }


# Desactivar usuario (soft delete)
@router.patch("/{user_id}/deactivate", response_model=dict)
def deactivate_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(require_permission(Permission.DELETE_USER)),
):
    """Desactivar un usuario (soft delete)"""
    # No permitir que el usuario se desactive a sí mismo
    if current_user.id == user_id:
        raise HTTPException(
            status_code=400,
            detail="No puedes desactivar tu propia cuenta"
        )

    user_service = UserService(db)
    success = user_service.deactivate_user(user_id)

    if not success:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {"message": "Usuario desactivado correctamente"}


# Activar usuario
@router.patch("/{user_id}/activate", response_model=dict)
def activate_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(require_permission(Permission.UPDATE_USER)),
):
    """Activar un usuario"""
    user_service = UserService(db)
    success = user_service.activate_user(user_id)

    if not success:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {"message": "Usuario activado correctamente"}


# Eliminar usuario permanentemente (solo para administradores)
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(require_permission(Permission.DELETE_USER)),
):
    """Eliminar un usuario permanentemente"""
    # No permitir que el administrador se elimine a sí mismo
    if current_user.id == user_id:
        raise HTTPException(
            status_code=400,
            detail="No puedes eliminarte a ti mismo"
        )

    user_service = UserService(db)
    success = user_service.delete_user(user_id)

    if not success:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {"message": "Usuario eliminado correctamente"}


# Obtener estadísticas de usuarios (solo para administradores)
@router.get("/stats/overview", response_model=dict)
def get_user_stats(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(require_admin),
):
    """Obtener estadísticas generales de usuarios"""
    user_service = UserService(db)
    return user_service.get_user_stats()
