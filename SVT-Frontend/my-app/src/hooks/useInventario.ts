import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventarioService } from '@/src/services/inventarioService';
import {
  Bodega,
  BodegaCreate,
  BodegaUpdate,
  StockBodega,
  StockConsolidado,
  AlertaStock,
  MovimientoInventario,
  MovimientoInventarioCreate,
  AjusteInventarioCreate,
  TransferenciaInventarioCreate,
  InventarioFisicoCreate,
  KardexResponse,
  InventarioFilterOptions,
} from '@/src/services/interfaces';

// Claves para React Query
export const inventarioKeys = {
  all: ['inventario'] as const,
  bodegas: () => [...inventarioKeys.all, 'bodegas'] as const,
  bodega: (id: number) => [...inventarioKeys.bodegas(), id] as const,
  stock: () => [...inventarioKeys.all, 'stock'] as const,
  stockProducto: (id: number) =>
    [...inventarioKeys.stock(), 'producto', id] as const,
  stockBodega: (id: number) =>
    [...inventarioKeys.stock(), 'bodega', id] as const,
  alertas: () => [...inventarioKeys.all, 'alertas'] as const,
  movimientos: () => [...inventarioKeys.all, 'movimientos'] as const,
  movimientosList: (filters: any) =>
    [...inventarioKeys.movimientos(), 'list', filters] as const,
  kardex: (id: number) => [...inventarioKeys.all, 'kardex', id] as const,
};

// ---- HOOKS PARA BODEGAS ----

export const useBodegas = (soloActivas: boolean = true) => {
  return useQuery({
    queryKey: [...inventarioKeys.bodegas(), { soloActivas }],
    queryFn: () => inventarioService.getBodegas(soloActivas),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useBodega = (bodegaId: number) => {
  return useQuery({
    queryKey: inventarioKeys.bodega(bodegaId),
    queryFn: () => inventarioService.getBodega(bodegaId),
    enabled: !!bodegaId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateBodega = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bodegaData: BodegaCreate) =>
      inventarioService.createBodega(bodegaData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventarioKeys.bodegas() });
    },
    onError: error => {
      console.error('Error al crear bodega:', error);
    },
  });
};

export const useUpdateBodega = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BodegaUpdate }) =>
      inventarioService.updateBodega(id, data),
    onSuccess: (updatedBodega, { id }) => {
      queryClient.setQueryData(inventarioKeys.bodega(id), updatedBodega);
      queryClient.invalidateQueries({ queryKey: inventarioKeys.bodegas() });
    },
    onError: error => {
      console.error('Error al actualizar bodega:', error);
    },
  });
};

// ---- HOOKS PARA STOCK ----

export const useStockProducto = (productoId: number) => {
  return useQuery({
    queryKey: inventarioKeys.stockProducto(productoId),
    queryFn: () => inventarioService.getStockProducto(productoId),
    enabled: !!productoId,
    staleTime: 2 * 60 * 1000, // 2 minutos para stock
    gcTime: 5 * 60 * 1000,
  });
};

export const useStockBodega = (bodegaId: number) => {
  return useQuery({
    queryKey: inventarioKeys.stockBodega(bodegaId),
    queryFn: () => inventarioService.getStockBodega(bodegaId),
    enabled: !!bodegaId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useAlertasStock = () => {
  return useQuery({
    queryKey: inventarioKeys.alertas(),
    queryFn: () => inventarioService.getAlertasStock(),
    staleTime: 1 * 60 * 1000, // 1 minuto para alertas
    gcTime: 5 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000, // Refrescar cada 2 minutos
  });
};

// ---- HOOKS PARA MOVIMIENTOS ----

export const useMovimientos = (filtros: any = {}) => {
  return useQuery({
    queryKey: inventarioKeys.movimientosList(filtros),
    queryFn: () => inventarioService.getMovimientos(filtros),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useMovimientosPaginated = (
  page: number = 1,
  size: number = 20,
  filtros: any = {}
) => {
  return useQuery({
    queryKey: [
      ...inventarioKeys.movimientosList(filtros),
      'page',
      page,
      'size',
      size,
    ],
    queryFn: () =>
      inventarioService.getMovimientosPaginated(page, size, filtros),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useCreateMovimiento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (movimientoData: MovimientoInventarioCreate) =>
      inventarioService.createMovimiento(movimientoData),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: inventarioKeys.movimientos() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.stock() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.alertas() });

      // Invalidar productos que podrían haber cambiado
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
    onError: error => {
      console.error('Error al crear movimiento:', error);
    },
  });
};

export const useAjustarInventario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ajusteData: AjusteInventarioCreate) =>
      inventarioService.ajustarInventario(ajusteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventarioKeys.movimientos() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.stock() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.alertas() });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
    onError: error => {
      console.error('Error al ajustar inventario:', error);
    },
  });
};

export const useTransferirEntreBodegas = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transferenciaData: TransferenciaInventarioCreate) =>
      inventarioService.transferirEntreBodegas(transferenciaData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventarioKeys.movimientos() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.stock() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.bodegas() });
    },
    onError: error => {
      console.error('Error al transferir entre bodegas:', error);
    },
  });
};

export const useInventarioFisico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inventarioData: InventarioFisicoCreate) =>
      inventarioService.realizarInventarioFisico(inventarioData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventarioKeys.movimientos() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.stock() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.alertas() });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
    onError: error => {
      console.error('Error al realizar inventario físico:', error);
    },
  });
};

// ---- HOOKS PARA REPORTES ----

export const useKardex = (
  productoId: number,
  fechaInicio?: string,
  fechaFin?: string,
  bodegaId?: number
) => {
  return useQuery({
    queryKey: [
      ...inventarioKeys.kardex(productoId),
      { fechaInicio, fechaFin, bodegaId },
    ],
    queryFn: () =>
      inventarioService.getKardex(productoId, fechaInicio, fechaFin, bodegaId),
    enabled: !!productoId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
