

/**
 * CustomTable
 * Componente de tabla reutilizable con acciones (editar y eliminar) y diseño moderno.
 *
 * @param {Array} columns - Array de objetos con 'title' y 'key' para definir las columnas
 * @param {Array} data - Array de objetos de datos a renderizar
 * @param {Function} onEdit - Función de callback para editar un elemento
 * @param {Function} onDelete - Función de callback para eliminar un elemento
 */
export default function CustomTable({ columns = [], data = [], onEdit, onDelete }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-900">
    <table className="w-full text-sm text-left text-gray-800 dark:text-gray-100">

        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-200">

          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3">{col.title}</th>
            ))}
            
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-gray-500 italic">
                Sin registros disponibles.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >

                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {item[col.key]}
                  </td>
                ))}

                
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
