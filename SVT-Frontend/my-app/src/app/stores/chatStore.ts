// stores/chatStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'error' | 'system'
}

export interface QuickAction {
  action: string
  description: string
  example_query: string
  icon: string
}

interface ChatState {
  // Estado
  messages: Message[]
  isLoading: boolean
  isConnected: boolean
  conversationId: string | null
  quickActions: QuickAction[]
  isInitialized: boolean
  unreadCount: number
  
  // Acciones básicas
  setMessages: (messages: Message[]) => void
  addMessage: (content: string, sender: 'user' | 'bot', type?: 'text' | 'error' | 'system') => Message
  clearChat: () => void
  setLoading: (loading: boolean) => void
  setConnected: (connected: boolean) => void
  setConversationId: (id: string | null) => void
  setQuickActions: (actions: QuickAction[]) => void
  markAsRead: () => void
  
  // Estado de inicialización
  setInitialized: (initialized: boolean) => void
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        // Estado inicial
        messages: [],
        isLoading: false,
        isConnected: true,
        conversationId: null,
        quickActions: [],
        isInitialized: false,
        unreadCount: 0,
        
        // Establecer mensajes
        setMessages: (messages) => set({ messages }),
        
        // Agregar mensaje
        addMessage: (content, sender, type = 'text') => {
          const message: Message = {
            id: `${sender}-${Date.now()}-${Math.random()}`,
            content,
            sender,
            timestamp: new Date(),
            type
          }
          
          set((state) => ({
            messages: [...state.messages, message],
            // Incrementar contador solo si es mensaje del bot y no es del sistema
            unreadCount: sender === 'bot' && type !== 'system' 
              ? state.unreadCount + 1 
              : state.unreadCount
          }))
          
          return message
        },
        
        // Limpiar chat
        clearChat: () => set({ 
          messages: [], 
          conversationId: null,
          isInitialized: false,
          unreadCount: 0
        }),
        
        // Estados
        setLoading: (loading) => set({ isLoading: loading }),
        setConnected: (connected) => set({ isConnected: connected }),
        setConversationId: (id) => set({ conversationId: id }),
        setQuickActions: (actions) => set({ quickActions: actions }),
        setInitialized: (initialized) => set({ isInitialized: initialized }),
        
        // Marcar como leídos
        markAsRead: () => set({ unreadCount: 0 })
      }),
      {
        name: 'svt-chat-storage',
        partialize: (state) => ({
          messages: state.messages.slice(-50), // Solo guardar últimos 50 mensajes
          conversationId: state.conversationId
        })
      }
    ),
    {
      name: 'chat-store'
    }
  )
)