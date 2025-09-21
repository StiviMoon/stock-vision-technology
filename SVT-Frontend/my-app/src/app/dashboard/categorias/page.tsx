'use client';

import { Suspense } from 'react';
import { CategoriaDashboard } from './components/CategoriaDashboard';

export default function CategoriasPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <CategoriaDashboard />
    </Suspense>
  );
}
