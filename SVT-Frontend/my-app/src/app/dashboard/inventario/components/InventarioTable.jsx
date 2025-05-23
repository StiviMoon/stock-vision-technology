"use client";

import { useEffect, useState } from "react";
import { productoService } from "@/src/services/api";


import InventarioTable from "@/components/ui/CustomTable";
// Aquí pones tu tabla custom

export default function InventarioDashboard() {
  // Estado para guardar los productos del inventario
  const [inventario, setInventario] = useState([]);

  // Estado de carga (opcional para mostrar loading)
  const [loading, setLoading] = useState(true);

  // Función para cargar los productos desde la API
 const fetchInventario = async () => {
  try {
    const productos = await productoService.getProductos();
    console.log("📦 Productos recibidos:", productos); 
    setInventario(productos);
  } catch (error) {
    console.error("Error al cargar inventario:", error);
  } finally {
    setLoading(false);
  }
};


  // useEffect para llamar la API al montar el componente
  useEffect(() => {
    fetchInventario();
  }, []);

  // Funciones para editar y eliminar (aún puedes implementarlas)
  const handleEdit = (producto) => {
    console.log("Editar producto:", producto);
  };

  const handleDelete = (productoId) => {
    console.log("Eliminar producto ID:", productoId);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Inventario</h2>

      {/* Mostrar loading si aún está cargando */}
      {loading ? (
        <p>Cargando inventario...</p>
      ) : (
        <InventarioTable
          inventario={inventario}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
