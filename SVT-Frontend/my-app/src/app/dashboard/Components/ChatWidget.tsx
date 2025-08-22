"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Sparkles,
  Trash2,
  Wifi,
  WifiOff,
  Bot,
  Minimize2,
  X,
  Maximize2,
} from "lucide-react";
import { useChat } from "@/src/hooks/useChat";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatMessage } from "./chat/ChatMessage";
import { QuickActions } from "./chat/QuickActions";
import { ChatInput } from "./chat/ChatInput";
import { LoadingIndicator } from "./chat/LoadingIndicator";

interface ChatWidgetProps {
  apiBaseUrl?: string;
  title?: string;
  user?: { email?: string; rol?: string } | null;
  className?: string;
  position?:
    | "bottom-right"
    | "bottom-left"
    | "top-right"
    | "top-left"
    | "static";
  onError?: (error: string) => void;
}

const ChatWidget = ({
  apiBaseUrl,
  title = "Asistente IA SVT",
  user = null,
  className = "",
  position = "bottom-right",
  onError,
}: ChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    messages,
    isLoading,
    isConnected,
    unreadCount,
    quickActions,
    messagesEndRef,
    sendMessage,
    clearChat,
    initializeChat,
    markAsRead,
  } = useChat({
    apiBaseUrl,
    user,
    onError,
    onConnectionChange: (connected) => {
      if (!connected) {
        onError?.("Conexión perdida con el servidor");
      }
    },
  });

  // Posicionamiento dinámico
  const getPositionClasses = useCallback(() => {
    if (position === "static") return "";

    const positions = {
      "bottom-right": "bottom-20 right-6",
      "bottom-left": "bottom-20 left-6",
      "top-right": "top-6 right-6",
      "top-left": "top-6 left-6",
    };
    return positions[position];
  }, [position]);

  // Manejar apertura del chat
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    initializeChat(); // Ya no necesita verificar si hay mensajes, el store lo maneja
    markAsRead(); // Marcar mensajes como leídos
  }, [initializeChat, markAsRead]);

  // Manejar envío de mensaje
  const handleSendMessage = useCallback(
    async (message: string) => {
      await sendMessage(message);
    },
    [sendMessage]
  );

  // Manejar acción rápida
  const handleQuickAction = useCallback(
    (query: string) => {
      handleSendMessage(query);
    },
    [handleSendMessage]
  );

  // Manejar limpiar chat
  const handleClearChat = useCallback(() => {
    clearChat();
    setTimeout(() => {
      initializeChat();
    }, 100);
  }, [clearChat, initializeChat]);

  // Auto scroll mejorado
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, messagesEndRef]);

  // Botón flotante circular
  if (!isOpen && !isMinimized) {
    return (
      <div
        className={`${
          position === "static" ? "" : "fixed"
        } ${getPositionClasses()} z-[9998] ${className}`}
      >
        <div className="relative">
          <button
            onClick={handleOpen}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/90 hover:from-primary hover:to-primary/80 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 border-0 overflow-hidden cursor-pointer flex items-center justify-center"
            aria-label="Abrir asistente de chat"
            type="button"
          >
            {/* Efectos de fondo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

            {/* Icono del bot */}
            <Bot className="h-8 w-8 text-primary-foreground relative z-10 transition-transform duration-300" />
          </button>

          {/* Indicador de mensajes no leídos */}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -left-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center shadow-lg animate-bounce">
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}

          {/* Indicador de estado */}
          <div
            className={`absolute -top-1 -right-1 h-5 w-5 rounded-full border-2 border-background flex items-center justify-center shadow-lg transition-all duration-300 ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {isConnected ? (
              <Wifi className="h-2.5 w-2.5 text-white" />
            ) : (
              <WifiOff className="h-2.5 w-2.5 text-white" />
            )}
          </div>

          {/* Tooltip mejorado */}
          {isHovered && (
            <div className="absolute bottom-20 right-0 transform transition-all duration-300 pointer-events-none">
              <div className="bg-popover/95 backdrop-blur-xl border text-popover-foreground px-4 py-3 rounded-xl shadow-xl min-w-[200px]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isConnected ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      {isConnected ? "Conectado y listo" : "Sin conexión"}
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-popover/95 border-r border-b transform rotate-45" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Chat minimizado - Botón circular compacto
  if (isMinimized && !isOpen) {
    return (
      <div
        className={`${
          position === "static" ? "" : "fixed"
        } ${getPositionClasses()} z-[9998] ${className}`}
      >
        <div className="relative">
          {/* Botón circular minimizado */}
          <button
            onClick={() => {
              setIsMinimized(false);
              setIsOpen(true);
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/90 hover:from-primary hover:to-primary/80 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 border-0 overflow-hidden cursor-pointer flex items-center justify-center group"
            aria-label="Restaurar chat"
            type="button"
          >
            {/* Efectos de fondo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Icono del bot con animación */}
            <Bot className="h-8 w-8 text-primary-foreground relative z-10 transition-all duration-300 group-hover:scale-90" />

            {/* Indicador de mensajes */}
            {messages.length > 0 && (
              <div className="absolute -top-1 -left-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center shadow-lg">
                {messages.length > 9 ? "9+" : messages.length}
              </div>
            )}

            {/* Indicador de carga */}
            {isLoading && (
              <div className="absolute inset-0 rounded-full">
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
              </div>
            )}
          </button>

          {/* Indicador de estado */}
          <div
            className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background flex items-center justify-center shadow-lg transition-all duration-300 ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {isConnected ? (
              <Wifi className="h-2.5 w-2.5 text-white" />
            ) : (
              <WifiOff className="h-2.5 w-2.5 text-white" />
            )}
          </div>

          {/* Tooltip minimizado */}
          {isHovered && (
            <div className="absolute bottom-20 right-0 transform transition-all duration-300 pointer-events-none">
              <div className="bg-popover/95 backdrop-blur-xl border text-popover-foreground px-3 py-2 rounded-lg shadow-xl">
                <div className="text-xs font-medium">Chat minimizado</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {messages.length} mensaje{messages.length !== 1 ? "s" : ""}
                </div>
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-popover/95 border-r border-b transform rotate-45" />
              </div>
            </div>
          )}

          {/* Botón de cerrar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setIsMinimized(false);
            }}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-200 flex items-center justify-center shadow-md opacity-0 hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  // Chat expandido
  return (
    <div
      className={`${
        position === "static" ? "" : "fixed"
      } ${getPositionClasses()} z-[9998] ${className}`}
    >
      <Card
        className="w-96 h-[600px] shadow-2xl bg-background/95 backdrop-blur-xl border border-border/50 transition-all duration-500 ease-out overflow-hidden"
        style={{ borderRadius: "1.5rem" }}
      >
        {/* Header con diseño premium */}
        <div className="flex-shrink-0 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/90" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
          <div className="relative">
            <ChatHeader
              title={title}
              user={user}
              isMinimized={false}
              isLoading={isLoading}
              isConnected={isConnected}
              onToggleMinimize={() => {
                setIsMinimized(true);
                setIsOpen(false);
              }}
              onClose={() => {
                setIsOpen(false);
                setIsMinimized(false);
              }}
            />
          </div>
        </div>

        {/* Contenido del chat */}
        <div className="flex flex-col h-[536px] overflow-hidden">
          {/* Acciones rápidas */}
          <div className="flex-shrink-0">
            <QuickActions actions={quickActions} onAction={handleQuickAction} />
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 min-h-0 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />

            <ScrollArea className="h-full">
              <div className="p-4 space-y-0">
                <div className="min-h-full">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}

                  {isLoading && <LoadingIndicator />}

                  <div className="h-6" />
                  <div ref={messagesEndRef} className="h-1" />
                </div>
              </div>
            </ScrollArea>

            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent backdrop-blur-sm" />
            <div className="relative">
              <ChatInput
                onSendMessage={handleSendMessage}
                disabled={isLoading || !isConnected}
                placeholder={
                  isConnected ? "Escribe tu pregunta..." : "Sin conexión..."
                }
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-4 pb-4 bg-gradient-to-t from-background via-background/95 to-background/80 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="text-xs text-muted-foreground hover:text-destructive h-8 px-3 rounded-xl transition-all duration-200 hover:bg-destructive/10 hover:scale-105"
                disabled={messages.length === 0}
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Limpiar chat
              </Button>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-medium">
                    {messages.length} mensajes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      isConnected
                        ? "bg-green-500 shadow-sm shadow-green-500/50 animate-pulse"
                        : "bg-red-500 shadow-sm shadow-red-500/50"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      isConnected
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isConnected ? "En línea" : "Desconectado"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatWidget;
