# chatbot/vector_store.py

import numpy as np
from sqlalchemy.orm import Session
from typing import List
from chatbot.models import DocumentChunk

# Calcular similitud del coseno
def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Buscar los chunks más similares al query
def search_similar_chunks(query: str, query_embedding: List[float], db: Session) -> List[str]:
    chunks = db.query(DocumentChunk).all()
    if not chunks:
        return []

    query_vector = np.array(query_embedding)
    results = []

    for chunk in chunks:
        embedding = np.array(chunk.embedding)
        similarity = cosine_similarity(query_vector, embedding)
        results.append((chunk.text, similarity))

    top_chunks = sorted(results, key=lambda x: x[1], reverse=True)[:3]
    return [chunk for chunk, _ in top_chunks]

# Insertar un nuevo chunk a la base de datos
def insert_document_chunk(text: str, embedding: List[float], db: Session):
    if not embedding or not isinstance(embedding, list):
        raise ValueError("Embedding inválido o vacío")

    chunk = DocumentChunk(
        text=text,
        embedding=embedding
    )
    db.add(chunk)
    db.commit()
    db.refresh(chunk)
    return chunk
