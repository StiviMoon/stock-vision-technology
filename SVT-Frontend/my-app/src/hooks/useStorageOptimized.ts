import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

// Tipos para el storage optimizado
interface StorageConfig {
  staleTime?: number;
  gcTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
}

interface CacheStrategy {
  // Estrategia de invalidación
  invalidateOnMutation?: boolean;
  // Estrategia de prefetch
  prefetchOnHover?: boolean;
  // Estrategia de background refetch
  backgroundRefetch?: boolean;
}

// Configuraciones predefinidas por tipo de dato
export const STORAGE_CONFIGS = {
  // Datos que cambian frecuentemente
  DYNAMIC: {
    staleTime: 30 * 1000,      // 30 segundos
    gcTime: 5 * 60 * 1000,     // 5 minutos
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  },

  // Datos que cambian ocasionalmente
  SEMI_STATIC: {
    staleTime: 5 * 60 * 1000,  // 5 minutos
    gcTime: 30 * 60 * 1000,    // 30 minutos
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },

  // Datos que raramente cambian
  STATIC: {
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 2 * 60 * 60 * 1000, // 2 horas
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },

  // Datos críticos que siempre deben estar frescos
  CRITICAL: {
    staleTime: 0,               // Siempre stale
    gcTime: 10 * 60 * 1000,     // 10 minutos
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  },
} as const;

// Hook para storage optimizado
export const useStorageOptimized = <T>(
  key: string[],
  queryFn: () => Promise<T>,
  config: StorageConfig = STORAGE_CONFIGS.SEMI_STATIC,
  strategy: CacheStrategy = {}
) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: key,
    queryFn,
    ...config,
  });

  // Función para invalidar cache específico
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: key });
  }, [queryClient, key]);

  // Función para invalidar cache relacionado
  const invalidateRelated = useCallback((relatedKeys: string[][]) => {
    relatedKeys.forEach(relatedKey => {
      queryClient.invalidateQueries({ queryKey: relatedKey });
    });
  }, [queryClient]);

  // Función para prefetch de datos
  const prefetch = useCallback(async (prefetchFn: () => Promise<T>) => {
    await queryClient.prefetchQuery({
      queryKey: key,
      queryFn: prefetchFn,
      ...config,
    });
  }, [queryClient, key, config]);

  // Función para actualizar cache optimistamente
  const updateCache = useCallback((updater: (oldData: T | undefined) => T) => {
    queryClient.setQueryData(key, updater);
  }, [queryClient, key]);

  // Función para limpiar cache
  const clearCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: key });
  }, [queryClient, key]);

  return {
    ...query,
    invalidate,
    invalidateRelated,
    prefetch,
    updateCache,
    clearCache,
  };
};

// Hook para mutaciones optimizadas
export const useStorageMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateKeys?: string[][];
    optimisticUpdate?: {
      queryKey: string[];
      updater: (oldData: any, variables: TVariables) => any;
    };
  } = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancelar queries relacionadas
      if (options.optimisticUpdate) {
        await queryClient.cancelQueries({
          queryKey: options.optimisticUpdate.queryKey
        });

        // Snapshot del estado anterior
        const previousData = queryClient.getQueryData(
          options.optimisticUpdate.queryKey
        );

        // Actualización optimista
        queryClient.setQueryData(
          options.optimisticUpdate.queryKey,
          (old: any) => options.optimisticUpdate!.updater(old, variables)
        );

        return { previousData };
      }
    },
    onError: (error, variables, context) => {
      // Revertir actualización optimista en caso de error
      if (options.optimisticUpdate && context?.previousData) {
        queryClient.setQueryData(
          options.optimisticUpdate.queryKey,
          context.previousData
        );
      }
      options.onError?.(error, variables);
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      if (options.invalidateKeys) {
        options.invalidateKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      options.onSuccess?.(data, variables);
    },
  });
};

// Hook para prefetch inteligente
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchOnHover = useCallback(
    <T>(key: string[], queryFn: () => Promise<T>, config?: StorageConfig) => {
      return {
        onMouseEnter: () => {
          queryClient.prefetchQuery({
            queryKey: key,
            queryFn,
            ...config,
          });
        },
      };
    },
    [queryClient]
  );

  const prefetchOnFocus = useCallback(
    <T>(key: string[], queryFn: () => Promise<T>, config?: StorageConfig) => {
      return {
        onFocus: () => {
          queryClient.prefetchQuery({
            queryKey: key,
            queryFn,
            ...config,
          });
        },
      };
    },
    [queryClient]
  );

  return {
    prefetchOnHover,
    prefetchOnFocus,
  };
};
