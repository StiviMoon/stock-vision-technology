import { useState, useEffect, useCallback } from 'react';
import { categoriaService } from '@/src/services/categoriaService';
import { Categoria, CategoriaCreate } from '@/src/services/interfaces';

// Hook para manejo de categorías - Mejorado para coincidir con el backend
export const useCategorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todas las categorías con manejo de errores mejorado
  const loadCategorias = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriaService.getAll({ search });
      setCategorias(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail ||
                          err.message ||
                          'Error al cargar categorías';
      setError(errorMessage);
      console.error('Error al cargar categorías:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva categoría con validación mejorada
  const createCategoria = useCallback(async (categoriaData: CategoriaCreate) => {
    setLoading(true);
    setError(null);
    try {
      // Validar datos antes de enviar
      if (!categoriaData.nombre?.trim()) {
        throw new Error('El nombre es obligatorio');
      }
      if (!categoriaData.codigo?.trim()) {
        throw new Error('El código es obligatorio');
      }

      const nuevaCategoria = await categoriaService.create(categoriaData);
      setCategorias(prev => [...prev, nuevaCategoria]);
      return nuevaCategoria;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail ||
                          err.message ||
                          'Error al crear categoría';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar categoría con validación mejorada
  const updateCategoria = useCallback(async (id: number, categoriaData: CategoriaCreate) => {
    setLoading(true);
    setError(null);
    try {
      // Validar datos antes de enviar
      if (!categoriaData.nombre?.trim()) {
        throw new Error('El nombre es obligatorio');
      }
      if (!categoriaData.codigo?.trim()) {
        throw new Error('El código es obligatorio');
      }

      const categoriaActualizada = await categoriaService.update(id, categoriaData);
      setCategorias(prev =>
        prev.map(cat => cat.id === id ? categoriaActualizada : cat)
      );
      return categoriaActualizada;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail ||
                          err.message ||
                          'Error al actualizar categoría';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar categoría con validación mejorada
  const deleteCategoria = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await categoriaService.delete(id);
      setCategorias(prev => prev.filter(cat => cat.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail ||
                          err.message ||
                          'Error al eliminar categoría';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener categoría por ID
  const getCategoriaById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const categoria = await categoriaService.getById(id);
      return categoria;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail ||
                          err.message ||
                          'Error al obtener categoría';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar categorías
  const searchCategorias = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriaService.search(query);
      setCategorias(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail ||
                          err.message ||
                          'Error al buscar categorías';
      setError(errorMessage);
      console.error('Error al buscar categorías:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  return {
    categorias,
    loading,
    error,
    loadCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    getCategoriaById,
    searchCategorias,
    clearError,
  };
};

// Hook para categorías activas (útil para formularios de productos)
export const useCategoriasActivas = () => {
  const [categoriasActivas, setCategoriasActivas] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategoriasActivas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriaService.getActivas();
      setCategoriasActivas(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail ||
                          err.message ||
                          'Error al cargar categorías activas';
      setError(errorMessage);
      console.error('Error al cargar categorías activas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    loadCategoriasActivas();
  }, [loadCategoriasActivas]);

  return {
    categoriasActivas,
    loading,
    error,
    loadCategoriasActivas,
    clearError,
  };
};

// Hook para estadísticas de categorías
export const useCategoriaStats = () => {
  const [stats, setStats] = useState<{
    total: number;
    activas: number;
    inactivas: number;
  }>({ total: 0, activas: 0, inactivas: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriaService.getAll();
      const total = data.length;
      const activas = data.filter(cat => cat.activa).length;
      const inactivas = total - activas;

      setStats({ total, activas, inactivas });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail ||
                          err.message ||
                          'Error al cargar estadísticas';
      setError(errorMessage);
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    loadStats,
  };
};
