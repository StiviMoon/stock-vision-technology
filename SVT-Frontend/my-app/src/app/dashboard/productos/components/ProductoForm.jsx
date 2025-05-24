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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Settings, Loader2, Package, ShoppingCart, Utensils, Car, Sparkles, Book, Home, Dumbbell } from "lucide-react";
import ErrorAlert from './ErrorAlert';
import { UniversalSKUGenerator } from './SKUGenerator';
import { proveedorService } from '../../../../services/api';
import { useRouter } from 'next/navigation';

export default function UniversalProductForm({ 
  isOpen, 
  onOpenChange, 
  formMode, 
  initialData, 
  onSubmit,
  businessType = null, // Tipo de negocio configurado o null para detección automática
  existingProducts = [] // Productos existentes para detectar tipo de negocio
}) {
  // Estado principal del formulario
  const [formData, setFormData] = useState({
    sku: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    precio_unitario: 0,
    proveedor_id: '',
    stock_minimo: 0,
    stock_inicial: 0,
    // Campos dinámicos que se añaden según el tipo de negocio
  });

  // Estado para configuración dinámica
  const [currentBusinessType, setCurrentBusinessType] = useState(businessType);
  const [businessConfig, setBusinessConfig] = useState(null);
  const [dynamicFields, setDynamicFields] = useState({});
  
  // Estados originales (mantener funcionalidad existente)
  const [proveedores, setProveedores] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(false);
  const [proveedorError, setProveedorError] = useState(null);
  const [noProveedoresDisponibles, setNoProveedoresDisponibles] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null);
  const [skuManual, setSkuManual] = useState(false);
  const [showBusinessTypeSelector, setShowBusinessTypeSelector] = useState(false);

  // Detectar tipo de negocio automáticamente
  useEffect(() => {
    if (!currentBusinessType) {
      const detectedType = UniversalSKUGenerator.detectBusinessType(existingProducts);
      setCurrentBusinessType(detectedType);
    }
  }, [existingProducts, currentBusinessType]);

  // Configurar campos dinámicos según tipo de negocio
  useEffect(() => {
    if (currentBusinessType) {
      const config = UniversalSKUGenerator.getBusinessConfig(currentBusinessType);
      setBusinessConfig(config);
      
      // Inicializar campos dinámicos
      const newDynamicFields = {};
      config.attributes.forEach(attr => {
        newDynamicFields[attr] = '';
      });
      setDynamicFields(newDynamicFields);
    }
  }, [currentBusinessType]);

  // Cargar proveedores (mantener lógica original)
  useEffect(() => {
    const fetchProveedores = async () => {
      setLoadingProveedores(true);
      setProveedorError(null);
      try {
        const data = await proveedorService.getProveedores();
        setProveedores(data);
        setNoProveedoresDisponibles(data.length === 0);
      } catch (error) {
        console.error("Error al cargar proveedores:", error);
        setProveedorError("No se pudieron cargar los proveedores");
      } finally {
        setLoadingProveedores(false);
      }
    };

    fetchProveedores();
  }, []);

  // Resetear formulario según modo
  useEffect(() => {
    if (formMode === 'create') {
      const newFormData = {
        sku: '',
        nombre: '',
        descripcion: '',
        categoria: '',
        precio_unitario: 0,
        proveedor_id: proveedores.length > 0 ? proveedores[0].id.toString() : '',
        stock_minimo: 0,
        stock_inicial: 0
      };
      
      // Añadir campos dinámicos
      if (businessConfig) {
        businessConfig.attributes.forEach(attr => {
          newFormData[attr] = '';
        });
      }
      
      setFormData(newFormData);
      setSkuManual(false);
    } else if (initialData) {
      const newFormData = {
        sku: initialData.sku || '',
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || '',
        categoria: initialData.categoria || '',
        precio_unitario: typeof initialData.precio_unitario === 'number' ? initialData.precio_unitario : 0,
        proveedor_id: initialData.proveedor_id ? initialData.proveedor_id.toString() : '',
        stock_minimo: typeof initialData.stock_minimo === 'number' ? initialData.stock_minimo : 0,
        stock_actual: typeof initialData.stock_actual === 'number' ? initialData.stock_actual : 0
      };
      
      // Añadir campos dinámicos del producto existente
      if (businessConfig) {
        businessConfig.attributes.forEach(attr => {
          newFormData[attr] = initialData[attr] || '';
        });
      }
      
      setFormData(newFormData);
      setSkuManual(true);
    }
    setFormErrors({});
    setError(null);
  }, [formMode, initialData, isOpen, proveedores, businessConfig]);

  // Generar SKU automáticamente
  useEffect(() => {
    if (!skuManual && formMode === 'create' && formData.categoria && businessConfig) {
      // Verificar campos requeridos según configuración
      const hasRequiredFields = businessConfig.required.every(field => formData[field]);
      
      if (hasRequiredFields) {
        const tempProduct = {
          ...formData,
          ...dynamicFields,
          id: Date.now() % 1000000
        };
        
        const generatedSKU = UniversalSKUGenerator.generateSKU(tempProduct, currentBusinessType);
        setFormData(prev => ({
          ...prev,
          sku: generatedSKU
        }));
      }
    }
  }, [formData, dynamicFields, skuManual, formMode, businessConfig, currentBusinessType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue;
    if (['precio_unitario', 'stock_minimo', 'stock_inicial', 'stock_actual'].includes(name)) {
      processedValue = value === '' ? 0 : parseFloat(value) || 0;
    } else {
      processedValue = value;
    }
    
    // Actualizar en formData o dynamicFields según corresponda
    if (['sku', 'nombre', 'descripcion', 'categoria', 'precio_unitario', 'proveedor_id', 'stock_minimo', 'stock_inicial', 'stock_actual'].includes(name)) {
      setFormData({
        ...formData,
        [name]: processedValue
      });
    } else {
      setDynamicFields({
        ...dynamicFields,
        [name]: processedValue
      });
    }
    
    if (name === 'sku') {
      setSkuManual(true);
    }
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const handleSelectChange = (name, value) => {
    // Similar lógica para selects
    if (['categoria', 'proveedor_id'].includes(name)) {
      setFormData({
        ...formData,
        [name]: value
      });
    } else {
      setDynamicFields({
        ...dynamicFields,
        [name]: value
      });
    }
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const toggleSkuMode = () => {
    setSkuManual(!skuManual);
    
    if (skuManual && formData.categoria && businessConfig) {
      const tempProduct = {
        ...formData,
        ...dynamicFields,
        id: Date.now() % 1000000
      };
      
      const generatedSKU = UniversalSKUGenerator.generateSKU(tempProduct, currentBusinessType);
      setFormData(prev => ({
        ...prev,
        sku: generatedSKU
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.proveedor_id) {
      setFormErrors({
        ...formErrors,
        proveedor_id: "Debes seleccionar un proveedor"
      });
      return;
    }
    
    // Combinar datos estáticos con dinámicos
    const productoData = {
      ...formData,
      ...dynamicFields,
      precio_unitario: parseFloat(formData.precio_unitario) || 0,
      proveedor_id: parseInt(formData.proveedor_id) || 0,
      stock_minimo: parseInt(formData.stock_minimo) || 0,
      stock_inicial: parseInt(formData.stock_inicial) || 0,
      business_type: currentBusinessType // Guardar tipo de negocio
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

  const getBusinessIcon = (type) => {
    const icons = {
      ELECTRONICS: <Package className="h-4 w-4" />,
      CLOTHING: <ShoppingCart className="h-4 w-4" />,
      FOOD: <Utensils className="h-4 w-4" />,
      AUTOMOTIVE: <Car className="h-4 w-4" />,
      BEAUTY: <Sparkles className="h-4 w-4" />,
      BOOKS: <Book className="h-4 w-4" />,
      FURNITURE: <Home className="h-4 w-4" />,
      SPORTS: <Dumbbell className="h-4 w-4" />,
      GENERIC: <Package className="h-4 w-4" />
    };
    return icons[type] || icons.GENERIC;
  };

  const getFieldOptions = (fieldName) => {
    switch (fieldName) {
      case 'color':
        return Object.entries(UniversalSKUGenerator.UNIVERSAL_ATTRIBUTES.colors).map(([key, value]) => ({
          value: key,
          label: key.charAt(0) + key.slice(1).toLowerCase()
        }));
      
      case 'talla':
      case 'tamaño':
        return Object.entries(UniversalSKUGenerator.UNIVERSAL_ATTRIBUTES.sizes).map(([key, value]) => ({
          value: key,
          label: key
        }));
      
      case 'material':
        return Object.entries(UniversalSKUGenerator.UNIVERSAL_ATTRIBUTES.materials).map(([key, value]) => ({
          value: key,
          label: key.charAt(0) + key.slice(1).toLowerCase()
        }));
      
      case 'presentacion':
        return Object.entries(UniversalSKUGenerator.UNIVERSAL_ATTRIBUTES.presentations).map(([key, value]) => ({
          value: key,
          label: key.charAt(0) + key.slice(1).toLowerCase()
        }));
      
      case 'genero':
        return [
          { value: 'HOMBRE', label: 'Hombre' },
          { value: 'MUJER', label: 'Mujer' },
          { value: 'UNISEX', label: 'Unisex' },
          { value: 'NIÑO', label: 'Niño' },
          { value: 'NIÑA', label: 'Niña' }
        ];
      
      default:
        return null;
    }
  };

  const renderDynamicField = (fieldName) => {
    const options = getFieldOptions(fieldName);
    const value = dynamicFields[fieldName] || '';
    const isRequired = businessConfig?.required.includes(fieldName);
    
    if (options) {
      // Campo select
      return (
        <div key={fieldName} className="grid gap-2">
          <Label htmlFor={fieldName} className={formErrors[fieldName] ? "text-destructive" : ""}>
            {fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace('_', ' ')}
            {isRequired && <span className="text-destructive"> *</span>}
          </Label>
          <Select
            value={value}
            onValueChange={(val) => handleSelectChange(fieldName, val)}
          >
            <SelectTrigger className={formErrors[fieldName] ? "border-destructive" : ""}>
              <SelectValue placeholder={`Seleccionar ${fieldName}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors[fieldName] && <p className="text-sm text-destructive">{formErrors[fieldName]}</p>}
        </div>
      );
    } else {
      // Campo input
      return (
        <FormField
          key={fieldName}
          id={fieldName}
          label={fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace('_', ' ')}
          value={value}
          onChange={handleInputChange}
          error={formErrors[fieldName]}
          required={isRequired}
          placeholder={`Ingrese ${fieldName}`}
        />
      );
    }
  };

  const router = useRouter();

  // Manejo de caso sin proveedores
  if (noProveedoresDisponibles && !loadingProveedores) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'create' ? 'Crear Nuevo Producto' : 'Editar Producto'}
            </DialogTitle>
          </DialogHeader>
          
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No se puede crear un producto</AlertTitle>
            <AlertDescription>
              No hay proveedores registrados en el sistema. Debes crear al menos un proveedor antes de poder añadir productos.
            </AlertDescription>
          </Alert>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            <Button type="button" onClick={() => {
              onOpenChange(false);
              router.push('/dashboard/proveedores');
            }}>
              Ir a Proveedores
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (!businessConfig) {
    return null; // Loading state
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[950px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getBusinessIcon(currentBusinessType)}
            {formMode === 'create' ? 'Crear Nuevo Producto' : 'Editar Producto'}
            <Badge variant="secondary" className="ml-2">
              {businessConfig.name}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Completa los campos para {formMode === 'create' ? 'crear un nuevo' : 'actualizar el'} producto.
            {!businessType && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowBusinessTypeSelector(!showBusinessTypeSelector)}
                className="ml-2"
              >
                <Settings className="h-4 w-4 mr-1" />
                Cambiar tipo de negocio
              </Button>
            )}
          </DialogDescription>
        </DialogHeader>

        {showBusinessTypeSelector && (
          <div className="grid gap-2 p-4 border rounded-lg bg-muted/50">
            <Label>Tipo de Negocio</Label>
            <Select
              value={currentBusinessType}
              onValueChange={(value) => {
                setCurrentBusinessType(value);
                setShowBusinessTypeSelector(false);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo de negocio" />
              </SelectTrigger>
              <SelectContent>
                {UniversalSKUGenerator.getAllBusinessTypes().map((business) => (
                  <SelectItem key={business.value} value={business.value}>
                    <div className="flex items-center gap-2">
                      {getBusinessIcon(business.value)}
                      {business.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {error && <ErrorAlert error={error} className="my-2" />}
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Fila 1: Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* SKU */}
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
                    SKU generado automáticamente según {businessConfig.name.toLowerCase()}.
                  </p>
                )}
                {formErrors.sku && <p className="text-sm text-destructive">{formErrors.sku}</p>}
              </div>

              {/* Nombre */}
              <FormField
                id="nombre"
                label="Nombre del Producto"
                value={formData.nombre}
                onChange={handleInputChange}
                error={formErrors.nombre}
                required
              />

              {/* Precio */}
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
            </div>

            {/* Fila 2: Categoría y campos dinámicos principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Categoría */}
              <div className="grid gap-2">
                <Label htmlFor="categoria" className={formErrors.categoria ? "text-destructive" : ""}>
                  Categoría <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => handleSelectChange('categoria', value)}
                >
                  <SelectTrigger className={formErrors.categoria ? "border-destructive" : ""}>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(businessConfig.categories).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.categoria && <p className="text-sm text-destructive">{formErrors.categoria}</p>}
              </div>

              {/* Campos dinámicos principales (primeros 3) */}
              {businessConfig.attributes.slice(0, 3).map(attr => renderDynamicField(attr))}
            </div>

            {/* Fila 3: Campos dinámicos adicionales */}
            {businessConfig.attributes.length > 3 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {businessConfig.attributes.slice(3).map(attr => renderDynamicField(attr))}
              </div>
            )}

            {/* Fila 4: Proveedor y Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Proveedor */}
              <div className="grid gap-2">
                <Label htmlFor="proveedor_id" className={formErrors.proveedor_id ? "text-destructive" : ""}>
                  Proveedor <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.proveedor_id.toString()}
                  onValueChange={(value) => handleSelectChange('proveedor_id', value)}
                  disabled={loadingProveedores}
                >
                  <SelectTrigger className={formErrors.proveedor_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProveedores ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cargando proveedores...
                        </div>
                      </SelectItem>
                    ) : proveedorError ? (
                      <SelectItem value="error" disabled>
                        Error al cargar proveedores
                      </SelectItem>
                    ) : proveedores.length > 0 ? (
                      proveedores.map((proveedor) => (
                        <SelectItem key={proveedor.id} value={proveedor.id.toString()}>
                          {proveedor.nombre} {proveedor.codigo ? `(${proveedor.codigo})` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No hay proveedores disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {formErrors.proveedor_id && <p className="text-sm text-destructive">{formErrors.proveedor_id}</p>}
              </div>

              {/* Stock Mínimo */}
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
              
              {/* Stock Inicial/Actual */}
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
            
            {/* Descripción a ancho completo */}
            <FormField
              id="descripcion"
              label="Descripción"
              value={formData.descripcion}
              onChange={handleInputChange}
              error={formErrors.descripcion}
              required
              isTextarea
              placeholder="Describe las características del producto..."
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {formMode === 'create' ? 'Crear Producto' : 'Actualizar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Componente auxiliar para campos de formulario (mantener igual)
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
  isTextarea = false,
  placeholder = ""
}) {
  const Component = isTextarea ? Textarea : Input;
  
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className={error ? "text-destructive" : ""}>
        {label} {required && <span className="text-destructive">*</span>}
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
        placeholder={placeholder}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}