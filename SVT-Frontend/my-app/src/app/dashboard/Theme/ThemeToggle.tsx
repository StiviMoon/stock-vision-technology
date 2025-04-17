'use client';

import React from 'react';
import { useTheme } from './ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative overflow-hidden rounded-full p-2
        ${isDark ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'bg-secondary text-secondary-foreground'}
        shadow-md hover:shadow-lg transition-all duration-300
        flex items-center justify-center
        w-12 h-12
      `}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: isDark ? 0 : 180,
          opacity: 1
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20
        }}
        className="absolute"
      >
        {isDark ? (
          <Moon size={22} />
        ) : (
          <Sun size={22} />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;