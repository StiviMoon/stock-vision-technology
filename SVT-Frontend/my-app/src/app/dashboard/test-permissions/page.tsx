'use client';

import { useAuthContext } from '@/src/context/AuthContext';
import { usePermissions } from '@/src/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Shield, Eye } from 'lucide-react';

export default function TestPermissionsPage() {
  const { user } = useAuthContext();
  const permissions = usePermissions();

  // Debug: Mostrar información detallada
  console.log('TestPermissions - User:', user);
  console.log('TestPermissions - Permissions:', permissions);

  const permissionGroups = [
    {
      title: 'Información del Usuario',
      permissions: [
        { key: 'isAdmin', label: 'Es Administrador', icon: Shield },
        { key: 'isUsuario', label: 'Es Usuario', icon: User },
        { key: 'isInvitado', label: 'Es Invitado', icon: Eye },
      ]
    },
    {
      title: 'Gestión de Usuarios',
      permissions: [
        { key: 'canManageUsers', label: 'Gestionar Usuarios' },
        { key: 'canViewUsers', label: 'Ver Usuarios' },
        { key: 'canCreateUsers', label: 'Crear Usuarios' },
        { key: 'canEditUsers', label: 'Editar Usuarios' },
        { key: 'canDeleteUsers', label: 'Eliminar Usuarios' },
        { key: 'canChangeRoles', label: 'Cambiar Roles' },
      ]
    },
    {
      title: 'Gestión de Productos',
      permissions: [
        { key: 'canViewProducts', label: 'Ver Productos' },
        { key: 'canCreateProducts', label: 'Crear Productos' },
        { key: 'canEditProducts', label: 'Editar Productos' },
        { key: 'canDeleteProducts', label: 'Eliminar Productos' },
      ]
    },
    {
      title: 'Gestión de Inventario',
      permissions: [
        { key: 'canViewInventory', label: 'Ver Inventario' },
        { key: 'canCreateInventory', label: 'Crear Inventario' },
        { key: 'canUpdateInventory', label: 'Actualizar Inventario' },
        { key: 'canDeleteInventory', label: 'Eliminar Inventario' },
      ]
    },
    {
      title: 'Gestión de Proveedores',
      permissions: [
        { key: 'canViewSuppliers', label: 'Ver Proveedores' },
        { key: 'canCreateSuppliers', label: 'Crear Proveedores' },
        { key: 'canEditSuppliers', label: 'Editar Proveedores' },
        { key: 'canDeleteSuppliers', label: 'Eliminar Proveedores' },
      ]
    },
    {
      title: 'Otros Permisos',
      permissions: [
        { key: 'canViewReports', label: 'Ver Reportes' },
        { key: 'canUseChat', label: 'Usar Chat' },
      ]
    }
  ];

  const getPermissionValue = (key: string) => {
    return (permissions as any)[key] || false;
  };

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case 'ADMIN': return 'bg-green-100 text-green-800 border-green-200';
      case 'USUARIO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'INVITADO': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleDisplayName = (rol: string) => {
    switch (rol) {
      case 'ADMIN': return 'Administrador';
      case 'USUARIO': return 'Usuario';
      case 'INVITADO': return 'Invitado';
      default: return rol;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Prueba de Permisos</h1>
        <Badge className={getRoleBadgeColor(user?.rol || '')}>
          {getRoleDisplayName(user?.rol || '')}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Usuario Actual</CardTitle>
          <CardDescription>
            Datos del usuario autenticado y su rol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email || 'No disponible'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-medium">
                {user?.nombre && user?.apellido
                  ? `${user.nombre} ${user.apellido}`
                  : user?.nombre || 'No disponible'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rol</p>
              <Badge className={getRoleBadgeColor(user?.rol || '')}>
                {getRoleDisplayName(user?.rol || '')}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <Badge variant={user?.activo ? 'default' : 'secondary'}>
                {user?.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {permissionGroups.map((group, groupIndex) => (
          <Card key={groupIndex}>
            <CardHeader>
              <CardTitle className="text-lg">{group.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.permissions.map((permission, permIndex) => {
                  const hasPermission = getPermissionValue(permission.key);
                  const IconComponent = permission.icon || (hasPermission ? CheckCircle : XCircle);

                  return (
                    <div key={permIndex} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <IconComponent
                          size={16}
                          className={hasPermission ? 'text-green-500' : 'text-red-500'}
                        />
                        <span className="text-sm">{permission.label}</span>
                      </div>
                      <Badge variant={hasPermission ? 'default' : 'secondary'}>
                        {hasPermission ? 'Sí' : 'No'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Permisos</CardTitle>
          <CardDescription>
            Total de permisos disponibles vs. permisos otorgados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Object.values(permissions).filter(Boolean).length}
              </p>
              <p className="text-sm text-muted-foreground">Permisos Otorgados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {Object.keys(permissions).length}
              </p>
              <p className="text-sm text-muted-foreground">Total de Permisos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Math.round((Object.values(permissions).filter(Boolean).length / Object.keys(permissions).length) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Porcentaje de Acceso</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
