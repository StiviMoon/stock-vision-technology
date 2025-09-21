import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";

import ProductoRow from './ProductoRow';

export default function ProductoTable({ productos, onEdit, onDelete }) {
  // Estado para los productos filtrados
  const [filteredProductos, setFilteredProductos] = useState(productos);

  // Estado para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // Cambiado de '' a 'all'
  const [stockFilter, setStockFilter] = useState('all'); // Cambiado de '' a 'all'
  const [activeFilters, setActiveFilters] = useState([]);
  const [pagina, setPagina] = useState(1);
  const productosPorPagina = 10;

  // Opciones de categorías disponibles (generadas dinámicamente)
  const availableCategories = [...new Set(productos.map(p => p.categoria_nombre))].filter(Boolean);

  // Opciones para filtro de stock
  const stockOptions = [
    { value: 'low', label: 'Stock Bajo' },
    { value: 'available', label: 'Disponible' },
    { value: 'out', label: 'Agotado' }
  ];

  // Actualizar productos filtrados cuando cambian los filtros o los productos
  useEffect(() => {
    let result = [...productos];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      result = result.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por categoría
    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter(producto => producto.categoria_nombre === categoryFilter);
    }

    // Filtrar por estado de stock
    if (stockFilter && stockFilter !== 'all') {
      switch (stockFilter) {
        case 'low':
          result = result.filter(producto =>
            producto.stock_actual > 0 && producto.stock_actual <= producto.stock_minimo
          );
          break;
        case 'available':
          result = result.filter(producto => producto.stock_actual > 0);
          break;
        case 'out':
          result = result.filter(producto => producto.stock_actual === 0);
          break;
        default:
          break;
      }
    }

    setFilteredProductos(result);

    // Actualizar filtros activos para mostrar badges
    const newActiveFilters = [];
    if (searchTerm) {
      newActiveFilters.push({ type: 'search', value: searchTerm });
    }
    if (categoryFilter && categoryFilter !== 'all') {
      newActiveFilters.push({ type: 'category', value: categoryFilter });
    }
    if (stockFilter && stockFilter !== 'all') {
      const stockLabel = stockOptions.find(opt => opt.value === stockFilter)?.label || stockFilter;
      newActiveFilters.push({ type: 'stock', value: stockLabel });
    }
    setActiveFilters(newActiveFilters);
  }, [productos, searchTerm, categoryFilter, stockFilter]);

  // Reiniciar página cuando cambian los filtros o productos
  useEffect(() => {
    setPagina(1);
  }, [searchTerm, categoryFilter, stockFilter, productos]);

  // Calcular productos a mostrar en la página actual
  const totalPaginas = Math.ceil(filteredProductos.length / productosPorPagina);
  const productosPagina = filteredProductos.slice(
    (pagina - 1) * productosPorPagina,
    pagina * productosPorPagina
  );

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStockFilter('all');
  };

  // Eliminar un filtro específico
  const removeFilter = (filterType) => {
    switch (filterType) {
      case 'search':
        setSearchTerm('');
        break;
      case 'category':
        setCategoryFilter('all');
        break;
      case 'stock':
        setStockFilter('all');
        break;
      default:
        break;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Productos</span>
          <span className="text-sm text-muted-foreground">
            {filteredProductos.length} de {productos.length} productos
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Controles de búsqueda y filtros */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-3 sm:flex-nowrap">
            {/* Búsqueda */}
            <div className="relative w-full sm:w-1/2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, SKU o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>

            {/* Filtro de categoría */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px] ">
                <SelectValue placeholder="Categoría"  />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro de stock */}
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado de stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el stock</SelectItem>
                {stockOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Badges de filtros activos */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Filter className="mr-1 h-4 w-4" />
                <span>Filtros:</span>
              </div>

              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {filter.type === 'search' && 'Búsqueda:'}
                  {filter.type === 'category' && 'Categoría:'}
                  {filter.type === 'stock' && 'Stock:'}
                  {filter.value}
                  <button
                    onClick={() => removeFilter(filter.type)}
                    className="ml-1 rounded-full cursor-pointer p-0.5 hover:bg-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground text-xs h-7 px-2 cursor-pointer"
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Tabla de Productos */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productosPagina.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    {productos.length === 0
                      ? "No hay productos disponibles"
                      : "No se encontraron productos con los filtros aplicados"}
                  </TableCell>
                </TableRow>
              ) : (
                productosPagina.map((producto) => (
                  <ProductoRow
                    key={producto.id}
                    producto={producto}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
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
  );
}
