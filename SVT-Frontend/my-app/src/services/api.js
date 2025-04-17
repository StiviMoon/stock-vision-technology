// services/api.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token de autenticación a las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401 (No autorizado), limpiar el almacenamiento local
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('token_type');
      // Redirección a login podría hacerse aquí
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicio de autenticación
export const authService = {
  // Login
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Registro
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Obtener perfil de usuario
  getUserProfile: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Servicio de usuarios (para operaciones CRUD)
export const userService = {
  // Obtener todos los usuarios (solo para administradores)
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Obtener un usuario por ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Actualizar rol de usuario (solo para administradores)
  updateUserRole: async (userId, newRole) => {
    try {
      const response = await api.put(`/users/${userId}/role`, { new_role: newRole });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Eliminar usuario (solo para administradores)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Servicio de productos
export const productoService = {
  // Obtener todos los productos con filtros opcionales
  getProductos: async (filtros = {}) => {
    try {
      const response = await api.get('/productos', { params: filtros });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Obtener un producto por ID
  getProducto: async (productoId) => {
    try {
      const response = await api.get(`/productos/${productoId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Crear un nuevo producto
  createProducto: async (productoData) => {
    try {
      const response = await api.post('/productos', productoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Actualizar un producto existente
  updateProducto: async (productoId, productoData) => {
    try {
      const response = await api.put(`/productos/${productoId}`, productoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Eliminar un producto
  deleteProducto: async (productoId) => {
    try {
      const response = await api.delete(`/productos/${productoId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Servicio de proveedores
export const proveedorService = {
  // Obtener todos los proveedores con búsqueda opcional
  getProveedores: async (params = {}) => {
    try {
      const response = await api.get('/proveedores', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Obtener un proveedor por ID
  getProveedor: async (proveedorId) => {
    try {
      const response = await api.get(`/proveedores/${proveedorId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Crear un nuevo proveedor
  createProveedor: async (proveedorData) => {
    try {
      const response = await api.post('/proveedores', proveedorData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Puedes agregar aquí métodos para actualizar y eliminar proveedores
  // si tu backend los soporta
};

export default api;