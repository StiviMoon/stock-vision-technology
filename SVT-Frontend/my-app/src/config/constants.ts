// Configuración de la aplicación
export const APP_CONFIG = {
  name: "SVT - Stock Vision Technology",
  version: "1.0.0",
  description: "Sistema de gestión de inventario y stock",
};

// Configuración de la API
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  endpoints: {
    auth: {
      login: "/auth/login",
      register: "/auth/register",
      logout: "/auth/logout",
    },
    users: {
      me: "/users/me",
      all: "/users",
    },
    products: {
      all: "/productos",
      create: "/productos",
      update: "/productos",
      delete: "/productos",
    },
    inventory: {
      all: "/inventario",
      adjust: "/inventario/ajustar",
      kardex: "/inventario/kardex",
    },
    providers: {
      all: "/proveedores",
      create: "/proveedores",
      update: "/proveedores",
      delete: "/proveedores",
    },
  },
  timeout: 10000,
};

// Configuración de paginación
export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
};

// Configuración de temas
export const THEME_CONFIG = {
  defaultTheme: "system",
  themes: ["light", "dark", "system"],
};

// Configuración de chat
export const CHAT_CONFIG = {
  maxMessages: 100,
  autoScrollDelay: 100,
  typingIndicatorDelay: 1000,
};

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  duration: 5000,
  position: "top-right",
};

// Configuración de validación
export const VALIDATION_CONFIG = {
  minPasswordLength: 8,
  maxPasswordLength: 128,
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Configuración de archivos
export const FILE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  uploadPath: "/uploads",
};

// Configuración de seguridad
export const SECURITY_CONFIG = {
  tokenKey: "token",
  tokenTypeKey: "token_type",
  refreshTokenKey: "refresh_token",
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
};
