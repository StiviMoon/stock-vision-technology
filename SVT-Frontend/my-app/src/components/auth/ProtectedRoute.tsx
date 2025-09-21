'use client';

import { ReactNode } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  fallback?: ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  requiredPermission,
  fallback,
  redirectTo = '/dashboard'
}: ProtectedRouteProps) => {
  const { user, loading } = useAuthContext();
  const permissions = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (se redirigirá)
  if (!user) {
    return null;
  }

  // Si se requiere un permiso específico
  if (requiredPermission) {
    const hasPermission = (permissions as any)[requiredPermission];

    if (!hasPermission) {
      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No tienes permisos para acceder a esta sección.
              Contacta al administrador si necesitas acceso.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  return <>{children}</>;
};

// Componente específico para rutas de administrador
export const AdminRoute = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => {
  return (
    <ProtectedRoute
      requiredPermission="isAdmin"
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

// Componente específico para rutas que requieren permisos de usuario o admin
export const UserRoute = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => {
  return (
    <ProtectedRoute
      requiredPermission="isUsuario"
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};
