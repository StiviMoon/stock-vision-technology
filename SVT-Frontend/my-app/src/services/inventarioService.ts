import apiClient, {
  createQueryParams,
  handlePaginatedResponse,
} from '@/src/lib/apiClient';
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
} from './interfaces';

// Constantes para endpoints
const INVENTARIO_ENDPOINTS = {
  BODEGAS: '/inventario/bodegas',
  BODEGA_BY_ID: (id: number) => `/inventario/bodegas/${id}`,
  STOCK_PRODUCTO: (id: number) => `/inventario/stock/producto/${id}`,
  STOCK_BODEGA: (id: number) => `/inventario/stock/bodega/${id}`,
  ALERTAS: '/inventario/stock/alertas',
  MOVIMIENTOS: '/inventario/movimientos',
  AJUSTE: '/inventario/ajuste',
  TRANSFERENCIA: '/inventario/transferencia',
  INVENTARIO_FISICO: '/inventario/inventario-fisico',
  KARDEX: (id: number) => `/inventario/kardex/${id}`,
} as const;

// Servicio de inventario
export const inventarioService = {
  // ---- BODEGAS ----

  // Obtener todas las bodegas
  getBodegas: async (soloActivas: boolean = true): Promise<Bodega[]> => {
    try {
      const response = await apiClient.get<Bodega[]>(
        INVENTARIO_ENDPOINTS.BODEGAS,
        {
          params: {
            skip: 0,
            limit: 100,
            solo_activas: soloActivas,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener bodegas:', error);
      throw error;
    }
  },

  // Obtener una bodega por ID
  getBodega: async (bodegaId: number): Promise<Bodega> => {
    try {
      const response = await apiClient.get<Bodega>(
        INVENTARIO_ENDPOINTS.BODEGA_BY_ID(bodegaId)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear una nueva bodega
  createBodega: async (bodegaData: BodegaCreate): Promise<Bodega> => {
    try {
      const response = await apiClient.post<Bodega>(
        INVENTARIO_ENDPOINTS.BODEGAS,
        bodegaData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar una bodega
  updateBodega: async (
    bodegaId: number,
    bodegaData: BodegaUpdate
  ): Promise<Bodega> => {
    try {
      const response = await apiClient.put<Bodega>(
        INVENTARIO_ENDPOINTS.BODEGA_BY_ID(bodegaId),
        bodegaData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ---- STOCK ----

  // Obtener stock consolidado de un producto
  getStockProducto: async (productoId: number): Promise<StockConsolidado> => {
    try {
      const response = await apiClient.get<StockConsolidado>(
        INVENTARIO_ENDPOINTS.STOCK_PRODUCTO(productoId)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener stock de una bodega
  getStockBodega: async (bodegaId: number): Promise<StockBodega[]> => {
    try {
      const response = await apiClient.get<StockBodega[]>(
        INVENTARIO_ENDPOINTS.STOCK_BODEGA(bodegaId)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener alertas de stock bajo
  getAlertasStock: async (): Promise<AlertaStock[]> => {
    try {
      const response = await apiClient.get<AlertaStock[]>(
        INVENTARIO_ENDPOINTS.ALERTAS
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ---- MOVIMIENTOS ----

  // Crear movimiento genérico
  createMovimiento: async (
    movimientoData: MovimientoInventarioCreate
  ): Promise<MovimientoInventario> => {
    try {
      const response = await apiClient.post<MovimientoInventario>(
        INVENTARIO_ENDPOINTS.MOVIMIENTOS,
        movimientoData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Ajustar inventario
  ajustarInventario: async (
    ajusteData: AjusteInventarioCreate
  ): Promise<MovimientoInventario> => {
    try {
      const response = await apiClient.post<MovimientoInventario>(
        INVENTARIO_ENDPOINTS.AJUSTE,
        ajusteData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Transferir entre bodegas
  transferirEntreBodegas: async (
    transferenciaData: TransferenciaInventarioCreate
  ): Promise<any> => {
    try {
      const response = await apiClient.post(
        INVENTARIO_ENDPOINTS.TRANSFERENCIA,
        transferenciaData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Realizar inventario físico
  realizarInventarioFisico: async (
    inventarioData: InventarioFisicoCreate
  ): Promise<MovimientoInventario[]> => {
    try {
      const response = await apiClient.post<MovimientoInventario[]>(
        INVENTARIO_ENDPOINTS.INVENTARIO_FISICO,
        inventarioData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ---- REPORTES ----

  // Obtener kardex de un producto
  getKardex: async (
    productoId: number,
    fechaInicio?: string,
    fechaFin?: string,
    bodegaId?: number
  ): Promise<KardexResponse> => {
    try {
      const params: any = {};
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;
      if (bodegaId) params.bodega_id = bodegaId;

      const response = await apiClient.get<KardexResponse>(
        INVENTARIO_ENDPOINTS.KARDEX(productoId),
        { params }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener movimientos con filtros y paginación
  getMovimientos: async (
    filtros: {
      skip?: number;
      limit?: number;
      producto_id?: number;
      bodega_id?: number;
      tipo_movimiento?: string;
      fecha_inicio?: string;
      fecha_fin?: string;
    } = {}
  ): Promise<MovimientoInventario[]> => {
    try {
      const response = await apiClient.get<MovimientoInventario[]>(
        INVENTARIO_ENDPOINTS.MOVIMIENTOS,
        {
          params: filtros,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener movimientos paginados
  getMovimientosPaginated: async (
    page: number = 1,
    size: number = 20,
    filtros: Omit<InventarioFilterOptions, 'bodega_id'> & {
      bodega_id?: number;
      tipo_movimiento?: string;
      fecha_inicio?: string;
      fecha_fin?: string;
    } = {}
  ) => {
    try {
      const params = { ...filtros, skip: (page - 1) * size, limit: size };
      const queryParams = createQueryParams(params);
      const url = `${INVENTARIO_ENDPOINTS.MOVIMIENTOS}?${queryParams}`;

      const response = await apiClient.get<MovimientoInventario[]>(url);
      return handlePaginatedResponse(response);
    } catch (error) {
      throw error;
    }
  },
};
