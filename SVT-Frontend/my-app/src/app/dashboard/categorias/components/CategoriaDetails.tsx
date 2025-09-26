'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Categoria } from '@/src/services/interfaces';
import {
  Package,
  Calendar,
  Code,
  FileText,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoriaDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoria: Categoria | null;
  onEdit?: (categoria: Categoria) => void;
  onDelete?: (categoria: Categoria) => void;
}

export const CategoriaDetails: React.FC<CategoriaDetailsProps> = ({
  isOpen,
  onOpenChange,
  categoria,
  onEdit,
  onDelete
}) => {
  if (!categoria) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Detalles de la Categoría
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Información Principal
                </span>
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
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {categoria.nombre}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Código</label>
                  <p className="text-lg font-mono bg-gray-100 px-3 py-1 rounded mt-1 inline-block">
                    {categoria.codigo}
                  </p>
                </div>
              </div>

              {categoria.descripcion && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Descripción</label>
                  <p className="text-gray-700 mt-1 bg-gray-50 p-3 rounded border">
                    {categoria.descripcion}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Creación</label>
                  <p className="text-gray-700 mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(categoria.fecha_creacion)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Última Actualización</label>
                  <p className="text-gray-700 mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(categoria.fecha_actualizacion)}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">ID de Categoría</label>
                <p className="text-gray-700 mt-1 font-mono bg-gray-100 px-3 py-1 rounded inline-block">
                  #{categoria.id}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Estado y Funcionalidad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Estado y Funcionalidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">Estado de la Categoría</p>
                    <p className="text-sm text-gray-600">
                      {categoria.activa
                        ? 'Esta categoría está activa y disponible para productos'
                        : 'Esta categoría está inactiva y no está disponible para productos'
                      }
                    </p>
                  </div>
                  <Badge variant={categoria.activa ? 'default' : 'secondary'}>
                    {categoria.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>

                {!categoria.activa && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>Nota:</strong> Las categorías inactivas no aparecerán en los formularios
                      de productos y no podrán ser seleccionadas para nuevos productos.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          {(onEdit || onDelete) && (
            <>
              <Separator />
              <div className="flex justify-end gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onEdit(categoria);
                      onOpenChange(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onDelete(categoria);
                      onOpenChange(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
