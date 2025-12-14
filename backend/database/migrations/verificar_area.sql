-- Verificar estructura actual de la tabla area
DESCRIBE area;

-- Si la tabla NO tiene los campos descripcion y activo, descomentar estas líneas:
-- ALTER TABLE area ADD COLUMN descripcion TEXT NULL AFTER nombre;
-- ALTER TABLE area ADD COLUMN activo TINYINT(1) DEFAULT 1 NOT NULL AFTER descripcion;
-- ALTER TABLE area ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER saldo_06;
-- ALTER TABLE area ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Nota: Si los campos ya existen, el CRUD funcionará con la estructura actual de la BD
-- Los campos descripcion y activo son opcionales en el código
