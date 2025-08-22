# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routers import (
    auth,
    users,
    productos,
    proveedores,
    chatbot,
    inventario,
)
from database import engine, wait_for_database
import models

# Inicializar la aplicación FastAPI
app = FastAPI(
    title="Sistema de Gestión de Inventarios SVT con IA",
    description="API para el sistema de inventario SVT con asistente inteligente integrado",
    version="2.0.0",
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(productos.router, prefix="/productos", tags=["Productos"])
app.include_router(proveedores.router, prefix="/proveedores", tags=["Proveedores"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot IA"])
app.include_router(inventario.router)


@app.on_event("startup")
async def startup_event():
    """Evento que se ejecuta al iniciar la aplicación"""
    print("🚀 Iniciando aplicación SVT...")

    # Esperar a que la base de datos esté lista
    if not wait_for_database():
        raise HTTPException(
            status_code=500, detail="No se pudo conectar a la base de datos"
        )

    # Crear las tablas
    try:
        models.Base.metadata.create_all(bind=engine)
        print("✅ Tablas de base de datos creadas/verificadas")
    except Exception as e:
        print(f"❌ Error creando tablas: {e}")
        raise HTTPException(
            status_code=500, detail="Error configurando la base de datos"
        )


# Ruta de prueba actualizada
@app.get("/")
def read_root():
    return {
        "message": "API SVT con IA funcionando correctamente ��",
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
