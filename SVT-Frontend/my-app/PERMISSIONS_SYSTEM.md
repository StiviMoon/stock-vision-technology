# Sistema de Permisos - Frontend

## Resumen

El sistema de permisos en el frontend está diseñado para controlar el acceso a diferentes funcionalidades basado en el rol del usuario autenticado. Los permisos se sincronizan con el backend y se aplican tanto en la UI como en las peticiones API.

## Roles y Permisos

### 🔴 ADMIN
- **Gestión completa de usuarios**: Crear, editar, eliminar, ver todos los usuarios
- **Gestión completa de productos**: Crear, editar, eliminar, ver productos
- **Gestión completa de inventario**: Crear, editar, eliminar, ver inventario
- **Gestión completa de proveedores**: Crear, editar, eliminar, ver proveedores
- **Acceso a reportes**: Ver reportes del sistema
- **Acceso al chat**: Usar el asistente IA

### 🔵 USUARIO
- **Ver usuarios**: Solo lectura de usuarios
- **Productos**: Ver, crear y editar productos
- **Inventario**: Ver, crear y actualizar inventario
- **Proveedores**: Ver, crear y editar proveedores
- **Acceso a reportes**: Ver reportes del sistema
- **Acceso al chat**: Usar el asistente IA

### ⚪ INVITADO
- **Ver productos**: Solo lectura de productos
- **Ver inventario**: Solo lectura de inventario
- **Ver proveedores**: Solo lectura de proveedores
- **Acceso al chat**: Usar el asistente IA

## Componentes del Sistema

### 1. Hook `usePermissions`
```typescript
const {
  isAdmin,
  isUsuario,
  isInvitado,
  canViewUsers,
  canCreateUsers,
  canEditUsers,
  canDeleteUsers,
  // ... más permisos
} = usePermissions();
```

### 2. Componente `ProtectedRoute`
```typescript
<ProtectedRoute requiredPermission="canViewUsers">
  <UsersDashboard />
</ProtectedRoute>
```

### 3. Hook `useApiPermissions`
```typescript
const { canMakeRequest, makeAuthenticatedRequest } = useApiPermissions();

// Verificar antes de hacer petición
if (canMakeRequest('/users', 'POST')) {
  // Hacer petición
}
```

## Implementación en Componentes

### NavBar
- Los elementos del menú se filtran según los permisos del usuario
- Solo se muestran las opciones a las que el usuario tiene acceso

### Páginas Protegidas
- Cada página puede usar `ProtectedRoute` para verificar permisos
- Se muestran mensajes de error si no se tienen permisos

### Formularios y Botones
- Los botones de acción se muestran/ocultan según permisos
- Los formularios se deshabilitan si no se tienen permisos

## Flujo de Verificación

1. **Autenticación**: El usuario se autentica y se obtiene su rol
2. **Carga de permisos**: Se cargan los permisos basados en el rol
3. **Verificación UI**: Los componentes verifican permisos antes de renderizar
4. **Verificación API**: Las peticiones verifican permisos antes de enviarse
5. **Respuesta del backend**: El backend también verifica permisos

## Ejemplo de Uso

```typescript
// En un componente
const { canCreateUsers, canEditUsers } = usePermissions();

return (
  <div>
    {canCreateUsers && (
      <Button onClick={handleCreateUser}>
        Crear Usuario
      </Button>
    )}

    {canEditUsers && (
      <Button onClick={handleEditUser}>
        Editar Usuario
      </Button>
    )}
  </div>
);
```

## Página de Prueba

Visita `/dashboard/test-permissions` para ver todos los permisos del usuario actual y verificar que el sistema funciona correctamente.

## Seguridad

- Los permisos se verifican tanto en el frontend como en el backend
- El frontend proporciona una mejor UX ocultando elementos no permitidos
- El backend es la fuente de verdad para la seguridad real
- Las peticiones API incluyen tokens de autorización
- Los permisos se actualizan automáticamente cuando cambia el usuario
