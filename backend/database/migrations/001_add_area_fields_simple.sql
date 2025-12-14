-- Script directo para agregar campos a la tabla area
-- Ejecutar manualmente en phpMyAdmin o MySQL Workbench

USE rifaparatodos;

-- Agregar columna descripcion
ALTER TABLE area ADD COLUMN IF NOT EXISTS descripcion TEXT NULL AFTER nombre;

-- Agregar columna activo
ALTER TABLE area ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1 NOT NULL AFTER descripcion;

-- Agregar columna created_at
ALTER TABLE area ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER saldo_06;

-- Agregar columna updated_at
ALTER TABLE area ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Actualizar áreas existentes para que estén activas
UPDATE area SET activo = 1 WHERE activo IS NULL OR activo = 0;

-- Verificar estructura
DESCRIBE area;

SELECT 'Migración completada' as estado;
