'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '../../../../components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, User, Mail, Lock, UserCheck } from 'lucide-react';
import { Usuario, UsuarioCreate, UsuarioUpdate, UserFormProps, Rol } from '../types';

// Esquema de validación para crear usuario
const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  rol: z.enum(['ADMIN', 'USUARIO', 'INVITADO'] as const),
});

// Esquema de validación para editar usuario
const updateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  rol: z.enum(['ADMIN', 'USUARIO', 'INVITADO'] as const).optional(),
  activo: z.boolean().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export default function UserForm({
  isOpen,
  onOpenChange,
  formMode,
  initialData,
  onSubmit,
}: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');

  const isCreateMode = formMode === 'create';
  const schema = isCreateMode ? createUserSchema : updateUserSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(schema),
    defaultValues: isCreateMode ? {
      email: initialData?.email || '',
      password: '',
      nombre: initialData?.nombre || '',
      apellido: initialData?.apellido || '',
      rol: (initialData?.rol as Rol) || 'USUARIO',
    } : {
      email: initialData?.email || '',
      nombre: initialData?.nombre || '',
      apellido: initialData?.apellido || '',
      rol: (initialData?.rol as Rol) || 'USUARIO',
      activo: initialData?.activo ?? true,
    },
  });

  // Resetear formulario cuando cambie el modo o los datos iniciales
  useEffect(() => {
    if (isOpen) {
      reset(isCreateMode ? {
        email: initialData?.email || '',
        password: '',
        nombre: initialData?.nombre || '',
        apellido: initialData?.apellido || '',
        rol: (initialData?.rol as Rol) || 'USUARIO',
      } : {
        email: initialData?.email || '',
        nombre: initialData?.nombre || '',
        apellido: initialData?.apellido || '',
        rol: (initialData?.rol as Rol) || 'USUARIO',
        activo: initialData?.activo ?? true,
      });
      setValidationErrors({});
      setGeneralError('');
    }
  }, [isOpen, formMode, initialData, reset, isCreateMode]);

  const handleFormSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    setIsSubmitting(true);
    setValidationErrors({});
    setGeneralError('');

    try {
      const result = await onSubmit(data);

      if (result.success) {
        onOpenChange(false);
        reset();
      } else {
        if (result.validationErrors) {
          setValidationErrors(result.validationErrors);
        }
        if (result.generalError) {
          setGeneralError(result.generalError);
        }
      }
    } catch (error) {
      console.error('Error en el formulario:', error);
      setGeneralError('Ocurrió un error inesperado. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      reset();
      setValidationErrors({});
      setGeneralError('');
    }
  };

  const rolOptions: { value: Rol; label: string }[] = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'USUARIO', label: 'Usuario' },
    { value: 'INVITADO', label: 'Invitado' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isCreateMode ? 'Crear Usuario' : 'Editar Usuario'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="usuario@ejemplo.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
            {validationErrors.email && (
              <p className="text-sm text-destructive">{validationErrors.email}</p>
            )}
          </div>

          {/* Contraseña (solo para crear) */}
          {isCreateMode && (
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Contraseña *
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Mínimo 6 caracteres"
                disabled={isSubmitting}
              />
              {isCreateMode && (errors as any).password && (
                <p className="text-sm text-destructive">{(errors as any).password?.message}</p>
              )}
              {isCreateMode && validationErrors.password && (
                <p className="text-sm text-destructive">{validationErrors.password}</p>
              )}
            </div>
          )}

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre
              </Label>
              <Input
                id="nombre"
                {...register('nombre')}
                placeholder="Nombre"
                disabled={isSubmitting}
              />
              {errors.nombre && (
                <p className="text-sm text-destructive">{errors.nombre.message}</p>
              )}
              {validationErrors.nombre && (
                <p className="text-sm text-destructive">{validationErrors.nombre}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Apellido
              </Label>
              <Input
                id="apellido"
                {...register('apellido')}
                placeholder="Apellido"
                disabled={isSubmitting}
              />
              {errors.apellido && (
                <p className="text-sm text-destructive">{errors.apellido.message}</p>
              )}
              {validationErrors.apellido && (
                <p className="text-sm text-destructive">{validationErrors.apellido}</p>
              )}
            </div>
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <Label htmlFor="rol" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Rol *
            </Label>
            <Select
              value={watch('rol')}
              onValueChange={(value) => setValue('rol', value as Rol)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {rolOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rol && (
              <p className="text-sm text-destructive">{errors.rol.message}</p>
            )}
            {validationErrors.rol && (
              <p className="text-sm text-destructive">{validationErrors.rol}</p>
            )}
          </div>

          {/* Estado activo (solo para editar) */}
          {!isCreateMode && (
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="activo">Usuario Activo</Label>
                <p className="text-sm text-muted-foreground">
                  Los usuarios inactivos no pueden iniciar sesión
                </p>
              </div>
              <Switch
                id="activo"
                checked={watch('activo')}
                onCheckedChange={(checked) => setValue('activo', checked)}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Errores generales */}
          {generalError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isCreateMode ? 'Creando...' : 'Actualizando...'}
                </>
              ) : (
                isCreateMode ? 'Crear Usuario' : 'Actualizar Usuario'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
