'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Categoria, CategoriaCreate } from '@/src/services/interfaces';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Schema para validación del formulario - Coincide exactamente con el backend
const categoriaSchema = z.object({
  nombre: z.string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres' })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El nombre solo puede contener letras y espacios' }),
  codigo: z.string()
    .min(1, { message: 'El código es obligatorio' })
    .max(50, { message: 'El código no puede exceder 50 caracteres' })
    .regex(/^[A-Z0-9_]+$/, { message: 'El código solo puede contener letras mayúsculas, números y guiones bajos' }),
  descripcion: z.string()
    .max(500, { message: 'La descripción no puede exceder 500 caracteres' })
    .optional()
    .or(z.literal('')),
  activa: z.boolean(),
});

type CategoriaFormValues = z.infer<typeof categoriaSchema>;

interface CategoriaFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formMode: 'create' | 'edit';
  initialData: Categoria | null;
  onSubmit: (data: CategoriaFormValues) => Promise<{
    success: boolean;
    validationErrors?: Record<string, string>;
    generalError?: string
  }>;
}

export const CategoriaForm: React.FC<CategoriaFormProps> = ({
  isOpen,
  onOpenChange,
  formMode,
  initialData,
  onSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Inicializar el formulario con react-hook-form y zod
  const form = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nombre: '',
      codigo: '',
      descripcion: '',
      activa: true,
    },
    mode: 'onChange', // Validar en tiempo real
  });

  // Actualizar el formulario cuando cambian los datos iniciales
  useEffect(() => {
    if (isOpen && initialData) {
      // Para modo edición, cargar datos existentes
      form.reset({
        nombre: initialData.nombre || '',
        codigo: initialData.codigo || '',
        descripcion: initialData.descripcion || '',
        activa: initialData.activa,
      });
    } else if (isOpen) {
      // Para modo creación, restablecer el formulario
      form.reset({
        nombre: '',
        codigo: '',
        descripcion: '',
        activa: true,
      });
    }

    // Limpiar errores y mensajes al abrir/cerrar el modal
    setGeneralError(null);
    setSuccessMessage(null);
  }, [isOpen, initialData, form]);

  const handleSubmit = async (values: CategoriaFormValues) => {
    setIsSubmitting(true);
    setGeneralError(null);
    setSuccessMessage(null);

    try {
      // Preparar los datos para enviar al backend
      const formData: CategoriaCreate = {
        nombre: values.nombre.trim(),
        codigo: values.codigo.trim().toUpperCase(),
        descripcion: values.descripcion?.trim() || undefined,
        activa: values.activa,
      };

      const result = await onSubmit(formData);

      if (!result.success) {
        // Manejar errores de validación del API
        if (result.validationErrors) {
          Object.entries(result.validationErrors).forEach(([field, message]) => {
            if (field !== 'general') {
              form.setError(field as any, { message });
            }
          });
        }

        // Mostrar mensaje de error general si existe
        if (result.generalError) {
          setGeneralError(result.generalError);
        }

        return;
      }

      // Éxito: mostrar mensaje de éxito
      setSuccessMessage(
        formMode === 'create'
          ? 'Categoría creada exitosamente'
          : 'Categoría actualizada exitosamente'
      );

      // Cerrar el modal después de un breve delay
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);

    } catch (error) {
      setGeneralError('Ha ocurrido un error inesperado');
      console.error('Error en el formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {formMode === 'create' ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Crear nueva categoría
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Editar categoría
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {generalError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{generalError}</AlertDescription>
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre de la categoría */}
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
                        placeholder="Ej: Electrónicos"
                        disabled={isSubmitting}
                        className="transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Código de la categoría */}
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
                        placeholder="Ej: ELEC001"
                        disabled={isSubmitting}
                        className="transition-all duration-200"
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descripción */}
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Descripción de la categoría..."
                      rows={3}
                      disabled={isSubmitting}
                      className="transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estado activo */}
            <FormField
              control={form.control}
              name="activa"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                      className="transition-all duration-200"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium">
                      Categoría activa
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Las categorías inactivas no aparecerán en los formularios de productos
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="transition-all duration-200"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="transition-all duration-200"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {formMode === 'create' ? 'Crear categoría' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
