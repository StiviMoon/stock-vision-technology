'use client';

import { useState, useEffect } from 'react';
import Nav from '../../components/nav/NavBard';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Función para decodificar un token JWT
  const decodeJWT = (token) => {
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
              const usersResponse = await axios.get(`${API_URL}/users`, {
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
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [router, API_URL]);

  // Animación para el contenido
  const contentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: 'spring', 
        stiffness: 200, 
        damping: 20,
        delay: 0.2
      } 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      {/* Navegación lateral */}
      <Nav user={user} />
      
      {/* Contenido principal */}
      <motion.div 
        className="flex-1 overflow-y-auto"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
      >
        {children}
      </motion.div>
    </div>
  );
}