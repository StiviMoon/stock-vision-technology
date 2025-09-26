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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckCircle, Building } from 'lucide-react';

// Esquema de validación - Coincide exactamente con el backend
const bodegaSchema = z.object({
  nombre: z.string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres' })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s0-9]+$/, { message: 'El nombre solo puede contener letras, números y espacios' }),
  codigo: z.string()
    .min(1, { message: 'El código es obligatorio' })
    .max(50, { message: 'El código no puede exceder 50 caracteres' })
    .regex(/^[A-Z0-9_-]+$/, { message: 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos' }),
  direccion: z.string()
    .max(500, { message: 'La dirección no puede exceder 500 caracteres' })
    .optional()
    .or(z.literal('')),
  encargado: z.string()
    .max(100, { message: 'El nombre del encargado no puede exceder 100 caracteres' })
    .optional()
    .or(z.literal('')),
  telefono: z.string()
    .max(20, { message: 'El teléfono no puede exceder 20 caracteres' })
    .regex(/^[\d\s\-\+\(\)]*$/, { message: 'El teléfono solo puede contener números, espacios, guiones, paréntesis y el símbolo +' })
    .optional()
    .or(z.literal('')),
  activa: z.boolean(),
});

type BodegaFormValues = z.infer<typeof bodegaSchema>;

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<BodegaFormValues>({
    resolver: zodResolver(bodegaSchema),
    defaultValues: {
      nombre: '',
      codigo: '',
      direccion: '',
      encargado: '',
      telefono: '',
      activa: true,
    },
    mode: 'onChange', // Validar en tiempo real
  });

  // Cargar datos de la bodega si estamos editando
  useEffect(() => {
    if (isOpen && bodega) {
      form.reset({
        nombre: bodega.nombre || '',
        codigo: bodega.codigo || '',
        direccion: bodega.direccion || '',
        encargado: bodega.encargado || '',
        telefono: bodega.telefono || '',
        activa: bodega.activa,
      });
    } else if (isOpen) {
      form.reset({
        nombre: '',
        codigo: '',
        direccion: '',
        encargado: '',
        telefono: '',
        activa: true,
      });
    }
    setError(null);
    setSuccessMessage(null);
  }, [bodega, form, isOpen]);

  const handleFormSubmit = async (data: BodegaFormValues) => {
    try {
      setFormLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Preparar los datos para enviar al backend
      const formData: BodegaCreate = {
        nombre: data.nombre.trim(),
        codigo: data.codigo.trim().toUpperCase(),
        direccion: data.direccion?.trim() || undefined,
        encargado: data.encargado?.trim() || undefined,
        telefono: data.telefono?.trim() || undefined,
        activa: data.activa,
      };

      await onSubmit(formData);

      // Mostrar mensaje de éxito
      setSuccessMessage(
        bodega
          ? 'Bodega actualizada exitosamente'
          : 'Bodega creada exitosamente'
      );

      // Cerrar el modal después de un breve delay
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);

    } catch (err: any) {
      const errorMessage = err.response?.data?.detail ||
                          err.message ||
                          'Error al procesar la solicitud';
      setError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {bodega ? (
              <>
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Editar Bodega
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Nueva Bodega
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {bodega
              ? 'Modifica los datos de la bodega'
              : 'Completa los campos para crear una nueva bodega'
            }
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Información Básica
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Nombre
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ej: Bodega Principal"
                          disabled={formLoading || loading}
                          className="transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Código */}
                <FormField
                  control={form.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Código
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ej: BOD001"
                          disabled={formLoading || loading}
                          className="transition-all duration-200"
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Ubicación
              </h3>

              <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Ej: Calle 123 #45-67, Barrio Centro, Ciudad"
                        rows={3}
                        disabled={formLoading || loading}
                        className="transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Información de Contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Información de Contacto
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Encargado */}
                <FormField
                  control={form.control}
                  name="encargado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Encargado</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ej: Juan Pérez"
                          disabled={formLoading || loading}
                          className="transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Teléfono */}
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ej: +57 300 123 4567"
                          disabled={formLoading || loading}
                          className="transition-all duration-200"
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d\s\-\+\(\)]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Estado
              </h3>

              <FormField
                control={form.control}
                name="activa"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={formLoading || loading}
                        className="transition-all duration-200"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        Bodega activa
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Las bodegas inactivas no aparecerán en los formularios de productos
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={formLoading || loading}
                className="transition-all duration-200"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={formLoading || loading}
                className="transition-all duration-200"
              >
                {formLoading || loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {bodega ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  bodega ? 'Actualizar Bodega' : 'Crear Bodega'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
