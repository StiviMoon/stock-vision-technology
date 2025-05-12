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
  onRolChange: (userId: number, nuevoRol: string) => Promise<void>;
  onDeleteUser: (userId: number) => Promise<void>;
}

export function UsersTable({ 
  usuarios, 
  loading, 
  onRolChange,
  onDeleteUser 
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
            <TableHead className="w-[40%]">Usuario</TableHead>
            <TableHead className="w-[40%]">Rol</TableHead>
            <TableHead className="text-right w-[20%]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((usuario) => (
            <UserRow 
              key={usuario.id}
              usuario={usuario}
              onRolChange={onRolChange}
              onDeleteUser={onDeleteUser}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}