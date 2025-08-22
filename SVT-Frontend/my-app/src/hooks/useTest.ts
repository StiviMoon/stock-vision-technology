import { useQuery } from '@tanstack/react-query';

// Hook de prueba para verificar que React Query esté funcionando
export const useTest = () => {
  return useQuery({
    queryKey: ['test'],
    queryFn: () => Promise.resolve('React Query está funcionando!'),
    staleTime: Infinity, // Nunca se vuelve obsoleto
    gcTime: Infinity, // Nunca se limpia del cache
  });
};
