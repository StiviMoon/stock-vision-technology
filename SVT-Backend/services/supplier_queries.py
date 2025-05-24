from sqlalchemy import text


def get_supplier_analysis_query():
    return text(
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
