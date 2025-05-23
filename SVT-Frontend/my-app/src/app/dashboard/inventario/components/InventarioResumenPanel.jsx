// inventario/components/InventarioResumenPanel.jsx

import React from 'react';

export default function InventarioResumenPanel({ productos = [] }) {
  const totalProductos = productos.length;

  const stockBajo = productos.filter(p => p.stock_actual < 10).length;

  const categoriaMasComun = (() => {
    const conteo = {};
    productos.forEach(p => {
      const cat = p.categoria || 'Sin categoría';
      conteo[cat] = (conteo[cat] || 0) + 1;
    });

    const max = Object.entries(conteo).reduce(
      (a, b) => (a[1] > b[1] ? a : b),
      ['', 0]
    );
    return max[0] || 'N/A';
  })();

  return (
    <div className="p-4 bg-white dark:bg-gray-800 shadow rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Total de productos</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{totalProductos}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Stock bajo (&lt; 10)</p>
        <p className="text-xl font-bold text-red-500">{stockBajo}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Categoría más común</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{categoriaMasComun}</p>
      </div>
    </div>
  );
}
