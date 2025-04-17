# utils/role_verification.py
from fastapi import Depends, HTTPException, status
import models
from utils.security import get_current_user


def verify_jefe_bodega_or_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.rol not in ["JEFE_BODEGA", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol de Jefe de Bodega o Administrador para esta operación",
        )
    return current_user


def verify_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.rol != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol de Administrador para esta operación",
        )
    return current_user
