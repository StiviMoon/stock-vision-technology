import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { productoService } from '@/src/services/productoService';
import {
  Producto,
  ProductoCreate,
  ProductoUpdate,
  ProductoDetalle,
  ProductoFilterOptions,
} from '@/src/services/interfaces';

// Claves para React Query
export const productoKeys = {
  all: ['productos'] as const,
  lists: () => [...productoKeys.all, 'list'] as const,
  list: (filters: ProductoFilterOptions) =>
    [...productoKeys.lists(), filters] as const,
  details: () => [...productoKeys.all, 'detail'] as const,
  detail: (id: number) => [...productoKeys.details(), id] as const,
  categories: () => [...productoKeys.all, 'categories'] as const,
  search: (query: string) => [...productoKeys.all, 'search', query] as const,
};

// Hook para obtener todos los productos
export const useProductos = (filtros: ProductoFilterOptions = {}) => {
  return useQuery({
    queryKey: productoKeys.list(filtros),
    queryFn: () => productoService.getAll(filtros),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener productos paginados
export const useProductosPaginated = (
  page: number = 1,
  size: number = 10,
  filtros: ProductoFilterOptions = {}
) => {
  return useQuery({
    queryKey: [...productoKeys.list(filtros), 'page', page, 'size', size],
    queryFn: () => productoService.getPaginated(page, size, filtros),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Hook para obtener un producto por ID
export const useProducto = (productoId: number) => {
  return useQuery({
    queryKey: productoKeys.detail(productoId),
    queryFn: () => productoService.getById(productoId),
    enabled: !!productoId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook para obtener productos por categoría
export const useProductosByCategoria = (categoria: string) => {
  return useQuery({
    queryKey: [...productoKeys.categories(), categoria],
    queryFn: () => productoService.getByCategoria(categoria),
    enabled: !!categoria,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook para buscar productos
export const useSearchProductos = (query: string) => {
  return useQuery({
    queryKey: productoKeys.search(query),
    queryFn: () => productoService.search(query),
    enabled: query.length > 2, // Solo buscar si hay más de 2 caracteres
    staleTime: 1 * 60 * 1000, // 1 minuto para búsquedas
    gcTime: 5 * 60 * 1000,
  });
};

// Hook para crear producto
export const useCreateProducto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productoData: ProductoCreate) =>
      productoService.create(productoData),
    onSuccess: () => {
      // Invalidar todas las listas de productos
      queryClient.invalidateQueries({ queryKey: productoKeys.lists() });

      // Invalidar queries de inventario que podrían cambiar
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
    onError: error => {
      console.error('Error al crear producto:', error);
    },
  });
};

// Hook para actualizar producto
export const useUpdateProducto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoUpdate }) =>
      productoService.update(id, data),
    onSuccess: (updatedProducto, { id }) => {
      // Actualizar el producto en el cache
      queryClient.setQueryData(productoKeys.detail(id), updatedProducto);

      // Invalidar listas que podrían contener el producto actualizado
      queryClient.invalidateQueries({ queryKey: productoKeys.lists() });

      // Invalidar queries de inventario
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
    onError: error => {
      console.error('Error al actualizar producto:', error);
    },
  });
};

// Hook para eliminar producto
export const useDeleteProducto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productoId: number) => productoService.delete(productoId),
    onSuccess: (_, productoId) => {
      // Remover el producto del cache
      queryClient.removeQueries({ queryKey: productoKeys.detail(productoId) });

      // Invalidar todas las listas
      queryClient.invalidateQueries({ queryKey: productoKeys.lists() });

      // Invalidar queries de inventario
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
    onError: error => {
      console.error('Error al eliminar producto:', error);
    },
  });
};

// Hook para obtener productos con infinite scroll
export const useProductosInfinite = (filtros: ProductoFilterOptions = {}) => {
  return useInfiniteQuery({
    queryKey: [...productoKeys.list(filtros), 'infinite'],
    queryFn: ({ pageParam = 1 }) =>
      productoService.getPaginated(pageParam, 20, filtros),
    getNextPageParam: lastPage => {
      const { pagination } = lastPage;
      return pagination.page < pagination.pages
        ? pagination.page + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
