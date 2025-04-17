'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

// Theme provider component
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  // Initialize theme from localStorage or default to 'dark'
  const [theme, setTheme] = useState<Theme>('dark');
  
  // Load theme from localStorage on initial render
  useEffect(() => {
    if (isBrowser) {
      const savedTheme = localStorage.getItem('theme') as Theme || 'dark';
      setTheme(savedTheme);
      
      // Apply theme class to document
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isBrowser]);
  
  // Function to toggle theme
  const toggleTheme = () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Save to localStorage
    if (isBrowser) {
      localStorage.setItem('theme', newTheme);
      
      // Apply theme class to document - this will trigger your CSS variables to change
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}