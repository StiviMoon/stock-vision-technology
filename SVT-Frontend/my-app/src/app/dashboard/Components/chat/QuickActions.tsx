
import { QuickAction } from '@/src/app/stores/chatStore'
import { 
  BarChart3,
  Package,
  AlertTriangle,
  Search,
  Building2,
  TrendingUp,
  Zap
} from 'lucide-react'

interface QuickActionsProps {
  actions: QuickAction[]
  onAction: (query: string) => void
  className?: string
}

const getIconForAction = (action: string) => {
  const iconMap = {
    'stock_bajo': AlertTriangle,
    'buscar_producto': Search,
    'estadisticas': BarChart3,
    'proveedores': Building2,
    'valor_inventario': TrendingUp,
    'productos_categoria': Package
  }
  return iconMap[action as keyof typeof iconMap] || Package
}

export const QuickActions = ({ actions, onAction, className = '' }: QuickActionsProps) => {
  if (!actions.length) return null

  return (
    <div className={`px-4 py-3 bg-gradient-to-r from-muted/30 to-muted/20 border-b border-border/40 flex-shrink-0 ${className}`}>
      {/* Header minimalista */}
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Acciones rápidas</span>
      </div>
      
      {/* Grid de acciones */}
      <div className="grid grid-cols-2 gap-2">
        {actions.slice(0, 4).map((action) => {
          const IconComponent = getIconForAction(action.action)
          return (
            <div
              key={action.action}
              className="group cursor-pointer p-2.5 rounded-xl bg-background/60 hover:bg-background border border-border/40 hover:border-primary/30 transition-all duration-200 hover:shadow-sm active:scale-95"
              onClick={() => onAction(action.example_query)}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg  flex items-center justify-center  transition-colors">
                  <IconComponent className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {action.description}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
