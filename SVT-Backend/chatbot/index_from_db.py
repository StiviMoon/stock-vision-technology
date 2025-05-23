from chatbot.embed_and_store import index_text_document
from database import get_db
from models import Producto

def main():
    db = next(get_db())
    productos = db.query(Producto).all()

    for producto in productos:
        texto = f"""
        Sku ID: {producto.sku}
        Nombre: {producto.nombre}
        Descripción: {producto.descripcion}
        Categoría: {producto.categoria}
        Precio Unitario: {producto.precio_unitario}
        Stock Actual: {producto.stock_actual}
        Stock Mínimo: {producto.stock_minimo}
        Proveedor: {producto.proveedor.nombre if producto.proveedor else 'N/A'}
        """
        source_id = f"Producto-{producto.id}"
        print(f"Indexando {source_id}...")
        index_text_document(texto.strip(), source_id=source_id, db=db)

    db.close()
    print("✅ Todos los productos han sido indexados.")

if __name__ == "__main__":
    main()
