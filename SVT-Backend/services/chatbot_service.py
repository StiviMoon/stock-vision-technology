import google.generativeai as genai
import os
from sqlalchemy.orm import Session

from services.product_queries import (
    get_products_query,
    search_products_query,
    get_low_stock_query,
    get_low_stock_threshold_query,
    get_inventory_stats_query,
    get_top_categories_query,
    get_top_products_query,
    get_product_by_sku_query,
)
from services.supplier_queries import get_supplier_analysis_query
from services.utils import format_currency

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


class InventoryAIAssistant:
    def __init__(self):
        self.model = genai.GenerativeModel("gemini-1.5-flash")
        self.system_prompt = """
            Eres un asistente inteligente especializado en el Sistema de Gestión de Inventarios SVT.

            Tu función principal es asistir a los usuarios en tareas relacionadas con la gestión de inventario, garantizando respuestas claras, precisas y alineadas con los datos disponibles en el sistema.

            Responsabilidades y capacidades clave:
            1. Consultar información detallada de productos e inventario.
            2. Verificar el estado de stock y disponibilidad de artículos.
            3. Proporcionar datos y detalles sobre proveedores registrados.
            4. Realizar análisis de inventario y comportamiento de stock.
            5. Generar reportes técnicos y estadísticas personalizadas.
            6. Emitir alertas automáticas ante niveles bajos de inventario.
            7. Recomendar acciones de reabastecimiento según tendencias.
            8. Atender consultas relacionadas con usuarios y autenticación del sistema.

            Directrices de interacción:
            - Mantén siempre un lenguaje profesional y enfocado al negocio.
            - Responde con base en los datos reales del sistema SVT.
            - Si se requiere información de la base de datos, actúa como intermediario para obtenerla y presentarla de forma útil.
            - Comprendes el contexto operativo del sistema SVT y su importancia dentro del entorno empresarial.

            Tu propósito es mejorar la eficiencia operativa, apoyar la toma de decisiones y brindar soporte confiable a los usuarios del sistema.
            """

    async def get_products_context(self, db: Session) -> str:
        try:
            query = get_products_query()
            result = db.execute(query).fetchall()
            context = "Productos en inventario SVT:\n"
            for row in result:
                context += f"- ID: {row.id}, SKU: {row.sku}, Nombre: {row.nombre}\n"
                context += f"  Stock: {row.stock_actual} (mínimo: {row.stock_minimo})\n"
                context += f"  Precio: {format_currency(row.precio_unitario)}, Categoría: {row.categoria}\n"
                if row.proveedor_nombre:
                    context += f"  Proveedor: {row.proveedor_nombre}\n"
                if row.descripcion:
                    context += f"  Descripción: {row.descripcion[:100]}...\n"
                context += "\n"
            return context
        except Exception as e:
            return f"Error obteniendo productos: {str(e)}"

    async def get_low_stock_analysis(self, db: Session, threshold: int = None) -> str:
        try:
            if threshold is None:
                query = get_low_stock_query()
                result = db.execute(query).fetchall()
                title = "⚠️ Productos por debajo del stock mínimo:"
            else:
                query = get_low_stock_threshold_query()
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
                analysis += f"   Precio: {format_currency(row.precio_unitario)} | Categoría: {row.categoria}\n"
                if row.proveedor_nombre:
                    analysis += f"   Proveedor: {row.proveedor_nombre}\n"
                total_value_at_risk += row.stock_actual * row.precio_unitario
            analysis += f"\n📊 Resumen:\n"
            analysis += f"• Productos críticos: {critical_count}\n"
            analysis += (
                f"• Valor total en riesgo: {format_currency(total_value_at_risk)}\n"
            )
            return analysis
        except Exception as e:
            return f"Error en análisis de stock bajo: {str(e)}"

    async def get_inventory_stats(self, db: Session) -> str:
        try:
            stats = db.execute(get_inventory_stats_query()).fetchone()
            categories = db.execute(get_top_categories_query()).fetchall()
            top_products = db.execute(get_top_products_query()).fetchall()
            analysis = f"""📊 **Estadísticas del Sistema SVT**
                🔢 **Números Generales:**
                • Total de productos: {stats.total_productos:,}
                • Total de unidades en stock: {stats.total_unidades:,}
                • Valor total del inventario: {format_currency(stats.valor_total_inventario)}
                • Precio promedio por producto: {format_currency(stats.precio_promedio)}
                • Categorías diferentes: {stats.total_categorias}
                • Proveedores activos: {stats.total_proveedores}
                • Productos con stock bajo: {stats.productos_stock_bajo} ⚠️
                🏷️ **Top Categorías:**
                """
            for cat in categories:
                analysis += f"• {cat.categoria}: {cat.cantidad_productos} productos "
                analysis += f"({cat.total_stock:,} unidades, {format_currency(cat.valor_categoria)})\n"
            analysis += "\n💎 **Productos Más Valiosos:**\n"
            for prod in top_products:
                analysis += f"• {prod.nombre}: {prod.stock_actual} × {format_currency(prod.precio_unitario)} = {format_currency(prod.valor_total)}\n"
            return analysis
        except Exception as e:
            return f"Error obteniendo estadísticas: {str(e)}"

    async def search_products(self, db: Session, query: str) -> str:
        try:
            sql = search_products_query()
            results = db.execute(sql, {"search": f"%{query}%"}).fetchall()
            if not results:
                return f"❌ No se encontraron productos que coincidan con '{query}'"
            response = f"🔍 **Resultados de búsqueda para '{query}'** ({len(results)} productos):\n\n"
            for row in results:
                stock_status = "🟢" if row.stock_actual > row.stock_minimo else "🔴"
                response += f"{stock_status} **{row.nombre}** (SKU: {row.sku})\n"
                response += f"   📦 Stock: {row.stock_actual} (mín: {row.stock_minimo}) | 💰 {format_currency(row.precio_unitario)}\n"
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
        try:
            query = get_supplier_analysis_query()
            results = db.execute(query).fetchall()
            if not results:
                return "📦 No se encontraron proveedores en el sistema."
            analysis = "🏭 **Análisis de Proveedores SVT:**\n\n"
            for row in results:
                analysis += f"**{row.nombre}** (Código: {row.codigo})\n"
                analysis += f"   📊 {row.total_productos} productos | Stock total: {row.total_stock:,} unidades\n"
                analysis += f"   💰 Precio promedio: {format_currency(row.precio_promedio)} | Valor total: {format_currency(row.valor_total)}\n"
                if row.contacto:
                    analysis += f"   👤 Contacto: {row.contacto}\n"
                if row.telefono:
                    analysis += f"   📞 Teléfono: {row.telefono}\n"
                if row.email:
                    analysis += f"   📧 Email: {row.email}\n"
                if row.direccion:
                    analysis += f"   📍 Dirección: {row.direccion}\n"
                analysis += "\n"
            total_suppliers = len(results)
            active_suppliers = len([r for r in results if r.total_productos > 0])
            analysis += f"📈 **Resumen:** {total_suppliers} proveedores registrados, {active_suppliers} activos\n"
            return analysis
        except Exception as e:
            return f"Error en análisis de proveedores: {str(e)}"

    async def get_product_by_sku(self, db: Session, sku: str) -> str:
        try:
            query = get_product_by_sku_query()
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
            info += f"💰 Precio unitario: {format_currency(result.precio_unitario)}\n"
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
            info += f"💎 Valor total en stock: {format_currency(valor_stock)}\n"
            return info
        except Exception as e:
            return f"Error obteniendo producto: {str(e)}"

    async def process_user_message(self, message: str, db: Session) -> str:
        try:
            message_lower = message.lower()
            context_data = ""
            if any(word in message_lower for word in ["sku", "código"]):
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
                context_data = await self.get_inventory_stats(db)
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
            response = await self.model.generate_content_async(full_prompt)
            return response.text
        except Exception as e:
            return f"❌ Lo siento, ocurrió un error procesando tu consulta: {str(e)}\n\nPor favor intenta reformular tu pregunta o contacta al administrador."


# Factory para FastAPI
async def get_ai_assistant():
    return InventoryAIAssistant()
