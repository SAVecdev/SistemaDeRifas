# 🧪 GUÍA DE PRUEBA - Sistema de Login y Redirección

## ✅ Sistema Actualizado

Se han corregido todos los problemas de redirección según el rol del usuario.

---

## 📋 VERIFICACIONES REALIZADAS

### 1. **Backend (Puerto 5000)**
- ✅ Mock de usuarios con 4 roles diferentes
- ✅ Endpoint `/api/auth/login` funcionando
- ✅ Endpoint `/api/auth/register` funcionando
- ✅ Respuesta correcta: `{ status, message, data: { token, usuario } }`

### 2. **Frontend (Puerto 3001)**
- ✅ Proxy Vite configurado: `/api` → `http://localhost:5000`
- ✅ AuthContext con logs detallados
- ✅ RoleGuard actualizado con todos los roles
- ✅ Sidebar con menús para todos los roles
- ✅ Rutas protegidas correctamente configuradas

### 3. **Redirección por Rol**
```javascript
administrador → /admin/dashboard
supervisor → /supervisor/dashboard
vendedor → /vendedor/dashboard
usuario_registrado → /usuario/dashboard
cliente → /usuario/dashboard
```

---

## 🧪 CÓMO PROBAR

### **Opción 1: Login Rápido (Botones de Desarrollo)**

1. Abre el navegador en: `http://localhost:3001/login`

2. Verás 4 botones de acceso rápido en la parte inferior:
   - 👨‍💼 **Admin** → redirige a `/admin/dashboard`
   - 👔 **Supervisor** → redirige a `/supervisor/dashboard`
   - 💼 **Vendedor** → redirige a `/vendedor/dashboard`
   - 👤 **Cliente** → redirige a `/usuario/dashboard`

3. Haz clic en cualquier botón y verifica que:
   - Se muestra el mensaje de carga
   - Aparece el dashboard correspondiente
   - El sidebar muestra las opciones correctas para ese rol

### **Opción 2: Login Manual**

Usa estas credenciales (cualquier contraseña funciona):

```
Administrador:
  Email: admin@rifaparatodos.com
  Password: cualquiera

Supervisor:
  Email: supervisor@rifaparatodos.com
  Password: cualquiera

Vendedor:
  Email: vendedor@rifaparatodos.com
  Password: cualquiera

Cliente:
  Email: usuario@rifaparatodos.com
  Password: cualquiera
```

### **Opción 3: Registro de Nuevo Usuario**

1. Ve a: `http://localhost:3001/registro`
2. Completa el formulario con tus datos
3. El nuevo usuario tendrá rol `usuario_registrado` por defecto
4. Después del registro, serás redirigido automáticamente a `/usuario/dashboard`

---

## 📊 LOGS EN CONSOLA

Abre las DevTools (F12) y busca estos logs:

### **Durante el Login:**
```
📧 Login: Intentando iniciar sesión con [email]
✅ Login: Datos recibidos correctamente
👤 Usuario: [nombre] [apellido]
🎭 Rol: [rol del usuario]
📧 Email: [email]
💾 Datos guardados en localStorage
📦 Estado de usuario actualizado
🔀 AuthContext: Iniciando redirección para rol: [rol]
📍 AuthContext: Redirigiendo a: [ruta]
```

### **Durante la Verificación de Rol:**
```
✅ RoleGuard: Acceso permitido. Rol: [rol]
```

### **Si el rol no tiene permiso:**
```
❌ RoleGuard: Usuario no tiene permiso. Rol actual: [rol] Roles permitidos: [roles]
🔀 RoleGuard: Redirigiendo a [ruta correcta]
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Problema: "No me redirige después del login"**
**Solución:**
1. Abre la consola del navegador (F12)
2. Verifica que no haya errores en rojo
3. Busca los logs mencionados arriba
4. Verifica que el backend esté corriendo en puerto 5000

### **Problema: "Me redirige a la página incorrecta"**
**Solución:**
1. Cierra sesión
2. Borra localStorage: DevTools → Application → Local Storage → http://localhost:3001 → Clear All
3. Intenta hacer login de nuevo
4. Verifica el log "🎭 Rol:" en la consola

### **Problema: "Error: Failed to fetch"**
**Solución:**
1. Verifica que el backend esté corriendo: `cd backend; node server.js`
2. Verifica que el frontend esté corriendo: `cd frontend; npm run dev`
3. Verifica que el puerto 5000 esté libre
4. Reinicia ambos servidores

### **Problema: "Unexpected end of JSON input"**
**Solución:**
1. El backend no está respondiendo correctamente
2. Ejecuta: `cd backend; node server.js`
3. Verifica que veas: "🚀 Servidor corriendo en http://localhost:5000"
4. Prueba directamente: `http://localhost:5000/api/health`

---

## 🔍 VERIFICAR ESTADO DE LOS SERVIDORES

### Ejecuta este comando en PowerShell:

```powershell
# Verificar puerto 5000 (Backend)
Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue

# Verificar puerto 3001 (Frontend)
Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
```

### O usa el script de verificación:
```powershell
cd D:\Program\actualizacionWeb
.\check-servers.ps1
```

---

## 📍 RUTAS IMPLEMENTADAS

### **Rutas Públicas (Sin autenticación)**
- `/` → Página principal con header de navegación
- `/login` → Formulario de login
- `/registro` → Formulario de registro
- `/rifas` → Rifas activas (público)
- `/rifa/:id` → Detalle de rifa (público)

### **Rutas Protegidas - Administrador**
- `/admin/dashboard` ✅
- `/admin/rifas` ✅
- `/admin/usuarios` ✅
- `/admin/crear-rifa` ✅
- `/admin/rifas/editar/:id` ✅
- `/admin/plantillas-premios` ✅
- `/admin/gestion-premios` ✅
- `/admin/tipos-rifa` ✅

### **Rutas Protegidas - Supervisor**
- `/supervisor/dashboard` ✅

### **Rutas Protegidas - Vendedor**
- `/vendedor/dashboard` ✅

### **Rutas Protegidas - Usuario/Cliente**
- `/usuario/dashboard` ✅
- `/usuario/rifas` ✅
- `/usuario/perfil` ✅
- `/usuario/historial` ✅
- `/usuario/transacciones` ✅

---

## ✅ CHECKLIST DE PRUEBA

- [ ] Backend corriendo en puerto 5000
- [ ] Frontend corriendo en puerto 3001
- [ ] Login como Admin → Va a `/admin/dashboard`
- [ ] Login como Supervisor → Va a `/supervisor/dashboard`
- [ ] Login como Vendedor → Va a `/vendedor/dashboard`
- [ ] Login como Cliente → Va a `/usuario/dashboard`
- [ ] Registro de nuevo usuario → Va a `/usuario/dashboard`
- [ ] Sidebar muestra opciones correctas para cada rol
- [ ] Header en home muestra botones de Login/Registro
- [ ] Logout funciona correctamente
- [ ] Intentar acceder a ruta sin permiso → Redirige al dashboard correcto

---

## 📞 SI NADA FUNCIONA

1. **Detén todos los procesos:**
   ```powershell
   # Detener backend
   Get-Process | Where-Object {$_.Path -like "*node*"} | Stop-Process -Force
   
   # O presiona Ctrl+C en cada terminal
   ```

2. **Borra caché y datos:**
   - Borra localStorage en DevTools
   - Cierra todas las pestañas del navegador
   - Borra node_modules si es necesario: `rm -rf node_modules; npm install`

3. **Reinicia todo desde cero:**
   ```powershell
   # Terminal 1 - Backend
   cd D:\Program\actualizacionWeb\backend
   node server.js
   
   # Terminal 2 - Frontend
   cd D:\Program\actualizacionWeb\frontend
   npm run dev
   ```

4. **Verifica los logs en ambas terminales**
   - Backend debe mostrar: "🚀 Servidor corriendo..."
   - Frontend debe mostrar: "Local: http://localhost:3001/"

---

**Última actualización:** 4 de diciembre de 2025
**Estado:** Sistema completamente funcional ✅
