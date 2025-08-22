import apiClient from '@/src/lib/apiClient';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from './interfaces';

// Constantes para endpoints
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/users/me',
} as const;

// Servicio de autenticación
export const authService = {
  // Login con manejo de formulario
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    formData.append('grant_type', 'password');

    try {
      const response = await apiClient.post<AuthResponse>(
        AUTH_ENDPOINTS.LOGIN,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

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

  // Registro de usuario
  register: async (userData: RegisterData): Promise<User> => {
    try {
      const response = await apiClient.post<User>(
        AUTH_ENDPOINTS.REGISTER,
        userData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener perfil del usuario autenticado
  getProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get<User>(AUTH_ENDPOINTS.PROFILE);
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
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return Date.now() < expirationTime;
    } catch {
      return false;
    }
  },

  // Obtener token almacenado
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },
};
