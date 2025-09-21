import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import StockBadge from './StockBadge';

export default function ProductoRow({ producto, onEdit, onDelete }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{producto.sku}</TableCell>
      <TableCell>{producto.nombre}</TableCell>
      <TableCell>{producto.categoria_nombre || 'Sin categoría'}</TableCell>
      <TableCell>${producto.precio_unitario.toFixed(2)}</TableCell>
      <TableCell>
        <StockBadge stock={producto.stock_actual} />
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(producto)}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(producto)}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
