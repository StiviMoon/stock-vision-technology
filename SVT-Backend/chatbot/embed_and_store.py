# chatbot/embed_and_store.py

import json
from sqlalchemy.orm import Session
from database import SessionLocal
from chatbot.embedding import get_real_embedding
from chatbot.chunker import chunk_text
from chatbot.models import DocumentChunk


def index_text_document(text: str, source_id: str = "manual_upload", db: Session = None):
    # Usar la sesión pasada o crear una nueva si no se proporciona
    local_session = False
    if db is None:
        db = SessionLocal()
        local_session = True

    try:
        # 1. Divide el texto en chunks
        chunks = chunk_text(text)

        for chunk in chunks:
            # 2. Obtener embedding real
            embedding = get_real_embedding(chunk, task_type="retrieval_document")

            # 3. Guardar en la base de datos
            db_chunk = DocumentChunk(
                content=chunk,  # asegúrate que sea `content`, no `text`
                embedding=embedding,
            )
            db.add(db_chunk)

        db.commit()
        print(f"[✔] {len(chunks)} chunks indexados con éxito para: {source_id}")

    except Exception as e:
        print(f"[ERROR] Falló la indexación de {source_id}: {e}")

    finally:
        if local_session:
            db.close()
