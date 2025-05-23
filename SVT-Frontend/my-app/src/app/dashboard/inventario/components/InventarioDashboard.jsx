"use client";

import { useEffect, useState } from "react";
import { productoService } from "@/src/services/api";
import InventarioCategoriaPanel from "./InventarioCategoriaPanel";
import InventarioFiltroPanel from "./InventarioFiltroPanel";
import InventarioResumenPanel from "./InventarioResumenPanel";
import InventarioAlertasPanel from "./InventarioAlertasPanel";




export default function InventarioDashboard() {
  const [inventario, setInventario] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);


  const columnas = [
    { title: "SKU", key: "sku" },
    { title: "Nombre", key: "nombre" },
    { title: "Descripción", key: "descripcion" },
    { title: "Precio", key: "precio_unitario" },
    { title: "Stock", key: "stock_actual" },
  ];

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const productos = await productoService.getProductos();
        setInventario(productos);
        setProductosFiltrados(productos);
      } catch (error) {
        console.error("Error al cargar inventario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventario();
  }, []);

  const handleEdit = (producto) => {
    console.log("Editar producto:", producto);
  };

  const handleDelete = (productoId) => {
    console.log("Eliminar producto ID:", productoId);
  };

  const productosPorCategoria =
  productosFiltrados && productosFiltrados.length > 0
    ? productosFiltrados.reduce((acc, producto) => {
        const categoria = producto.categoria || "Sin categoría";
        if (!acc[categoria]) acc[categoria] = [];
        acc[categoria].push(producto);
        return acc;
      }, {})
    : {};


  return (
    <div className="p-4 space-y-8">
      <InventarioFiltroPanel
  inventario={inventario}
  onFiltrar={(filtrados) => setProductosFiltrados(filtrados)}
/>
      
      <InventarioAlertasPanel productos={productosFiltrados} />
      <InventarioResumenPanel productos={productosFiltrados} />
      


      <h2 className="text-2xl font-bold mb-6">Inventario por Categoría</h2>

      {loading ? (
        <p>Cargando inventario...</p>
      ) : Object.keys(productosPorCategoria).length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        Object.entries(productosPorCategoria).map(([categoria, productos]) => (
          <InventarioCategoriaPanel
            key={categoria}
            categoria={categoria}
            productos={productos}
            columnas={columnas}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
}
