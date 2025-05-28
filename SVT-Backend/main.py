# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import (
    auth,
    users,
    productos,
    proveedores,
    chatbot,
    inventario,
)  # Agregar chatbot e inventario
from database import engine
import models

# Crear las tablas en la base de datos si no existen
models.Base.metadata.create_all(bind=engine)

# Inicializar la aplicación FastAPI
app = FastAPI(
    title="Sistema de Gestión de Inventarios SVT con IA",
    description="API para el sistema de inventario SVT con asistente inteligente integrado",
    version="2.0.0",
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Tu frontend Next.js
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos HTTP
    allow_headers=["*"],  # Permite todos los headers
)

# Incluir los routers existentes
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(productos.router, prefix="/productos", tags=["Productos"])
app.include_router(proveedores.router, prefix="/proveedores", tags=["Proveedores"])

# Incluir el nuevo router del chatbot IA
app.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot IA"])
app.include_router(inventario.router)


# Ruta de prueba actualizada
@app.get("/")
def read_root():
    return {
        "message": "API SVT con IA funcionando correctamente 🚀",
        "version": "2.0.0",
        "features": [
            "Gestión de inventario",
            "Autenticación de usuarios",
            "Gestión de productos",
            "Gestión de proveedores",
            "Asistente IA integrado",
        ],
    }


# Endpoint de salud del sistema
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "svt-backend-ai",
        "database": "postgresql",
        "ai_model": "gemini-1.5-flash",
    }
