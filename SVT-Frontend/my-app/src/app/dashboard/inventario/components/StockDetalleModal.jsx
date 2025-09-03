'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { inventarioService, proveedorService } from '@/src/services/api';
import { Package, Building2, MapPin, User } from 'lucide-react';

export default function StockDetalleModal({ open, onClose, producto }) {
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState(null);
  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    if (open && producto) {
      cargarStockDetalle();
      cargarProveedores();
    }
  }, [open, producto]);

  const cargarProveedores = async () => {
    try {
      const proveedoresData = await proveedorService.getProveedores();
      setProveedores(proveedoresData);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  };

  const cargarStockDetalle = async () => {
    try {
      setLoading(true);
      const data = await inventarioService.getStockProducto(producto.id);
      setStockData(data);
    } catch (error) {
      console.error('Error al cargar detalle de stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const variants = {
      'NORMAL': 'success',
      'STOCK_BAJO': 'warning',
      'SIN_STOCK': 'destructive'
    };

    const labels = {
      'NORMAL': 'Stock Normal',
      'STOCK_BAJO': 'Stock Bajo',
      'SIN_STOCK': 'Sin Stock'
    };

    return (
      <Badge variant={variants[estado] || 'default'}>
        {labels[estado] || estado}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalle de Stock - {producto?.nombre}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : stockData ? (
          <div className="space-y-6">
            {/* Información general */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">SKU</p>
                <p className="font-medium">{producto.sku}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categoría</p>
                <p className="font-medium">{producto.categoria}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Proveedor</p>
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-blue-600" />
                  <p className="font-medium">
                    {producto.proveedor_id ? (
                      (() => {
                        const proveedor = proveedores.find(p => p.id === producto.proveedor_id);
                        return proveedor ? proveedor.nombre : `ID: ${producto.proveedor_id}`;
                      })()
                    ) : (
                      'Sin proveedor'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Resumen de stock */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Resumen de Stock
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{stockData.stock_total}</p>
                  <p className="text-sm text-muted-foreground">Stock Total</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{producto.stock_minimo}</p>
                  <p className="text-sm text-muted-foreground">Stock Mínimo</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  {getEstadoBadge(stockData.estado)}
                  <p className="text-sm text-muted-foreground mt-2">Estado</p>
                </div>
              </div>
            </div>

            {/* Stock por bodega */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Stock por Bodega
              </h3>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bodega</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Porcentaje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockData.stock_por_bodega.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No hay stock registrado en ninguna bodega
                        </TableCell>
                      </TableRow>
                    ) : (
                      stockData.stock_por_bodega.map((stock) => {
                        const porcentaje = stockData.stock_total > 0
                          ? ((stock.cantidad / stockData.stock_total) * 100).toFixed(1)
                          : 0;

                        return (
                          <TableRow key={stock.id}>
                            <TableCell className="font-medium">
                              {stock.bodega.nombre}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                {stock.ubicacion || 'Sin ubicación'}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {stock.cantidad}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${porcentaje}%` }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground w-12 text-right">
                                  {porcentaje}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Valor del inventario */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Valor total del inventario</span>
                <span className="text-xl font-bold">
                  ${(stockData.stock_total * producto.precio_unitario).toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se pudo cargar la información del stock</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
