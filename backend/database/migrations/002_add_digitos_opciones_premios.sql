-- Migración: Agregar columna digitos a la tabla opciones_premios
-- Fecha: 2025-12-04
-- Descripción: Agrega el campo digitos para registrar la cantidad de dígitos del premio

-- Verificar si la columna ya existe antes de agregarla
SET @dbname = DATABASE();
SET @tablename = 'opciones_premios';
SET @columnname = 'digitos';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  'ALTER TABLE opciones_premios ADD COLUMN digitos int AFTER id_area'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Mensaje de confirmación
SELECT 'Columna digitos agregada correctamente a opciones_premios' AS Resultado;
