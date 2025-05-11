
// 2. UsersHeader.jsx
// Este componente contiene el título y las acciones principales

import { 
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UsersHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  loading: boolean;
}

export function UsersHeader({ onRefresh, isRefreshing, loading }: UsersHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Usuarios</h1>
        <p className="text-muted-foreground">Administra los usuarios registrados en el sistema.</p>
      </div>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onRefresh}
                disabled={loading || isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refrescar usuarios</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}