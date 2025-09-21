'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { UserActions } from './UserActions';
import { UserRowProps, getRoleBadgeColor, getRoleDisplayName } from '../types';

export function UserRow({
  usuario,
  onDeleteUser,
  onEditUser,
  canEditUsers = false,
  canDeleteUsers = false
}: UserRowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      {/* Email */}
      <TableCell className="py-4">
        <div>
          <div className="font-medium text-foreground">{usuario.email}</div>
        </div>
      </TableCell>

      {/* Nombre */}
      <TableCell className="py-4">
        <div>
          {usuario.nombre || usuario.apellido ? (
            <div className="font-medium">
              {usuario.nombre} {usuario.apellido}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Sin nombre</span>
          )}
        </div>
      </TableCell>

      {/* Rol */}
      <TableCell>
        <Badge variant="outline" className={`${getRoleBadgeColor(usuario.rol)} whitespace-nowrap w-fit`}>
          {getRoleDisplayName(usuario.rol)}
        </Badge>
      </TableCell>

      {/* Estado */}
      <TableCell>
        <div className="flex items-center gap-2">
          {usuario.activo ? (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              <UserCheck className="h-3 w-3 mr-1" />
              Activo
            </Badge>
          ) : (
            <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
              <UserX className="h-3 w-3 mr-1" />
              Inactivo
            </Badge>
          )}
        </div>
      </TableCell>

      {/* Fecha de creación */}
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {formatDate(usuario.fecha_creacion)}
        </div>
      </TableCell>

      {/* Acciones */}
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          {canEditUsers && onEditUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditUser(usuario)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canDeleteUsers && onDeleteUser && (
            <UserActions
              userId={usuario.id}
              userEmail={usuario.email}
              isAdmin={true}
              onUserDeleted={async () => await onDeleteUser(usuario.id)}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
