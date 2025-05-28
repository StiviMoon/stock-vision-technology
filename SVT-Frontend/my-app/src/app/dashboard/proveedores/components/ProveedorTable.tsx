import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
  } from "@/components/ui/table";
  import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
  } from "@/components/ui/dropdown-menu";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { Edit, MoreHorizontal, Trash2, Mail, Phone, ChevronLeft, ChevronRight } from "lucide-react";
  import { Proveedor } from "./ProveedorDashBoard";
  import { useState } from "react";
  
  interface ProveedorTableProps {
    proveedores: Proveedor[];
    onEdit: (proveedor: Proveedor) => void;
    onDelete: (proveedor: Proveedor) => void;
  }
  
  export default function ProveedorTable({ proveedores, onEdit, onDelete }: ProveedorTableProps) {
    const [pagina, setPagina] = useState(1);
    const proveedoresPorPagina = 10;
  
    // Calcular proveedores a mostrar en la página actual
    const totalPaginas = Math.ceil(proveedores.length / proveedoresPorPagina);
    const proveedoresPagina = proveedores.slice(
      (pagina - 1) * proveedoresPorPagina,
      pagina * proveedoresPorPagina
    );
  
    if (proveedores.length === 0) {
      return (
        <div className="border rounded-lg p-8 flex flex-col items-center justify-center bg-background shadow">
          <div className="text-xl font-semibold text-center mb-2">No hay proveedores registrados</div>
          <p className="text-muted-foreground text-center">
            ¡Agrega tu primer proveedor utilizando el botón Nuevo Proveedor!
          </p>
        </div>
      );
    }
  
    return (
      <div className="rounded-lg border overflow-hidden bg-background shadow">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proveedoresPagina.map((proveedor) => (
              <TableRow key={proveedor.id} className="hover:bg-muted/40 transition">
                <TableCell className="font-medium">{proveedor.id}</TableCell>
                <TableCell>{proveedor.nombre}</TableCell>
                <TableCell>{proveedor.codigo}</TableCell>
                <TableCell>{proveedor.contacto || "-"}</TableCell>
                <TableCell>
                  {proveedor.telefono ? (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                      {proveedor.telefono}
                    </div>
                  ) : "-"}
                </TableCell>
                <TableCell>
                  {proveedor.email ? (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                      {proveedor.email}
                    </div>
                  ) : "-"}
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={proveedor.direccion || ""}>
                  {proveedor.direccion || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(proveedor)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(proveedor)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Eliminar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-end items-center gap-2 p-4">
            <Button
              variant="ghost"
              size="icon"
              disabled={pagina === 1}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {pagina} de {totalPaginas}
            </span>
            <Button
              variant="ghost"
              size="icon"
              disabled={pagina === totalPaginas}
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }