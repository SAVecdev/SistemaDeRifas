-- =====================================================
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
  '$2a$10$FKVhjb4jaI5zkJJQM3m72.O6f5RIv0Scitn/9pnupAVfs4Ts6Cem2',
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
  '$2a$10$iUKhjtCyK3IZI787Jdllwe.JNrqBnAF8VIU2Kq9pIpNPHrnb9DKX2',
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
  '$2a$10$.7BHTUavGYMGHrdVpcTGy.v7eupAXLZu2kfYUXm85KJ7KatGJf/ue',
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
  '$2a$10$ocoiKlJloh13PSuBC920b.xG/MHR6/icwWQOp0ou2lpQrGIUfTSWu',
  'Calle 10 #15-25, Apto 301',
  'cliente',
  50000.00,
  1,
  NOW(),
  NOW(),
  '+57 300 4567890'
);

-- =====================================================
-- ÁREA DE PRUEBA (Se crea primero para referenciarla)
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
-- Todos asignados al Área Central (id_area = 1)
-- saldo_ganado = Valor de la apuesta (lo que paga el usuario): $0.25 a $20.00
-- valor_premio = Premio que se gana si acierta

INSERT INTO opciones_premios (id_tipo_rifa, valor_premio, nivel_premio, saldo_ganado, id_area) VALUES
(1, 50000, 1, '5.00', 1),    -- Nivel 1: 6 dígitos completos - Apuesta: $5.00, Gana: $50,000
(1, 10000, 2, '5.00', 1),    -- Nivel 2: Últimos 5 dígitos - Apuesta: $5.00, Gana: $10,000
(1, 5000, 3, '5.00', 1),     -- Nivel 3: Últimos 4 dígitos - Apuesta: $5.00, Gana: $5,000
(1, 2000, 4, '5.00', 1),     -- Nivel 4: Últimos 3 dígitos - Apuesta: $5.00, Gana: $2,000
(1, 1000, 5, '5.00', 1),     -- Nivel 5: Últimos 2 dígitos - Apuesta: $5.00, Gana: $1,000
(1, 500, 6, '5.00', 1),      -- Nivel 6: Último dígito - Apuesta: $5.00, Gana: $500
(1, 200, 7, '5.00', 1),      -- Nivel 7: Primeros 3 dígitos - Apuesta: $5.00, Gana: $200
(1, 100, 8, '5.00', 1),      -- Nivel 8: Primeros 2 dígitos - Apuesta: $5.00, Gana: $100
(1, 50, 9, '5.00', 1),       -- Nivel 9: Primer dígito - Apuesta: $5.00, Gana: $50
(1, 20, 10, '5.00', 1);      -- Nivel 10: Premio de consolación - Apuesta: $5.00, Gana: $20

-- =====================================================
-- OPCIONES DE PREMIOS PARA RIFA SEMANAL (id_tipo_rifa = 2)
-- =====================================================
-- Todos asignados al Área Central (id_area = 1)
-- Rifa más cara con premios más altos

INSERT INTO opciones_premios (id_tipo_rifa, valor_premio, nivel_premio, saldo_ganado, id_area) VALUES
(2, 100000, 1, '10.00', 1),  -- Nivel 1: 6 dígitos completos - Apuesta: $10.00, Gana: $100,000
(2, 20000, 2, '10.00', 1),   -- Nivel 2: Últimos 5 dígitos - Apuesta: $10.00, Gana: $20,000
(2, 10000, 3, '10.00', 1),   -- Nivel 3: Últimos 4 dígitos - Apuesta: $10.00, Gana: $10,000
(2, 5000, 4, '10.00', 1),    -- Nivel 4: Últimos 3 dígitos - Apuesta: $10.00, Gana: $5,000
(2, 2000, 5, '10.00', 1),    -- Nivel 5: Últimos 2 dígitos - Apuesta: $10.00, Gana: $2,000
(2, 1000, 6, '10.00', 1),    -- Nivel 6: Último dígito - Apuesta: $10.00, Gana: $1,000
(2, 500, 7, '10.00', 1),     -- Nivel 7: Primeros 3 dígitos - Apuesta: $10.00, Gana: $500
(2, 200, 8, '10.00', 1),     -- Nivel 8: Primeros 2 dígitos - Apuesta: $10.00, Gana: $200
(2, 100, 9, '10.00', 1),     -- Nivel 9: Primer dígito - Apuesta: $10.00, Gana: $100
(2, 50, 10, '10.00', 1);     -- Nivel 10: Premio de consolación - Apuesta: $10.00, Gana: $50

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


