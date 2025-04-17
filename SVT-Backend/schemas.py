from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# Esquemas de Usuario
class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    rol: str

    class Config:
        from_attributes = True


class RoleUpdateRequest(BaseModel):
    new_role: str


# Esquemas de Proveedor
class ProveedorBase(BaseModel):
    nombre: str
    codigo: str
    contacto: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None


class ProveedorCreate(ProveedorBase):
    pass


class ProveedorResponse(ProveedorBase):
    id: int

    class Config:
        from_attributes = True


# Esquemas de Producto
class ProductoBase(BaseModel):
    sku: str
    nombre: str
    descripcion: str
    categoria: str
    precio_unitario: float = Field(gt=0)
    proveedor_id: int
    stock_minimo: int = Field(ge=0)


class ProductoCreate(ProductoBase):
    stock_inicial: int = Field(ge=0)


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    precio_unitario: Optional[float] = Field(None, gt=0)
    proveedor_id: Optional[int] = None
    stock_actual: Optional[int] = Field(None, ge=0)
    stock_minimo: Optional[int] = Field(None, ge=0)


class ProductoResponse(ProductoBase):
    id: int
    stock_actual: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime

    class Config:
        from_attributes = True


class ProductoDetailResponse(ProductoResponse):
    proveedor: Optional[ProveedorResponse] = None

    class Config:
        from_attributes = True
