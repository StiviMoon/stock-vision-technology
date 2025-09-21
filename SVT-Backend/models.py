from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime,
    Text,
    Boolean,
    Enum,
    Index,
)
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone
import enum


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    USUARIO = "USUARIO"
    INVITADO = "INVITADO"


class User(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    rol = Column(Enum(UserRole), default=UserRole.ADMIN)
    nombre = Column(String(100), nullable=True)
    apellido = Column(String(100), nullable=True)
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    fecha_actualizacion = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, index=True)
    codigo = Column(String(50), unique=True, index=True)
    descripcion = Column(Text, nullable=True)
    activa = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    fecha_actualizacion = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relación con productos
    productos = relationship("Producto", back_populates="categoria_rel")


class Proveedor(Base):
    __tablename__ = "proveedores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), index=True)
    codigo = Column(String(50), unique=True, index=True)
    contacto = Column(String(100))
    telefono = Column(String(20))
    email = Column(String(100))
    direccion = Column(Text)

    productos = relationship("Producto", back_populates="proveedor")


class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True)
    nombre = Column(String(100), index=True)
    descripcion = Column(Text)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=True)
    categoria_nombre = Column(String(50), nullable=True, index=True)  # Mantener para compatibilidad
    precio_unitario = Column(Float)
    proveedor_id = Column(Integer, ForeignKey("proveedores.id"))
    stock_actual = Column(Integer, default=0)
    stock_minimo = Column(Integer, default=0)
    fecha_creacion = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    fecha_actualizacion = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    proveedor = relationship("Proveedor", back_populates="productos")
    categoria_rel = relationship("Categoria", back_populates="productos")
    movimientos = relationship("MovimientoInventario", back_populates="producto")
    stocks_bodega = relationship("StockBodega", back_populates="producto")


class TipoMovimiento(str, enum.Enum):
    ENTRADA = "ENTRADA"
    SALIDA = "SALIDA"
    AJUSTE_POSITIVO = "AJUSTE_POSITIVO"
    AJUSTE_NEGATIVO = "AJUSTE_NEGATIVO"
    TRANSFERENCIA_ENTRADA = "TRANSFERENCIA_ENTRADA"
    TRANSFERENCIA_SALIDA = "TRANSFERENCIA_SALIDA"
    INVENTARIO_INICIAL = "INVENTARIO_INICIAL"
    INVENTARIO_FISICO = "INVENTARIO_FISICO"


class MotivoMovimiento(str, enum.Enum):
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


class Bodega(Base):
    __tablename__ = "bodegas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, index=True)
    codigo = Column(String(50), unique=True, index=True)
    direccion = Column(Text)
    encargado = Column(String(100))
    telefono = Column(String(20))
    activa = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    stocks = relationship("StockBodega", back_populates="bodega")
    movimientos_origen = relationship(
        "MovimientoInventario",
        foreign_keys="MovimientoInventario.bodega_origen_id",
        back_populates="bodega_origen",
    )
    movimientos_destino = relationship(
        "MovimientoInventario",
        foreign_keys="MovimientoInventario.bodega_destino_id",
        back_populates="bodega_destino",
    )


class StockBodega(Base):
    __tablename__ = "stock_bodega"

    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"))
    bodega_id = Column(Integer, ForeignKey("bodegas.id"))
    cantidad = Column(Integer, default=0)
    ubicacion = Column(String(50))

    producto = relationship("Producto", back_populates="stocks_bodega")
    bodega = relationship("Bodega", back_populates="stocks")

    __table_args__ = (
        Index("idx_producto_bodega", "producto_id", "bodega_id", unique=True),
    )


class MovimientoInventario(Base):
    __tablename__ = "movimientos_inventario"

    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"))
    tipo_movimiento = Column(Enum(TipoMovimiento))
    cantidad = Column(Integer)
    motivo = Column(Enum(MotivoMovimiento))
    observaciones = Column(Text)
    documento_referencia = Column(String(50))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    fecha_movimiento = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    stock_anterior = Column(Integer)
    stock_posterior = Column(Integer)
    bodega_origen_id = Column(Integer, ForeignKey("bodegas.id"), nullable=True)
    bodega_destino_id = Column(Integer, ForeignKey("bodegas.id"), nullable=True)

    producto = relationship("Producto", back_populates="movimientos")
    usuario = relationship("User")
    bodega_origen = relationship(
        "Bodega", foreign_keys=[bodega_origen_id], back_populates="movimientos_origen"
    )
    bodega_destino = relationship(
        "Bodega", foreign_keys=[bodega_destino_id], back_populates="movimientos_destino"
    )


# Índices adicionales
Index("idx_producto_sku", Producto.sku, unique=True)
