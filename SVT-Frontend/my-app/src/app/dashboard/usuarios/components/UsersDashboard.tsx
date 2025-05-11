
'use client';

// UsersDashboard.jsx (con corrección)
import { useEffect, useState, useMemo, useCallback } from 'react';
import { userService } from '@/src/services/api';
import { UsersHeader } from './UsersHeader';
import { UsersStats } from './UsersStats';
import { UsersFilter } from './UsersFilter'; // Tu componente existente
import { UsersTable } from './UsersTable';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Usuario, Filtros, UsersDashboardProps } from '../types';

export default function UsersDashboard({}: UsersDashboardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [allUsuarios, setAllUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filtros>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    fetchUsuarios();
  }, []);

  // Aplicar filtros a los usuarios
  useEffect(() => {
    let filteredUsers = [...allUsuarios];
    
    // Filtrar por rol
    if (filters.rol) {
      filteredUsers = filteredUsers.filter(user => user.rol === filters.rol);
    }
    
    // Filtrar por búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.email.toLowerCase().includes(searchTerm) || 
        (user.nombre && user.nombre.toLowerCase().includes(searchTerm))
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

  const handleRolChange = async (userId: number, nuevoRol: string) => {
    try {
      await userService.updateUserRole(userId, nuevoRol);
      
      // Actualizar localmente tanto en usuarios como en allUsuarios
      const updatedUser = { ...allUsuarios.find(u => u.id === userId)!, rol: nuevoRol };
      
      setAllUsuarios(prev =>
        prev.map(user => user.id === userId ? updatedUser : user)
      );
      
      setUsuarios(prev =>
        prev.map(user => user.id === userId ? updatedUser : user)
      );
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      setError('No se pudo actualizar el rol del usuario. Por favor, inténtelo de nuevo.');
    }
  };

  // Marcado como async para devolver una Promise<void>
  const handleDeleteUser = async (userId: number): Promise<void> => {
    try {
      await userService.deleteUser(userId);
      setAllUsuarios(prev => prev.filter(u => u.id !== userId));
      setUsuarios(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setError('No se pudo eliminar el usuario. Por favor, inténtelo de nuevo.');
    }
  };

  // Calcular estadísticas de usuarios
  const stats = useMemo(() => {
    return {
      total: allUsuarios.length,
      admins: allUsuarios.filter(u => u.rol.toUpperCase() === 'ADMIN').length,
      usuarios: allUsuarios.filter(u => u.rol.toUpperCase() === 'USER').length,
      invitados: allUsuarios.filter(u => u.rol.toUpperCase() === 'GUEST').length
    };
  }, [allUsuarios]);

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
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Visualiza y administra los roles de todos los usuarios del sistema.
          </CardDescription>
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
            onRolChange={handleRolChange}
            onDeleteUser={handleDeleteUser}
          />
        </CardContent>
      </Card>
    </div>
  );
}