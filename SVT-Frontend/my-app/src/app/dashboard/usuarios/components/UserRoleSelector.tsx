
// 6. UserRoleSelector.jsx
// Selector de roles para cada usuario

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface UserRoleSelectorProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export function UserRoleSelector({ currentRole, onRoleChange }: UserRoleSelectorProps) {
  return (
    <Select
      value={currentRole}
      onValueChange={onRoleChange}
    >
      <SelectTrigger className="w-full sm:w-32">
        <SelectValue placeholder="Cambiar rol" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ADMIN">Admin</SelectItem>
        <SelectItem value="USER">Usuario</SelectItem>
        <SelectItem value="GUEST">Invitado</SelectItem>
      </SelectContent>
    </Select>
  );
}