import { useState, useEffect, useMemo } from 'react';

export function useInventarioPagination(items, itemsPorPagina = 10) {
  const [pagina, setPagina] = useState(1);

  // Resetear página cuando cambie el número de items
  useEffect(() => {
    setPagina(1);
  }, [items.length]);

  const totalPaginas = Math.ceil(items.length / itemsPorPagina);

  const itemsPagina = useMemo(() => {
    const inicio = (pagina - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return items.slice(inicio, fin);
  }, [items, pagina, itemsPorPagina]);

  // Asegurar que la página actual sea válida
  useEffect(() => {
    if (pagina > totalPaginas && totalPaginas > 0) {
      setPagina(totalPaginas);
    }
  }, [pagina, totalPaginas]);

  return {
    pagina,
    setPagina,
    productosPagina: itemsPagina,
    totalPaginas,
    productosPorPagina: itemsPorPagina
  };
}
