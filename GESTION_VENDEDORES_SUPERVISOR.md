# 👥 Gestión de Vendedores para Supervisores

## 📋 Descripción

Los supervisores ahora pueden gestionar a sus vendedores asignados directamente desde el sistema. Esta funcionalidad permite:

- ✅ Ver listado de vendedores supervisados
- 📊 Consultar estadísticas detalladas de cada vendedor
- 🔒 Activar/Desactivar vendedores
- 👥 Ver clientes registrados por cada vendedor
- 💰 Revisar ventas y premios pagados

## 🚀 Características Principales

### 1. **Listado de Vendedores**
Cada tarjeta muestra:
- 📸 Foto de perfil (o iniciales si no tiene)
- 📧 Email y 📱 teléfono de contacto
- 📍 Dirección registrada
- 🟢/🔴 Estado (Activo/Inactivo)
- 📊 Estadísticas del mes actual:
  - Ventas realizadas
  - Total generado en dinero
  - Clientes registrados

### 2. **Detalles del Vendedor**
Al hacer clic en "📊 Ver Detalles" se muestra:
- 💰 Ventas totales y monto total histórico
- 📅 Ventas del mes actual
- 👥 Clientes totales registrados
- 🏆 Premios pagados y monto de premios
- 📊 Promedio por venta
- 🗓️ Fecha de última venta

### 3. **Control de Estado**
Los supervisores pueden:
- ✅ **Activar**: Permite al vendedor acceder al sistema y realizar ventas
- 🔒 **Desactivar**: Bloquea el acceso del vendedor temporalmente

> ⚠️ **Importante**: Solo puedes modificar vendedores que están bajo tu supervisión.

## 🔐 Permisos y Seguridad

El sistema implementa **validación en el backend** para garantizar que:

1. ✅ Los supervisores solo ven sus vendedores asignados
2. ✅ No pueden modificar vendedores de otros supervisores
3. ✅ Las estadísticas solo muestran datos de vendedores supervisados
4. ✅ Cada acción verifica los permisos antes de ejecutarse

## 📊 Asignar Vendedores a Supervisores

Para asignar vendedores a un supervisor, usa el script interactivo:

```bash
cd backend
node scripts/asignar-vendedores.js
```

Este script te permitirá:
1. Seleccionar un supervisor del listado
2. Ver vendedores disponibles para asignar
3. Asignar uno o varios vendedores
4. Confirmar la operación

### Asignación Manual (SQL)

También puedes asignar directamente desde la base de datos:

```sql
-- Asignar un vendedor a un supervisor
INSERT INTO supervision (id_supervisor, id_supervisado) 
VALUES (ID_SUPERVISOR, ID_VENDEDOR);

-- Ejemplo: Asignar vendedor #5 al supervisor #2
INSERT INTO supervision (id_supervisor, id_supervisado) 
VALUES (2, 5);

-- Ver todas las asignaciones
SELECT 
  s.id,
  sup.nombre as supervisor,
  ven.nombre as vendedor,
  s.created_at as fecha_asignacion
FROM supervision s
INNER JOIN usuario sup ON s.id_supervisor = sup.id
INNER JOIN usuario ven ON s.id_supervisado = ven.id
ORDER BY s.created_at DESC;
```

## 🛠️ Verificar Estructura

Para verificar la estructura de la tabla de supervisión:

```bash
cd backend
node scripts/check-supervision-table.js
```

Esto mostrará:
- Columnas de la tabla `supervision`
- Datos de ejemplo de asignaciones existentes

## 📱 Acceso desde el Frontend

1. Inicia sesión como **Supervisor**
2. En el menú lateral, haz clic en **🏪 Vendedores**
3. Verás el listado de tus vendedores asignados

### Estado Vacío

Si no tienes vendedores asignados, verás un mensaje:
> "No tienes vendedores asignados. Contacta al administrador para que te asigne vendedores a supervisar"

Solicita al administrador que ejecute el script de asignación o que agregue los registros manualmente.

## 🔄 Flujo de Trabajo Recomendado

### Para Administradores:
1. Crear usuario con rol "supervisor"
2. Crear usuarios con rol "vendedor"
3. Ejecutar `asignar-vendedores.js` para relacionarlos
4. El supervisor ya puede gestionar a sus vendedores

### Para Supervisores:
1. Ingresar a la sección **Vendedores**
2. Revisar el desempeño de cada vendedor
3. Consultar estadísticas detalladas
4. Activar/Desactivar según sea necesario
5. Monitorear el dashboard general filtrado por tus vendedores

## 🎨 Interfaz de Usuario

### Tarjeta de Vendedor
```
┌─────────────────────────────────────┐
│  [📸]              🟢 Activo        │
│                                     │
│  Juan Pérez                         │
│  📧 juan@email.com                  │
│  📱 0999123456                      │
│  📍 Av. Principal #123              │
│                                     │
│  ┌─────┐  ┌────────┐  ┌──────┐    │
│  │  5  │  │ $250.00│  │  12  │    │
│  │Ventas│  │Total   │  │Client│    │
│  └─────┘  └────────┘  └──────┘    │
│                                     │
│  [📊 Ver Detalles] [🔒 Desactivar] │
└─────────────────────────────────────┘
```

## 🐛 Solución de Problemas

### "No tienes vendedores asignados"
**Solución**: Ejecuta el script de asignación o inserta registros manualmente en la tabla `supervision`.

### "No tienes permiso para ver este vendedor"
**Causa**: Intentas acceder a un vendedor que no está bajo tu supervisión.  
**Solución**: Verifica las asignaciones en la tabla `supervision`.

### "Error al cargar vendedores"
**Posibles causas**:
- La tabla `supervision` no existe → Ejecuta la migración
- No hay conexión a la base de datos → Verifica las credenciales
- El servidor backend no está corriendo → Inicia el servidor

## 📈 Métricas Disponibles

### Por Vendedor:
- ✅ Ventas totales (histórico)
- 📅 Ventas del mes actual
- 💰 Montos totales y mensuales
- 👥 Clientes registrados
- 🏆 Premios pagados
- 📊 Promedio por venta
- 🗓️ Última venta registrada

### Dashboard General (filtrado):
- 💰 Ventas del mes
- 🎟️ Rifas activas
- 👥 Clientes de mis vendedores
- 📊 Ventas de hoy
- 🔢 Números vendidos hoy
- 🏆 Premios (últimos 8 días)

## 🔗 Endpoints API

### GET `/api/supervisor/vendedores/:idSupervisor`
Obtiene todos los vendedores supervisados por un supervisor.

**Respuesta**:
```json
{
  "vendedores": [
    {
      "id": 5,
      "nombre": "Juan Pérez",
      "correo": "juan@email.com",
      "telefono": "0999123456",
      "direccion": "Av. Principal",
      "activo": 1,
      "foto_perfil": "/uploads/...",
      "ventas_mes": 5,
      "monto_mes": 250.00,
      "clientes_registrados": 12
    }
  ]
}
```

### GET `/api/supervisor/vendedores/:idVendedor/estadisticas?idSupervisor=X`
Obtiene estadísticas detalladas de un vendedor específico.

**Parámetros**: `idSupervisor` (query) para validación de permisos

**Respuesta**:
```json
{
  "ventas_totales": 25,
  "monto_total": 1250.00,
  "ultima_venta": "2025-12-08T10:30:00.000Z",
  "ventas_mes": 5,
  "monto_mes": 250.00,
  "clientes_totales": 18,
  "premios_pagados": 3,
  "monto_premios": 150.00
}
```

### PUT `/api/supervisor/vendedores/:idVendedor/estado`
Cambia el estado (activo/inactivo) de un vendedor.

**Body**:
```json
{
  "activo": 1,  // 1 = activo, 0 = inactivo
  "idSupervisor": 2
}
```

**Respuesta**:
```json
{
  "mensaje": "Estado del vendedor actualizado correctamente"
}
```

## 📝 Notas Técnicas

- La tabla `supervision` usa las columnas `id_supervisor` e `id_supervisado`
- No existe columna `activo` en `supervision` (las relaciones activas están en la tabla)
- Para desactivar una supervisión, elimina el registro de la tabla
- Las estadísticas se calculan en tiempo real con cada consulta
- El filtrado se aplica en el backend para garantizar seguridad

## 🆘 Soporte

Si necesitas ayuda adicional:
1. Revisa los logs del backend (`backend/logs/`)
2. Verifica la estructura de la tabla con `check-supervision-table.js`
3. Consulta las asignaciones actuales en la base de datos
4. Contacta al administrador del sistema

---

**Versión**: 1.0.0  
**Fecha**: Diciembre 2025  
**Sistema**: RifaParaTodos
