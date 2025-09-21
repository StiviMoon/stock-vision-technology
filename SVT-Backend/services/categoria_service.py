from sqlalchemy.orm import Session
from sqlalchemy import or_
import models
from schemas import CategoriaCreate


def get_categoria(db: Session, categoria_id: int):
    """Obtener una categoría por su ID"""
    return (
        db.query(models.Categoria).filter(models.Categoria.id == categoria_id).first()
    )


def get_categoria_by_codigo(db: Session, codigo: str):
    """Obtener una categoría por su código"""
    return db.query(models.Categoria).filter(models.Categoria.codigo == codigo).first()


def get_categoria_by_nombre(db: Session, nombre: str):
    """Obtener una categoría por su nombre"""
    return db.query(models.Categoria).filter(models.Categoria.nombre == nombre).first()


def get_categorias(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    """Obtener lista de categorías con búsqueda opcional"""
    query = db.query(models.Categoria)

    if search:
        query = query.filter(
            or_(
                models.Categoria.nombre.ilike(f"%{search}%"),
                models.Categoria.codigo.ilike(f"%{search}%"),
                models.Categoria.descripcion.ilike(f"%{search}%"),
            )
        )

    return query.order_by(models.Categoria.nombre).offset(skip).limit(limit).all()


def create_categoria(db: Session, categoria: CategoriaCreate):
    """Crear una nueva categoría"""
    db_categoria = models.Categoria(**categoria.model_dump())
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria


def update_categoria(db: Session, categoria_id: int, categoria: CategoriaCreate):
    """Actualizar una categoría existente"""
    db_categoria = (
        db.query(models.Categoria).filter(models.Categoria.id == categoria_id).first()
    )
    if db_categoria:
        for key, value in categoria.model_dump().items():
            setattr(db_categoria, key, value)
        db.commit()
        db.refresh(db_categoria)
        return db_categoria
    return None


def delete_categoria(db: Session, categoria_id: int):
    """Eliminar una categoría por su ID"""
    db_categoria = (
        db.query(models.Categoria).filter(models.Categoria.id == categoria_id).first()
    )
    if db_categoria:
        db.delete(db_categoria)
        db.commit()
        return True
    return False


def get_categorias_activas(db: Session):
    """Obtener solo las categorías activas"""
    return db.query(models.Categoria).filter(models.Categoria.activa).order_by(models.Categoria.nombre).all()


def count_productos_por_categoria(db: Session, categoria_id: int):
    """Contar cuántos productos tiene una categoría"""
    return db.query(models.Producto).filter(models.Producto.categoria_id == categoria_id).count()
