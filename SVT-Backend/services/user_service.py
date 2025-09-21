# services/user_service.py
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from fastapi import HTTPException, status

import models
import schemas
from utils.security import pwd_context


class UserService:
    """Servicio para la gestión de usuarios"""

    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_data: schemas.UserCreate) -> models.User:
        """Crear un nuevo usuario"""
        try:
            # Verificar si el email ya existe
            existing_user = self.db.query(models.User).filter(
                models.User.email == user_data.email
            ).first()

            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El email ya está registrado"
                )

            # Crear el usuario
            hashed_password = pwd_context.hash(user_data.password)
            db_user = models.User(
                email=user_data.email,
                hashed_password=hashed_password,
                nombre=user_data.nombre,
                apellido=user_data.apellido,
                rol=user_data.rol
            )

            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)

            return db_user

        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error de integridad en la base de datos"
            )

    def get_user_by_id(self, user_id: int) -> Optional[models.User]:
        """Obtener usuario por ID"""
        return self.db.query(models.User).filter(models.User.id == user_id).first()

    def get_user_by_email(self, email: str) -> Optional[models.User]:
        """Obtener usuario por email"""
        return self.db.query(models.User).filter(models.User.email == email).first()

    def get_all_users(self, skip: int = 0, limit: int = 100) -> List[models.User]:
        """Obtener todos los usuarios con paginación"""
        return self.db.query(models.User).offset(skip).limit(limit).all()

    def get_active_users(self, skip: int = 0, limit: int = 100) -> List[models.User]:
        """Obtener solo usuarios activos"""
        return (
            self.db.query(models.User)
            .filter(models.User.activo)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_user(self, user_id: int, user_data: schemas.UserUpdate) -> Optional[models.User]:
        """Actualizar usuario"""
        db_user = self.get_user_by_id(user_id)

        if not db_user:
            return None

        # Actualizar solo los campos proporcionados
        update_data = user_data.dict(exclude_unset=True)

        for field, value in update_data.items():
            setattr(db_user, field, value)

        self.db.commit()
        self.db.refresh(db_user)

        return db_user

    def update_user_role(self, user_id: int, new_role: schemas.UserRoleEnum) -> Optional[models.User]:
        """Actualizar solo el rol de un usuario"""
        db_user = self.get_user_by_id(user_id)

        if not db_user:
            return None

        db_user.rol = new_role
        self.db.commit()
        self.db.refresh(db_user)

        return db_user

    def deactivate_user(self, user_id: int) -> bool:
        """Desactivar usuario (soft delete)"""
        db_user = self.get_user_by_id(user_id)

        if not db_user:
            return False

        db_user.activo = False
        self.db.commit()

        return True

    def activate_user(self, user_id: int) -> bool:
        """Activar usuario"""
        db_user = self.get_user_by_id(user_id)

        if not db_user:
            return False

        db_user.activo = True
        self.db.commit()

        return True

    def delete_user(self, user_id: int) -> bool:
        """Eliminar usuario permanentemente"""
        db_user = self.get_user_by_id(user_id)

        if not db_user:
            return False

        self.db.delete(db_user)
        self.db.commit()

        return True

    def change_password(self, user_id: int, new_password: str) -> bool:
        """Cambiar contraseña de usuario"""
        db_user = self.get_user_by_id(user_id)

        if not db_user:
            return False

        db_user.hashed_password = pwd_context.hash(new_password)
        self.db.commit()

        return True

    def search_users(self, query: str, skip: int = 0, limit: int = 100) -> List[models.User]:
        """Buscar usuarios por nombre, apellido o email"""
        search_filter = f"%{query}%"

        return (
            self.db.query(models.User)
            .filter(
                (models.User.nombre.ilike(search_filter)) |
                (models.User.apellido.ilike(search_filter)) |
                (models.User.email.ilike(search_filter))
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_users_by_role(self, role: schemas.UserRoleEnum, skip: int = 0, limit: int = 100) -> List[models.User]:
        """Obtener usuarios por rol"""
        return (
            self.db.query(models.User)
            .filter(models.User.rol == role)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_user_stats(self) -> dict:
        """Obtener estadísticas de usuarios"""
        total_users = self.db.query(models.User).count()
        active_users = self.db.query(models.User).filter(models.User.activo).count()
        admin_users = self.db.query(models.User).filter(models.User.rol == models.UserRole.ADMIN).count()
        regular_users = self.db.query(models.User).filter(models.User.rol == models.UserRole.USUARIO).count()
        guest_users = self.db.query(models.User).filter(models.User.rol == models.UserRole.INVITADO).count()

        return {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": total_users - active_users,
            "admin_users": admin_users,
            "regular_users": regular_users,
            "guest_users": guest_users
        }
