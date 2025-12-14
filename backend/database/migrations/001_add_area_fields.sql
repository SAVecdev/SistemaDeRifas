-- Migración para agregar campos descripcion, activo y created_at a la tabla area
-- Fecha: 2025-12-04

-- Verificar si las columnas ya existen antes de agregarlas
SET @dbname = 'rifaparatodos';
SET @tablename = 'area';

-- Agregar columna descripcion si no existe
SET @col_exists_desc = (
  SELECT COUNT(*) 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'descripcion'
);

SET @sql_desc = IF(@col_exists_desc = 0,
  'ALTER TABLE area ADD COLUMN descripcion TEXT NULL AFTER nombre',
  'SELECT "Columna descripcion ya existe" AS mensaje'
);

PREPARE stmt FROM @sql_desc;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar columna activo si no existe
SET @col_exists_activo = (
  SELECT COUNT(*) 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'activo'
);

SET @sql_activo = IF(@col_exists_activo = 0,
  'ALTER TABLE area ADD COLUMN activo TINYINT(1) DEFAULT 1 NOT NULL AFTER descripcion',
  'SELECT "Columna activo ya existe" AS mensaje'
);

PREPARE stmt FROM @sql_activo;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar columna created_at si no existe
SET @col_exists_created = (
  SELECT COUNT(*) 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'created_at'
);

SET @sql_created = IF(@col_exists_created = 0,
  'ALTER TABLE area ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER saldo_06',
  'SELECT "Columna created_at ya existe" AS mensaje'
);

PREPARE stmt FROM @sql_created;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar columna updated_at si no existe
SET @col_exists_updated = (
  SELECT COUNT(*) 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'updated_at'
);

SET @sql_updated = IF(@col_exists_updated = 0,
  'ALTER TABLE area ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at',
  'SELECT "Columna updated_at ya existe" AS mensaje'
);

PREPARE stmt FROM @sql_updated;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar que todas las áreas existentes tengan activo = 1
UPDATE area SET activo = 1 WHERE activo IS NULL OR activo = 0;

-- Mostrar la estructura final de la tabla
DESCRIBE area;

-- Mostrar mensaje de éxito
SELECT 'Migración completada exitosamente' AS resultado;
