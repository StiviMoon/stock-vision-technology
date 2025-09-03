'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { getMotivosAjuste } from '@/src/config/motivosMovimiento';
import { useAjustarInventarioOptimized } from '@/src/hooks/useInventarioOptimized';
import { Building2 } from 'lucide-react';
import { proveedorService } from '@/src/services/api';

export default function AjusteInventarioModal({
  open,
  onClose,
  producto,
  bodegas,
  onSuccess,
}) {
  const [tipoAjuste, setTipoAjuste] = useState('positivo');
  const [formData, setFormData] = useState({
    bodega_id: '',
    cantidad: '',
    motivo: '',
    observaciones: '',
  });
  const [proveedores, setProveedores] = useState([]);

  // Hook de React Query para ajustar inventario
  const ajustarInventario = useAjustarInventarioOptimized();

  // Actualizar bodega_id cuando las bodegas se carguen
  useEffect(() => {
    if (bodegas && bodegas.length > 0 && !formData.bodega_id) {
      setFormData(prev => ({
        ...prev,
        bodega_id: bodegas[0].id.toString(),
      }));
    }
  }, [bodegas]);

  // Cargar proveedores al abrir el modal
  useEffect(() => {
    if (open) {
      cargarProveedores();
    }
  }, [open]);

  const cargarProveedores = async () => {
    try {
      const proveedoresData = await proveedorService.getProveedores();
      setProveedores(proveedoresData);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  };

  const motivosAjuste = getMotivosAjuste();

  const handleSubmit = async e => {
    e.preventDefault();

    if (!bodegas || bodegas.length === 0) {
      toast.error('No hay bodegas disponibles');
      return;
    }

    if (!formData.cantidad || !formData.motivo || !formData.bodega_id) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      const cantidad =
        tipoAjuste === 'negativo'
          ? -Math.abs(parseInt(formData.cantidad))
          : Math.abs(parseInt(formData.cantidad));

      await ajustarInventario.mutateAsync({
        producto_id: producto.id,
        bodega_id: parseInt(formData.bodega_id),
        cantidad: cantidad,
        motivo: formData.motivo,
        observaciones: formData.observaciones,
      });

      // El toast de éxito se maneja automáticamente en el hook
      handleClose();

      // Llamar onSuccess después de cerrar para asegurar que se ejecute
      setTimeout(() => {
        onSuccess();
      }, 100);
    } catch (error) {
      console.error('Error al ajustar inventario:', error);
      // El error ya se maneja en el hook de React Query
    }
  };

  const handleClose = () => {
    setFormData({
      bodega_id: bodegas && bodegas.length > 0 ? bodegas[0].id.toString() : '',
      cantidad: '',
      motivo: '',
      observaciones: '',
    });
    setTipoAjuste('positivo');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Ajustar Inventario - {producto?.nombre}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            {/* Información del producto */}
            <div className='grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg'>
              <div>
                <p className='text-sm text-muted-foreground'>SKU</p>
                <p className='font-medium'>{producto?.sku}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Stock Actual</p>
                <p className='font-medium'>{producto?.stock_actual} unidades</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Proveedor</p>
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-blue-600" />
                  <p className='font-medium'>
                    {producto?.proveedor_id ? (
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

            {/* Tipo de ajuste */}
            <div className='space-y-2'>
              <Label>Tipo de Ajuste</Label>
              <RadioGroup value={tipoAjuste} onValueChange={setTipoAjuste}>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='positivo' id='positivo' />
                  <Label htmlFor='positivo' className='font-normal'>
                    Ajuste Positivo (Aumentar stock)
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='negativo' id='negativo' />
                  <Label htmlFor='negativo' className='font-normal'>
                    Ajuste Negativo (Disminuir stock)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Bodega */}
            <div className='space-y-2'>
              <Label htmlFor='bodega'>Bodega</Label>
              {bodegas && bodegas.length > 0 ? (
                <Select
                  value={formData.bodega_id.toString()}
                  onValueChange={value =>
                    setFormData({ ...formData, bodega_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccione una bodega' />
                  </SelectTrigger>
                  <SelectContent>
                    {bodegas.map(bodega => (
                      <SelectItem key={bodega.id} value={bodega.id.toString()}>
                        {bodega.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className='p-3 text-sm text-muted-foreground border rounded-md'>
                  No hay bodegas disponibles
                </div>
              )}
            </div>

            {/* Cantidad */}
            <div className='space-y-2'>
              <Label htmlFor='cantidad'>Cantidad</Label>
              <Input
                id='cantidad'
                type='number'
                min='1'
                value={formData.cantidad}
                onChange={e =>
                  setFormData({ ...formData, cantidad: e.target.value })
                }
                placeholder='Ingrese la cantidad'
                required
              />
            </div>

            {/* Motivo */}
            <div className='space-y-2'>
              <Label htmlFor='motivo'>Motivo del Ajuste</Label>
              <Select
                value={formData.motivo}
                onValueChange={value =>
                  setFormData({ ...formData, motivo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Seleccione un motivo' />
                </SelectTrigger>
                <SelectContent>
                  {motivosAjuste.map(motivo => (
                    <SelectItem key={motivo.value} value={motivo.value}>
                      {motivo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Observaciones */}
            <div className='space-y-2'>
              <Label htmlFor='observaciones'>Observaciones</Label>
              <Textarea
                id='observaciones'
                value={formData.observaciones}
                onChange={e =>
                  setFormData({ ...formData, observaciones: e.target.value })
                }
                placeholder='Ingrese observaciones adicionales (opcional)'
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={handleClose}>
              Cancelar
            </Button>
            <Button type='submit' disabled={ajustarInventario.isPending}>
              {ajustarInventario.isPending
                ? 'Procesando...'
                : 'Confirmar Ajuste'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
