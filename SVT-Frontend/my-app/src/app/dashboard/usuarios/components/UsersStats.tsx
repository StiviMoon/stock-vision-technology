
// 3. UsersStats.jsx
// Componente para mostrar las tarjetas de estadísticas

import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCog } from 'lucide-react';

interface UsersStatsProps {
  stats: {
    total: number;
    admins: number;
    usuarios: number;
    invitados: number;
  };
}

export function UsersStats({ stats }: UsersStatsProps) {
  const getRoleBadgeColor = (rol: string) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <UserCog className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Total Usuarios</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Badge variant="outline" className={`${getRoleBadgeColor('ADMIN')} mx-auto mb-2 px-3 py-1`}>
              Admin
            </Badge>
            <p className="text-muted-foreground text-sm">Administradores</p>
            <p className="text-3xl font-bold">{stats.admins}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Badge variant="outline" className={`${getRoleBadgeColor('USER')} mx-auto mb-2 px-3 py-1`}>
              Usuario
            </Badge>
            <p className="text-muted-foreground text-sm">Usuarios</p>
            <p className="text-3xl font-bold">{stats.usuarios}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Badge variant="outline" className={`${getRoleBadgeColor('GUEST')} mx-auto mb-2 px-3 py-1`}>
              Invitado
            </Badge>
            <p className="text-muted-foreground text-sm">Invitados</p>
            <p className="text-3xl font-bold">{stats.invitados}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
