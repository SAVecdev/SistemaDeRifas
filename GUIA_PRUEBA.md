# Guía de Prueba - Sistema Rifaparatodos

## 🚀 Servidores en Ejecución

### Backend
- **Puerto**: 5000
- **URL**: http://localhost:5000
- **Estado**: ✅ Corriendo

### Frontend
- **Puerto**: 3001
- **URL**: http://localhost:3001
- **Estado**: ✅ Corriendo

## 🔐 Credenciales de Prueba

### Administrador
```
Email: admin@rifaparatodos.com
Password: cualquiera (el backend mock acepta cualquier contraseña)
Rol: administrador
```

### Supervisor
```
Email: supervisor@rifaparatodos.com
Password: cualquiera
Rol: supervisor
```

### Vendedor
```
Email: vendedor@rifaparatodos.com
Password: cualquiera
Rol: vendedor
```

### Cliente/Usuario Registrado
```
Email: usuario@rifaparatodos.com
Password: cualquiera
Rol: usuario_registrado
```

## 📝 Cómo Probar

1. **Acceder al Login**
   - Ir a: http://localhost:3001/login

2. **Usar Botones de Prueba Rápida**
   - En la página de login hay 4 botones:
     - **Admin** - Te lleva a /admin/dashboard
     - **Supervisor** - Te lleva a /supervisor/dashboard
     - **Vendedor** - Te lleva a /vendedor/dashboard
     - **Cliente** - Te lleva a /usuario/dashboard

3. **Login Manual**
   - Ingresa cualquiera de los emails listados arriba
   - La contraseña puede ser cualquier cosa (backend mock)
   - Click en "Iniciar Sesión"

## 🔧 Correcciones Realizadas

### 1. URLs de API
✅ Cambiadas de `http://localhost:3001/api` a `/api` (usando proxy de Vite)
✅ Todos los componentes actualizados:
- AuthContext.jsx
- GestionPremios.jsx
- AdminRifas.jsx
- CrearRifa.jsx
- EditarRifa.jsx
- PlantillasPremios.jsx

### 2. Configuración de Axios
✅ Creado `utils/axios.js` con instancia configurada
✅ BaseURL apuntando a `/api` para usar proxy
✅ Interceptor automático para agregar token de autorización

### 3. Configuración de CORS
✅ Backend `.env` actualizado:
```
CORS_ORIGIN=http://localhost:3001
```

### 4. Configuración de Vite
✅ `vite.config.js` actualizado:
```javascript
server: {
  port: 3001,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

### 5. AuthContext
✅ Corregida la lectura de respuesta del backend
✅ Estructura de respuesta: `data.data.usuario` → `{ token, usuario }`
✅ Layout ahora usa `useAuth()` directamente

### 6. Credenciales
✅ Actualizadas para coincidir con el backend mock:
- `@rifaparatodos.com` en vez de `@rifas.com`

## 🧪 Flujo de Prueba Recomendado

1. **Test de Login**
   ```
   1. Ir a http://localhost:3001/login
   2. Click en botón "Admin"
   3. Debería redirigir a /admin/dashboard
   4. Verificar que el Sidebar muestre las opciones de administrador
   5. Verificar que el Header muestre el nombre del usuario
   ```

2. **Test de Navegación**
   ```
   1. Estando logueado como admin
   2. Click en "Rifas" en el sidebar
   3. Debería cargar la lista de rifas
   4. Click en "Opciones a Ganar"
   5. Debería cargar la gestión de premios
   ```

3. **Test de Logout**
   ```
   1. Click en el avatar del usuario (esquina superior derecha)
   2. Click en "Cerrar Sesión"
   3. Debería redirigir a /login
   4. LocalStorage debería estar limpio
   ```

4. **Test de Protección de Rutas**
   ```
   1. Sin estar logueado, intentar acceder a /admin/dashboard
   2. Debería redirigir a /login
   
   3. Loguearse como vendedor
   4. Intentar acceder a /admin/dashboard
   5. Debería redirigir a /vendedor/dashboard
   ```

## ❌ Errores Solucionados

1. ✅ **"Failed to fetch"**
   - Causa: URL incorrecta (localhost:3001 en vez de usar proxy)
   - Solución: Cambiado a rutas relativas `/api`

2. ✅ **"Cannot read properties of undefined (reading 'rol')"**
   - Causa: Layout no recibía el usuario del AuthContext
   - Solución: Layout usa `useAuth()` directamente

3. ✅ **"CORS error"**
   - Causa: Backend permitía localhost:3000 pero frontend estaba en 3001
   - Solución: Actualizado CORS_ORIGIN a localhost:3001

4. ✅ **"Usuario undefined después del login"**
   - Causa: AuthContext leía `data.usuario` pero backend devuelve `data.data.usuario`
   - Solución: Extraer correctamente `data.data.token` y `data.data.usuario`

## 📊 Estado Actual del Sistema

### ✅ Funcionando
- Layout con Sidebar y Header
- Sistema de autenticación (AuthContext)
- Protección de rutas (PrivateRoute, RoleGuard)
- Login con botones de prueba rápida
- Redireccionamiento por rol
- Navegación dinámica según rol
- AdminDashboard (componente existente)
- AdminRifas, CrearRifa, EditarRifa (componentes existentes)
- GestionPremios (componente existente)

### ⚠️ Por Implementar
- Dashboard de Supervisor
- Dashboard de Vendedor  
- Dashboard de Cliente
- Vistas CRUD adicionales de cada rol
- Componentes de reportes
- Componentes de configuración

## 🔍 Debug

Si algo no funciona:

1. **Verificar consola del navegador** (F12)
   - Buscar errores de red (tab Network)
   - Buscar errores de JavaScript (tab Console)

2. **Verificar backend**
   ```powershell
   cd D:\Program\actualizacionWeb\backend
   node server.js
   ```
   Debería mostrar:
   ```
   🚀 Servidor corriendo en http://localhost:5000
   📊 Entorno: development
   ✅ Conexión a MySQL establecida correctamente
   ```

3. **Verificar frontend**
   ```powershell
   cd D:\Program\actualizacionWeb\frontend
   npm run dev
   ```
   Debería mostrar:
   ```
   VITE v5.4.21  ready in XXX ms
   ➜  Local:   http://localhost:3001/
   ```

4. **Verificar localStorage**
   - Abrir DevTools (F12)
   - Tab "Application" → "Local Storage" → "http://localhost:3001"
   - Debería haber:
     - `token`: "mock_jwt_token_12345"
     - `usuario`: {"id":1,"nombre":"Admin",...}

---

**Última actualización**: 4 de diciembre de 2025
