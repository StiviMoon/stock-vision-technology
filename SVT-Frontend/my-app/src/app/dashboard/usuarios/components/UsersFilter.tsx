'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface FiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: { rol?: string; estado?: string }) => void;
  activeFilters: { rol?: string; estado?: string };
}

export function UsersFilter({ onSearch, onFilterChange, activeFilters }: FiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRoleFilter = (role: string) => {
    onFilterChange({ ...activeFilters, rol: role });
  };

  const handleEstadoFilter = (estado: string) => {
    onFilterChange({ ...activeFilters, estado: estado });
  };

  const clearFilters = () => {
    setSearchQuery('');
    onFilterChange({});
    onSearch('');
  };

  // Función para mostrar el nombre del rol de manera amigable
  const getRoleDisplayName = (rol: string) => {
    switch (rol.toUpperCase()) {
      case 'ADMIN':
        return 'Admin';
      case 'USUARIO':
        return 'Usuario';
      case 'INVITADO':
        return 'Invitado';
      default:
        return rol;
    }
  };

  const hasActiveFilters = activeFilters.rol || activeFilters.estado || searchQuery.length > 0;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mb-4">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por email o nombre..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={handleSearchInput}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button type="button" onClick={handleSearch}>Buscar</Button>
      </div>

      <div className="flex items-center gap-2">
        {activeFilters.rol && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Rol: {getRoleDisplayName(activeFilters.rol)}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={() => onFilterChange({ ...activeFilters, rol: undefined })}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {activeFilters.estado && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Estado: {activeFilters.estado === 'activo' ? 'Activo' : 'Inactivo'}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={() => onFilterChange({ ...activeFilters, estado: undefined })}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {hasActiveFilters && (
          <Button size="sm" variant="ghost" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Filtrar por rol</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => handleRoleFilter('ADMIN')}>
                Admin
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleRoleFilter('USUARIO')}>
                Usuario
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleRoleFilter('INVITADO')}>
                Invitado
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => handleEstadoFilter('activo')}>
                Activo
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleEstadoFilter('inactivo')}>
                Inactivo
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
