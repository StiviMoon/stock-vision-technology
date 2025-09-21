// SKUGenerator.js
'use client';

/**
 * Generador de SKU simple basado en categoría y nombre del producto
 * Genera un código SKU único y limpio
 */
export class SKUGenerator {
  // Función para generar prefijo de categoría basado en el nombre
  static getCategoryPrefix(categoriaNombre) {
    if (!categoriaNombre) return 'OTRO';

    // Convertir a mayúsculas y tomar las primeras 4 letras
    const nombre = categoriaNombre.toUpperCase().replace(/[^A-Z]/g, '');
    return nombre.substring(0, 4).padEnd(4, 'X');
  }

  /**
   * Genera un SKU simple basado en categoría y nombre del producto
   * @param {Object} product - Objeto con las características del producto
   * @returns {String} - Código SKU generado
   */
  static generateSKU(product) {
    try {
      // Validar que exista la información mínima requerida
      if (!product || !product.categoria || !product.nombre) {
        throw new Error('Información insuficiente para generar SKU');
      }

      // 1. Obtener prefijo de categoría basado en el nombre real
      const categoryPrefix = this.getCategoryPrefix(product.categoria);

      // 2. Obtener iniciales del nombre del producto (máximo 3 caracteres)
      const nameCode = product.nombre
        .replace(/[^\w\s]/gi, '') // Eliminar caracteres especiales
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 3);

      // 3. Añadir un código numérico único
      const numericCode = product.id ?
        `-${product.id.toString().padStart(4, '0')}` :
        `-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      // 4. Combinar todo para formar el SKU
      const sku = `${categoryPrefix}-${nameCode}${numericCode}`;

      return sku;
    } catch (error) {
      console.error('Error al generar SKU:', error);
      // Fallback a un SKU genérico en caso de error
      return `PROD-${Date.now().toString().substring(7)}`;
    }
  }
}
