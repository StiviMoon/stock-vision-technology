'use client';

import React from 'react';
import { Bodega } from '@/src/services/interfaces';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building,
  MapPin,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface BodegaStatsProps {
  bodegas: Bodega[];
  loading?: boolean;
}

export const BodegaStats: React.FC<BodegaStatsProps> = ({
  bodegas,
  loading = false,
}) => {
  const totalBodegas = bodegas.length;
  const bodegasActivas = bodegas.filter(bodega => bodega.activa).length;
  const bodegasInactivas = totalBodegas - bodegasActivas;
  const porcentajeActivas = totalBodegas > 0 ? Math.round((bodegasActivas / totalBodegas) * 100) : 0;

  // Contar bodegas con información completa
  const bodegasCompletas = bodegas.filter(bodega =>
    bodega.direccion && bodega.encargado && bodega.telefono
  ).length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Bodegas */}
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bodegas</p>
              <p className="text-2xl font-bold text-blue-600">{totalBodegas}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bodegas Activas */}
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bodegas Activas</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-green-600">{bodegasActivas}</p>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {porcentajeActivas}%
                </Badge>
              </div>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bodegas Inactivas */}
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bodegas Inactivas</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-600">{bodegasInactivas}</p>
                <Badge variant="secondary">
                  {totalBodegas > 0 ? Math.round((bodegasInactivas / totalBodegas) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="p-3 rounded-full bg-gray-100">
              <XCircle className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado General */}
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estado General</p>
              <div className="flex items-center gap-2">
                {porcentajeActivas >= 80 ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Excelente</span>
                  </>
                ) : porcentajeActivas >= 60 ? (
                  <>
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Bueno</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">Mejorar</span>
                  </>
                )}
              </div>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
