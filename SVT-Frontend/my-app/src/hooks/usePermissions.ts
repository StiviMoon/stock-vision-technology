'use client';

import { useAuthContext } from '@/src/context/AuthContext';

export const usePermissions = () => {
  const { user } = useAuthContext();

  // Debug: Mostrar información del usuario
  if (process.env.NODE_ENV === 'development') {
    console.log('usePermissions - User:', user);
  }

  const isAdmin = user?.rol === 'ADMIN';
  const isUsuario = user?.rol === 'USUARIO';
  const isInvitado = user?.rol === 'INVITADO';

  // Permisos de usuarios (solo ADMIN puede gestionar usuarios)
  const canManageUsers = isAdmin;
  const canViewUsers = isAdmin || isUsuario; // ADMIN y USUARIO pueden ver usuarios
  const canCreateUsers = isAdmin;
  const canEditUsers = isAdmin;
  const canDeleteUsers = isAdmin;
  const canChangeRoles = isAdmin;

  // Permisos de productos
  const canViewProducts = isAdmin || isUsuario || isInvitado; // Todos pueden ver
  const canCreateProducts = isAdmin || isUsuario; // ADMIN y USUARIO pueden crear
  const canEditProducts = isAdmin || isUsuario; // ADMIN y USUARIO pueden editar
  const canDeleteProducts = isAdmin; // Solo ADMIN puede eliminar

  // Permisos de inventario
  const canViewInventory = isAdmin || isUsuario || isInvitado; // Todos pueden ver
  const canCreateInventory = isAdmin || isUsuario; // ADMIN y USUARIO pueden crear
  const canUpdateInventory = isAdmin || isUsuario; // ADMIN y USUARIO pueden actualizar
  const canDeleteInventory = isAdmin; // Solo ADMIN puede eliminar

  // Permisos de proveedores
  const canViewSuppliers = isAdmin || isUsuario || isInvitado; // Todos pueden ver
  const canCreateSuppliers = isAdmin || isUsuario; // ADMIN y USUARIO pueden crear
  const canEditSuppliers = isAdmin || isUsuario; // ADMIN y USUARIO pueden editar
  const canDeleteSuppliers = isAdmin; // Solo ADMIN puede eliminar

  // Permisos de reportes
  const canViewReports = isAdmin || isUsuario; // ADMIN y USUARIO pueden ver reportes

  // Chatbot
  const canUseChat = isAdmin || isUsuario || isInvitado; // Todos pueden usar el chat

  return {
    // Roles
    isAdmin,
    isUsuario,
    isInvitado,

    // Permisos de usuarios
    canManageUsers,
    canViewUsers,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    canChangeRoles,

    // Permisos de productos
    canViewProducts,
    canCreateProducts,
    canEditProducts,
    canDeleteProducts,

    // Permisos de inventario
    canViewInventory,
    canCreateInventory,
    canUpdateInventory,
    canDeleteInventory,

    // Permisos de proveedores
    canViewSuppliers,
    canCreateSuppliers,
    canEditSuppliers,
    canDeleteSuppliers,

    // Permisos de reportes
    canViewReports,

    // Chatbot
    canUseChat,
  };
};
