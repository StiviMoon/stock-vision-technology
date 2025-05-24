# services/chatbot_service.py

import google.generativeai as genai
import os
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from typing import List, Dict, Any
import json
from datetime import datetime

# Configurar Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


class InventoryAIAssistant:
    def __init__(self):
        self.model = genai.GenerativeModel("gemini-1.5-flash")
        self.system_prompt = """
        Eres un asistente inteligente especializado en el Sistema de Gestión de Inventarios SVT.
        Tu trabajo es ayudar a los usuarios con consultas sobre productos, proveedores, stock, análisis y reportes.
        
        Capacidades principales:
        1. Consultar inventario y productos
        2. Verificar stock y disponibilidad
        3. Información sobre proveedores
        4. Análisis de datos de inventario
        5. Generar reportes y estadísticas
        6. Alertas de stock bajo
        7. Recomendaciones de restock
        8. Consultas sobre usuarios y autenticación
        
        Siempre responde de manera profesional, clara y basada en datos reales del sistema SVT.
        Si necesitas información específica de la base de datos, la consultaré automáticamente.
        Eres parte del ecosistema SVT, así que conoces el contexto del negocio.
        """

    async def get_products_context(self, db: Session) -> str:
        """Obtiene contexto de productos desde tu base de datos SVT"""
        try:
            query = text(
                """
                SELECT p.id, p.sku, p.nombre, p.descripcion, p.categoria, 
                       p.precio_unitario, p.stock_actual, p.stock_minimo,
                       prov.nombre as proveedor_nombre
                FROM productos p 
                LEFT JOIN proveedores prov ON p.proveedor_id = prov.id 
                ORDER BY p.nombre
                LIMIT 50
            """
            )
            result = db.execute(query).fetchall()

            context = "Productos en inventario SVT:\n"
            for row in result:
                context += f"- ID: {row.id}, SKU: {row.sku}, Nombre: {row.nombre}\n"
                context += f"  Stock: {row.stock_actual} (mínimo: {row.stock_minimo})\n"
                context += (
                    f"  Precio: ${row.precio_unitario}, Categoría: {row.categoria}\n"
                )
                if row.proveedor_nombre:
                    context += f"  Proveedor: {row.proveedor_nombre}\n"
                if row.descripcion:
                    context += f"  Descripción: {row.descripcion[:100]}...\n"
                context += "\n"

            return context

        except Exception as e:
            return f"Error obteniendo productos: {str(e)}"

    async def get_low_stock_analysis(self, db: Session, threshold: int = None) -> str:
        """Analiza productos con stock bajo usando stock_minimo o threshold"""
        try:
            if threshold is None:
                # Usar stock_minimo como referencia principal
                query = text(
                    """
                    SELECT p.id, p.sku, p.nombre, p.stock_actual, p.stock_minimo, 
                           p.precio_unitario, p.categoria, prov.nombre as proveedor_nombre
                    FROM productos p 
                    LEFT JOIN proveedores prov ON p.proveedor_id = prov.id
                    WHERE p.stock_actual <= p.stock_minimo
                    ORDER BY (p.stock_actual - p.stock_minimo) ASC
                    LIMIT 20
                """
                )
                result = db.execute(query).fetchall()
                title = "⚠️ Productos por debajo del stock mínimo:"
            else:
                # Usar threshold específico
                query = text(
                    """
                    SELECT p.id, p.sku, p.nombre, p.stock_actual, p.stock_minimo,
                           p.precio_unitario, p.categoria, prov.nombre as proveedor_nombre
                    FROM productos p 
                    LEFT JOIN proveedores prov ON p.proveedor_id = prov.id
                    WHERE p.stock_actual < :threshold
                    ORDER BY p.stock_actual ASC
                    LIMIT 20
                """
                )
                result = db.execute(query, {"threshold": threshold}).fetchall()
                title = f"⚠️ Productos con menos de {threshold} unidades:"

            if not result:
                return "✅ No hay productos con stock bajo actualmente."

            analysis = title + "\n"
            total_value_at_risk = 0
            critical_count = 0

            for row in result:
                stock_deficit = (
                    row.stock_minimo - row.stock_actual
                    if threshold is None
                    else threshold - row.stock_actual
                )
                if stock_deficit > 0:
                    critical_count += 1

                analysis += f"\n📦 {row.nombre} (SKU: {row.sku})\n"
                analysis += f"   Stock actual: {row.stock_actual} | Mínimo: {row.stock_minimo}\n"
                analysis += (
                    f"   Precio: ${row.precio_unitario} | Categoría: {row.categoria}\n"
                )
                if row.proveedor_nombre:
                    analysis += f"   Proveedor: {row.proveedor_nombre}\n"

                total_value_at_risk += row.stock_actual * row.precio_unitario

            analysis += f"\n📊 Resumen:\n"
            analysis += f"• Productos críticos: {critical_count}\n"
            analysis += f"• Valor total en riesgo: ${total_value_at_risk:,.2f}\n"

            return analysis

        except Exception as e:
            return f"Error en análisis de stock bajo: {str(e)}"

    async def get_inventory_stats(self, db: Session) -> str:
        """Obtiene estadísticas completas del inventario SVT"""
        try:
            # Estadísticas básicas
            stats_query = text(
                """
                SELECT 
                    COUNT(*) as total_productos,
                    SUM(stock_actual) as total_unidades,
                    SUM(stock_actual * precio_unitario) as valor_total_inventario,
                    AVG(precio_unitario) as precio_promedio,
                    COUNT(DISTINCT categoria) as total_categorias,
                    COUNT(DISTINCT proveedor_id) as total_proveedores,
                    COUNT(CASE WHEN stock_actual <= stock_minimo THEN 1 END) as productos_stock_bajo
                FROM productos
            """
            )
            stats = db.execute(stats_query).fetchone()

            # Top categorías por cantidad de productos
            categories_query = text(
                """
                SELECT categoria, 
                       COUNT(*) as cantidad_productos, 
                       SUM(stock_actual) as total_stock,
                       SUM(stock_actual * precio_unitario) as valor_categoria
                FROM productos 
                WHERE categoria IS NOT NULL
                GROUP BY categoria 
                ORDER BY cantidad_productos DESC 
                LIMIT 5
            """
            )
            categories = db.execute(categories_query).fetchall()

            # Productos más valiosos
            top_products_query = text(
                """
                SELECT nombre, stock_actual, precio_unitario,
                       (stock_actual * precio_unitario) as valor_total
                FROM productos
                ORDER BY valor_total DESC
                LIMIT 5
            """
            )
            top_products = db.execute(top_products_query).fetchall()

            analysis = f"""📊 **Estadísticas del Sistema SVT**

                🔢 **Números Generales:**
                • Total de productos: {stats.total_productos:,}
                • Total de unidades en stock: {stats.total_unidades:,}
                • Valor total del inventario: ${stats.valor_total_inventario:,.2f}
                • Precio promedio por producto: ${stats.precio_promedio:.2f}
                • Categorías diferentes: {stats.total_categorias}
                • Proveedores activos: {stats.total_proveedores}
                • Productos con stock bajo: {stats.productos_stock_bajo} ⚠️

                🏷️ **Top Categorías:**
                """
            for cat in categories:
                analysis += f"• {cat.categoria}: {cat.cantidad_productos} productos "
                analysis += (
                    f"({cat.total_stock:,} unidades, ${cat.valor_categoria:,.2f})\n"
                )

            analysis += "\n💎 **Productos Más Valiosos:**\n"
            for prod in top_products:
                analysis += f"• {prod.nombre}: {prod.stock_actual} × ${prod.precio_unitario} = ${prod.valor_total:,.2f}\n"

            return analysis

        except Exception as e:
            return f"Error obteniendo estadísticas: {str(e)}"

    async def search_products(self, db: Session, query: str) -> str:
        """Busca productos por nombre, SKU, categoría o descripción"""
        try:
            search_query = text(
                """
                SELECT p.id, p.sku, p.nombre, p.descripcion, p.categoria,
                       p.stock_actual, p.stock_minimo, p.precio_unitario,
                       prov.nombre as proveedor_nombre
                FROM productos p 
                LEFT JOIN proveedores prov ON p.proveedor_id = prov.id
                WHERE LOWER(p.nombre) LIKE LOWER(:search)
                   OR LOWER(p.sku) LIKE LOWER(:search)
                   OR LOWER(p.categoria) LIKE LOWER(:search)
                   OR LOWER(p.descripcion) LIKE LOWER(:search)
                ORDER BY p.nombre
                LIMIT 15
            """
            )
            results = db.execute(search_query, {"search": f"%{query}%"}).fetchall()

            if not results:
                return f"❌ No se encontraron productos que coincidan con '{query}'"

            response = f"🔍 **Resultados de búsqueda para '{query}'** ({len(results)} productos):\n\n"

            for row in results:
                stock_status = "🟢" if row.stock_actual > row.stock_minimo else "🔴"
                response += f"{stock_status} **{row.nombre}** (SKU: {row.sku})\n"
                response += f"   📦 Stock: {row.stock_actual} (mín: {row.stock_minimo}) | 💰 ${row.precio_unitario}\n"
                response += f"   🏷️ {row.categoria}"
                if row.proveedor_nombre:
                    response += f" | 🏭 {row.proveedor_nombre}"
                response += "\n"
                if row.descripcion:
                    response += f"   📝 {row.descripcion[:80]}...\n"
                response += "\n"

            return response

        except Exception as e:
            return f"Error en búsqueda: {str(e)}"

    async def get_supplier_analysis(self, db: Session) -> str:
        """Análisis completo de proveedores"""
        try:
            query = text(
                """
                SELECT prov.id, prov.nombre, prov.codigo, prov.contacto,
                       prov.telefono, prov.email, prov.direccion,
                       COUNT(p.id) as total_productos,
                       COALESCE(SUM(p.stock_actual), 0) as total_stock,
                       COALESCE(AVG(p.precio_unitario), 0) as precio_promedio,
                       COALESCE(SUM(p.stock_actual * p.precio_unitario), 0) as valor_total
                FROM proveedores prov
                LEFT JOIN productos p ON prov.id = p.proveedor_id
                GROUP BY prov.id, prov.nombre, prov.codigo, prov.contacto, 
                         prov.telefono, prov.email, prov.direccion
                ORDER BY total_productos DESC
                LIMIT 10
            """
            )
            results = db.execute(query).fetchall()

            if not results:
                return "📦 No se encontraron proveedores en el sistema."

            analysis = "🏭 **Análisis de Proveedores SVT:**\n\n"

            for row in results:
                analysis += f"**{row.nombre}** (Código: {row.codigo})\n"
                analysis += f"   📊 {row.total_productos} productos | Stock total: {row.total_stock:,} unidades\n"
                analysis += f"   💰 Precio promedio: ${row.precio_promedio:.2f} | Valor total: ${row.valor_total:,.2f}\n"

                if row.contacto:
                    analysis += f"   👤 Contacto: {row.contacto}\n"
                if row.telefono:
                    analysis += f"   📞 Teléfono: {row.telefono}\n"
                if row.email:
                    analysis += f"   📧 Email: {row.email}\n"
                if row.direccion:
                    analysis += f"   📍 Dirección: {row.direccion}\n"
                analysis += "\n"

            # Estadísticas adicionales
            total_suppliers = len(results)
            active_suppliers = len([r for r in results if r.total_productos > 0])

            analysis += f"📈 **Resumen:** {total_suppliers} proveedores registrados, {active_suppliers} activos\n"

            return analysis

        except Exception as e:
            return f"Error en análisis de proveedores: {str(e)}"

    async def get_product_by_sku(self, db: Session, sku: str) -> str:
        """Obtiene información específica de un producto por SKU"""
        try:
            query = text(
                """
                SELECT p.*, prov.nombre as proveedor_nombre, prov.telefono as proveedor_telefono
                FROM productos p
                LEFT JOIN proveedores prov ON p.proveedor_id = prov.id
                WHERE LOWER(p.sku) = LOWER(:sku)
            """
            )
            result = db.execute(query, {"sku": sku}).fetchone()

            if not result:
                return f"❌ No se encontró producto con SKU: {sku}"

            stock_status = (
                "🟢 Stock normal"
                if result.stock_actual > result.stock_minimo
                else "🔴 Stock bajo"
            )

            info = f"📦 **Información del Producto**\n\n"
            info += f"**{result.nombre}** (SKU: {result.sku})\n"
            info += f"🏷️ Categoría: {result.categoria}\n"
            info += f"💰 Precio unitario: ${result.precio_unitario}\n"
            info += f"📊 Stock actual: {result.stock_actual} | Mínimo: {result.stock_minimo} {stock_status}\n"

            if result.descripcion:
                info += f"📝 Descripción: {result.descripcion}\n"

            if result.proveedor_nombre:
                info += f"🏭 Proveedor: {result.proveedor_nombre}\n"
                if result.proveedor_telefono:
                    info += f"📞 Tel. proveedor: {result.proveedor_telefono}\n"

            info += f"📅 Creado: {result.fecha_creacion.strftime('%Y-%m-%d %H:%M')}\n"
            info += f"🔄 Actualizado: {result.fecha_actualizacion.strftime('%Y-%m-%d %H:%M')}\n"

            valor_stock = result.stock_actual * result.precio_unitario
            info += f"💎 Valor total en stock: ${valor_stock:,.2f}\n"

            return info

        except Exception as e:
            return f"Error obteniendo producto: {str(e)}"

    async def process_user_message(self, message: str, db: Session) -> str:
        """Procesa el mensaje del usuario y genera respuesta contextual"""
        try:
            message_lower = message.lower()
            context_data = ""

            # Determinar tipo de consulta y obtener contexto relevante
            if any(word in message_lower for word in ["sku", "código"]):
                # Buscar por SKU específico
                words = message.split()
                sku = None
                for word in words:
                    if len(word) > 3 and any(char.isdigit() for char in word):
                        sku = word.replace(",", "").replace(".", "")
                        break
                if sku:
                    context_data = await self.get_product_by_sku(db, sku)
                else:
                    context_data = "Por favor especifica el SKU del producto."

            elif any(
                word in message_lower
                for word in ["buscar", "encuentra", "busca", "mostrar"]
            ):
                # Extraer término de búsqueda
                search_terms = []
                words = message.split()
                skip_next = False
                for i, word in enumerate(words):
                    if skip_next:
                        skip_next = False
                        continue
                    if word.lower() in [
                        "buscar",
                        "busca",
                        "encuentra",
                        "mostrar",
                        "productos",
                        "de",
                        "con",
                    ]:
                        if i + 1 < len(words):
                            search_terms.extend(words[i + 1 :])
                            break

                search_term = " ".join(search_terms[:3]) if search_terms else ""
                if search_term:
                    context_data = await self.search_products(db, search_term)
                else:
                    context_data = await self.get_products_context(db)

            elif any(
                word in message_lower
                for word in ["stock bajo", "bajo stock", "mínimo", "crítico", "restock"]
            ):
                context_data = await self.get_low_stock_analysis(db)

            elif any(
                word in message_lower
                for word in ["estadísticas", "stats", "resumen", "reporte", "números"]
            ):
                context_data = await self.get_inventory_stats(db)

            elif any(
                word in message_lower
                for word in ["proveedores", "suppliers", "proveedor", "fabricantes"]
            ):
                context_data = await self.get_supplier_analysis(db)

            elif any(
                word in message_lower
                for word in ["productos", "inventario", "stock", "catálogo"]
            ):
                context_data = await self.get_products_context(db)

            else:
                # Para preguntas generales, dar contexto básico
                context_data = await self.get_inventory_stats(db)

            # Construir prompt completo
            full_prompt = f"""
            {self.system_prompt}
            
            **DATOS ACTUALES DEL SISTEMA SVT:**
            {context_data}
            
            **PREGUNTA DEL USUARIO:** {message}
            
            **INSTRUCCIONES ESPECÍFICAS:**
            - Responde basándote ÚNICAMENTE en los datos del Sistema SVT proporcionados
            - Sé específico, útil y proporciona información concreta
            - Usa emojis para hacer la respuesta más amigable y visual
            - Si haces cálculos, muestra los números claramente con formato de moneda
            - Mantén un tono profesional pero cercano
            - Si no tienes suficiente información, dilo claramente
            - Para consultas sobre stock, menciona siempre el stock actual vs mínimo
            - Para consultas de búsqueda, presenta los resultados de forma organizada
            - Incluye recomendaciones cuando sea apropiado
            """

            # Generar respuesta con Gemini
            response = await self.model.generate_content_async(full_prompt)
            return response.text

        except Exception as e:
            return f"❌ Lo siento, ocurrió un error procesando tu consulta: {str(e)}\n\nPor favor intenta reformular tu pregunta o contacta al administrador."


# Función factory para dependencia
async def get_ai_assistant():
    """Factory function para obtener instancia del asistente"""
    return InventoryAIAssistant()
