'use client';

import { useState, useEffect } from 'react';

export default function ConfigdPage() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="p-6 md:p-8">
      <div className="space-y-8">
        {/* Encabezado con animación de entrada */}
        <div 
          className={`transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
          style={{ transitionDelay: '20ms' }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
          <p className="text-muted-foreground">Bienvenido al sistema de inventario SVT</p>
        </div>
        
        {/* Tarjeta de configuración */}
        <div 
          className={`bg-card rounded-xl p-6 border border-border shadow-sm transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} 
          style={{ transitionDelay: '30ms' }}
        >
          <h2 className="text-xl font-semibold mb-4">Ajustes del Sistema</h2>
          
          <div className="space-y-3">
            {/* Opciones de configuración con hover optimizado */}
            {['Perfil de Usuario', 'Notificaciones', 'Seguridad', 'Tema'].map((option, index) => (
              <div 
                key={index}
                className="p-4 border border-border rounded-lg transition-colors duration-150 hover:bg-secondary/10 cursor-pointer group"
                style={{ transitionDelay: `${35 + (index * 5)}ms` }}
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
  );
}