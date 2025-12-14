# Documentación de API - Rutas Backend

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 SESIONES (`/api/sesiones`)

### POST `/api/sesiones`
Crear nueva sesión
```json
Body: {
  "id_usuario": 1,
  "token": "token_generado",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

### GET `/api/sesiones/token/:token`
Obtener sesión por token

### GET `/api/sesiones/validate/:token`
Validar si sesión es válida

### GET `/api/sesiones/activas`
Obtener todas las sesiones activas

### GET `/api/sesiones/usuario/:id_usuario`
Obtener sesiones de un usuario

### PUT `/api/sesiones/acceso/:token`
Actualizar último acceso de sesión

### PUT `/api/sesiones/cerrar/:token`
Cerrar sesión específica

### PUT `/api/sesiones/cerrar-todas/:id_usuario`
Cerrar todas las sesiones de un usuario

### POST `/api/sesiones/expirar-inactivas`
Expirar sesiones inactivas (>120 min)

### DELETE `/api/sesiones/limpiar`
Limpiar sesiones antiguas (>30 días)

---

## 👤 USUARIOS (`/api/usuarios`)

### POST `/api/usuarios`
Crear usuario
```json
Body: {
  "nombre": "Juan",
  "correo": "juan@email.com",
  "password": "123456",
  "telefono": "1234567890",
  "rol": "cliente"
}
```

### GET `/api/usuarios`
Obtener todos los usuarios

### GET `/api/usuarios/:id`
Obtener usuario por ID

### GET `/api/usuarios/correo/:correo`
Obtener usuario por correo

### GET `/api/usuarios/rol/:rol`
Obtener usuarios por rol (administrador, supervisor, vendedor, cliente)

### GET `/api/usuarios/buscar/:termino`
Buscar usuarios (nombre, correo, teléfono)

### PUT `/api/usuarios/:id`
Actualizar usuario

### PUT `/api/usuarios/:id/password`
Actualizar contraseña
```json
Body: { "password": "nueva_contraseña" }
```

### PUT `/api/usuarios/:id/saldo`
Actualizar saldo
```json
Body: { "saldo": 100.50 }
```

### PUT `/api/usuarios/:id/saldo/agregar`
Agregar saldo
```json
Body: { "monto": 50.00 }
```

### PUT `/api/usuarios/:id/saldo/restar`
Restar saldo
```json
Body: { "monto": 25.00 }
```

### PUT `/api/usuarios/:id/rol`
Actualizar rol
```json
Body: { "rol": "vendedor" }
```

### PUT `/api/usuarios/:id/toggle-activo`
Activar/Desactivar usuario

### POST `/api/usuarios/:id/verificar-password`
Verificar contraseña
```json
Body: { "password": "123456" }
```

### GET `/api/usuarios/verificar-correo/:correo`
Verificar si correo existe

### GET `/api/usuarios/verificar-telefono/:telefono`
Verificar si teléfono existe

### DELETE `/api/usuarios/:id`
Eliminar usuario

---

## 📄 FACTURAS (`/api/facturas`)

### POST `/api/facturas`
Crear factura (auto-incremento por usuario)
```json
Body: {
  "id_usuario": 1,
  "total": 150.00
}
```

### GET `/api/facturas/:id`
Obtener factura por ID

### GET `/api/facturas/usuario/:id_usuario`
Obtener facturas de un usuario

### GET `/api/facturas`
Obtener todas las facturas

### GET `/api/facturas/con-ventas/todas`
Obtener facturas con sus ventas

### GET `/api/facturas/:id/tiene-ventas`
Verificar si factura tiene ventas

### DELETE `/api/facturas/:id`
Eliminar factura (solo si no tiene ventas)

---

## 🎫 VENTAS (`/api/ventas`)

### POST `/api/ventas`
Crear venta
```json
Body: {
  "id_usuario": 1,
  "id_rifa": 1,
  "id_factura": 1,
  "numero": "1234",
  "total": 5.00,
  "premio_01": "iPhone 15",
  "premio_02": "AirPods",
  ...
}
```

### GET `/api/ventas/:id`
Obtener venta por ID

### GET `/api/ventas`
Obtener todas las ventas

### GET `/api/ventas/usuario/:id_usuario`
Obtener ventas de un usuario

### GET `/api/ventas/rifa/:id_rifa`
Obtener ventas de una rifa

### GET `/api/ventas/factura/:id_factura`
Obtener ventas de una factura

### GET `/api/ventas/verificar/:id_rifa/:numero`
Verificar si número está vendido

### GET `/api/ventas/numeros-vendidos/:id_rifa`
Obtener números vendidos de una rifa

### GET `/api/ventas/no-pagadas/todas`
Obtener ventas no pagadas

### GET `/api/ventas/activas/todas`
Obtener ventas activas (no eliminadas)

### PUT `/api/ventas/:id/pagar`
Marcar venta como pagada

### DELETE `/api/ventas/:id`
Eliminar venta (soft delete)

### PUT `/api/ventas/:id/restaurar`
Restaurar venta eliminada

### GET `/api/ventas/estadisticas/usuario/:id_usuario`
Estadísticas de ventas por usuario

### GET `/api/ventas/rango-fechas/:fecha_inicio/:fecha_fin`
Ventas por rango de fechas

### GET `/api/ventas/total/:id_rifa`
Total de ventas por rifa

---

## 🎰 TIPOS DE RIFA (`/api/tipos-rifa`)

### POST `/api/tipos-rifa`
Crear tipo de rifa
```json
Body: {
  "tipo_nombre": "Rifa Diaria",
  "descripcion": "Rifa que se juega todos los días"
}
```

### GET `/api/tipos-rifa`
Obtener todos los tipos

### GET `/api/tipos-rifa/:id`
Obtener tipo por ID

### GET `/api/tipos-rifa/:id/premios`
Obtener tipo con sus premios

### PUT `/api/tipos-rifa/:id`
Actualizar tipo de rifa

### DELETE `/api/tipos-rifa/:id`
Eliminar tipo (solo si no tiene rifas activas)

---

## 🏆 OPCIONES DE PREMIOS (`/api/opciones-premios`)

### POST `/api/opciones-premios`
Crear opción de premio
```json
Body: {
  "id_tipo_rifa": 1,
  "nivel_premio": "01",
  "valor_premio": "1000.00",
  "saldo_ganado": "950.00"
}
```

### GET `/api/opciones-premios/tipo/:id_tipo_rifa`
Obtener opciones de un tipo de rifa

### GET `/api/opciones-premios/tipo/:id_tipo_rifa/nivel/:nivel_premio`
Obtener opción específica

### GET `/api/opciones-premios`
Obtener todas las opciones

### PUT `/api/opciones-premios/tipo/:id_tipo_rifa/nivel/:nivel_premio`
Actualizar opción de premio

### DELETE `/api/opciones-premios/tipo/:id_tipo_rifa/nivel/:nivel_premio`
Eliminar opción específica

### DELETE `/api/opciones-premios/tipo/:id_tipo_rifa`
Eliminar todas las opciones de un tipo

### GET `/api/opciones-premios/tipo/:id_tipo_rifa/count`
Contar opciones por tipo

---

## 🎲 RIFAS COMPLETAS (`/api/rifas-completas`)

### POST `/api/rifas-completas`
Crear rifa
```json
Body: {
  "id_tipo_rifa": 1,
  "descripcion": "Rifa del 5 de diciembre",
  "fecha_hora_juego": "2025-12-05 20:00:00"
}
```

### GET `/api/rifas-completas/:id`
Obtener rifa por ID

### GET `/api/rifas-completas/:id/completa`
Obtener rifa con premios, ganadores y estadísticas

### GET `/api/rifas-completas`
Obtener todas las rifas

### GET `/api/rifas-completas/estado/activas`
Obtener rifas activas (futuras)

### GET `/api/rifas-completas/estado/finalizadas`
Obtener rifas finalizadas

### GET `/api/rifas-completas/estado/proximas`
Rifas próximas (24 horas)

### GET `/api/rifas-completas/estado/del-dia`
Rifas del día

### GET `/api/rifas-completas/tipo/:id_tipo_rifa`
Rifas por tipo

### GET `/api/rifas-completas/buscar/:termino`
Buscar rifas

### PUT `/api/rifas-completas/:id`
Actualizar rifa

### DELETE `/api/rifas-completas/:id`
Eliminar rifa

### GET `/api/rifas-completas/:id/ventas-count`
Contar ventas de una rifa

---

## 🎯 NÚMEROS GANADORES (`/api/numero-ganadores`)

### POST `/api/numero-ganadores`
Crear número ganador
```json
Body: {
  "id_rifa": 1,
  "nivel_premio": "01",
  "numero": "1234"
}
```

### POST `/api/numero-ganadores/multiples`
Crear múltiples números ganadores
```json
Body: {
  "id_rifa": 1,
  "numeros": [
    { "nivel_premio": "01", "numero": "1234" },
    { "nivel_premio": "02", "numero": "5678" }
  ]
}
```

### GET `/api/numero-ganadores/rifa/:id_rifa`
Números ganadores de una rifa

### GET `/api/numero-ganadores/rifa/:id_rifa/con-ventas`
Ganadores con información de ventas

### GET `/api/numero-ganadores/rifa/:id_rifa/nivel/:nivel_premio`
Número ganador por nivel

### GET `/api/numero-ganadores/verificar/:id_rifa/:numero`
Verificar si número es ganador

### GET `/api/numero-ganadores/nivel/:id_rifa/:numero`
Obtener nivel de premio de un número

### PUT `/api/numero-ganadores/rifa/:id_rifa/nivel/:nivel_premio`
Actualizar número ganador
```json
Body: { "numero": "9999" }
```

### DELETE `/api/numero-ganadores/rifa/:id_rifa/nivel/:nivel_premio`
Eliminar número ganador

### GET `/api/numero-ganadores/rifa/:id_rifa/count`
Contar números ganadores

---

## 📍 ÁREAS (`/api/areas`)

### POST `/api/areas`
Crear área
```json
Body: {
  "nombre": "Área Central"
}
```

### GET `/api/areas`
Obtener todas las áreas

### GET `/api/areas/:id`
Obtener área por ID

### PUT `/api/areas/:id/saldo`
Actualizar saldo específico
```json
Body: {
  "nivel_saldo": "02",
  "nuevo_saldo": "500.00"
}
```

### PUT `/api/areas/:id/saldo/agregar`
Agregar saldo
```json
Body: {
  "nivel_saldo": "03",
  "monto": "100.00"
}
```

### PUT `/api/areas/:id/saldo/restar`
Restar saldo
```json
Body: {
  "nivel_saldo": "04",
  "monto": "50.00"
}
```

### GET `/api/areas/:id/saldo/:nivel_saldo`
Obtener saldo específico (02-06)

### GET `/api/areas/:id/saldo-total`
Total de todos los saldos

### PUT `/api/areas/:id/resetear-saldos`
Resetear todos los saldos a 0

### DELETE `/api/areas/:id`
Eliminar área

---

## 🏅 GANADORES (`/api/ganadores`)

### POST `/api/ganadores`
Crear ganador
```json
Body: {
  "id_usuario": 1,
  "id_factura": 1,
  "saldo_premio": "1000.00",
  "nivel_premio": "01",
  "id_area": 1
}
```

### GET `/api/ganadores`
Obtener todos los ganadores

### GET `/api/ganadores/usuario/:id_usuario`
Ganadores de un usuario

### GET `/api/ganadores/area/:id_area`
Ganadores de un área

### GET `/api/ganadores/estado/no-pagados`
Ganadores con premios pendientes

### GET `/api/ganadores/estado/pagados`
Ganadores con premios pagados

### GET `/api/ganadores/factura/:id_factura/nivel/:nivel_premio`
Ganador específico

### PUT `/api/ganadores/pagar`
Marcar premio como pagado
```json
Body: {
  "id_usuario": 1,
  "id_factura": 1,
  "nivel_premio": "01"
}
```

### PUT `/api/ganadores/actualizar-area`
Actualizar área del ganador
```json
Body: {
  "id_usuario": 1,
  "id_factura": 1,
  "nivel_premio": "01",
  "id_area": 2
}
```

### DELETE `/api/ganadores`
Eliminar ganador
```json
Body: {
  "id_usuario": 1,
  "id_factura": 1,
  "nivel_premio": "01"
}
```

### GET `/api/ganadores/area/:id_area/no-pagados-count`
Contar no pagados por área

### GET `/api/ganadores/estadisticas/premios-no-pagados`
Total de premios pendientes

### GET `/api/ganadores/estadisticas/premios-pagados`
Total de premios pagados

### GET `/api/ganadores/rango-fechas/:fecha_inicio/:fecha_fin`
Ganadores por rango de fechas

### GET `/api/ganadores/estadisticas/por-nivel`
Estadísticas por nivel de premio

### GET `/api/ganadores/usuario/:id_usuario/tiene-pendientes`
Verificar si usuario tiene premios pendientes

---

## 🏥 HEALTH CHECK

### GET `/api/health`
Verificar estado del servidor
```json
Response: {
  "status": "success",
  "message": "API de RifaParaTodos funcionando correctamente",
  "timestamp": "2025-12-04T..."
}
```

---

## 📝 Notas Importantes

1. **Autenticación**: Las rutas aún no tienen middleware de autenticación implementado
2. **Validación**: Se recomienda agregar middleware de validación de datos
3. **Paginación**: Las rutas que retornan listas podrían beneficiarse de paginación
4. **Soft Delete**: Las ventas usan soft delete (campo `eliminada`)
5. **Auto-increment**: Las facturas tienen auto-incremento por usuario
6. **Sesiones**: Expiran automáticamente después de 120 minutos de inactividad
7. **Saldos de Área**: Maneja 5 niveles (saldo_02 a saldo_06)
8. **Premios**: Cada venta/rifa puede tener hasta 10 niveles de premios
