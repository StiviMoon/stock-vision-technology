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
import { inventarioService, proveedorService } from '@/src/services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Download, ArrowUp, ArrowDown, ArrowLeftRight, ChevronLeft, ChevronRight, FileText, User, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMotivoLabel, getMotivoConfig } from '@/src/config/motivosMovimiento';

export default function KardexModal({ open, onClose, producto }) {
  const [loading, setLoading] = useState(true);
  const [kardexData, setKardexData] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [proveedores, setProveedores] = useState([]);
  const movimientosPorPagina = 5;

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (open && producto) {
      cargarKardex();
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

  // Reiniciar página cuando cambia el producto
  useEffect(() => {
    setPagina(1);
  }, [producto]);

  const cargarKardex = async () => {
    try {
      setLoading(true);

      // Cargar todos los movimientos del producto
      const data = await inventarioService.getKardex(producto.id);
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

  // Función para generar referencia de documento
  const getDocumentoReferencia = (movimiento) => {
    // Si ya tiene documento_referencia, usarlo
    if (movimiento.documento_referencia) {
      return movimiento.documento_referencia;
    }

    // Generar referencia automática basada en el tipo de movimiento
    const fecha = new Date(movimiento.fecha_movimiento);
    const fechaStr = fecha.toISOString().slice(0, 10).replace(/-/g, '');
    const idStr = movimiento.id.toString().padStart(4, '0');

    switch (movimiento.tipo_movimiento) {
      case 'ENTRADA':
      case 'COMPRA':
        return `FAC-${fechaStr}-${idStr}`;
      case 'SALIDA':
      case 'VENTA':
        return `VEN-${fechaStr}-${idStr}`;
      case 'AJUSTE_POSITIVO':
      case 'AJUSTE_NEGATIVO':
        return `AJU-${fechaStr}-${idStr}`;
      case 'TRANSFERENCIA_ENTRADA':
      case 'TRANSFERENCIA_SALIDA':
        return `TRA-${fechaStr}-${idStr}`;
      case 'INVENTARIO_INICIAL':
        return `INI-${fechaStr}-${idStr}`;
      case 'INVENTARIO_FISICO':
        return `FIS-${fechaStr}-${idStr}`;
      default:
        return `MOV-${fechaStr}-${idStr}`;
    }
  };

    // Función para obtener información del proveedor/cliente
  const getEntidadInfo = (movimiento) => {
    // Si el movimiento tiene información de proveedor/cliente directa
    if (movimiento.proveedor) {
      return {
        tipo: 'Proveedor',
        nombre: movimiento.proveedor.nombre,
        icon: Building2,
        color: 'text-blue-600'
      };
    } else if (movimiento.cliente) {
      return {
        tipo: 'Cliente',
        nombre: movimiento.cliente.nombre,
        icon: User,
        color: 'text-green-600'
      };
    }

    // Usar la información del producto del Kardex (que incluye proveedor_id)
    if (kardexData?.producto && kardexData.producto.proveedor_id) {
      const proveedor = proveedores.find(p => p.id === kardexData.producto.proveedor_id);
      const nombreProveedor = proveedor ? proveedor.nombre : `Proveedor ${kardexData.producto.proveedor_id}`;

      return {
        tipo: 'Proveedor',
        nombre: nombreProveedor,
        icon: Building2,
        color: 'text-blue-600'
      };
    }

    return null;
  };



  const exportarKardex = () => {
    if (!kardexData || !kardexData.movimientos) {
      return;
    }

    // Crear contenido CSV
    const headers = [
      'Fecha',
      'Tipo Movimiento',
      'Documento Referencia',
      'Proveedor',
      'Entrada Cantidad',
      'Entrada Valor',
      'Salida Cantidad',
      'Salida Valor',
      'Saldo Cantidad',
      'Saldo Valor',
      'Observaciones',
      'Usuario'
    ];

    const rows = kardexData.movimientos.map(movimiento => {
      const esEntrada = [
        'ENTRADA',
        'AJUSTE_POSITIVO',
        'TRANSFERENCIA_ENTRADA',
        'INVENTARIO_INICIAL',
        'COMPRA',
        'DEVOLUCION_CLIENTE'
      ].includes(movimiento.tipo_movimiento);

      const entidadInfo = getEntidadInfo(movimiento);
      const costoUnitario = movimiento.costo_unitario || producto?.precio_unitario || 0;
      const valorMovimiento = movimiento.cantidad * costoUnitario;
      const valorSaldo = movimiento.stock_posterior * costoUnitario;

      return [
        format(new Date(movimiento.fecha_movimiento), 'dd/MM/yyyy HH:mm', { locale: es }),
        getMotivoLabel(movimiento.tipo_movimiento),
        getDocumentoReferencia(movimiento),
        entidadInfo ? `${entidadInfo.tipo}: ${entidadInfo.nombre}` : '',
        esEntrada ? movimiento.cantidad : '',
        esEntrada ? valorMovimiento.toFixed(2) : '',
        !esEntrada ? movimiento.cantidad : '',
        !esEntrada ? valorMovimiento.toFixed(2) : '',
        movimiento.stock_posterior,
        valorSaldo.toFixed(2),
        movimiento.observaciones || '',
        movimiento.usuario.email
      ];
    });

    // Crear CSV
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `kardex_${producto.sku}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <DialogContent className="sm:max-w-[1400px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Kardex - {producto?.nombre}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col">
          {/* Información del producto */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">SKU</p>
              <p className="font-medium">{kardexData?.producto?.sku || producto?.sku}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stock Actual</p>
              <p className="font-medium">{kardexData?.stock_actual || producto?.stock_actual} unidades</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categoría</p>
              <p className="font-medium">{kardexData?.producto?.categoria || producto?.categoria}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Proveedor</p>
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3 text-blue-600" />
                <p className="font-medium">
                  {kardexData?.producto?.proveedor_id ? (
                    (() => {
                      const proveedor = proveedores.find(p => p.id === kardexData.producto.proveedor_id);
                      return proveedor ? proveedor.nombre : `${kardexData.producto.proveedor_id}`;
                    })()
                  ) : (
                    'Sin proveedor'
                  )}
                </p>
              </div>
            </div>
          </div>



          {/* Información de resultados */}
          {kardexData && (
            <div className="flex justify-between items-center p-3 bg-muted rounded-md">
              <div className="text-sm text-muted-foreground">
                Mostrando {movimientos.length} movimiento(s) del producto
              </div>
              {movimientos.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Página {pagina} de {totalPaginas}
                </div>
              )}
            </div>
          )}

          {/* Tabla de movimientos */}
          <div className="rounded-md border overflow-hidden flex-1 flex flex-col">
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo Mov.</TableHead>
                    <TableHead>Doc. Ref.</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead className="text-right">Entrada (cant/valor)</TableHead>
                    <TableHead className="text-right">Salida (cant/valor)</TableHead>
                    <TableHead className="text-right">Saldo (cant/valor)</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Usuario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <div className="space-y-2 py-4">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : movimientos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        No hay movimientos registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                                        movimientosPagina.map((movimiento) => {
                      const esEntrada = [
                        'ENTRADA',
                        'AJUSTE_POSITIVO',
                        'TRANSFERENCIA_ENTRADA',
                        'INVENTARIO_INICIAL',
                        'COMPRA',
                        'DEVOLUCION_CLIENTE'
                      ].includes(movimiento.tipo_movimiento);

                      const entidadInfo = getEntidadInfo(movimiento);
                      const costoUnitario = movimiento.costo_unitario || producto?.precio_unitario || 0;
                      const valorMovimiento = movimiento.cantidad * costoUnitario;
                      const valorSaldo = movimiento.stock_posterior * costoUnitario;

                      return (
                        <TableRow key={movimiento.id}>
                          <TableCell className="text-sm">
                            {format(new Date(movimiento.fecha_movimiento), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </TableCell>
                          <TableCell>
                            {getTipoMovimientoBadge(movimiento.tipo_movimiento)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-mono">
                                {getDocumentoReferencia(movimiento)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {entidadInfo ? (
                              <div className="flex items-center gap-1">
                                <entidadInfo.icon className={`h-3 w-3 ${entidadInfo.color}`} />
                                <div>
                                  <div className="text-xs text-muted-foreground">{entidadInfo.tipo}</div>
                                  <div className="text-sm font-medium">{entidadInfo.nombre}</div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {esEntrada ? (
                              <div className="text-sm">
                                <div className="font-medium text-green-600">
                                  {movimiento.cantidad} u
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ${valorMovimiento.toLocaleString('es-CO')}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {!esEntrada ? (
                              <div className="text-sm">
                                <div className="font-medium text-red-600">
                                  {movimiento.cantidad} u
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ${valorMovimiento.toLocaleString('es-CO')}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm">
                              <div className="font-bold">
                                {movimiento.stock_posterior} u
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ${valorSaldo.toLocaleString('es-CO')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            <div className="text-xs text-muted-foreground truncate" title={movimiento.observaciones}>
                              {movimiento.observaciones || '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{movimiento.usuario.email}</span>
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
            <Button
              variant="outline"
              size="sm"
              onClick={exportarKardex}
              disabled={!kardexData || !kardexData.movimientos || kardexData.movimientos.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Kardex
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
