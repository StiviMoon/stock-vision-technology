// app/usuarios/types.ts
// Archivo centralizado de tipos e interfaces

// Interfaz para el usuario
export interface Usuario {
    id: number;
    email: string;
    rol: string;
    nombre?: string;
    lastLogin?: string;
  }
  
  // Tipo para roles
  export type Rol = 'ADMIN' | 'USER' | 'GUEST';
  
  // Interfaz para los filtros
  export interface Filtros {
    rol?: string;
    search?: string;
  }
  
  // Props para UsersDashboard
  export interface UsersDashboardProps {
    // Si necesitas props específicas para el dashboard
  }
  
  // Props para UsersHeader
  export interface UsersHeaderProps {
    onRefresh: () => void;
    isRefreshing: boolean;
    loading: boolean;
  }
  
  // Props para UsersStats
  export interface UsersStatsProps {
    stats: {
      total: number;
      admins: number;
      usuarios: number;
      invitados: number;
    };
  }
  
  // Props para UsersFilter (basado en tu componente existente)
  export interface UsersFilterProps {
    onSearch: (query: string) => void;
    onFilterChange: (filters: { rol?: string }) => void;
    activeFilters: { rol?: string, search?: string };
  }
  
  // Props para UsersTable
  export interface UsersTableProps {
    usuarios: Usuario[];
    allUsuarios: Usuario[];
    loading: boolean;
    searchQuery: string;
    filters: Filtros;
    onRolChange: (userId: number, nuevoRol: string) => void;
    onDeleteUser: (userId: number) => Promise<void>;
  }
  
  // Props para UserRow
  export interface UserRowProps {
    usuario: Usuario;
    onRolChange: (userId: number, nuevoRol: string) => void;
    onDeleteUser: (userId: number) => Promise<void>;
  }
  
  // Props para UserRoleSelector
  export interface UserRoleSelectorProps {
    currentRole: string;
    onRoleChange: (role: string) => void;
  }
  
  // Props para UserActions (si necesitas controlar el tipo desde aquí también)
  export interface UserActionsProps {
    userId: number;
    userEmail: string;
    isAdmin: boolean;
    onDelete: () => Promise<void>;
  }
  
  // Funciones utilitarias relacionadas con roles que podrían usarse en múltiples componentes
  export const getRoleBadgeColor = (rol: string): string => {
    switch (rol.toUpperCase()) {
      case 'ADMIN':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'USER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'GUEST':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  export const getRoleDisplayName = (rol: string): string => {
    switch (rol.toUpperCase()) {
      case 'ADMIN':
        return 'Administrador';
      case 'USER':
        return 'Usuario';
      case 'GUEST':
        return 'Invitado';
      default:
        return rol;
    }
  };