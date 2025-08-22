# 🎨 Sistema de Toasts Personalizado - SVT Frontend

## 📋 **Descripción General**

Sistema de notificaciones toast completamente personalizado y profesional para la aplicación SVT
Frontend. Implementa un diseño moderno, responsive y accesible con múltiples niveles de
personalización.

## 🏗️ **Arquitectura del Sistema**

```
src/
├── providers/
│   └── Providers.tsx          # Configuración principal del Toaster
├── styles/
│   └── toasts.css             # Estilos CSS personalizados
├── hooks/
│   ├── useToastStyles.ts      # Hook para estilos personalizados
│   ├── useInventarioToasts.ts # Hook específico para inventario
│   └── useProductoToasts.ts   # Hook específico para productos
└── app/
    └── layout.jsx             # Importación de estilos
```

## ⚙️ **Configuración Principal**

### **Providers.tsx - Configuración del Toaster**

```typescript
<Toaster
  position='top-right' // Posición en pantalla
  richColors // Colores enriquecidos
  closeButton // Botón de cerrar
  duration={4000} // Duración por defecto (ms)
  expand={true} // Expansión automática
  gap={12} // Espacio entre toasts
  offset={16} // Distancia del borde
  theme='system' // Tema automático
  toastOptions={{
    className: 'svt-toast', // Clase CSS personalizada
    style: {
      background: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(8px)',
      minWidth: '350px',
      maxWidth: '450px',
    },
    descriptionClassName: 'svt-toast-description',
  }}
/>
```

## 🎨 **Estilos CSS Personalizados**

### **Características Visuales**

- **Sombras suaves**: Box shadows con múltiples capas
- **Blur background**: Efecto glassmorphism sutil
- **Gradientes**: Fondos con gradientes sutiles por tipo
- **Animaciones smooth**: Transiciones fluidas
- **Hover effects**: Transformaciones al pasar el mouse
- **Typography**: Fuente Inter para mejor legibilidad

### **Paleta de Colores por Tipo**

```css
/* Success - Verde */
[data-sonner-toast][data-type='success'] {
  border-color: rgb(34 197 94 / 0.2);
  background: linear-gradient(135deg, hsl(var(--background)) 0%, rgba(34, 197, 94, 0.03) 100%);
}

/* Error - Rojo */
[data-sonner-toast][data-type='error'] {
  border-color: rgb(239 68 68 / 0.2);
  background: linear-gradient(135deg, hsl(var(--background)) 0%, rgba(239, 68, 68, 0.03) 100%);
}

/* Warning - Ámbar */
[data-sonner-toast][data-type='warning'] {
  border-color: rgb(245 158 11 / 0.2);
  background: linear-gradient(135deg, hsl(var(--background)) 0%, rgba(245, 158, 11, 0.03) 100%);
}

/* Info - Azul */
[data-sonner-toast][data-type='info'] {
  border-color: rgb(59 130 246 / 0.2);
  background: linear-gradient(135deg, hsl(var(--background)) 0%, rgba(59, 130, 246, 0.03) 100%);
}

/* Loading - Gris */
[data-sonner-toast][data-type='loading'] {
  border-color: rgb(107 114 128 / 0.2);
  background: linear-gradient(135deg, hsl(var(--background)) 0%, rgba(107, 114, 128, 0.03) 100%);
}
```

### **Animaciones Personalizadas**

```css
/* Entrada */
@keyframes svt-slide-in {
  from {
    transform: translateX(100%) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

/* Salida */
@keyframes svt-slide-out {
  from {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateX(100%) scale(0.95);
    opacity: 0;
  }
}
```

### **Responsive Design**

```css
@media (max-width: 640px) {
  .svt-toast {
    min-width: 280px !important;
    max-width: calc(100vw - 32px) !important;
    margin: 0 16px;
  }
}
```

## 🪝 **Hook de Estilos Personalizados**

### **useToastStyles.ts - Configuraciones Predefinidas**

```typescript
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

  // Para operaciones del sistema
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
};
```

### **Métodos Disponibles**

```typescript
const {
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
  configs,
} = useToastStyles();
```

## 🚀 **Uso del Sistema**

### **Toasts Básicos con Estilos Predefinidos**

```typescript
import { useInventarioToasts } from '@/src/hooks/useInventarioToasts';
import { useProductoToasts } from '@/src/hooks/useProductoToasts';

const inventarioToasts = useInventarioToasts();
const productoToasts = useProductoToasts();

// Ajuste de inventario
inventarioToasts.showAjusteSuccess('Producto A', 100, 'Bodega Central');
inventarioToasts.showAjusteError('Error de conexión con el servidor');
inventarioToasts.showAjustePending();

// Sincronización
inventarioToasts.showSyncSuccess();
inventarioToasts.showSyncError('Timeout en la operación');
inventarioToasts.showSyncPending();

// Validaciones
inventarioToasts.showValidationError('SKU', 'El campo es obligatorio');
inventarioToasts.showValidationError('Cantidad', 'Debe ser mayor a 0');

// Productos
productoToasts.showProductoCreated('iPhone 15', 'ELEC-CEL-IPH-001');
productoToasts.showProductoUpdated('iPhone 15', 'ELEC-CEL-IPH-001');
productoToasts.showProductoDeleted('iPhone 15', 'ELEC-CEL-IPH-001');
```

### **Toasts con Estilos Personalizados**

```typescript
import { useToastStyles } from '@/src/hooks/useToastStyles';

const { inventorySuccess, createStyledToast } = useToastStyles();

// Estilo predefinido
inventorySuccess('Producto Creado', 'Descripción detallada del producto');

// Estilo completamente personalizado
createStyledToast('success', 'Operación Crítica', {
  styleType: 'critical',
  customConfig: {
    duration: 10000,
    style: {
      borderWidth: '3px',
      background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
    },
  },
});
```

### **Toasts por Contexto**

```typescript
// Para inventario (estilo por defecto)
inventorySuccess('Ajuste de Stock', 'Producto actualizado correctamente');

// Para validaciones
validationError('Campo', 'Mensaje de error');

// Para sistema
systemNotification('Mantenimiento', 'El sistema estará offline por 2 horas');

// Para operaciones críticas
errorStyled('Error Crítico', 'Descripción del error', 'critical');
```

## 🎯 **Casos de Uso Comunes**

### **1. Operaciones de Inventario**

```typescript
// Ajuste de stock
const handleAjusteStock = async data => {
  try {
    toasts.showAjustePending();
    const result = await ajustarInventario(data);
    toasts.showAjusteSuccess(result.producto.nombre, data.cantidad, result.bodega_destino.nombre);
  } catch (error) {
    toasts.showAjusteError(error.message);
  }
};
```

### **2. Validaciones de Formularios**

```typescript
const validateForm = data => {
  if (!data.sku) {
    toasts.showValidationError('SKU', 'El campo es obligatorio');
    return false;
  }

  if (data.cantidad <= 0) {
    toasts.showValidationError('Cantidad', 'Debe ser mayor a 0');
    return false;
  }

  return true;
};
```

### **3. Operaciones del Sistema**

```typescript
const handleSystemOperation = async () => {
  try {
    toasts.showOperationPending('Sincronizando datos');
    await syncData();
    toasts.showOperationSuccess('Sincronización', 'Datos actualizados correctamente');
  } catch (error) {
    toasts.showOperationError('Sincronización', error.message);
  }
};
```

## 🔧 **Personalización Avanzada**

### **Crear Nuevos Estilos**

```typescript
// En useToastStyles.ts
const customStyle = {
  duration: 7000,
  style: {
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: '2px solid #667eea',
    color: 'white',
  },
};

// Agregar a toastStyleConfigs
export const toastStyleConfigs = {
  // ... estilos existentes
  custom: customStyle,
};
```

### **Modificar Estilos Existentes**

```css
/* En src/styles/toasts.css */
[data-sonner-toast][data-type='success'] {
  /* Personalizar colores */
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);

  /* Personalizar animaciones */
  animation: custom-bounce 0.5s ease-in-out;
}

@keyframes custom-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
```

### **Configuración del Toaster**

```typescript
// En Providers.tsx
<Toaster
  position='bottom-center' // Cambiar posición
  duration={6000} // Cambiar duración
  gap={20} // Cambiar espaciado
  offset={24} // Cambiar offset
  toastOptions={{
    style: {
      // Personalizar estilos base
      fontSize: '16px',
      fontWeight: '600',
      borderRadius: '12px',
    },
  }}
/>
```

## 🌙 **Temas y Modo Oscuro**

### **Configuración Automática**

```typescript
<Toaster
  theme='system' // Detecta automáticamente preferencias del sistema
  // ... otras opciones
/>
```

### **Estilos para Modo Oscuro**

```css
/* En toasts.css */
@media (prefers-color-scheme: dark) {
  [data-sonner-toast][data-type='success'] .svt-toast-description {
    color: rgb(34 197 94);
  }

  [data-sonner-toast][data-type='error'] .svt-toast-description {
    color: rgb(248 113 113);
  }

  /* ... otros tipos */
}
```

## ♿ **Accesibilidad**

### **Reduced Motion**

```css
@media (prefers-reduced-motion: reduce) {
  .svt-toast,
  [data-sonner-toast][data-mounted='true'],
  [data-sonner-toast][data-removed='true'] {
    animation: none !important;
    transition: none !important;
  }
}
```

### **High Contrast**

```css
@media (prefers-contrast: high) {
  .svt-toast {
    border-width: 2px !important;
    font-weight: 600 !important;
  }
}
```

## 📱 **Responsive Design**

### **Breakpoints**

```css
/* Desktop (por defecto) */
.svt-toast {
  min-width: 350px;
  max-width: 450px;
}

/* Tablet */
@media (max-width: 768px) {
  .svt-toast {
    min-width: 320px;
    max-width: 400px;
  }
}

/* Mobile */
@media (max-width: 640px) {
  .svt-toast {
    min-width: 280px;
    max-width: calc(100vw - 32px);
    margin: 0 16px;
  }
}
```

## 🧪 **Testing y Debugging**

### **Verificar Configuración**

```typescript
// En cualquier componente
import { useToastStyles } from '@/src/hooks/useToastStyles';

const { configs } = useToastStyles();
console.log('Configuraciones disponibles:', configs);
```

### **Toast de Prueba**

```typescript
// Crear un toast de prueba
const testToast = () => {
  createStyledToast('success', 'Test Toast', {
    styleType: 'inventory',
    description: 'Este es un toast de prueba',
  });
};
```

## 📚 **Referencias y Recursos**

### **Librerías Utilizadas**

- **Sonner**: Sistema base de toasts
- **TailwindCSS**: Framework de CSS utility-first
- **React Query**: Gestión de estado del servidor

### **Archivos Relacionados**

- `src/providers/Providers.tsx` - Configuración principal
- `src/styles/toasts.css` - Estilos personalizados
- `src/hooks/useToastStyles.ts` - Hook de estilos
- `src/hooks/useInventarioToasts.ts` - Hook específico
- `src/app/layout.jsx` - Importación de estilos

### **Variables CSS Utilizadas**

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --border: 214.3 31.8% 91.4%;
  --primary: 222.2 47.4% 11.2%;
}
```

## 🚀 **Próximos Pasos y Mejoras**

### **Funcionalidades Futuras**

- [ ] **Toasts con acciones**: Botones de acción en los toasts
- [ ] **Toasts agrupados**: Agrupar toasts relacionados
- [ ] **Toasts persistentes**: Toasts que no se auto-cierran
- [ ] **Toasts con progreso**: Barras de progreso personalizadas
- [ ] **Toasts con sonidos**: Notificaciones auditivas opcionales

### **Optimizaciones**

- [ ] **Lazy loading**: Cargar estilos solo cuando sea necesario
- [ ] **Bundle splitting**: Separar estilos en chunks más pequeños
- [ ] **Tree shaking**: Eliminar estilos no utilizados
- [ ] **CSS-in-JS**: Migrar a styled-components o emotion

---

## 📝 **Notas de Desarrollo**

- **Última actualización**: Diciembre 2024
- **Versión**: 1.0.0
- **Compatibilidad**: Next.js 13+, React 18+, TypeScript 5+
- **Navegadores**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

**¡El sistema de toasts está completamente implementado y listo para usar!** 🎉

Para cualquier pregunta o soporte, consulta la documentación o contacta al equipo de desarrollo.
