# utils/role_verification.py
from fastapi import Depends, HTTPException, status
from typing import List
import models
from models import UserRole
from utils.security import get_current_user


def verify_admin(current_user: models.User = Depends(get_current_user)):
    """Verificar que el usuario tenga rol de administrador"""
    if current_user.rol != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol de Administrador para esta operación",
        )
    return current_user


def verify_admin_or_usuario(current_user: models.User = Depends(get_current_user)):
    """Verificar que el usuario tenga rol de administrador o usuario"""
    if current_user.rol not in [UserRole.ADMIN, UserRole.USUARIO]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol de Administrador o Usuario para esta operación",
        )
    return current_user


def verify_any_role(required_roles: List[UserRole]):
    """Verificar que el usuario tenga uno de los roles especificados"""
    def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.rol not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere uno de los siguientes roles: {', '.join([role.value for role in required_roles])}",
            )
        return current_user
    return role_checker


def verify_not_invitado(current_user: models.User = Depends(get_current_user)):
    """Verificar que el usuario NO sea invitado"""
    if current_user.rol == UserRole.INVITADO:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Los usuarios invitados no pueden realizar esta operación",
        )
    return current_user
