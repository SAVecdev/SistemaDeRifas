# 🚀 Inicio Rápido - Sistema de Sesiones

## ¿Qué se implementó?

✅ **Registro automático de inicios de sesión** - Cada login crea un registro con IP, navegador, SO, etc.
✅ **Validación con timeout de 3 horas** - Sesiones expiran tras 3 horas de inactividad
✅ **Panel de administración completo** - Vista en `/admin/sesiones` para gestionar sesiones
✅ **Cierre manual de sesiones** - Los admins pueden cerrar sesiones de cualquier usuario
✅ **Expiración automática** - Cron job ejecuta cada 5 minutos para limpiar sesiones inactivas

---

## 🎯 Inicio Rápido

### 1. Iniciar el Backend
```powershell
cd d:\Program\actualizacionWeb\backend
npm start
# o
node server.js
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:5000
⏱️  Iniciando verificación automática de sesiones inactivas...
```

### 2. Iniciar el Frontend
```powershell
cd d:\Program\actualizacionWeb\frontend
npm run dev
```

### 3. Acceder al Panel de Sesiones

1. Abre `http://localhost:3001`
2. Inicia sesión como **administrador**
3. En el menú lateral, haz clic en **"🔐 Sesiones Activas"**
4. ¡Verás todas las sesiones activas en tiempo real!

---

## 📱 Funciones del Panel

### Ver Sesiones Activas
- **Estadísticas**: Total de sesiones, por rol (admin, vendedor, cliente)
- **Tabla detallada**: Usuario, IP, dispositivo, tiempo restante
- **Actualización automática**: Cada 30 segundos

### Filtrar y Buscar
- 🔍 Buscar por nombre, email o IP
- 📋 Filtrar por rol
- 🔄 Ordenar por fecha

### Gestionar Sesiones
- 🚫 **Cerrar sesión específica**: Click en botón rojo
- ❌ **Cerrar todas las sesiones de un usuario**: Click en botón gris
- ⏰ **Expirar sesiones inactivas**: Botón "Expirar Inactivas"

---

## 🔐 Seguridad

### Timeout de Sesión
- **3 horas de inactividad** → Sesión expira automáticamente
- El tiempo se reinicia con cada petición al backend
- Usuarios ven alerta "Sesión expirada" y son redirigidos a login

### Registro de Actividad
Cada sesión guarda:
- Usuario
- IP
- Navegador y Sistema Operativo
- Fecha de inicio
- Último acceso
- Duración

---

## 🛠️ Comandos Útiles

### Script de Gestión (PowerShell)
```powershell
# Ver estadísticas
.\gestionar-sesiones.ps1 stats

# Ejecutar pruebas
.\gestionar-sesiones.ps1 test

# Expirar sesiones manualmente
.\gestionar-sesiones.ps1 expirar

# Limpiar sesiones antiguas
.\gestionar-sesiones.ps1 limpiar
```

### Consultas SQL Directas
```sql
-- Ver sesiones activas
SELECT * FROM session WHERE estado = 'activa';

-- Ver sesiones de un usuario
SELECT * FROM session WHERE id_usuario = [id] ORDER BY fecha_inicio DESC;

-- Contar sesiones por estado
SELECT estado, COUNT(*) as total FROM session GROUP BY estado;
```

---

## 🧪 Probar el Sistema

### Prueba Básica
1. Inicia sesión en 2 navegadores con usuarios diferentes
2. Como admin, ve a `/admin/sesiones`
3. Deberías ver ambas sesiones listadas
4. Cierra una sesión desde el panel
5. El usuario afectado será desconectado

### Prueba de Timeout
1. Inicia sesión
2. Deja inactivo por 3+ horas
3. Intenta navegar
4. Verás alerta de sesión expirada

---

## 📊 API Endpoints

### Públicos (autenticados)
- `POST /api/auth/login` - Inicia sesión y crea registro
- `POST /api/auth/logout` - Cierra sesión

### Admin (solo administradores)
- `GET /api/sesiones/activas` - Lista sesiones activas
- `DELETE /api/sesiones/admin/cerrar/:id` - Cierra sesión específica
- `DELETE /api/sesiones/admin/cerrar-usuario/:userId` - Cierra todas las sesiones de un usuario
- `POST /api/sesiones/expirar-inactivas` - Expira sesiones >3h inactivas
- `DELETE /api/sesiones/limpiar` - Elimina sesiones >30 días cerradas

---

## 🐛 Solución de Problemas

### El panel no muestra sesiones
- ✅ Confirma que iniciaste sesión como **administrador**
- ✅ Abre DevTools → Network y verifica la llamada a `/api/sesiones/activas`
- ✅ Revisa que el backend está corriendo

### Las sesiones no expiran
- ✅ Verifica los logs del backend (debe mostrar el cron ejecutándose)
- ✅ Ejecuta manualmente: `POST /api/sesiones/expirar-inactivas`
- ✅ Confirma que el timeout es 180 minutos en `sessionModel.js`

### Error "Token no proporcionado"
- ✅ Cierra sesión y vuelve a iniciar
- ✅ Limpia localStorage del navegador
- ✅ Verifica que el token se guarda correctamente

---

## 📚 Documentación Completa

Para más detalles, consulta:
- [`SISTEMA_SESIONES.md`](SISTEMA_SESIONES.md) - Documentación técnica completa
- [`PRUEBAS_SESIONES.md`](PRUEBAS_SESIONES.md) - Guía de pruebas paso a paso

---

## ✅ Características Clave

| Característica | Estado | Detalles |
|---------------|--------|----------|
| Registro de login | ✅ | Automático en cada inicio de sesión |
| Timeout 3 horas | ✅ | Desde último acceso |
| Panel admin | ✅ | `/admin/sesiones` |
| Cierre manual | ✅ | Individual o múltiple |
| Expiración auto | ✅ | Cron cada 5 minutos |
| Actualización auto panel | ✅ | Cada 30 segundos |
| Detección dispositivo | ✅ | Navegador y SO |
| Logs actividad | ✅ | En consola backend |

---

**¡Tu sistema de sesiones está listo para usar! 🎉**

**Acceso directo al panel**: `http://localhost:3001/admin/sesiones`
