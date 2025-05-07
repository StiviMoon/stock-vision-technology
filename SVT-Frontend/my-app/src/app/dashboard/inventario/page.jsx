'use client';

import { useState, useEffect } from 'react';

export default function InventariodPage() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Activar las animaciones una vez que el componente se monte
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 md:p-8">
      <div className="space-y-8">
        {/* Encabezado con animación optimizada */}
        <div 
          className={`transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          <h1 
            className={`text-3xl font-bold text-foreground mb-2 transform transition-transform duration-300 ease-out ${isVisible ? 'translate-y-0' : 'translate-y-4'}`}
          >
            Inventario
          </h1>
          <p 
            className={`text-muted-foreground transform transition-all duration-300 ease-out delay-75 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          >
            Bienvenido al sistema de inventario SVT
          </p>
        </div>
        
        {/* Contenido con el mismo patrón de animación que Proveedores */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-300 ease-out delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
        >
          {['Productos', 'Categorías', 'Proveedores'].map((item, index) => (
            <div 
              key={index}
              className="cursor-pointer bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow transition-shadow duration-150 transform hover:-translate-y-1 transition-transform"
              style={{ transitionDelay: `${15 + (index * 5)}ms` }}
            >
              <h3 className="font-medium text-foreground">{item}</h3>
              <p className="text-sm text-muted-foreground mt-1">Gestionar {item.toLowerCase()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}