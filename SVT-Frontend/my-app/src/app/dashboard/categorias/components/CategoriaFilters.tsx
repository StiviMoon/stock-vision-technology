'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface CategoriaFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

export const CategoriaFilters: React.FC<CategoriaFiltersProps> = ({
  search,
  onSearchChange,
  onClearFilters,
  loading = false,
}) => {
  const hasFilters = search.trim() !== '';

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, código o descripción..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>
      </div>

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
};
