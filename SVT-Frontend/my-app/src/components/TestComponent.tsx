'use client';

import React from 'react';
import { useTest } from '@/src/hooks/useTest';

const TestComponent: React.FC = () => {
  const { data, isLoading, error } = useTest();

  if (isLoading) return <div>Probando React Query...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className='p-4 bg-green-100 border border-green-400 rounded'>
      <h3 className='text-green-800 font-semibold'>React Query Funcionando</h3>
      <p className='text-green-700'>{data}</p>
    </div>
  );
};

export default TestComponent;
