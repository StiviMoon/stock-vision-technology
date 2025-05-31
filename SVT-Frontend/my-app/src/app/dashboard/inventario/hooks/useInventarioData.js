// hooks/useInventarioData.js
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { productoService, inventarioService } from '@/src/services/api';

export function useInventarioData() {
  const [productos, setProductos] = useState([]);
  const [alertasStock, setAlertasStock] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [productosData, bodegasData, alertasData] = await Promise.all([
        productoService.getProductos(),
        inventarioService.getBodegas(),
        inventarioService.getAlertasStock()
      ]);
      
      setProductos(productosData);
      setBodegas(bodegasData);
      setAlertasStock(alertasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos del inventario');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos automáticamente al montar el componente
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return {
    productos,
    alertasStock,
    bodegas,
    loading,
    cargarDatos,
    setProductos,
    setAlertasStock,
    setBodegas
  };
}