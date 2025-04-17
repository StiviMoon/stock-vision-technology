from sqlalchemy.orm import Session
from sqlalchemy import or_
import models
from schemas import ProveedorCreate, ProveedorResponse


def get_proveedor(db: Session, proveedor_id: int):
    """Obtener un proveedor por su ID"""
    return (
        db.query(models.Proveedor).filter(models.Proveedor.id == proveedor_id).first()
    )


def get_proveedor_by_codigo(db: Session, codigo: str):
    """Obtener un proveedor por su código"""
    return db.query(models.Proveedor).filter(models.Proveedor.codigo == codigo).first()


def get_proveedores(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    """Obtener lista de proveedores con búsqueda opcional"""
    query = db.query(models.Proveedor)

    if search:
        query = query.filter(
            or_(
                models.Proveedor.nombre.ilike(f"%{search}%"),
                models.Proveedor.codigo.ilike(f"%{search}%"),
            )
        )

    return query.order_by(models.Proveedor.nombre).offset(skip).limit(limit).all()


def create_proveedor(db: Session, proveedor: ProveedorCreate):
    """Crear un nuevo proveedor"""
    db_proveedor = models.Proveedor(**proveedor.dict())
    db.add(db_proveedor)
    db.commit()
    db.refresh(db_proveedor)
    return db_proveedor
