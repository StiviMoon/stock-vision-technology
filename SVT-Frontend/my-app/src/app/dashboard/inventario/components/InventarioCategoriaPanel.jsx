import CustomTable from "@/components/ui/CustomTable";

export default function InventarioCategoriaPanel({
  categoria,
  productos,
  columnas,
  onEdit,
  onDelete,
}) {
  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-md p-4 bg-white dark:bg-gray-800">
      <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">
        Categoría: {categoria}
      </h3>

      <CustomTable
        columns={columnas}
        data={productos}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
