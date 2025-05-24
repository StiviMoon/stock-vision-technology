'use client';
import { useState, useEffect, ReactNode } from 'react';
import Nav from '../../components/nav/NavBar';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ThemeProvider } from './Theme/ThemeContext';
import ThemeToggle from './Theme/ThemeToggle';
import ChatWidget from './Components/ChatWidget';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  email: string;
  rol?: string;
  [key: string]: any;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [chatEnabled, setChatEnabled] = useState<boolean>(true);
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

  // Manejar errores del chat
  const handleChatError = (error: string) => {
    console.error('Chat Error:', error);
    
    if (typeof toast !== 'undefined') {
      toast.error(`Asistente IA: ${error}`);
    } else {
      console.warn('Chat Widget Error:', error);
    }
    
    if (error.includes('Sesión expirada')) {
      setChatEnabled(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data);
        setChatEnabled(true);
      } catch (error) {
        console.error('Error al obtener datos del usuario desde API:', error);
        
        try {
          const decoded = decodeJWT(token);
          if (decoded && decoded.sub) {
            setUser({
              email: decoded.sub,
              rol: decoded.rol || 'Usuario'
            });
            setChatEnabled(true);
            
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
            setChatEnabled(false);
            router.push('/login');
          }
        } catch (decodeError) {
          console.error('Error al decodificar token:', decodeError);
          localStorage.removeItem('token');
          setChatEnabled(false);
          router.push('/login');
        }
      } finally {
        setTimeout(() => {
          setLoading(false);
          setTimeout(() => setShowContent(true), 50);
        }, 500);
      }
    };
    
    fetchUserData();
  }, [router, API_URL]);

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
        {loading ? (
          <div 
            className="min-h-screen w-full flex flex-col items-center justify-center bg-background transition-opacity duration-300 ease-in-out opacity-100"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-2xl">
                SVT
              </div>
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <div className="text-muted-foreground mt-2">Cargando sistema...</div>
            </div>
          </div>
        ) : (
          <div 
            className={`flex w-full transition-opacity duration-300 ease-in-out ${loading ? 'opacity-0' : 'opacity-100'}`}
          >
            {/* Navegación lateral */}
            <Nav user={user} />
            
            {/* Contenido principal */}
            <div 
              className={`flex-1 overflow-y-auto relative transition-all duration-500 ease-out transform ${showContent ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3'} pt-16 md:pt-0`}
            >
              {/* Contenedor para el contenido de las páginas */}
              <div className="min-h-full">
                {children}
              </div>
            </div>
          </div>
        )}
        
        {/* Chat Widget - Solo se muestra cuando el usuario está autenticado y no está cargando */}
        {!loading && chatEnabled && user && (
          <div className="fixed bottom-6 right-6 flex flex-col gap-4 items-end z-[9999]">
           
          {/* Chat Widget - abajo */}
          {chatEnabled && user && (
            <div className="transition-all duration-500">
              <ChatWidget
                apiBaseUrl={API_URL}
                title="Asistente IA SVT"
                user={user}
                position="static" // Cambiamos a static ya que el contenedor padre maneja la posición
                onError={handleChatError}
              />
            </div>
          )}
        </div>
        )}
      </div>
    </ThemeProvider>
  );
}