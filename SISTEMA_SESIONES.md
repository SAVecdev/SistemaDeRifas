# 🔐 Sistema de Gestión de Sesiones - Documentación Completa

## 📋 Descripción General

Se ha implementado un sistema completo de gestión de sesiones que incluye:
- ✅ Registro automático de cada inicio de sesión
- ✅ Validación de sesiones con timeout de 3 horas de inactividad
- ✅ Panel de administración para ver y gestionar sesiones activas
- ✅ Cierre automático de sesiones por inactividad
- ✅ Cierre manual de sesiones desde el panel de administrador

---

## 🎯 Características Implementadas

### 1. **Registro de Inicio de Sesión**
Cada vez que un usuario inicia sesión, se registra:
- ID de usuario
- Token de sesión (JWT)
- Dirección IP
- User Agent completo
- Navegador detectado (Chrome, Firefox, Safari, Edge, Opera)
- Sistema operativo (Windows, macOS, Linux, Android, iOS)
- Fecha y hora de inicio
- Último acceso
- Estado (activa/expirada/cerrada)

📍 **Ubicación Backend**: `backend/routes/auth.js` - líneas 51-89

### 2. **Validación de Sesiones con Timeout de 3 Horas**
- Las sesiones expiran automáticamente después de **3 horas (180 minutos)** de inactividad
- El tiempo de inactividad se calcula desde el último acceso del usuario
- Cada petición al backend actualiza automáticamente el timestamp de último acceso

📍 **Ubicación Backend**: 
- `backend/middleware/auth.js` - Middleware `verificarToken`
- `backend/models/sessionModel.js` - Funciones `isSessionValid` y `expireInactiveSessions`

### 3. **Panel de Administración de Sesiones**
Interfaz completa para administradores que muestra:
- **Estadísticas en tiempo real**: Total de sesiones activas, por rol (admin, vendedor, cliente)
- **Tabla de sesiones** con información detallada:
  - Usuario (nombre y correo)
  - Rol
  - IP y ubicación
  - Dispositivo (navegador y sistema operativo)
  - Fecha de inicio de sesión
  - Último acceso
  - Tiempo restante antes de expirar
- **Filtros y búsqueda**:
  - Búsqueda por nombre, email o IP
  - Filtro por rol de usuario
  - Ordenamiento (reciente, antiguo, por usuario)
- **Acciones disponibles**:
  - 🚫 Cerrar una sesión específica
  - ❌ Cerrar todas las sesiones de un usuario
  - ⏰ Expirar todas las sesiones inactivas
  - 🔄 Actualización automática cada 30 segundos

📍 **Ubicación Frontend**: 
- `frontend/src/Admin/AdminSesiones.jsx`
- `frontend/src/Admin/AdminSesiones.css`

---

## 🔧 Configuración Técnica

### Backend

#### Tabla de Base de Datos: `session`
```sql
CREATE TABLE `session` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_usuario` int,
  `token_sesion` varchar(255),
  `ip` varchar(45),
  `user_agent` text,
  `navegador` varchar(100),
  `sistema_operativo` varchar(100),
  `fecha_inicio` datetime,
  `ultimo_acceso` datetime,
  `fecha_cierre` datetime,
  `estado` enum('activa','expirada','cerrada'),
  `duracion_minutos` int,
  `created_at` timestamp
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Endpoints API

**Endpoints Públicos (requieren autenticación):**
- `POST /api/auth/login` - Inicio de sesión (crea registro de sesión)
- `POST /api/auth/logout` - Cierre de sesión (marca sesión como cerrada)

**Endpoints de Administración (solo administradores):**
- `GET /api/sesiones/activas` - Obtener todas las sesiones activas
- `DELETE /api/sesiones/admin/cerrar/:id` - Cerrar sesión específica por ID
- `DELETE /api/sesiones/admin/cerrar-usuario/:id_usuario` - Cerrar todas las sesiones de un usuario
- `POST /api/sesiones/expirar-inactivas` - Expirar sesiones inactivas (>3h)
- `DELETE /api/sesiones/limpiar` - Limpiar sesiones antiguas (>30 días cerradas)

#### Middleware de Autenticación
El middleware `verificarToken` ahora:
1. Verifica el token JWT
2. Valida que la sesión esté activa y no haya expirado
3. Actualiza el timestamp de último acceso
4. Retorna error 401 con código `SESSION_EXPIRED` si la sesión expiró

📍 **Archivo**: `backend/middleware/auth.js`

### Frontend

#### Componente AdminSesiones
Características:
- Carga automática de sesiones cada 30 segundos
- Indicadores visuales de tiempo restante:
  - 🟢 **Verde** (normal): >60 minutos restantes
  - 🟡 **Amarillo** (advertencia): 30-60 minutos restantes
  - 🔴 **Rojo parpadeante** (crítico): <30 minutos restantes
- Confirmaciones antes de cerrar sesiones
- Mensajes de error/éxito para cada acción

#### Interceptor de Axios
Detecta automáticamente sesiones expiradas y:
- Muestra alerta al usuario
- Limpia localStorage
- Redirige a la página de login

📍 **Archivo**: `frontend/src/utils/axios.js`

#### AuthContext Actualizado
El método `cerrarSesion` ahora:
- Llama al endpoint `/api/auth/logout` en el backend
- Limpia el localStorage
- Redirige a login

📍 **Archivo**: `frontend/src/context/AuthContext.jsx`

---

## 📱 Acceso al Panel de Sesiones

### Para Administradores:
1. Inicia sesión con credenciales de administrador
2. En el menú lateral, haz clic en **"🔐 Sesiones Activas"**
3. Se mostrará el panel con todas las sesiones activas

**Ruta**: `/admin/sesiones`

---

## ⚙️ Flujo de Funcionamiento

### 1. **Login del Usuario**
```
Usuario ingresa credenciales
  ↓
Backend valida credenciales
  ↓
Se genera token JWT
  ↓
Se crea registro en tabla session
  ↓
Se retorna token al frontend
  ↓
Frontend guarda token en localStorage
```

### 2. **Validación en Cada Petición**
```
Usuario hace petición al backend
  ↓
Middleware verificarToken intercepta
  ↓
Verifica token JWT
  ↓
Valida que sesión esté activa (SELECT con TIMESTAMPDIFF)
  ↓
Si está activa: Actualiza ultimo_acceso y continúa
  ↓
Si expiró: Retorna error 401 con SESSION_EXPIRED
```

### 3. **Expiración Automática**
```
Sesión sin actividad por 180 minutos
  ↓
Próxima petición detecta inactividad
  ↓
Middleware retorna error 401
  ↓
Frontend intercepta error
  ↓
Muestra alerta y redirige a login
```

### 4. **Cierre Manual desde Admin**
```
Admin abre panel de sesiones
  ↓
Selecciona sesión a cerrar
  ↓
Confirma acción
  ↓
Backend actualiza estado a 'cerrada'
  ↓
Usuario afectado es desconectado en próxima petición
```

---

## 🛡️ Seguridad

### Medidas Implementadas:
- ✅ Tokens JWT con expiración
- ✅ Validación de sesión en cada petición
- ✅ Registro de IP y User Agent
- ✅ Solo administradores pueden gestionar sesiones
- ✅ Confirmación antes de cerrar sesiones
- ✅ Logs de actividades (console.log en backend)

### Recomendaciones Adicionales:
- 🔒 Implementar HTTPS en producción
- 🔒 Agregar rate limiting para prevenir ataques de fuerza bruta
- 🔒 Considerar agregar ubicación geográfica basada en IP
- 🔒 Implementar alertas de inicio de sesión desde nuevos dispositivos

---

## 📊 Monitoreo y Mantenimiento

### Limpieza Automática
El sistema incluye función para limpiar sesiones antiguas:
```javascript
// Elimina sesiones cerradas/expiradas de más de 30 días
DELETE /api/sesiones/limpiar
```

### Logs
Todos los eventos importantes se registran en console:
- ✅ Nueva sesión creada
- ✅ Sesión cerrada por usuario
- ✅ Sesión cerrada por administrador
- ✅ Sesiones expiradas

---

## 🔄 Actualización de Esquema de BD

Si la tabla `session` no existe o necesita actualizarse, ejecutar:

```sql
-- Ya existe en backend/database/schema.sql
-- El timeout se actualizó de 120 a 180 minutos en:
-- - sessionModel.expireInactiveSessions()
-- - sessionModel.isSessionValid()
```

---

## 🚀 Testing

### Probar Expiración de Sesiones:
1. Inicia sesión
2. Espera 3 horas sin hacer ninguna petición
3. Intenta hacer cualquier acción
4. Deberías ver alerta de sesión expirada y ser redirigido a login

### Probar Cierre Manual:
1. Inicia sesión con 2 usuarios diferentes
2. Como administrador, ve a panel de sesiones
3. Cierra la sesión del otro usuario
4. El otro usuario debería ser desconectado en su próxima acción

### Probar Actualización de Último Acceso:
1. Inicia sesión
2. Ve al panel de sesiones
3. Observa el "Tiempo Restante"
4. Navega por la aplicación
5. Vuelve al panel de sesiones
6. El "Tiempo Restante" debería haberse renovado

---

## 📝 Archivos Modificados/Creados

### Backend:
- ✅ `backend/middleware/auth.js` - Actualizado con validación de sesión
- ✅ `backend/routes/auth.js` - Agregado registro de sesión en login y endpoint logout
- ✅ `backend/routes/sesiones.js` - Mejorado con endpoints de admin
- ✅ `backend/models/sessionModel.js` - Actualizado timeout a 180 minutos

### Frontend:
- ✅ `frontend/src/Admin/AdminSesiones.jsx` - Nuevo componente
- ✅ `frontend/src/Admin/AdminSesiones.css` - Nuevos estilos
- ✅ `frontend/src/App.jsx` - Agregada ruta /admin/sesiones
- ✅ `frontend/src/Shared/Sidebar.jsx` - Agregado enlace en menú
- ✅ `frontend/src/context/AuthContext.jsx` - Actualizado cerrarSesion
- ✅ `frontend/src/utils/axios.js` - Mejorado interceptor

### Documentación:
- ✅ `SISTEMA_SESIONES.md` - Este archivo

---

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si cierro todas las pestañas del navegador?**
R: La sesión permanece activa en el servidor por hasta 3 horas. Al volver a abrir, si no han pasado 3 horas de inactividad, la sesión sigue válida.

**P: ¿Puedo tener múltiples sesiones del mismo usuario?**
R: Sí, el sistema permite múltiples sesiones activas del mismo usuario desde diferentes dispositivos.

**P: ¿Qué sucede si cambio el timeout de 3 horas?**
R: Actualiza el valor en `sessionModel.js` en las funciones `expireInactiveSessions` y `isSessionValid` (cambiar 180 por el número de minutos deseado).

**P: ¿Los usuarios reciben notificación antes de que expire su sesión?**
R: Actualmente no hay advertencia previa. Se puede implementar un timer en el frontend que avise 5-10 minutos antes.

---

## 🎉 Características Futuras Sugeridas

- [ ] Notificación previa antes de expiración (5 min antes)
- [ ] Geolocalización de IPs para mostrar ubicación
- [ ] Historial completo de sesiones por usuario
- [ ] Exportar reportes de sesiones en Excel/PDF
- [ ] Dashboard con gráficas de actividad por hora/día
- [ ] Alerta por email cuando se inicia sesión desde nuevo dispositivo
- [ ] Opción de "Confiar en este dispositivo" (sesión extendida)
- [ ] Límite máximo de sesiones simultáneas por usuario

---

## 📧 Soporte

Para cualquier duda o problema con el sistema de sesiones, revisar:
1. Logs del backend en consola
2. Network tab del navegador (DevTools)
3. Tabla `session` en la base de datos

---

**Fecha de Implementación**: 13 de diciembre de 2025
**Versión**: 1.0.0
**Timeout de Sesión**: 3 horas (180 minutos)
