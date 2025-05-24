// components/chat/ChatInput.tsx - DISEÑO MODERNO
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export const ChatInput = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Escribe tu pregunta...",
  className = ''
}: ChatInputProps) => {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={`p-4 bg-background/50 backdrop-blur-sm ${className}`}>
      <div className={`relative flex items-center gap-2 p-1 rounded-2xl border transition-all duration-200 ${
        isFocused 
          ? 'border-primary/50 shadow-sm bg-background' 
          : 'border-border/60 bg-muted/30 hover:bg-muted/50'
      }`}>
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 text-sm px-4 py-2.5"
          />
        </div>
        
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="sm"
          className={`h-9 w-9 rounded-xl transition-all duration-200 ${
            message.trim() && !disabled
              ? 'bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md scale-100 hover:scale-105'
              : 'bg-muted text-muted-foreground scale-95 opacity-50'
          }`}
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
