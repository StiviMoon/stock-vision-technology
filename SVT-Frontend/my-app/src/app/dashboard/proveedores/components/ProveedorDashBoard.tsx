"use client";

import { useState, useEffect } from "react";
import { proveedorService } from "@/src/services/api";

// Actualizado conforme al modelo de datos actual
export interface Proveedor {
  id: number;
  nombre: string;
  codigo: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Componentes refactorizados
import ProveedorTable from "./ProveedorTable";
import ProveedorForm from "./ProveedorForm";
import DeleteDialog from "./DeleteDialog";
import ErrorAlert from "./ErrorAlert";

export default function ProveedorDashBoard() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProveedor, setCurrentProveedor] = useState<Proveedor | null>(
    null
  );
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isVisible, setIsVisible] = useState(false);

  // Estado para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [proveedorToDelete, setProveedorToDelete] = useState<Proveedor | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProveedores();
    // Activar las animaciones después de cargar los datos
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const data = await proveedorService.getProveedores();
      setProveedores(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al cargar proveedores");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setCurrentProveedor(null);
    setFormMode("create");
    setIsModalOpen(true);
  };

  const openEditModal = (proveedor: Proveedor) => {
    setCurrentProveedor(proveedor);
    setFormMode("edit");
    setIsModalOpen(true);
  };

  const openDeleteDialog = (proveedor: Proveedor) => {
    setProveedorToDelete(proveedor);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!proveedorToDelete) return;

    try {
      setIsDeleting(true);
      await proveedorService.deleteProveedor(proveedorToDelete.id);
      setIsDeleteDialogOpen(false);
      fetchProveedores();
    } catch (err: any) {
      setError(
        typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Error al eliminar proveedor"
      );
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (formMode === "create") {
        await proveedorService.createProveedor(formData);
      } else {
        await proveedorService.updateProveedor(currentProveedor!.id, formData);
      }
      setIsModalOpen(false);
      fetchProveedores();
      return { success: true };
    } catch (err: any) {
      console.error("Error:", err);

      // Preparar y retornar errores para que el componente del formulario los maneje
      if (err.response?.status === 422 && err.response?.data?.detail) {
        const validationErrors: Record<string, string> = {};
        err.response.data.detail.forEach((error: any) => {
          const fieldName =
            error.loc && error.loc.length > 1 ? error.loc[1] : "general";
          validationErrors[fieldName] = error.msg;
        });

        return {
          success: false,
          validationErrors,
          generalError: "Por favor, corrija los errores en el formulario.",
        };
      } else {
        return {
          success: false,
          generalError:
            typeof err.response?.data?.detail === "string"
              ? err.response.data.detail
              : `Error al ${
                  formMode === "create" ? "crear" : "actualizar"
                } proveedor`,
        };
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );

  if (error && !isModalOpen && !isDeleteDialogOpen) {
    return <ErrorAlert error={error} className="max-w-4xl mx-auto my-4" />;
  }

  return (
    <div className="p-6 md:p-8">
      <div className="space-y-6">
        {/* Encabezado y botón de crear */}
        <div className="flex justify-between items-center">
          <div
            className={`transform transition-all duration-300 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "100ms" }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Proveedores
            </h1>
            <p className="text-muted-foreground">
              Gestión de proveedores del sistema SVT
            </p>
          </div>
          <div
            className={`transform transition-all duration-300 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <Button
              onClick={openCreateModal}
              variant="default"
              className="flex items-center transition-all duration-150 hover:shadow-md active:translate-y-0.5"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Proveedor
            </Button>
          </div>
        </div>

        {/* Tabla de proveedores */}
        <div
          className={`transform transition-all duration-500 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          <ProveedorTable
            proveedores={proveedores}
            onEdit={openEditModal}
            onDelete={openDeleteDialog}
          />
        </div>
      </div>

      {/* Modal para crear/editar proveedor */}
      <ProveedorForm
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        formMode={formMode}
        initialData={currentProveedor}
        onSubmit={handleFormSubmit}
      />

      {/* Diálogo de confirmación para eliminar */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        proveedor={proveedorToDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        error={error}
      />
    </div>
  );
}
