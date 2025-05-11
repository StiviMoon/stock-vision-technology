// 4. UsersSearch.jsx
// Componente para la búsqueda en tiempo real

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface UsersSearchProps {
  searchQuery: string;
  isSearching: boolean;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
}

export function UsersSearch({ 
  searchQuery, 
  isSearching, 
  onSearchChange, 
  onClearSearch 
}: UsersSearchProps) {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2 mb-6">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar usuario..."
          className="pl-10 w-full"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {isSearching && searchQuery && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Badge variant="secondary" className="px-2 py-1 text-xs">
              Buscando...
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}