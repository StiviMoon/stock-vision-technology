import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Importamos todas las interfaces
import {
  User,
  UserCreate,
  RoleUpdateRequest,
  RegisterData,
  Proveedor,
  ProveedorBase,
  ProveedorCreate,
  ProveedorUpdate,
  ProductoBase,
  Producto,
  ProductoCreate,
  ProductoUpdate,
  ProductoDetalle,
  AuthResponse,
  LoginCredentials,
  ValidationError,
  ProductoFilterOptions,
  NotificationState
} from './interfaces'; // Asegúrate de que la ruta sea correcta

// ---- CONFIGURACIÓN DE LA API ----

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Crear instancia de axios con configuración base
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token de autenticación a las solicitudes
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ValidationError>) => {
    // Si el error es 401 (No autorizado), limpiar el almacenamiento local
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('token_type');
      window.location.href = '/login';
    }
    
    // Formatear errores de validación
    if (error.response && error.response.status === 422) {
      console.error('Error de validación:', error.response.data.detail);
    }
    
    return Promise.reject(error);
  }
);

// ---- SERVICIOS DE LA API ----

// Servicio de autenticación
export const authService = {
  // Login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    formData.append('grant_type', 'password');
    
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      // Guardar token en localStorage
      if (typeof window !== 'undefined' && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('token_type', response.data.token_type);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Registro
  register: async (userData: RegisterData): Promise<User> => {
    try {
      const response = await api.post<User>('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Obtener perfil de usuario
  getUserProfile: async (): Promise<User> => {
    try {
      const response = await api.get<User>('/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Cerrar sesión
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('token_type');
      window.location.href = '/login';
    }
  }
};

// Servicio de usuarios (para operaciones CRUD)
export const userService = {
  // Obtener todos los usuarios (solo para administradores)
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get<User[]>('/users/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Obtener un usuario por ID
  getUserById: async (userId: number): Promise<User> => {
    try {
      const response = await api.get<User>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Actualizar rol de usuario (solo para administradores)
  updateUserRole: async (userId: number, newRole: string): Promise<User> => {
    try {
      const response = await api.put<User>(`/users/${userId}/role`, { 
        new_role: newRole 
      } as RoleUpdateRequest);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Eliminar usuario (solo para administradores)
  deleteUser: async (userId: number): Promise<void> => {
    try {
      await api.delete(`/users/${userId}`);
    } catch (error) {
      throw error;
    }
  }
};

// Servicio de productos
export const productoService = {
  // Crear un nuevo producto
  createProducto: async (productoData: ProductoCreate): Promise<Producto> => {
    try {
      const response = await api.post<Producto>('/productos/', productoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Obtener todos los productos con filtros opcionales
  getProductos: async (filtros: ProductoFilterOptions = {}): Promise<Producto[]> => {
    try {
      const response = await api.get<Producto[]>('/productos/', { params: filtros });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Obtener un producto por ID
  getProducto: async (productoId: number): Promise<ProductoDetalle> => {
    try {
      const response = await api.get<ProductoDetalle>(`/productos/${productoId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Obtener productos por categoría
  getProductosByCategoria: async (categoria: string): Promise<Producto[]> => {
    try {
      const response = await api.get<Producto[]>('/productos/', { 
        params: { categoria } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Actualizar un producto existente
  updateProducto: async (productoId: number, productoData: ProductoUpdate): Promise<Producto> => {
    try {
      const response = await api.put<Producto>(`/productos/${productoId}`, productoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Eliminar un producto
  deleteProducto: async (productoId: number): Promise<void> => {
    try {
      await api.delete(`/productos/${productoId}`);
    } catch (error) {
      throw error;
    }
  }
};

// Servicio de proveedores
export const proveedorService = {
  // Crear un nuevo proveedor
  createProveedor: async (proveedorData: ProveedorCreate): Promise<Proveedor> => {
    try {
      const response = await api.post<Proveedor>('/proveedores/', proveedorData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Obtener todos los proveedores con búsqueda opcional
  getProveedores: async (params: Record<string, any> = {}): Promise<Proveedor[]> => {
    try {
      const response = await api.get<Proveedor[]>('/proveedores/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Buscar proveedores por nombre
  searchProveedoresByNombre: async (nombre: string): Promise<Proveedor[]> => {
    try {
      const response = await api.get<Proveedor[]>('/proveedores/', { 
        params: { nombre } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Obtener un proveedor por ID
  getProveedor: async (proveedorId: number): Promise<Proveedor> => {
    try {
      const response = await api.get<Proveedor>(`/proveedores/${proveedorId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Actualizar un proveedor existente
  updateProveedor: async (proveedorId: number, proveedorData: ProveedorUpdate): Promise<Proveedor> => {
    try {
      const response = await api.put<Proveedor>(`/proveedores/${proveedorId}`, proveedorData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Eliminar un proveedor
  deleteProveedor: async (proveedorId: number): Promise<void> => {
    try {
      await api.delete(`/proveedores/${proveedorId}`);
    } catch (error) {
      throw error;
    }
  }
};

// Exportar la instancia de API y los tipos para uso en la aplicación
export type { 
  User, 
  UserCreate,
  RegisterData,
  RoleUpdateRequest,
  ProveedorBase,
  Proveedor, 
  ProveedorCreate, 
  ProveedorUpdate,
  ProductoBase,
  Producto, 
  ProductoCreate, 
  ProductoUpdate,
  ProductoDetalle,
  AuthResponse,
  LoginCredentials,
  ValidationError,
  ProductoFilterOptions,
  NotificationState
};

export default api;