'use client';

import { useState, useEffect } from 'react';

export default function BodegadPage() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="p-6 md:p-8">
      <div className="space-y-8">
        {/* Encabezado */}
        <div 
          className={`transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
          style={{ transitionDelay: '200ms' }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Bodega</h1>
          <p className="text-muted-foreground">Bienvenido al sistema de inventario SVT</p>
        </div>
      </div>
    </div>
  );
}