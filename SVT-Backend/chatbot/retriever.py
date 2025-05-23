# chatbot/retriever.py

from sqlalchemy.orm import Session
from chatbot.embedding import get_real_embedding
from chatbot.models import DocumentChunk
from typing import List
import numpy as np

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

def retrieve_relevant_chunks(question: str, db: Session, top_k: int = 5) -> List[str]:
    question_embedding = get_real_embedding(question, task_type="retrieval_query")

    all_chunks = db.query(DocumentChunk).all()

    scored_chunks = []
    for chunk in all_chunks:
        score = cosine_similarity(chunk.embedding, question_embedding)
        scored_chunks.append((score, chunk.content))

    # Ordenar por puntaje de similitud
    scored_chunks.sort(reverse=True, key=lambda x: x[0])

    # Devolver los top_k contenidos
    return [content for _, content in scored_chunks[:top_k]]
