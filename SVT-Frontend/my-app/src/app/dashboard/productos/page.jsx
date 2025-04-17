'use client';

import { useState, useEffect } from 'react';
import { productoService } from '../../../services/api';
import { motion } from 'framer-motion';
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Componentes refactorizados
import ProductoTable from '../../../components/producto/ProductoTable';
import ProductoForm from '../../../components/producto/ProductoForm';
import DeleteDialog from '../../../components/producto/DeleteDialog';
import ErrorAlert from '../../../components/producto/ErrorAlert';

// Animaciones
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      type: 'spring', 
      stiffness: 260, 
      damping: 20 
    } 
  }
};

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProducto, setCurrentProducto] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' o 'edit'
  
  // Estado para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const data = await productoService.getProductos();
      setProductos(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setCurrentProducto(null);
    setFormMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (producto) => {
    setCurrentProducto(producto);
    setFormMode('edit');
    setIsModalOpen(true);
  };

  const openDeleteDialog = (producto) => {
    setProductoToDelete(producto);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productoToDelete) return;
    
    try {
      setIsDeleting(true);
      await productoService.deleteProducto(productoToDelete.id);
      setIsDeleteDialogOpen(false);
      fetchProductos();
    } catch (err) {
      setError(typeof err.response?.data?.detail === 'string' 
        ? err.response.data.detail 
        : 'Error al eliminar producto');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (formMode === 'create') {
        await productoService.createProducto(formData);
      } else {
        await productoService.updateProducto(currentProducto.id, formData);
      }
      setIsModalOpen(false);
      fetchProductos();
      return { success: true };
    } catch (err) {
      console.error("Error:", err);
      
      // Preparar y retornar errores para que el componente del formulario los maneje
      if (err.response?.status === 422 && err.response?.data?.detail) {
        const validationErrors = {};
        err.response.data.detail.forEach(error => {
          const fieldName = error.loc && error.loc.length > 1 ? error.loc[1] : 'general';
          validationErrors[fieldName] = error.msg;
        });
        
        return {
          success: false,
          validationErrors,
          generalError: 'Por favor, corrija los errores en el formulario.'
        };
      } else {
        return {
          success: false,
          generalError: typeof err.response?.data?.detail === 'string' 
            ? err.response.data.detail 
            : `Error al ${formMode === 'create' ? 'crear' : 'actualizar'} producto`
        };
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error && !isModalOpen && !isDeleteDialogOpen) {
    return <ErrorAlert error={error} className="max-w-4xl mx-auto my-4" />;
  }

  return (
    <div className="p-6 md:p-8 ">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Encabezado y botón de crear */}
        <div className="flex justify-between items-center">
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold  text-black dark:text-white mb-2">Productos</h1>
            <p className="text-gray-400">Bienvenido al sistema de inventario SVT</p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Button 
              onClick={openCreateModal} 
              variant="default"
              className="flex items-center"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          </motion.div>
        </div>

        {/* Tabla de productos */}
        <motion.div variants={itemVariants}>
          <ProductoTable 
            productos={productos} 
            onEdit={openEditModal} 
            onDelete={openDeleteDialog} 
          />
        </motion.div>
      </motion.div>

      {/* Modal para crear/editar producto */}
      <ProductoForm 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        formMode={formMode}
        initialData={currentProducto}
        onSubmit={handleFormSubmit}
      />

      {/* Diálogo de confirmación para eliminar */}
      <DeleteDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        producto={productoToDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        error={error}
      />
    </div>
  );
}