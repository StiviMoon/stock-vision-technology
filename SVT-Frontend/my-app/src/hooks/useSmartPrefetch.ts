import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { inventarioOptimizedKeys } from './useInventarioOptimized';
import { productoKeys } from './useProductos';
import { categoriaKeys } from './useCategorias';
import { bodegaKeys } from './useBodegas';

// Hook para prefetch inteligente basado en rutas
export const useSmartPrefetch = () => {
  const queryClient = useQueryClient();
  const pathname = usePathname();

  // Prefetch basado en la ruta actual
  const prefetchByRoute = useCallback(async (route: string) => {
    const prefetchPromises = [];

    switch (true) {
      case route.includes('/dashboard'):
        // Prefetch datos generales del dashboard
        prefetchPromises.push(
          queryClient.prefetchQuery({
            queryKey: inventarioOptimizedKeys.alertas(),
            queryFn: () => import('@/src/services/inventarioService').then(s => s.inventarioService.getAlertasStock()),
            staleTime: 2 * 60 * 1000,
          })
        );
        break;

      case route.includes('/inventario'):
        // Prefetch datos de inventario
        prefetchPromises.push(
          queryClient.prefetchQuery({
            queryKey: inventarioOptimizedKeys.productos(),
            queryFn: () => import('@/src/services/productoService').then(s => s.productoService.getAll()),
            staleTime: 2 * 60 * 1000,
          }),
          queryClient.prefetchQuery({
            queryKey: inventarioOptimizedKeys.bodegas(),
            queryFn: () => import('@/src/services/inventarioService').then(s => s.inventarioService.getBodegas()),
            staleTime: 10 * 60 * 1000,
          })
        );
        break;

      case route.includes('/productos'):
        // Prefetch datos de productos
        prefetchPromises.push(
          queryClient.prefetchQuery({
            queryKey: productoKeys.lists(),
            queryFn: () => import('@/src/services/productoService').then(s => s.productoService.getAll()),
            staleTime: 5 * 60 * 1000,
          }),
          queryClient.prefetchQuery({
            queryKey: categoriaKeys.all,
            queryFn: () => import('@/src/services/api').then(s => s.categoriaService.getAll()),
            staleTime: 30 * 60 * 1000,
          })
        );
        break;

      case route.includes('/bodegas'):
        // Prefetch datos de bodegas
        prefetchPromises.push(
          queryClient.prefetchQuery({
            queryKey: bodegaKeys.all,
            queryFn: () => import('@/src/services/inventarioService').then(s => s.inventarioService.getBodegas()),
            staleTime: 10 * 60 * 1000,
          })
        );
        break;

      case route.includes('/categorias'):
        // Prefetch datos de categorías
        prefetchPromises.push(
          queryClient.prefetchQuery({
            queryKey: categoriaKeys.all,
            queryFn: () => import('@/src/services/api').then(s => s.categoriaService.getAll()),
            staleTime: 30 * 60 * 1000,
          })
        );
        break;
    }

    // Ejecutar prefetch en paralelo
    await Promise.allSettled(prefetchPromises);
  }, [queryClient]);

  // Prefetch en hover para elementos interactivos
  const prefetchOnHover = useCallback((
    type: 'producto' | 'bodega' | 'categoria' | 'usuario',
    id?: number
  ) => {
    return {
      onMouseEnter: async () => {
        const prefetchPromises = [];

        switch (type) {
          case 'producto':
            if (id) {
              prefetchPromises.push(
                queryClient.prefetchQuery({
                  queryKey: inventarioOptimizedKeys.producto(id),
                  queryFn: () => import('@/src/services/productoService').then(s => s.productoService.getById(id)),
                  staleTime: 5 * 60 * 1000,
                }),
                queryClient.prefetchQuery({
                  queryKey: inventarioOptimizedKeys.stockProducto(id),
                  queryFn: () => import('@/src/services/inventarioService').then(s => s.inventarioService.getStockProducto(id)),
                  staleTime: 2 * 60 * 1000,
                })
              );
            }
            break;

          case 'bodega':
            if (id) {
              prefetchPromises.push(
                queryClient.prefetchQuery({
                  queryKey: inventarioOptimizedKeys.bodega(id),
                  queryFn: () => import('@/src/services/inventarioService').then(s => s.inventarioService.getBodegaById(id)),
                  staleTime: 10 * 60 * 1000,
                })
              );
            }
            break;

          case 'categoria':
            if (id) {
              prefetchPromises.push(
                queryClient.prefetchQuery({
                  queryKey: categoriaKeys.detail(id),
                  queryFn: () => import('@/src/services/api').then(s => s.categoriaService.getById(id)),
                  staleTime: 30 * 60 * 1000,
                })
              );
            }
            break;
        }

        await Promise.allSettled(prefetchPromises);
      },
    };
  }, [queryClient]);

  // Prefetch en focus para formularios
  const prefetchOnFocus = useCallback((
    type: 'form' | 'modal' | 'dropdown',
    data?: any
  ) => {
    return {
      onFocus: async () => {
        const prefetchPromises = [];

        switch (type) {
          case 'form':
            if (data?.type === 'producto') {
              // Prefetch categorías y proveedores para formulario de producto
              prefetchPromises.push(
                queryClient.prefetchQuery({
                  queryKey: categoriaKeys.all,
                  queryFn: () => import('@/src/services/api').then(s => s.categoriaService.getAll()),
                  staleTime: 30 * 60 * 1000,
                })
              );
            }
            break;

          case 'modal':
            if (data?.type === 'stock') {
              // Prefetch bodegas para modal de ajuste de stock
              prefetchPromises.push(
                queryClient.prefetchQuery({
                  queryKey: inventarioOptimizedKeys.bodegas(),
                  queryFn: () => import('@/src/services/inventarioService').then(s => s.inventarioService.getBodegas()),
                  staleTime: 10 * 60 * 1000,
                })
              );
            }
            break;
        }

        await Promise.allSettled(prefetchPromises);
      },
    };
  }, [queryClient]);

  // Prefetch automático basado en la ruta
  useEffect(() => {
    prefetchByRoute(pathname);
  }, [pathname, prefetchByRoute]);

  // Prefetch de datos críticos al cargar la app
  useEffect(() => {
    const criticalPrefetch = async () => {
      await Promise.allSettled([
        // Datos críticos que siempre se necesitan
        queryClient.prefetchQuery({
          queryKey: inventarioOptimizedKeys.alertas(),
          queryFn: () => import('@/src/services/inventarioService').then(s => s.inventarioService.getAlertasStock()),
          staleTime: 2 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: inventarioOptimizedKeys.bodegas(),
          queryFn: () => import('@/src/services/inventarioService').then(s => s.inventarioService.getBodegas()),
          staleTime: 10 * 60 * 1000,
        }),
      ]);
    };

    criticalPrefetch();
  }, [queryClient]);

  return {
    prefetchByRoute,
    prefetchOnHover,
    prefetchOnFocus,
  };
};
