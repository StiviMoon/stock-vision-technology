# 🚀 Sistema de Cache Management con React Query - SVT Frontend

## 📋 **Problema Resuelto**

### **Antes (Sistema Anterior)**

- ❌ **Inconsistencia de datos**: Stock no se actualizaba inmediatamente después de ajustes
- ❌ **Recarga manual**: Necesario refrescar página para ver cambios
- ❌ **Cache desactualizado**: Datos en frontend no coincidían con backend
- ❌ **UX pobre**: Usuario no veía cambios en tiempo real

### **Después (Sistema Optimizado)**

- ✅ **Sincronización inmediata**: Stock se actualiza al instante en la UI
- ✅ **Cache inteligente**: React Query maneja automáticamente la sincronización
- ✅ **Optimistic Updates**: Cambios visibles antes de confirmación del backend
- ✅ **Rollback automático**: Si hay error, se revierten los cambios
- ✅ **Background Sync**: Sincronización automática en segundo plano

## 🏗️ **Arquitectura del Nuevo Sistema**

### **1. Hooks Optimizados (`useInventarioOptimized.ts`)**

```typescript
// Claves organizadas por dominio para React Query
export const inventarioOptimizedKeys = {
  all: ['inventario-optimized'] as const,
  productos: () => [...inventarioOptimizedKeys.all, 'productos'] as const,
  stock: () => [...inventarioOptimizedKeys.all, 'stock'] as const,
  // ... más claves organizadas
};
```

### **2. Cache Management Inteligente**

```typescript
export const useAjustarInventarioOptimized = () => {
  return useMutation({
    onMutate: async ajusteData => {
      // 1. Cancelar queries en curso
      // 2. Snapshot del estado anterior
      // 3. Optimistic update del cache
      // 4. Retornar contexto para rollback
    },
    onError: (err, ajusteData, context) => {
      // Rollback automático en caso de error
    },
    onSettled: (data, error, ajusteData) => {
      // Invalidar y refetch queries relacionadas
    },
  });
};
```

## 🔄 **Flujo de Sincronización**

### **Paso 1: Usuario Realiza Ajuste**

```typescript
const ajustarInventario = useAjustarInventarioOptimized();

await ajustarInventario.mutateAsync({
  producto_id: 1,
  bodega_id: 1,
  cantidad: 100,
  motivo: 'AJUSTE_STOCK',
});
```

### **Paso 2: Optimistic Update (onMutate)**

- ✅ **Cache actualizado inmediatamente**
- ✅ **UI refleja cambios al instante**
- ✅ **Stock visible: 20 → 120 unidades**

### **Paso 3: Backend Confirma**

- ✅ **Movimiento registrado exitosamente**
- ✅ **Stock validado en base de datos**

### **Paso 4: Cache Invalidation (onSettled)**

- ✅ **Queries relacionadas invalidadas**
- ✅ **Refetch automático de datos**
- ✅ **Sincronización completa**

## 🎯 **Características Clave**

### **1. Optimistic Updates**

```typescript
// El cache se actualiza ANTES de la respuesta del backend
queryClient.setQueryData(inventarioOptimizedKeys.productos(), (old: any[] = []) => {
  return old.map(producto => {
    if (producto.id === ajusteData.producto_id) {
      return {
        ...producto,
        stock_actual: producto.stock_actual + ajusteData.cantidad,
      };
    }
    return producto;
  });
});
```

### **2. Rollback Automático**

```typescript
onError: (err, ajusteData, context) => {
  // Si hay error, se revierten los cambios automáticamente
  if (context?.previousProductos) {
    queryClient.setQueryData(inventarioOptimizedKeys.productos(), context.previousProductos);
  }
};
```

### **3. Cache Invalidation Inteligente**

```typescript
onSettled: (data, error, ajusteData) => {
  // Invalidar todas las queries relacionadas
  queryClient.invalidateQueries({ queryKey: inventarioOptimizedKeys.productos() });
  queryClient.invalidateQueries({ queryKey: inventarioOptimizedKeys.stock() });
  queryClient.invalidateQueries({ queryKey: inventarioOptimizedKeys.movimientos() });

  // Refetch específico del producto ajustado
  queryClient.refetchQueries({
    queryKey: inventarioOptimizedKeys.producto(ajusteData.producto_id),
    exact: true,
  });
};
```

## 📊 **Configuración de Cache**

### **Stale Time (Tiempo de Frescura)**

```typescript
// Productos: 30 segundos antes de considerar obsoletos
staleTime: 30 * 1000,

// Stock: 10 segundos (más frecuente)
staleTime: 10 * 1000,

// Alertas: 1 minuto con refetch automático
staleTime: 1 * 60 * 1000,
refetchInterval: 2 * 60 * 1000,
```

### **GC Time (Tiempo de Limpieza)**

```typescript
// Productos: 5 minutos en memoria
gcTime: 5 * 60 * 1000,

// Stock: 2 minutos (menos tiempo)
gcTime: 2 * 60 * 1000,
```

## 🚀 **Uso en Componentes**

### **Componente de Inventario**

```typescript
import {
  useInventarioProductosOptimized,
  useAjustarInventarioOptimized
} from '@/src/hooks/useInventarioOptimized';

const InventarioPage = () => {
  // Hook para obtener productos (con cache automático)
  const {
    data: productos,
    isLoading,
    error,
    refetch
  } = useInventarioProductosOptimized();

  // Hook para ajustar inventario (con cache management)
  const ajustarInventario = useAjustarInventarioOptimized();

  const handleAjuste = async (productoId, cantidad) => {
    await ajustarInventario.mutateAsync({
      producto_id: productoId,
      cantidad: cantidad,
      // ... otros datos
    });

    // ¡No necesitas recargar manualmente!
    // React Query se encarga de todo
  };

  return (
    // Tu UI aquí
  );
};
```

## 🔍 **Debugging y Monitoreo**

### **React Query DevTools**

- **Cache Inspector**: Visualizar estado del cache
- **Query Explorer**: Explorar queries activas
- **Performance Monitor**: Métricas de rendimiento

### **Console Logs**

```typescript
// En el hook de ajuste
console.log('✅ Ajuste exitoso - Cache actualizado automáticamente');
console.log('🔄 Invalidando queries relacionadas...');
console.log('📡 Refetch de datos específicos...');
```

## 📈 **Beneficios del Nuevo Sistema**

### **Para el Usuario**

- 🚀 **Respuesta inmediata**: Cambios visibles al instante
- 🔄 **Sincronización automática**: No más recargas manuales
- ✅ **Consistencia de datos**: UI siempre actualizada
- 🎯 **Mejor UX**: Flujo fluido y confiable

### **Para el Desarrollador**

- 🛠️ **Mantenibilidad**: Código organizado y modular
- 🔧 **Debugging**: Herramientas integradas de React Query
- 📊 **Performance**: Cache inteligente y eficiente
- 🚀 **Escalabilidad**: Fácil añadir nuevas funcionalidades

### **Para el Sistema**

- 💾 **Eficiencia**: Menos peticiones HTTP innecesarias
- 🔄 **Sincronización**: Datos siempre consistentes
- 🛡️ **Resiliencia**: Manejo automático de errores
- 📱 **Responsive**: UI reactiva y moderna

## 🧪 **Testing del Sistema**

### **Componente de Demo**

```typescript
import CacheDemo from '@/src/components/CacheDemo';

// En tu página de desarrollo
<CacheDemo />;
```

### **Casos de Prueba**

1. **Ajuste exitoso**: Verificar actualización inmediata
2. **Error de red**: Verificar rollback automático
3. **Múltiples ajustes**: Verificar consistencia del cache
4. **Refetch manual**: Verificar sincronización

## 🔧 **Configuración Avanzada**

### **Personalizar Stale Time**

```typescript
// Para datos que cambian frecuentemente
staleTime: 5 * 1000, // 5 segundos

// Para datos estáticos
staleTime: 10 * 60 * 1000, // 10 minutos

// Para datos en tiempo real
staleTime: 0, // Siempre obsoleto
refetchInterval: 1000, // Refetch cada segundo
```

### **Manejo de Errores Personalizado**

```typescript
onError: (error, variables, context) => {
  // Logging personalizado
  console.error('Error en ajuste:', error);

  // Notificación al usuario
  toast.error('Error al ajustar inventario');

  // Rollback personalizado
  if (context?.previousData) {
    // Lógica de rollback específica
  }
};
```

## 🚀 **Próximos Pasos**

1. **Migrar otros componentes** al nuevo sistema
2. **Implementar cache para proveedores y usuarios**
3. **Añadir métricas de performance**
4. **Implementar error boundaries**
5. **Añadir tests automatizados**

---

## 🎉 **Resumen**

El nuevo sistema de **Cache Management con React Query** resuelve completamente el problema de
inconsistencia de datos:

- ✅ **Stock se actualiza inmediatamente** después de ajustes
- ✅ **No más recargas manuales** de página
- ✅ **Cache siempre sincronizado** con el backend
- ✅ **UX mejorada** con respuestas instantáneas
- ✅ **Código más mantenible** y organizado

**¡Tu sistema de inventario ahora es profesional, eficiente y confiable!** 🚀
