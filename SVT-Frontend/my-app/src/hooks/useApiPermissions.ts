'use client';

import { useAuthContext } from '@/src/context/AuthContext';
import { usePermissions } from './usePermissions';

export const useApiPermissions = () => {
  const { user } = useAuthContext();
  const permissions = usePermissions();

  // Función para verificar si el usuario puede hacer una petición específica
  const canMakeRequest = (endpoint: string, method: string): boolean => {
    if (!user) return false;

    // Mapeo de endpoints a permisos
    const endpointPermissions: Record<string, Record<string, string>> = {
      '/users': {
        'GET': 'canViewUsers',
        'POST': 'canCreateUsers',
        'PUT': 'canEditUsers',
        'DELETE': 'canDeleteUsers'
      },
      '/productos': {
        'GET': 'canViewProducts',
        'POST': 'canCreateProducts',
        'PUT': 'canEditProducts',
        'DELETE': 'canDeleteProducts'
      },
      '/inventario': {
        'GET': 'canViewInventory',
        'POST': 'canCreateInventory',
        'PUT': 'canUpdateInventory',
        'DELETE': 'canDeleteInventory'
      },
      '/proveedores': {
        'GET': 'canViewSuppliers',
        'POST': 'canCreateSuppliers',
        'PUT': 'canEditSuppliers',
        'DELETE': 'canDeleteSuppliers'
      },
      '/reportes': {
        'GET': 'canViewReports'
      },
      '/chatbot': {
        'POST': 'canUseChat'
      }
    };

    const requiredPermission = endpointPermissions[endpoint]?.[method];
    if (!requiredPermission) return true; // Si no hay restricción específica, permitir

    return (permissions as any)[requiredPermission] || false;
  };

  // Función para obtener headers de autorización
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Función para hacer peticiones con verificación de permisos
  const makeAuthenticatedRequest = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const method = options.method || 'GET';
    const endpoint = new URL(url).pathname;

    // Verificar permisos antes de hacer la petición
    if (!canMakeRequest(endpoint, method)) {
      throw new Error(`No tienes permisos para ${method} ${endpoint}`);
    }

    // Agregar headers de autorización
    const headers = {
      ...getAuthHeaders(),
      ...options.headers
    };

    return fetch(url, {
      ...options,
      headers
    });
  };

  return {
    canMakeRequest,
    getAuthHeaders,
    makeAuthenticatedRequest,
    user,
    permissions
  };
};
