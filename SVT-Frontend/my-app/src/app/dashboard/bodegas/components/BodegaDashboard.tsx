'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BodegaForm } from './BodegaForm';
import { BodegaTable } from './BodegaTable';
import { BodegaStats } from './BodegaStats';
import { DeleteBodegaDialog } from './DeleteBodegaDialog';
import { BodegaDetails } from './BodegaDetails';
import { useBodegas } from '@/src/hooks/useBodegas';
import { Bodega, BodegaCreate } from '@/src/services/interfaces';

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentBodega, setCurrentBodega] = useState<Bodega | null>(null);
  const [search, setSearch] = useState('');

  // Estado para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bodegaToDelete, setBodegaToDelete] = useState<Bodega | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado para el diálogo de detalles
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [bodegaToView, setBodegaToView] = useState<Bodega | null>(null);

  useEffect(() => {
    // Activar las animaciones después de cargar los datos
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Filtrar bodegas por búsqueda
  const filteredBodegas = bodegas.filter(bodega =>
    bodega.nombre.toLowerCase().includes(search.toLowerCase()) ||
    bodega.codigo.toLowerCase().includes(search.toLowerCase()) ||
    bodega.direccion.toLowerCase().includes(search.toLowerCase()) ||
    (bodega.encargado && bodega.encargado.toLowerCase().includes(search.toLowerCase())) ||
    (bodega.telefono && bodega.telefono.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreateModal = () => {
    setCurrentBodega(null);
    setIsModalOpen(true);
  };

  const openEditModal = (bodega: Bodega) => {
    setCurrentBodega(bodega);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (bodega: Bodega) => {
    setBodegaToDelete(bodega);
    setIsDeleteDialogOpen(true);
  };

  const openDetailsDialog = (bodega: Bodega) => {
    setBodegaToView(bodega);
    setIsDetailsDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!bodegaToDelete) return;

    try {
      setIsDeleting(true);
      await deleteBodega(bodegaToDelete.id);
      setIsDeleteDialogOpen(false);
      loadBodegas();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para activar/inactivar bodega
  const handleToggleStatus = async (bodega: Bodega) => {
    try {
      const updatedData: BodegaCreate = {
        nombre: bodega.nombre,
        codigo: bodega.codigo,
        direccion: bodega.direccion || '',
        encargado: bodega.encargado || '',
        telefono: bodega.telefono || '',
        activa: !bodega.activa, // Cambiar el estado
      };

      await updateBodega(bodega.id, updatedData);
      loadBodegas(); // Recargar la lista
    } catch (err: any) {
      console.error('Error al cambiar estado de bodega:', err);
    }
  };

  const handleFormSubmit = async (formData: BodegaCreate) => {
    try {
      if (currentBodega) {
        await updateBodega(currentBodega.id, formData);
      } else {
        await createBodega(formData);
      }
      setIsModalOpen(false);
      loadBodegas();
    } catch (err: any) {
      console.error('Error:', err);
      throw err;
    }
  };

  const handleView = (bodega: Bodega) => {
    openDetailsDialog(bodega);
  };

  const handleClearFilters = () => {
    setSearch('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !isModalOpen && !isDeleteDialogOpen && !isDetailsDialogOpen) {
    return (
      <Alert variant="destructive" className="max-w-4xl mx-auto my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="space-y-6">
        {/* Encabezado y botón de crear */}
        <div className="flex justify-between items-center">
          <div
            className={`transform transition-all duration-300 ease-out ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bodegas
            </h1>
            <p className="text-muted-foreground">
              Gestión de bodegas del sistema SVT
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
            <Button
              onClick={openCreateModal}
              variant="default"
              className="flex items-center transition-all duration-150 hover:shadow-md active:translate-y-0.5"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Bodega
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div
          className={`transform transition-all duration-300 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          <BodegaStats bodegas={bodegas} loading={loading} />
        </div>

        {/* Table */}
        <div
          className={`transform transition-all duration-300 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <BodegaTable
            bodegas={filteredBodegas}
            onEdit={openEditModal}
            onDelete={openDeleteDialog}
            onView={handleView}
            onToggleStatus={handleToggleStatus}
            loading={loading}
          />
        </div>
      </div>

      {/* Modal para crear/editar bodega */}
      <BodegaForm
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        bodega={currentBodega}
        onSubmit={handleFormSubmit}
        loading={loading}
      />

      {/* Diálogo de confirmación para eliminar */}
      <DeleteBodegaDialog
        bodega={bodegaToDelete}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        loading={isDeleting}
        error={error}
      />

      {/* Diálogo de detalles */}
      <BodegaDetails
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        bodega={bodegaToView}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};
