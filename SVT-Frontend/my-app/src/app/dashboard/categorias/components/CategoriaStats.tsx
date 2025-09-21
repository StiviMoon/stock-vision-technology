  'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Categoria } from '@/src/services/interfaces';

interface CategoriaStatsProps {
  categorias: Categoria[];
  loading?: boolean;
}

export const CategoriaStats: React.FC<CategoriaStatsProps> = ({
  categorias,
  loading = false,
}) => {
  const totalCategorias = categorias.length;
  const categoriasActivas = categorias.filter(cat => cat.activa).length;
  const categoriasInactivas = totalCategorias - categoriasActivas;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Categorías
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCategorias}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Categorías Activas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-green-600">
              {categoriasActivas}
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              {totalCategorias > 0 ? Math.round((categoriasActivas / totalCategorias) * 100) : 0}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Categorías Inactivas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-gray-600">
              {categoriasInactivas}
            </div>
            <Badge variant="secondary">
              {totalCategorias > 0 ? Math.round((categoriasInactivas / totalCategorias) * 100) : 0}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
