// components/chat/ChatHeader.tsx - DISEÑO MODERNO
import { Button } from '@/components/ui/button'
import { Bot, X, Minimize2, Maximize2, Loader2 } from 'lucide-react'

interface ChatHeaderProps {
  title: string
  user?: { email?: string; rol?: string } | null
  isMinimized: boolean
  isLoading: boolean
  isConnected: boolean
  onToggleMinimize: () => void
  onClose: () => void
}

export const ChatHeader = ({
  title,
  user,
  isMinimized,
  isLoading,
  isConnected,
  onToggleMinimize,
  onClose
}: ChatHeaderProps) => {
  return (
    <div className="relative p-4 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground overflow-hidden">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center">
              <Bot className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            {isLoading && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-background rounded-full flex items-center justify-center">
                <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
              </div>
            )}
          </div>
          
          <div className="flex flex-col">
            <h3 className="font-semibold text-sm leading-tight">{title}</h3>
            {user && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-primary-foreground/80">{user.rol}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`} />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-primary-foreground/80 hover:text-primary-foreground hover:bg-red-500/20 rounded-lg transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}