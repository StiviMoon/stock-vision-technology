import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { inventarioOptimizedKeys } from './useInventarioOptimized';

// Hook para gestión inteligente del cache de inventario
export const useInventarioCache = () => {
  const queryClient = useQueryClient();

  // Invalidar todo el inventario
  const invalidateAllInventario = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: inventarioOptimizedKeys.all
    });
  }, [queryClient]);

  // Invalidar solo productos
  const invalidateProductos = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: inventarioOptimizedKeys.productos()
    });
  }, [queryClient]);

  // Invalidar solo bodegas
  const invalidateBodegas = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: inventarioOptimizedKeys.bodegas()
    });
  }, [queryClient]);

  // Invalidar stock específico
  const invalidateStock = useCallback((productoId?: number, bodegaId?: number) => {
    if (productoId) {
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.stockProducto(productoId)
      });
    }
    if (bodegaId) {
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.stockBodega(bodegaId)
      });
    }
    if (!productoId && !bodegaId) {
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.stock()
      });
    }
  }, [queryClient]);

  // Prefetch de datos relacionados
  const prefetchRelatedData = useCallback(async (productoId: number) => {
    // Prefetch del producto específico
    await queryClient.prefetchQuery({
      queryKey: inventarioOptimizedKeys.producto(productoId),
      queryFn: () => import('@/src/services/productoService').then(s => s.productoService.getById(productoId)),
      staleTime: 5 * 60 * 1000,
    });

    // Prefetch del stock del producto
    await queryClient.prefetchQuery({
      queryKey: inventarioOptimizedKeys.stockProducto(productoId),
      queryFn: () => import('@/src/services/inventarioService').then(s => s.inventarioService.getStockProducto(productoId)),
      staleTime: 2 * 60 * 1000,
    });
  }, [queryClient]);

  // Actualización optimista del stock
  const updateStockOptimistically = useCallback((
    productoId: number,
    bodegaId: number,
    cantidad: number,
    tipo: 'entrada' | 'salida'
  ) => {
    const queryKey = inventarioOptimizedKeys.stockProducto(productoId);

    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        stocks_bodega: oldData.stocks_bodega?.map((stock: any) =>
          stock.bodega_id === bodegaId
            ? {
                ...stock,
                cantidad: tipo === 'entrada'
                  ? stock.cantidad + cantidad
                  : stock.cantidad - cantidad
              }
            : stock
        )
      };
    });
  }, [queryClient]);

  // Limpiar cache de datos antiguos
  const cleanupOldCache = useCallback(() => {
    // Limpiar queries que no se han usado en 1 hora
    const oneHourAgo = Date.now() - (60 * 60 * 1000);

    queryClient.getQueryCache().findAll().forEach(query => {
      if (query.state.dataUpdatedAt < oneHourAgo) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  }, [queryClient]);

  // Obtener estadísticas del cache
  const getCacheStats = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.findAll();

    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.state.status === 'pending').length,
      staleQueries: queries.filter(q => q.state.isStale).length,
      memoryUsage: queries.reduce((acc, q) => acc + JSON.stringify(q.state.data || {}).length, 0),
    };
  }, [queryClient]);

  // Estrategia de prefetch inteligente
  const smartPrefetch = useCallback(async (currentPath: string) => {
    const prefetchPromises = [];

    // Prefetch basado en la ruta actual
    if (currentPath.includes('/inventario')) {
      prefetchPromises.push(
        queryClient.prefetchQuery({
          queryKey: inventarioOptimizedKeys.alertas(),
          queryFn: () => import('@/src/services/inventarioService').then(s => s.inventarioService.getAlertasStock()),
          staleTime: 2 * 60 * 1000,
        })
      );
    }

    if (currentPath.includes('/productos')) {
      prefetchPromises.push(
        queryClient.prefetchQuery({
          queryKey: inventarioOptimizedKeys.productos(),
          queryFn: () => import('@/src/services/productoService').then(s => s.productoService.getAll()),
          staleTime: 5 * 60 * 1000,
        })
      );
    }

    if (currentPath.includes('/bodegas')) {
      prefetchPromises.push(
        queryClient.prefetchQuery({
          queryKey: inventarioOptimizedKeys.bodegas(),
          queryFn: () => import('@/src/services/inventarioService').then(s => s.inventarioService.getBodegas()),
          staleTime: 10 * 60 * 1000,
        })
      );
    }

    await Promise.allSettled(prefetchPromises);
  }, [queryClient]);

  return {
    invalidateAllInventario,
    invalidateProductos,
    invalidateBodegas,
    invalidateStock,
    prefetchRelatedData,
    updateStockOptimistically,
    cleanupOldCache,
    getCacheStats,
    smartPrefetch,
  };
};
