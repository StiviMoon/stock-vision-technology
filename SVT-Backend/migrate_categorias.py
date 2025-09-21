#!/usr/bin/env python3
"""
Script para migrar la base de datos y agregar soporte para categorías
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from database import DATABASE_URL

def migrate_database():
    """Migrar la base de datos para agregar soporte de categorías"""

    print("🔄 Iniciando migración de base de datos...")

    # Crear conexión a la base de datos
    engine = create_engine(DATABASE_URL)

    try:
        with engine.connect() as conn:
            # Verificar si las columnas de categoría ya existen
            result = conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'productos'
                AND column_name IN ('categoria_id', 'categoria_nombre')
            """))

            existing_columns = [row[0] for row in result.fetchall()]

            if 'categoria_id' in existing_columns and 'categoria_nombre' in existing_columns:
                print("✅ Las columnas de categoría ya existen en la tabla productos")
                return True

            print("📝 Agregando columnas de categoría a la tabla productos...")

            # Agregar la columna categoria_id si no existe
            if 'categoria_id' not in existing_columns:
                conn.execute(text("""
                    ALTER TABLE productos
                    ADD COLUMN categoria_id INTEGER REFERENCES categorias(id)
                """))
                print("✅ Columna categoria_id agregada")

            # Agregar la columna categoria_nombre si no existe
            if 'categoria_nombre' not in existing_columns:
                conn.execute(text("""
                    ALTER TABLE productos
                    ADD COLUMN categoria_nombre VARCHAR(50)
                """))
                print("✅ Columna categoria_nombre agregada")

            print("✅ Columnas de categoría procesadas exitosamente")

            # Verificar si hay datos en la tabla productos
            result = conn.execute(text("SELECT COUNT(*) FROM productos"))
            count = result.scalar()

            if count > 0:
                print(f"📊 Se encontraron {count} productos. Actualizando categorías...")

                # Crear categorías por defecto si no existen
                conn.execute(text("""
                    INSERT INTO categorias (nombre, codigo, descripcion, activa, fecha_creacion, fecha_actualizacion)
                    VALUES
                        ('General', 'GEN001', 'Categoría general para productos sin clasificar', true, NOW(), NOW()),
                        ('Electrónicos', 'ELEC001', 'Productos electrónicos y tecnología', true, NOW(), NOW()),
                        ('Ropa', 'ROPA001', 'Ropa y accesorios', true, NOW(), NOW()),
                        ('Hogar', 'HOGAR001', 'Artículos para el hogar', true, NOW(), NOW()),
                        ('Deportes', 'DEP001', 'Artículos deportivos', true, NOW(), NOW())
                    ON CONFLICT (codigo) DO NOTHING
                """))

                # Obtener la categoría general
                result = conn.execute(text("SELECT id FROM categorias WHERE codigo = 'GEN001'"))
                categoria_general_id = result.scalar()

                if categoria_general_id:
                    # Actualizar productos existentes para usar la categoría general
                    conn.execute(text("""
                        UPDATE productos
                        SET categoria_id = :categoria_id
                        WHERE categoria_id IS NULL
                    """), {"categoria_id": categoria_general_id})

                    print("✅ Productos existentes asignados a categoría 'General'")

            # Confirmar los cambios
            conn.commit()
            print("✅ Migración completada exitosamente")
            return True

    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        return False

if __name__ == "__main__":
    success = migrate_database()
    if success:
        print("🎉 Migración completada. Puedes continuar con el desarrollo.")
        sys.exit(0)
    else:
        print("💥 Error en la migración. Revisa los logs.")
        sys.exit(1)
