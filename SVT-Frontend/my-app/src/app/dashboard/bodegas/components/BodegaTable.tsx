'use client';

import React, { useState, useEffect } from 'react';
import { Bodega } from '@/src/services/interfaces';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  MapPin,
  Package,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Calendar,
  Building
} from 'lucide-react';
import { TableActions } from '@/src/components/dashboard/table-actions';

interface BodegaTableProps {
  bodegas: Bodega[];
  onEdit: (bodega: Bodega) => void;
  onDelete: (bodega: Bodega) => void;
  onView?: (bodega: Bodega) => void;
  onToggleStatus?: (bodega: Bodega) => void;
  loading?: boolean;
}

export const BodegaTable: React.FC<BodegaTableProps> = ({
  bodegas,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBodegas, setFilteredBodegas] = useState<Bodega[]>([]);
  const [pagina, setPagina] = useState(1);
  const bodegasPorPagina = 10;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filtrar bodegas por término de búsqueda
  useEffect(() => {
    const filtered = bodegas.filter(bodega =>
      bodega.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bodega.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bodega.direccion && bodega.direccion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bodega.encargado && bodega.encargado.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bodega.telefono && bodega.telefono.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredBodegas(filtered);
  }, [bodegas, searchTerm]);

  // Calcular bodegas a mostrar en la página actual
  const totalPaginas = Math.ceil(filteredBodegas.length / bodegasPorPagina);
  const bodegasPagina = filteredBodegas.slice(
    (pagina - 1) * bodegasPorPagina,
    pagina * bodegasPorPagina
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bodegas.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-xl font-semibold mb-2">No hay bodegas registradas</div>
            <p className="text-muted-foreground">
              ¡Agrega tu primera bodega utilizando el botón Nueva Bodega!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Bodegas
          </span>
          <span className="text-sm text-muted-foreground">
            {filteredBodegas.length} de {bodegas.length} bodegas
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Barra de búsqueda */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, código, dirección, encargado, teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead className="w-[120px]">Código</TableHead>
                <TableHead className="min-w-[200px]">Nombre</TableHead>
                <TableHead className="min-w-[250px]">Dirección</TableHead>
                <TableHead className="w-[150px]">Encargado</TableHead>
                <TableHead className="w-[140px]">Teléfono</TableHead>
                <TableHead className="w-[100px]">Estado</TableHead>
                <TableHead className="w-[100px]">Fecha Creación</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bodegasPagina.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {bodegas.length === 0
                      ? "No hay bodegas disponibles"
                      : "No se encontraron bodegas con los criterios de búsqueda"}
                  </TableCell>
                </TableRow>
              ) : (
                bodegasPagina.map((bodega) => (
                  <TableRow key={bodega.id} className="hover:bg-muted/40 transition">
                    {/* ID */}
                    <TableCell className="font-medium text-center">
                      #{bodega.id}
                    </TableCell>

                    {/* Código */}
                    <TableCell>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {bodega.codigo}
                      </code>
                    </TableCell>

                    {/* Nombre */}
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {bodega.nombre}
                      </div>
                    </TableCell>

                    {/* Dirección */}
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700" title={bodega.direccion || ""}>
                          {bodega.direccion || (
                            <span className="text-gray-400 italic">No especificada</span>
                          )}
                        </span>
                      </div>
                    </TableCell>

                    {/* Encargado */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {bodega.encargado || (
                            <span className="text-gray-400 italic">No asignado</span>
                          )}
                        </span>
                      </div>
                    </TableCell>

                    {/* Teléfono */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-mono">
                          {bodega.telefono || (
                            <span className="text-gray-400 italic">No especificado</span>
                          )}
                        </span>
                      </div>
                    </TableCell>

                    {/* Estado */}
                    <TableCell>
                      <Badge variant={bodega.activa ? "default" : "secondary"}>
                        {bodega.activa ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>

                    {/* Fecha Creación */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(bodega.fecha_creacion)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="text-right">
                      <TableActions
                        onEdit={() => onEdit(bodega)}
                        onDelete={() => onDelete(bodega)}
                        onView={() => onView?.(bodega)}
                        onToggleStatus={() => onToggleStatus?.(bodega)}
                        isActive={bodega.activa}
                        canView={!!onView}
                        canToggleStatus={!!onToggleStatus}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-end items-center gap-2 mt-4">
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
      </CardContent>
    </Card>
  );
};
