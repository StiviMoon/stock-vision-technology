'use client';
import UsersDashboard from './components/UsersDashboard';
import { AdminRoute } from '@/src/components/auth/ProtectedRoute';

export default function UsuariosPage() {
  return (
    <AdminRoute>
      <UsersDashboard />
    </AdminRoute>
  );
}
