'use client';

import React from 'react';
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
import { Loader2 } from 'lucide-react';
import { Categoria } from '@/src/services/interfaces';

interface DeleteCategoriaDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoria: Categoria | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  error: string | null;
}

export const DeleteCategoriaDialog: React.FC<DeleteCategoriaDialogProps> = ({
  isOpen,
  onOpenChange,
  categoria,
  onConfirm,
  isDeleting,
  error
}) => {
  if (!categoria) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro de eliminar esta categoría?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente la categoría <strong>{categoria.nombre}</strong> y no se puede deshacer.
            <br />
            <br />
            Si esta categoría tiene productos asociados, no podrás eliminarla.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
