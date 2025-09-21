# create_admin_user.py
"""
Script para crear el primer usuario administrador del sistema
Ejecutar después de que la aplicación haya creado las tablas
"""

import os
import sys
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Agregar el directorio actual al path para importar módulos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
from models import Base, User, UserRole
from utils.security import pwd_context

# Cargar variables de entorno
load_dotenv()

def create_admin_user():
    """Crear el primer usuario administrador"""

    # Crear las tablas si no existen
    print("🔄 Creando tablas de base de datos...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas exitosamente")

    # Crear sesión de base de datos
    db = SessionLocal()

    try:
        # Verificar si ya existe un administrador
        existing_admin = db.query(User).filter(User.rol == UserRole.ADMIN).first()

        if existing_admin:
            print(f"⚠️  Ya existe un usuario administrador: {existing_admin.email}")
            return existing_admin

        # Solicitar datos del administrador
        print("\n📝 Creando usuario administrador...")
        print("Ingresa los datos del primer administrador:")

        email = input("Email: ").strip()
        if not email:
            print("❌ El email es requerido")
            return None

        # Verificar si el email ya existe
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"❌ Ya existe un usuario con el email: {email}")
            return None

        password = input("Contraseña: ").strip()
        if not password:
            print("❌ La contraseña es requerida")
            return None

        if len(password) < 6:
            print("❌ La contraseña debe tener al menos 6 caracteres")
            return None

        nombre = input("Nombre (opcional): ").strip() or None
        apellido = input("Apellido (opcional): ").strip() or None

        # Crear el usuario administrador
        hashed_password = pwd_context.hash(password)

        admin_user = User(
            email=email,
            hashed_password=hashed_password,
            nombre=nombre,
            apellido=apellido,
            rol=UserRole.ADMIN,
            activo=True
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print(f"\n✅ Usuario administrador creado exitosamente!")
        print(f"   ID: {admin_user.id}")
        print(f"   Email: {admin_user.email}")
        print(f"   Nombre: {admin_user.nombre or 'No especificado'}")
        print(f"   Apellido: {admin_user.apellido or 'No especificado'}")
        print(f"   Rol: {admin_user.rol.value}")
        print(f"   Activo: {admin_user.activo}")

        return admin_user

    except Exception as e:
        print(f"❌ Error creando usuario administrador: {e}")
        db.rollback()
        return None

    finally:
        db.close()

def create_demo_users():
    """Crear usuarios de demostración para testing"""

    db = SessionLocal()

    try:
        print("\n🔄 Creando usuarios de demostración...")

        # Usuario regular
        regular_user = User(
            email="usuario@svt.com",
            hashed_password=pwd_context.hash("password123"),
            nombre="Usuario",
            apellido="Demo",
            rol=UserRole.USUARIO,
            activo=True
        )

        # Usuario invitado
        guest_user = User(
            email="invitado@svt.com",
            hashed_password=pwd_context.hash("password123"),
            nombre="Invitado",
            apellido="Demo",
            rol=UserRole.INVITADO,
            activo=True
        )

        db.add_all([regular_user, guest_user])
        db.commit()

        print("✅ Usuarios de demostración creados:")
        print(f"   - Usuario regular: usuario@svt.com / password123")
        print(f"   - Usuario invitado: invitado@svt.com / password123")

    except Exception as e:
        print(f"❌ Error creando usuarios de demostración: {e}")
        db.rollback()

    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Script de creación de usuario administrador - SVT")
    print("=" * 50)

    # Crear usuario administrador
    admin = create_admin_user()

    if admin:
        # Preguntar si crear usuarios de demostración
        create_demo = input("\n¿Crear usuarios de demostración? (y/n): ").strip().lower()
        if create_demo in ['y', 'yes', 's', 'si']:
            create_demo_users()

    print("\n🎉 Proceso completado!")
    print("Ahora puedes iniciar la aplicación FastAPI y usar el sistema.")
