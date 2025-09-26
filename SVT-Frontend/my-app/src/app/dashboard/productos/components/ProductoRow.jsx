import { TableCell, TableRow } from "@/components/ui/table";
import { TableActions } from "@/src/components/dashboard/table-actions";
import StockBadge from './StockBadge';

export default function ProductoRow({ producto, onEdit, onDelete, onView }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{producto.sku}</TableCell>
      <TableCell>{producto.nombre}</TableCell>
      <TableCell>{producto.categoria_nombre || 'Sin categoría'}</TableCell>
      <TableCell>${producto.precio_unitario.toFixed(2)}</TableCell>
      <TableCell>
        <StockBadge stock={producto.stock_actual} />
      </TableCell>
      <TableCell className="text-right">
        <TableActions
          onEdit={() => onEdit(producto)}
          onDelete={() => onDelete(producto)}
          onView={() => onView?.(producto)}
          canView={!!onView}
        />
      </TableCell>
    </TableRow>
  );
}
