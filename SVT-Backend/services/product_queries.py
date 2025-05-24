from sqlalchemy import text


def get_products_query():
    return text(
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


def search_products_query():
    return text(
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


def get_low_stock_query():
    return text(
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


def get_low_stock_threshold_query():
    return text(
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


def get_inventory_stats_query():
    return text(
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


def get_top_categories_query():
    return text(
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


def get_top_products_query():
    return text(
        """
        SELECT nombre, stock_actual, precio_unitario,
               (stock_actual * precio_unitario) as valor_total
        FROM productos
        ORDER BY valor_total DESC
        LIMIT 5
    """
    )


def get_product_by_sku_query():
    return text(
        """
        SELECT p.*, prov.nombre as proveedor_nombre, prov.telefono as proveedor_telefono
        FROM productos p
        LEFT JOIN proveedores prov ON p.proveedor_id = prov.id
        WHERE LOWER(p.sku) = LOWER(:sku)
    """
    )
