# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, users
from database import engine
import models

# Crear las tablas en la base de datos si no existen
models.Base.metadata.create_all(bind=engine)

# Inicializar la aplicación FastAPI
app = FastAPI()

# Configuración de CORS - AÑADIR ESTO
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Tu frontend Next.js
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos HTTP
    allow_headers=["*"],  # Permite todos los headers
)

# Incluir los routers correctamente (una sola vez cada uno)
app.include_router(auth.router, prefix="/auth", tags=["Auth"])  
app.include_router(users.router, prefix="/users", tags=["Users"])

# Ruta de prueba
@app.get("/")
def read_root():
    return {"message": "API funcionando correctamente 🚀"}