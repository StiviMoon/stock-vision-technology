import { useState, useEffect } from 'react';
import { categoriaService } from '@/src/services/categoriaService';
import { Categoria, CategoriaCreate } from '@/src/services/interfaces';

// Hook para manejo de categorías
export const useCategorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todas las categorías
  const loadCategorias = async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriaService.getAll({ search });
      setCategorias(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva categoría
  const createCategoria = async (categoriaData: CategoriaCreate) => {
    setLoading(true);
    setError(null);
    try {
      const nuevaCategoria = await categoriaService.create(categoriaData);
      setCategorias(prev => [...prev, nuevaCategoria]);
      return nuevaCategoria;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al crear categoría');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar categoría
  const updateCategoria = async (id: number, categoriaData: CategoriaCreate) => {
    setLoading(true);
    setError(null);
    try {
      const categoriaActualizada = await categoriaService.update(id, categoriaData);
      setCategorias(prev =>
        prev.map(cat => cat.id === id ? categoriaActualizada : cat)
      );
      return categoriaActualizada;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al actualizar categoría');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar categoría
  const deleteCategoria = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await categoriaService.delete(id);
      setCategorias(prev => prev.filter(cat => cat.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al eliminar categoría');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategorias();
  }, []);

  return {
    categorias,
    loading,
    error,
    loadCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
  };
};

// Hook para categorías activas (útil para formularios de productos)
export const useCategoriasActivas = () => {
  const [categoriasActivas, setCategoriasActivas] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategoriasActivas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriaService.getActivas();
      setCategoriasActivas(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar categorías activas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoriasActivas();
  }, []);

  return {
    categoriasActivas,
    loading,
    error,
    loadCategoriasActivas,
  };
};
