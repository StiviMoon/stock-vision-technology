from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from database import Base
from pydantic import BaseModel
from datetime import datetime


class User(Base):
    __tablename__ = "usuarios"  # Coincide con tu tabla existente

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    rol = Column(String, default="ADMIN")  # Coincide con tu tabla


# Modelo para actualizar roles
class RoleUpdateRequest(BaseModel):
    new_role: str


# Modelo para Proveedor
class Proveedor(Base):
    __tablename__ = "proveedores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), index=True)
    codigo = Column(String(50), unique=True, index=True)
    contacto = Column(String(100))
    telefono = Column(String(20))
    email = Column(String(100))
    direccion = Column(Text)

    # Relación con productos
    productos = relationship("Producto", back_populates="proveedor")


# Modelo para Producto
class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True)
    nombre = Column(String(100), index=True)
    descripcion = Column(Text)
    categoria = Column(String(50), index=True)
    precio_unitario = Column(Float)
    proveedor_id = Column(Integer, ForeignKey("proveedores.id"))
    stock_actual = Column(Integer, default=0)
    stock_minimo = Column(Integer, default=0)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relación con proveedor
    proveedor = relationship("Proveedor", back_populates="productos")
