// hooks/useInventarioFilters.js
import { useState } from 'react';

export function useInventarioFilters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodega, setSelectedBodega] = useState('todas');
  const [selectedCategoria, setSelectedCategoria] = useState('todas');
  const [selectedEstado, setSelectedEstado] = useState('todos');

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedBodega('todas');
    setSelectedCategoria('todas');
    setSelectedEstado('todos');
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedBodega,
    setSelectedBodega,
    selectedCategoria,
    setSelectedCategoria,
    selectedEstado,
    setSelectedEstado,
    resetFilters
  };
}