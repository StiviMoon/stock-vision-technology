
// components/InventarioTable.jsx
import { Eye, Edit, History, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState, useEffect } from 'react';
import { proveedorService } from '@/src/services/api';

const getEstadoStock = (stockActual, stockMinimo) => {
  if (stockActual === 0) {
    return { label: 'Sin Stock', variant: 'destructive' };
  } else if (stockActual <= stockMinimo) {
    return { label: 'Stock Bajo', variant: 'warning' };
  }
  return { label: 'Normal', variant: 'success' };
};

const BodegasCell = ({ producto }) => {
  if (!producto.stocks_bodega || producto.stocks_bodega.length === 0) {
    return <span className="text-muted-foreground">Sin bodega</span>;
  }

  // Si tiene una sola bodega
  if (producto.stocks_bodega.length === 1) {
    const stock = producto.stocks_bodega[0];
    return (
      <div className="flex flex-col">
        <span className="font-medium">{stock.bodega.nombre}</span>
        <span className="text-xs text-muted-foreground">
          {stock.cantidad} unidades
        </span>
      </div>
    );
  }

  // Si tiene múltiples bodegas
  return (
    <div className="space-y-1">
      {producto.stocks_bodega.map((stock, index) => (
        <div key={index} className="flex justify-between items-center text-sm">
          <span className="font-medium">{stock.bodega.nombre}</span>
          <Badge variant="outline" className="text-xs ml-2">
            {stock.cantidad}
          </Badge>
        </div>
      ))}
    </div>
  );
};

const getBodegaNombre = (producto) => {
  if (!producto.stocks_bodega || producto.stocks_bodega.length === 0) {
    return 'Sin bodega';
  }

  // Si tiene una sola bodega, mostrar solo el nombre
  if (producto.stocks_bodega.length === 1) {
    return producto.stocks_bodega[0].bodega.nombre;
  }

  // Si tiene múltiples bodegas, mostrar cantidad de bodegas
  return `${producto.stocks_bodega.length} bodegas`;
};

const ProveedorCell = ({ producto, proveedores }) => {
  if (!producto.proveedor_id) {
    return <span className="text-muted-foreground">Sin proveedor</span>;
  }

  // Buscar el proveedor por ID
  const proveedor = proveedores.find(p => p.id === producto.proveedor_id);
  const nombreProveedor = proveedor ? proveedor.nombre : `Proveedor ${producto.proveedor_id}`;

  return (
    <div className="flex items-center gap-1">
    <span className="text-sm">
        {nombreProveedor}
      </span>
    </div>
  );
};

export default function InventarioTable({
  productos,
  onAjusteStock,
  onVerDetalle,
  onVerKardex,
  pagina,
  totalPaginas,
  onPageChange,
  loading
}) {
  const [proveedores, setProveedores] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(false);

  // Cargar proveedores al montar el componente
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        setLoadingProveedores(true);
        const proveedoresData = await proveedorService.getProveedores();
        setProveedores(proveedoresData);
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
      } finally {
        setLoadingProveedores(false);
      }
    };

    fetchProveedores();
  }, []);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos en Inventario</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Bodega</TableHead>
                <TableHead className="text-right">Stock Actual</TableHead>
                <TableHead className="text-right">Stock Mínimo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                      Cargando productos...
                    </div>
                  </TableCell>
                </TableRow>
              ) : productos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    No se encontraron productos con los filtros aplicados
                  </TableCell>
                </TableRow>
              ) : (
                productos.map((producto) => {
                  const estado = getEstadoStock(producto.stock_actual, producto.stock_minimo);
                  return (
                    <TableRow key={producto.id}>
                      <TableCell className="font-medium">{producto.sku}</TableCell>
                      <TableCell>{producto.nombre}</TableCell>
                      <TableCell>{producto.categoria}</TableCell>
                      <TableCell>
                  <ProveedorCell producto={producto} proveedores={proveedores} />
                </TableCell>
                      <TableCell>
                        <BodegasCell producto={producto} />
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
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onVerDetalle(producto)}
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onAjusteStock(producto)}
                            title="Ajustar stock"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onVerKardex(producto)}
                            title="Ver kardex"
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
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Página {pagina} de {totalPaginas}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagina === 1}
                onClick={() => onPageChange(pagina - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagina === totalPaginas}
                onClick={() => onPageChange(pagina + 1)}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
