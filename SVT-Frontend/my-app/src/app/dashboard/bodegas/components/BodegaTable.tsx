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
import { Search, Edit, Trash2, MapPin, Package } from 'lucide-react';

interface BodegaTableProps {
  bodegas: Bodega[];
  onEdit: (bodega: Bodega) => void;
  onDelete: (bodega: Bodega) => void;
  loading?: boolean;
}

export const BodegaTable: React.FC<BodegaTableProps> = ({
  bodegas,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBodegas, setFilteredBodegas] = useState<Bodega[]>([]);

  // Filtrar bodegas por término de búsqueda
  useEffect(() => {
    const filtered = bodegas.filter(bodega =>
      bodega.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bodega.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bodega.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bodega.descripcion && bodega.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredBodegas(filtered);
  }, [bodegas, searchTerm]);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5" />
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
              placeholder="Buscar por nombre, código, ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBodegas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {bodegas.length === 0
                      ? "No hay bodegas disponibles"
                      : "No se encontraron bodegas con los criterios de búsqueda"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBodegas.map((bodega) => (
                  <TableRow key={bodega.id}>
                    <TableCell className="font-medium">{bodega.codigo}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bodega.nombre}</div>
                        {bodega.descripcion && (
                          <div className="text-sm text-muted-foreground">
                            {bodega.descripcion}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{bodega.ubicacion}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={bodega.activa ? "default" : "secondary"}>
                        {bodega.activa ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(bodega)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => onDelete(bodega)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
