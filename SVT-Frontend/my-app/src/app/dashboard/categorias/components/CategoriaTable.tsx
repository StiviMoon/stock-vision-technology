'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Package
} from 'lucide-react';
import { TableActions } from '@/src/components/dashboard/table-actions';
import { Categoria } from '@/src/services/interfaces';

interface CategoriaTableProps {
  categorias: Categoria[];
  onEdit: (categoria: Categoria) => void;
  onDelete: (categoria: Categoria) => void;
  onView: (categoria: Categoria) => void;
  onToggleStatus?: (categoria: Categoria) => void;
  loading?: boolean;
}

export const CategoriaTable: React.FC<CategoriaTableProps> = ({
  categorias,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  loading = false,
}) => {
  const [pagina, setPagina] = useState(1);
  const categoriasPorPagina = 10;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calcular categorías a mostrar en la página actual
  const totalPaginas = Math.ceil(categorias.length / categoriasPorPagina);
  const categoriasPagina = categorias.slice(
    (pagina - 1) * categoriasPorPagina,
    pagina * categoriasPorPagina
  );

  if (loading) {
    return (
      <div className="rounded-lg border overflow-hidden bg-background shadow">
        <div className="space-y-4 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="border rounded-lg p-8 flex flex-col items-center justify-center bg-background shadow">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <div className="text-xl font-semibold text-center mb-2">No hay categorías registradas</div>
        <p className="text-muted-foreground text-center">
          ¡Agrega tu primera categoría utilizando el botón Nueva Categoría!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden bg-background shadow">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Creación</TableHead>
            <TableHead className="w-[120px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categoriasPagina.map((categoria) => (
            <TableRow key={categoria.id} className="hover:bg-muted/40 transition">
              <TableCell className="font-medium">{categoria.id}</TableCell>
              <TableCell className="font-medium">
                {categoria.nombre}
              </TableCell>
              <TableCell>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {categoria.codigo}
                </code>
              </TableCell>
              <TableCell className="max-w-[200px] truncate" title={categoria.descripcion || ""}>
                {categoria.descripcion || "-"}
              </TableCell>
              <TableCell>
                <Badge variant={categoria.activa ? 'default' : 'secondary'}>
                  {categoria.activa ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activa
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactiva
                    </>
                  )}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {formatDate(categoria.fecha_creacion)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <TableActions
                  onEdit={() => onEdit(categoria)}
                  onDelete={() => onDelete(categoria)}
                  onView={() => onView(categoria)}
                  onToggleStatus={() => onToggleStatus?.(categoria)}
                  isActive={categoria.activa}
                  canToggleStatus={!!onToggleStatus}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-end items-center gap-2 p-4">
          <Button
            variant="ghost"
            size="icon"
            disabled={pagina === 1}
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Página {pagina} de {totalPaginas}
          </span>
          <Button
            variant="ghost"
            size="icon"
            disabled={pagina === totalPaginas}
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
