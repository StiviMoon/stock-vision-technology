# 📊 Diagrama UML - Esquema de Base de Datos SVT

## 🎯 Diagrama de Entidad-Relación Principal

```mermaid
erDiagram
    usuarios {
        int id PK
        string email UK
        string hashed_password
        enum rol
        string nombre
        string apellido
        boolean activo
        datetime fecha_creacion
        datetime fecha_actualizacion
    }

    categorias {
        int id PK
        string nombre UK
        string codigo UK
        text descripcion
        boolean activa
        datetime fecha_creacion
        datetime fecha_actualizacion
    }

    proveedores {
        int id PK
        string nombre
        string codigo UK
        string contacto
        string telefono
        string email
        text direccion
    }

    bodegas {
        int id PK
        string nombre UK
        string codigo UK
        text direccion
        string encargado
        string telefono
        boolean activa
        datetime fecha_creacion
    }

    productos {
        int id PK
        string sku UK
        string nombre
        text descripcion
        int categoria_id FK
        string categoria_nombre
        float precio_unitario
        int proveedor_id FK
        int stock_actual
        int stock_minimo
        datetime fecha_creacion
        datetime fecha_actualizacion
    }

    stock_bodega {
        int id PK
        int producto_id FK
        int bodega_id FK
        int cantidad
        string ubicacion
    }

    movimientos_inventario {
        int id PK
        int producto_id FK
        enum tipo_movimiento
        int cantidad
        enum motivo
        text observaciones
        string documento_referencia
        int usuario_id FK
        datetime fecha_movimiento
        int stock_anterior
        int stock_posterior
        int bodega_origen_id FK
        int bodega_destino_id FK
    }

    categorias ||--o{ productos : "1:N"
    proveedores ||--o{ productos : "1:N"
    productos ||--o{ stock_bodega : "1:N"
    bodegas ||--o{ stock_bodega : "1:N"
    productos ||--o{ movimientos_inventario : "1:N"
    usuarios ||--o{ movimientos_inventario : "1:N"
    bodegas ||--o{ movimientos_inventario : "1:N origen"
    bodegas ||--o{ movimientos_inventario : "1:N destino"
```

## 📋 Enums del Sistema

### **🎭 UserRole**
- `ADMIN` - Administrador con acceso completo
- `USUARIO` - Usuario regular con permisos limitados
- `INVITADO` - Usuario invitado con acceso de solo lectura

### **🔄 TipoMovimiento**
- `ENTRADA` - Entrada de productos al inventario
- `SALIDA` - Salida de productos del inventario
- `AJUSTE_POSITIVO` - Ajuste que aumenta el stock
- `AJUSTE_NEGATIVO` - Ajuste que reduce el stock
- `TRANSFERENCIA_ENTRADA` - Transferencia recibida
- `TRANSFERENCIA_SALIDA` - Transferencia enviada
- `INVENTARIO_INICIAL` - Inventario inicial del sistema
- `INVENTARIO_FISICO` - Conteo físico de inventario

### **📝 MotivoMovimiento**
- `COMPRA` - Compra de productos
- `VENTA` - Venta de productos
- `DEVOLUCION_CLIENTE` - Devolución de cliente
- `DEVOLUCION_PROVEEDOR` - Devolución a proveedor
- `AJUSTE_STOCK` - Ajuste manual de stock
- `CONTEO_FISICO` - Conteo físico
- `PRODUCTO_DANADO` - Producto dañado
- `PRODUCTO_VENCIDO` - Producto vencido
- `ERROR_SISTEMA` - Error del sistema
- `ROBO_PERDIDA` - Robo o pérdida
- `TRANSFERENCIA` - Transferencia entre bodegas
- `OTRO` - Otros motivos

## 🔄 Diagrama de Flujo de Relaciones

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor': '#ff6b6b', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff6b6b', 'lineColor': '#ffffff', 'secondaryColor': '#4ecdc4', 'tertiaryColor': '#45b7d1', 'background': '#1a1a1a', 'mainBkg': '#2d2d2d', 'secondBkg': '#3d3d3d', 'tertiaryBkg': '#4d4d4d'}}}%%
graph TD
    A[👤 usuarios] --> B[📦 productos]
    C[📂 categorias] --> B
    D[🏢 proveedores] --> B
    B --> E[📊 stock_bodega]
    F[🏪 bodegas] --> E
    B --> G[📋 movimientos_inventario]
    A --> G
    F --> G

    subgraph "📋 Enums"
        H[UserRole]
        I[TipoMovimiento]
        J[MotivoMovimiento]
    end

    H --> A
    I --> G
    J --> G

    style A fill:#1976d2,stroke:#0d47a1,stroke-width:3px,color:#ffffff
    style B fill:#7b1fa2,stroke:#4a148c,stroke-width:3px,color:#ffffff
    style C fill:#388e3c,stroke:#1b5e20,stroke-width:3px,color:#ffffff
    style D fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#ffffff
    style E fill:#d32f2f,stroke:#b71c1c,stroke-width:3px,color:#ffffff
    style F fill:#00796b,stroke:#004d40,stroke-width:3px,color:#ffffff
    style G fill:#5d4037,stroke:#3e2723,stroke-width:3px,color:#ffffff
```

## 🏗️ Arquitectura del Sistema

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor': '#ff6b6b', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff6b6b', 'lineColor': '#ffffff', 'secondaryColor': '#4ecdc4', 'tertiaryColor': '#45b7d1', 'background': '#1a1a1a', 'mainBkg': '#2d2d2d', 'secondBkg': '#3d3d3d', 'tertiaryBkg': '#4d4d4d'}}}%%
graph LR
    subgraph "🎭 Capa de Autenticación"
        A[👤 usuarios]
        B[🔐 UserRole Enum]
    end

    subgraph "📦 Gestión de Productos"
        C[📂 categorias]
        D[🏢 proveedores]
        E[📦 productos]
    end

    subgraph "🏪 Gestión de Almacén"
        F[🏪 bodegas]
        G[📊 stock_bodega]
    end

    subgraph "📋 Control de Inventario"
        H[📋 movimientos_inventario]
        I[🔄 TipoMovimiento Enum]
        J[📝 MotivoMovimiento Enum]
    end

    A --> H
    B --> A
    C --> E
    D --> E
    E --> G
    F --> G
    E --> H
    I --> H
    J --> H

    style A fill:#d32f2f,stroke:#b71c1c,stroke-width:3px,color:#ffffff
    style B fill:#7b1fa2,stroke:#4a148c,stroke-width:3px,color:#ffffff
    style C fill:#388e3c,stroke:#1b5e20,stroke-width:3px,color:#ffffff
    style D fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#ffffff
    style E fill:#7b1fa2,stroke:#4a148c,stroke-width:3px,color:#ffffff
    style F fill:#1976d2,stroke:#0d47a1,stroke-width:3px,color:#ffffff
    style G fill:#d32f2f,stroke:#b71c1c,stroke-width:3px,color:#ffffff
    style H fill:#5d4037,stroke:#3e2723,stroke-width:3px,color:#ffffff
    style I fill:#7b1fa2,stroke:#4a148c,stroke-width:3px,color:#ffffff
    style J fill:#7b1fa2,stroke:#4a148c,stroke-width:3px,color:#ffffff
```

## 🔄 Flujo de Operaciones del Sistema

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor': '#ff6b6b', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff6b6b', 'lineColor': '#ffffff', 'secondaryColor': '#4ecdc4', 'tertiaryColor': '#45b7d1', 'background': '#1a1a1a', 'mainBkg': '#2d2d2d', 'secondBkg': '#3d3d3d', 'tertiaryBkg': '#4d4d4d'}}}%%
sequenceDiagram
    participant U as 👤 Usuario
    participant A as 🔐 Autenticación
    participant P as 📦 Productos
    participant S as 📊 Stock
    participant M as 📋 Movimientos
    participant B as 🏪 Bodegas

    Note over U,B: Flujo de Creación de Producto
    U->>A: Login (email, password)
    A-->>U: Token + Rol
    U->>P: Crear Producto (sku, nombre, categoria_id, proveedor_id)
    P->>S: Crear Stock Inicial (producto_id, bodega_id, cantidad)
    S-->>P: Stock Creado
    P-->>U: Producto Creado

    Note over U,B: Flujo de Movimiento de Inventario
    U->>M: Crear Movimiento (producto_id, tipo, cantidad, motivo)
    M->>S: Actualizar Stock (producto_id, bodega_id, nueva_cantidad)
    S-->>M: Stock Actualizado
    M-->>U: Movimiento Registrado

    Note over U,B: Flujo de Transferencia entre Bodegas
    U->>M: Transferencia (producto_id, bodega_origen, bodega_destino, cantidad)
    M->>S: Reducir Stock Origen
    M->>S: Aumentar Stock Destino
    S-->>M: Transferencia Completada
    M-->>U: Transferencia Registrada
```

## 📊 Diagrama de Estados de Productos

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor': '#ff6b6b', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff6b6b', 'lineColor': '#ffffff', 'secondaryColor': '#4ecdc4', 'tertiaryColor': '#45b7d1', 'background': '#1a1a1a', 'mainBkg': '#2d2d2d', 'secondBkg': '#3d3d3d', 'tertiaryBkg': '#4d4d4d'}}}%%
stateDiagram-v2
    [*] --> ProductoCreado: Crear Producto
    ProductoCreado --> ConStock: Stock Inicial
    ConStock --> StockBajo: Stock < Mínimo
    ConStock --> SinStock: Stock = 0
    ConStock --> ConStock: Movimientos Normales
    StockBajo --> ConStock: Reposición
    StockBajo --> SinStock: Agotamiento
    SinStock --> ConStock: Reposición
    ConStock --> [*]: Eliminar Producto
    StockBajo --> [*]: Eliminar Producto
    SinStock --> [*]: Eliminar Producto

    note right of StockBajo: ⚠️ Alerta de Stock
    note right of SinStock: 🚨 Sin Disponibilidad
```

## 🎯 Diagrama de Casos de Uso

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor': '#ff6b6b', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#ff6b6b', 'lineColor': '#ffffff', 'secondaryColor': '#4ecdc4', 'tertiaryColor': '#45b7d1', 'background': '#1a1a1a', 'mainBkg': '#2d2d2d', 'secondBkg': '#3d3d3d', 'tertiaryBkg': '#4d4d4d'}}}%%
graph TB
    subgraph "👤 Actores"
        A[Administrador]
        B[Usuario Regular]
        C[Invitado]
    end

    subgraph "🎭 Gestión de Usuarios"
        D[Crear Usuario]
        E[Editar Usuario]
        F[Eliminar Usuario]
        G[Cambiar Rol]
    end

    subgraph "📦 Gestión de Productos"
        H[Crear Producto]
        I[Editar Producto]
        J[Eliminar Producto]
        K[Ver Productos]
    end

    subgraph "📊 Gestión de Inventario"
        L[Ver Stock]
        M[Crear Movimiento]
        N[Actualizar Stock]
        O[Transferir entre Bodegas]
    end

    subgraph "📋 Reportes"
        P[Reporte de Stock]
        Q[Kardex de Producto]
        R[Alertas de Stock]
    end

    A --> D
    A --> E
    A --> F
    A --> G
    A --> H
    A --> I
    A --> J
    A --> K
    A --> L
    A --> M
    A --> N
    A --> O
    A --> P
    A --> Q
    A --> R

    B --> K
    B --> H
    B --> I
    B --> L
    B --> M
    B --> N
    B --> O
    B --> P
    B --> Q
    B --> R

    C --> K
    C --> L

    style A fill:#d32f2f,stroke:#b71c1c,stroke-width:3px,color:#ffffff
    style B fill:#388e3c,stroke:#1b5e20,stroke-width:3px,color:#ffffff
    style C fill:#1976d2,stroke:#0d47a1,stroke-width:3px,color:#ffffff
```

## 📋 Descripción de Relaciones

### **Relaciones Principales:**

1. **Categorías → Productos** (1:N)
   - Una categoría puede tener muchos productos
   - Un producto pertenece a una categoría (opcional)
   - Campo: `productos.categoria_id` → `categorias.id`

2. **Proveedores → Productos** (1:N)
   - Un proveedor puede suministrar muchos productos
   - Un producto tiene un proveedor obligatorio
   - Campo: `productos.proveedor_id` → `proveedores.id`

3. **Productos ↔ Bodegas** (N:M a través de StockBodega)
   - Un producto puede estar en múltiples bodegas
   - Una bodega puede contener múltiples productos
   - Tabla intermedia: `stock_bodega`

4. **Productos → MovimientosInventario** (1:N)
   - Un producto puede tener múltiples movimientos
   - Cada movimiento afecta un producto específico
   - Campo: `movimientos_inventario.producto_id` → `productos.id`

5. **Usuarios → MovimientosInventario** (1:N)
   - Un usuario puede realizar múltiples movimientos
   - Cada movimiento es registrado por un usuario
   - Campo: `movimientos_inventario.usuario_id` → `usuarios.id`

6. **Bodegas → MovimientosInventario** (1:N - Doble relación)
   - Bodega origen: `movimientos_inventario.bodega_origen_id` → `bodegas.id`
   - Bodega destino: `movimientos_inventario.bodega_destino_id` → `bodegas.id`

## 🔍 Índices y Restricciones

### **Índices Únicos:**
- `usuarios.email`
- `categorias.nombre`
- `categorias.codigo`
- `proveedores.codigo`
- `bodegas.nombre`
- `bodegas.codigo`
- `productos.sku`
- `stock_bodega(producto_id, bodega_id)` - Índice compuesto único

### **Índices de Búsqueda:**
- `usuarios.email`
- `categorias.nombre`
- `categorias.codigo`
- `proveedores.nombre`
- `proveedores.codigo`
- `productos.nombre`
- `productos.sku`
- `productos.categoria_nombre`

## 🎯 Características Especiales

### **Campos de Auditoría:**
- `fecha_creacion`: Timestamp automático al crear
- `fecha_actualizacion`: Timestamp automático al actualizar

### **Campos de Estado:**
- `usuarios.activo`: Control de usuarios activos/inactivos
- `categorias.activa`: Control de categorías activas/inactivas
- `bodegas.activa`: Control de bodegas activas/inactivas

### **Compatibilidad:**
- `productos.categoria_nombre`: Campo redundante para compatibilidad con consultas existentes

### **Enums:**
- **UserRole**: ADMIN, USUARIO, INVITADO
- **TipoMovimiento**: 8 tipos de movimientos de inventario
- **MotivoMovimiento**: 12 motivos para movimientos

## 📊 Resumen de Tablas

| Tabla | Registros Estimados | Propósito |
|-------|-------------------|-----------|
| `usuarios` | 10-100 | Gestión de usuarios y autenticación |
| `categorias` | 10-50 | Clasificación de productos |
| `proveedores` | 20-200 | Gestión de proveedores |
| `bodegas` | 5-20 | Ubicaciones de almacenamiento |
| `productos` | 100-10,000 | Catálogo de productos |
| `stock_bodega` | 500-50,000 | Stock por bodega |
| `movimientos_inventario` | 1,000-100,000 | Historial de movimientos |

## 🚀 Optimizaciones Implementadas

1. **Índices estratégicos** para consultas frecuentes
2. **Campos nullable** donde es apropiado
3. **Valores por defecto** para campos comunes
4. **Timestamps automáticos** para auditoría
5. **Enums** para valores controlados
6. **Relaciones bidireccionales** con SQLAlchemy
7. **Índices compuestos** para consultas complejas
