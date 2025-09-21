// Tipos específicos para la sección de categorías
export interface CategoriaFormData {
  nombre: string;
  codigo: string;
  descripcion: string;
  activa: boolean;
}

export interface CategoriaFilters {
  search: string;
  activa?: boolean;
}

export interface CategoriaStats {
  total: number;
  activas: number;
  inactivas: number;
}
