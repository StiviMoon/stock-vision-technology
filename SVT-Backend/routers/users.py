# routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas, database
from utils.security import get_current_user

router = APIRouter()


# Obtener usuario actual autenticado
@router.get("/me", response_model=schemas.UserResponse)
def get_user_me(current_user: models.User = Depends(get_current_user)):
    return current_user


# Obtener todos los usuarios (solo para administradores)
@router.get("/", response_model=List[schemas.UserResponse])
def get_users(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Verificar si el usuario actual es administrador
    if current_user.rol != "ADMIN":
        raise HTTPException(
            status_code=403, detail="No tienes permisos para ver todos los usuarios"
        )

    users = db.query(models.User).all()
    return users


# Obtener un usuario por ID
@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Verificar si el usuario actual es administrador o está accediendo a su propio perfil
    if current_user.rol != "ADMIN" and current_user.id != user_id:
        raise HTTPException(
            status_code=403, detail="No tienes permisos para ver este usuario"
        )

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return user


from schemas import RoleUpdateRequest  # Asegúrate de importar esto


@router.put("/{user_id}/role")
def update_user_role(
    user_id: int,
    role_data: RoleUpdateRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Solo administradores pueden actualizar roles
    if current_user.rol != "ADMIN":
        raise HTTPException(
            status_code=403, detail="No tienes permisos para cambiar roles"
        )

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.rol = role_data.new_role
    db.commit()
    db.refresh(user)

    return {
        "message": f"Rol de '{user.email}' ha sido actualizado correctamente a '{user.rol}'",
        "user_id": user.id,
    }


# Eliminar usuario (solo para administradores)
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Verificar si el usuario actual es administrador
    if current_user.rol != "ADMIN":
        raise HTTPException(
            status_code=403, detail="No tienes permisos para eliminar usuarios"
        )

    # No permitir que el administrador se elimine a sí mismo
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db.delete(user)
    db.commit()

    return {"message": "Usuario eliminado correctamente"}
