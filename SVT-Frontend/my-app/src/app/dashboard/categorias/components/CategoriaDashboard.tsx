'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CategoriaForm } from './CategoriaForm';
import { CategoriaTable } from './CategoriaTable';
import { CategoriaFilters } from './CategoriaFilters';
import { CategoriaStats } from './CategoriaStats';
import { DeleteCategoriaDialog } from './DeleteCategoriaDialog';
import { CategoriaDetails } from './CategoriaDetails';
import { useCategorias } from '@/src/hooks/useCategorias';
import { Categoria, CategoriaCreate } from '@/src/services/interfaces';

export const CategoriaDashboard: React.FC = () => {
  const {
    categorias,
    loading,
    error,
    loadCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
  } = useCategorias();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentCategoria, setCurrentCategoria] = useState<Categoria | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [search, setSearch] = useState('');

  // Estado para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado para el diálogo de detalles
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [categoriaToView, setCategoriaToView] = useState<Categoria | null>(null);

  useEffect(() => {
    // Activar las animaciones después de cargar los datos
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Filtrar categorías por búsqueda
  const filteredCategorias = categorias.filter(categoria =>
    categoria.nombre.toLowerCase().includes(search.toLowerCase()) ||
    categoria.codigo.toLowerCase().includes(search.toLowerCase()) ||
    (categoria.descripcion && categoria.descripcion.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreateModal = () => {
    setCurrentCategoria(null);
    setFormMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (categoria: Categoria) => {
    setCurrentCategoria(categoria);
    setFormMode('edit');
    setIsModalOpen(true);
  };

  const openDeleteDialog = (categoria: Categoria) => {
    setCategoriaToDelete(categoria);
    setIsDeleteDialogOpen(true);
  };

  const openDetailsDialog = (categoria: Categoria) => {
    setCategoriaToView(categoria);
    setIsDetailsDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoriaToDelete) return;

    try {
      setIsDeleting(true);
      await deleteCategoria(categoriaToDelete.id);
      setIsDeleteDialogOpen(false);
      loadCategorias();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para activar/inactivar categoría
  const handleToggleStatus = async (categoria: Categoria) => {
    try {
      const updatedData: CategoriaCreate = {
        nombre: categoria.nombre,
        codigo: categoria.codigo,
        descripcion: categoria.descripcion || '',
        activa: !categoria.activa, // Cambiar el estado
      };

      await updateCategoria(categoria.id, updatedData);
      loadCategorias(); // Recargar la lista
    } catch (err: any) {
      console.error('Error al cambiar estado de categoría:', err);
    }
  };

  const handleFormSubmit = async (formData: CategoriaCreate) => {
    try {
      if (formMode === 'create') {
        await createCategoria(formData);
      } else {
        await updateCategoria(currentCategoria!.id, formData);
      }
      setIsModalOpen(false);
      loadCategorias();
      return { success: true };
    } catch (err: any) {
      console.error('Error:', err);

      // Preparar y retornar errores para que el componente del formulario los maneje
      if (err.response?.status === 422 && err.response?.data?.detail) {
        const validationErrors: Record<string, string> = {};
        err.response.data.detail.forEach((error: any) => {
          const fieldName =
            error.loc && error.loc.length > 1 ? error.loc[1] : 'general';
          validationErrors[fieldName] = error.msg;
        });

        return {
          success: false,
          validationErrors,
          generalError: 'Por favor, corrija los errores en el formulario.',
        };
      } else {
        return {
          success: false,
          generalError:
            typeof err.response?.data?.detail === 'string'
              ? err.response.data.detail
              : `Error al ${
                  formMode === 'create' ? 'crear' : 'actualizar'
                } categoría`,
        };
      }
    }
  };

  const handleView = (categoria: Categoria) => {
    openDetailsDialog(categoria);
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
              Categorías
            </h1>
            <p className="text-muted-foreground">
              Gestión de categorías de productos del sistema SVT
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
              Nueva Categoría
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
          <CategoriaStats categorias={categorias} loading={loading} />
        </div>

        {/* Filters */}
        <div
          className={`transform transition-all duration-300 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <CategoriaFilters
            search={search}
            onSearchChange={setSearch}
            onClearFilters={handleClearFilters}
            loading={loading}
          />
        </div>

        {/* Table */}
        <div
          className={`transform transition-all duration-300 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <CategoriaTable
            categorias={filteredCategorias}
            onEdit={openEditModal}
            onDelete={openDeleteDialog}
            onView={handleView}
            onToggleStatus={handleToggleStatus}
            loading={loading}
          />
        </div>
      </div>

      {/* Modal para crear/editar categoría */}
      <CategoriaForm
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        formMode={formMode}
        initialData={currentCategoria}
        onSubmit={handleFormSubmit}
      />

      {/* Diálogo de confirmación para eliminar */}
      <DeleteCategoriaDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        categoria={categoriaToDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        error={error}
      />

      {/* Diálogo de detalles */}
      <CategoriaDetails
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        categoria={categoriaToView}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};
