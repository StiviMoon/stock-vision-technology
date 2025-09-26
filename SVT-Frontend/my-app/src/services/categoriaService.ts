import apiClient, {
  createQueryParams,
  handlePaginatedResponse,
} from '@/src/lib/apiClient';
import {
  Categoria,
  CategoriaCreate,
  CategoriaUpdate,
} from './interfaces';

// Constantes para endpoints - Coinciden exactamente con el backend
const CATEGORIA_ENDPOINTS = {
  BASE: '/categorias',
  BY_ID: (id: number) => `/categorias/${id}`,
  ACTIVAS: '/categorias/activas',
  PRODUCTOS_COUNT: (id: number) => `/categorias/${id}/productos/count`,
} as const;

// Servicio de categorías - Mejorado para coincidir con el backend
export const categoriaService = {
  // Crear una nueva categoría
  create: async (categoriaData: CategoriaCreate): Promise<Categoria> => {
    try {
      // Validar datos antes de enviar
      if (!categoriaData.nombre?.trim()) {
        throw new Error('El nombre es obligatorio');
      }
      if (!categoriaData.codigo?.trim()) {
        throw new Error('El código es obligatorio');
      }

      // Preparar datos para el backend
      const payload = {
        nombre: categoriaData.nombre.trim(),
        codigo: categoriaData.codigo.trim().toUpperCase(),
        descripcion: categoriaData.descripcion?.trim() || null,
        activa: categoriaData.activa,
      };

      const response = await apiClient.post<Categoria>(
        CATEGORIA_ENDPOINTS.BASE,
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Error al crear categoría:', error);
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
      console.error('Error al obtener categorías:', error);
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
      console.error('Error al obtener categorías activas:', error);
      throw error;
    }
  },

  // Obtener una categoría por ID
  getById: async (categoriaId: number): Promise<Categoria> => {
    try {
      if (!categoriaId || categoriaId <= 0) {
        throw new Error('ID de categoría inválido');
      }

      const response = await apiClient.get<Categoria>(
        CATEGORIA_ENDPOINTS.BY_ID(categoriaId)
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener categoría por ID:', error);
      throw error;
    }
  },

  // Actualizar una categoría existente
  update: async (
    categoriaId: number,
    categoriaData: CategoriaCreate
  ): Promise<Categoria> => {
    try {
      if (!categoriaId || categoriaId <= 0) {
        throw new Error('ID de categoría inválido');
      }

      // Validar datos antes de enviar
      if (!categoriaData.nombre?.trim()) {
        throw new Error('El nombre es obligatorio');
      }
      if (!categoriaData.codigo?.trim()) {
        throw new Error('El código es obligatorio');
      }

      // Preparar datos para el backend
      const payload = {
        nombre: categoriaData.nombre.trim(),
        codigo: categoriaData.codigo.trim().toUpperCase(),
        descripcion: categoriaData.descripcion?.trim() || null,
        activa: categoriaData.activa,
      };

      const response = await apiClient.put<Categoria>(
        CATEGORIA_ENDPOINTS.BY_ID(categoriaId),
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw error;
    }
  },

  // Eliminar una categoría
  delete: async (categoriaId: number): Promise<void> => {
    try {
      if (!categoriaId || categoriaId <= 0) {
        throw new Error('ID de categoría inválido');
      }

      await apiClient.delete(CATEGORIA_ENDPOINTS.BY_ID(categoriaId));
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  },

  // Buscar categorías por nombre, código o descripción
  search: async (query: string): Promise<Categoria[]> => {
    try {
      if (!query?.trim()) {
        return await categoriaService.getAll();
      }

      const response = await apiClient.get<Categoria[]>(
        CATEGORIA_ENDPOINTS.BASE,
        {
          params: { search: query.trim() },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al buscar categorías:', error);
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
        ...(search && { search: search.trim() })
      };
      const queryParams = createQueryParams(params);
      const url = `${CATEGORIA_ENDPOINTS.BASE}?${queryParams}`;

      const response = await apiClient.get<Categoria[]>(url);
      return handlePaginatedResponse(response);
    } catch (error) {
      console.error('Error al obtener categorías paginadas:', error);
      throw error;
    }
  },

  // Contar productos de una categoría
  getProductosCount: async (categoriaId: number): Promise<{
    categoria_id: number;
    productos_count: number;
  }> => {
    try {
      if (!categoriaId || categoriaId <= 0) {
        throw new Error('ID de categoría inválido');
      }

      const response = await apiClient.get<{
        categoria_id: number;
        productos_count: number;
      }>(CATEGORIA_ENDPOINTS.PRODUCTOS_COUNT(categoriaId));
      return response.data;
    } catch (error) {
      console.error('Error al contar productos de categoría:', error);
      throw error;
    }
  },

  // Verificar si una categoría puede ser eliminada (no tiene productos asociados)
  canDelete: async (categoriaId: number): Promise<boolean> => {
    try {
      const count = await categoriaService.getProductosCount(categoriaId);
      return count.productos_count === 0;
    } catch (error) {
      console.error('Error al verificar si se puede eliminar categoría:', error);
      return false;
    }
  },
};
