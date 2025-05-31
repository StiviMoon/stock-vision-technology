'use client';

import { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Componentes separados
import InventarioStats from './components/InventarioStats';
import InventarioFilters from './components/InventarioFilters';
import InventarioTable from './components/InventarioTable';
import AjusteInventarioModal from './components/AjusteInventarioModal';
import StockDetalleModal from './components/StockDetalleModal';
import KardexModal from './components/KardexModal';

// Hooks personalizados
import { useInventarioFilters } from './hooks/useInventarioFilters';
import { useInventarioPagination } from './hooks/useInventarioPagination';
import { useInventarioData } from './hooks/useInventarioData';

export default function InventarioPage() {
  // Hook para datos del inventario (se encarga de cargar automáticamente)
  const {
    productos,
    alertasStock,
    bodegas,
    loading,
    cargarDatos
  } = useInventarioData();
  
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
    resetFilters
  } = useInventarioFilters();

  // Productos filtrados (memoizado para eficiencia)
  const productosFiltrados = useMemo(() => {
    return productos.filter(producto => {
      // Filtro de búsqueda
      const matchSearch = !searchTerm || 
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.sku.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de categoría
      const matchCategoria = selectedCategoria === 'todas' || 
        producto.categoria === selectedCategoria;

      // Filtro de bodega (corregido)
      const matchBodega = selectedBodega === 'todas' || 
        producto.stocks_bodega?.some(stock => stock.bodega_id.toString() === selectedBodega);

      // Filtro de estado
      let matchEstado = true;
      if (selectedEstado !== 'todos') {
        if (selectedEstado === 'sin_stock') {
          matchEstado = producto.stock_actual === 0;
        } else if (selectedEstado === 'stock_bajo') {
          matchEstado = producto.stock_actual <= producto.stock_minimo && producto.stock_actual > 0;
        } else if (selectedEstado === 'normal') {
          matchEstado = producto.stock_actual > producto.stock_minimo;
        }
      }

      return matchSearch && matchCategoria && matchBodega && matchEstado;
    });
  }, [productos, searchTerm, selectedCategoria, selectedBodega, selectedEstado]);

  // Hook personalizado para paginación
  const {
    pagina,
    setPagina,
    productosPagina,
    totalPaginas
  } = useInventarioPagination(productosFiltrados, 10);

  // Categorías únicas (memoizado)
  const categorias = useMemo(() => {
    return [...new Set(productos.map(p => p.categoria))];
  }, [productos]);

  // Funciones para manejar modales
  const handleAjusteStock = (producto) => {
    setSelectedProducto(producto);
    setAjusteModalOpen(true);
  };

  const handleVerDetalle = (producto) => {
    setSelectedProducto(producto);
    setStockDetalleModalOpen(true);
  };

  const handleVerKardex = (producto) => {
    setSelectedProducto(producto);
    setKardexModalOpen(true);
  };

  const handleModalClose = (modalType) => {
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
    // Esperar un poco y recargar datos
    await new Promise(res => setTimeout(res, 500));
    await cargarDatos();
    handleModalClose('ajuste');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inventario</h1>
          <p className="text-muted-foreground">
            Gestiona el stock de productos y movimientos de inventario
          </p>
        </div>
        <Button
          variant="outline"
          onClick={cargarDatos}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      <InventarioStats 
        productos={productos}
        alertasStock={alertasStock}
        bodegas={bodegas}
      />

      {/* Filtros */}
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

      {/* Tabla de productos */}
      <InventarioTable
        productos={productosPagina}
        onAjusteStock={handleAjusteStock}
        onVerDetalle={handleVerDetalle}
        onVerKardex={handleVerKardex}
        pagina={pagina}
        totalPaginas={totalPaginas}
        onPageChange={setPagina}
        loading={loading}
      />

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