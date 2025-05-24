// components/chat/LoadingIndicator.tsx - DISEÑO MODERNO
import { Bot } from 'lucide-react'

export const LoadingIndicator = () => {
  return (
    <div className="flex justify-start w-full mb-3 group">
      <div className="flex items-end gap-2 max-w-[85%]">
        <div className="w-7 h-7 rounded-full bg-muted/80 text-muted-foreground flex items-center justify-center flex-shrink-0">
          <Bot className="h-3.5 w-3.5" />
        </div>
        <div className="bg-card border border-border/60 px-3.5 py-2.5 rounded-2xl rounded-bl-md shadow-sm">
          <div className="flex items-center gap-2">
            {/* Animación de puntos moderna */}
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200" />
            </div>
            <span className="text-sm text-muted-foreground">Escribiendo...</span>
          </div>
        </div>
      </div>
    </div>
  )
}