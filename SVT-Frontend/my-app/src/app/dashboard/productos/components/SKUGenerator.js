// SKUGenerator.js
'use client';

/**
 * Generador de SKU basado en atributos del producto
 * Genera un código SKU único basado en las características y categoría del producto
 */
export class SKUGenerator {
  // Prefijos para categorías principales
  static CATEGORY_PREFIXES = {
    ELECTRONICA: 'ELEC',
    ROPA: 'ROPA',
    CALZADO: 'CALZ',
    HOGAR: 'HOGR',
    MUEBLES: 'MUEB',
    BELLEZA: 'BELL',
    ALIMENTOS: 'ALIM',
    JUGUETES: 'JUGT',
    DEPORTES: 'DEPO',
    HERRAMIENTAS: 'HERR',
    LIBROS: 'LIBR',
    AUTOMOTRIZ: 'AUTO',
    OTROS: 'OTRO'
  };

  // Códigos para subcategorías (ejemplos)
  static SUBCATEGORY_CODES = {
    // Electrónica
    CELULARES: 'CEL',
    COMPUTADORAS: 'COM',
    TABLETS: 'TAB',
    AUDIO: 'AUD',
    TELEVISORES: 'TV',
    
    // Ropa
    CAMISETAS: 'CAM',
    PANTALONES: 'PAN',
    VESTIDOS: 'VES',
    ABRIGOS: 'ABR',
    ROPA_INTERIOR: 'INT',
    
    // Calzado
    ZAPATOS: 'ZAP',
    DEPORTIVOS: 'DEP',
    BOTAS: 'BOT',
    SANDALIAS: 'SAN',
    
    // Otros
    COCINA: 'COC',
    BAÑO: 'BAN',
    JARDIN: 'JAR',
    LIMPIEZA: 'LIM',
  };

  // Códigos de atributos (ejemplos)
  static ATTRIBUTE_CODES = {
    // Colores
    BLANCO: 'BL',
    NEGRO: 'NG',
    ROJO: 'RJ',
    AZUL: 'AZ',
    VERDE: 'VD',
    AMARILLO: 'AM',
    GRIS: 'GR',
    MARRON: 'MR',
    ROSA: 'RS',
    MORADO: 'MP',
    
    // Tamaños
    PEQUENO: 'P',
    MEDIANO: 'M',
    GRANDE: 'G',
    EXTRA_GRANDE: 'XG',
  };

  /**
   * Genera un SKU basado en las características del producto
   * @param {Object} product - Objeto con las características del producto
   * @returns {String} - Código SKU generado
   */
  static generateSKU(product) {
    try {
      // Validar que exista la información mínima requerida
      if (!product || !product.categoria || !product.nombre) {
        throw new Error('Información insuficiente para generar SKU');
      }
      
      // 1. Obtener prefijo de categoría principal (o usar 'OTRO' si no existe)
      const categoryPrefix = this.CATEGORY_PREFIXES[product.categoria.toUpperCase()] || 
        this.CATEGORY_PREFIXES.OTROS;
      
      // 2. Obtener código de subcategoría si existe
      let subcategoryCode = '';
      if (product.subcategoria && this.SUBCATEGORY_CODES[product.subcategoria.toUpperCase()]) {
        subcategoryCode = `-${this.SUBCATEGORY_CODES[product.subcategoria.toUpperCase()]}`;
      }
      
      // 3. Obtener iniciales del nombre del producto (máximo 3 caracteres)
      const nameCode = product.nombre
        .replace(/[^\w\s]/gi, '') // Eliminar caracteres especiales
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 3);
      
      // 4. Obtener códigos de atributos importantes
      let attributeCodes = '';
      
      // Color (si existe)
      if (product.color && this.ATTRIBUTE_CODES[product.color.toUpperCase()]) {
        attributeCodes += this.ATTRIBUTE_CODES[product.color.toUpperCase()];
      }
      
      // Tamaño/Talla (si existe)
      if (product.tamaño && this.ATTRIBUTE_CODES[product.tamaño.toUpperCase()]) {
        attributeCodes += this.ATTRIBUTE_CODES[product.tamaño.toUpperCase()];
      }
      
      // Si hay atributos, añadir guion
      if (attributeCodes) {
        attributeCodes = `-${attributeCodes}`;
      }
      
      // 5. Añadir un código numérico único
      const numericCode = product.id ? 
        `-${product.id.toString().padStart(4, '0')}` : 
        `-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // 6. Combinar todo para formar el SKU
      const sku = `${categoryPrefix}${subcategoryCode}-${nameCode}${attributeCodes}${numericCode}`;
      
      return sku;
    } catch (error) {
      console.error('Error al generar SKU:', error);
      // Fallback a un SKU genérico en caso de error
      return `PROD-${Date.now().toString().substring(7)}`;
    }
  }
}