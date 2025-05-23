# seed_chunks.py

from chatbot.models import DocumentChunk
from chatbot.embedding import get_fake_embedding
from database import SessionLocal
from sqlalchemy.orm import Session
import json

# Textos de ejemplo
texts = [
    "¿Cómo registrar un nuevo proveedor en el sistema?",
    "Pasos para hacer una entrada de productos al inventario.",
    "¿Qué hacer cuando un producto se agota?",
    "Generar reportes mensuales de ventas.",
    "Actualizar los datos de un usuario desde el panel de administración.",
]

def seed_chunks(db: Session):
    for i, text in enumerate(texts):
        embedding = get_fake_embedding(text)
        chunk = DocumentChunk(
    text=text,
    embedding=embedding
)

        db.add(chunk)
    db.commit()

if __name__ == "__main__":
    db = SessionLocal()
    seed_chunks(db)
    db.close()
    print("✅ Datos insertados correctamente.")
