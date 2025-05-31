// components/InventarioFilters.jsx
import { Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function InventarioFilters({
  searchTerm,
  setSearchTerm,
  selectedCategoria,
  setSelectedCategoria,
  selectedEstado,
  setSelectedEstado,
  selectedBodega,
  setSelectedBodega,
  categorias,
  bodegas,
  onReset,
  totalProductos
}) {
  const hasActiveFilters = searchTerm || selectedCategoria !== 'todas' || 
                          selectedEstado !== 'todos' || selectedBodega !== 'todas';

  const activeFiltersCount = [
    searchTerm,
    selectedCategoria !== 'todas' ? selectedCategoria : null,
    selectedEstado !== 'todos' ? selectedEstado : null,
    selectedBodega !== 'todas' ? selectedBodega : null
  ].filter(Boolean).length;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Filtros</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          {/* Botón limpiar siempre visible pero disabled cuando no hay filtros */}
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="whitespace-nowrap"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Barra de búsqueda - Siempre en la primera fila */}
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Filtros en grid responsive */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Categoría
              </label>
              <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Estado de stock
              </label>
              <Select value={selectedEstado} onValueChange={setSelectedEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="normal">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Stock Normal
                    </div>
                  </SelectItem>
                  <SelectItem value="stock_bajo">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      Stock Bajo
                    </div>
                  </SelectItem>
                  <SelectItem value="sin_stock">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Sin Stock
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Bodega
              </label>
              <Select value={selectedBodega} onValueChange={setSelectedBodega}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar bodega" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las bodegas</SelectItem>
                  {bodegas.map(bodega => (
                    <SelectItem key={bodega.id} value={bodega.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${bodega.activa ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        {bodega.nombre}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resultados y filtros activos */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {totalProductos} producto{totalProductos !== 1 ? 's' : ''} encontrado{totalProductos !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            {/* Filtros activos como tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Filtros:</span>
                
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    Búsqueda: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {selectedCategoria !== 'todas' && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedCategoria}
                    <button
                      onClick={() => setSelectedCategoria('todas')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {selectedEstado !== 'todos' && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedEstado === 'stock_bajo' ? 'Stock Bajo' : 
                     selectedEstado === 'sin_stock' ? 'Sin Stock' : 'Stock Normal'}
                    <button
                      onClick={() => setSelectedEstado('todos')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {selectedBodega !== 'todas' && (
                  <Badge variant="secondary" className="text-xs">
                    {bodegas.find(b => b.id.toString() === selectedBodega)?.nombre || 'Bodega'}
                    <button
                      onClick={() => setSelectedBodega('todas')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}