import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import ErrorAlert from './ErrorAlert';
import { SKUGenerator } from './SKUGenerator';
import { proveedorService, inventarioService, categoriaService } from '@/src/services/api';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useProductoToasts } from '@/src/hooks/useProductoToasts';

export default function ProductoForm({
  isOpen,
  onOpenChange,
  formMode,
  initialData,
  onSubmit,
}) {
  const router = useRouter();

  // Hook para toasts de productos
  const toasts = useProductoToasts();

  // Estado para el formulario
  const [formData, setFormData] = useState({
    sku: '',
    nombre: '',
    descripcion: '',
    categoria_id: '',
    precio_unitario: 0,
    proveedor_id: '',
    stock_minimo: 0,
    stock_inicial: 0,
    bodega_id: '',
  });

  // Estado para proveedores
  const [proveedores, setProveedores] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(false);
  const [proveedorError, setProveedorError] = useState(null);
  const [noProveedoresDisponibles, setNoProveedoresDisponibles] =
    useState(false);

  // Estado para bodegas
  const [bodegas, setBodegas] = useState([]);
  const [loadingBodegas, setLoadingBodegas] = useState(false);

  // Estado para categorías
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [categoriaError, setCategoriaError] = useState(null);

  // Estado para errores de validación y errores generales
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null);
  const [skuManual, setSkuManual] = useState(false);

  // Función helper para manejar valores de Select
  const getSelectValue = value => {
    if (value === null || value === undefined) return '';
    return typeof value === 'string' ? value : value.toString();
  };

  // Cargar proveedores, bodegas y categorías al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      // Cargar proveedores
      setLoadingProveedores(true);
      setProveedorError(null);
      try {
        const proveedoresData = await proveedorService.getProveedores();
        setProveedores(proveedoresData);

        if (proveedoresData.length === 0) {
          setNoProveedoresDisponibles(true);
        } else {
          setNoProveedoresDisponibles(false);
        }
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
        setProveedorError('No se pudieron cargar los proveedores');
      } finally {
        setLoadingProveedores(false);
      }

      // Cargar bodegas
      setLoadingBodegas(true);
      try {
        const bodegasData = await inventarioService.getBodegas();
        console.log('Bodegas cargadas:', bodegasData); // DEBUG
        setBodegas(bodegasData);
      } catch (error) {
        console.error('Error al cargar bodegas:', error);
      } finally {
        setLoadingBodegas(false);
      }

      // Cargar categorías
      setLoadingCategorias(true);
      setCategoriaError(null);
      try {
        const categoriasData = await categoriaService.getActivas();
        console.log('Categorías cargadas:', categoriasData); // DEBUG
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        setCategoriaError('No se pudieron cargar las categorías');
      } finally {
        setLoadingCategorias(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Actualizar el formulario cuando cambia el modo, los datos iniciales o se cargan proveedores/bodegas/categorías
  useEffect(() => {
    console.log('useEffect - bodegas disponibles:', bodegas); // DEBUG
    console.log('useEffect - categorías disponibles:', categorias); // DEBUG

    if (formMode === 'create' && bodegas.length > 0 && !formData.bodega_id) {
      // Si estamos en modo crear y hay bodegas pero no hay bodega seleccionada
      setFormData(prev => ({
        ...prev,
        bodega_id: bodegas[0].id.toString(),
      }));
    }

    if (formMode === 'create') {
      setFormData(prev => ({
        ...prev,
        sku: '',
        nombre: '',
        descripcion: '',
        categoria_id: categorias.length > 0 ? categorias[0].id.toString() : '',
        precio_unitario: 0,
        proveedor_id:
          proveedores.length > 0 ? proveedores[0].id.toString() : '',
        stock_minimo: 0,
        stock_inicial: 0,
        bodega_id:
          prev.bodega_id ||
          (bodegas.length > 0 ? bodegas[0].id.toString() : ''),
      }));
      setSkuManual(false);
    } else if (initialData) {
      setFormData({
        sku: initialData.sku || '',
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || '',
        categoria_id: initialData.categoria_id
          ? initialData.categoria_id.toString()
          : categorias.length > 0 ? categorias[0].id.toString() : '',
        precio_unitario:
          typeof initialData.precio_unitario === 'number'
            ? initialData.precio_unitario
            : 0,
        proveedor_id: initialData.proveedor_id
          ? initialData.proveedor_id.toString()
          : '',
        stock_minimo:
          typeof initialData.stock_minimo === 'number'
            ? initialData.stock_minimo
            : 0,
        stock_actual:
          typeof initialData.stock_actual === 'number'
            ? initialData.stock_actual
            : 0,
        bodega_id: initialData.bodega_id
          ? initialData.bodega_id.toString()
          : bodegas.length > 0
          ? bodegas[0].id.toString()
          : '',
      });
      setSkuManual(true);
    }
    setFormErrors({});
    setError(null);
  }, [formMode, initialData, isOpen, proveedores, bodegas, categorias]);

  // Generar SKU automáticamente cuando se modifican los campos relevantes
  useEffect(() => {
    if (
      !skuManual &&
      formMode === 'create' &&
      formData.nombre &&
      formData.categoria_id
    ) {
      // Obtener el nombre de la categoría seleccionada
      const categoriaSeleccionada = categorias.find(cat => cat.id.toString() === formData.categoria_id);
      const nombreCategoria = categoriaSeleccionada ? categoriaSeleccionada.nombre : 'OTROS';

      const tempProduct = {
        ...formData,
        categoria: nombreCategoria, // Usar el nombre real de la categoría
        id: Date.now() % 1000000,
      };

      const generatedSKU = SKUGenerator.generateSKU(tempProduct);
      setFormData(prev => ({
        ...prev,
        sku: generatedSKU,
      }));
    }
  }, [
    formData.nombre,
    formData.categoria,
    formData.subcategoria,
    formData.color,
    formData.tamaño,
    skuManual,
    formMode,
    categorias,
  ]);

  const handleInputChange = e => {
    const { name, value } = e.target;

    let processedValue;
    if (
      [
        'precio_unitario',
        'stock_minimo',
        'stock_inicial',
        'stock_actual',
      ].includes(name)
    ) {
      processedValue = value === '' ? 0 : parseFloat(value) || 0;
    } else {
      processedValue = value;
    }

    setFormData({
      ...formData,
      [name]: processedValue,
    });

    if (name === 'sku') {
      setSkuManual(true);
    }

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const toggleSkuMode = () => {
    setSkuManual(!skuManual);

    if (skuManual && formData.nombre && formData.categoria) {
      // Obtener el nombre de la categoría seleccionada
      const categoriaSeleccionada = categorias.find(cat => cat.id.toString() === formData.categoria);
      const nombreCategoria = categoriaSeleccionada ? categoriaSeleccionada.nombre : 'OTROS';

      const tempProduct = {
        ...formData,
        categoria: nombreCategoria, // Usar el nombre real de la categoría
        id: Date.now() % 1000000,
      };

      const generatedSKU = SKUGenerator.generateSKU(tempProduct);
      setFormData(prev => ({
        ...prev,
        sku: generatedSKU,
      }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validaciones
    if (!formData.categoria_id) {
      const errorMessage = 'Debes seleccionar una categoría';
      setFormErrors({
        ...formErrors,
        categoria_id: errorMessage,
      });
      toasts.showValidationError('Categoría', errorMessage);
      return;
    }

    if (!formData.proveedor_id) {
      const errorMessage = 'Debes seleccionar un proveedor';
      setFormErrors({
        ...formErrors,
        proveedor_id: errorMessage,
      });
      toasts.showValidationError('Proveedor', errorMessage);
      return;
    }

    if (!formData.bodega_id) {
      const errorMessage = 'Debes seleccionar una bodega';
      setFormErrors({
        ...formErrors,
        bodega_id: errorMessage,
      });
      toasts.showValidationError('Bodega', errorMessage);
      return;
    }

    // Limpiar formData para enviar solo los campos necesarios
    const { categoria, ...cleanFormData } = formData; // Remover categoria del formData

    const productoData = {
      ...cleanFormData,
      precio_unitario: parseFloat(formData.precio_unitario) || 0,
      proveedor_id: parseInt(formData.proveedor_id) || 0,
      bodega_id: parseInt(formData.bodega_id) || 0,
      stock_minimo: parseInt(formData.stock_minimo) || 0,
      stock_inicial: parseInt(formData.stock_inicial) || 0,
      categoria_id: parseInt(formData.categoria_id) || 0,
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


  // Si no hay proveedores disponibles, mostrar alerta
  if (noProveedoresDisponibles && !loadingProveedores) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-[650px]'>
          <DialogHeader>
            <DialogTitle>
              {formMode === 'create'
                ? 'Crear Nuevo Producto'
                : 'Editar Producto'}
            </DialogTitle>
          </DialogHeader>

          <Alert variant='destructive' className='my-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>No se puede crear un producto</AlertTitle>
            <AlertDescription>
              No hay proveedores registrados en el sistema. Debes crear al menos
              un proveedor antes de poder añadir productos.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
            <Button
              type='button'
              onClick={() => {
                onOpenChange(false);
                router.push('/dashboard/proveedores');
              }}
            >
              Ir a Proveedores
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[850px] max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {formMode === 'create' ? 'Crear Nuevo Producto' : 'Editar Producto'}
          </DialogTitle>
          <DialogDescription>
            Completa los campos para{' '}
            {formMode === 'create' ? 'crear un nuevo' : 'actualizar el'}{' '}
            producto
          </DialogDescription>
        </DialogHeader>

        {error && <ErrorAlert error={error} className='my-2' />}

        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Columna 1: SKU, Nombre y Precio */}
              <div className='space-y-4'>
                <div className='grid gap-2'>
                  <div className='flex justify-between items-center'>
                    <Label
                      htmlFor='sku'
                      className={formErrors.sku ? 'text-destructive' : ''}
                    >
                      SKU
                    </Label>
                    {formMode === 'create' && (
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={toggleSkuMode}
                        className='h-6 text-xs'
                      >
                        {skuManual ? 'Generar auto' : 'Modo manual'}
                      </Button>
                    )}
                  </div>
                  <Input
                    id='sku'
                    name='sku'
                    value={formData.sku}
                    onChange={handleInputChange}
                    className={formErrors.sku ? 'border-destructive' : ''}
                    required
                    readOnly={!skuManual}
                  />
                  {!skuManual && (
                    <p className='text-xs text-muted-foreground'>
                      El SKU se genera automáticamente basado en las
                      características del producto.
                    </p>
                  )}
                  {formErrors.sku && (
                    <p className='text-sm text-destructive'>{formErrors.sku}</p>
                  )}
                </div>

                <FormField
                  id='nombre'
                  label='Nombre'
                  value={formData.nombre}
                  onChange={handleInputChange}
                  error={formErrors.nombre}
                  required
                />

                <FormField
                  id='precio_unitario'
                  label='Precio Unitario'
                  value={formData.precio_unitario}
                  onChange={handleInputChange}
                  error={formErrors.precio_unitario}
                  type='number'
                  min='0'
                  step='0.01'
                  required
                />
              </div>

              {/* Columna 2: Categorías, Proveedor y Bodega */}
              <div className='space-y-4'>
                <div className='grid gap-2'>
                  <Label
                    htmlFor='categoria_id'
                    className={formErrors.categoria_id ? 'text-destructive' : ''}
                  >
                    Categoría <span className='text-destructive'>*</span>
                  </Label>
                  <Select
                    value={formData.categoria_id}
                    onValueChange={value =>
                      handleSelectChange('categoria_id', value)
                    }
                    disabled={loadingCategorias}
                  >
                    <SelectTrigger
                      className={
                        formErrors.categoria_id ? 'border-destructive' : ''
                      }
                    >
                      <SelectValue placeholder='Seleccionar categoría' />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCategorias ? (
                        <SelectItem value='loading' disabled>
                          <div className='flex items-center'>
                            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                            Cargando categorías...
                          </div>
                        </SelectItem>
                      ) : categoriaError ? (
                        <SelectItem value='error' disabled>
                          Error al cargar categorías
                        </SelectItem>
                      ) : categorias.length > 0 ? (
                        categorias.map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.nombre} {cat.codigo ? `(${cat.codigo})` : ''}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value='no-categorias' disabled>
                          No hay categorías disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {formErrors.categoria && (
                    <p className='text-sm text-destructive'>
                      {formErrors.categoria}
                    </p>
                  )}
                  {categoriaError && (
                    <p className='text-xs text-destructive'>{categoriaError}</p>
                  )}
                </div>


                <div className='grid gap-2'>
                  <Label
                    htmlFor='proveedor_id'
                    className={
                      formErrors.proveedor_id ? 'text-destructive' : ''
                    }
                  >
                    Proveedor <span className='text-destructive'>*</span>
                  </Label>
                  <Select
                    value={getSelectValue(formData.proveedor_id)}
                    onValueChange={value =>
                      handleSelectChange('proveedor_id', value)
                    }
                    disabled={loadingProveedores}
                  >
                    <SelectTrigger
                      className={
                        formErrors.proveedor_id ? 'border-destructive' : ''
                      }
                    >
                      <SelectValue placeholder='Seleccionar proveedor' />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingProveedores ? (
                        <SelectItem value='loading' disabled>
                          <div className='flex items-center'>
                            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                            Cargando proveedores...
                          </div>
                        </SelectItem>
                      ) : proveedorError ? (
                        <SelectItem value='error' disabled>
                          Error al cargar proveedores
                        </SelectItem>
                      ) : proveedores.length > 0 ? (
                        proveedores.map(proveedor => (
                          <SelectItem
                            key={proveedor.id}
                            value={proveedor.id.toString()}
                          >
                            {proveedor.nombre}{' '}
                            {proveedor.codigo ? `(${proveedor.codigo})` : ''}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value='no-proveedores' disabled>
                          No hay proveedores disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {formErrors.proveedor_id && (
                    <p className='text-sm text-destructive'>
                      {formErrors.proveedor_id}
                    </p>
                  )}
                  {proveedorError && (
                    <p className='text-xs text-destructive'>{proveedorError}</p>
                  )}
                </div>

                <div className='grid gap-2'>
                  <Label
                    htmlFor='bodega_id'
                    className={formErrors.bodega_id ? 'text-destructive' : ''}
                  >
                    Bodega <span className='text-destructive'>*</span>
                  </Label>
                  <Select
                    value={getSelectValue(formData.bodega_id)}
                    onValueChange={value =>
                      handleSelectChange('bodega_id', value)
                    }
                    disabled={loadingBodegas}
                  >
                    <SelectTrigger
                      className={
                        formErrors.bodega_id ? 'border-destructive' : ''
                      }
                    >
                      <SelectValue placeholder='Seleccionar bodega' />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingBodegas ? (
                        <SelectItem value='loading' disabled>
                          <div className='flex items-center'>
                            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                            Cargando bodegas...
                          </div>
                        </SelectItem>
                      ) : bodegas.length > 0 ? (
                        bodegas.map(bodega => (
                          <SelectItem
                            key={bodega.id}
                            value={bodega.id.toString()}
                          >
                            {bodega.nombre} ({bodega.codigo})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value='no-bodegas' disabled>
                          No hay bodegas disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {formErrors.bodega_id && (
                    <p className='text-sm text-destructive'>
                      {formErrors.bodega_id}
                    </p>
                  )}
                </div>
              </div>

              {/* Columna 3: Stock */}
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    id='stock_minimo'
                    label='Stock Mínimo'
                    value={formData.stock_minimo}
                    onChange={handleInputChange}
                    error={formErrors.stock_minimo}
                    type='number'
                    min='0'
                    required
                  />

                  {formMode === 'create' ? (
                    <FormField
                      id='stock_inicial'
                      label='Stock Inicial'
                      value={formData.stock_inicial}
                      onChange={handleInputChange}
                      error={formErrors.stock_inicial}
                      type='number'
                      min='0'
                      required
                    />
                  ) : (
                    <FormField
                      id='stock_actual'
                      label='Stock Actual'
                      value={formData.stock_actual}
                      onChange={handleInputChange}
                      error={formErrors.stock_actual}
                      type='number'
                      min='0'
                      required
                      disabled={true} // <--- Deshabilita el campo en modo edición
                    />
                  )}
                </div>
              </div>
            </div>

            <FormField
              id='descripcion'
              label='Descripción'
              value={formData.descripcion}
              onChange={handleInputChange}
              error={formErrors.descripcion}
              required
              isTextarea
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type='submit'>
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
  type = 'text',
  min,
  step,
  isTextarea = false,
  disabled = false,
}) {
  const Component = isTextarea ? Textarea : Input;
  const tooltip =
    disabled && id === 'stock_actual'
      ? 'El stock solo se puede modificar desde el módulo de inventario'
      : undefined;

  const inputField = (
    <Component
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={onChange}
      className={error ? 'border-destructive' : ''}
      required={required}
      min={min}
      step={step}
      disabled={disabled}
    />
  );

  return (
    <div className='grid gap-2'>
      <Label htmlFor={id} className={error ? 'text-destructive' : ''}>
        {label} {required && <span className='text-destructive'>*</span>}
      </Label>
      {tooltip ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>{inputField}</span>
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        inputField
      )}
      {error && <p className='text-sm text-destructive'>{error}</p>}
    </div>
  );
}
