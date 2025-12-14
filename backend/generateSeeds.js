import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para generar los hashes de contraseñas para los usuarios de prueba
 * Genera el archivo seed.sql con las contraseñas correctamente hasheadas
 */

const password = 'password123';
const saltRounds = 10;

// Generar hash para cada usuario
console.log('Generando hashes de contraseñas...\n');

Promise.all([
  bcrypt.hash(password, saltRounds),
  bcrypt.hash(password, saltRounds),
  bcrypt.hash(password, saltRounds),
  bcrypt.hash(password, saltRounds)
]).then(([hashAdmin, hashSupervisor, hashVendedor, hashCliente]) => {
  
  console.log('✓ Hashes generados correctamente\n');
  console.log('='.repeat(60));
  console.log('CREDENCIALES DE ACCESO');
  console.log('='.repeat(60));
  console.log('\n👤 ADMINISTRADOR:');
  console.log('   Correo: admin@rifas.com');
  console.log('   Password: password123');
  console.log('   Hash:', hashAdmin);
  
  console.log('\n👤 SUPERVISOR:');
  console.log('   Correo: supervisor@rifas.com');
  console.log('   Password: password123');
  console.log('   Hash:', hashSupervisor);
  
  console.log('\n👤 VENDEDOR:');
  console.log('   Correo: vendedor@rifas.com');
  console.log('   Password: password123');
  console.log('   Hash:', hashVendedor);
  
  console.log('\n👤 CLIENTE:');
  console.log('   Correo: cliente@rifas.com');
  console.log('   Password: password123');
  console.log('   Hash:', hashCliente);
  
  console.log('\n' + '='.repeat(60));
  
  // Generar el archivo seed.sql con los hashes correctos
  const seedSQL = `-- =====================================================
-- DATOS DE PRUEBA - USUARIOS POR ROL
-- =====================================================
-- IMPORTANTE: Todas las contraseñas son: "password123"

-- ADMINISTRADOR
-- Correo: admin@rifas.com
-- Password: password123
-- Permisos: Gestionar todo el sistema, crear rifas, tipos de rifa, ver reportes globales
INSERT INTO usuario (nombre, correo, password, direccion, rol, saldo, activo, created_at, updated_at, telefono) 
VALUES (
  'Administrador Principal',
  'admin@rifas.com',
  '${hashAdmin}',
  'Calle Principal 123, Oficina Central',
  'administrador',
  0.00,
  1,
  NOW(),
  NOW(),
  '+57 300 1234567'
);

-- SUPERVISOR
-- Correo: supervisor@rifas.com
-- Password: password123
-- Permisos: Ver ventas, gestionar vendedores, ver reportes de área
INSERT INTO usuario (nombre, correo, password, direccion, rol, saldo, activo, created_at, updated_at, telefono) 
VALUES (
  'Supervisor de Ventas',
  'supervisor@rifas.com',
  '${hashSupervisor}',
  'Avenida Central 456, Piso 2',
  'supervisor',
  0.00,
  1,
  NOW(),
  NOW(),
  '+57 300 2345678'
);

-- VENDEDOR
-- Correo: vendedor@rifas.com
-- Password: password123
-- Permisos: Vender números, registrar clientes, ver sus ventas, pagar premios
INSERT INTO usuario (nombre, correo, password, direccion, rol, saldo, activo, created_at, updated_at, telefono) 
VALUES (
  'Juan Vendedor',
  'vendedor@rifas.com',
  '${hashVendedor}',
  'Carrera 50 #20-30, Local 5',
  'vendedor',
  0.00,
  1,
  NOW(),
  NOW(),
  '+57 300 3456789'
);

-- CLIENTE
-- Correo: cliente@rifas.com
-- Password: password123
-- Permisos: Ver rifas, comprar números, ver sus compras y premios
INSERT INTO usuario (nombre, correo, password, direccion, rol, saldo, activo, created_at, updated_at, telefono) 
VALUES (
  'María Cliente',
  'cliente@rifas.com',
  '${hashCliente}',
  'Calle 10 #15-25, Apto 301',
  'cliente',
  50000.00,
  1,
  NOW(),
  NOW(),
  '+57 300 4567890'
);

-- =====================================================
-- TIPOS DE RIFA DE PRUEBA
-- =====================================================

-- Tipo de rifa "Diaria"
INSERT INTO tipo_rifa (nombre) VALUES ('Rifa Diaria');

-- Tipo de rifa "Semanal"
INSERT INTO tipo_rifa (nombre) VALUES ('Rifa Semanal');

-- =====================================================
-- OPCIONES DE PREMIOS PARA RIFA DIARIA (id_tipo_rifa = 1)
-- =====================================================
-- 10 niveles de premios según coincidencias

INSERT INTO opciones_premios (id_tipo_rifa, valor_premio, nivel_premio, saldo_ganado) VALUES
(1, 50000, 1, '50000'),   -- Nivel 1: 6 dígitos completos
(1, 10000, 2, '10000'),   -- Nivel 2: Últimos 5 dígitos
(1, 5000, 3, '5000'),     -- Nivel 3: Últimos 4 dígitos
(1, 2000, 4, '2000'),     -- Nivel 4: Últimos 3 dígitos
(1, 1000, 5, '1000'),     -- Nivel 5: Últimos 2 dígitos
(1, 500, 6, '500'),       -- Nivel 6: Último dígito
(1, 200, 7, '200'),       -- Nivel 7: Primeros 3 dígitos
(1, 100, 8, '100'),       -- Nivel 8: Primeros 2 dígitos
(1, 50, 9, '50'),         -- Nivel 9: Primer dígito
(1, 20, 10, '20');        -- Nivel 10: Premio de consolación

-- =====================================================
-- OPCIONES DE PREMIOS PARA RIFA SEMANAL (id_tipo_rifa = 2)
-- =====================================================

INSERT INTO opciones_premios (id_tipo_rifa, valor_premio, nivel_premio, saldo_ganado) VALUES
(2, 100000, 1, '100000'), -- Nivel 1: 6 dígitos completos
(2, 20000, 2, '20000'),   -- Nivel 2: Últimos 5 dígitos
(2, 10000, 3, '10000'),   -- Nivel 3: Últimos 4 dígitos
(2, 5000, 4, '5000'),     -- Nivel 4: Últimos 3 dígitos
(2, 2000, 5, '2000'),     -- Nivel 5: Últimos 2 dígitos
(2, 1000, 6, '1000'),     -- Nivel 6: Último dígito
(2, 500, 7, '500'),       -- Nivel 7: Primeros 3 dígitos
(2, 200, 8, '200'),       -- Nivel 8: Primeros 2 dígitos
(2, 100, 9, '100'),       -- Nivel 9: Primer dígito
(2, 50, 10, '50');        -- Nivel 10: Premio de consolación

-- =====================================================
-- RIFAS DE PRUEBA
-- =====================================================

-- Rifa diaria activa (se juega mañana)
INSERT INTO rifa (sorteos, descripcion, imagen, id_tipo, fecha_hora_juego) 
VALUES (
  100,
  'Rifa Diaria - Lotería de Bogotá',
  'https://via.placeholder.com/400x300?text=Rifa+Diaria',
  1,
  '2025-12-05 19:00:00'
);

-- Rifa semanal activa (se juega este sábado)
INSERT INTO rifa (sorteos, descripcion, imagen, id_tipo, fecha_hora_juego) 
VALUES (
  50,
  'Rifa Semanal - Lotería del Valle',
  'https://via.placeholder.com/400x300?text=Rifa+Semanal',
  2,
  '2025-12-07 20:00:00'
);

-- =====================================================
-- ÁREA DE PRUEBA
-- =====================================================

INSERT INTO area (nombre, saldo_02, saldo_03, saldo_04, saldo_05, saldo_06) 
VALUES (
  'Área Central',
  0.00,
  0.00,
  0.00,
  0.00,
  0.00
);
`;

  // Guardar el archivo seed.sql
  const seedPath = path.join(__dirname, 'database', 'seed.sql');
  fs.writeFileSync(seedPath, seedSQL);
  
  console.log('\n✓ Archivo seed.sql actualizado correctamente');
  console.log('📁 Ubicación:', seedPath);
  console.log('\n📌 Para cargar los datos ejecuta:');
  console.log('   mysql -u root -p nombre_base_datos < backend/database/seed.sql');
  
}).catch(error => {
  console.error('Error generando hashes:', error);
});
