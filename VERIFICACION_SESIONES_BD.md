# 🔐 Verificación Estricta de Sesiones - Actualización

## ✅ Mejoras Implementadas

Se ha mejorado el sistema de sesiones para **verificar SIEMPRE en la base de datos** antes de permitir el acceso:

### 1. **Verificación al Cargar la Aplicación**
Cuando un usuario abre la aplicación con un token guardado:
- ✅ Se valida el token con el endpoint `/api/sesiones/validate/:token`
- ✅ Se verifica que la sesión esté activa en la BD
- ✅ Si no hay sesión en BD → Cierra sesión y redirige a login
- ✅ Si la sesión expiró → Muestra alerta y cierra sesión

**Ubicación**: `frontend/src/context/AuthContext.jsx` - función `verificarSesion()`

### 2. **Verificación en Cada Petición**
Cada vez que el frontend hace una petición al backend:
- ✅ El middleware `verificarToken` valida el token JWT
- ✅ Verifica que la sesión exista y esté activa en BD
- ✅ Verifica que no haya expirado (3 horas inactividad)
- ✅ Actualiza el `ultimo_acceso` en BD
- ✅ Si no hay sesión o expiró → Error 401 con código `SESSION_EXPIRED`

**Ubicación**: `backend/middleware/auth.js`

### 3. **Verificación Periódica (Cada 2 Minutos)**
Mientras el usuario está usando la aplicación:
- ✅ Hook personalizado valida sesión cada 2 minutos
- ✅ Consulta directamente a la BD si la sesión sigue activa
- ✅ Si detecta sesión expirada → Muestra alerta y cierra sesión
- ✅ No interrumpe al usuario si hay errores de red

**Ubicación**: `frontend/src/utils/useSessionValidator.js`

---

## 🛡️ Flujo de Seguridad

### Escenario 1: Usuario abre la aplicación
```
1. Usuario tiene token en localStorage
2. AuthContext llama a verificarSesion()
3. Frontend → GET /api/sesiones/validate/:token
4. Backend verifica en tabla `session`:
   - ¿Existe el token?
   - ¿Estado = 'activa'?
   - ¿Último acceso < 3 horas?
5. Si TODO es válido → Permite acceso
6. Si ALGO falla → Cierra sesión y redirige a login
```

### Escenario 2: Usuario navega en la aplicación
```
1. Usuario hace clic en cualquier opción
2. Frontend hace petición al backend
3. Middleware verificarToken intercepta:
   - Valida JWT
   - Consulta BD: SELECT * FROM session WHERE token=? AND estado='activa'
   - Verifica tiempo de inactividad
4. Si válido:
   - UPDATE session SET ultimo_acceso = NOW()
   - Permite continuar
5. Si inválido:
   - UPDATE session SET estado='cerrada'
   - Retorna error 401
   - Frontend cierra sesión
```

### Escenario 3: Administrador cierra sesión desde panel
```
1. Admin hace clic en 🚫 cerrar sesión
2. Backend → UPDATE session SET estado='cerrada' WHERE id=?
3. Usuario afectado:
   - Próxima petición → Error 401 (no hay sesión activa en BD)
   - Verificación periódica (2 min) → Detecta sesión inválida
   - Se cierra sesión automáticamente
```

### Escenario 4: Sesión expira por inactividad (3 horas)
```
1. Usuario inactivo por 3+ horas
2. Cron job ejecuta cada 5 minutos:
   - UPDATE session SET estado='expirada' WHERE ultimo_acceso > 180min
3. Usuario intenta hacer algo:
   - Middleware verifica BD
   - Encuentra estado='expirada' O no encuentra sesión activa
   - Retorna error 401 con SESSION_EXPIRED
   - Frontend muestra alerta y cierra sesión
```

---

## 📊 Validaciones en Múltiples Capas

| Capa | Frecuencia | Acción si Inválida |
|------|-----------|-------------------|
| **1. Al cargar app** | Una vez al inicio | Redirige a login inmediatamente |
| **2. En cada petición** | Cada petición HTTP | Error 401, interceptor cierra sesión |
| **3. Verificación periódica** | Cada 2 minutos | Alerta + cierra sesión |
| **4. Cron job backend** | Cada 5 minutos | Marca sesiones como expiradas |

---

## 🔍 Logs de Actividad

El sistema ahora registra:

```javascript
// Sesión válida y actualizada
✅ Sesión actualizada - Usuario: admin@rifas.com | IP: 192.168.1.100

// Acceso denegado por sesión inválida
⚠️ Acceso denegado - Sesión inválida o expirada para usuario: admin@rifas.com

// Sesión no encontrada en BD
⚠️ Sesión no encontrada en BD para token de usuario: admin@rifas.com
```

---

## 🧪 Cómo Probar

### Prueba 1: Token sin sesión en BD
```sql
-- Eliminar sesión manualmente de BD
DELETE FROM session WHERE token_sesion = 'tu_token';

-- Intentar acceder a la aplicación
-- Resultado: Debe cerrar sesión inmediatamente
```

### Prueba 2: Administrador cierra sesión
1. Inicia sesión en 2 navegadores (Usuario A y Usuario B)
2. Como admin, cierra sesión de Usuario A desde `/admin/sesiones`
3. Usuario A intenta navegar
4. **Resultado**: Sesión cerrada automáticamente

### Prueba 3: Verificación periódica
1. Inicia sesión
2. Abre DevTools → Console
3. Cada 2 minutos verás validación en Network tab
4. Elimina sesión de BD
5. En máximo 2 minutos, se cerrará la sesión

---

## 📝 Archivos Modificados

### Backend:
- ✅ `backend/middleware/auth.js` - Logs mejorados, validación estricta
- ✅ `backend/routes/sesiones.js` - Endpoint `/validate/:token` mejorado

### Frontend:
- ✅ `frontend/src/context/AuthContext.jsx` - Verificación con BD al cargar
- ✅ `frontend/src/utils/useSessionValidator.js` - Hook de verificación periódica (NUEVO)
- ✅ `frontend/src/Shared/Layout.jsx` - Integra validación periódica

---

## ⚙️ Configuración

### Frecuencia de Verificación Periódica
Para cambiar de 2 minutos a otro valor:

```javascript
// En frontend/src/utils/useSessionValidator.js
const interval = setInterval(validarSesion, 2 * 60 * 1000); // 2 minutos
// Cambiar a: 1 * 60 * 1000 para 1 minuto
// Cambiar a: 5 * 60 * 1000 para 5 minutos
```

### Desactivar Logs Detallados
```javascript
// En backend/middleware/auth.js
// Comentar las líneas console.log() y console.warn()
```

---

## 🎯 Resumen

Ahora el sistema:
1. ✅ **Siempre verifica en BD** antes de permitir acceso
2. ✅ **No confía solo en localStorage** del navegador
3. ✅ **Valida en 3 momentos diferentes**: inicio, cada petición, cada 2 min
4. ✅ **Cierra sesiones inválidas automáticamente**
5. ✅ **Registra toda la actividad** en logs del backend
6. ✅ **Respeta el cierre manual** desde panel de admin

**No es posible acceder sin sesión activa en la base de datos** ✅

---

**Fecha**: 13 de diciembre de 2025
