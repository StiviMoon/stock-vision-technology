import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo de datos frescos - datos que no necesitan refetch
      staleTime: 5 * 60 * 1000, // 5 minutos

      // Tiempo de garbage collection - cuándo limpiar datos no usados
      gcTime: 30 * 60 * 1000, // 30 minutos

      // Estrategia de reintentos inteligente
      retry: (failureCount, error: any) => {
        // No reintentar en errores de autenticación o validación
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Reintentar hasta 3 veces para errores de red
        return failureCount < 3;
      },

      // Configuración de refetch
      refetchOnWindowFocus: false, // No refetch al cambiar de ventana
      refetchOnReconnect: true,    // Refetch al reconectar
      refetchOnMount: true,        // Refetch al montar componente

      // Configuración de red
      networkMode: 'online',       // Solo ejecutar cuando hay conexión
    },
    mutations: {
      retry: false,                // No reintentar mutaciones
      networkMode: 'online',
    },
  },
});
