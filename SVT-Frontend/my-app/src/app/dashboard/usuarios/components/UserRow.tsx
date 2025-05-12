'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { UserActions } from './UserActions';
import { UserRoleSelector } from './UserRoleSelector';
import { UserRowProps, getRoleBadgeColor, getRoleDisplayName } from '../types';

export function UserRow({ usuario, onRolChange, onDeleteUser }: UserRowProps) {
  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="py-4">
        <div>
          {usuario.nombre && (
            <div className="font-semibold text-foreground">{usuario.nombre}</div>
          )}
          <div className={usuario.nombre ? "text-sm text-muted-foreground" : "font-medium"}>
            {usuario.email}
          </div>
          {usuario.lastLogin && (
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
              Último acceso: {new Date(usuario.lastLogin).toLocaleString()}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Badge variant="outline" className={`${getRoleBadgeColor(usuario.rol)} whitespace-nowrap mb-2 sm:mb-0 w-[125px]`}>
            {getRoleDisplayName(usuario.rol)}
          </Badge>
          <UserRoleSelector
            currentRole={usuario.rol}
            onRoleChange={(role) => onRolChange(usuario.id, role)}
          />
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
            onUserDeleted={async () => await onDeleteUser(usuario.id)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}