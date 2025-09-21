import api from './api';
import { User, UserCreate } from './interfaces';

// Definir UserUpdate localmente ya que no está exportado
interface UserUpdate {
  email?: string;
  nombre?: string;
  apellido?: string;
  rol?: string;
  activo?: boolean;
}

export const userService = {
  // Obtener todos los usuarios (solo ADMIN y USUARIO)
  getAllUsers: async (params?: {
    skip?: number;
    limit?: number;
    active_only?: boolean;
    search?: string;
    role?: string;
  }): Promise<User[]> => {
    try {
      const response = await api.get<User[]>('/users/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Obtener usuario por ID
  getUserById: async (userId: number): Promise<User> => {
    try {
      const response = await api.get<User>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Obtener usuario actual
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<User>('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  // Crear usuario (solo ADMIN)
  createUser: async (userData: UserCreate): Promise<User> => {
    try {
      const response = await api.post<User>('/users/', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Actualizar usuario (ADMIN o el propio usuario)
  updateUser: async (userId: number, userData: UserUpdate): Promise<User> => {
    try {
      const response = await api.put<User>(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Actualizar rol de usuario (solo ADMIN)
  updateUserRole: async (userId: number, newRole: string): Promise<User> => {
    try {
      const response = await api.patch<User>(`/users/${userId}/role`, { role: newRole });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Activar usuario (solo ADMIN)
  activateUser: async (userId: number): Promise<void> => {
    try {
      await api.patch(`/users/${userId}/activate`);
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  },

  // Desactivar usuario (solo ADMIN)
  deactivateUser: async (userId: number): Promise<void> => {
    try {
      await api.patch(`/users/${userId}/deactivate`);
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  },

  // Eliminar usuario (solo ADMIN)
  deleteUser: async (userId: number): Promise<void> => {
    try {
      await api.delete(`/users/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Obtener estadísticas de usuarios (solo ADMIN)
  getUserStats: async (): Promise<{
    total_users: number;
    active_users: number;
    inactive_users: number;
    admin_users: number;
    regular_users: number;
    guest_users: number;
  }> => {
    try {
      const response = await api.get('/users/stats/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }
};
