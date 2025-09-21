import apiClient, {
  createQueryParams,
  handlePaginatedResponse,
} from '@/src/lib/apiClient';
import {
  Categoria,
  CategoriaCreate,
  CategoriaUpdate,
} from './interfaces';

// Constantes para endpoints
const CATEGORIA_ENDPOINTS = {
  BASE: '/categorias',
  BY_ID: (id: number) => `/categorias/${id}`,
  ACTIVAS: '/categorias/activas',
  PRODUCTOS_COUNT: (id: number) => `/categorias/${id}/productos/count`,
} as const;

// Servicio de categorías
export const categoriaService = {
  // Crear una nueva categoría
  create: async (categoriaData: CategoriaCreate): Promise<Categoria> => {
    try {
      const response = await apiClient.post<Categoria>(
        CATEGORIA_ENDPOINTS.BASE,
        categoriaData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todas las categorías con filtros opcionales
  getAll: async (params: {
    skip?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<Categoria[]> => {
    try {
      const queryParams = createQueryParams(params);
      const url = queryParams
        ? `${CATEGORIA_ENDPOINTS.BASE}?${queryParams}`
        : CATEGORIA_ENDPOINTS.BASE;

      const response = await apiClient.get<Categoria[]>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener categorías activas (útil para formularios de productos)
  getActivas: async (): Promise<Categoria[]> => {
    try {
      const response = await apiClient.get<Categoria[]>(
        CATEGORIA_ENDPOINTS.ACTIVAS
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener una categoría por ID
  getById: async (categoriaId: number): Promise<Categoria> => {
    try {
      const response = await apiClient.get<Categoria>(
        CATEGORIA_ENDPOINTS.BY_ID(categoriaId)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar una categoría existente
  update: async (
    categoriaId: number,
    categoriaData: CategoriaCreate
  ): Promise<Categoria> => {
    try {
      const response = await apiClient.put<Categoria>(
        CATEGORIA_ENDPOINTS.BY_ID(categoriaId),
        categoriaData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una categoría
  delete: async (categoriaId: number): Promise<void> => {
    try {
      await apiClient.delete(CATEGORIA_ENDPOINTS.BY_ID(categoriaId));
    } catch (error) {
      throw error;
    }
  },

  // Buscar categorías por nombre, código o descripción
  search: async (query: string): Promise<Categoria[]> => {
    try {
      const response = await apiClient.get<Categoria[]>(
        CATEGORIA_ENDPOINTS.BASE,
        {
          params: { search: query },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener categorías con paginación
  getPaginated: async (
    page: number = 1,
    size: number = 10,
    search?: string
  ) => {
    try {
      const params = {
        skip: (page - 1) * size,
        limit: size,
        ...(search && { search })
      };
      const queryParams = createQueryParams(params);
      const url = `${CATEGORIA_ENDPOINTS.BASE}?${queryParams}`;

      const response = await apiClient.get<Categoria[]>(url);
      return handlePaginatedResponse(response);
    } catch (error) {
      throw error;
    }
  },

  // Contar productos de una categoría
  getProductosCount: async (categoriaId: number): Promise<{
    categoria_id: number;
    productos_count: number;
  }> => {
    try {
      const response = await apiClient.get<{
        categoria_id: number;
        productos_count: number;
      }>(CATEGORIA_ENDPOINTS.PRODUCTOS_COUNT(categoriaId));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
