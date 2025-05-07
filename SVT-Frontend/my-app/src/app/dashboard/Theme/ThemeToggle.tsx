'use client';

import React from 'react';
import { useTheme } from './ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <button
      onClick={toggleTheme}
      className={`
        relative overflow-hidden rounded-full p-2
        ${isDark ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'bg-secondary text-secondary-foreground'}
        shadow-md hover:shadow-lg 
        flex items-center justify-center
        w-12 h-12
        fixed bottom-6 right-6 z-[999]
        transition-all duration-200
        hover:scale-105 active:scale-90
      `}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <div
        className={`absolute transition-transform duration-300 ease-out ${isDark ? 'rotate-0' : 'rotate-180'}`}
        style={{ transformOrigin: 'center' }}
      >
        {isDark ? (
          <Moon size={22} />
        ) : (
          <Sun size={22} />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;