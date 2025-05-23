import google.generativeai as genai
import os
from typing import List

# Configura la API Key desde variable de entorno
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "TU_API_KEY_AQUÍ")
genai.configure(api_key=GEMINI_API_KEY)

def get_real_embedding(text: str, task_type: str = "retrieval_query") -> List[float]:
    """
    Obtiene un embedding real desde Gemini (modelo embedding-001).
    :param text: Texto a convertir.
    :param task_type: "retrieval_query" para preguntas, "retrieval_document" para documentos.
    :return: Lista de floats (embedding).
    """
    try:
        response = genai.embed_content(
            model="models/embedding-001",
            content=text,
            task_type=task_type
        )
        return response["embedding"]
    except Exception as e:
        raise RuntimeError(f"Error al obtener embedding: {e}")
