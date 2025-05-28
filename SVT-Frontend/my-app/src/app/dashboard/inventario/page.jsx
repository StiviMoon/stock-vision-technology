'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  Building2,
  ArrowUpDown,
  Eye,
  Edit,
  History,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { productoService, inventarioService } from '@/src/services/api';
import AjusteInventarioModal from './components/AjusteInventarioModal';
import StockDetalleModal from './components/StockDetalleModal';
import KardexModal from './components/KardexModal';

export default function InventarioPage() {
  const [productos, setProductos] = useState([]);
  const [alertasStock, setAlertasStock] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodega, setSelectedBodega] = useState('todas');
  const [selectedCategoria, setSelectedCategoria] = useState('todas');
  const [selectedEstado, setSelectedEstado] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const productosPorPagina = 5;
  
  // Modales
  const [ajusteModalOpen, setAjusteModalOpen] = useState(false);
  const [stockDetalleModalOpen, setStockDetalleModalOpen] = useState(false);
  const [kardexModalOpen, setKardexModalOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
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
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const matchSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       producto.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = selectedCategoria === 'todas' || producto.categoria === selectedCategoria;
    
    let matchEstado = true;
    if (selectedEstado !== 'todos') {
      if (selectedEstado === 'sin_stock') matchEstado = producto.stock_actual === 0;
      else if (selectedEstado === 'stock_bajo') matchEstado = producto.stock_actual <= producto.stock_minimo && producto.stock_actual > 0;
      else if (selectedEstado === 'normal') matchEstado = producto.stock_actual > producto.stock_minimo;
    }
    
    return matchSearch && matchCategoria && matchEstado;
  });

  // Calcular productos a mostrar en la página actual
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const productosPagina = productosFiltrados.slice(
    (pagina - 1) * productosPorPagina,
    pagina * productosPorPagina
  );

  // Reiniciar página cuando cambian los filtros o productos
  useEffect(() => {
    setPagina(1);
  }, [searchTerm, selectedCategoria, selectedEstado, selectedBodega, productos]);

  // Obtener categorías únicas
  const categorias = [...new Set(productos.map(p => p.categoria))];

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

  const getEstadoStock = (stockActual, stockMinimo) => {
    if (stockActual === 0) {
      return { label: 'Sin Stock', variant: 'destructive' };
    } else if (stockActual <= stockMinimo) {
      return { label: 'Stock Bajo', variant: 'warning' };
    }
    return { label: 'Normal', variant: 'success' };
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Inventario</h1>
        <p className="text-muted-foreground">
          Gestiona el stock de productos y movimientos de inventario
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productos.length}</div>
            <p className="text-xs text-muted-foreground">
              Productos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${productos.reduce((total, p) => total + (p.stock_actual * p.precio_unitario), 0).toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor del inventario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertasStock.length}</div>
            <p className="text-xs text-muted-foreground">
              Productos con alerta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bodegas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bodegas.length}</div>
            <p className="text-xs text-muted-foreground">
              Bodegas activas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categorias.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEstado} onValueChange={setSelectedEstado}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="normal">Stock Normal</SelectItem>
                <SelectItem value="stock_bajo">Stock Bajo</SelectItem>
                <SelectItem value="sin_stock">Sin Stock</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedBodega} onValueChange={setSelectedBodega}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Bodega" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las bodegas</SelectItem>
                {bodegas.map(bodega => (
                  <SelectItem key={bodega.id} value={bodega.id.toString()}>
                    {bodega.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de productos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Productos en Inventario</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={cargarDatos}
            title="Actualizar tabla"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Bodega</TableHead>
                  <TableHead className="text-right">Stock Actual</TableHead>
                  <TableHead className="text-right">Stock Mínimo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productosPagina.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  productosPagina.map((producto) => {
                    const estado = getEstadoStock(producto.stock_actual, producto.stock_minimo);
                    // Buscar la bodega del producto
                    const bodega = bodegas.find(b => b.id === producto.bodega_id);
                    return (
                      <TableRow key={producto.id}>
                        <TableCell className="font-medium">{producto.sku}</TableCell>
                        <TableCell>{producto.nombre}</TableCell>
                        <TableCell>{producto.categoria}</TableCell>
                        <TableCell>
                          {
                            // Busca la bodega por ID
                            bodegas.find(b => b.id === producto.bodega_id)?.nombre || 'Sin bodega'
                          }
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {producto.stock_actual}
                        </TableCell>
                        <TableCell className="text-right">{producto.stock_minimo}</TableCell>
                        <TableCell>
                          <Badge variant={estado.variant}>
                            {estado.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          ${(producto.stock_actual * producto.precio_unitario).toLocaleString('es-CO')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleVerDetalle(producto)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAjusteStock(producto)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleVerKardex(producto)}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex justify-end items-center gap-2 mt-4">
              <Button
                variant="ghost"
                size="icon"
                disabled={pagina === 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Página {pagina} de {totalPaginas}
              </span>
              <Button
                variant="ghost"
                size="icon"
                disabled={pagina === totalPaginas}
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      {selectedProducto && (
        <>
          <AjusteInventarioModal
            open={ajusteModalOpen}
            onClose={() => {
              setAjusteModalOpen(false);
              setSelectedProducto(null);
            }}
            producto={selectedProducto}
            bodegas={bodegas}
            onSuccess={async () => {
              // Espera 500ms antes de recargar los datos
              await new Promise(res => setTimeout(res, 500));
              await cargarDatos();
              setAjusteModalOpen(false);
              setSelectedProducto(null);
            }}
          />
          
          <StockDetalleModal
            open={stockDetalleModalOpen}
            onClose={() => {
              setStockDetalleModalOpen(false);
              setSelectedProducto(null);
            }}
            producto={selectedProducto}
          />
          
          <KardexModal
            open={kardexModalOpen}
            onClose={() => {
              setKardexModalOpen(false);
              setSelectedProducto(null);
            }}
            producto={selectedProducto}
          />
        </>
      )}
    </div>
  );
}