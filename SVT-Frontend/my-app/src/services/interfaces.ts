// interfaces.ts - Incluye todas las interfaces necesarias para la aplicación

// ---- INTERFACES PARA USUARIOS ----

// Respuesta de usuario desde el backend
export interface User {
    id: number;
    email: string;
    rol: string;
  }
  
  // Datos para crear un usuario
  export interface UserCreate {
    email: string;
    password: string;
  }
  
  // Datos para solicitar cambio de rol
  export interface RoleUpdateRequest {
    new_role: string;
  }
  
  // ---- INTERFACES PARA PROVEEDORES ----
  
  // Base para proveedores (campos comunes)
  export interface ProveedorBase {
    nombre: string;
    codigo: string;
    contacto?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
  }
  
  // Datos para crear un proveedor (igual que la base en este caso)
  export interface ProveedorCreate extends ProveedorBase {}
  
  // Datos para actualizar un proveedor (todos los campos son opcionales)
  export interface ProveedorUpdate {
    nombre?: string;
    codigo?: string;
    contacto?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
  }
  
  // Proveedor completo incluyendo ID (respuesta del backend)
  export interface Proveedor extends ProveedorBase {
    id: number;
  }
  
  // ---- INTERFACES PARA PRODUCTOS ----
  
  // Base para productos (campos comunes)
  export interface ProductoBase {
    sku: string;
    nombre: string;
    descripcion: string;
    categoria: string;
    precio_unitario: number;
    proveedor_id: number;
    stock_minimo: number;
  }
  
  // Datos para crear un producto (base + stock inicial)
  export interface ProductoCreate extends ProductoBase {
    stock_inicial: number;
  }
  
  // Datos para actualizar un producto (todos los campos son opcionales)
  export interface ProductoUpdate {
    nombre?: string;
    descripcion?: string;
    categoria?: string;
    precio_unitario?: number;
    proveedor_id?: number;
    stock_actual?: number;
    stock_minimo?: number;
  }
  
  // Producto completo incluyendo ID y campos adicionales (respuesta del backend)
  export interface Producto extends ProductoBase {
    id: number;
    stock_actual: number;
    fecha_creacion: string; // ISO string de datetime
    fecha_actualizacion: string; // ISO string de datetime
  }
  
  // Producto detallado con información del proveedor
  export interface ProductoDetalle extends Producto {
    proveedor?: Proveedor;
  }
  
  // ---- INTERFACES PARA AUTENTICACIÓN ----
  
  // Respuesta de autenticación
  export interface AuthResponse {
    access_token: string;
    token_type: string;
    user?: User;
  }
  
  // Credenciales de inicio de sesión
  export interface LoginCredentials {
    username: string;
    password: string;
  }
  
  // Datos para registrar un nuevo usuario
  export interface RegisterData {
    email: string;
    password: string;
    nombre?: string; // Opcional, aunque no es parte del modelo de backend
  }
  
  // ---- INTERFACES PARA MANEJO DE ERRORES ----
  
  // Error de validación (respuesta 422)
  export interface ValidationError {
    detail: Array<{
      loc: (string | number)[];
      msg: string;
      type: string;
    }>;
  }
  
  // ---- INTERFACES PARA ORDENES Y VENTAS (SI SE REQUIEREN) ----
  
  // Estas interfaces pueden ser añadidas aquí si tu aplicación tiene funcionalidades de órdenes o ventas
  
  // ---- OTRAS INTERFACES ESPECÍFICAS DE LA APLICACIÓN ----
  
  // Ejemplo: Opciones para filtrado de productos
  export interface ProductoFilterOptions {
    categoria?: string;
    precio_min?: number;
    precio_max?: number;
    en_stock?: boolean;
  }
  
  // Ejemplo: Estado de notificación
  export interface NotificationState {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
  }
  
// ---- INTERFACES PARA INVENTARIO ----

// Enums para tipos y motivos de movimiento
export enum TipoMovimiento {
  ENTRADA = "ENTRADA",
  SALIDA = "SALIDA",
  AJUSTE_POSITIVO = "AJUSTE_POSITIVO",
  AJUSTE_NEGATIVO = "AJUSTE_NEGATIVO",
  TRANSFERENCIA_ENTRADA = "TRANSFERENCIA_ENTRADA",
  TRANSFERENCIA_SALIDA = "TRANSFERENCIA_SALIDA",
  INVENTARIO_INICIAL = "INVENTARIO_INICIAL",
  INVENTARIO_FISICO = "INVENTARIO_FISICO"
}

export enum MotivoMovimiento {
  COMPRA = "COMPRA",
  VENTA = "VENTA",
  DEVOLUCION_CLIENTE = "DEVOLUCION_CLIENTE",
  DEVOLUCION_PROVEEDOR = "DEVOLUCION_PROVEEDOR",
  AJUSTE_STOCK = "AJUSTE_STOCK",
  CONTEO_FISICO = "CONTEO_FISICO",
  PRODUCTO_DANADO = "PRODUCTO_DANADO",
  PRODUCTO_VENCIDO = "PRODUCTO_VENCIDO",
  ERROR_SISTEMA = "ERROR_SISTEMA",
  ROBO_PERDIDA = "ROBO_PERDIDA",
  TRANSFERENCIA = "TRANSFERENCIA",
  OTRO = "OTRO"
}

// Interfaces para Bodega
export interface BodegaBase {
  nombre: string;
  codigo: string;
  direccion?: string;
  encargado?: string;
  telefono?: string;
  activa: boolean;
}

export interface BodegaCreate extends BodegaBase {}

export interface BodegaUpdate {
  nombre?: string;
  direccion?: string;
  encargado?: string;
  telefono?: string;
  activa?: boolean;
}

export interface Bodega extends BodegaBase {
  id: number;
  fecha_creacion: string;
}

// Interfaces para Stock por Bodega
export interface StockBodegaBase {
  producto_id: number;
  bodega_id: number;
  cantidad: number;
  ubicacion?: string;
}

export interface StockBodega extends StockBodegaBase {
  id: number;
  producto: Producto;
  bodega: Bodega;
}

// Interfaces para Movimientos de Inventario
export interface MovimientoInventarioBase {
  producto_id: number;
  tipo_movimiento: TipoMovimiento;
  cantidad: number;
  motivo: MotivoMovimiento;
  observaciones?: string;
  documento_referencia?: string;
}

export interface MovimientoInventarioCreate extends MovimientoInventarioBase {
  bodega_origen_id?: number;
  bodega_destino_id?: number;
}

export interface AjusteInventarioCreate {
  producto_id: number;
  bodega_id: number;
  cantidad: number; // Puede ser positivo o negativo
  motivo: MotivoMovimiento;
  observaciones?: string;
}

export interface TransferenciaInventarioCreate {
  producto_id: number;
  bodega_origen_id: number;
  bodega_destino_id: number;
  cantidad: number;
  observaciones?: string;
}

export interface InventarioFisicoItem {
  producto_id: number;
  bodega_id: number;
  cantidad_contada: number;
}

export interface InventarioFisicoCreate {
  items: InventarioFisicoItem[];
  observaciones?: string;
}

export interface MovimientoInventario extends MovimientoInventarioBase {
  id: number;
  usuario_id: number;
  fecha_movimiento: string;
  stock_anterior: number;
  stock_posterior: number;
  bodega_origen_id?: number;
  bodega_destino_id?: number;
  producto: Producto;
  usuario: User;
  bodega_origen?: Bodega;
  bodega_destino?: Bodega;
}

// Interfaces para reportes y consultas
export interface StockConsolidado {
  producto: Producto;
  stock_total: number;
  stock_por_bodega: StockBodega[];
  estado: "NORMAL" | "STOCK_BAJO" | "SIN_STOCK";
}

export interface KardexResponse {
  producto: Producto;
  movimientos: MovimientoInventario[];
  stock_actual: number;
}

export interface AlertaStock {
  producto: Producto;
  stock_actual: number;
  stock_minimo: number;
  porcentaje_alerta: number;
  bodega?: Bodega;
}

// Filtros para inventario
export interface InventarioFilterOptions {
  bodega_id?: number;
  categoria?: string;
  estado?: "NORMAL" | "STOCK_BAJO" | "SIN_STOCK";
  producto_id?: number;
}