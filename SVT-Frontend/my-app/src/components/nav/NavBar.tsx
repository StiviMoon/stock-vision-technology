'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Home,
  Package,
  ShoppingCart,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  User,
  Bot,
  Sun,
  Moon,
  Monitor,
  Tag
} from 'lucide-react';
import ThemeToggle from '../../app/dashboard/Theme/ThemeToggle';
import { useAuthContext } from '@/src/context/AuthContext';
import { usePermissions } from '@/src/hooks/usePermissions';

interface NavItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  path: string;
  isActive: boolean;
  canView?: boolean;
}

const NavBar = () => {
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const {
    canViewUsers,
    canViewProducts,
    canViewInventory,
    canViewSuppliers,
    canViewReports,
    canUseChat
  } = usePermissions();

  // Debug: Mostrar permisos en consola (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('NavBar - User:', user?.rol);
    console.log('NavBar - Permissions:', {
      canViewUsers,
      canViewProducts,
      canViewInventory,
      canViewSuppliers,
      canViewReports,
      canUseChat
    });
  }
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePath, setActivePath] = useState('');

  useEffect(() => {
    const updateActivePath = () => {
      setActivePath(window.location.pathname);
    };

    updateActivePath();
    window.addEventListener('popstate', updateActivePath);
    return () => {
      window.removeEventListener('popstate', updateActivePath);
    };
  }, []);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <Home size={20} />,
      path: '/dashboard',
      isActive: activePath === '/dashboard',
      canView: true // Todos pueden ver el dashboard
    },
    {
      id: 'inventario',
      name: 'Inventario',
      icon: <Package size={20} />,
      path: '/dashboard/inventario',
      isActive: activePath.includes('/inventario'),
      canView: canViewInventory
    },
    {
      id: 'productos',
      name: 'Productos',
      icon: <ShoppingCart size={20} />,
      path: '/dashboard/productos',
      isActive: activePath.includes('/productos'),
      canView: canViewProducts
    },
    {
      id: 'categorias',
      name: 'Categorías',
      icon: <Tag size={20} />,
      path: '/dashboard/categorias',
      isActive: activePath.includes('/categorias'),
      canView: canViewProducts // Las categorías están relacionadas con productos
    },
    {
      id: 'bodegas',
      name: 'Bodegas',
      icon: <Package size={20} />,
      path: '/dashboard/bodegas',
      isActive: activePath.includes('/bodegas'),
      canView: canViewInventory // Las bodegas están relacionadas con inventario
    },
    {
      id: 'proveedores',
      name: 'Proveedores',
      icon: <Users size={20} />,
      path: '/dashboard/proveedores',
      isActive: activePath.includes('/proveedores'),
      canView: canViewSuppliers
    },
    {
      id: 'reportes',
      name: 'Reportes',
      icon: <BarChart2 size={20} />,
      path: '/dashboard/reportes',
      isActive: activePath.includes('/reportes'),
      canView: canViewReports
    },
    {
      id: 'usuarios',
      name: 'Usuarios',
      icon: <User size={20} />,
      path: '/dashboard/usuarios',
      isActive: activePath.includes('/usuarios'),
      canView: canViewUsers
    },
    {
      id: 'chatIA',
      name: 'Asistente IA',
      icon: <Bot size={20} />,
      path: '/dashboard/chat',
      isActive: activePath.includes('/chat'),
      canView: canUseChat
    },
    {
      id: 'test-permissions',
      name: 'Prueba Permisos',
      icon: <Settings size={20} />,
      path: '/dashboard/test-permissions',
      isActive: activePath.includes('/test-permissions'),
      canView: true // Todos pueden ver esta página de prueba
    },
    {
      id: 'configuracion',
      name: 'Configuración',
      icon: <Settings size={20} />,
      path: '/dashboard/configuracion',
      isActive: activePath.includes('/configuracion'),
      canView: true // Todos pueden ver configuración
    },
  ].filter(item => item.canView !== false);

  const handleLogout = () => {
    logout();
  };

  const navigateTo = (path: string) => {
    setActivePath(path);
    router.push(path);
    if (isMobile) setMobileMenuOpen(false);
  };

  // Función para obtener el nombre completo del usuario
  const getUserDisplayName = () => {
    if (user?.nombre && user?.apellido) {
      return `${user.nombre} ${user.apellido}`;
    } else if (user?.nombre) {
      return user.nombre;
    } else if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  // Función para obtener el rol en español
  const getRoleDisplayName = () => {
    switch (user?.rol) {
      case 'ADMIN':
        return 'Administrador';
      case 'USUARIO':
        return 'Usuario';
      case 'INVITADO':
        return 'Invitado';
      default:
        return 'Usuario';
    }
  };

  if (isMobile) {
    return (
      <>
        {/* Barra superior móvil */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-sidebar z-40 px-4 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center text-sidebar-primary-foreground font-bold">
              SVT
            </div>
            <span className="text-sidebar-foreground text-lg font-semibold ml-3">Dashboard</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-10 h-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Fondo oscuro con transición */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menú móvil con animación de slide */}
        <div
          className={`fixed top-0 left-0 z-50 h-screen w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-xl transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center text-sidebar-primary-foreground font-bold">
                SVT
              </div>
              <span className="text-lg font-semibold ml-3">Dashboard</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>

          <div className="py-6 px-4">
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => navigateTo(item.path)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl cursor-pointer ${
                      item.isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="ml-4 text-sm font-medium">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Theme Toggle en menú móvil */}
          <div className="px-4 py-3 border-t border-sidebar-border">
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-sidebar-accent">
              <div className="flex items-center">
                <Sun size={20} className="mr-3" />
                <span className="text-sm font-medium">Tema</span>
              </div>
              <ThemeToggle variant="navbar" size="sm" />
            </div>
          </div>

          <div className="mt-auto border-t border-sidebar-border p-4">
            <div className="flex items-center space-x-4 mb-5">
              <div className="relative">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                  <Image
                    src="/img/usuario.png"
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/api/placeholder/40/40";
                    }}
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-sidebar"></div>
              </div>

              <div className="flex flex-col justify-center">
                <span className="text-sm font-medium text-sidebar-foreground">
                  {getUserDisplayName()}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getRoleDisplayName()}
                </span>
                <span className="text-xs text-muted-foreground">{user?.email || 'usuario@svt.com'}</span>
              </div>
            </div>

            <button
              className="w-full flex items-center justify-center px-4 py-3 bg-sidebar-accent hover:bg-muted rounded-xl text-sm"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span className="ml-3">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Espacio para el contenido */}
        <div className="pt-16"></div>
      </>
    );
  }

  // Versión escritorio
  return (
    <div className="h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border overflow-hidden flex flex-col w-64">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center text-sidebar-primary-foreground font-bold">
              SVT
            </div>
            <span className="ml-3 text-lg font-semibold">Dashboard</span>
          </div>
          {/* Theme Toggle en el header */}
          <ThemeToggle variant="navbar" size="sm" />
        </div>
      </div>

      <div className="flex-grow py-6 px-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => navigateTo(item.path)}
                className={`w-full flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all ${
                  item.isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <div className="flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="ml-4 text-sm font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto border-t border-sidebar-border p-5">
        <div className="flex items-center space-x-4 mb-5">
          <div className="relative">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center overflow-hidden">
              <Image
                src="/img/usuario.png"
                alt="Avatar"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/api/placeholder/40/40";
                }}
              />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-sidebar"></div>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-sm font-medium text-sidebar-foreground">
              {getUserDisplayName()}
            </span>
            <span className="text-xs text-muted-foreground">
              {getRoleDisplayName()}
            </span>
            <span className="text-xs text-muted-foreground">{user?.email || 'usuario@svt.com'}</span>
          </div>
        </div>

        <button
          className="w-full flex items-center justify-center px-4 py-3 bg-sidebar-accent hover:bg-destructive/30 cursor-pointer rounded-xl text-sm"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span className="ml-3">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default NavBar;
