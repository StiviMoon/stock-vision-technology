'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export interface User {
  id: number;
  email: string;
  rol: string;
  nombre?: string;
  apellido?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
    setUser(null);
    router.push('/login');
  }, [router]);

  const fetchUserData = useCallback(
    async (token: string) => {
      try {
        const response = await axios.get(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (err) {
        console.error('Error al obtener datos del usuario:', err);
        logout();
      } finally {
        setLoading(false);
      }
    },
    [API_URL, logout]
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, [fetchUserData]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await axios.post(`${API_URL}/auth/login`, formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        const { access_token, token_type } = response.data;

        localStorage.setItem('token', access_token);
        localStorage.setItem('token_type', token_type);
        await fetchUserData(access_token);
      } catch (error) {
        console.error('Error en login:', error);
        setLoading(false);
        throw error;
      }
    },
    [API_URL, fetchUserData]
  );

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchUserData(token);
    }
  }, [fetchUserData]);

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
  }
  return context;
};
