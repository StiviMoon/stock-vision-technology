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
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Schema para validación del formulario
const categoriaSchema = z.object({
  nombre: z.string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres' }),
  codigo: z.string()
    .min(1, { message: 'El código es obligatorio' })
    .max(50, { message: 'El código no puede exceder 50 caracteres' }),
  descripcion: z.string().max(500, { message: 'La descripción no puede exceder 500 caracteres' }).optional(),
  activa: z.boolean(),
});

type CategoriaFormValues = z.infer<typeof categoriaSchema>;

interface CategoriaFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formMode: 'create' | 'edit';
  initialData: Categoria | null;
  onSubmit: (data: CategoriaFormValues) => Promise<{ success: boolean; validationErrors?: Record<string, string>; generalError?: string }>;
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

  // Inicializar el formulario con react-hook-form y zod
  const form = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nombre: '',
      codigo: '',
      descripcion: '',
      activa: true,
    }
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

    // Limpiar errores al abrir/cerrar el modal
    setGeneralError(null);
  }, [isOpen, initialData, form]);

  const handleSubmit = async (values: CategoriaFormValues) => {
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      const result = await onSubmit(values);

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

      // Éxito: el modal será cerrado por el componente padre
    } catch (error) {
      setGeneralError('Ha ocurrido un error inesperado');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>
            {formMode === 'create' ? 'Crear nueva categoría' : 'Editar categoría'}
          </DialogTitle>
        </DialogHeader>

        {generalError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre de la categoría */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Electrónicos" />
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
                    <FormLabel>Código <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ej: ELEC001"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Categoría activa
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {formMode === 'create' ? 'Crear' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
