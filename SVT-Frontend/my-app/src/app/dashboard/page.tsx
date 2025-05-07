'use client';

import { useState, useEffect } from 'react';
import { useTheme } from './Theme/ThemeContext';

export default function DashboardPage() {
  const { theme } = useTheme();

  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  


  return (
    <div className="p-8 md:p-8">
      <div className="space-y-8">
        {/* Encabezado */}
        <div 
          className={`flex justify-between items-center transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
          style={{ transitionDelay: '200ms' }}
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Bienvenido al sistema de inventario SVT</p>
          </div>
          <div className="bg-card rounded-xl p-2 border border-border hidden md:block">
            <div className="text-xs text-muted-foreground">
              Última actualización: <span className="text-foreground font-medium">Hoy, 10:30 AM</span>
            </div>
          </div>
        </div>
        
       
      
      </div>
    </div>
  );
}