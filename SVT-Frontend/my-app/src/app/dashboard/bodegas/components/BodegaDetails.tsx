'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bodega } from '@/src/services/interfaces';
import {
  Package,
  Calendar,
  MapPin,
  User,
  Phone,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BodegaDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bodega: Bodega | null;
  onEdit?: (bodega: Bodega) => void;
  onDelete?: (bodega: Bodega) => void;
  onToggleStatus?: (bodega: Bodega) => void;
}

export const BodegaDetails: React.FC<BodegaDetailsProps> = ({
  isOpen,
  onOpenChange,
  bodega,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  if (!bodega) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[750px] max-h-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Building className='h-5 w-5 text-blue-600' />
            Detalles de la Bodega
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span className='flex items-center gap-2'>
                  <Package className='h-4 w-4' />
                  Información Principal
                </span>
                <Badge variant={bodega.activa ? 'default' : 'secondary'}>
                  {bodega.activa ? (
                    <>
                      <CheckCircle className='h-3 w-3 mr-1' />
                      Activa
                    </>
                  ) : (
                    <>
                      <XCircle className='h-3 w-3 mr-1' />
                      Inactiva
                    </>
                  )}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-600'>
                    Nombre
                  </label>
                  <p className='text-lg font-semibold text-gray-900 mt-1'>
                    {bodega.nombre}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>
                    Código
                  </label>
                  <p className='text-lg font-mono bg-gray-100 px-3 py-1 rounded mt-1 inline-block'>
                    {bodega.codigo}
                  </p>
                </div>
              </div>

              {bodega.direccion && (
                <div>
                  <label className='text-sm font-medium text-gray-600'>
                    Dirección
                  </label>
                  <p className='text-gray-700 mt-1 bg-gray-50 p-3 rounded border'>
                    {bodega.direccion}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información de Ubicación */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MapPin className='h-4 w-4' />
                Ubicación y Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-600'>
                    Ubicación
                  </label>
                  <p className='text-gray-700 mt-1 flex items-center gap-2'>
                    <MapPin className='h-4 w-4 text-gray-400' />
                    {bodega.direccion || 'No especificada'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>
                    Encargado
                  </label>
                  <p className='text-gray-700 mt-1 flex items-center gap-2'>
                    <User className='h-4 w-4 text-gray-400' />
                    {bodega.encargado || 'No asignado'}
                  </p>
                </div>
              </div>

              <div>
                <label className='text-sm font-medium text-gray-600'>
                  Teléfono
                </label>
                <p className='text-gray-700 mt-1 flex items-center gap-2'>
                  <Phone className='h-4 w-4 text-gray-400' />
                  {bodega.telefono || 'No especificado'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Información del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-600'>
                    Fecha de Creación
                  </label>
                  <p className='text-gray-700 mt-1 flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-gray-400' />
                    {formatDate(bodega.fecha_creacion)}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>
                    ID de Bodega
                  </label>
                  <p className='text-gray-700 mt-1 font-mono bg-gray-100 px-3 py-1 rounded inline-block'>
                    #{bodega.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado y Funcionalidad */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CheckCircle className='h-4 w-4' />
                Estado y Funcionalidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center justify-between p-3 bg-gray-50 rounded'>
                  <div>
                    <p className='font-medium'>Estado de la Bodega</p>
                    <p className='text-sm text-gray-600'>
                      {bodega.activa
                        ? 'Esta bodega está activa y disponible para almacenar productos'
                        : 'Esta bodega está inactiva y no está disponible para almacenar productos'}
                    </p>
                  </div>
                  <Badge variant={bodega.activa ? 'default' : 'secondary'}>
                    {bodega.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>

                {!bodega.activa && (
                  <div className='p-3 bg-yellow-50 border border-yellow-200 rounded'>
                    <p className='text-sm text-yellow-800'>
                      <strong>Nota:</strong> Las bodegas inactivas no aparecerán
                      en los formularios de productos y no podrán ser
                      seleccionadas para almacenar productos.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          {(onEdit || onDelete || onToggleStatus) && (
            <>
              <Separator />
              <div className='flex justify-end gap-2'>
                {onToggleStatus && (
                  <Button
                    variant={bodega.activa ? 'outline' : 'default'}
                    onClick={() => {
                      onToggleStatus(bodega);
                      onOpenChange(false);
                    }}
                    className={`flex items-center gap-2 ${
                      bodega.activa
                        ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {bodega.activa ? (
                      <XCircle className='h-4 w-4' />
                    ) : (
                      <CheckCircle className='h-4 w-4' />
                    )}
                    {bodega.activa ? 'Inactivar' : 'Activar'}
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant='outline'
                    onClick={() => {
                      onEdit(bodega);
                      onOpenChange(false);
                    }}
                    className='flex items-center gap-2'
                  >
                    <Edit className='h-4 w-4' />
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant='destructive'
                    onClick={() => {
                      onDelete(bodega);
                      onOpenChange(false);
                    }}
                    className='flex items-center gap-2'
                  >
                    <Trash2 className='h-4 w-4' />
                    Eliminar
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
