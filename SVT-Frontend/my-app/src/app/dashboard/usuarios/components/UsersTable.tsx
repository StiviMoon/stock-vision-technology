'use client';

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Loader2 } from 'lucide-react';
import { UserRow } from './UserRow';
import { Usuario } from '../types';

interface UsersTableProps {
  usuarios: Usuario[];
  allUsuarios?: Usuario[];
  loading: boolean;
  searchQuery?: string;
  filters?: Record<string, any>;
  onDeleteUser?: (userId: number) => Promise<void>;
  onEditUser?: (user: Usuario) => void;
  canEditUsers?: boolean;
  canDeleteUsers?: boolean;
}

export function UsersTable({
  usuarios,
  loading,
  onDeleteUser,
  onEditUser,
  canEditUsers = false,
  canDeleteUsers = false
}: UsersTableProps) {

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>No hay usuarios que coincidan con los criterios de búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%]">Usuario</TableHead>
            <TableHead className="w-[20%]">Nombre</TableHead>
            <TableHead className="w-[15%]">Rol</TableHead>
            <TableHead className="w-[15%]">Estado</TableHead>
            <TableHead className="w-[15%]">Fecha Creación</TableHead>
            <TableHead className="text-right w-[10%]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((usuario) => (
            <UserRow
              key={usuario.id}
              usuario={usuario}
              onDeleteUser={onDeleteUser}
              onEditUser={onEditUser}
              canEditUsers={canEditUsers}
              canDeleteUsers={canDeleteUsers}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
