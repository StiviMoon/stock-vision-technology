'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bodega, BodegaCreate } from '@/src/services/interfaces';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

// Esquema de validación
const bodegaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  codigo: z.string().min(1, 'El código es requerido').max(50, 'El código no puede exceder 50 caracteres'),
  descripcion: z.string().optional(),
  ubicacion: z.string().min(1, 'La ubicación es requerida').max(200, 'La ubicación no puede exceder 200 caracteres'),
  activa: z.boolean().default(true),
});

type BodegaFormData = z.infer<typeof bodegaSchema>;

interface BodegaFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bodega?: Bodega | null;
  onSubmit: (data: BodegaCreate) => Promise<void>;
  loading?: boolean;
}

export const BodegaForm: React.FC<BodegaFormProps> = ({
  isOpen,
  onOpenChange,
  bodega,
  onSubmit,
  loading = false,
}) => {
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BodegaFormData>({
    resolver: zodResolver(bodegaSchema),
    defaultValues: {
      nombre: '',
      codigo: '',
      descripcion: '',
      ubicacion: '',
      activa: true,
    },
  });

  // Cargar datos de la bodega si estamos editando
  useEffect(() => {
    if (bodega) {
      setValue('nombre', bodega.nombre);
      setValue('codigo', bodega.codigo);
      setValue('descripcion', bodega.descripcion || '');
      setValue('ubicacion', bodega.ubicacion);
      setValue('activa', bodega.activa);
    } else {
      reset();
    }
    setError(null);
  }, [bodega, setValue, reset]);

  const handleFormSubmit = async (data: BodegaFormData) => {
    try {
      setFormLoading(true);
      setError(null);
      await onSubmit(data as BodegaCreate);
      onOpenChange(false);
      reset();
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    reset();
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {bodega ? 'Editar Bodega' : 'Nueva Bodega'}
          </DialogTitle>
          <DialogDescription>
            {bodega
              ? 'Modifica los datos de la bodega'
              : 'Completa los campos para crear una nueva bodega'
            }
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                {...register('nombre')}
                placeholder="Ej: Bodega Principal"
                className={errors.nombre ? 'border-red-500' : ''}
              />
              {errors.nombre && (
                <p className="text-sm text-red-500">{errors.nombre.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo">
                Código <span className="text-red-500">*</span>
              </Label>
              <Input
                id="codigo"
                {...register('codigo')}
                placeholder="Ej: BOD001"
                className={errors.codigo ? 'border-red-500' : ''}
              />
              {errors.codigo && (
                <p className="text-sm text-red-500">{errors.codigo.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ubicacion">
              Ubicación <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ubicacion"
              {...register('ubicacion')}
              placeholder="Ej: Calle 123, Ciudad"
              className={errors.ubicacion ? 'border-red-500' : ''}
            />
            {errors.ubicacion && (
              <p className="text-sm text-red-500">{errors.ubicacion.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              {...register('descripcion')}
              placeholder="Descripción opcional de la bodega"
              rows={3}
              className={errors.descripcion ? 'border-red-500' : ''}
            />
            {errors.descripcion && (
              <p className="text-sm text-red-500">{errors.descripcion.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="activa"
              checked={watch('activa')}
              onCheckedChange={(checked) => setValue('activa', checked as boolean)}
            />
            <Label htmlFor="activa" className="text-sm font-medium">
              Bodega activa
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={formLoading || loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={formLoading || loading}
              className="min-w-[100px]"
            >
              {formLoading || loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {bodega ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                bodega ? 'Actualizar' : 'Crear'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
