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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ErrorAlert from './ErrorAlert';
import { SKUGenerator } from './SKUGenerator'; // Importamos el generador de SKU

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
    subcategoria: '',
    color: '',
    tamaño: '',
    precio_unitario: 0,
    proveedor_id: 1,
    stock_minimo: 0,
    stock_inicial: 0
  });

  // Estado para errores de validación y errores generales
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null);
  const [skuManual, setSkuManual] = useState(false);

  // Categorías disponibles
  const categorias = Object.keys(SKUGenerator.CATEGORY_PREFIXES).map(cat => ({
    value: cat,
    label: cat.charAt(0) + cat.slice(1).toLowerCase()
  }));

  // Actualizar el formulario cuando cambia el modo o los datos iniciales
  useEffect(() => {
    if (formMode === 'create') {
      setFormData({
        sku: '',
        nombre: '',
        descripcion: '',
        categoria: '',
        subcategoria: '',
        color: '',
        tamaño: '',
        precio_unitario: 0,
        proveedor_id: 1,
        stock_minimo: 0,
        stock_inicial: 0
      });
      setSkuManual(false);
    } else if (initialData) {
      setFormData({
        sku: initialData.sku || '',
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || '',
        categoria: initialData.categoria || '',
        subcategoria: initialData.subcategoria || '',
        color: initialData.color || '',
        tamaño: initialData.tamaño || '',
        precio_unitario: typeof initialData.precio_unitario === 'number' ? initialData.precio_unitario : 0,
        proveedor_id: typeof initialData.proveedor_id === 'number' ? initialData.proveedor_id : 1,
        stock_minimo: typeof initialData.stock_minimo === 'number' ? initialData.stock_minimo : 0,
        stock_actual: typeof initialData.stock_actual === 'number' ? initialData.stock_actual : 0
      });
      setSkuManual(true); // En edición asumimos que el SKU ya existe
    }
    setFormErrors({});
    setError(null);
  }, [formMode, initialData, isOpen]);

  // Generar SKU automáticamente cuando se modifican los campos relevantes
  useEffect(() => {
    // Solo generar automáticamente si no está en modo manual y hay suficientes datos
    if (!skuManual && formMode === 'create' && formData.nombre && formData.categoria) {
      // Generamos un ID temporal para el SKU (en una aplicación real usarías un contador o timestamp)
      const tempProduct = {
        ...formData,
        id: Date.now() % 1000000 // Simulamos un ID para el producto
      };
      
      const generatedSKU = SKUGenerator.generateSKU(tempProduct);
      setFormData(prev => ({
        ...prev,
        sku: generatedSKU
      }));
    }
  }, [formData.nombre, formData.categoria, formData.subcategoria, formData.color, formData.tamaño, skuManual, formMode]);

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
    
    // Si el usuario modifica manualmente el SKU, pasamos a modo manual
    if (name === 'sku') {
      setSkuManual(true);
    }
    
    // Limpiar el error específico al cambiar el campo
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Función para manejar cambios en selects (para categoría, subcategoría, etc)
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar el error específico al cambiar el campo
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const toggleSkuMode = () => {
    setSkuManual(!skuManual);
    
    // Si volvemos al modo automático, regenerar el SKU
    if (skuManual && formData.nombre && formData.categoria) {
      const tempProduct = {
        ...formData,
        id: Date.now() % 1000000
      };
      
      const generatedSKU = SKUGenerator.generateSKU(tempProduct);
      setFormData(prev => ({
        ...prev,
        sku: generatedSKU
      }));
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

  // Obtenemos las subcategorías basadas en la categoría seleccionada
  const getSubcategorias = () => {
    if (!formData.categoria) return [];
    
    // Intentamos obtener subcategorías para la categoría seleccionada
    const subCategories = {};
    Object.keys(SKUGenerator.SUBCATEGORY_CODES).forEach(subcat => {
      // Asignamos subcategorías a categorías (esto es una simplificación, deberías ajustarlo a tu lógica de negocio)
      if (formData.categoria === 'ELECTRONICA' && ['CELULARES', 'COMPUTADORAS', 'TABLETS', 'AUDIO', 'TELEVISORES'].includes(subcat)) {
        subCategories[subcat] = subcat.charAt(0) + subcat.slice(1).toLowerCase().replace('_', ' ');
      } else if (formData.categoria === 'ROPA' && ['CAMISETAS', 'PANTALONES', 'VESTIDOS', 'ABRIGOS', 'ROPA_INTERIOR'].includes(subcat)) {
        subCategories[subcat] = subcat.charAt(0) + subcat.slice(1).toLowerCase().replace('_', ' ');
      } else if (formData.categoria === 'CALZADO' && ['ZAPATOS', 'DEPORTIVOS', 'BOTAS', 'SANDALIAS'].includes(subcat)) {
        subCategories[subcat] = subcat.charAt(0) + subcat.slice(1).toLowerCase().replace('_', ' ');
      }
      // Añade más categorías y subcategorías según sea necesario
    });
    
    return Object.entries(subCategories).map(([value, label]) => ({ value, label }));
  };

  // Obtenemos los colores disponibles
  const colores = Object.keys(SKUGenerator.ATTRIBUTE_CODES)
    .filter(attr => ['BLANCO', 'NEGRO', 'ROJO', 'AZUL', 'VERDE', 'AMARILLO', 'GRIS', 'MARRON', 'ROSA', 'MORADO'].includes(attr))
    .map(color => ({
      value: color,
      label: color.charAt(0) + color.slice(1).toLowerCase()
    }));

  // Obtenemos los tamaños disponibles
  const tamaños = ['PEQUENO', 'MEDIANO', 'GRANDE', 'EXTRA_GRANDE'].map(tamaño => ({
    value: tamaño,
    label: tamaño.charAt(0) + tamaño.slice(1).toLowerCase().replace('_', ' ')
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
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
            {/* Campo SKU con toggle para modo manual/automático */}
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="sku" className={formErrors.sku ? "text-destructive" : ""}>
                  SKU
                </Label>
                {formMode === 'create' && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={toggleSkuMode}
                    className="h-6 text-xs"
                  >
                    {skuManual ? "Generar auto" : "Modo manual"}
                  </Button>
                )}
              </div>
              <Input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className={formErrors.sku ? "border-destructive" : ""}
                required
                readOnly={!skuManual}
              />
              {!skuManual && (
                <p className="text-xs text-muted-foreground">
                  El SKU se genera automáticamente basado en las características del producto.
                </p>
              )}
              {formErrors.sku && <p className="text-sm text-destructive">{formErrors.sku}</p>}
            </div>
            
            <FormField
              id="nombre"
              label="Nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              error={formErrors.nombre}
              required
            />
            
            {/* Categoría con Select */}
            <div className="grid gap-2">
              <Label htmlFor="categoria" className={formErrors.categoria ? "text-destructive" : ""}>
                Categoría
              </Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => handleSelectChange('categoria', value)}
              >
                <SelectTrigger className={formErrors.categoria ? "border-destructive" : ""}>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.categoria && <p className="text-sm text-destructive">{formErrors.categoria}</p>}
            </div>
            
            {/* Subcategoría con Select */}
            <div className="grid gap-2">
              <Label htmlFor="subcategoria" className={formErrors.subcategoria ? "text-destructive" : ""}>
                Subcategoría
              </Label>
              <Select
                value={formData.subcategoria}
                onValueChange={(value) => handleSelectChange('subcategoria', value)}
                disabled={!formData.categoria}
              >
                <SelectTrigger className={formErrors.subcategoria ? "border-destructive" : ""}>
                  <SelectValue placeholder="Seleccionar subcategoría" />
                </SelectTrigger>
                <SelectContent>
                  {getSubcategorias().map((subcat) => (
                    <SelectItem key={subcat.value} value={subcat.value}>
                      {subcat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.subcategoria && <p className="text-sm text-destructive">{formErrors.subcategoria}</p>}
            </div>
            
            {/* Atributos adicionales (color y tamaño) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Color */}
              <div className="grid gap-2">
                <Label htmlFor="color" className={formErrors.color ? "text-destructive" : ""}>
                  Color
                </Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => handleSelectChange('color', value)}
                >
                  <SelectTrigger className={formErrors.color ? "border-destructive" : ""}>
                    <SelectValue placeholder="Seleccionar color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colores.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.color && <p className="text-sm text-destructive">{formErrors.color}</p>}
              </div>
              
              {/* Tamaño */}
              <div className="grid gap-2">
                <Label htmlFor="tamaño" className={formErrors.tamaño ? "text-destructive" : ""}>
                  Tamaño
                </Label>
                <Select
                  value={formData.tamaño}
                  onValueChange={(value) => handleSelectChange('tamaño', value)}
                >
                  <SelectTrigger className={formErrors.tamaño ? "border-destructive" : ""}>
                    <SelectValue placeholder="Seleccionar tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    {tamaños.map((tamaño) => (
                      <SelectItem key={tamaño.value} value={tamaño.value}>
                        {tamaño.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.tamaño && <p className="text-sm text-destructive">{formErrors.tamaño}</p>}
              </div>
            </div>
            
            <FormField
              id="descripcion"
              label="Descripción"
              value={formData.descripcion}
              onChange={handleInputChange}
              error={formErrors.descripcion}
              required
              isTextarea
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