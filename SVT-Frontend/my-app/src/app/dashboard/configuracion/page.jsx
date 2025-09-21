'use client';

import { useState, useEffect } from 'react';

export default function ConfigdPage() {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
          <p className="text-muted-foreground">Bienvenido al sistema de inventario SVT</p>
        </div>

        {/* Content */}
        <div
          className={`transform transition-all duration-300 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Ajustes del Sistema</h2>

            <div className="space-y-3">
              {/* Opciones de configuración con hover optimizado */}
              {['Perfil de Usuario', 'Notificaciones', 'Seguridad', 'Tema'].map((option, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg transition-colors duration-150 hover:bg-secondary/10 cursor-pointer group"
                >
                  <div className="flex justify-between items-center">
                    <span>{option}</span>
                    <span className="text-primary transition-transform duration-150 transform translate-x-0 group-hover:translate-x-1">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
