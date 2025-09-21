'use client';

import React from 'react';
import { Bodega } from '@/src/services/interfaces';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Package } from 'lucide-react';

interface DeleteBodegaDialogProps {
  bodega: Bodega | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  error?: string | null;
}

export const DeleteBodegaDialog: React.FC<DeleteBodegaDialogProps> = ({
  bodega,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  error = null,
}) => {
  if (!bodega) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-destructive" />
            Eliminar Bodega
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente la bodega y no se puede deshacer.
            {bodega.activa && (
              <span className="block mt-2 text-amber-600 font-medium">
                ⚠️ La bodega está actualmente activa. Se marcará como inactiva.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              Información de la bodega:
            </h4>
            <div className="space-y-1 text-sm">
              <p><strong>Nombre:</strong> {bodega.nombre}</p>
              <p><strong>Código:</strong> {bodega.codigo}</p>
              <p><strong>Ubicación:</strong> {bodega.ubicacion}</p>
              <p><strong>Estado:</strong>
                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                  bodega.activa
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {bodega.activa ? 'Activa' : 'Inactiva'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? 'Eliminando...' : 'Eliminar Bodega'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
