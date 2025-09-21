// app/usuarios/types.ts

// Interfaz para el usuario
export interface Usuario {
  id: number;
  email: string;
  rol: string;
  nombre?: string;
  apellido?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Datos para crear un usuario
export interface UsuarioCreate {
  email: string;
  password: string;
  nombre?: string;
  apellido?: string;
  rol: Rol;
}

export interface UsuarioUpdate {
  email?: string;
  nombre?: string;
  apellido?: string;
  rol?: Rol;
  activo?: boolean;
}

export type Rol = 'ADMIN' | 'USUARIO' | 'INVITADO';

// Interfaz para los filtros
export interface Filtros {
  rol?: string;
  search?: string;
  estado?: string;
}

export interface UsersDashboardProps {
  // Si necesitas props específicas para el dashboard
}

export interface UsersHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  loading: boolean;
}

export interface UsersStatsProps {
  stats: {
    total: number;
    admins: number;
    usuarios: number;
    invitados: number;
  };
}

// Props para UserForm
export interface UserFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formMode: 'create' | 'edit';
  initialData: Usuario | null;
  onSubmit: (data: UsuarioCreate | UsuarioUpdate) => Promise<{ success: boolean; validationErrors?: Record<string, string>; generalError?: string }>;
}

export interface UsersFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: { rol?: string }) => void;
  activeFilters: { rol?: string, search?: string };
}

export interface UsersTableProps {
  usuarios: Usuario[];
  allUsuarios: Usuario[];
  loading: boolean;
  searchQuery: string;
  filters: Filtros;
  onDeleteUser: (userId: number) => Promise<void>;
  onEditUser: (user: Usuario) => void;
  canEditUsers?: boolean;
  canDeleteUsers?: boolean;
}

// Props para UserRow
export interface UserRowProps {
  usuario: Usuario;
  onDeleteUser?: (userId: number) => Promise<void>;
  onEditUser?: (user: Usuario) => void;
  canEditUsers?: boolean;
  canDeleteUsers?: boolean;
}

export interface UserRoleSelectorProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export interface UserActionsProps {
  userId: number;
  userEmail: string;
  isAdmin: boolean;
  onUserDeleted?: () => Promise<void>;
}

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
    case 'USUARIO':
      return 'Usuario';
    case 'INVITADO':
      return 'Invitado';
    default:
      return rol;
  }
};
