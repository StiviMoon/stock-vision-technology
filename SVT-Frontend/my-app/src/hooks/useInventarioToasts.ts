import { toast } from 'sonner';
import { useToastStyles } from './useToastStyles';

// Hook personalizado para toasts del inventario
export const useInventarioToasts = () => {
  const {
    inventorySuccess,
    inventoryError,
    inventoryProcessing,
    validationError,
    systemNotification,
  } = useToastStyles();
  // Toasts para ajustes de inventario
  const showAjusteSuccess = (
    producto: string,
    cantidad: number,
    bodega: string
  ) => {
    const descripcion = `${producto}: ${
      cantidad > 0 ? '+' : ''
    }${cantidad} unidades en ${bodega}`;
    return inventorySuccess('Ajuste de Inventario', descripcion);
  };

  const showAjusteError = (error: string) => {
    return inventoryError('Ajuste de Inventario', error);
  };

  const showAjustePending = () => {
    return inventoryProcessing('Ajuste de Inventario');
  };

  // Toasts para sincronización
  const showSyncSuccess = () => {
    return systemNotification(
      'Inventario Sincronizado',
      'Los datos se han actualizado correctamente'
    );
  };

  const showSyncError = (error: string) => {
    return inventoryError('Sincronización', error);
  };

  const showSyncPending = () => {
    return inventoryProcessing('Sincronización');
  };

  // Toasts para operaciones generales
  const showOperationSuccess = (operation: string, details?: string) => {
    toast.success(operation, {
      description: details,
      duration: 4000,
    });
  };

  const showOperationError = (operation: string, error: string) => {
    toast.error(`Error en ${operation}`, {
      description: error,
      duration: 6000,
    });
  };

  const showOperationPending = (operation: string) => {
    toast.loading(`${operation}...`, {
      duration: Infinity,
    });
  };

  // Toasts para validaciones
  const showValidationError = (field: string, message: string) => {
    return validationError(field, message);
  };

  const showInfo = (title: string, message: string) => {
    toast.info(title, {
      description: message,
      duration: 4000,
    });
  };

  // Toasts para confirmaciones
  const showConfirmation = (title: string, message: string) => {
    toast.info(title, {
      description: message,
      duration: 5000,
    });
  };

  // Toasts para warnings
  const showWarning = (title: string, message: string) => {
    toast.warning(title, {
      description: message,
      duration: 5000,
    });
  };

  // Función para limpiar todos los toasts
  const dismissAll = () => {
    toast.dismiss();
  };

  return {
    // Ajustes
    showAjusteSuccess,
    showAjusteError,
    showAjustePending,

    // Sincronización
    showSyncSuccess,
    showSyncError,
    showSyncPending,

    // Operaciones generales
    showOperationSuccess,
    showOperationError,
    showOperationPending,

    // Validaciones y otros
    showValidationError,
    showInfo,
    showConfirmation,
    showWarning,

    // Utilidades
    dismissAll,
  };
};
