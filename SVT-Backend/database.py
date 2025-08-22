import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import time

# Cargar variables de entorno
load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://svt_user:svt_password@localhost:5432/svt_database"
)

# Configurar la conexión con PostgreSQL
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verificar conexión antes de usar
    pool_recycle=300,  # Reciclar conexiones cada 5 minutos
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependencia para obtener sesión de BD
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Función para verificar conexión a la BD
def check_database_connection():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            connection.commit()
        return True
    except Exception as e:
        print(f"Error conectando a la base de datos: {e}")
        return False


# Función para esperar a que la BD esté lista
def wait_for_database(max_attempts=30, delay=2):
    for attempt in range(max_attempts):
        if check_database_connection():
            print("✅ Base de datos conectada exitosamente")
            return True
        print(f"⏳ Intento {attempt + 1}/{max_attempts}: Esperando conexión a la BD...")
        time.sleep(delay)

    print("❌ No se pudo conectar a la base de datos después de varios intentos")
    return False
