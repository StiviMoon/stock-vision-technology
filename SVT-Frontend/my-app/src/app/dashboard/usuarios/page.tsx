'use client';

import { useEffect, useState, useMemo } from 'react';
import { userService } from '@/src/services/api';
import { UsersFilter } from '../../../components/usuarios/UsersFilter';
import { UserActions } from '../../../components/usuarios/UserActions';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  AlertCircle, 
  Check,
  RefreshCw,
  UserCog,
  Loader2 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Definimos la interfaz para un usuario
interface Usuario {
  id: number;
  email: string;
  rol: string;
  nombre?: string;
  lastLogin?: string;
}

// Definimos la interfaz para los filtros
interface Filtros {
  rol?: string;
  search?: string;
}

export default function UsuariosPage() {
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

  // Corregido el tipo de userId para que coincida con la interfaz Usuario
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

  const handleSearchChange = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  };

  const handleFilterChange = (newFilters: Filtros) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const getRoleBadgeColor = (rol: string) => {
    switch (rol.toUpperCase()) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'USER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'GUEST':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Función para mostrar el nombre del rol de manera amigable
  const getRoleDisplayName = (rol: string) => {
    switch (rol.toUpperCase()) {
      case 'ADMIN':
        return 'Admin';
      case 'USER':
        return 'Usuario';
      case 'GUEST':
        return 'Invitado';
      default:
        return rol;
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Usuarios</h1>
            <p className="text-muted-foreground">Administra los usuarios registrados en el sistema.</p>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={refreshUsuarios}
                    disabled={loading || isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refrescar usuarios</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-in fade-in duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <UserCog className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Total Usuarios</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant="outline" className={`${getRoleBadgeColor('ADMIN')} mx-auto mb-2 px-3 py-1`}>
                Admin
              </Badge>
              <p className="text-muted-foreground text-sm">Administradores</p>
              <p className="text-3xl font-bold">{stats.admins}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant="outline" className={`${getRoleBadgeColor('USER')} mx-auto mb-2 px-3 py-1`}>
                Usuario
              </Badge>
              <p className="text-muted-foreground text-sm">Usuarios</p>
              <p className="text-3xl font-bold">{stats.usuarios}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant="outline" className={`${getRoleBadgeColor('GUEST')} mx-auto mb-2 px-3 py-1`}>
                Invitado
              </Badge>
              <p className="text-muted-foreground text-sm">Invitados</p>
              <p className="text-3xl font-bold">{stats.invitados}</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
          <UsersFilter 
            onSearch={handleSearchChange}
            onFilterChange={handleFilterChange}
            activeFilters={filters}
          />

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Cargando usuarios...</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.length > 0 ? (
                    usuarios.map(usuario => (
                      <TableRow key={usuario.id}>
                        <TableCell className="font-medium">
                          <div>
                            {usuario.nombre && <div className="font-semibold">{usuario.nombre}</div>}
                            <div className={usuario.nombre ? "text-sm text-muted-foreground" : ""}>
                              {usuario.email}
                            </div>
                            {usuario.lastLogin && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Último acceso: {new Date(usuario.lastLogin).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-6">
                            <Badge variant="outline" className={`${getRoleBadgeColor(usuario.rol)} w-[65px]`}>
                              {getRoleDisplayName(usuario.rol)}
                            </Badge>
                            <Select
                              value={usuario.rol}
                              onValueChange={(value) => handleRolChange(usuario.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Cambiar rol" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="USER">Usuario</SelectItem>
                                <SelectItem value="GUEST">Invitado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="inline-flex items-center justify-center rounded-full bg-green-100 p-1 text-green-600">
                              <Check className="h-4 w-4" />
                            </span>
                            <UserActions 
                              userId={usuario.id}
                              userEmail={usuario.email}
                              isAdmin={true} 
                              onDelete={async (userId) => {
                                try {
                                  await userService.deleteUser(userId);
                                  setAllUsuarios(prev => prev.filter(u => u.id !== userId));
                                  setUsuarios(prev => prev.filter(u => u.id !== userId));
                                } catch (error) {
                                  console.error('Error al eliminar usuario:', error);
                                  setError('No se pudo eliminar el usuario. Por favor, inténtelo de nuevo.');
                                }
                              }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No hay usuarios disponibles{filters.search || filters.rol ? ' que coincidan con los filtros aplicados.' : '.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}