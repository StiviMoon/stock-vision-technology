"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, Send, Sparkles, ArrowDown, Plus } from "lucide-react";
import { useChat } from "@/src/hooks/useChat";
import { ChatMessage } from "../Components/chat/ChatMessage";
import { LoadingIndicator } from "../Components/chat/LoadingIndicator";
import { useChatStore } from "@/src/app/stores/chatStore";

// Definir tipo Message si no está definido
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp?: Date;
}

interface ChatPageProps {
  apiBaseUrl?: string;
  user?: { email?: string; rol?: string } | null;
  onError?: (error: string) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({
  apiBaseUrl,
  user = null,
  onError,
}) => {
  const [showScrollButton, setShowScrollButton] = useState(false);

  const {
    messages,
    isLoading,
    isConnected,
    messagesEndRef,
    sendMessage,
    clearChat,
    initializeChat,
    markAsRead,
  } = useChat({
    apiBaseUrl,
    user,
    onError,
  });

  // Inicializar chat y marcar como leídos
  useEffect(() => {
    initializeChat(); // Seguro de llamar, el store previene duplicados
    markAsRead(); // Marcar todos los mensajes como leídos

    // Marcar como leídos cuando el componente recibe foco
    const handleFocus = () => markAsRead();
    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, [initializeChat, markAsRead]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesEndRef]);

  // Manejar scroll para mostrar botón
  const handleScroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Obtén las acciones rápidas del store
  const quickActions = useChatStore((state) => state.quickActions);

  return (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="h-full max-w-6xl mx-auto flex flex-col p-4">
        {/* Header minimalista */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-background ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Asistente IA
              </h1>
              <p className="text-xs text-muted-foreground">
                Sistema de inventario SVT
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 rotate-45" />
            Nueva conversación
          </Button>
        </div>

        {/* Área de mensajes con diseño mejorado */}
        <Card className="flex-1 bg-background/50 backdrop-blur-sm border-muted/50 rounded-2xl overflow-hidden relative">
          <ScrollArea className="h-full" onScroll={handleScroll}>
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Mensaje de bienvenida si no hay mensajes */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 animate-pulse">
                    <Sparkles className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">
                    ¡Hola! Soy tu asistente IA
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Estoy aquí para ayudarte con cualquier pregunta sobre el
                    sistema de inventario SVT. ¿En qué puedo ayudarte hoy?
                  </p>
                </div>
              )}

              {/* Mensajes con mejor distribución */}
              {messages.map((message) => (
                <div key={message.id} className="w-full">
                  <ChatMessage message={message} />
                </div>
              ))}

              {/* Indicador de carga mejorado */}
              {isLoading && (
                <div className="w-full">
                  <div className="flex justify-start mb-3">
                    <div className="max-w-[85%] flex items-end gap-2">
                      <div className="w-7 h-7 rounded-full bg-muted/80 flex items-center justify-center animate-pulse">
                        <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="bg-card border border-border/60 rounded-2xl rounded-bl-md px-3.5 py-2.5">
                        <LoadingIndicator />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-1" />
            </div>
          </ScrollArea>

          {/* Botón de scroll */}
          {showScrollButton && (
            <Button
              onClick={scrollToBottom}
              size="icon"
              className="absolute bottom-4 right-4 rounded-full shadow-lg"
              variant="secondary"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          )}
        </Card>

        {/* Input área con diseño moderno */}
        <div className="mt-4">
          <ChatInput
            onSendMessage={sendMessage}
            disabled={isLoading || !isConnected}
            placeholder={
              !isConnected ? "Sin conexión..." : "Escribe tu pregunta aquí..."
            }
          />

          {/* Acciones rápidas personalizadas desde backend */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {quickActions.map((action) => (
              <Button
                key={action.action}
                variant="outline"
                size="sm"
                className="rounded-full text-xs border-muted-foreground/20 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                onClick={() => sendMessage(action.example_query)}
              >
                {action.description}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Input Component mejorado
interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Escribe tu mensaje...",
}) => {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={`relative transition-all duration-200 ${
          isFocused ? "scale-[1.02]" : ""
        }`}
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-14 pl-5 py-6 rounded-2xl bg-background/80 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50 transition-all duration-200 text-base placeholder:text-muted-foreground/60"
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || !message.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl h-10 w-10 bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all duration-200"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Indicador de caracteres */}
      {message.length > 0 && (
        <div className="absolute -top-6 right-0 text-xs text-muted-foreground">
          {message.length} / 500
        </div>
      )}
    </form>
  );
};

export default ChatPage;
