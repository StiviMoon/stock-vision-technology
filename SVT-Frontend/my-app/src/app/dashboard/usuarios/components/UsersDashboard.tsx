
'use client';

// UsersDashboard.jsx (con corrección)
import { useEffect, useState, useMemo, useCallback } from 'react';
import { userService } from '@/src/services/api';
import { UsersHeader } from './UsersHeader';
import { UsersStats } from './UsersStats';
import { UsersFilter } from './UsersFilter'; // Tu componente existente
import { UsersTable } from './UsersTable';
import UserForm from './UserForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { Usuario, Filtros, UsersDashboardProps, UsuarioCreate, UsuarioUpdate, Rol } from '../types';
import { usePermissions } from '@/src/hooks/usePermissions';

export default function UsersDashboard({}: UsersDashboardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [allUsuarios, setAllUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filtros>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estados para el formulario de usuario
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  // Permisos
  const { canViewUsers, canCreateUsers, canEditUsers, canDeleteUsers } = usePermissions();

  useEffect(() => {
    setIsVisible(true);
    if (canViewUsers) {
      fetchUsuarios();
    }
  }, [canViewUsers]);

  // Aplicar filtros a los usuarios
  useEffect(() => {
    let filteredUsers = [...allUsuarios];

    // Filtrar por rol
    if (filters.rol) {
      filteredUsers = filteredUsers.filter(user => user.rol === filters.rol);
    }

    // Filtrar por estado
    if (filters.estado) {
      const isActive = filters.estado === 'activo';
      filteredUsers = filteredUsers.filter(user => user.activo === isActive);
    }

    // Filtrar por búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.email.toLowerCase().includes(searchTerm) ||
        (user.nombre && user.nombre.toLowerCase().includes(searchTerm)) ||
        (user.apellido && user.apellido.toLowerCase().includes(searchTerm))
      );
    }

    setUsuarios(filteredUsers);
  }, [filters, allUsuarios]);

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await userService.getAllUsers();
      const usuarios = Array.isArray(data) ? data : [];
      setAllUsuarios(usuarios);
      setUsuarios(usuarios);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setError('No se pudieron cargar los usuarios. Por favor, inténtelo de nuevo más tarde.');
      setAllUsuarios([]);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshUsuarios = async () => {
    setIsRefreshing(true);
    try {
      await fetchUsuarios();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearchChange = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  };

  const handleFilterChange = (newFilters: Filtros) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };


  // Marcado como async para devolver una Promise<void>
  const handleDeleteUser = async (userId: number): Promise<void> => {
    try {
      await userService.deleteUser(userId);
      setAllUsuarios(prev => prev.filter(u => u.id !== userId));
      setUsuarios(prev => prev.filter(u => u.id !== userId));
      toast.success('Usuario eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setError('No se pudo eliminar el usuario. Por favor, inténtelo de nuevo.');
      toast.error('Error al eliminar el usuario');
    }
  };

  // Funciones para el formulario de usuario
  const openCreateForm = () => {
    setFormMode('create');
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const openEditForm = (user: Usuario) => {
    setFormMode('edit');
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: UsuarioCreate | UsuarioUpdate) => {
    try {
      if (formMode === 'create') {
        const newUser = await userService.createUser(data as UsuarioCreate);
        setAllUsuarios(prev => [...prev, newUser]);
        setUsuarios(prev => [...prev, newUser]);
        toast.success('Usuario creado correctamente');
      } else {
        const updatedUser = await userService.updateUser(selectedUser!.id, data as UsuarioUpdate);
        setAllUsuarios(prev =>
          prev.map(user => user.id === selectedUser!.id ? updatedUser : user)
        );
        setUsuarios(prev =>
          prev.map(user => user.id === selectedUser!.id ? updatedUser : user)
        );
        toast.success('Usuario actualizado correctamente');
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error en el formulario:', error);

      // Manejar errores de validación del backend
      if (error.response?.status === 422) {
        const validationErrors: Record<string, string> = {};
        if (error.response.data?.detail) {
          error.response.data.detail.forEach((err: any) => {
            if (err.loc && err.loc.length > 0) {
              const field = err.loc[err.loc.length - 1];
              validationErrors[field] = err.msg;
            }
          });
        }
        return { success: false, validationErrors };
      }

      return {
        success: false,
        generalError: error.response?.data?.detail || 'Error al procesar la solicitud'
      };
    }
  };

  // Calcular estadísticas de usuarios
  const stats = useMemo(() => {
    return {
      total: allUsuarios.length,
      admins: allUsuarios.filter(u => u.rol.toUpperCase() === 'ADMIN').length,
      usuarios: allUsuarios.filter(u => u.rol.toUpperCase() === 'USUARIO').length,
      invitados: allUsuarios.filter(u => u.rol.toUpperCase() === 'INVITADO').length
    };
  }, [allUsuarios]);

  // Si no tiene permisos para ver usuarios, mostrar mensaje
  if (!canViewUsers) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acceso Denegado</AlertTitle>
          <AlertDescription>
            No tienes permisos para ver la gestión de usuarios. Contacta al administrador si necesitas acceso.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div
        className={`transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      >
        <UsersHeader
          onRefresh={refreshUsuarios}
          isRefreshing={isRefreshing}
          loading={loading}
        />
      </div>

      {error && (
        <Alert variant="destructive" className="animate-in fade-in duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <UsersStats stats={stats} />

      <Card
        className={`transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>
                Visualiza y administra los roles de todos los usuarios del sistema.
              </CardDescription>
            </div>
            {canCreateUsers && (
              <Button onClick={openCreateForm} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Crear Usuario
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Usar tu componente UsersFilter existente */}
          <UsersFilter
            onSearch={handleSearchChange}
            onFilterChange={handleFilterChange}
            activeFilters={filters}
          />

          <UsersTable
            usuarios={usuarios}
            allUsuarios={allUsuarios}
            loading={loading}
            searchQuery={filters.search || ''}
            filters={filters}
            onDeleteUser={canDeleteUsers ? handleDeleteUser : undefined}
            onEditUser={canEditUsers ? openEditForm : undefined}
            canEditUsers={canEditUsers}
            canDeleteUsers={canDeleteUsers}
          />
        </CardContent>
      </Card>

      {/* Formulario de usuario */}
      <UserForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        formMode={formMode}
        initialData={selectedUser}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
