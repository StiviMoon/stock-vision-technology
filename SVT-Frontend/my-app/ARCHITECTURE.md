# Arquitectura de API Refactorizada - SVT Frontend

## 🚀 Resumen de la Refactorización

Esta refactorización transforma el sistema de API monolítico en una arquitectura modular, organizada
y optimizada usando **React Query (TanStack Query)** para el manejo eficiente del estado del
servidor.

## 📁 Nueva Estructura de Archivos

```
src/
├── lib/
│   ├── queryClient.ts          # Configuración de React Query
│   └── apiClient.ts            # Cliente base de API con interceptores
├── providers/
│   └── QueryProvider.tsx       # Proveedor de React Query
├── services/
│   ├── index.ts                # Exportaciones centralizadas
│   ├── authService.ts          # Servicio de autenticación
│   ├── productoService.ts      # Servicio de productos
│   ├── inventarioService.ts    # Servicio de inventario
│   └── interfaces.ts           # Interfaces TypeScript
├── hooks/
│   ├── index.ts                # Exportaciones centralizadas
│   ├── useAuth.ts              # Hooks de autenticación
│   ├── useProductos.ts         # Hooks de productos
│   └── useInventario.ts       # Hooks de inventario
└── components/
    └── examples/
        └── ProductoListExample.tsx  # Ejemplo de uso
```

## 🔧 Tecnologías Implementadas

- **React Query (TanStack Query)**: Manejo de estado del servidor, cache, y sincronización
- **Axios**: Cliente HTTP con interceptores centralizados
- **TypeScript**: Tipado estático completo
- **Modularización**: Servicios separados por dominio

## 🎯 Beneficios de la Nueva Arquitectura

### 1. **Organización Modular**

- Cada servicio tiene su propio archivo
- Separación clara de responsabilidades
- Fácil mantenimiento y escalabilidad

### 2. **Optimización con React Query**

- **Cache inteligente**: Datos en memoria con invalidación automática
- **Sincronización en tiempo real**: Refetch automático cuando es necesario
- **Manejo de estado**: Loading, error, success states automáticos
- **Optimistic updates**: Actualizaciones inmediatas en la UI

### 3. **Reutilización de Código**

- Hooks personalizados para cada operación
- Lógica de negocio centralizada
- Patrones consistentes en toda la aplicación

### 4. **Manejo de Errores Centralizado**

- Interceptores globales para errores 401/422
- Logout automático en errores de autenticación
- Formateo consistente de errores

## 📚 Uso de los Nuevos Hooks

### Autenticación

```typescript
import { useLogin, useProfile, useLogout } from '@/src/hooks';

const MyComponent = () => {
  const { data: profile, isLoading } = useProfile();
  const login = useLogin();
  const { logout } = useLogout();

  // Usar login.mutateAsync(credentials)
  // Usar logout()
};
```

### Productos

```typescript
import { useProductos, useCreateProducto, useUpdateProducto } from '@/src/hooks';

const MyComponent = () => {
  const { data: productos, isLoading } = useProductos({ categoria: 'Electrónicos' });
  const createProducto = useCreateProducto();
  const updateProducto = useUpdateProducto();

  // Usar createProducto.mutateAsync(productoData)
  // Usar updateProducto.mutateAsync({ id, data })
};
```

### Inventario

```typescript
import { useBodegas, useStockProducto, useMovimientos } from '@/src/hooks';

const MyComponent = () => {
  const { data: bodegas } = useBodegas(true); // Solo activas
  const { data: stock } = useStockProducto(productoId);
  const { data: movimientos } = useMovimientos({ bodega_id: 1 });
};
```

## 🔄 Flujo de Datos

1. **Componente** → Llama al hook
2. **Hook** → Ejecuta la query/mutation
3. **Servicio** → Hace la petición HTTP
4. **API Client** → Maneja interceptores y configuración
5. **React Query** → Cachea y sincroniza datos
6. **Componente** → Recibe datos actualizados automáticamente

## 🚦 Estados de las Queries

- **`isLoading`**: Primera carga
- **`isFetching`**: Refetch en progreso
- **`isError`**: Error en la petición
- **`isSuccess`**: Datos cargados exitosamente
- **`data`**: Datos de la respuesta
- **`error`**: Información del error

## 🎨 Características Avanzadas

### Cache Inteligente

- **`staleTime`**: Tiempo antes de considerar datos obsoletos
- **`gcTime`**: Tiempo antes de limpiar del cache
- **Invalidación automática**: Al crear/actualizar/eliminar

### Optimizaciones

- **Debounced search**: Búsquedas optimizadas
- **Infinite scroll**: Paginación eficiente
- **Background refetch**: Actualizaciones automáticas
- **Optimistic updates**: Respuesta inmediata en la UI

## 📱 Migración desde el Sistema Anterior

### Antes (Monolítico)

```typescript
// Todo en un archivo
import { productoService } from '@/src/services/api';

const productos = await productoService.getProductos();
```

### Después (Modular)

```typescript
// Hooks organizados por dominio
import { useProductos } from '@/src/hooks';

const { data: productos, isLoading } = useProductos();
```

## 🛠️ Configuración del Entorno

### 1. Instalar Dependencias

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### 2. Configurar QueryProvider

```typescript
// En layout.jsx
import { QueryProvider } from '@/src/providers/QueryProvider';

export default function RootLayout({ children }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
```

### 3. Usar Hooks en Componentes

```typescript
import { useProductos, useCreateProducto } from '@/src/hooks';

const MyComponent = () => {
  const { data: productos } = useProductos();
  const createProducto = useCreateProducto();

  // Tu lógica aquí
};
```

## 🔍 Debugging y DevTools

React Query incluye herramientas de desarrollo:

- **React Query DevTools**: Panel de debug integrado
- **Cache Inspector**: Visualizar estado del cache
- **Query Explorer**: Explorar queries activas
- **Performance Monitor**: Métricas de rendimiento

## 📈 Métricas de Rendimiento

- **Reducción de peticiones HTTP**: Cache inteligente
- **Mejor UX**: Estados de loading/error consistentes
- **Sincronización automática**: Datos siempre actualizados
- **Optimistic updates**: Respuesta inmediata en la UI

## 🚀 Próximos Pasos

1. **Migrar componentes existentes** a los nuevos hooks
2. **Implementar servicios faltantes** (proveedores, usuarios)
3. **Añadir tests** para los hooks y servicios
4. **Implementar error boundaries** para mejor UX
5. **Añadir métricas** de rendimiento

## 📞 Soporte

Para dudas sobre la implementación:

- Revisar ejemplos en `src/components/examples/`
- Consultar documentación de React Query
- Revisar tipos TypeScript en `src/services/interfaces.ts`

---

**¡La refactorización está completa! Tu sistema ahora es más organizado, eficiente y mantenible.**
🎉
