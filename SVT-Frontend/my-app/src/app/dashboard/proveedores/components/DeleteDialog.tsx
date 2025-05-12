import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";
  import { Alert, AlertDescription } from "@/components/ui/alert";
  import { Loader2 } from "lucide-react";
  import { Proveedor } from "./ProveedorDashBoard";
  
  interface DeleteDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    proveedor: Proveedor | null;
    onConfirm: () => Promise<void>;
    isDeleting: boolean;
    error: string | null;
  }
  
  export default function DeleteDialog({
    isOpen,
    onOpenChange,
    proveedor,
    onConfirm,
    isDeleting,
    error
  }: DeleteDialogProps) {
    if (!proveedor) return null;
  
    return (
      <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro de eliminar este proveedor?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al proveedor <strong>{proveedor.nombre}</strong> y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }