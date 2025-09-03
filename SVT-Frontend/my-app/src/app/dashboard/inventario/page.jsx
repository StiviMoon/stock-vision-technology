'use client';

import { useState, useMemo, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Componentes separados
import InventarioStats from './components/InventarioStats';
import InventarioFilters from './components/InventarioFilters';
import InventarioTable from './components/InventarioTable';
import AjusteInventarioModal from './components/AjusteInventarioModal';
import StockDetalleModal from './components/StockDetalleModal';
import KardexModal from './components/KardexModal';

// Hooks optimizados de React Query
import {
  useInventarioProductosOptimized,
  useInventarioBodegasOptimized,
  useInventarioAlertasOptimized,
  useSincronizarInventarioOptimized,
} from '@/src/hooks/useInventarioOptimized';

// Hooks personalizados para filtros y paginación
import { useInventarioFilters } from './hooks/useInventarioFilters';
import { useInventarioPagination } from './hooks/useInventarioPagination';

export default function InventarioPage() {
  // Estado para animaciones de entrada
  const [isVisible, setIsVisible] = useState(false);

  // Estados de modales
  const [ajusteModalOpen, setAjusteModalOpen] = useState(false);
  const [stockDetalleModalOpen, setStockDetalleModalOpen] = useState(false);
  const [kardexModalOpen, setKardexModalOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);

  // Hook personalizado para filtros
  const {
    searchTerm,
    setSearchTerm,
    selectedBodega,
    setSelectedBodega,
    selectedCategoria,
    setSelectedCategoria,
    selectedEstado,
    setSelectedEstado,
    resetFilters,
  } = useInventarioFilters();

  // Hooks de React Query para datos
  const {
    data: productos = [],
    isLoading: productosLoading,
    error: productosError,
    refetch: refetchProductos,
  } = useInventarioProductosOptimized();

  const { data: bodegas = [], isLoading: bodegasLoading } =
    useInventarioBodegasOptimized(true);

  const { data: alertasStock = [], isLoading: alertasLoading } =
    useInventarioAlertasOptimized();

  // Hook para sincronización manual
  const { sincronizarTodo } = useSincronizarInventarioOptimized();

  // Productos filtrados (memoizado para eficiencia)
  const productosFiltrados = useMemo(() => {
    return productos.filter(producto => {
      // Filtro de búsqueda
      const matchSearch =
        !searchTerm ||
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.sku.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de categoría
      const matchCategoria =
        selectedCategoria === 'todas' ||
        producto.categoria === selectedCategoria;

      // Filtro de bodega (corregido)
      const matchBodega =
        selectedBodega === 'todas' ||
        producto.stocks_bodega?.some(
          stock => stock.bodega_id.toString() === selectedBodega
        );

      // Filtro de estado
      let matchEstado = true;
      if (selectedEstado !== 'todos') {
        if (selectedEstado === 'sin_stock') {
          matchEstado = producto.stock_actual === 0;
        } else if (selectedEstado === 'stock_bajo') {
          matchEstado =
            producto.stock_actual <= producto.stock_minimo &&
            producto.stock_actual > 0;
        } else if (selectedEstado === 'normal') {
          matchEstado = producto.stock_actual > producto.stock_minimo;
        }
      }

      return matchSearch && matchCategoria && matchBodega && matchEstado;
    });
  }, [
    productos,
    searchTerm,
    selectedCategoria,
    selectedBodega,
    selectedEstado,
  ]);

  // Hook personalizado para paginación
  const { pagina, setPagina, productosPagina, totalPaginas } =
    useInventarioPagination(productosFiltrados, 10);

  // Categorías únicas (memoizado)
  const categorias = useMemo(() => {
    return [...new Set(productos.map(p => p.categoria))];
  }, [productos]);

  // Estados de loading
  const isLoading = productosLoading || bodegasLoading || alertasLoading;

  // Activar animaciones de entrada
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Funciones para manejar modales
  const handleAjusteStock = producto => {
    setSelectedProducto(producto);
    setAjusteModalOpen(true);
  };

  const handleVerDetalle = producto => {
    setSelectedProducto(producto);
    setStockDetalleModalOpen(true);
  };

  const handleVerKardex = producto => {
    setSelectedProducto(producto);
    setKardexModalOpen(true);
  };

  const handleModalClose = modalType => {
    switch (modalType) {
      case 'ajuste':
        setAjusteModalOpen(false);
        break;
      case 'detalle':
        setStockDetalleModalOpen(false);
        break;
      case 'kardex':
        setKardexModalOpen(false);
        break;
    }
    setSelectedProducto(null);
  };

  const handleAjusteSuccess = async () => {
    // React Query se encarga automáticamente de invalidar y refetch
    // Solo cerramos el modal
    handleModalClose('ajuste');
    // El toast de éxito se maneja automáticamente en el hook
  };

  const handleRefresh = () => {
    // Sincronizar todo el inventario
    sincronizarTodo();
    refetchProductos();
  };

  // Manejo de errores
  if (productosError) {
    return (
      <div className='p-6 md:p-8'>
        <div className='text-center py-8'>
          <h2 className='text-xl font-semibold text-red-600 mb-2'>
            Error al cargar el inventario
          </h2>
          <p className='text-muted-foreground mb-4'>
            {productosError.message || 'Ha ocurrido un error inesperado'}
          </p>
          <Button onClick={handleRefresh} variant='outline'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='p-6 md:p-6 space-y-6 flex flex-col'>
      {/* Header con animación */}
      <div
        className={`mb-8 flex justify-between items-start transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        style={{ transitionDelay: '200ms' }}
      >
        <div>
          <h1
            className={`text-3xl font-bold mb-2 transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
            style={{ transitionDelay: '300ms' }}
          >
            Inventario
          </h1>
          <p
            className={`text-muted-foreground transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            style={{ transitionDelay: '400ms' }}
          >
            Gestiona el stock de productos y movimientos de inventario
          </p>
        </div>
        <Button
          variant='outline'
          onClick={handleRefresh}
          disabled={isLoading}
          className={`transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
          style={{ transitionDelay: '500ms' }}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
          />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas con animación */}
      <div
        className={`transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: '600ms' }}
      >
        <InventarioStats
          productos={productos}
          alertasStock={alertasStock}
          bodegas={bodegas}
        />
      </div>

      {/* Filtros con animación */}
      <div
        className={`transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: '700ms' }}
      >
        <InventarioFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategoria={selectedCategoria}
          setSelectedCategoria={setSelectedCategoria}
          selectedEstado={selectedEstado}
          setSelectedEstado={setSelectedEstado}
          selectedBodega={selectedBodega}
          setSelectedBodega={setSelectedBodega}
          categorias={categorias}
          bodegas={bodegas}
          onReset={resetFilters}
          totalProductos={productosFiltrados.length}
        />
      </div>

      {/* Tabla de productos con animación */}
      <div
        className={`transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: '800ms' }}
      >
        <InventarioTable
          productos={productosPagina}
          onAjusteStock={handleAjusteStock}
          onVerDetalle={handleVerDetalle}
          onVerKardex={handleVerKardex}
          pagina={pagina}
          totalPaginas={totalPaginas}
          onPageChange={setPagina}
          loading={isLoading}
        />
      </div>

      {/* Modales */}
      {selectedProducto && (
        <>
          <AjusteInventarioModal
            open={ajusteModalOpen}
            onClose={() => handleModalClose('ajuste')}
            producto={selectedProducto}
            bodegas={bodegas}
            onSuccess={handleAjusteSuccess}
          />

          <StockDetalleModal
            open={stockDetalleModalOpen}
            onClose={() => handleModalClose('detalle')}
            producto={selectedProducto}
          />

          <KardexModal
            open={kardexModalOpen}
            onClose={() => handleModalClose('kardex')}
            producto={selectedProducto}
          />
        </>
      )}
    </div>
  );
}
