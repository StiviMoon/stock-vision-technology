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
  
  // Añade otras interfaces según sea necesario para tu aplicación