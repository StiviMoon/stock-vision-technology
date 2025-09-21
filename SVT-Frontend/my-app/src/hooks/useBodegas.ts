'use client';

import { useState, useEffect, useCallback } from 'react';
import { inventarioService } from '@/src/services/api';
import { Bodega, BodegaCreate, BodegaUpdate } from '@/src/services/interfaces';

export const useBodegas = () => {
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar bodegas
  const loadBodegas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventarioService.getBodegas();
      setBodegas(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar bodegas');
      console.error('Error loading bodegas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear bodega
  const createBodega = useCallback(async (bodegaData: BodegaCreate) => {
    try {
      setError(null);
      const newBodega = await inventarioService.createBodega(bodegaData);
      setBodegas(prev => [...prev, newBodega]);
      return newBodega;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error al crear bodega';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Actualizar bodega
  const updateBodega = useCallback(async (id: number, bodegaData: BodegaUpdate) => {
    try {
      setError(null);
      const updatedBodega = await inventarioService.updateBodega(id, bodegaData);
      setBodegas(prev => prev.map(bodega =>
        bodega.id === id ? updatedBodega : bodega
      ));
      return updatedBodega;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error al actualizar bodega';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Eliminar bodega
  const deleteBodega = useCallback(async (id: number) => {
    try {
      setError(null);
      await inventarioService.deleteBodega(id);
      setBodegas(prev => prev.filter(bodega => bodega.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error al eliminar bodega';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Obtener bodega por ID
  const getBodega = useCallback(async (id: number) => {
    try {
      setError(null);
      return await inventarioService.getBodega(id);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error al obtener bodega';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Cargar bodegas al montar el componente
  useEffect(() => {
    loadBodegas();
  }, [loadBodegas]);

  return {
    bodegas,
    loading,
    error,
    loadBodegas,
    createBodega,
    updateBodega,
    deleteBodega,
    getBodega,
  };
};
