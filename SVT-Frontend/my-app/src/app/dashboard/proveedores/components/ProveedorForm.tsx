import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Proveedor } from './ProveedorDashBoard';
import { CodigoGenerator } from './CodigoGenerator';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Schema para validación del formulario
const proveedorSchema = z.object({
  nombre: z.string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres' }),
  codigo: z.string()
    .min(1, { message: 'El código es obligatorio' })
    .max(50, { message: 'El código no puede exceder 50 caracteres' }),
  contacto: z.string().max(100, { message: 'El contacto no puede exceder 100 caracteres' }).optional(),
  telefono: z.string().max(20, { message: 'El teléfono no puede exceder 20 caracteres' }).optional(),
  email: z.string().email({ message: 'Introduce un email válido' }).optional().or(z.literal('')),
  direccion: z.string().max(200, { message: 'La dirección no puede exceder 200 caracteres' }).optional(),
  tipoProveedor: z.string().optional(),
});

type ProveedorFormValues = z.infer<typeof proveedorSchema>;

interface ProveedorFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formMode: 'create' | 'edit';
  initialData: Proveedor | null;
  onSubmit: (data: ProveedorFormValues) => Promise<{ success: boolean; validationErrors?: Record<string, string>; generalError?: string }>;
}

export default function ProveedorForm({
  isOpen,
  onOpenChange,
  formMode,
  initialData,
  onSubmit
}: ProveedorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [codigoManual, setCodigoManual] = useState(false);

  // Opciones para tipos de proveedor
  const tiposProveedor = [
    { value: "MAYORISTA", label: "Mayorista" },
    { value: "DISTRIBUIDOR", label: "Distribuidor" },
    { value: "FABRICANTE", label: "Fabricante" },
    { value: "IMPORTADOR", label: "Importador" },
    { value: "LOCAL", label: "Local" }
  ];

  // Inicializar el formulario con react-hook-form y zod
  const form = useForm<ProveedorFormValues>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      nombre: '',
      codigo: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: '',
      tipoProveedor: 'MAYORISTA',
    }
  });

  // Generar código automáticamente cuando cambia el nombre o el tipo de proveedor
  const watchNombre = form.watch('nombre');
  const watchTipoProveedor = form.watch('tipoProveedor');

  useEffect(() => {
    if (formMode === 'create' && !codigoManual && watchNombre) {
      const generatedCodigo = CodigoGenerator.generateCodigo(
        watchNombre,
        undefined,
        watchTipoProveedor as any
      );
      form.setValue('codigo', generatedCodigo);
    }
  }, [watchNombre, watchTipoProveedor, formMode, codigoManual, form]);

  // Actualizar el formulario cuando cambian los datos iniciales
  useEffect(() => {
    if (isOpen && initialData) {
      // Para modo edición, cargar datos existentes
      form.reset({
        nombre: initialData.nombre || '',
        codigo: initialData.codigo || '',
        contacto: initialData.contacto || '',
        telefono: initialData.telefono || '',
        email: initialData.email || '',
        direccion: initialData.direccion || '',
        tipoProveedor: 'MAYORISTA', // Valor predeterminado, ajustar según tus necesidades
      });
      setCodigoManual(true); // En edición, asumimos que el código ya existe
    } else if (isOpen) {
      // Para modo creación, restablecer el formulario
      form.reset({
        nombre: '',
        codigo: '',
        contacto: '',
        telefono: '',
        email: '',
        direccion: '',
        tipoProveedor: 'MAYORISTA',
      });
      setCodigoManual(false); // En creación, generamos código automáticamente
    }
    
    // Limpiar errores al abrir/cerrar el modal
    setGeneralError(null);
  }, [isOpen, initialData, form]);

  const toggleCodigoMode = () => {
    setCodigoManual(!codigoManual);
    
    // Si volvemos al modo automático, regenerar el código
    if (codigoManual && watchNombre) {
      const generatedCodigo = CodigoGenerator.generateCodigo(
        watchNombre,
        undefined,
        watchTipoProveedor as any
      );
      form.setValue('codigo', generatedCodigo);
    }
  };

  const handleSubmit = async (values: ProveedorFormValues) => {
    setIsSubmitting(true);
    setGeneralError(null);
    
    try {
      // Eliminar el campo tipoProveedor antes de enviar, ya que no forma parte del modelo
      const { tipoProveedor, ...dataToSubmit } = values;
      
      const result = await onSubmit(dataToSubmit as any);
      
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
            {formMode === 'create' ? 'Crear nuevo proveedor' : 'Editar proveedor'}
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
              {/* Nombre del proveedor */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nombre del proveedor" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo de proveedor */}
              <FormField
                control={form.control}
                name="tipoProveedor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de proveedor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiposProveedor.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Código con toggle para modo manual/automático */}
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <FormLabel htmlFor="codigo" className={form.formState.errors.codigo ? "text-destructive" : ""}>
                  Código <span className="text-destructive">*</span>
                </FormLabel>
                {formMode === 'create' && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={toggleCodigoMode}
                    className="h-6 text-xs"
                  >
                    {codigoManual ? "Generar auto" : "Modo manual"}
                  </Button>
                )}
              </div>
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Código del proveedor" 
                        readOnly={!codigoManual}
                        className={!codigoManual ? "bg-muted cursor-not-allowed" : ""}
                      />
                    </FormControl>
                    {!codigoManual && (
                      <p className="text-xs text-muted-foreground">
                        El código se genera automáticamente basado en el nombre y tipo de proveedor.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="contacto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Persona de contacto</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nombre del contacto" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Teléfono de contacto" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Email de contacto" type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Dirección del proveedor" />
                  </FormControl>
                  <FormMessage />
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
}