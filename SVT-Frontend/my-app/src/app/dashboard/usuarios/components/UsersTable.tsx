// UsersTable.jsx (con corrección)
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRow } from './UserRow';

interface Usuario {
  id: number;
  email: string;
  rol: string;
  nombre?: string;
  lastLogin?: string;
}

interface UsersTableProps {
  usuarios: Usuario[];
  allUsuarios: Usuario[];
  loading: boolean;
  searchQuery: string;
  filters: {
    rol?: string;
    search?: string;
  };
  onRolChange: (userId: number, nuevoRol: string) => void;
  onDeleteUser: (userId: number) => Promise<void>; // Cambiado a Promise<void>
}

export function UsersTable({ 
  usuarios, 
  allUsuarios, 
  loading, 
  searchQuery, 
  filters,
  onRolChange,
  onDeleteUser
}: UsersTableProps) {
  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Cargando usuarios...</span>
        </div>
      ) : (
        <div className="rounded-md border shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Rol</TableHead>
                <TableHead className="text-right font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.length > 0 ? (
                usuarios.map(usuario => (
                  <UserRow 
                    key={usuario.id}
                    usuario={usuario}
                    onRolChange={onRolChange}
                    onDeleteUser={onDeleteUser}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    {searchQuery ? (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="h-8 w-8 mb-2 opacity-40" />
                        <p>No se encontraron usuarios que coincidan con <strong>"{searchQuery}"</strong></p>
                      </div>
                    ) : filters.rol ? (
                      <div className="text-muted-foreground">
                        No hay usuarios con el rol seleccionado.
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        No hay usuarios disponibles.
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {usuarios.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground text-right">
          Mostrando {usuarios.length} de {allUsuarios.length} usuarios
        </div>
      )}
    </>
  );
}