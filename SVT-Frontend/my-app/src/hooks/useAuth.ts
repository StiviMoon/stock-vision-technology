import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/src/services/authService';
import {
  LoginCredentials,
  RegisterData,
  User,
} from '@/src/services/interfaces';

// Claves para React Query
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  user: (id: number) => [...authKeys.all, 'user', id] as const,
};

// Hook para obtener el perfil del usuario
export const useProfile = () => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: authService.getProfile,
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para login
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: data => {
      // Invalidar queries relacionadas con el usuario
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      queryClient.invalidateQueries({ queryKey: ['users'] });

      // Limpiar cache de otros datos que podrían cambiar
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
    },
    onError: error => {
      console.error('Error en login:', error);
    },
  });
};

// Hook para registro
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: RegisterData) => authService.register(userData),
    onSuccess: () => {
      // Invalidar queries de usuarios
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: error => {
      console.error('Error en registro:', error);
    },
  });
};

// Hook para logout
export const useLogout = () => {
  const queryClient = useQueryClient();

  const logout = () => {
    // Limpiar todo el cache
    queryClient.clear();

    // Ejecutar logout del servicio
    authService.logout();
  };

  return { logout };
};

// Hook para verificar autenticación
export const useIsAuthenticated = () => {
  return authService.isAuthenticated();
};

// Hook para obtener token
export const useToken = () => {
  return authService.getToken();
};
