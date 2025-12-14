-- Migración: Agregar columna id_area a la tabla usuario
-- Fecha: 2025-12-06
-- Descripción: Agrega el campo id_area para asociar usuarios con áreas

-- Verificar si la columna ya existe antes de agregarla
SET @dbname = DATABASE();
SET @tablename = 'usuario';
SET @columnname = 'id_area';

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT "Columna id_area ya existe en usuario" AS mensaje',
  'ALTER TABLE usuario ADD COLUMN id_area int AFTER telefono'
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar foreign key si la columna fue agregada
SET @fk_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = @dbname
  AND TABLE_NAME = @tablename
  AND COLUMN_NAME = @columnname
  AND REFERENCED_TABLE_NAME = 'area'
);

SET @fk_statement = IF(@fk_exists = 0,
  'ALTER TABLE usuario ADD FOREIGN KEY (id_area) REFERENCES area(id)',
  'SELECT "Foreign key ya existe" AS mensaje'
);

PREPARE fkStmt FROM @fk_statement;
EXECUTE fkStmt;
DEALLOCATE PREPARE fkStmt;

SELECT 'Columna id_area agregada correctamente a usuario' AS Resultado;
