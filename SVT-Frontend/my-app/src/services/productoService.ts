import apiClient, {
  createQueryParams,
  handlePaginatedResponse,
} from '@/src/lib/apiClient';
import {
  Producto,
  ProductoCreate,
  ProductoUpdate,
  ProductoDetalle,
  ProductoFilterOptions,
} from './interfaces';

// Constantes para endpoints
const PRODUCTO_ENDPOINTS = {
  BASE: '/productos',
  BY_ID: (id: number) => `/productos/${id}`,
  BY_CATEGORIA: '/productos',
} as const;

// Servicio de productos
export const productoService = {
  // Crear un nuevo producto
  create: async (productoData: ProductoCreate): Promise<Producto> => {
    try {
      const response = await apiClient.post<Producto>(
        PRODUCTO_ENDPOINTS.BASE,
        productoData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todos los productos con filtros opcionales
  getAll: async (filtros: ProductoFilterOptions = {}): Promise<Producto[]> => {
    try {
      const queryParams = createQueryParams(filtros);
      const url = queryParams
        ? `${PRODUCTO_ENDPOINTS.BASE}?${queryParams}`
        : PRODUCTO_ENDPOINTS.BASE;

      const response = await apiClient.get<Producto[]>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener un producto por ID
  getById: async (productoId: number): Promise<ProductoDetalle> => {
    try {
      const response = await apiClient.get<ProductoDetalle>(
        PRODUCTO_ENDPOINTS.BY_ID(productoId)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener productos por categoría
  getByCategoria: async (categoria: string): Promise<Producto[]> => {
    try {
      const response = await apiClient.get<Producto[]>(
        PRODUCTO_ENDPOINTS.BY_CATEGORIA,
        {
          params: { categoria },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un producto existente
  update: async (
    productoId: number,
    productoData: ProductoUpdate
  ): Promise<Producto> => {
    try {
      const response = await apiClient.put<Producto>(
        PRODUCTO_ENDPOINTS.BY_ID(productoId),
        productoData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un producto
  delete: async (productoId: number): Promise<void> => {
    try {
      await apiClient.delete(PRODUCTO_ENDPOINTS.BY_ID(productoId));
    } catch (error) {
      throw error;
    }
  },

  // Buscar productos por nombre o SKU
  search: async (query: string): Promise<Producto[]> => {
    try {
      const response = await apiClient.get<Producto[]>(
        PRODUCTO_ENDPOINTS.BASE,
        {
          params: { search: query },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener productos con paginación
  getPaginated: async (
    page: number = 1,
    size: number = 10,
    filtros: ProductoFilterOptions = {}
  ) => {
    try {
      const params = { ...filtros, skip: (page - 1) * size, limit: size };
      const queryParams = createQueryParams(params);
      const url = `${PRODUCTO_ENDPOINTS.BASE}?${queryParams}`;

      const response = await apiClient.get<Producto[]>(url);
      return handlePaginatedResponse(response);
    } catch (error) {
      throw error;
    }
  },
};
