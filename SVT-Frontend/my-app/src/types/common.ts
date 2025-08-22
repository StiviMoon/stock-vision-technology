// Tipos básicos
export interface BaseEntity {
  id: number;
  created_at?: string;
  updated_at?: string;
}

// Tipos de usuario
export interface User extends BaseEntity {
  email: string;
  rol: UserRole;
  nombre?: string;
  apellido?: string;
  activo: boolean;
  ultimo_acceso?: string;
}

export type UserRole = 'admin' | 'usuario' | 'supervisor' | 'bodeguero';

// Tipos de producto
export interface Producto extends BaseEntity {
  nombre: string;
  descripcion?: string;
  sku: string;
  categoria: string;
  precio_unitario: number;
  stock_minimo: number;
  stock_actual: number;
  unidad_medida: string;
  proveedor_id?: number;
  activo: boolean;
  imagen_url?: string;
}

export interface ProductoFormData {
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio_unitario: number;
  stock_minimo: number;
  unidad_medida: string;
  proveedor_id?: number;
}

// Tipos de inventario
export interface Inventario extends BaseEntity {
  producto_id: number;
  bodega_id: number;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo?: number;
  ubicacion?: string;
  ultima_actualizacion: string;
}

export interface MovimientoInventario extends BaseEntity {
  producto_id: number;
  bodega_id: number;
  tipo_movimiento: TipoMovimiento;
  cantidad: number;
  motivo: string;
  usuario_id: number;
  fecha_movimiento: string;
  referencia?: string;
}

export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste' | 'transferencia';

export interface KardexEntry extends BaseEntity {
  producto_id: number;
  bodega_id: number;
  tipo_movimiento: TipoMovimiento;
  cantidad: number;
  saldo_anterior: number;
  saldo_actual: number;
  motivo: string;
  usuario_id: number;
  fecha_movimiento: string;
  referencia?: string;
}

// Tipos de bodega
export interface Bodega extends BaseEntity {
  nombre: string;
  descripcion?: string;
  ubicacion: string;
  capacidad_maxima?: number;
  activa: boolean;
  responsable_id?: number;
}

// Tipos de proveedor
export interface Proveedor extends BaseEntity {
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto_principal: string;
  activo: boolean;
  categoria?: string;
}

export interface ProveedorFormData {
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto_principal: string;
  categoria?: string;
}

// Tipos de chat
export interface ChatMessage extends BaseEntity {
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  isRead: boolean;
  metadata?: Record<string, any>;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  unreadCount: number;
  quickActions: QuickAction[];
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  action: string;
  icon?: string;
}

// Tipos de paginación
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
}

// Tipos de filtros
export interface FilterState {
  searchTerm: string;
  selectedCategories: string[];
  selectedStatus: string[];
  selectedBodegas: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// Tipos de respuesta de API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

// Tipos de formularios
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Tipos de notificaciones
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Tipos de tema
export interface Theme {
  name: string;
  label: string;
  value: 'light' | 'dark' | 'system';
}

// Tipos de configuración
export interface AppConfig {
  theme: Theme;
  language: string;
  notifications: boolean;
  autoSave: boolean;
  compactMode: boolean;
}

// Tipos de estadísticas
export interface InventoryStats {
  totalProductos: number;
  productosBajoStock: number;
  productosSinStock: number;
  valorTotalInventario: number;
  movimientosHoy: number;
  alertasActivas: number;
}

export interface DashboardStats {
  inventario: InventoryStats;
  usuarios: {
    total: number;
    activos: number;
    nuevosEsteMes: number;
  };
  proveedores: {
    total: number;
    activos: number;
  };
  actividad: {
    movimientosHoy: number;
    productosModificados: number;
    alertasGeneradas: number;
  };
}

// Tipos de eventos
export interface AppEvent {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  userId?: number;
}

// Tipos de auditoría
export interface AuditLog extends BaseEntity {
  user_id: number;
  action: string;
  resource_type: string;
  resource_id: number;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

// Tipos de exportación
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeHeaders: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: FilterState;
}

// Tipos de importación
export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  warnings: string[];
}

// Tipos de validación
export interface ValidationRule {
  field: string;
  rule: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}
