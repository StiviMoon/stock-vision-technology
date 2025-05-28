from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from typing import List, Optional
from enum import Enum


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
    bodega_id: int


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


# Enums para los esquemas
class TipoMovimientoEnum(str, Enum):
    ENTRADA = "ENTRADA"
    SALIDA = "SALIDA"
    AJUSTE_POSITIVO = "AJUSTE_POSITIVO"
    AJUSTE_NEGATIVO = "AJUSTE_NEGATIVO"
    TRANSFERENCIA_ENTRADA = "TRANSFERENCIA_ENTRADA"
    TRANSFERENCIA_SALIDA = "TRANSFERENCIA_SALIDA"
    INVENTARIO_INICIAL = "INVENTARIO_INICIAL"
    INVENTARIO_FISICO = "INVENTARIO_FISICO"


class MotivoMovimientoEnum(str, Enum):
    COMPRA = "COMPRA"
    VENTA = "VENTA"
    DEVOLUCION_CLIENTE = "DEVOLUCION_CLIENTE"
    DEVOLUCION_PROVEEDOR = "DEVOLUCION_PROVEEDOR"
    AJUSTE_STOCK = "AJUSTE_STOCK"
    CONTEO_FISICO = "CONTEO_FISICO"
    PRODUCTO_DANADO = "PRODUCTO_DANADO"
    PRODUCTO_VENCIDO = "PRODUCTO_VENCIDO"
    ERROR_SISTEMA = "ERROR_SISTEMA"
    ROBO_PERDIDA = "ROBO_PERDIDA"
    TRANSFERENCIA = "TRANSFERENCIA"
    OTRO = "OTRO"


# Esquemas de Bodega
class BodegaBase(BaseModel):
    nombre: str
    codigo: str
    direccion: Optional[str] = None
    encargado: Optional[str] = None
    telefono: Optional[str] = None
    activa: bool = True


class BodegaCreate(BodegaBase):
    pass


class BodegaUpdate(BaseModel):
    nombre: Optional[str] = None
    direccion: Optional[str] = None
    encargado: Optional[str] = None
    telefono: Optional[str] = None
    activa: Optional[bool] = None


class BodegaResponse(BodegaBase):
    id: int
    fecha_creacion: datetime

    class Config:
        from_attributes = True


# Esquemas de Stock por Bodega
class StockBodegaBase(BaseModel):
    producto_id: int
    bodega_id: int
    cantidad: int = 0
    ubicacion: Optional[str] = None


class StockBodegaCreate(StockBodegaBase):
    pass


class StockBodegaUpdate(BaseModel):
    cantidad: Optional[int] = None
    ubicacion: Optional[str] = None


class StockBodegaResponse(StockBodegaBase):
    id: int
    producto: ProductoResponse
    bodega: BodegaResponse

    class Config:
        from_attributes = True


# Esquemas de Movimiento de Inventario
class MovimientoInventarioBase(BaseModel):
    producto_id: int
    tipo_movimiento: TipoMovimientoEnum
    cantidad: int = Field(gt=0)
    motivo: MotivoMovimientoEnum
    observaciones: Optional[str] = None
    documento_referencia: Optional[str] = None


class MovimientoInventarioCreate(MovimientoInventarioBase):
    bodega_origen_id: Optional[int] = None
    bodega_destino_id: Optional[int] = None


class AjusteInventarioCreate(BaseModel):
    producto_id: int
    bodega_id: int
    cantidad: int  # Puede ser positivo o negativo
    motivo: MotivoMovimientoEnum
    observaciones: Optional[str] = None


class TransferenciaInventarioCreate(BaseModel):
    producto_id: int
    bodega_origen_id: int
    bodega_destino_id: int
    cantidad: int = Field(gt=0)
    observaciones: Optional[str] = None


class InventarioFisicoItem(BaseModel):
    producto_id: int
    bodega_id: int
    cantidad_contada: int


class InventarioFisicoCreate(BaseModel):
    items: List[InventarioFisicoItem]
    observaciones: Optional[str] = None


class MovimientoInventarioResponse(MovimientoInventarioBase):
    id: int
    usuario_id: int
    fecha_movimiento: datetime
    stock_anterior: int
    stock_posterior: int
    bodega_origen_id: Optional[int] = None
    bodega_destino_id: Optional[int] = None
    producto: ProductoResponse
    usuario: UserResponse
    bodega_origen: Optional[BodegaResponse] = None
    bodega_destino: Optional[BodegaResponse] = None

    class Config:
        from_attributes = True


# Esquemas para reportes y consultas
class StockConsolidado(BaseModel):
    producto: ProductoResponse
    stock_total: int
    stock_por_bodega: List[StockBodegaResponse]
    estado: str  # "NORMAL", "STOCK_BAJO", "SIN_STOCK"


class KardexResponse(BaseModel):
    producto: ProductoResponse
    movimientos: List[MovimientoInventarioResponse]
    stock_actual: int


class AlertaStock(BaseModel):
    producto: ProductoResponse
    stock_actual: int
    stock_minimo: int
    porcentaje_alerta: float
    bodega: Optional[BodegaResponse] = None


class StockBodegaResponse(StockBodegaBase):
    id: int
    producto: ProductoResponse
    bodega: BodegaResponse

    class Config:
        from_attributes = True


class ProductoConStocksResponse(ProductoResponse):
    proveedor: Optional[ProveedorResponse] = None
    stocks_bodega: List[StockBodegaResponse] = []

    class Config:
        from_attributes = True


class ProductoConStocksResponse(ProductoResponse):
    proveedor: Optional[ProveedorResponse] = None
    stocks_bodega: List[StockBodegaResponse] = []

    class Config:
        from_attributes = True
