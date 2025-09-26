'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
} from 'lucide-react';

interface TableActionsProps {
  // Acciones disponibles
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onToggleStatus?: () => void;

  // Estado del item
  isActive?: boolean;

  // Permisos
  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
  canToggleStatus?: boolean;
}

export const TableActions: React.FC<TableActionsProps> = ({
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  isActive = true,
  canEdit = true,
  canDelete = true,
  canView = true,
  canToggleStatus = true,
}) => {
  // Construir lista de acciones para el dropdown
  const dropdownActions = [];

  // Ver detalles
  if (canView && onView) {
    dropdownActions.push({
      id: 'view',
      label: 'Ver detalles',
      icon: <Eye className='h-4 w-4' />,
      onClick: onView,
      className: '',
    });
  }

  // Activar/Inactivar
  if (canToggleStatus && onToggleStatus) {
    dropdownActions.push({
      id: 'toggle-status',
      label: isActive ? 'Inactivar' : 'Activar',
      icon: isActive ? (
        <XCircle className='h-4 w-4' />
      ) : (
        <CheckCircle className='h-4 w-4' />
      ),
      onClick: onToggleStatus,
      className: 'text-orange-600 focus:text-orange-600',
    });
  }

  // Eliminar
  if (canDelete && onDelete) {
    dropdownActions.push({
      id: 'delete',
      label: 'Eliminar',
      icon: <Trash2 className='h-4 w-4' />,
      onClick: onDelete,
      className: 'text-destructive focus:text-destructive',
    });
  }

  return (
    <div className='flex items-center justify-end gap-2'>
      {/* Botón de Editar (siempre visible) */}
      {canEdit && onEdit && (
        <Button
          variant='ghost'
          size='sm'
          onClick={onEdit}
          className='h-8 w-8 p-0'
          title='Editar'
        >
          <Edit className='h-4 w-4' />
        </Button>
      )}

      {/* Dropdown de acciones secundarias */}
      {dropdownActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
              <MoreHorizontal className='h-4 w-4' />
              <span className='sr-only'>Abrir menú de acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {dropdownActions.map(action => (
              <DropdownMenuItem
                key={action.id}
                onClick={action.onClick}
                className={action.className}
              >
                {action.icon}
                <span className='ml-2'>{action.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
