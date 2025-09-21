'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BodegaForm } from './BodegaForm';
import { BodegaTable } from './BodegaTable';
import { BodegaStats } from './BodegaStats';
import { DeleteBodegaDialog } from './DeleteBodegaDialog';
import { useBodegas } from '@/src/hooks/useBodegas';
import { Bodega, BodegaCreate, BodegaUpdate } from '@/src/services/interfaces';

export const BodegaDashboard: React.FC = () => {
  const {
    bodegas,
    loading,
    error,
    loadBodegas,
    createBodega,
    updateBodega,
    deleteBodega,
  } = useBodegas();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingBodega, setEditingBodega] = useState<Bodega | null>(null);
  const [bodegaToDelete, setBodegaToDelete] = useState<Bodega | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    // Activar las animaciones después de cargar los datos
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateBodega = async (data: BodegaCreate) => {
    setFormLoading(true);
    try {
      await createBodega(data);
      setIsFormOpen(false);
    } catch (error) {
      // El error se maneja en el hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateBodega = async (data: BodegaCreate) => {
    if (!editingBodega) return;

    setFormLoading(true);
    try {
      await updateBodega(editingBodega.id, data as BodegaUpdate);
      setEditingBodega(null);
      setIsFormOpen(false);
    } catch (error) {
      // El error se maneja en el hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditBodega = (bodega: Bodega) => {
    setEditingBodega(bodega);
    setIsFormOpen(true);
  };

  const handleDeleteBodega = (bodega: Bodega) => {
    setBodegaToDelete(bodega);
    setIsDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const confirmDeleteBodega = async () => {
    if (!bodegaToDelete) return;

    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteBodega(bodegaToDelete.id);
      setIsDeleteDialogOpen(false);
      setBodegaToDelete(null);
    } catch (error: any) {
      setDeleteError(error.message || 'Error al eliminar bodega');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBodega(null);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setBodegaToDelete(null);
    setDeleteError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div
            className={`transform transition-all duration-300 ease-out ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <h1 className="text-3xl font-bold">Bodegas</h1>
            <p className="text-muted-foreground">
              Gestiona las bodegas de tu inventario
            </p>
          </div>
          <div
            className={`transform transition-all duration-300 ease-out ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Bodega
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className={`transform transition-all duration-300 ease-out ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Estadísticas */}
        <div
          className={`transform transition-all duration-300 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <BodegaStats bodegas={bodegas} loading={loading} />
        </div>

        {/* Tabla */}
        <div
          className={`transform transition-all duration-300 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <BodegaTable
            bodegas={bodegas}
            onEdit={handleEditBodega}
            onDelete={handleDeleteBodega}
            loading={loading}
          />
        </div>
      </div>

      {/* Formulario */}
      <BodegaForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        bodega={editingBodega}
        onSubmit={editingBodega ? handleUpdateBodega : handleCreateBodega}
        loading={formLoading}
      />

      {/* Diálogo de confirmación */}
      <DeleteBodegaDialog
        bodega={bodegaToDelete}
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={confirmDeleteBodega}
        loading={deleteLoading}
        error={deleteError}
      />
    </div>
  );
};
