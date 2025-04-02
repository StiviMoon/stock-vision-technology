#schemas.py

from pydantic import BaseModel, EmailStr

# Esquema para crear un usuario
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# Esquema para mostrar un usuario
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    rol: str

    class Config:
        from_attributes = True
