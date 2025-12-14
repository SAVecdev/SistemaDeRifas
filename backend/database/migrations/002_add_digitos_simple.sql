-- Migración simple: Agregar columna digitos a opciones_premios
-- Ejecutar solo si la columna no existe

ALTER TABLE opciones_premios ADD COLUMN digitos int AFTER id_area;
