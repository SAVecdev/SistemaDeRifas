-- Script de verificación para la columna digitos en opciones_premios

-- Verificar si la columna existe
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT,
  COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'rifaparatodos'
  AND TABLE_NAME = 'opciones_premios'
  AND COLUMN_NAME = 'digitos';

-- Si no retorna filas, la columna NO existe
-- Si retorna una fila, la columna ya existe

-- Ver estructura completa de la tabla
DESCRIBE opciones_premios;
