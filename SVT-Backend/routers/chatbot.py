# routers/chatbot.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from services.chatbot_service import get_ai_assistant, InventoryAIAssistant
import uuid
from datetime import datetime
import os

router = APIRouter()


# Modelos Pydantic
class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    timestamp: datetime


class QuickAction(BaseModel):
    action: str
    description: str
    example_query: str


# Cache temporal de conversaciones (en producción usar Redis)
conversations_cache = {}


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    chat_request: ChatMessage,
    db: Session = Depends(get_db),
    assistant: InventoryAIAssistant = Depends(get_ai_assistant),
):
    """
    🤖 Chatea con el asistente IA del Sistema SVT

    Puedes preguntar sobre:
    - Stock de productos
    - Información de proveedores
    - Estadísticas del inventario
    - Búsqueda de productos
    - Análisis de datos
    """
    try:
        # Generar o usar conversation_id existente
        conversation_id = chat_request.conversation_id or str(uuid.uuid4())

        # Procesar mensaje con contexto de base de datos
        ai_response = await assistant.process_user_message(chat_request.message, db)

        # Guardar conversación en cache
        if conversation_id not in conversations_cache:
            conversations_cache[conversation_id] = []

        conversation_entry = {
            "timestamp": datetime.now(),
            "user_message": chat_request.message,
            "ai_response": ai_response,
        }
        conversations_cache[conversation_id].append(conversation_entry)

        return ChatResponse(
            response=ai_response,
            conversation_id=conversation_id,
            timestamp=datetime.now(),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error procesando mensaje: {str(e)}"
        )


@router.get("/quick-actions")
async def get_quick_actions():
    """
    📋 Obtener acciones rápidas disponibles para el chatbot
    """
    actions = [
        QuickAction(
            action="stock_bajo",
            description="Ver productos con stock bajo",
            example_query="¿Qué productos tienen stock bajo?",
        ),
        QuickAction(
            action="estadisticas",
            description="Ver estadísticas generales del inventario",
            example_query="Muéstrame las estadísticas generales del inventario",
        ),
        QuickAction(
            action="proveedores",
            description="Ver lista de proveedores",
            example_query="¿Cuáles son nuestros proveedores?",
        ),
        QuickAction(
            action="valor_inventario",
            description="Consultar valor total del inventario",
            example_query="¿Cuál es el valor total del inventario?",
        ),
        QuickAction(
            action="productos_categoria",
            description="Ver productos por categoría",
            example_query="¿Qué productos hay en la categoría electrónicos?",
        ),
        QuickAction(
            action="ultimos_movimientos",
            description="Ver últimos movimientos de inventario",
            example_query="¿Cuáles fueron los últimos movimientos de inventario?",
        ),
        QuickAction(
            action="alertas",
            description="Ver alertas o incidencias recientes",
            example_query="¿Hay alertas o incidencias recientes en el inventario?",
        ),
    ]
    return {"quick_actions": actions}


@router.get("/analytics")
async def get_inventory_analytics(
    db: Session = Depends(get_db),
    assistant: InventoryAIAssistant = Depends(get_ai_assistant),
):
    """
    📊 Obtener análisis completo del inventario SVT
    """
    try:
        # Obtener diferentes tipos de análisis
        stats = await assistant.get_inventory_stats(db)
        low_stock = await assistant.get_low_stock_analysis(db)
        suppliers = await assistant.get_supplier_analysis(db)

        return {
            "general_stats": stats,
            "low_stock_analysis": low_stock,
            "supplier_analysis": suppliers,
            "generated_at": datetime.now(),
            "system": "SVT Inventory Management",
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generando análisis: {str(e)}"
        )


@router.get("/conversation/{conversation_id}")
async def get_conversation_history(conversation_id: str):
    """
    💬 Obtener historial de conversación específica
    """
    if conversation_id not in conversations_cache:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")

    return {
        "conversation_id": conversation_id,
        "messages": conversations_cache[conversation_id],
        "total_messages": len(conversations_cache[conversation_id]),
    }


@router.delete("/conversation/{conversation_id}")
async def clear_conversation(conversation_id: str):
    """
    🗑️ Limpiar historial de conversación
    """
    if conversation_id in conversations_cache:
        del conversations_cache[conversation_id]
        return {"message": "Conversación eliminada exitosamente"}
    else:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")


@router.post("/analyze")
async def analyze_specific_query(
    query: str,
    db: Session = Depends(get_db),
    assistant: InventoryAIAssistant = Depends(get_ai_assistant),
):
    """
    🔍 Analizar una consulta específica sin mantener conversación
    """
    try:
        response = await assistant.process_user_message(query, db)
        return {
            "query": query,
            "analysis": response,
            "timestamp": datetime.now(),
            "system": "SVT Analytics",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analizando query: {str(e)}")


@router.get("/health")
async def chatbot_health_check():
    """
    ❤️ Verificar estado del servicio de chatbot
    """
    try:
        gemini_status = os.getenv("GEMINI_API_KEY") is not None

        return {
            "status": "healthy" if gemini_status else "warning",
            "service": "SVT Chatbot AI",
            "gemini_configured": gemini_status,
            "active_conversations": len(conversations_cache),
            "model": "gemini-1.5-flash",
            "version": "1.0.0",
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e), "service": "SVT Chatbot AI"}
