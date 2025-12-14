# RifaParaTodos - Sistema de Rifas Transparente

Sistema completo de rifas en línea basado en loterías nacionales para garantizar transparencia total.

## 🚀 Estructura del Proyecto

```
actualizacionWeb/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── Home/            # Vista principal
│   │   ├── Rifas/           # Rifas activas, detalle, mis rifas
│   │   ├── Auth/            # Login y registro
│   │   ├── Perfil/          # Perfil de usuario
│   │   ├── Admin/           # Panel administrativo
│   │   └── Shared/          # Componentes compartidos
│   ├── .env                 # Variables de entorno frontend
│   └── package.json
│
├── backend/                  # API Node.js + Express
│   ├── routes/              # Rutas de la API
│   │   ├── auth.js          # Autenticación
│   │   ├── rifas.js         # Gestión de rifas
│   │   ├── usuarios.js      # Gestión de usuarios
│   │   └── transacciones.js # Transacciones
│   ├── config/
│   │   └── database.js      # Configuración MySQL
│   ├── database/
│   │   └── schema.sql       # Estructura de BD
│   ├── .env                 # Variables de entorno backend
│   ├── server.js            # Servidor principal
│   └── package.json
│
└── .copilot-instructions.md # Instrucciones del proyecto
```

## 📋 Características Principales

### Frontend (React + Vite)
✅ **Vistas Públicas:**
- Home con rifas destacadas
- Catálogo de rifas activas con filtros
- Detalle de rifa con selección de números
- Login y registro de usuarios

✅ **Vistas de Usuario:**
- Perfil con edición de datos
- Mis rifas activas y finalizadas
- Historial de actividad
- Recarga de saldo

✅ **Panel de Administración:**
- Dashboard con estadísticas
- Gestión de rifas (crear, editar, eliminar)
- Gestión de usuarios
- 🔐 **Gestión de sesiones activas** (NUEVO)
  - Ver usuarios conectados en tiempo real
  - Cerrar sesiones manualmente
  - Monitoreo de actividad
  - Timeout automático de 3 horas
- Control de sorteos

### Backend (Node.js + Express)
✅ **API REST con endpoints mock:**
- `/api/auth` - Login, registro, verificación
- `/api/rifas` - CRUD de rifas y compra de números
- `/api/usuarios` - Gestión de perfil y rifas del usuario
- `/api/transacciones` - Historial y recarga de saldo

**Nota:** Todos los endpoints retornan `success` sin lógica real para permitir desarrollo del frontend.

### Base de Datos (MySQL)
✅ **Estructura completa con tablas:**
- `usuarios` - Datos de usuarios y roles
- `rifas` - Información de rifas
- `premios` - Premios por rifa según grados de lotería
- `numeros_comprados` - Números adquiridos por usuarios
- `transacciones` - Movimientos de saldo
- `sorteos` - Registro de sorteos ejecutados
- `actividad` - Logs del sistema
- `configuracion` - Parámetros del sistema
- `notificaciones` - Notificaciones a usuarios

## 🚀 Inicio Rápido

### Opción 1: Ejecutar Frontend y Backend Juntos (Recomendado)

```powershell
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará:
- 🔧 Backend en `http://localhost:5000`
- 🎨 Frontend en `http://localhost:3000`

### Opción 2: Ejecutar por Separado

**Backend:**
```powershell
cd backend
npm run dev
```

**Frontend:**
```powershell
cd frontend
npm run dev
```

## 📦 Instalación y Configuración

### 1. Instalar Dependencias

**Todas a la vez (recomendado):**
```powershell
npm run install:all
```

**O por separado:**

**Frontend:**
```powershell
cd frontend
npm install
```

**Backend:**
```powershell
cd backend
npm install
```

### 2. Configurar Base de Datos

1. Crear la base de datos MySQL:
```sql
mysql -u root -p < backend/database/schema.sql
```

2. Ajustar credenciales en `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=rifaparatodos
```

### 3. Configurar Variables de Entorno

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`backend/.env`):
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=rifaparatodos
JWT_SECRET=tu_secreto_seguro
CORS_ORIGIN=http://localhost:3000
```

## 📜 Scripts Disponibles

Desde la raíz del proyecto:
- `npm run dev` - ⚡ Ejecuta backend y frontend simultáneamente
- `npm run dev:backend` - Solo backend
- `npm run dev:frontend` - Solo frontend
- `npm run install:all` - Instala dependencias en todos los proyectos
- `npm run build:frontend` - Construye el frontend para producción

## 📡 Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/registro` - Registrar usuario
- `GET /api/auth/verify` - Verificar token

### Rifas
- `GET /api/rifas` - Obtener todas las rifas
- `GET /api/rifas/:id` - Obtener rifa por ID
- `POST /api/rifas` - Crear nueva rifa
- `POST /api/rifas/:id/comprar` - Comprar números
- `GET /api/rifas/:id/numeros-disponibles` - Números disponibles

### Usuarios
- `GET /api/usuarios/perfil` - Obtener perfil
- `PUT /api/usuarios/perfil` - Actualizar perfil
- `GET /api/usuarios/mis-rifas` - Rifas del usuario
- `POST /api/usuarios/recargar-saldo` - Recargar saldo

### Transacciones
- `GET /api/transacciones` - Historial de transacciones
- `POST /api/transacciones` - Nueva transacción

## 🎨 Stack Tecnológico

### Frontend
- **React** 18.2 - Librería de UI
- **Vite** 5.0 - Build tool
- **React Router** 6.20 - Enrutamiento
- **Axios** 1.6 - Cliente HTTP

### Backend
- **Node.js** - Runtime
- **Express** 4.18 - Framework web
- **MySQL2** 3.6 - Cliente MySQL
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas
- **CORS** - Manejo de CORS

### Base de Datos
- **MySQL** 8.0 - Base de datos relacional

## 📝 Próximos Pasos

### Para implementar la lógica real:

1. **Backend:**
   - Conectar endpoints con la base de datos
   - Implementar autenticación JWT real
   - Agregar validaciones y middleware
   - Implementar lógica de sorteos con APIs de loterías

2. **Frontend:**
   - Conectar con la API real
   - Agregar manejo de errores completo
   - Implementar autenticación persistente
   - Agregar estados de carga

3. **Base de Datos:**
   - Importar el schema SQL
   - Crear índices adicionales según necesidad
   - Implementar stored procedures para sorteos

## 🔐 Seguridad

- Cambiar `JWT_SECRET` en producción
- Actualizar contraseñas de base de datos
- Configurar CORS apropiadamente
- Implementar rate limiting
- Validar todas las entradas de usuario
- ✅ **Sistema de Sesiones Implementado:**
  - Registro automático de cada inicio de sesión
  - Timeout de 3 horas de inactividad
  - Cierre automático de sesiones expiradas
  - Panel de administración para gestión manual
  - Logs de actividad completos

## 🆕 Sistema de Gestión de Sesiones

**Documentación completa:**
- [`INICIO_RAPIDO_SESIONES.md`](INICIO_RAPIDO_SESIONES.md) - Guía rápida de uso
- [`SISTEMA_SESIONES.md`](SISTEMA_SESIONES.md) - Documentación técnica completa
- [`PRUEBAS_SESIONES.md`](PRUEBAS_SESIONES.md) - Guía de pruebas

**Características:**
- ✅ Registro automático de cada login con IP, navegador, SO
- ✅ Validación con timeout de 3 horas de inactividad
- ✅ Panel de administración en `/admin/sesiones`
- ✅ Cierre manual de sesiones individuales o múltiples
- ✅ Expiración automática cada 5 minutos (cron job)
- ✅ Actualización en tiempo real del panel (30 segundos)

**Acceso rápido:** `http://localhost:3001/admin/sesiones` (requiere rol administrador)

## 📞 Soporte

Para cualquier duda, revisar el archivo `.copilot-instructions.md` que contiene todas las directrices del proyecto.

---

**Versión:** 1.0.0  
**Última actualización:** 4 de diciembre de 2025
