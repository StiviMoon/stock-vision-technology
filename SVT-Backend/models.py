#Models.py

from sqlalchemy import Column, Integer, String
from database import Base
from pydantic import BaseModel

class User(Base):
    __tablename__ = "usuarios"  # Coincide con tu tabla existente

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    rol = Column(String, default="ADMIN")  # Coincide con tu tabla



# Modelo para actualizar roles
class RoleUpdateRequest(BaseModel):
    new_role: str
