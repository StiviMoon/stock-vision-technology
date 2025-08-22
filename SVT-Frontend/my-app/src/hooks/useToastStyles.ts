import { toast } from 'sonner';

// Configuraciones de estilo personalizadas para diferentes tipos de toast
export interface ToastStyleConfig {
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  description?: string;
}

// Configuraciones predefinidas para diferentes contextos
export const toastStyleConfigs = {
  // Para operaciones críticas
  critical: {
    duration: 8000,
    style: {
      borderWidth: '2px',
      fontWeight: '600',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
  },

  // Para operaciones rápidas
  quick: {
    duration: 2000,
    style: {
      fontSize: '13px',
      minWidth: '280px',
    },
  },

  // Para operaciones de inventario
  inventory: {
    duration: 4000,
    style: {
      borderLeftWidth: '4px',
      borderLeftColor: 'hsl(var(--primary))',
      paddingLeft: '20px',
    },
  },

  // Para operaciones de sistema
  system: {
    duration: 6000,
    style: {
      background:
        'linear-gradient(135deg, hsl(var(--background)) 0%, rgba(99, 102, 241, 0.05) 100%)',
      borderColor: 'hsl(var(--primary))',
    },
  },

  // Para validaciones
  validation: {
    duration: 5000,
    style: {
      borderLeftWidth: '4px',
      borderLeftColor: '#f59e0b',
      paddingLeft: '20px',
    },
  },
} as const;

export type ToastStyleType = keyof typeof toastStyleConfigs;

// Hook personalizado para estilos de toast
export const useToastStyles = () => {
  // Función para crear toast con estilo personalizado
  const createStyledToast = (
    type: 'success' | 'error' | 'warning' | 'info' | 'loading',
    title: string,
    options: {
      description?: string;
      styleType?: ToastStyleType;
      customConfig?: ToastStyleConfig;
    } = {}
  ) => {
    const { description, styleType, customConfig } = options;

    // Obtener configuración base
    const baseConfig = styleType ? toastStyleConfigs[styleType] : {};

    // Combinar configuraciones
    const finalConfig = {
      ...baseConfig,
      ...customConfig,
      style: {
        ...(baseConfig as any).style,
        ...customConfig?.style,
      },
    };

    // Crear toast según el tipo
    const toastMethod = toast[type];
    return toastMethod(title, {
      description,
      ...finalConfig,
    });
  };

  // Métodos específicos con estilos predefinidos
  const successStyled = (
    title: string,
    description?: string,
    styleType: ToastStyleType = 'inventory'
  ) => {
    return createStyledToast('success', title, { description, styleType });
  };

  const errorStyled = (
    title: string,
    description?: string,
    styleType: ToastStyleType = 'critical'
  ) => {
    return createStyledToast('error', title, { description, styleType });
  };

  const warningStyled = (
    title: string,
    description?: string,
    styleType: ToastStyleType = 'validation'
  ) => {
    return createStyledToast('warning', title, { description, styleType });
  };

  const infoStyled = (
    title: string,
    description?: string,
    styleType: ToastStyleType = 'system'
  ) => {
    return createStyledToast('info', title, { description, styleType });
  };

  const loadingStyled = (
    title: string,
    description?: string,
    styleType: ToastStyleType = 'inventory'
  ) => {
    return createStyledToast('loading', title, { description, styleType });
  };

  // Toast para operaciones de inventario específicas
  const inventorySuccess = (operation: string, details: string) => {
    return successStyled(`${operation} Completado`, details, 'inventory');
  };

  const inventoryError = (operation: string, error: string) => {
    return errorStyled(`Error en ${operation}`, error, 'critical');
  };

  const inventoryProcessing = (operation: string) => {
    return loadingStyled(
      `Procesando ${operation}`,
      'Por favor espere...',
      'inventory'
    );
  };

  // Toast para validaciones
  const validationError = (field: string, message: string) => {
    return warningStyled(
      'Error de Validación',
      `${field}: ${message}`,
      'validation'
    );
  };

  // Toast para operaciones del sistema
  const systemNotification = (title: string, message: string) => {
    return infoStyled(title, message, 'system');
  };

  return {
    // Métodos base con estilos
    createStyledToast,
    successStyled,
    errorStyled,
    warningStyled,
    infoStyled,
    loadingStyled,

    // Métodos específicos para inventario
    inventorySuccess,
    inventoryError,
    inventoryProcessing,

    // Métodos específicos para validaciones
    validationError,

    // Métodos específicos para sistema
    systemNotification,

    // Configuraciones disponibles
    configs: toastStyleConfigs,
  };
};
