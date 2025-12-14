-- Migration: Fix ganadores table structure
-- Add missing columns: id (PK), id_numero_ganador

-- Verificar si existe la columna id, si no existe agregarla
SET @exist_id := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ganadores' AND COLUMN_NAME = 'id');

SET @sqlstmt_id := IF(@exist_id = 0,
  'ALTER TABLE ganadores ADD COLUMN id INT PRIMARY KEY AUTO_INCREMENT FIRST',
  'SELECT "La columna id ya existe" AS message');

PREPARE stmt_id FROM @sqlstmt_id;
EXECUTE stmt_id;
DEALLOCATE PREPARE stmt_id;

-- Verificar si existe la columna numerol, si no existe agregarla
SET @exist_numerol := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ganadores' AND COLUMN_NAME = 'numerol');

SET @sqlstmt_numerol := IF(@exist_numerol = 0,
  'ALTER TABLE ganadores ADD COLUMN numerol VARCHAR(10) AFTER id_factura',
  'SELECT "La columna numerol ya existe" AS message');

PREPARE stmt_numerol FROM @sqlstmt_numerol;
EXECUTE stmt_numerol;
DEALLOCATE PREPARE stmt_numerol;

-- Verificar si existe la columna id_numero_ganador, si no existe agregarla
SET @exist_idng := (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ganadores' AND COLUMN_NAME = 'id_numero_ganador');

SET @sqlstmt_idng := IF(@exist_idng = 0,
  'ALTER TABLE ganadores ADD COLUMN id_numero_ganador INT AFTER fecha_hora_pago',
  'SELECT "La columna id_numero_ganador ya existe" AS message');

PREPARE stmt_idng FROM @sqlstmt_idng;
EXECUTE stmt_idng;
DEALLOCATE PREPARE stmt_idng;

-- Establecer valores por defecto
ALTER TABLE ganadores
MODIFY COLUMN pagada TINYINT DEFAULT 0;
