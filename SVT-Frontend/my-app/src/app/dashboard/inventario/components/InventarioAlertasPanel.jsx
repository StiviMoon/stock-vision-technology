// inventario/components/InventarioAlertasPanel.jsx

import React from "react";

export default function InventarioAlertasPanel({ productos = [] }) {
  const sinStock = productos.filter(p => p.stock_actual === 0);
  const stockBajo = productos.filter(p => p.stock_actual > 0 && p.stock_actual < 5);

  if (sinStock.length === 0 && stockBajo.length === 0) return null;

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg space-y-4">
      <h2 className="text-lg font-semibold text-yellow-800">⚠️ Alertas del Inventario</h2>

      {sinStock.length > 0 && (
        <div>
          <p className="font-medium text-red-600">Productos sin stock:</p>
          <ul className="list-disc ml-5 text-sm text-gray-700">
            {sinStock.map((p) => (
              <li key={p.id}>{p.nombre} (SKU: {p.sku})</li>
            ))}
          </ul>
        </div>
      )}

      {stockBajo.length > 0 && (
        <div>
          <p className="font-medium text-orange-600">Productos con stock bajo (&lt; 5):</p>
          <ul className="list-disc ml-5 text-sm text-gray-700">
            {stockBajo.map((p) => (
              <li key={p.id}>{p.nombre} | {p.stock_actual} unidades</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
