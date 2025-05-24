// UniversalSKUGenerator.js
'use client';

/**
 * Generador de SKU universal e inteligente para cualquier tipo de negocio
 * Se adapta automáticamente al tipo de producto y configuración del negocio
 */
export class UniversalSKUGenerator {
  
  // Configuraciones por tipo de negocio
  static BUSINESS_CONFIGS = {
    ELECTRONICS: {
      name: 'Electrónicos',
      categories: {
        SMARTPHONE: 'SPH',
        LAPTOP: 'LAP',
        TV: 'TV',
        AUDIO: 'AUD',
        GAMING: 'GAM',
        ACCESSORY: 'ACC'
      },
      attributes: ['marca', 'modelo', 'color', 'almacenamiento', 'pantalla'],
      required: ['categoria', 'marca']
    },
    CLOTHING: {
      name: 'Ropa y Moda',
      categories: {
        CAMISETAS: 'CAM',
        PANTALONES: 'PAN',
        VESTIDOS: 'VES',
        ZAPATOS: 'ZAP',
        ACCESORIOS: 'ACC'
      },
      attributes: ['marca', 'color', 'talla', 'material', 'genero'],
      required: ['categoria', 'talla']
    },
    FOOD: {
      name: 'Alimentos y Bebidas',
      categories: {
        BEBIDAS: 'BEB',
        LACTEOS: 'LAC',
        CARNES: 'CAR',
        FRUTAS: 'FRU',
        GRANOS: 'GRA',
        DULCES: 'DUL'
      },
      attributes: ['marca', 'peso', 'presentacion', 'tipo'],
      required: ['categoria', 'presentacion']
    },
    AUTOMOTIVE: {
      name: 'Automotriz',
      categories: {
        LLANTAS: 'LLA',
        ACEITES: 'ACE',
        FRENOS: 'FRE',
        MOTOR: 'MOT',
        CARROCERIA: 'CAR',
        ACCESORIOS: 'ACC'
      },
      attributes: ['marca', 'modelo_vehiculo', 'año', 'tipo'],
      required: ['categoria', 'marca']
    },
    BEAUTY: {
      name: 'Belleza y Cuidado Personal',
      categories: {
        MAQUILLAJE: 'MAQ',
        CUIDADO_PIEL: 'PIE',
        CABELLO: 'CAB',
        PERFUMES: 'PER',
        CUIDADO_CORPORAL: 'COR'
      },
      attributes: ['marca', 'tipo', 'tono', 'presentacion'],
      required: ['categoria', 'marca']
    },
    BOOKS: {
      name: 'Libros y Papelería',
      categories: {
        LIBROS: 'LIB',
        CUADERNOS: 'CUA',
        ESCRITURA: 'ESC',
        ARTE: 'ART',
        OFICINA: 'OFI'
      },
      attributes: ['autor', 'editorial', 'genero', 'idioma'],
      required: ['categoria']
    },
    FURNITURE: {
      name: 'Muebles y Hogar',
      categories: {
        SALA: 'SAL',
        DORMITORIO: 'DOR',
        COCINA: 'COC',
        OFICINA: 'OFI',
        JARDIN: 'JAR',
        DECORACION: 'DEC'
      },
      attributes: ['material', 'color', 'dimensiones', 'estilo'],
      required: ['categoria', 'material']
    },
    SPORTS: {
      name: 'Deportes y Fitness',
      categories: {
        CALZADO_DEPORTIVO: 'CAL',
        ROPA_DEPORTIVA: 'ROP',
        EQUIPOS: 'EQU',
        SUPLEMENTOS: 'SUP',
        ACCESORIOS: 'ACC'
      },
      attributes: ['marca', 'deporte', 'talla', 'genero'],
      required: ['categoria', 'deporte']
    },
    GENERIC: {
      name: 'Genérico',
      categories: {
        PRODUCTO: 'PRO',
        SERVICIO: 'SER',
        MATERIAL: 'MAT',
        HERRAMIENTA: 'HER',
        OTROS: 'OTR'
      },
      attributes: ['marca', 'tipo', 'color', 'tamaño'],
      required: ['categoria']
    }
  };

  // Códigos de atributos universales
  static UNIVERSAL_ATTRIBUTES = {
    // Colores universales
    colors: {
      BLANCO: 'BL', NEGRO: 'NG', ROJO: 'RJ', AZUL: 'AZ', VERDE: 'VD',
      AMARILLO: 'AM', GRIS: 'GR', MARRON: 'MR', ROSA: 'RS', MORADO: 'MP',
      NARANJA: 'NA', DORADO: 'DO', PLATEADO: 'PL', TRANSPARENTE: 'TR'
    },
    
    // Tallas/Tamaños universales
    sizes: {
      XXS: 'XXS', XS: 'XS', S: 'S', M: 'M', L: 'L', XL: 'XL', XXL: 'XXL',
      PEQUEÑO: 'P', MEDIANO: 'M', GRANDE: 'G', EXTRA_GRANDE: 'XG',
      UNICO: 'U'
    },
    
    // Materiales comunes
    materials: {
      ALGODON: 'ALG', POLIESTER: 'POL', CUERO: 'CUE', METAL: 'MET',
      MADERA: 'MAD', PLASTICO: 'PLA', VIDRIO: 'VID', CERAMICA: 'CER'
    },
    
    // Presentaciones/Formatos
    presentations: {
      UNIDAD: 'UNI', CAJA: 'CAJ', PAQUETE: 'PAQ', BOTELLA: 'BOT',
      LATA: 'LAT', BOLSA: 'BOL', TUBO: 'TUB', FRASCO: 'FRA'
    }
  };

  /**
   * Detecta automáticamente el tipo de negocio basado en las categorías más usadas
   * @param {Array} products - Array de productos existentes
   * @returns {String} - Tipo de negocio detectado
   */
  static detectBusinessType(products = []) {
    if (!products.length) return 'GENERIC';
    
    const categoryCount = {};
    
    // Contar categorías por tipo de negocio
    Object.entries(this.BUSINESS_CONFIGS).forEach(([businessType, config]) => {
      categoryCount[businessType] = 0;
      
      products.forEach(product => {
        if (product.categoria && config.categories[product.categoria.toUpperCase()]) {
          categoryCount[businessType]++;
        }
      });
    });
    
    // Retornar el tipo con más coincidencias
    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0][0] || 'GENERIC';
  }

  /**
   * Genera un SKU inteligente basado en el tipo de negocio y producto
   * @param {Object} product - Datos del producto
   * @param {String} businessType - Tipo de negocio (opcional, se detecta automáticamente)
   * @returns {String} - SKU generado
   */
  static generateSKU(product, businessType = null) {
    try {
      // Validación básica
      if (!product || !product.categoria) {
        throw new Error('Categoría del producto es requerida');
      }

      // Detectar tipo de negocio si no se proporciona
      if (!businessType) {
        businessType = this.detectBusinessTypeFromProduct(product);
      }

      const config = this.BUSINESS_CONFIGS[businessType] || this.BUSINESS_CONFIGS.GENERIC;
      const parts = [];

      // 1. Prefijo de categoría
      const categoryCode = config.categories[product.categoria.toUpperCase()] || 
                          this.generateCategoryCode(product.categoria);
      parts.push(categoryCode);

      // 2. Agregar atributos según configuración del negocio
      config.attributes.forEach(attr => {
        if (product[attr]) {
          const code = this.generateAttributeCode(attr, product[attr]);
          if (code) parts.push(code);
        }
      });

      // 3. Código único
      const uniqueCode = this.generateUniqueCode(product);
      parts.push(uniqueCode);

      // Unir con guiones y limitar longitud
      let sku = parts.join('-');
      
      // Asegurar que el SKU no sea demasiado largo
      if (sku.length > 25) {
        sku = this.shortenSKU(sku, parts);
      }

      return sku.toUpperCase();

    } catch (error) {
      console.error('Error generando SKU:', error.message);
      return this.generateFallbackSKU(product);
    }
  }

  /**
   * Detecta el tipo de negocio basado en un solo producto
   * @param {Object} product - Producto
   * @returns {String} - Tipo de negocio
   */
  static detectBusinessTypeFromProduct(product) {
    const categoria = product.categoria?.toUpperCase();
    
    // Buscar en qué configuración de negocio está la categoría
    for (const [businessType, config] of Object.entries(this.BUSINESS_CONFIGS)) {
      if (config.categories[categoria]) {
        return businessType;
      }
    }
    
    return 'GENERIC';
  }

  /**
   * Genera código de categoría dinámicamente
   * @param {String} categoria - Nombre de la categoría
   * @returns {String} - Código de categoría
   */
  static generateCategoryCode(categoria) {
    return categoria
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .map(word => word.substring(0, 2))
      .join('')
      .substring(0, 3)
      .toUpperCase();
  }

  /**
   * Genera código de atributo inteligentemente
   * @param {String} attributeName - Nombre del atributo
   * @param {String} attributeValue - Valor del atributo
   * @returns {String} - Código del atributo
   */
  static generateAttributeCode(attributeName, attributeValue) {
    const value = attributeValue.toString().toUpperCase();
    
    // Buscar en códigos universales primero
    if (attributeName === 'color' && this.UNIVERSAL_ATTRIBUTES.colors[value]) {
      return this.UNIVERSAL_ATTRIBUTES.colors[value];
    }
    
    if ((attributeName === 'talla' || attributeName === 'tamaño') && this.UNIVERSAL_ATTRIBUTES.sizes[value]) {
      return this.UNIVERSAL_ATTRIBUTES.sizes[value];
    }
    
    if (attributeName === 'material' && this.UNIVERSAL_ATTRIBUTES.materials[value]) {
      return this.UNIVERSAL_ATTRIBUTES.materials[value];
    }
    
    if (attributeName === 'presentacion' && this.UNIVERSAL_ATTRIBUTES.presentations[value]) {
      return this.UNIVERSAL_ATTRIBUTES.presentations[value];
    }
    
    // Para otros atributos, generar código inteligentemente
    if (attributeName === 'marca') {
      return value.substring(0, 3);
    }
    
    // Para números (peso, dimensiones, etc.)
    if (/^\d+/.test(value)) {
      return value.replace(/[^\d]/g, '').substring(0, 3);
    }
    
    // Para texto general, tomar iniciales
    return value
      .split(/\s+/)
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2);
  }

  /**
   * Genera código único para el producto
   * @param {Object} product - Producto
   * @returns {String} - Código único
   */
  static generateUniqueCode(product) {
    if (product.id) {
      return product.id.toString().padStart(4, '0');
    }
    
    if (product.codigo_interno) {
      return product.codigo_interno.toString().substring(0, 4).padStart(4, '0');
    }
    
    // Generar basado en timestamp o hash del nombre
    const timestamp = Date.now().toString();
    return timestamp.slice(-4);
  }

  /**
   * Acorta un SKU si es demasiado largo
   * @param {String} sku - SKU original
   * @param {Array} parts - Partes del SKU
   * @returns {String} - SKU acortado
   */
  static shortenSKU(sku, parts) {
    // Estrategia: mantener categoría y código único, acortar atributos
    if (parts.length <= 2) return sku;
    
    const category = parts[0];
    const uniqueCode = parts[parts.length - 1];
    const attributes = parts.slice(1, -1);
    
    // Tomar solo los 2 atributos más importantes
    const shortAttributes = attributes.slice(0, 2);
    
    return [category, ...shortAttributes, uniqueCode].join('-');
  }

  /**
   * Genera SKU de respaldo en caso de error
   * @param {Object} product - Producto
   * @returns {String} - SKU de respaldo
   */
  static generateFallbackSKU(product) {
    const prefix = product.categoria ? 
      this.generateCategoryCode(product.categoria) : 'PRO';
    const suffix = Date.now().toString().slice(-6);
    return `${prefix}-${suffix}`;
  }

  /**
   * Valida si un SKU es válido
   * @param {String} sku - SKU a validar
   * @returns {Boolean} - true si es válido
   */
  static validateSKU(sku) {
    if (!sku || typeof sku !== 'string') return false;
    
    // Patrón: letras, números y guiones, longitud razonable
    const pattern = /^[A-Z0-9-]+$/;
    return pattern.test(sku) && 
           sku.length >= 3 && 
           sku.length <= 25 && 
           !sku.startsWith('-') && 
           !sku.endsWith('-');
  }

  /**
   * Obtiene configuración para un tipo de negocio
   * @param {String} businessType - Tipo de negocio
   * @returns {Object} - Configuración del negocio
   */
  static getBusinessConfig(businessType) {
    return this.BUSINESS_CONFIGS[businessType] || this.BUSINESS_CONFIGS.GENERIC;
  }

  /**
   * Obtiene todas las configuraciones de negocio disponibles
   * @returns {Object} - Todas las configuraciones
   */
  static getAllBusinessTypes() {
    return Object.entries(this.BUSINESS_CONFIGS).map(([key, config]) => ({
      value: key,
      label: config.name,
      categories: Object.keys(config.categories),
      attributes: config.attributes
    }));
  }

  /**
   * Genera múltiples variantes de un producto
   * @param {Object} baseProduct - Producto base
   * @param {Array} variants - Variantes (color, talla, etc.)
   * @param {String} businessType - Tipo de negocio
   * @returns {Array} - Array de SKUs y variantes
   */
  static generateVariantSKUs(baseProduct, variants = [], businessType = null) {
    if (!variants.length) {
      return [{
        sku: this.generateSKU(baseProduct, businessType),
        variant: {},
        description: baseProduct.nombre || 'Producto'
      }];
    }

    return variants.map((variant, index) => {
      const productVariant = { ...baseProduct, ...variant, id: (baseProduct.id || 0) + index };
      const sku = this.generateSKU(productVariant, businessType);
      
      return {
        sku,
        variant,
        description: this.generateVariantDescription(baseProduct, variant)
      };
    });
  }

  /**
   * Genera descripción para una variante
   * @param {Object} baseProduct - Producto base
   * @param {Object} variant - Variante
   * @returns {String} - Descripción
   */
  static generateVariantDescription(baseProduct, variant) {
    const parts = [baseProduct.nombre || 'Producto'];
    
    Object.entries(variant).forEach(([key, value]) => {
      if (value && key !== 'id') {
        parts.push(value.toString());
      }
    });
    
    return parts.join(' ');
  }
}
