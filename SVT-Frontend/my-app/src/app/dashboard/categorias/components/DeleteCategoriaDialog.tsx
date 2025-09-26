'use client';

import React, { useState, useEffect } from 'react';
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
import { Loader2, AlertTriangle, Package, CheckCircle, XCircle } from 'lucide-react';
import { Categoria } from '@/src/services/interfaces';
import { categoriaService } from '@/src/services/categoriaService';

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
  const [productosCount, setProductosCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const [canDelete, setCanDelete] = useState(true);

  // Cargar información de productos cuando se abre el diálogo
  useEffect(() => {
    if (isOpen && categoria) {
      loadProductosCount();
    }
  }, [isOpen, categoria]);

  const loadProductosCount = async () => {
    if (!categoria) return;

    setLoadingCount(true);
    try {
      const countData = await categoriaService.getProductosCount(categoria.id);
      setProductosCount(countData.productos_count);
      setCanDelete(countData.productos_count === 0);
    } catch (error) {
      console.error('Error al cargar productos de la categoría:', error);
      setProductosCount(0);
      setCanDelete(true); // Permitir intentar eliminar si hay error
    } finally {
      setLoadingCount(false);
    }
  };

  const handleConfirm = async () => {
    if (!canDelete) {
      return; // No permitir eliminar si hay productos asociados
    }
    await onConfirm();
  };

  if (!categoria) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-destructive" />
            Eliminar Categoría
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente la categoría y no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Información de la categoría */}
        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              Información de la categoría:
            </h4>
            <div className="space-y-1 text-sm">
              <p><strong>Nombre:</strong> {categoria.nombre}</p>
              <p><strong>Código:</strong> {categoria.codigo}</p>
              <p><strong>Estado:</strong>
                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                  categoria.activa
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {categoria.activa ? 'Activa' : 'Inactiva'}
                </span>
              </p>
              {categoria.descripcion && (
                <p><strong>Descripción:</strong> {categoria.descripcion}</p>
              )}
            </div>
          </div>
        </div>

        {/* Información de productos asociados */}
        <div className="py-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-medium text-sm text-blue-800 mb-2 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Productos asociados:
            </h4>
            {loadingCount ? (
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando productos...
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {productosCount > 0 ? (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-700 font-medium">
                        {productosCount} producto{productosCount !== 1 ? 's' : ''} asociado{productosCount !== 1 ? 's' : ''}
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-700 font-medium">
                        No hay productos asociados
                      </span>
                    </>
                  )}
                </div>

                {productosCount > 0 && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      <strong>⚠️ No se puede eliminar:</strong> Esta categoría tiene productos asociados.
                      Primero debes cambiar la categoría de estos productos o eliminarlos.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting || loadingCount}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isDeleting || loadingCount || !canDelete}
            className={`${
              canDelete
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? 'Eliminando...' : 'Eliminar Categoría'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
