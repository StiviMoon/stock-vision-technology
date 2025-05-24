'use client';

import React from 'react';
import { useTheme } from './ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'navbar' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ThemeToggle = ({ variant = 'navbar', size = 'md', className = '' }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 22
  };
  
  const baseClasses = `
    relative overflow-hidden rounded-full p-2
    ${isDark ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'bg-secondary text-secondary-foreground'}
    flex items-center justify-center
    transition-all duration-200
    hover:scale-105 active:scale-95
  `;
  
  const variantClasses = {
    navbar: `${sizeClasses[size]} hover:shadow-md`,
    floating: `${sizeClasses[size]} shadow-md hover:shadow-lg fixed bottom-6 right-6 z-[999]`
  };
  
  return (
    <button
      onClick={toggleTheme}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <div
        className={`absolute transition-transform duration-300 ease-out ${isDark ? 'rotate-0' : 'rotate-180'}`}
        style={{ transformOrigin: 'center' }}
      >
        {isDark ? (
          <Moon size={iconSizes[size]} />
        ) : (
          <Sun size={iconSizes[size]} />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;