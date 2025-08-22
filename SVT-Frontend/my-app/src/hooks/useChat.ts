// hooks/useChat.ts
import { useCallback, useRef, useEffect } from 'react';
import { useChatStore } from '@/src/app/stores/chatStore';

export interface UseChatProps {
  apiBaseUrl?: string;
  user?: { email?: string; rol?: string } | null;
  onError?: (error: string) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export const useChat = ({
  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  user = null,
  onError,
  onConnectionChange,
}: UseChatProps = {}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Obtener estado y acciones del store
  const {
    messages,
    isLoading,
    isConnected,
    conversationId,
    quickActions,
    isInitialized,
    unreadCount,
    addMessage,
    setLoading,
    setConnected,
    setConversationId,
    setQuickActions,
    setInitialized,
    clearChat,
    markAsRead,
  } = useChatStore();

  // Auto scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Función para hacer peticiones autenticadas
  const makeAuthenticatedRequest = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      return fetch(url, {
        ...options,
        headers,
      });
    },
    []
  );

  // Cargar acciones rápidas
  const fetchQuickActions = useCallback(async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${apiBaseUrl}/chatbot/quick-actions`
      );

      if (response.ok) {
        const data = await response.json();
        setQuickActions(data.quick_actions || []);
        setConnected(true);
        onConnectionChange?.(true);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching quick actions:', error);
      setConnected(false);
      onConnectionChange?.(false);
      onError?.('Error conectando con el servidor');
    }
  }, [
    apiBaseUrl,
    makeAuthenticatedRequest,
    setQuickActions,
    setConnected,
    onConnectionChange,
    onError,
  ]);

  // Enviar mensaje
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return false;

      // Agregar mensaje del usuario
      addMessage(content, 'user');

      // Activar loading
      setLoading(true);

      try {
        const response = await makeAuthenticatedRequest(
          `${apiBaseUrl}/chatbot/chat`,
          {
            method: 'POST',
            body: JSON.stringify({
              message: content,
              conversation_id: conversationId,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();

          // Agregar respuesta del bot
          addMessage(data.response, 'bot');

          // Actualizar conversation ID
          setConversationId(data.conversation_id);
          setConnected(true);
          onConnectionChange?.(true);

          return true;
        } else if (response.status === 401) {
          addMessage(
            '🔒 Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
            'bot',
            'error'
          );
          setConnected(false);
          onConnectionChange?.(false);
          onError?.('Sesión expirada');
          return false;
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        addMessage(
          'Error de conexión. Verifica que el servidor esté funcionando.',
          'bot',
          'error'
        );
        setConnected(false);
        onConnectionChange?.(false);
        onError?.('Error de conexión');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      apiBaseUrl,
      conversationId,
      makeAuthenticatedRequest,
      addMessage,
      setLoading,
      setConversationId,
      setConnected,
      onConnectionChange,
      onError,
    ]
  );

  // Inicializar chat (con prevención de duplicados)
  const initializeChat = useCallback(() => {
    if (isInitialized) return;

    const welcomeShown = localStorage.getItem('svt-welcome-shown');
    if (!welcomeShown) {
      const userName = user?.email ? user.email.split('@')[0] : 'Usuario';
      const welcomeMessage = `¡Hola ${userName}! 👋

  Soy tu asistente inteligente para el Sistema SVT.

  Puedo ayudarte con:
   Consultas de productos y stock
   Estadísticas del inventario
   Información de proveedores
   Análisis y reportes

  ¿Qué necesitas saber?`;
      addMessage(welcomeMessage, 'bot', 'system');
      localStorage.setItem('svt-welcome-shown', 'true');
    }

    fetchQuickActions();
    setInitialized(true);
  }, [user, isInitialized, addMessage, fetchQuickActions, setInitialized]);

  // Obtener analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${apiBaseUrl}/chatbot/analytics`
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      onError?.('Error obteniendo analytics');
      return null;
    }
  }, [apiBaseUrl, makeAuthenticatedRequest, onError]);

  // Notificar cambios de conexión
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(isConnected);
    }
  }, [isConnected, onConnectionChange]);

  return {
    // Estado
    messages,
    isLoading,
    isConnected,
    quickActions,
    conversationId,
    unreadCount,

    // Referencias
    messagesEndRef,

    // Acciones
    sendMessage,
    clearChat,
    initializeChat,
    fetchQuickActions,
    fetchAnalytics,
    addMessage,
    markAsRead,
  };
};
