# Sección de Categorías

Esta sección permite gestionar las categorías de productos del sistema.

## Estructura de Archivos

```
categorias/
├── components/
│   ├── CategoriaDashboard.tsx    # Componente principal del dashboard
│   ├── CategoriaForm.tsx         # Formulario para crear/editar categorías
│   ├── CategoriaTable.tsx        # Tabla para mostrar categorías
│   ├── CategoriaFilters.tsx      # Filtros de búsqueda
│   ├── CategoriaStats.tsx        # Estadísticas de categorías
│   └── DeleteCategoriaDialog.tsx # Diálogo de confirmación para eliminar
├── page.tsx                      # Página principal
├── types.ts                      # Tipos específicos de la sección
└── README.md                     # Este archivo
```

## Funcionalidades

### ✅ CRUD Completo
- **Crear** nuevas categorías
- **Leer** lista de categorías con filtros
- **Actualizar** categorías existentes
- **Eliminar** categorías (con validación de productos asociados)

### ✅ Características
- Búsqueda por nombre, código o descripción
- Filtros en tiempo real
- Estadísticas de categorías (total, activas, inactivas)
- Validación de formularios
- Estados de carga y error
- Confirmación antes de eliminar
- Interfaz responsive

### ✅ Validaciones
- Nombre único
- Código único
- Campos requeridos
- No eliminar si tiene productos asociados

## Uso

### Navegación
Accede a la sección desde el menú lateral: **Dashboard > Categorías**

### Crear Categoría
1. Haz clic en "Nueva Categoría"
2. Completa el formulario:
   - **Nombre**: Nombre de la categoría (requerido)
   - **Código**: Código único (requerido)
   - **Descripción**: Descripción opcional
   - **Activa**: Estado de la categoría
3. Haz clic en "Crear"

### Editar Categoría
1. En la tabla, haz clic en el menú de acciones (⋮)
2. Selecciona "Editar"
3. Modifica los campos necesarios
4. Haz clic en "Actualizar"

### Eliminar Categoría
1. En la tabla, haz clic en el menú de acciones (⋮)
2. Selecciona "Eliminar"
3. Confirma la eliminación

**Nota**: No se puede eliminar una categoría que tenga productos asociados.

## API Endpoints

- `GET /categorias/` - Listar categorías
- `GET /categorias/activas` - Listar categorías activas
- `GET /categorias/{id}` - Obtener categoría por ID
- `POST /categorias/` - Crear categoría
- `PUT /categorias/{id}` - Actualizar categoría
- `DELETE /categorias/{id}` - Eliminar categoría
- `GET /categorias/{id}/productos/count` - Contar productos de una categoría

## Hooks Utilizados

- `useCategorias()` - Hook principal para gestión de categorías
- `useCategoriasActivas()` - Hook para obtener solo categorías activas

## Componentes UI Utilizados

- Button, Input, Label, Textarea
- Card, Badge, Table
- Alert, AlertDialog
- DropdownMenu, Checkbox
