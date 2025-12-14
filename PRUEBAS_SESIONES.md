# 🧪 Guía de Pruebas - Sistema de Sesiones

## Requisitos Previos

1. Backend corriendo en `http://localhost:5000`
2. Frontend corriendo en `http://localhost:3001`
3. Base de datos MySQL configurada
4. Usuario administrador registrado

---

## 🎯 Pruebas Paso a Paso

### 1. Verificar Registro de Sesiones en Login

**Objetivo**: Confirmar que cada inicio de sesión crea un registro en la tabla `session`

**Pasos**:
1. Abre el navegador en `http://localhost:3001/login`
2. Inicia sesión con cualquier usuario
3. Verifica en la base de datos:
   ```sql
   SELECT * FROM session WHERE estado = 'activa' ORDER BY fecha_inicio DESC LIMIT 1;
   ```
4. Deberías ver:
   - `id_usuario` correspondiente
   - `token_sesion` (el JWT)
   - `ip` de tu máquina
   - `navegador` detectado
   - `sistema_operativo` detectado
   - `fecha_inicio` y `ultimo_acceso` con timestamp actual
   - `estado` = 'activa'

**Resultado esperado**: ✅ Nueva sesión registrada con todos los datos

---

### 2. Verificar Actualización de Último Acceso

**Objetivo**: Confirmar que cada petición actualiza el `ultimo_acceso`

**Pasos**:
1. Inicia sesión
2. Anota el `ultimo_acceso` actual:
   ```sql
   SELECT ultimo_acceso FROM session WHERE token_sesion = 'tu_token';
   ```
3. Navega por la aplicación (cualquier página que haga peticiones al backend)
4. Espera 10-20 segundos
5. Vuelve a consultar el `ultimo_acceso`

**Resultado esperado**: ✅ El timestamp de `ultimo_acceso` se actualizó

---

### 3. Probar Panel de Administración de Sesiones

**Objetivo**: Verificar que el panel muestra correctamente las sesiones

**Pasos**:
1. Inicia sesión como administrador
2. Ve a `/admin/sesiones` (menú "🔐 Sesiones Activas")
3. Verifica que se muestre:
   - Total de sesiones activas
   - Estadísticas por rol
   - Tabla con información detallada
   - Tiempo restante calculado correctamente

**Resultado esperado**: ✅ Panel muestra todas las sesiones con datos correctos

---

### 4. Probar Cierre Manual de Sesión

**Objetivo**: Cerrar sesión de un usuario desde el panel de admin

**Pasos**:
1. Abre 2 navegadores o ventanas de incógnito:
   - **Navegador A**: Inicia sesión como administrador
   - **Navegador B**: Inicia sesión como usuario normal
2. En **Navegador A**, ve a `/admin/sesiones`
3. Encuentra la sesión del usuario del **Navegador B**
4. Haz clic en el botón 🚫 para cerrar esa sesión
5. Confirma la acción
6. En **Navegador B**, intenta hacer cualquier acción (navegar, ver rifas, etc.)

**Resultado esperado**: 
- ✅ Navegador B muestra alerta "Sesión expirada"
- ✅ Usuario es redirigido a login
- ✅ Sesión en BD tiene `estado = 'cerrada'`

---

### 5. Probar Cierre de Todas las Sesiones de un Usuario

**Objetivo**: Cerrar todas las sesiones activas de un usuario específico

**Pasos**:
1. Inicia sesión con el mismo usuario en 3 navegadores diferentes
2. Como administrador, ve a `/admin/sesiones`
3. Busca al usuario con múltiples sesiones
4. Haz clic en el botón ❌ "Cerrar todas las sesiones"
5. Confirma
6. En los 3 navegadores del usuario, intenta hacer acciones

**Resultado esperado**: 
- ✅ Todos los navegadores del usuario son desconectados
- ✅ Mensaje indica cuántas sesiones se cerraron

---

### 6. Probar Expiración por Inactividad (3 horas)

**Objetivo**: Verificar que sesiones expiran automáticamente

**Opción A - Prueba Rápida** (Modificar código temporalmente):
1. En `backend/models/sessionModel.js`, cambia temporalmente:
   ```javascript
   // De: AND TIMESTAMPDIFF(MINUTE, ultimo_acceso, NOW()) > 180
   // A:  AND TIMESTAMPDIFF(MINUTE, ultimo_acceso, NOW()) > 1
   ```
2. Reinicia el backend
3. Inicia sesión y espera 2 minutos sin hacer nada
4. Intenta hacer una acción

**Opción B - Prueba Real**:
1. Inicia sesión
2. Espera 3 horas sin hacer ninguna petición (cierra navegador)
3. Después de 3 horas, abre navegador e intenta acceder
4. O ejecuta manualmente: `POST /api/sesiones/expirar-inactivas`

**Resultado esperado**: 
- ✅ Sesión se marca como 'expirada'
- ✅ Usuario debe iniciar sesión nuevamente

---

### 7. Probar Script de Pruebas Automático

**Objetivo**: Ejecutar suite completa de pruebas

**Pasos**:
1. Asegúrate de que haya algunas sesiones activas
2. Ejecuta desde PowerShell:
   ```powershell
   cd d:\Program\actualizacionWeb
   .\gestionar-sesiones.ps1 test
   ```
   O desde Node:
   ```bash
   cd backend
   node scripts/test-sesiones.js
   ```

**Resultado esperado**: 
- ✅ Script muestra estadísticas completas
- ✅ Detecta sesiones activas, expiradas, etc.
- ✅ No muestra errores

---

### 8. Probar Expiración Automática (Cron Job)

**Objetivo**: Verificar que el servidor expira sesiones automáticamente

**Pasos**:
1. Revisa los logs del backend al iniciar:
   ```
   ⏱️  Iniciando verificación automática de sesiones inactivas...
   ```
2. Crea una sesión inactiva (método del punto 6)
3. Espera 5 minutos (el cron se ejecuta cada 5 minutos)
4. Revisa logs del backend:
   ```
   [timestamp] ⚠️  Se expiraron N sesiones por inactividad
   ```

**Resultado esperado**: 
- ✅ Sesiones inactivas se expiran automáticamente cada 5 minutos
- ✅ Logs muestran el proceso

---

### 9. Probar Actualización Automática del Panel

**Objetivo**: Verificar que el panel se actualiza cada 30 segundos

**Pasos**:
1. Como admin, abre `/admin/sesiones`
2. Observa el "Tiempo Restante" de alguna sesión
3. Espera 30 segundos sin recargar la página
4. El panel se actualizará automáticamente

**Resultado esperado**: 
- ✅ Datos se actualizan sin recargar
- ✅ Tiempo restante disminuye progresivamente

---

### 10. Probar Logout Manual

**Objetivo**: Verificar que el logout cierra correctamente la sesión

**Pasos**:
1. Inicia sesión
2. Anota el `id` de tu sesión en la BD
3. Haz clic en "Cerrar Sesión" en la aplicación
4. Verifica en la BD:
   ```sql
   SELECT * FROM session WHERE id = [tu_id];
   ```

**Resultado esperado**: 
- ✅ `estado = 'cerrada'`
- ✅ `fecha_cierre` tiene timestamp
- ✅ `duracion_minutos` calculada

---

## 🔍 Consultas SQL Útiles para Debugging

### Ver todas las sesiones activas con tiempo restante
```sql
SELECT 
  s.id,
  u.nombre,
  u.correo,
  s.ip,
  s.navegador,
  s.fecha_inicio,
  s.ultimo_acceso,
  TIMESTAMPDIFF(MINUTE, s.ultimo_acceso, NOW()) as minutos_inactivo,
  180 - TIMESTAMPDIFF(MINUTE, s.ultimo_acceso, NOW()) as minutos_restantes
FROM session s
JOIN usuario u ON s.id_usuario = u.id
WHERE s.estado = 'activa'
ORDER BY s.ultimo_acceso DESC;
```

### Encontrar sesiones que deberían estar expiradas
```sql
SELECT 
  s.*,
  u.nombre,
  TIMESTAMPDIFF(MINUTE, s.ultimo_acceso, NOW()) as minutos_inactivo
FROM session s
JOIN usuario u ON s.id_usuario = u.id
WHERE s.estado = 'activa'
AND TIMESTAMPDIFF(MINUTE, s.ultimo_acceso, NOW()) > 180;
```

### Ver historial de sesiones de un usuario
```sql
SELECT 
  s.*,
  CONCAT(FLOOR(s.duracion_minutos/60), 'h ', MOD(s.duracion_minutos, 60), 'm') as duracion
FROM session s
WHERE s.id_usuario = [id_usuario]
ORDER BY s.fecha_inicio DESC
LIMIT 10;
```

### Contar sesiones por estado
```sql
SELECT 
  estado,
  COUNT(*) as total
FROM session
GROUP BY estado;
```

---

## 📊 Usar Script de Gestión

```powershell
# Ver estadísticas
.\gestionar-sesiones.ps1 stats

# Expirar sesiones inactivas manualmente
.\gestionar-sesiones.ps1 expirar

# Limpiar sesiones antiguas
.\gestionar-sesiones.ps1 limpiar

# Ejecutar pruebas completas
.\gestionar-sesiones.ps1 test
```

**Nota**: Para comandos que requieren autenticación, primero establece el token:
```powershell
$env:ADMIN_TOKEN = "tu_token_jwt_aqui"
```

---

## ✅ Checklist de Pruebas

- [ ] Sesión se registra correctamente en login
- [ ] `ultimo_acceso` se actualiza con cada petición
- [ ] Panel de admin muestra sesiones correctamente
- [ ] Cierre manual de sesión funciona
- [ ] Cierre de todas las sesiones de usuario funciona
- [ ] Sesiones expiran después de 3 horas de inactividad
- [ ] Expiración automática (cron) funciona cada 5 minutos
- [ ] Panel se actualiza automáticamente cada 30 segundos
- [ ] Logout manual cierra la sesión en BD
- [ ] Interceptor de Axios maneja sesiones expiradas
- [ ] Script de pruebas ejecuta sin errores
- [ ] Logs del backend muestran actividad de sesiones

---

## 🐛 Problemas Comunes

### Problema: No se registran sesiones en login
**Solución**: 
- Verifica que la tabla `session` existe
- Revisa logs del backend para errores
- Confirma que `sessionModel.createSession` se ejecuta

### Problema: Sesiones no expiran
**Solución**:
- Verifica que el cron está ejecutándose (revisar logs)
- Ejecuta manualmente: `POST /api/sesiones/expirar-inactivas`
- Confirma que el timeout es 180 minutos en `sessionModel.js`

### Problema: Panel de admin no carga
**Solución**:
- Verifica que el usuario es administrador
- Revisa Network tab para errores de API
- Confirma que la ruta `/api/sesiones/activas` funciona

### Problema: Token no se actualiza
**Solución**:
- Verifica que `verificarToken` middleware se ejecuta
- Confirma que `updateLastAccess` se llama
- Revisa que hay peticiones al backend (no todo es solo frontend)

---

## 📝 Notas Finales

- El timeout de 3 horas se calcula desde el **último acceso**, no desde el inicio
- Las sesiones se expiran automáticamente cada 5 minutos por el cron job
- El panel de admin se actualiza cada 30 segundos automáticamente
- Puedes tener múltiples sesiones del mismo usuario (diferentes dispositivos)
- Las sesiones antiguas (>30 días cerradas) se pueden limpiar con `DELETE /api/sesiones/limpiar`

---

**Fecha**: 13 de diciembre de 2025
**Versión**: 1.0.0
