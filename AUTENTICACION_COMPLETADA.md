# ✅ AUTENTICACIÓN CON BASE DE DATOS REAL - COMPLETADO

## 🎯 Cambios Implementados

### Backend

#### 1. **Autenticación Real en `backend/routes/auth.js`**
- ✅ Eliminado objeto `usuariosMock` con usuarios predefinidos
- ✅ Implementada consulta a base de datos con `getUsuarioByEmail()`
- ✅ Integrado bcrypt para verificación de contraseñas: `bcrypt.compare()`
- ✅ Generación de tokens JWT con `jwt.sign()` (expiración 24h)
- ✅ Validación de campos: email formato válido, contraseña mínimo 6 caracteres
- ✅ Verificación de usuario activo (campo `activo`)
- ✅ Manejo de errores: 400 (validación), 401 (credenciales inválidas), 500 (servidor)

**POST /api/auth/login:**
```javascript
1. Recibe: { email, password }
2. Busca usuario en BD: getUsuarioByEmail(email)
3. Verifica contraseña: bcrypt.compare(password, usuario.password)
4. Verifica que usuario.activo === 1
5. Genera JWT: jwt.sign({ id, correo, rol }, JWT_SECRET, { expiresIn: '24h' })
6. Retorna: { status: 'success', data: { token, usuario } }
```

**POST /api/auth/registro:**
```javascript
1. Recibe: { nombre, apellido, email, password, telefono, direccion }
2. Valida formato email y longitud contraseña
3. Verifica email no existe: getUsuarioByEmail(email)
4. Crea usuario: createUsuario() - password hasheado internamente
5. Genera JWT automáticamente
6. Retorna: { status: 'success', data: { token, usuario } }
```

#### 2. **Middleware JWT en `backend/middleware/auth.js`**
- ✅ Reescrito de ES6 export a CommonJS (module.exports)
- ✅ Implementado `verificarToken`: extrae JWT del header Authorization Bearer
- ✅ Verifica token con `jwt.verify(token, JWT_SECRET)`
- ✅ Agrega `req.usuario` con datos decodificados del token
- ✅ Actualizado `verificarRol`: usa `req.usuario.rol` en lugar de mock
- ✅ Actualizado `verificarPermiso`: usa `req.usuario` del JWT
- ✅ Añadido rol `cliente` a matriz de permisos

**Uso del middleware:**
```javascript
// Proteger ruta con autenticación
router.get('/perfil', verificarToken, controlador);

// Proteger ruta con rol específico
router.get('/admin', verificarToken, verificarRol('administrador'), controlador);

// Verificar permisos específicos
router.post('/rifas', verificarToken, verificarPermiso('rifas', 'crear'), controlador);
```

#### 3. **Modelo de Usuario `backend/models/usuarioModel.js`**
Ya estaba correcto:
- ✅ `getUsuarioByEmail(correo)`: consulta usuario por email
- ✅ `createUsuario(userData)`: hashea password con bcrypt.hash(password, 10)
- ✅ Inserta usuario con: saldo=0, activo=1, timestamps automáticos
- ✅ Retorna `insertId` para obtener el usuario creado

#### 4. **Conexión a Base de Datos `backend/database/connection.js`**
Ya estaba correcto:
- ✅ Pool de conexiones MySQL (límite: 10 conexiones)
- ✅ Credenciales en .env: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
- ✅ Charset: utf8mb4 para soportar emojis
- ✅ Test de conexión al iniciar

### Frontend

#### 5. **Interceptor Axios `frontend/src/utils/axios.js`**
Ya estaba correcto:
- ✅ Añade header `Authorization: Bearer ${token}` a todas las peticiones
- ✅ Lee token de `localStorage.getItem('token')`
- ✅ Interceptor de respuestas: redirige a /login si recibe 401
- ✅ Limpia localStorage en caso de token inválido

#### 6. **AuthContext `frontend/src/context/AuthContext.jsx`**
- ✅ Eliminados logs de desarrollo (console.log excesivos)
- ✅ Mantiene funcionalidad: login, logout, verificarSesion, redirigirSegunRol
- ✅ Guarda token y usuario en localStorage
- ✅ Mapeo de roles: usuario_registrado y cliente → /usuario/dashboard

#### 7. **Componentes de Autenticación**
- ✅ `Login.jsx`: logs eliminados, mantiene validación y manejo de errores
- ✅ `Registro.jsx`: validación completa (email, password, términos)
- ✅ `RoleGuard.jsx`: logs eliminados, protección de rutas por rol

---

## 🗄️ Estructura de Base de Datos

### Tabla: `usuario`
```sql
CREATE TABLE usuario (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- Hasheado con bcrypt
  direccion TEXT,
  rol ENUM('administrador', 'supervisor', 'vendedor', 'cliente', 'usuario_registrado') DEFAULT 'cliente',
  saldo DECIMAL(10,2) DEFAULT 0.00,
  activo TINYINT(1) DEFAULT 1,
  telefono VARCHAR(20),
  foto_perfil VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Mapeo de Campos
| Base de Datos | API Response | Notas |
|---------------|--------------|-------|
| `correo` | `email` | Mapeado en auth.js |
| `nombre` | `nombre` | Nombre completo (concatena nombre + apellido en registro) |
| `password` | (nunca retornado) | Hash bcrypt, salt rounds: 10 |
| `activo` | (verificado, no retornado) | 1 = activo, 0 = inactivo |
| `rol` | `rol` | Sin cambios |

---

## 🔐 Flujo de Autenticación

### 1. Registro
```
Frontend → POST /api/auth/registro
{
  nombre: "Juan",
  apellido: "Pérez",
  email: "juan@mail.com",
  password: "123456",
  telefono: "1234567890"
}
↓
Backend:
  1. Valida email y password
  2. Verifica email no existe
  3. Concatena nombre completo: "Juan Pérez"
  4. createUsuario() → hashea password con bcrypt
  5. Inserta en BD con rol='cliente', activo=1, saldo=0
  6. Genera JWT token (24h)
  7. Retorna { token, usuario }
↓
Frontend:
  1. Guarda token y usuario en localStorage
  2. Actualiza AuthContext
  3. Redirige a /usuario/dashboard
```

### 2. Login
```
Frontend → POST /api/auth/login
{ email: "juan@mail.com", password: "123456" }
↓
Backend:
  1. getUsuarioByEmail(email)
  2. Verifica usuario.activo === 1
  3. bcrypt.compare(password, usuario.password)
  4. Genera JWT: jwt.sign({ id, correo, rol }, SECRET, { expiresIn: '24h' })
  5. Retorna { token, usuario: { id, nombre, email, rol, ... } }
↓
Frontend:
  1. Guarda token en localStorage
  2. Guarda usuario en localStorage
  3. setUsuario() en AuthContext
  4. redirigirSegunRol(usuario.rol)
```

### 3. Peticiones Autenticadas
```
Frontend:
  axios.get('/api/usuarios/perfil')
  ↓ Interceptor añade header
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
↓
Backend Middleware:
  verificarToken(req, res, next)
  ↓ jwt.verify(token, JWT_SECRET)
  ↓ Decodifica: { id, correo, rol }
  ↓ Añade a req.usuario
  ↓ next()
↓
Controlador:
  Accede a req.usuario.id, req.usuario.rol
```

---

## 🧪 Cómo Probar

### Opción 1: Script PowerShell (Prueba Backend)
```powershell
cd d:\Program\actualizacionWeb
.\test-db-auth.ps1
```

**Qué hace:**
1. Verifica servidor activo
2. Registra usuario de prueba
3. Hace login
4. Prueba ruta protegida con token
5. Prueba credenciales incorrectas
6. Prueba acceso sin token

### Opción 2: Frontend Completo
```powershell
# Terminal 1 - Backend
cd d:\Program\actualizacionWeb\backend
node server.js

# Terminal 2 - Frontend
cd d:\Program\actualizacionWeb\frontend
npm run dev
```

**Pasos de prueba:**
1. Abre http://localhost:3001
2. Click en "Registrarse"
3. Completa formulario con datos reales
4. Observa redirección automática al dashboard
5. Verifica que aparezcan tus datos en el panel
6. Cierra sesión
7. Inicia sesión nuevamente con las credenciales
8. Verifica persistencia de sesión (recarga página)

### Opción 3: Verificar Usuario en Base de Datos
```sql
-- Conectar a MySQL
mysql -h 167.88.36.159 -u sav1993 -p rifaparatodos

-- Ver usuarios registrados
SELECT id, nombre, correo, rol, activo, saldo, created_at 
FROM usuario 
ORDER BY created_at DESC 
LIMIT 10;

-- Verificar que las contraseñas estén hasheadas
SELECT correo, LEFT(password, 20) as password_hash 
FROM usuario 
WHERE correo = 'tu@email.com';
-- Debe mostrar algo como: $2b$10$abcdefgh...

-- Crear usuario administrador manualmente
INSERT INTO usuario (nombre, correo, password, rol, activo, saldo)
VALUES (
  'Admin Test',
  'admin@rifas.com',
  '$2b$10$YourBcryptHashHere',  -- Usa el script para generar el hash
  'administrador',
  1,
  0.00
);
```

### Generar Hash de Contraseña
```powershell
# Ejecutar en Node.js
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('tucontraseña', 10).then(hash => console.log(hash));"
```

---

## 🔧 Variables de Entorno

### `backend/.env`
```env
# Servidor
PORT=5000
CORS_ORIGIN=http://localhost:3001

# Base de Datos
DB_HOST=167.88.36.159
DB_USER=sav1993
DB_PASSWORD=@Wgarcia5770
DB_NAME=rifaparatodos
DB_PORT=3306

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui_cambiar_en_produccion

# Opcional
NODE_ENV=development
```

⚠️ **IMPORTANTE:** Cambia `JWT_SECRET` por un string aleatorio seguro en producción.

---

## ✅ Checklist de Verificación

### Backend
- [x] Eliminados usuarios mock de auth.js
- [x] Login consulta base de datos
- [x] Contraseñas verificadas con bcrypt
- [x] JWT generado con expiración 24h
- [x] Registro crea usuario en BD
- [x] Middleware verificarToken implementado
- [x] Middleware verificarRol usa JWT
- [x] Variables de entorno configuradas
- [x] Conexión a BD establecida

### Frontend
- [x] Interceptor axios añade token
- [x] Login guarda token en localStorage
- [x] Registro guarda token en localStorage
- [x] AuthContext usa token para autenticación
- [x] Rutas protegidas con PrivateRoute
- [x] Rutas con roles protegidas con RoleGuard
- [x] Redirección a /login si token inválido
- [x] Logs de desarrollo eliminados

### Base de Datos
- [x] Tabla usuario existe
- [x] Campo correo es UNIQUE
- [x] Campo password almacena hash bcrypt
- [x] Campo activo controla acceso
- [x] Campo rol define permisos

---

## 🚀 Próximos Pasos

1. **Crear Usuarios de Prueba en BD** (diferentes roles)
   ```sql
   -- Usar el hash generado con bcrypt
   INSERT INTO usuario (nombre, correo, password, rol, activo)
   VALUES 
   ('Admin Principal', 'admin@rifas.com', '$2b$10$...', 'administrador', 1),
   ('Supervisor Test', 'supervisor@rifas.com', '$2b$10$...', 'supervisor', 1),
   ('Vendedor Test', 'vendedor@rifas.com', '$2b$10$...', 'vendedor', 1);
   ```

2. **Implementar Rutas Protegidas**
   ```javascript
   // Ejemplo: backend/routes/usuarios.js
   router.get('/perfil', verificarToken, obtenerPerfil);
   router.put('/perfil', verificarToken, actualizarPerfil);
   router.get('/admin/usuarios', verificarToken, verificarRol('administrador'), listarUsuarios);
   ```

3. **Conectar Frontend con Rutas Protegidas**
   - UsuarioDashboard → GET /api/usuarios/perfil
   - AdminDashboard → GET /api/usuarios (con rol admin)

4. **Implementar Refresh Token** (opcional)
   - Token de corta duración (15 min)
   - Refresh token de larga duración (7 días)
   - Renovación automática antes de expiración

5. **Añadir Seguridad Adicional**
   - Rate limiting en login (express-rate-limit)
   - Validación email con código de verificación
   - Reset de contraseña por email
   - Registro de intentos de login fallidos

6. **Pruebas de Seguridad**
   - Intentos de login con credenciales incorrectas
   - Acceso a rutas sin token
   - Acceso a rutas con token expirado
   - Acceso a rutas sin permisos de rol

---

## 📝 Notas Importantes

- **Contraseñas:** Nunca se retornan en las respuestas de la API
- **Tokens JWT:** Contienen solo `{ id, correo, rol }` - no información sensible
- **Campo activo:** Usuario con `activo=0` no puede iniciar sesión
- **Rol por defecto:** Nuevos usuarios se registran como `cliente`
- **Expiración token:** 24 horas - después requiere nuevo login
- **Mapeo correo → email:** Backend mapea automáticamente para compatibilidad frontend

---

## ❓ Troubleshooting

### Error: "Token no proporcionado"
- Verifica que axios interceptor esté configurado
- Revisa que localStorage tenga el token
- Confirma formato: `Authorization: Bearer <token>`

### Error: "Token inválido o expirado"
- Token expiró (24h) - hacer login nuevamente
- JWT_SECRET cambió - regenerar token
- Token manipulado - verificar integridad

### Error: "Usuario o contraseña incorrectos"
- Verifica que el usuario exista en BD
- Confirma que `activo=1`
- Password debe coincidir con hash en BD

### Error: "No tienes permisos"
- Verifica rol del usuario en BD
- Confirma que middleware verificarRol esté aplicado
- Revisa matriz de permisos en auth.js

### Error de Conexión a BD
- Verifica credenciales en .env
- Confirma que BD esté accesible desde tu red
- Revisa firewall/puertos (MySQL: 3306)

---

## 📚 Documentación de Referencia

- [bcryptjs](https://www.npmjs.com/package/bcryptjs) - Hashing de contraseñas
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - Generación y verificación de JWT
- [axios interceptors](https://axios-http.com/docs/interceptors) - Middleware de peticiones
- [JWT.io](https://jwt.io/) - Decodificar tokens JWT
- [MySQL2](https://www.npmjs.com/package/mysql2) - Cliente MySQL para Node.js

---

**Estado:** ✅ **IMPLEMENTACIÓN COMPLETA**  
**Fecha:** $(Get-Date -Format "yyyy-MM-dd HH:mm")  
**Versión:** 1.0 - Autenticación Real con Base de Datos
