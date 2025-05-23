# chatbot/rag_engine.py

from sqlalchemy.orm import Session
from chatbot.retriever import retrieve_relevant_chunks
import google.generativeai as genai
import os

# Configura la API Key (opcional si ya se hace globalmente)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_rag_response(question: str, db: Session) -> str:
    # 1. Recuperar los chunks relevantes
    relevant_chunks = retrieve_relevant_chunks(question, db=db, top_k=5)

    if not relevant_chunks:
        return "No se encontró información relevante en la base de datos."

    # 2. Unir los chunks en un solo string
    context = "\n".join(relevant_chunks)

    # 3. Armar prompt para Gemini
    prompt = f"""
Eres un asistente inteligente SVT que responde preguntas usando SOLO la información disponible del sistema.

Contexto del sistema:
{context}

Pregunta: {question}

Respuesta:
"""

    # 4. Llamar a Gemini para generar la respuesta
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)

    return response.text.strip()
