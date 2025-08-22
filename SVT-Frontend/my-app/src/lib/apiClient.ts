import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { queryClient } from './queryClient';

// Configuración de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Crear instancia de axios con configuración base
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para agregar el token de autenticación
apiClient.interceptors.request.use(
  config => {
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

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Manejar error 401 (No autorizado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Limpiar almacenamiento local
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('token_type');

        // Invalidar todas las queries para forzar re-autenticación
        queryClient.clear();

        // Redirigir al login
        window.location.href = '/login';
      }
    }

    // Formatear errores de validación
    if (error.response?.status === 422) {
      console.error('Error de validación:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// Función helper para crear endpoints
export const createEndpoint = (path: string) => `${path}`;

// Función helper para crear parámetros de consulta
export const createQueryParams = (params: Record<string, any> = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

// Función helper para manejar respuestas de paginación
export const handlePaginatedResponse = <T>(response: AxiosResponse<T[]>) => {
  return {
    data: response.data,
    pagination: {
      page: parseInt(response.headers['x-page'] || '1'),
      size: parseInt(response.headers['x-size'] || '10'),
      total: parseInt(response.headers['x-total'] || '0'),
      pages: parseInt(response.headers['x-pages'] || '1'),
    },
  };
};

export default apiClient;
