# Sistema de Sincronización de Inventario

## Descripción del Problema

Anteriormente, cuando se realizaba un ajuste de inventario en bodega, el stock del producto no se
reflejaba inmediatamente en la interfaz. Era necesario recargar la página completa para ver los
cambios actualizados.

## Solución Implementada

Se ha implementado un sistema de sincronización en tiempo real que mantiene el estado local
actualizado inmediatamente después de cualquier cambio en el inventario.

### Componentes Principales

#### 1. Hook `useInventarioData`

- **`actualizarStockProducto`**: Actualiza inmediatamente el stock de un producto en el estado local
- **`actualizarProducto`**: Actualiza completamente un producto en el estado local
- **`sincronizarProducto`**: Sincroniza un producto específico con el backend

#### 2. Hook `useStockSync`

- **`syncStockWithDelay`**: Programa una sincronización automática después de un delay
- **`syncStockImmediately`**: Sincroniza inmediatamente con el backend
- **`isSyncing`**: Estado que indica si hay una sincronización en curso
- **`lastSync`**: Timestamp de la última sincronización exitosa

#### 3. Modal de Ajuste (`AjusteInventarioModal`)

- Actualiza inmediatamente el estado local después de un ajuste exitoso
- Llama a la función de sincronización automática
- No requiere recarga de página

### Flujo de Sincronización

1. **Usuario realiza ajuste de inventario**
2. **Frontend actualiza estado local inmediatamente** (stock visible al instante)
3. **Se programa sincronización automática** (después de 3 segundos)
4. **Backend se sincroniza** y verifica consistencia de datos
5. **Indicador visual muestra estado de sincronización**

### Ventajas

- ✅ **Respuesta inmediata**: El usuario ve los cambios al instante
- ✅ **Sincronización automática**: Los datos se mantienen consistentes con el backend
- ✅ **Mejor UX**: No hay necesidad de recargar la página
- ✅ **Indicadores visuales**: El usuario sabe cuándo se está sincronizando
- ✅ **Manejo de errores**: Si falla la sincronización, se notifica al usuario

### Uso

```jsx
// En el componente principal
const { actualizarStockProducto, sincronizarProducto } = useInventarioData();
const { syncStockWithDelay, isSyncing, lastSync } = useStockSync();

// Actualizar stock inmediatamente
const handleStockUpdate = (productoId, nuevoStock, stockBodega) => {
  actualizarStockProducto(productoId, nuevoStock, stockBodega);
  syncStockWithDelay(productoId, sincronizarProducto, 3000);
};
```

### Configuración

- **Delay de sincronización**: 3 segundos (configurable)
- **Timeout de sincronización**: Se limpia automáticamente al desmontar componentes
- **Manejo de errores**: Toast notifications para errores de sincronización
- **Logs**: Console logs para debugging de sincronización

## Mantenimiento

- Los timeouts se limpian automáticamente para evitar memory leaks
- El estado de sincronización se resetea después de cada operación
- Los errores de sincronización no afectan la funcionalidad principal
- El sistema es resiliente a fallos de red temporales
