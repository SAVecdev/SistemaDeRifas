# RifaParaTodos - Guía de Usuarios y Roles

## 👥 Sistema de Roles

El sistema cuenta con **5 roles** de usuario con diferentes permisos:

### 1. 👤 Usuario No Registrado
- **Acceso:** Solo visualización
- **Permisos:**
  - ✅ Ver rifas disponibles
  - ❌ No puede participar en rifas
  - ❌ No puede gestionar perfil

### 2. 🎫 Usuario Registrado  
**Email de prueba:** `usuario@rifaparatodos.com`  
**Password:** cualquiera (mock)

- **Acceso:** Participación en rifas
- **Permisos:**
  - ✅ Ver rifas disponibles
  - ✅ Comprar números de rifas
  - ✅ Ver historial de rifas
  - ✅ Gestionar perfil personal
  - ✅ Ver transacciones propias
  - ❌ No puede acceder a funciones administrativas

### 3. 💼 Vendedor
**Email de prueba:** `vendedor@rifaparatodos.com`  
**Password:** cualquiera (mock)

- **Acceso:** Venta y gestión de clientes
- **Permisos:**
  - ✅ Vender números de rifas
  - ✅ Registrar nuevos usuarios
  - ✅ Pagar premios a ganadores
  - ✅ Ver rifas disponibles
  - ✅ Ver su historial de ventas
  - ❌ No puede modificar rifas
  - ❌ No puede ver ventas de otros vendedores

### 4. 👁️ Supervisor
**Email de prueba:** `supervisor@rifaparatodos.com`  
**Password:** cualquiera (mock)

- **Acceso:** Supervisión y reportes (solo lectura)
- **Permisos:**
  - ✅ Ver todas las rifas
  - ✅ Ver todos los usuarios
  - ✅ Ver todas las transacciones
  - ✅ Supervisar vendedores y sus ventas
  - ✅ Ver reportes y estadísticas
  - ❌ No puede modificar nada
  - ❌ No puede realizar ventas
  - ❌ No puede cambiar configuraciones

### 5. ⚙️ Administrador
**Email de prueba:** `admin@rifaparatodos.com`  
**Password:** cualquiera (mock)

- **Acceso:** Control total del sistema
- **Permisos:**
  - ✅ Gestión total de rifas (crear, editar, eliminar)
  - ✅ Gestión total de usuarios
  - ✅ Gestión de premios
  - ✅ Gestión de transacciones
  - ✅ Configuración del sistema
  - ✅ Acceso a todos los reportes
  - ✅ Control total del sistema

## 🚀 Cómo Probar los Roles

### Iniciar Sesión con Diferentes Roles:

1. **Usuario Registrado:**
   ```
   Email: usuario@rifaparatodos.com
   → Redirige a: /perfil
   ```

2. **Vendedor:**
   ```
   Email: vendedor@rifaparatodos.com
   → Redirige a: /vendedor
   ```

3. **Supervisor:**
   ```
   Email: supervisor@rifaparatodos.com
   → Redirige a: /supervisor
   ```

4. **Administrador:**
   ```
   Email: admin@rifaparatodos.com
   → Redirige a: /admin
   ```

## 📋 Endpoints por Rol

### Backend - Rutas Protegidas:

```javascript
// Vendedor
POST /api/vendedores/ventas/vender-numeros
POST /api/vendedores/ventas/registrar-usuario
POST /api/vendedores/ventas/pagar-premio
GET  /api/vendedores/ventas/mis-ventas

// Supervisor (solo lectura)
GET  /api/vendedores/vendedores
GET  /api/vendedores/vendedores/:id/ventas
GET  /api/vendedores/reportes/general

// Para probar los endpoints, agrega el header:
// x-user-role: administrador | supervisor | vendedor | usuario_registrado
```

## 🗂️ Estructura de Base de Datos

### Tabla `usuarios`:
```sql
rol ENUM(
  'administrador', 
  'supervisor', 
  'vendedor', 
  'usuario_registrado', 
  'usuario_no_registrado'
)
```

### Tabla `permisos_rol`:
Almacena los permisos específicos de cada rol para cada módulo.

### Tabla `acciones_vendedor`:
Registra todas las acciones de los vendedores para supervisión.

## 🎯 Flujo de Trabajo

### Como Vendedor:
1. Login → Panel de Vendedor
2. Ver rifas disponibles
3. Vender números a clientes
4. Registrar nuevos usuarios
5. Pagar premios a ganadores

### Como Supervisor:
1. Login → Panel de Supervisor
2. Ver estadísticas generales
3. Supervisar vendedores
4. Ver ventas y transacciones
5. Generar reportes

### Como Administrador:
1. Login → Panel de Admin
2. Gestionar rifas
3. Gestionar usuarios de todos los roles
4. Configurar el sistema
5. Acceso completo

## 🔐 Seguridad

- El sistema usa `localStorage` para almacenar el rol temporalmente (mock)
- En producción, usar JWT con el rol en el payload
- Los middlewares verifican permisos en cada endpoint
- El frontend oculta opciones según el rol del usuario

## 📱 Navegación por Rol

El `Header` muestra diferentes opciones según el rol:

- **Usuario No Registrado:** Solo "Inicio", "Rifas", "Login", "Registro"
- **Usuario Registrado:** + "Mis Rifas", "Perfil"
- **Vendedor:** + "Panel Vendedor", "Ventas"
- **Supervisor:** + "Panel Supervisor", "Vendedores", "Reportes"
- **Administrador:** + "Panel Admin", "Rifas", "Usuarios"

---

**Nota:** Este es un sistema mock. Para producción, implementar autenticación JWT real y validaciones en base de datos.
