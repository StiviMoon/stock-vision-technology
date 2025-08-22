# SVT - Stock Vision Technology

Sistema de gestión de inventario y stock desarrollado con Next.js, React y TypeScript.

## 🚀 Características

- **Dashboard Inteligente**: Vista general del inventario con estadísticas en tiempo real
- **Gestión de Productos**: CRUD completo de productos con generación automática de SKU
- **Control de Inventario**: Ajustes de stock, kardex y movimientos
- **Gestión de Proveedores**: Administración completa de proveedores
- **Sistema de Usuarios**: Roles y permisos configurables
- **Chat IA Integrado**: Asistente inteligente para consultas del sistema
- **Tema Adaptativo**: Soporte para modo claro, oscuro y automático
- **Responsive Design**: Interfaz optimizada para todos los dispositivos
- **Exportación de Datos**: Reportes en múltiples formatos

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: TailwindCSS, Shadcn/ui
- **Estado**: Zustand, React Context
- **UI Components**: Radix UI, Lucide Icons
- **Formularios**: React Hook Form, Zod
- **Notificaciones**: Sonner
- **Chat**: OpenAI API (configurable)

## 📋 Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de OpenAI (opcional, para el chat)

## 🚀 Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd SVT-Frontend/my-app
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configurar variables de entorno**

   ```bash
   cp .env.example .env.local
   ```

   Editar `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   OPENAI_API_KEY=your_openai_key_here
   ```

4. **Ejecutar en desarrollo**

   ```bash
   npm run dev
   # o
   yarn dev
   ```

5. **Construir para producción**
   ```bash
   npm run build
   npm start
   ```

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── dashboard/         # Páginas del dashboard
│   │   ├── inventario/   # Módulo de inventario
│   │   ├── productos/    # Módulo de productos
│   │   ├── proveedores/  # Módulo de proveedores
│   │   ├── usuarios/     # Módulo de usuarios
│   │   ├── chat/         # Chat IA
│   │   └── Components/   # Componentes compartidos
│   ├── login/            # Página de login
│   └── register/         # Página de registro
├── components/            # Componentes UI reutilizables
│   └── ui/               # Componentes de Shadcn/ui
├── config/                # Configuración del proyecto
├── context/               # Contextos de React
├── hooks/                 # Hooks personalizados
├── services/              # Servicios de API
├── stores/                # Stores de Zustand
├── types/                 # Tipos de TypeScript
└── utils/                 # Utilidades y helpers
```

## 🔧 Configuración

### Variables de Entorno

| Variable              | Descripción            | Requerido |
| --------------------- | ---------------------- | --------- |
| `NEXT_PUBLIC_API_URL` | URL de la API backend  | Sí        |
| `OPENAI_API_KEY`      | Clave de API de OpenAI | No        |

### Configuración de ESLint

El proyecto incluye una configuración robusta de ESLint que:

- Enforce las mejores prácticas de React
- Mantiene consistencia en el código
- Incluye reglas de accesibilidad
- Optimiza el rendimiento

## 📱 Componentes Principales

### Dashboard

- **InventarioStats**: Estadísticas del inventario
- **InventarioTable**: Tabla de productos con paginación
- **InventarioFilters**: Filtros avanzados de búsqueda

### Chat IA

- **ChatWidget**: Widget flotante del chat
- **ChatMessage**: Mensajes individuales
- **QuickActions**: Acciones rápidas predefinidas

### Formularios

- **ProductoForm**: Formulario de productos con validación
- **ProveedorForm**: Formulario de proveedores
- **UserForm**: Formulario de usuarios

## 🎨 Temas y Estilos

El sistema soporta tres temas:

- **Light**: Tema claro por defecto
- **Dark**: Tema oscuro
- **System**: Se adapta automáticamente al sistema

Los estilos están basados en TailwindCSS con componentes de Shadcn/ui para consistencia visual.

## 🔐 Autenticación

- JWT tokens para sesiones
- Roles de usuario configurables
- Middleware de protección de rutas
- Gestión automática de tokens expirados

## 📊 API y Servicios

### Servicios Principales

- `authService`: Autenticación y autorización
- `productoService`: Gestión de productos
- `inventarioService`: Control de inventario
- `proveedorService`: Gestión de proveedores
- `userService`: Administración de usuarios

### Endpoints Principales

- `/auth/*`: Endpoints de autenticación
- `/productos/*`: CRUD de productos
- `/inventario/*`: Gestión de inventario
- `/proveedores/*`: CRUD de proveedores
- `/users/*`: Administración de usuarios

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 📦 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Construcción
npm run start        # Producción
npm run lint         # Linting
npm run lint:fix     # Linting con auto-fix
npm run type-check   # Verificación de tipos
```

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

### Docker

```bash
# Construir imagen
docker build -t svt-frontend .

# Ejecutar contenedor
docker run -p 3000:3000 svt-frontend
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- **Issues**: [GitHub Issues](link-to-issues)
- **Documentación**: [Wiki del proyecto](link-to-wiki)
- **Email**: soporte@svt.com

## 🗺️ Roadmap

- [ ] Dashboard analítico avanzado
- [ ] Integración con sistemas ERP
- [ ] App móvil nativa
- [ ] Machine Learning para predicción de stock
- [ ] Integración con proveedores externos
- [ ] Sistema de notificaciones push
- [ ] Auditoría completa de cambios
- [ ] Backup automático de datos

## 📊 Métricas del Proyecto

- **Líneas de código**: ~15,000
- **Componentes**: ~50
- **Páginas**: ~12
- **Hooks personalizados**: ~8
- **Servicios**: ~6

---

**Desarrollado con ❤️ por el equipo de SVT**
