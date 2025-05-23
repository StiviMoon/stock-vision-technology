from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from chatbot.schemas import AskRequest
from chatbot.rag_engine import generate_rag_response
from database import get_db

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

@router.post("/ask", response_model=dict)
def ask_question(request: AskRequest, db: Session = Depends(get_db)) -> dict:
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="La pregunta no puede estar vacía.")
    try:
        response = generate_rag_response(request.question, db)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
