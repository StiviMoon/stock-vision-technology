/**
 * Utilidad para generar códigos de proveedores
 */
export class CodigoGenerator {
    // Prefijos para diferentes tipos de proveedores (puedes personalizarlos según tu negocio)
    private static readonly PREFIXES: Record<string, string> = {
      MAYORISTA: "MAY",
      DISTRIBUIDOR: "DIST",
      FABRICANTE: "FAB",
      IMPORTADOR: "IMP",
      LOCAL: "LOC"
    };
  
    // Tipo de proveedor por defecto
    private static readonly DEFAULT_PREFIX = "PROV";
  
    /**
     * Genera un código único para un proveedor
     * @param nombre Nombre del proveedor
     * @param id ID del proveedor (opcional, para proveedores existentes)
     * @param tipoProveedor Tipo de proveedor (opcional)
     * @returns Código de proveedor generado
     */
    public static generateCodigo(
      nombre: string,
      id?: number,
      tipoProveedor?: keyof typeof CodigoGenerator.PREFIXES
    ): string {
      // 1. Obtener el prefijo (basado en el tipo de proveedor o usar el predeterminado)
      const prefix = tipoProveedor && this.PREFIXES[tipoProveedor]
        ? this.PREFIXES[tipoProveedor]
        : this.DEFAULT_PREFIX;
      
      // 2. Extraer iniciales del nombre (hasta 3 caracteres)
      const iniciales = this.extraerIniciales(nombre);
      
      // 3. Generar un número único (basado en el ID o en un timestamp)
      const uniqueNumber = id ? id.toString().padStart(4, '0') : this.generateUniqueNumber();
      
      // 4. Construir el código final
      return `${prefix}-${iniciales}-${uniqueNumber}`;
    }
    
    /**
     * Extrae las iniciales del nombre del proveedor
     * @param nombre Nombre completo del proveedor
     * @returns Iniciales (hasta 3 caracteres)
     */
    private static extraerIniciales(nombre: string): string {
      if (!nombre) return "XXX";
      
      // Dividir el nombre en palabras
      const palabras = nombre.toUpperCase().split(/\s+/);
      
      if (palabras.length === 1) {
        // Si solo hay una palabra, tomar hasta 3 primeras letras
        return palabras[0].substring(0, 3);
      } else {
        // Si hay múltiples palabras, tomar la primera letra de hasta 3 palabras
        return palabras
          .slice(0, 3)
          .map(palabra => palabra.charAt(0))
          .join('');
      }
    }
    
    /**
     * Genera un número único basado en el timestamp actual
     * @returns Número único como string formateado
     */
    private static generateUniqueNumber(): string {
      // Usar los últimos 4 dígitos del timestamp actual
      return (Date.now() % 10000).toString().padStart(4, '0');
    }
  }