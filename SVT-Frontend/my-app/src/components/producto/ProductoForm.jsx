import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ErrorAlert from './ErrorAlert';

export default function ProductoForm({ 
  isOpen, 
  onOpenChange, 
  formMode, 
  initialData, 
  onSubmit 
}) {
  // Estado para el formulario
  const [formData, setFormData] = useState({
    sku: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    precio_unitario: 0,
    proveedor_id: 1,
    stock_minimo: 0,
    stock_inicial: 0
  });

  // Estado para errores de validación y errores generales
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null);

  // Actualizar el formulario cuando cambia el modo o los datos iniciales
  useEffect(() => {
    if (formMode === 'create') {
      setFormData({
        sku: '',
        nombre: '',
        descripcion: '',
        categoria: '',
        precio_unitario: 0,
        proveedor_id: 1,
        stock_minimo: 0,
        stock_inicial: 0
      });
    } else if (initialData) {
      setFormData({
        sku: initialData.sku || '',
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || '',
        categoria: initialData.categoria || '',
        precio_unitario: typeof initialData.precio_unitario === 'number' ? initialData.precio_unitario : 0,
        proveedor_id: typeof initialData.proveedor_id === 'number' ? initialData.proveedor_id : 1,
        stock_minimo: typeof initialData.stock_minimo === 'number' ? initialData.stock_minimo : 0,
        stock_actual: typeof initialData.stock_actual === 'number' ? initialData.stock_actual : 0
      });
    }
    setFormErrors({});
    setError(null);
  }, [formMode, initialData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Asegurarnos de que los valores numéricos siempre tengan un valor definido
    let processedValue;
    if (['precio_unitario', 'stock_minimo', 'stock_inicial', 'proveedor_id', 'stock_actual'].includes(name)) {
      // Para campos numéricos, usar 0 si el valor está vacío o no es numérico
      processedValue = value === '' ? 0 : parseFloat(value) || 0;
    } else {
      // Para campos de texto, usar el valor tal cual
      processedValue = value;
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    });
    
    // Limpiar el error específico al cambiar el campo
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Asegurarse de convertir los valores numéricos correctamente
    const productoData = {
      ...formData,
      precio_unitario: parseFloat(formData.precio_unitario) || 0,
      proveedor_id: parseInt(formData.proveedor_id) || 1,
      stock_minimo: parseInt(formData.stock_minimo) || 0,
      stock_inicial: parseInt(formData.stock_inicial) || 0
    };
    
    const result = await onSubmit(productoData);
    
    if (!result.success) {
      if (result.validationErrors) {
        setFormErrors(result.validationErrors);
      }
      if (result.generalError) {
        setError(result.generalError);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {formMode === 'create' ? 'Crear Nuevo Producto' : 'Editar Producto'}
          </DialogTitle>
          <DialogDescription>
            Completa los campos para {formMode === 'create' ? 'crear un nuevo' : 'actualizar el'} producto
          </DialogDescription>
        </DialogHeader>
        
        {error && <ErrorAlert error={error} className="my-2" />}
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <FormField
              id="sku"
              label="SKU"
              value={formData.sku}
              onChange={handleInputChange}
              error={formErrors.sku}
              required
            />
            
            <FormField
              id="nombre"
              label="Nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              error={formErrors.nombre}
              required
            />
            
            <FormField
              id="descripcion"
              label="Descripción"
              value={formData.descripcion}
              onChange={handleInputChange}
              error={formErrors.descripcion}
              required
              isTextarea
            />
            
            <FormField
              id="categoria"
              label="Categoría"
              value={formData.categoria}
              onChange={handleInputChange}
              error={formErrors.categoria}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="precio_unitario"
                label="Precio Unitario"
                value={formData.precio_unitario}
                onChange={handleInputChange}
                error={formErrors.precio_unitario}
                type="number"
                min="0"
                step="0.01"
                required
              />
              
              <FormField
                id="proveedor_id"
                label="ID Proveedor"
                value={formData.proveedor_id}
                onChange={handleInputChange}
                error={formErrors.proveedor_id}
                type="number"
                min="1"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="stock_minimo"
                label="Stock Mínimo"
                value={formData.stock_minimo}
                onChange={handleInputChange}
                error={formErrors.stock_minimo}
                type="number"
                min="0"
                required
              />
              
              {formMode === 'create' ? (
                <FormField
                  id="stock_inicial"
                  label="Stock Inicial"
                  value={formData.stock_inicial}
                  onChange={handleInputChange}
                  error={formErrors.stock_inicial}
                  type="number"
                  min="0"
                  required
                />
              ) : (
                <FormField
                  id="stock_actual"
                  label="Stock Actual"
                  value={formData.stock_actual}
                  onChange={handleInputChange}
                  error={formErrors.stock_actual}
                  type="number"
                  min="0"
                  required
                />
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {formMode === 'create' ? 'Crear' : 'Actualizar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Componente auxiliar para campos de formulario
function FormField({ 
  id, 
  label, 
  value, 
  onChange, 
  error, 
  required = false, 
  type = "text", 
  min, 
  step,
  isTextarea = false 
}) {
  const Component = isTextarea ? Textarea : Input;
  
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className={error ? "text-destructive" : ""}>
        {label}
      </Label>
      <Component
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        className={error ? "border-destructive" : ""}
        required={required}
        min={min}
        step={step}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}