'use client';

import { Suspense } from 'react';
import { BodegaDashboard } from './components/BodegaDashboard';

export default function BodegasPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <BodegaDashboard />
    </Suspense>
  );
}
