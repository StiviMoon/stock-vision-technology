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
    db_proveedor = models.Proveedor(**proveedor.model_dump())
    db.add(db_proveedor)
    db.commit()
    db.refresh(db_proveedor)
    return db_proveedor


def update_proveedor(db: Session, proveedor_id: int, proveedor: ProveedorCreate):
    """Actualizar un proveedor existente"""
    db_proveedor = (
        db.query(models.Proveedor).filter(models.Proveedor.id == proveedor_id).first()
    )
    if db_proveedor:
        for key, value in proveedor.model_dump().items():
            setattr(db_proveedor, key, value)
        db.commit()
        db.refresh(db_proveedor)
        return db_proveedor
    return None


def delete_proveedor(db: Session, proveedor_id: int):
    """Eliminar un proveedor por su ID"""
    db_proveedor = (
        db.query(models.Proveedor).filter(models.Proveedor.id == proveedor_id).first()
    )
    if db_proveedor:
        db.delete(db_proveedor)
        db.commit()
        return True
    return False
