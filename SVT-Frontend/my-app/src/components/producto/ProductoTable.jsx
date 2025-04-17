import { 
    Table, 
    TableBody, 
    TableCaption, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
  } from "@/components/ui/table";
  import {
    Card,
    CardContent
  } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Pencil, Trash2 } from "lucide-react";
  import StockBadge from './StockBadge';
  import ProductoRow from './ProductoRow';
  
  export default function ProductoTable({ productos, onEdit, onDelete }) {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No hay productos disponibles
                  </TableCell>
                </TableRow>
              ) : (
                productos.map((producto) => (
                  <ProductoRow 
                    key={producto.id} 
                    producto={producto} 
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }