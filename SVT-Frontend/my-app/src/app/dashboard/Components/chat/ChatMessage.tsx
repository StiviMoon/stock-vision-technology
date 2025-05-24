// components/chat/ChatMessage.tsx - DISEÑO MODERNO
import { Message } from '@/src/app/stores/chatStore'
import { Bot, User } from 'lucide-react'
import { formatText } from '@/src/utils/formatText'

interface ChatMessageProps {
  message: Message
}export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.sender === 'user';
  const isError = message.type === 'error';
  const isSystem = message.type === 'system';

  // Aseguramos que timestamp sea Date
  const date = message.timestamp instanceof Date 
    ? message.timestamp 
    : new Date(message.timestamp);

  return (
    <div className={`flex w-full group ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[85%] flex items-end gap-2 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}>
        {/* Avatar minimalista */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          isUser 
            ? 'bg-primary text-primary-foreground shadow-sm' 
            : 'bg-muted/80 text-muted-foreground group-hover:bg-muted'
        }`}>
          {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
        </div>
        
        {/* Mensaje */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className={`px-3.5 py-2.5 rounded-2xl break-words transition-all duration-200 relative ${
            isUser
              ? 'bg-primary text-primary-foreground shadow-sm hover:shadow-md rounded-br-md'
              : isError
              ? 'bg-red-50 border border-red-200 text-red-700 rounded-bl-md dark:bg-red-950/20 dark:border-red-800/30 dark:text-red-400'
              : isSystem
              ? 'bg-blue-50 border border-blue-200 text-blue-800 rounded-bl-md dark:bg-blue-950/20 dark:border-blue-800/30 dark:text-blue-300'
              : 'bg-card border border-border/60 text-card-foreground rounded-bl-md hover:border-border shadow-sm hover:shadow-md'
          }`}>
            <div className="text-sm leading-relaxed overflow-hidden">
              {formatText(message.content)}
            </div>
            
            {/* Timestamp integrado */}
            <div className={`text-xs mt-1.5 opacity-60 ${
              isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
            }`}>
              {date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
