'use client';
import { useState, useEffect, ReactNode } from 'react';
import NavBar from '../../components/nav/NavBar';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from './Theme/ThemeContext';
import ThemeToggle from './Theme/ThemeToggle';
import ChatWidget from './Components/ChatWidget';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '../../context/AuthContext';


interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [showContent, setShowContent] = useState<boolean>(false);
  const [chatEnabled, setChatEnabled] = useState<boolean>(true);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Usar el contexto de autenticación
  const { user, loading, logout } = useAuthContext();


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

  // Efecto para manejar la autenticación y mostrar contenido
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Si no hay usuario, redirigir al login
        router.push('/login');
        return;
      }

      // Si hay usuario, habilitar chat y mostrar contenido
      setChatEnabled(true);
      setTimeout(() => {
        setShowContent(true);
      }, 50);
    }
  }, [user, loading, router]);

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
            <NavBar />

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
            <div className="transition-all duration-500">
              <ChatWidget
                apiBaseUrl={API_URL}
                title="Asistente IA SVT"
                user={user}
                position="static" // Cambiamos a static ya que el contenedor padre maneja la posición
                onError={handleChatError}
              />
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
