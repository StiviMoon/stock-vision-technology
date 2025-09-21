# utils/roles.py
from enum import Enum
from typing import List
from fastapi import Depends, HTTPException, status
from models import User, UserRole
from utils.security import get_current_user


class Permission(str, Enum):
    """Permisos del sistema"""
    # Gestión de usuarios
    CREATE_USER = "CREATE_USER"
    READ_USER = "READ_USER"
    UPDATE_USER = "UPDATE_USER"
    DELETE_USER = "DELETE_USER"

    # Gestión de productos
    CREATE_PRODUCT = "CREATE_PRODUCT"
    READ_PRODUCT = "READ_PRODUCT"
    UPDATE_PRODUCT = "UPDATE_PRODUCT"
    DELETE_PRODUCT = "DELETE_PRODUCT"

    # Gestión de inventario
    CREATE_INVENTORY = "CREATE_INVENTORY"
    READ_INVENTORY = "READ_INVENTORY"
    UPDATE_INVENTORY = "UPDATE_INVENTORY"
    DELETE_INVENTORY = "DELETE_INVENTORY"

    # Gestión de proveedores
    CREATE_SUPPLIER = "CREATE_SUPPLIER"
    READ_SUPPLIER = "READ_SUPPLIER"
    UPDATE_SUPPLIER = "UPDATE_SUPPLIER"
    DELETE_SUPPLIER = "DELETE_SUPPLIER"

    # Reportes
    READ_REPORTS = "READ_REPORTS"

    # Chatbot
    USE_CHATBOT = "USE_CHATBOT"


# Definir permisos por rol
ROLE_PERMISSIONS = {
    UserRole.ADMIN: [
        Permission.CREATE_USER,
        Permission.READ_USER,
        Permission.UPDATE_USER,
        Permission.DELETE_USER,
        Permission.CREATE_PRODUCT,
        Permission.READ_PRODUCT,
        Permission.UPDATE_PRODUCT,
        Permission.DELETE_PRODUCT,
        Permission.CREATE_INVENTORY,
        Permission.READ_INVENTORY,
        Permission.UPDATE_INVENTORY,
        Permission.DELETE_INVENTORY,
        Permission.CREATE_SUPPLIER,
        Permission.READ_SUPPLIER,
        Permission.UPDATE_SUPPLIER,
        Permission.DELETE_SUPPLIER,
        Permission.READ_REPORTS,
        Permission.USE_CHATBOT,
    ],
    UserRole.USUARIO: [
        Permission.READ_USER,
        Permission.READ_PRODUCT,
        Permission.CREATE_PRODUCT,
        Permission.UPDATE_PRODUCT,
        Permission.READ_INVENTORY,
        Permission.CREATE_INVENTORY,
        Permission.UPDATE_INVENTORY,
        Permission.READ_SUPPLIER,
        Permission.CREATE_SUPPLIER,
        Permission.UPDATE_SUPPLIER,
        Permission.READ_REPORTS,
        Permission.USE_CHATBOT,
    ],
    UserRole.INVITADO: [
        Permission.READ_PRODUCT,
        Permission.READ_INVENTORY,
        Permission.READ_SUPPLIER,
        Permission.USE_CHATBOT,
    ],
}


def has_permission(user: User, permission: Permission) -> bool:
    """Verificar si un usuario tiene un permiso específico"""
    user_permissions = ROLE_PERMISSIONS.get(user.rol, [])
    return permission in user_permissions


def require_permission(permission: Permission):
    """Decorator para requerir un permiso específico"""
    def permission_checker(current_user: User = Depends(get_current_user)):
        if not has_permission(current_user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tienes permisos para realizar esta acción. Se requiere: {permission.value}"
            )
        return current_user
    return permission_checker


def require_role(required_roles: List[UserRole]):
    """Decorator para requerir uno de los roles especificados"""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.rol not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere uno de los siguientes roles: {', '.join([role.value for role in required_roles])}"
            )
        return current_user
    return role_checker


# Funciones de conveniencia para roles específicos
def require_admin(current_user: User = Depends(get_current_user)):
    """Requerir rol de administrador"""
    if current_user.rol != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol de Administrador para esta operación"
        )
    return current_user


def require_admin_or_self(user_id: int):
    """Requerir rol de administrador o ser el propio usuario"""
    def checker(current_user: User = Depends(get_current_user)):
        if current_user.rol != UserRole.ADMIN and current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para realizar esta acción"
            )
        return current_user
    return checker


def get_user_permissions(user: User) -> List[Permission]:
    """Obtener todos los permisos de un usuario"""
    return ROLE_PERMISSIONS.get(user.rol, [])


def can_manage_users(user: User) -> bool:
    """Verificar si el usuario puede gestionar otros usuarios"""
    return has_permission(user, Permission.UPDATE_USER) and has_permission(user, Permission.DELETE_USER)
