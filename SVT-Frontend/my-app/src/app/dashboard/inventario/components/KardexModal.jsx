'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { inventarioService } from '@/src/services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Download, ArrowUp, ArrowDown, ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KardexModal({ open, onClose, producto }) {
  const [loading, setLoading] = useState(true);
  const [kardexData, setKardexData] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [pagina, setPagina] = useState(1);
  const movimientosPorPagina = 5;

  useEffect(() => {
    if (open && producto) {
      cargarKardex();
    }
  }, [open, producto, fechaInicio, fechaFin]);

  // Reiniciar página cuando cambian filtros o producto
  useEffect(() => {
    setPagina(1);
  }, [producto, fechaInicio, fechaFin]);

  const cargarKardex = async () => {
    try {
      setLoading(true);
      const data = await inventarioService.getKardex(
        producto.id,
        fechaInicio ? format(fechaInicio, 'yyyy-MM-dd') : undefined,
        fechaFin ? format(fechaFin, 'yyyy-MM-dd') : undefined
      );
      setKardexData(data);
    } catch (error) {
      console.error('Error al cargar kardex:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoMovimientoBadge = (tipo) => {
    const config = {
      'ENTRADA': { label: 'Entrada', variant: 'success', icon: ArrowDown },
      'SALIDA': { label: 'Salida', variant: 'destructive', icon: ArrowUp },
      'AJUSTE_POSITIVO': { label: 'Ajuste +', variant: 'success', icon: ArrowDown },
      'AJUSTE_NEGATIVO': { label: 'Ajuste -', variant: 'destructive', icon: ArrowUp },
      'TRANSFERENCIA_ENTRADA': { label: 'Transfer. Entrada', variant: 'default', icon: ArrowLeftRight },
      'TRANSFERENCIA_SALIDA': { label: 'Transfer. Salida', variant: 'default', icon: ArrowLeftRight },
      'INVENTARIO_INICIAL': { label: 'Inv. Inicial', variant: 'secondary', icon: ArrowDown },
      'INVENTARIO_FISICO': { label: 'Inv. Físico', variant: 'secondary', icon: ArrowLeftRight }
    };

    const conf = config[tipo] || { label: tipo, variant: 'default', icon: ArrowLeftRight };
    const Icon = conf.icon;

    return (
      <Badge variant={conf.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {conf.label}
      </Badge>
    );
  };

  const getMotivoLabel = (motivo) => {
    const motivos = {
      'COMPRA': 'Compra',
      'VENTA': 'Venta',
      'DEVOLUCION_CLIENTE': 'Devolución Cliente',
      'DEVOLUCION_PROVEEDOR': 'Devolución Proveedor',
      'AJUSTE_STOCK': 'Ajuste de Stock',
      'CONTEO_FISICO': 'Conteo Físico',
      'PRODUCTO_DANADO': 'Producto Dañado',
      'PRODUCTO_VENCIDO': 'Producto Vencido',
      'ERROR_SISTEMA': 'Error Sistema',
      'ROBO_PERDIDA': 'Robo/Pérdida',
      'TRANSFERENCIA': 'Transferencia',
      'OTRO': 'Otro'
    };
    return motivos[motivo] || motivo;
  };

  const limpiarFiltros = () => {
    setFechaInicio(null);
    setFechaFin(null);
  };

  // Paginación
  const movimientos = kardexData?.movimientos || [];
  const totalPaginas = Math.ceil(movimientos.length / movimientosPorPagina);
  const movimientosPagina = movimientos.slice(
    (pagina - 1) * movimientosPorPagina,
    pagina * movimientosPorPagina
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Kardex - {producto?.nombre}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col">
          {/* Información del producto */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">SKU</p>
              <p className="font-medium">{producto?.sku}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stock Actual</p>
              <p className="font-medium">{kardexData?.stock_actual || producto?.stock_actual} unidades</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categoría</p>
              <p className="font-medium">{producto?.categoria}</p>
            </div>
          </div>

          {/* Filtros de fecha */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Fecha Inicio</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaInicio ? format(fechaInicio, 'PPP', { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fechaInicio}
                    onSelect={setFechaInicio}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Fecha Fin</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaFin && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaFin ? format(fechaFin, 'PPP', { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fechaFin}
                    onSelect={setFechaFin}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button variant="outline" onClick={limpiarFiltros}>
              Limpiar
            </Button>
          </div>

          {/* Tabla de movimientos */}
          <div className="rounded-md border overflow-hidden flex-1 flex flex-col">
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead className="text-right">Entrada</TableHead>
                    <TableHead className="text-right">Salida</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead>Usuario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <div className="space-y-2 py-4">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : movimientos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No hay movimientos registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    movimientosPagina.map((movimiento) => {
                      const esEntrada = [
                        'ENTRADA', 
                        'AJUSTE_POSITIVO', 
                        'TRANSFERENCIA_ENTRADA',
                        'INVENTARIO_INICIAL'
                      ].includes(movimiento.tipo_movimiento);
                      
                      return (
                        <TableRow key={movimiento.id}>
                          <TableCell>
                            {format(new Date(movimiento.fecha_movimiento), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </TableCell>
                          <TableCell>
                            {getTipoMovimientoBadge(movimiento.tipo_movimiento)}
                          </TableCell>
                          <TableCell>{getMotivoLabel(movimiento.motivo)}</TableCell>
                          <TableCell>
                            {movimiento.documento_referencia || '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {esEntrada ? movimiento.cantidad : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium text-red-600">
                            {!esEntrada ? movimiento.cantidad : '-'}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {movimiento.stock_posterior}
                          </TableCell>
                          <TableCell>{movimiento.usuario.email}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Paginación */}
            {movimientos.length > 0 && (
              <div className="flex justify-end items-center gap-2 p-2 border-t bg-muted">
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
          </div>

          {/* Botón de exportar */}
          <div className="flex justify-end">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar Kardex
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}