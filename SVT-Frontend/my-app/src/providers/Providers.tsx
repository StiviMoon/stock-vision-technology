'use client';

import React from 'react';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster
          position='top-right'
          richColors
          closeButton
          duration={4000}
          expand={true}
          gap={12}
          offset={16}
          toastOptions={{
            className: 'svt-toast',
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow:
                '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(8px)',
              minWidth: '350px',
              maxWidth: '450px',
            },
            descriptionClassName: 'svt-toast-description',
          }}
          theme='system'
        />
      </AuthProvider>
    </QueryProvider>
  );
};
