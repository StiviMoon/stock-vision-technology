import { useToastStyles } from './useToastStyles';
import { toast } from 'sonner';

// Hook personalizado para toasts de productos
export const useProductoToasts = () => {
  const {
    inventorySuccess,
    inventoryError,
    inventoryProcessing,
    validationError,
    systemNotification,
  } = useToastStyles();

  // Toasts para creación de productos
  const showProductoCreated = (nombre: string, sku: string) => {
    return inventorySuccess(
      'Producto Creado',
      `${nombre} (${sku}) ha sido creado exitosamente`
    );
  };

  const showProductoCreateError = (error: string) => {
    return inventoryError('Creación de Producto', error);
  };

  const showProductoCreatePending = () => {
    return inventoryProcessing('Creación de Producto');
  };

  // Toasts para edición de productos
  const showProductoUpdated = (nombre: string, sku: string) => {
    return inventorySuccess(
      'Producto Actualizado',
      `${nombre} (${sku}) ha sido actualizado exitosamente`
    );
  };

  const showProductoUpdateError = (error: string) => {
    return inventoryError('Actualización de Producto', error);
  };

  const showProductoUpdatePending = () => {
    return inventoryProcessing('Actualización de Producto');
  };

  // Toasts para eliminación de productos
  const showProductoDeleted = (nombre: string, sku: string) => {
    return systemNotification(
      'Producto Eliminado',
      `${nombre} (${sku}) ha sido eliminado del sistema`
    );
  };

  const showProductoDeleteError = (error: string) => {
    return inventoryError('Eliminación de Producto', error);
  };

  const showProductoDeletePending = () => {
    return inventoryProcessing('Eliminación de Producto');
  };

  // Toasts para validaciones
  const showValidationError = (field: string, message: string) => {
    return validationError(field, message);
  };

  // Toasts para operaciones generales
  const showOperationSuccess = (operation: string, details?: string) => {
    return inventorySuccess(operation, details);
  };

  const showOperationError = (operation: string, error: string) => {
    return inventoryError(operation, error);
  };

  const showOperationPending = (operation: string) => {
    return inventoryProcessing(operation);
  };

  // Toasts para información del sistema
  const showInfo = (title: string, message: string) => {
    return systemNotification(title, message);
  };

  // Toasts para confirmaciones
  const showConfirmation = (title: string, message: string) => {
    return systemNotification(title, message);
  };

  // Toasts para advertencias
  const showWarning = (title: string, message: string) => {
    return systemNotification(title, message);
  };

  // Función para descartar todos los toasts
  const dismissAll = () => {
    toast.dismiss(); // Descartar todos los toasts activos
  };

  return {
    // Creación
    showProductoCreated,
    showProductoCreateError,
    showProductoCreatePending,

    // Edición
    showProductoUpdated,
    showProductoUpdateError,
    showProductoUpdatePending,

    // Eliminación
    showProductoDeleted,
    showProductoDeleteError,
    showProductoDeletePending,

    // Validaciones
    showValidationError,

    // Operaciones generales
    showOperationSuccess,
    showOperationError,
    showOperationPending,

    // Información
    showInfo,
    showConfirmation,
    showWarning,

    // Utilidades
    dismissAll,
  };
};
