// config/motivosMovimiento.ts

export enum MotivoMovimiento {
  // Movimientos de entrada
  COMPRA = 'COMPRA',
  DEVOLUCION_CLIENTE = 'DEVOLUCION_CLIENTE',
  AJUSTE_POSITIVO = 'AJUSTE_POSITIVO',
  TRANSFERENCIA_ENTRADA = 'TRANSFERENCIA_ENTRADA',
  INVENTARIO_INICIAL = 'INVENTARIO_INICIAL',

  // Movimientos de salida
  VENTA = 'VENTA',
  DEVOLUCION_PROVEEDOR = 'DEVOLUCION_PROVEEDOR',
  AJUSTE_NEGATIVO = 'AJUSTE_NEGATIVO',
  TRANSFERENCIA_SALIDA = 'TRANSFERENCIA_SALIDA',

  // Ajustes y control
  AJUSTE_STOCK = 'AJUSTE_STOCK',
  CONTEO_FISICO = 'CONTEO_FISICO',
  PRODUCTO_DANADO = 'PRODUCTO_DANADO',
  PRODUCTO_VENCIDO = 'PRODUCTO_VENCIDO',
  ERROR_SISTEMA = 'ERROR_SISTEMA',
  ROBO_PERDIDA = 'ROBO_PERDIDA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  INVENTARIO_FISICO = 'INVENTARIO_FISICO',
  OTRO = 'OTRO'
}

export interface MotivoConfig {
  value: MotivoMovimiento;
  label: string;
  categoria: 'entrada' | 'salida' | 'ajuste' | 'control';
  descripcion?: string;
}

export const MOTIVOS_MOVIMIENTO: MotivoConfig[] = [
  // Entradas
  {
    value: MotivoMovimiento.COMPRA,
    label: 'Compra',
    categoria: 'entrada',
    descripcion: 'Ingreso de mercancía por compra a proveedores'
  },
  {
    value: MotivoMovimiento.DEVOLUCION_CLIENTE,
    label: 'Devolución Cliente',
    categoria: 'entrada',
    descripcion: 'Devolución de productos por parte del cliente'
  },
  {
    value: MotivoMovimiento.AJUSTE_POSITIVO,
    label: 'Ajuste Positivo',
    categoria: 'entrada',
    descripcion: 'Ajuste que incrementa el stock'
  },
  {
    value: MotivoMovimiento.TRANSFERENCIA_ENTRADA,
    label: 'Transferencia Entrada',
    categoria: 'entrada',
    descripcion: 'Ingreso por transferencia desde otra bodega'
  },
  {
    value: MotivoMovimiento.INVENTARIO_INICIAL,
    label: 'Inventario Inicial',
    categoria: 'entrada',
    descripcion: 'Stock inicial al configurar el sistema'
  },

  // Salidas
  {
    value: MotivoMovimiento.VENTA,
    label: 'Venta',
    categoria: 'salida',
    descripcion: 'Salida de mercancía por venta a clientes'
  },
  {
    value: MotivoMovimiento.DEVOLUCION_PROVEEDOR,
    label: 'Devolución Proveedor',
    categoria: 'salida',
    descripcion: 'Devolución de productos al proveedor'
  },
  {
    value: MotivoMovimiento.AJUSTE_NEGATIVO,
    label: 'Ajuste Negativo',
    categoria: 'salida',
    descripcion: 'Ajuste que disminuye el stock'
  },
  {
    value: MotivoMovimiento.TRANSFERENCIA_SALIDA,
    label: 'Transferencia Salida',
    categoria: 'salida',
    descripcion: 'Salida por transferencia a otra bodega'
  },

  // Ajustes y control
  {
    value: MotivoMovimiento.AJUSTE_STOCK,
    label: 'Ajuste de Stock',
    categoria: 'ajuste',
    descripcion: 'Ajuste general de inventario'
  },
  {
    value: MotivoMovimiento.CONTEO_FISICO,
    label: 'Conteo Físico',
    categoria: 'control',
    descripcion: 'Ajuste basado en conteo físico del inventario'
  },
  {
    value: MotivoMovimiento.PRODUCTO_DANADO,
    label: 'Producto Dañado',
    categoria: 'salida',
    descripcion: 'Salida por producto dañado o defectuoso'
  },
  {
    value: MotivoMovimiento.PRODUCTO_VENCIDO,
    label: 'Producto Vencido',
    categoria: 'salida',
    descripcion: 'Salida por producto vencido'
  },
  {
    value: MotivoMovimiento.ERROR_SISTEMA,
    label: 'Error Sistema',
    categoria: 'ajuste',
    descripcion: 'Corrección de error en el sistema'
  },
  {
    value: MotivoMovimiento.ROBO_PERDIDA,
    label: 'Robo/Pérdida',
    categoria: 'salida',
    descripcion: 'Salida por robo o pérdida de mercancía'
  },
  {
    value: MotivoMovimiento.TRANSFERENCIA,
    label: 'Transferencia',
    categoria: 'ajuste',
    descripcion: 'Transferencia entre bodegas'
  },
  {
    value: MotivoMovimiento.INVENTARIO_FISICO,
    label: 'Inventario Físico',
    categoria: 'control',
    descripcion: 'Ajuste por inventario físico'
  },
  {
    value: MotivoMovimiento.OTRO,
    label: 'Otro',
    categoria: 'ajuste',
    descripcion: 'Otro tipo de movimiento'
  }
];

// Función helper para obtener la configuración de un motivo
export const getMotivoConfig = (motivo: string): MotivoConfig | null => {
  return MOTIVOS_MOVIMIENTO.find(m => m.value === motivo) || null;
};

// Función helper para obtener el label de un motivo
export const getMotivoLabel = (motivo: string): string => {
  const config = getMotivoConfig(motivo);
  return config?.label || motivo;
};

// Función helper para obtener motivos por categoría
export const getMotivosPorCategoria = (categoria: 'entrada' | 'salida' | 'ajuste' | 'control'): MotivoConfig[] => {
  return MOTIVOS_MOVIMIENTO.filter(m => m.categoria === categoria);
};

// Función helper para obtener motivos de ajuste (para el modal)
export const getMotivosAjuste = (): MotivoConfig[] => {
  return MOTIVOS_MOVIMIENTO.filter(m =>
    ['ajuste', 'control'].includes(m.categoria) ||
    m.value === MotivoMovimiento.PRODUCTO_DANADO ||
    m.value === MotivoMovimiento.PRODUCTO_VENCIDO ||
    m.value === MotivoMovimiento.ROBO_PERDIDA
  );
};
