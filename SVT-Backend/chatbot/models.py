# chatbot/models.py
from sqlalchemy import Column, Integer, Text, Float
from sqlalchemy.dialects.postgresql import ARRAY
from database import Base

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    embedding = Column(ARRAY(Float), nullable=False)
