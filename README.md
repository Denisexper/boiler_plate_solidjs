# 🚀 Boiler Plate Full Stack - SolidJS + Node.js

Sistema de gestión de usuarios con **RBAC** (Control de Acceso Basado en Roles), **auditoría completa** y **auto-discovery de permisos**.

Una plantilla profesional lista para producción con arquitectura escalable y mejores prácticas.

---

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- **JWT (JSON Web Tokens)** para autenticación stateless
- **bcrypt** para hash seguro de contraseñas
- Middleware de autenticación y autorización
- Protección de rutas en frontend y backend

### 👥 Sistema RBAC Avanzado
- **Roles dinámicos** configurables desde la UI
- **Permisos granulares** por recurso y acción (ej: `users.read`, `products.create`)
- **Auto-discovery de permisos** - Se generan automáticamente desde las rutas del backend
- Protección de UI basada en permisos del usuario

### 📊 Auditoría Completa (Audit Trail)
- Registro automático de todas las acciones (crear, editar, eliminar)
- **Snapshots antes/después** de cada cambio
- **Detección de campos modificados** con algoritmo diff
- Historial completo por usuario
- Metadatos de peticiones (IP, User-Agent, timestamp)

### 🎯 Funcionalidades Adicionales
- **Soft Delete** - Activar/desactivar usuarios en lugar de eliminar
- **Filtros dinámicos** - Búsqueda, filtrado por rol y estado
- **Notificaciones toast** con solid-sonner
- **Selector de permisos avanzado** con búsqueda, filtros y acordeones
- **Dark mode** nativo
- **Responsive design** con Tailwind CSS

---

## 🧱 Stack Tecnológico

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 20.x | Runtime de JavaScript |
| **Express.js** | 4.x | Framework web minimalista |
| **MongoDB** | Latest | Base de datos NoSQL |
| **Mongoose** | 9.x | ODM para MongoDB |
| **JWT** | - | Autenticación con tokens |
| **bcrypt** | - | Hash de contraseñas |
| **CORS** | - | Cross-Origin Resource Sharing |
| **Morgan** | - | Logger HTTP |
| **dotenv** | - | Variables de entorno |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **SolidJS** | 1.8.x | Framework reactivo |
| **Vite** | Latest | Build tool next-gen |
| **Tailwind CSS** | 3.x | Framework CSS utility-first |
| **@solidjs/router** | - | Routing para SolidJS |
| **solid-sonner** | - | Notificaciones toast |
| **date-fns** | - | Utilidades para fechas |

### Herramientas de Desarrollo
- **pnpm** - Package manager rápido
- **concurrently** - Ejecutar múltiples comandos
- **nodemon** - Auto-reload en desarrollo

---

## 📁 Estructura del Proyecto
```
boiler_plate_solidjs/
│
├── backend/                          # Servidor Node.js + Express
│   ├── src/
│   │   ├── controllers/              # Lógica de negocio
│   │   │   ├── user.controller.js
│   │   │   ├── role.controller.js
│   │   │   ├── logs.controller.js
│   │   │   └── permission.controller.js
│   │   │
│   │   ├── models/                   # Esquemas de Mongoose
│   │   │   ├── user.model.js
│   │   │   ├── role.model.js
│   │   │   ├── logs.model.js
│   │   │   └── permission.model.js
│   │   │
│   │   ├── routes/                   # Definición de rutas con metadata
│   │   │   ├── auth.routes.js        # Login, register, logout
│   │   │   ├── users.routes.js       # CRUD usuarios
│   │   │   ├── roles.routes.js       # CRUD roles
│   │   │   └── logs.routes.js        # Logs y auditoría
│   │   │
│   │   ├── middleware/               # Middlewares personalizados
│   │   │   ├── auth.middleware.js    # Verificación JWT
│   │   │   ├── role.middleware.js    # Verificación de permisos
│   │   │   └── logger.middleware.js  # Logging de acciones
│   │   │
│   │   ├── db/                       # Configuración de BD y seeds
│   │   │   ├── config.js             # Conexión a MongoDB
│   │   │   ├── seedRoles.js          # Roles predefinidos
│   │   │   └── seedPermissions.js    # Auto-discovery de permisos
│   │   │
│   │   ├── utils/                    # Utilidades
│   │   │   └── permissionDiscovery.js # Auto-discovery system
│   │   │
│   │   ├── services/                 # Servicios
│   │   │   ├── jwt.service.js        # Generación y verificación de tokens
│   │   │   └── Enviroments.service.js # Variables de entorno
│   │   │
│   │   └── server.js                 # Punto de entrada del servidor
│   │
│   ├── .env                          # Variables de entorno (no subir a git)
│   └── package.json
│
├── frontend/                         # Cliente SolidJS
│   ├── src/
│   │   ├── pages/                    # Páginas principales
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Roles.jsx
│   │   │   ├── Logs.jsx
│   │   │   └── Login.jsx
│   │   │
│   │   ├── components/               # Componentes reutilizables
│   │   │   ├── layout/
│   │   │   │   └── Layout.jsx        # Layout principal con sidebar
│   │   │   ├── ProtectedRoute.jsx    # HOC para rutas protegidas
│   │   │   ├── PermissionSelector.jsx # Selector de permisos avanzado
│   │   │   ├── PermissionBadges.jsx  # Vista previa de permisos
│   │   │   └── DateRangePicker.jsx   # Selector de rango de fechas
│   │   │
│   │   ├── context/                  # Context API de SolidJS
│   │   │   ├── AuthContext.jsx       # Estado global de autenticación
│   │   │   └── ThemeContext.jsx      # Dark/Light mode
│   │   │
│   │   ├── services/                 # Servicios HTTP
│   │   │   └── api.js                # Cliente HTTP centralizado
│   │   │
│   │   ├── utils/                    # Utilidades
│   │   │   └── toast.jsx             # Helper para notificaciones
│   │   │
│   │   ├── App.jsx                   # Componente raíz
│   │   ├── index.jsx                 # Punto de entrada
│   │   └── index.css                 # Estilos globales + Tailwind
│   │
│   ├── public/                       # Archivos estáticos
│   ├── .env                          # Variables de entorno frontend
│   ├── tailwind.config.js            # Configuración de Tailwind
│   ├── vite.config.js                # Configuración de Vite
│   └── package.json
│
├── .gitignore                        # Archivos ignorados por Git
├── package.json                      # Scripts del proyecto raíz
└── README.md                         # Este archivo
```

---

## ⚙️ Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

### Obligatorios
- **Node.js** >= 20.x ([Descargar](https://nodejs.org/))
- **pnpm** ([Instalación](#instalar-pnpm))
- **MongoDB** (local o remoto como MongoDB Atlas)

### Opcionales
- **Git** para clonar el repositorio
- **MongoDB Compass** para visualizar la base de datos
- **Postman** o **Thunder Client** para probar la API

---

## 📦 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/Denisexper/boiler_plate_solidjs.git
cd boiler_plate_solidjs
```

### 2. Instalar pnpm

Si no tienes pnpm instalado:
```bash
npm install -g pnpm
```

### 3. Instalar dependencias

Desde la **raíz del proyecto** (instala backend + frontend):
```bash
pnpm install
```

O instalar por separado:
```bash
# Solo backend
cd backend
pnpm install

# Solo frontend
cd frontend
pnpm install
```

---

## 🔧 Configuración

### Backend - Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/`:
```bash
cd backend
touch .env
```

**Contenido del archivo `backend/.env`:**
```env
# Puerto del servidor
PORT=3000

# Conexión a MongoDB
MONGO_URI=mongodb://localhost:27017/boilerplate
# O usa MongoDB Atlas:
# MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/boilerplate

# Secret para JWT (genera uno único y seguro)
JWT_SECRET=clave_secreta_here

# Entorno (development | production)
NODE_ENV=development
```
## 🚀 RUN
### Desde la carpeta raiz ejecuta:
```bash
pnpm run dev
```
