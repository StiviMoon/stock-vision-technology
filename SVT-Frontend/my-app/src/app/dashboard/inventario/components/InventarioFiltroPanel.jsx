import { useState } from "react";

export default function InventarioFiltroPanel({ inventario, onFiltrar }) {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  // Obtener categorías únicas
  const categorias = [...new Set(inventario.map((item) => item.categoria || "Sin categoría"))];

  const handleFiltrar = () => {
    const filtrado = inventario.filter((producto) => {
      const nombreMatch = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const categoriaMatch = categoriaSeleccionada === "" || producto.categoria === categoriaSeleccionada;
      return nombreMatch && categoriaMatch;
    });

    onFiltrar(filtrado);
  };

  const handleReset = () => {
    setBusqueda("");
    setCategoriaSeleccionada("");
    onFiltrar(inventario);
  };

  return (
    <div className="mb-6 bg-gray-100 dark:bg-gray-700 p-4 rounded shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Filtrar Inventario</h3>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre"
          className="p-2 rounded border border-gray-300 w-full md:w-1/3 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />

        <select
          value={categoriaSeleccionada}
          onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          className="p-2 rounded border border-gray-300 w-full md:w-1/4 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button
          onClick={handleFiltrar}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"

        >
          Aplicar Filtros
        </button>

        <button
          onClick={handleReset}
          className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}
