'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { UserRoleSelectorProps } from '../types';

export function UserRoleSelector({ currentRole, onRoleChange }: UserRoleSelectorProps) {
  const [isChanging, setIsChanging] = useState(false);
  
  const handleRoleChange = async (value: string) => {
    if (value === currentRole) return;
    
    setIsChanging(true);
    try {
      await onRoleChange(value);
    } finally {
      setIsChanging(false);
    }
  };
  
  const roles = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'USER', label: 'Usuario' },
    { value: 'GUEST', label: 'Invitado' }
  ];

  return (
    <div className="inline-flex items-center">
      {isChanging ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Actualizando...
        </div>
      ) : (
        <Select
          defaultValue={currentRole}
          onValueChange={handleRoleChange}
          disabled={isChanging}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Cambiar rol" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}