# 📚 Documentación de Rutas API - RifaParaTodos

## 🎯 Información General
- **Base URL:** `http://localhost:5000/api`
- **Formato de Respuesta:** JSON
- **Autenticación:** JWT Bearer Token (donde aplique)

---

## 👨‍💼 RUTAS DEL ADMINISTRADOR

### 🎫 **1. Gestión de Premios (Vista Consolidada)**

#### GET `/api/opciones-premios/vista-consolidada`
**Descripción:** Obtiene la vista consolidada de premios para gestión del administrador.

**Vista SQL utilizada:** `vista_premios_consolidada`

**Formato de tabla:** `tipo | saldo (apuesta) | premio1 | premio2 | ... | premio10 | área`

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id_tipo_rifa": 1,
      "tipo": "Rifa Diaria",
      "saldo": "5.00",
      "premio_01": 50000,
      "premio_02": 10000,
      "premio_03": 5000,
      "premio_04": 2000,
      "premio_05": 1000,
      "premio_06": 500,
      "premio_07": 200,
      "premio_08": 100,
      "premio_09": 50,
      "premio_10": 20,
      "area": "Área Central",
      "id_area": 1
    }
  ]
}
```

**Explicación de campos:**
- `saldo`: Valor de la apuesta ($0.25 a $20.00) - Lo que paga el usuario
- `premio_01` a `premio_10`: Valores de premios que se ganan por nivel

---

#### PUT `/api/opciones-premios/tipo/:id_tipo_rifa/nivel/:nivel_premio`
**Descripción:** Actualiza un premio específico de un tipo de rifa.

**Parámetros URL:**
- `id_tipo_rifa`: ID del tipo de rifa
- `nivel_premio`: Nivel del premio (1-10)

**Body:**
```json
{
  "valor_premio": 50000,
  "saldo_ganado": "5.00",
  "id_area": 1
}
```

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "message": "Premio actualizado correctamente"
}
```

---

#### DELETE `/api/opciones-premios/tipo/:id_tipo_rifa`
**Descripción:** Elimina todos los premios de un tipo de rifa.

**Parámetros URL:**
- `id_tipo_rifa`: ID del tipo de rifa

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "message": "Premios eliminados correctamente"
}
```

---

### 🎰 **2. Gestión de Tipos de Rifa**

#### GET `/api/tipos-rifa`
**Descripción:** Obtiene todos los tipos de rifa.

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "nombre": "Rifa Diaria"
    },
    {
      "id": 2,
      "nombre": "Rifa Semanal"
    }
  ]
}
```

#### POST `/api/tipos-rifa`
**Descripción:** Crea un nuevo tipo de rifa.

**Body:**
```json
{
  "nombre": "Rifa Mensual"
}
```

**Respuesta exitosa (201):**
```json
{
  "status": "success",
  "data": {
    "id": 3
  }
}
```

#### PUT `/api/tipos-rifa/:id`
**Descripción:** Actualiza un tipo de rifa.

**Body:**
```json
{
  "nombre": "Rifa Especial"
}
```

#### DELETE `/api/tipos-rifa/:id`
**Descripción:** Elimina un tipo de rifa (valida que no tenga rifas activas).

---

### 📍 **3. Gestión de Áreas**

#### GET `/api/areas`
**Descripción:** Obtiene todas las áreas.

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "nombre": "Área Central",
      "saldo_02": 0,
      "saldo_03": 0,
      "saldo_04": 0,
      "saldo_05": 0,
      "saldo_06": 0
    }
  ]
}
```

#### POST `/api/areas`
**Descripción:** Crea una nueva área.

**Body:**
```json
{
  "nombre": "Área Norte",
  "saldo_02": 0,
  "saldo_03": 0,
  "saldo_04": 0,
  "saldo_05": 0,
  "saldo_06": 0
}
```

#### PUT `/api/areas/:id/saldo`
**Descripción:** Actualiza el saldo de un nivel específico del área.

**Body:**
```json
{
  "campo_saldo": "saldo_02",
  "nuevo_saldo": 1000.50
}
```

---

### 🎫 **4. Gestión de Rifas**

#### GET `/api/rifas`
**Descripción:** Obtiene todas las rifas.

#### GET `/api/rifas-completas/:id`
**Descripción:** Obtiene información completa de una rifa (con premios, ganadores, estadísticas).

**Respuesta incluye:**
- Información de la rifa
- Premios configurados
- Números ganadores
- Estadísticas de ventas
- Total vendido
- Total pendiente de pago

#### POST `/api/rifas`
**Descripción:** Crea una nueva rifa.

**Body:**
```json
{
  "sorteos": 100,
  "descripcion": "Rifa Navideña",
  "imagen": "https://example.com/imagen.jpg",
  "id_tipo": 1,
  "fecha_hora_juego": "2025-12-25 20:00:00"
}
```

#### PUT `/api/rifas/:id`
**Descripción:** Actualiza una rifa.

#### DELETE `/api/rifas/:id`
**Descripción:** Elimina una rifa.

---

### 👥 **5. Gestión de Usuarios**

#### GET `/api/usuarios`
**Descripción:** Obtiene todos los usuarios.

#### GET `/api/usuarios/:id`
**Descripción:** Obtiene un usuario específico.

#### GET `/api/usuarios/rol/:rol`
**Descripción:** Obtiene usuarios por rol.

**Roles disponibles:**
- `administrador`
- `supervisor`
- `vendedor`
- `cliente`

#### POST `/api/usuarios`
**Descripción:** Crea un nuevo usuario.

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "correo": "juan@example.com",
  "password": "password123",
  "direccion": "Calle 123",
  "rol": "vendedor",
  "saldo": 0,
  "activo": 1,
  "telefono": "+57 300 1234567"
}
```

#### PUT `/api/usuarios/:id`
**Descripción:** Actualiza un usuario.

#### PUT `/api/usuarios/:id/password`
**Descripción:** Actualiza la contraseña de un usuario.

**Body:**
```json
{
  "password": "nueva_password"
}
```

#### PUT `/api/usuarios/:id/saldo`
**Descripción:** Actualiza el saldo de un usuario.

**Body:**
```json
{
  "saldo": 1000.50
}
```

#### PUT `/api/usuarios/:id/rol`
**Descripción:** Cambia el rol de un usuario.

**Body:**
```json
{
  "rol": "supervisor"
}
```

#### PUT `/api/usuarios/:id/toggle-activo`
**Descripción:** Activa/Desactiva un usuario.

#### DELETE `/api/usuarios/:id`
**Descripción:** Elimina un usuario.

---

### 💰 **6. Gestión de Ventas**

#### GET `/api/ventas`
**Descripción:** Obtiene todas las ventas.

#### GET `/api/ventas/usuario/:id_usuario`
**Descripción:** Obtiene ventas de un usuario específico.

#### GET `/api/ventas/rifa/:id_rifa`
**Descripción:** Obtiene ventas de una rifa específica.

#### GET `/api/ventas/no-pagadas`
**Descripción:** Obtiene todas las ventas pendientes de pago.

#### POST `/api/ventas/crear-completa`
**Descripción:** Crea una venta completa con todo el proceso automático.

**Body:**
```json
{
  "id_usuario": 1,
  "id_rifas": 1,
  "numero": "123456",
  "cantidad": 1,
  "valor": 5000,
  "total": 5000
}
```

**Proceso automático:**
1. Obtiene última factura del usuario (o crea primera: 10001)
2. Crea nueva factura incrementada
3. Busca los 10 premios del tipo de rifa
4. Crea la venta con todos los premios asignados
5. Retorna venta completa

#### PUT `/api/ventas/:id/marcar-pagada`
**Descripción:** Marca una venta como pagada.

#### DELETE `/api/ventas/:id`
**Descripción:** Elimina (soft delete) una venta.

---

### 🏆 **7. Gestión de Ganadores**

#### GET `/api/ganadores`
**Descripción:** Obtiene todos los ganadores.

#### GET `/api/ganadores/no-pagados`
**Descripción:** Obtiene premios no pagados.

#### GET `/api/ganadores/usuario/:id_usuario`
**Descripción:** Obtiene premios de un usuario.

#### GET `/api/ganadores/area/:id_area`
**Descripción:** Obtiene ganadores de un área.

#### POST `/api/ganadores`
**Descripción:** Registra un ganador.

**Body:**
```json
{
  "id_usuario": 1,
  "id_factura": 1,
  "saldo_premio": "50000",
  "nivel_premio": 1,
  "id_area": 1
}
```

#### PUT `/api/ganadores/marcar-pagado`
**Descripción:** Marca un premio como pagado.

**Body:**
```json
{
  "id_usuario": 1,
  "id_factura": 1,
  "nivel_premio": 1
}
```

---

### 🎯 **8. Números Ganadores**

#### GET `/api/numero-ganadores/rifa/:id_rifa`
**Descripción:** Obtiene los números ganadores de una rifa.

#### POST `/api/numero-ganadores`
**Descripción:** Registra un número ganador.

**Body:**
```json
{
  "id_rifa": 1,
  "nivel_premio": 1,
  "numero_ganador": "123456"
}
```

#### POST `/api/numero-ganadores/multiples`
**Descripción:** Registra múltiples números ganadores a la vez.

**Body:**
```json
{
  "id_rifa": 1,
  "ganadores": [
    { "nivel_premio": 1, "numero_ganador": "123456" },
    { "nivel_premio": 2, "numero_ganador": "23456" },
    { "nivel_premio": 3, "numero_ganador": "3456" }
  ]
}
```

---

### 📄 **9. Gestión de Facturas**

#### GET `/api/facturas`
**Descripción:** Obtiene todas las facturas.

#### GET `/api/facturas/usuario/:id_usuario`
**Descripción:** Obtiene facturas de un usuario.

#### GET `/api/facturas/:id/con-ventas`
**Descripción:** Obtiene factura con todas sus ventas asociadas.

---

### 📊 **10. Estadísticas y Reportes**

#### GET `/api/ventas/stats/usuario/:id_usuario`
**Descripción:** Obtiene estadísticas de ventas de un usuario.

**Respuesta:**
```json
{
  "total_ventas": 10,
  "ventas_pagadas": 8,
  "ventas_pendientes": 2,
  "total_pagado": 50000,
  "total_pendiente": 10000
}
```

#### GET `/api/ganadores/stats/nivel`
**Descripción:** Obtiene estadísticas de ganadores por nivel de premio.

#### GET `/api/areas/:id/total-saldos`
**Descripción:** Obtiene la suma total de todos los saldos de un área.

---

## 🔐 Autenticación

### POST `/api/auth/login`
**Descripción:** Inicia sesión.

**Body:**
```json
{
  "correo": "admin@rifas.com",
  "password": "password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "nombre": "Administrador Principal",
      "correo": "admin@rifas.com",
      "rol": "administrador"
    }
  }
}
```

### POST `/api/auth/logout`
**Descripción:** Cierra sesión.

---

## ✅ Sistema Completo y Coherente

### Vista SQL
- ✅ Creada: `vista_premios_consolidada`
- ✅ Ubicación: `backend/database/vista_premios.sql`
- ✅ Integrada en `initDatabase.js`

### Modelos Backend
- ✅ Todos los modelos creados (10 tablas)
- ✅ Funciones documentadas con JSDoc
- ✅ Uso de transacciones donde es necesario

### Rutas API
- ✅ Todas las rutas registradas en `server.js`
- ✅ 15 archivos de rutas organizados
- ✅ Respuestas con formato estándar

### Frontend
- ✅ Componente `GestionPremios.jsx` creado
- ✅ Estilos en `GestionPremios.css`
- ✅ Integrado en `App.jsx`
- ✅ Ruta: `/admin/gestion-premios`

### Coherencia del Sistema
- ✅ Nomenclatura consistente: camelCase para variables y funciones
- ✅ Comentarios en español
- ✅ Validaciones en modelos
- ✅ Manejo de errores estandarizado
- ✅ Valores de apuesta: $0.25 a $20.00
- ✅ Premios configurables por nivel (1-10)
- ✅ Áreas asociadas a premios
- ✅ Foreign keys correctamente definidas
