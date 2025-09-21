'use client';

import { useState, useEffect } from 'react';

export default function ReportesdPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 md:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div
          className={`transform transition-all duration-300 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Reportes</h1>
          <p className="text-muted-foreground">Bienvenido al sistema de inventario SVT</p>
        </div>

        {/* Cards */}
        <div
          className={`transform transition-all duration-300 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Inventario actual', description: 'Ver estado actual del inventario' },
              { title: 'Movimientos', description: 'Entradas y salidas del inventario' },
              { title: 'Valoración', description: 'Valor económico del inventario' },
              { title: 'Rotación', description: 'Análisis de rotación de productos' }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 cursor-pointer"
              >
                <h3 className="text-lg font-medium text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sección de exportación */}
        <div
          className={`transform transition-all duration-300 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Exportar reportes</h3>
            <div className="flex flex-wrap gap-3">
              {['PDF', 'Excel', 'CSV'].map((format, index) => (
                <button
                  key={index}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium transition-all duration-150 hover:bg-secondary/80 active:translate-y-0.5"
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
