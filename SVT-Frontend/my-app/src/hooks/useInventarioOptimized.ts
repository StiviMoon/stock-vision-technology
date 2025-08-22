import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { inventarioService } from '@/src/services/inventarioService';
import { productoService } from '@/src/services/productoService';
import { useInventarioToasts } from './useInventarioToasts';

// Claves para React Query - Organizadas por dominio
export const inventarioOptimizedKeys = {
  all: ['inventario-optimized'] as const,

  // Productos
  productos: () => [...inventarioOptimizedKeys.all, 'productos'] as const,
  productosList: (filters: any) =>
    [...inventarioOptimizedKeys.productos(), 'list', filters] as const,
  producto: (id: number) =>
    [...inventarioOptimizedKeys.productos(), 'detail', id] as const,

  // Bodegas
  bodegas: () => [...inventarioOptimizedKeys.all, 'bodegas'] as const,
  bodega: (id: number) =>
    [...inventarioOptimizedKeys.bodegas(), 'detail', id] as const,

  // Stock
  stock: () => [...inventarioOptimizedKeys.all, 'stock'] as const,
  stockProducto: (id: number) =>
    [...inventarioOptimizedKeys.stock(), 'producto', id] as const,
  stockBodega: (id: number) =>
    [...inventarioOptimizedKeys.stock(), 'bodega', id] as const,

  // Movimientos
  movimientos: () => [...inventarioOptimizedKeys.all, 'movimientos'] as const,
  movimientosList: (filters: any) =>
    [...inventarioOptimizedKeys.movimientos(), 'list', filters] as const,

  // Alertas
  alertas: () => [...inventarioOptimizedKeys.all, 'alertas'] as const,

  // Kardex
  kardex: (id: number) =>
    [...inventarioOptimizedKeys.all, 'kardex', id] as const,
};

// Hook principal para obtener productos del inventario
export const useInventarioProductosOptimized = (filters: any = {}) => {
  return useQuery({
    queryKey: inventarioOptimizedKeys.productosList(filters),
    queryFn: () => productoService.getAll(filters),
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};

// Hook para obtener un producto específico
export const useInventarioProductoOptimized = (productoId: number) => {
  return useQuery({
    queryKey: inventarioOptimizedKeys.producto(productoId),
    queryFn: () => productoService.getById(productoId),
    enabled: !!productoId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Hook para obtener bodegas
export const useInventarioBodegasOptimized = (soloActivas: boolean = true) => {
  return useQuery({
    queryKey: [...inventarioOptimizedKeys.bodegas(), { soloActivas }],
    queryFn: () => inventarioService.getBodegas(soloActivas),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para obtener stock de un producto
export const useInventarioStockProductoOptimized = (productoId: number) => {
  return useQuery({
    queryKey: inventarioOptimizedKeys.stockProducto(productoId),
    queryFn: () => inventarioService.getStockProducto(productoId),
    enabled: !!productoId,
    staleTime: 10 * 1000, // 10 segundos para stock
    gcTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para obtener alertas de stock
export const useInventarioAlertasOptimized = () => {
  return useQuery({
    queryKey: inventarioOptimizedKeys.alertas(),
    queryFn: () => inventarioService.getAlertasStock(),
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000, // Refrescar cada 2 minutos
  });
};

// Hook para obtener movimientos
export const useInventarioMovimientosOptimized = (filters: any = {}) => {
  return useQuery({
    queryKey: inventarioOptimizedKeys.movimientosList(filters),
    queryFn: () => inventarioService.getMovimientos(filters),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Hook para obtener kardex
export const useInventarioKardexOptimized = (
  productoId: number,
  fechaInicio?: string,
  fechaFin?: string,
  bodegaId?: number
) => {
  return useQuery({
    queryKey: [
      ...inventarioOptimizedKeys.kardex(productoId),
      { fechaInicio, fechaFin, bodegaId },
    ],
    queryFn: () =>
      inventarioService.getKardex(productoId, fechaInicio, fechaFin, bodegaId),
    enabled: !!productoId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook para ajustar inventario con cache management inteligente
export const useAjustarInventarioOptimized = () => {
  const queryClient = useQueryClient();
  const toasts = useInventarioToasts();

  return useMutation({
    mutationFn: (ajusteData: any) =>
      inventarioService.ajustarInventario(ajusteData),
    onMutate: async ajusteData => {
      // Mostrar toast de procesamiento
      toasts.showAjustePending();

      // Cancelar queries en curso para evitar conflictos
      await queryClient.cancelQueries({
        queryKey: inventarioOptimizedKeys.productos(),
      });
      await queryClient.cancelQueries({
        queryKey: inventarioOptimizedKeys.stock(),
      });

      // Snapshot del estado anterior
      const previousProductos = queryClient.getQueryData(
        inventarioOptimizedKeys.productos()
      );
      const previousStock = queryClient.getQueryData(
        inventarioOptimizedKeys.stockProducto(ajusteData.producto_id)
      );

      // Optimistic update: Actualizar inmediatamente el cache
      queryClient.setQueryData(
        inventarioOptimizedKeys.productos(),
        (old: any[] = []) => {
          return old.map(producto => {
            if (producto.id === ajusteData.producto_id) {
              const nuevaCantidad = producto.stock_actual + ajusteData.cantidad;
              return {
                ...producto,
                stock_actual: nuevaCantidad,
                stocks_bodega: producto.stocks_bodega?.map(stock => {
                  if (stock.bodega_id === ajusteData.bodega_id) {
                    return {
                      ...stock,
                      cantidad: stock.cantidad + ajusteData.cantidad,
                    };
                  }
                  return stock;
                }),
              };
            }
            return producto;
          });
        }
      );

      // Optimistic update del stock específico
      queryClient.setQueryData(
        inventarioOptimizedKeys.stockProducto(ajusteData.producto_id),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            stock_total: old.stock_total + ajusteData.cantidad,
            stock_por_bodega: old.stock_por_bodega?.map(stock => {
              if (stock.bodega_id === ajusteData.bodega_id) {
                return {
                  ...stock,
                  cantidad: stock.cantidad + ajusteData.cantidad,
                };
              }
              return stock;
            }),
          };
        }
      );

      // Retornar contexto para rollback si es necesario
      return { previousProductos, previousStock };
    },
    onSuccess: (data, ajusteData) => {
      // Limpiar toast de procesamiento
      toasts.dismissAll();

      // Mostrar toast de éxito
      const producto = data?.producto?.nombre || 'Producto';
      const bodega = data?.bodega_destino?.nombre || 'Bodega';
      toasts.showAjusteSuccess(producto, ajusteData.cantidad, bodega);
    },
    onError: (err: any, ajusteData, context) => {
      // Limpiar toast de procesamiento
      toasts.dismissAll();

      // Rollback en caso de error
      if (context?.previousProductos) {
        queryClient.setQueryData(
          inventarioOptimizedKeys.productos(),
          context.previousProductos
        );
      }
      if (context?.previousStock) {
        queryClient.setQueryData(
          inventarioOptimizedKeys.stockProducto(ajusteData.producto_id),
          context.previousStock
        );
      }

      // Mostrar toast de error
      const errorMessage =
        err?.response?.data?.detail || 'Error al realizar el ajuste';
      toasts.showAjusteError(errorMessage);
    },
    onSettled: (data, error, ajusteData) => {
      // Invalidar y refetch queries relacionadas
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.productos(),
      });
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.stock(),
      });
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.movimientos(),
      });
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.alertas(),
      });

      // Refetch específico del producto ajustado
      queryClient.refetchQueries({
        queryKey: inventarioOptimizedKeys.producto(ajusteData.producto_id),
        exact: true,
      });

      // Refetch del stock específico
      queryClient.refetchQueries({
        queryKey: inventarioOptimizedKeys.stockProducto(ajusteData.producto_id),
        exact: true,
      });
    },
  });
};

// Hook para crear movimiento genérico
export const useCrearMovimientoOptimized = () => {
  const queryClient = useQueryClient();
  const toasts = useInventarioToasts();

  return useMutation({
    mutationFn: (movimientoData: any) =>
      inventarioService.createMovimiento(movimientoData),
    onSuccess: () => {
      toasts.showOperationSuccess(
        'Movimiento Creado',
        'El movimiento se ha registrado correctamente'
      );
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.productos(),
      });
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.stock(),
      });
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.movimientos(),
      });
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.alertas(),
      });
    },
    onError: (error: any) => {
      console.error('Error al crear movimiento:', error);
      const errorMessage =
        error?.response?.data?.detail || 'Error al crear el movimiento';
      toasts.showOperationError('Crear Movimiento', errorMessage);
    },
  });
};

// Hook para transferir entre bodegas
export const useTransferirEntreBodegasOptimized = () => {
  const queryClient = useQueryClient();
  const toasts = useInventarioToasts();

  return useMutation({
    mutationFn: (transferenciaData: any) =>
      inventarioService.transferirEntreBodegas(transferenciaData),
    onSuccess: () => {
      toasts.showOperationSuccess(
        'Transferencia Realizada',
        'Los productos se han transferido correctamente'
      );
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.productos(),
      });
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.stock(),
      });
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.movimientos(),
      });
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.bodegas(),
      });
    },
    onError: (error: any) => {
      console.error('Error al transferir entre bodegas:', error);
      const errorMessage =
        error?.response?.data?.detail || 'Error al realizar la transferencia';
      toasts.showOperationError('Transferencia', errorMessage);
    },
  });
};

// Hook para inventario físico
export const useInventarioFisicoOptimized = () => {
  const queryClient = useQueryClient();
  const toasts = useInventarioToasts();

  return useMutation({
    mutationFn: (inventarioData: any) =>
      inventarioService.realizarInventarioFisico(inventarioData),
    onSuccess: () => {
      toasts.showOperationSuccess(
        'Inventario Físico',
        'El inventario físico se ha realizado correctamente'
      );
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.productos(),
      });
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.stock(),
      });
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.movimientos(),
      });
      queryClient.invalidateQueries({
        queryKey: inventarioOptimizedKeys.alertas(),
      });
    },
    onError: (error: any) => {
      console.error('Error al realizar inventario físico:', error);
      const errorMessage =
        error?.response?.data?.detail ||
        'Error al realizar el inventario físico';
      toasts.showOperationError('Inventario Físico', errorMessage);
    },
  });
};

// Hook para sincronización manual
export const useSincronizarInventarioOptimized = () => {
  const queryClient = useQueryClient();
  const toasts = useInventarioToasts();

  const sincronizarTodo = () => {
    toasts.showSyncPending();
    queryClient.invalidateQueries({ queryKey: inventarioOptimizedKeys.all });

    // Simular un delay para mostrar el toast
    setTimeout(() => {
      toasts.dismissAll();
      toasts.showSyncSuccess();
    }, 2000);
  };

  const sincronizarProducto = (productoId: number) => {
    toasts.showInfo(
      'Sincronizando Producto',
      'Actualizando datos del producto...'
    );
    queryClient.invalidateQueries({
      queryKey: inventarioOptimizedKeys.producto(productoId),
    });
    queryClient.invalidateQueries({
      queryKey: inventarioOptimizedKeys.stockProducto(productoId),
    });

    setTimeout(() => {
      toasts.showOperationSuccess(
        'Producto Sincronizado',
        'Los datos se han actualizado'
      );
    }, 1500);
  };

  return { sincronizarTodo, sincronizarProducto };
};
