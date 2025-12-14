# 🔐 CREDENCIALES DE ACCESO - SISTEMA DE RIFAS

## 📋 Usuarios de Prueba

Todos los usuarios tienen la misma contraseña: **`password123`**

---

### 👨‍💼 ADMINISTRADOR
- **Correo:** `admin@rifas.com`
- **Contraseña:** `password123`
- **Permisos:**
  - ✅ Gestionar todos los usuarios
  - ✅ Crear, editar y eliminar rifas
  - ✅ Gestionar tipos de rifa y premios
  - ✅ Ver reportes globales del sistema
  - ✅ Gestionar áreas
  - ✅ Ver todas las ventas y ganadores
  - ✅ Configuración general del sistema

---

### 👔 SUPERVISOR
- **Correo:** `supervisor@rifas.com`
- **Contraseña:** `password123`
- **Permisos:**
  - ✅ Ver todas las ventas de su área
  - ✅ Gestionar vendedores
  - ✅ Ver reportes de ventas
  - ✅ Ver ganadores y premios
  - ❌ NO puede crear rifas
  - ❌ NO puede modificar tipos de rifa

---

### 💼 VENDEDOR
- **Correo:** `vendedor@rifas.com`
- **Contraseña:** `password123`
- **Permisos:**
  - ✅ Vender números de lotería
  - ✅ Registrar nuevos clientes
  - ✅ Ver sus propias ventas
  - ✅ Pagar premios a ganadores
  - ✅ Generar facturas
  - ❌ NO puede ver ventas de otros vendedores
  - ❌ NO puede modificar rifas

---

### 👤 CLIENTE
- **Correo:** `cliente@rifas.com`
- **Contraseña:** `password123`
- **Permisos:**
  - ✅ Ver rifas disponibles
  - ✅ Comprar números de lotería
  - ✅ Ver sus propias compras
  - ✅ Ver sus premios ganados
  - ✅ Ver historial de facturas
  - ❌ NO puede acceder al panel administrativo

---

## 🗄️ Cargar Datos de Prueba en la Base de Datos

### Opción 1: Desde MySQL Command Line
```bash
mysql -u root -p nombre_base_datos < backend/database/seed.sql
```

### Opción 2: Desde MySQL Workbench
1. Abrir MySQL Workbench
2. Conectarse a tu servidor MySQL
3. Abrir el archivo `backend/database/seed.sql`
4. Ejecutar el script completo (Ctrl + Shift + Enter)

### Opción 3: Desde phpMyAdmin
1. Seleccionar la base de datos
2. Ir a la pestaña "SQL"
3. Copiar y pegar el contenido de `backend/database/seed.sql`
4. Ejecutar

---

## 🔧 Estructura de la Base de Datos Creada

El archivo `seed.sql` crea:

### 👥 **4 Usuarios** (uno por cada rol)
- 1 Administrador
- 1 Supervisor  
- 1 Vendedor
- 1 Cliente (con saldo inicial de $50,000)

### 🎰 **2 Tipos de Rifa**
- Rifa Diaria (10 niveles de premios)
- Rifa Semanal (10 niveles de premios)

### 🏆 **20 Opciones de Premios**
- 10 premios para Rifa Diaria
- 10 premios para Rifa Semanal

### 🎫 **2 Rifas Activas**
- Rifa Diaria - Lotería de Bogotá (juega mañana)
- Rifa Semanal - Lotería del Valle (juega este sábado)

### 📍 **1 Área**
- Área Central (con saldos en 0)

---

## 🚀 Probar el Sistema

### 1. Crear la base de datos
```sql
CREATE DATABASE rifas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Crear las tablas
```bash
mysql -u root -p rifas_db < backend/database/schema.sql
```

### 3. Cargar datos de prueba
```bash
mysql -u root -p rifas_db < backend/database/seed.sql
```

### 4. Configurar archivo .env
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=rifas_db
DB_PORT=3306
```

### 5. Iniciar el servidor backend
```bash
cd backend
npm start
```

### 6. Probar login
```bash
# POST http://localhost:5000/api/auth/login
{
  "correo": "admin@rifas.com",
  "password": "password123"
}
```

---

## 📝 Notas Importantes

- ⚠️ **Las contraseñas están hasheadas** con bcrypt (10 rounds)
- ⚠️ **No uses estos datos en producción** - son solo para desarrollo
- ⚠️ **Cambia las contraseñas** antes de desplegar a producción
- ✅ El cliente tiene **$50,000 de saldo inicial** para hacer compras de prueba
- ✅ Las rifas están programadas para **fechas futuras**
- ✅ Los premios tienen **10 niveles** cada uno (del 1 al 10)

---

## 🔄 Resetear Datos de Prueba

Si quieres volver a cargar los datos desde cero:

```bash
# Eliminar todos los datos
mysql -u root -p rifas_db -e "SET FOREIGN_KEY_CHECKS=0; TRUNCATE TABLE usuario; TRUNCATE TABLE tipo_rifa; TRUNCATE TABLE opciones_premios; TRUNCATE TABLE rifa; TRUNCATE TABLE area; SET FOREIGN_KEY_CHECKS=1;"

# Volver a cargar
mysql -u root -p rifas_db < backend/database/seed.sql
```

---

## 📧 Contacto

Si tienes problemas con las credenciales o la carga de datos, revisa:
1. Que la base de datos esté creada
2. Que las tablas existan (ejecuta schema.sql primero)
3. Que la conexión en .env sea correcta
4. Que el servidor MySQL esté corriendo
