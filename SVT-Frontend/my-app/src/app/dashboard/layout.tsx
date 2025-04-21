'use client';

import { useState, useEffect, ReactNode } from 'react';
import Nav from '../../components/nav/NavBar';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './Theme/ThemeContext';
import ThemeToggle from './Theme/ThemeToggle';
import { Loader2 } from 'lucide-react';

interface User {
  email: string;
  rol?: string;
  [key: string]: any; // For any additional properties
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Función para decodificar un token JWT
  const decodeJWT = (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Verificar autenticación y obtener datos del usuario
    const fetchUserData = async () => {
      try {
        // Primera opción: Intentar con /users/me
        const response = await axios.get(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error al obtener datos del usuario desde API:', error);
        
        // Segunda opción: Decodificar el token JWT
        try {
          const decoded = decodeJWT(token);
          if (decoded && decoded.sub) {
            setUser({
              email: decoded.sub,
              rol: decoded.rol || 'Usuario'
            });
            
            // Intentar obtener más información en segundo plano
            try {
              const usersResponse = await axios.get<User[]>(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (usersResponse.data && Array.isArray(usersResponse.data)) {
                const currentUser = usersResponse.data.find(u => u.email === decoded.sub);
                if (currentUser) {
                  setUser(currentUser);
                }
              }
            } catch (usersError) {
              console.error('No se pudo obtener información adicional:', usersError);
            }
          } else {
            localStorage.removeItem('token');
            router.push('/login');
          }
        } catch (decodeError) {
          console.error('Error al decodificar token:', decodeError);
          localStorage.removeItem('token');
          router.push('/login');
        }
      } finally {
        // Pequeño retraso para asegurar una transición suave
        setTimeout(() => setLoading(false), 500);
      }
    };
    
    fetchUserData();
  }, [router, API_URL]);

  // Animación para el contenido
  const contentVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: 'spring', 
        stiffness: 250, 
        damping: 25,
        delay: 0.1
      } 
    },
    exit: {
      opacity: 0,
      x: -10,
      transition: {
        duration: 0.2
      }
    }
  };

  // Animación para el loading
  const loadingVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300 pt-14 xl:p-0">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              className="min-h-screen w-full flex flex-col items-center justify-center bg-background"
              variants={loadingVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-2xl">
                  SVT
                </div>
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <div className="text-muted-foreground mt-2">Cargando sistema...</div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard"
              className="flex w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Navegación lateral */}
              <Nav user={user} />
              
              {/* Contenido principal */}
              <motion.div 
                className="flex-1 overflow-y-auto relative"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Botón de cambio de tema con posición mejorada y estilo */}
                <div className="fixed bottom-6 right-6 z-10">
                  <ThemeToggle />
                </div>
                
                {/* Contenedor para el contenido de las páginas */}
                <div className="min-h-screen pb-16">
                  {children}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
}