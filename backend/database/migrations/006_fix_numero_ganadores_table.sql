-- Migration: Fix numero_ganadores table structure
-- Add id column as PRIMARY KEY and unique constraint

-- Agregar columna id como PRIMARY KEY
ALTER TABLE numero_ganadores 
ADD COLUMN id INT PRIMARY KEY AUTO_INCREMENT FIRST;

-- Agregar índice único para evitar duplicados
-- Solo puede haber un nivel_premio por sorteo para cada id_rifa
ALTER TABLE numero_ganadores
ADD UNIQUE INDEX ux_numero_ganadores_rifa_sorteo_nivel (id_rifa, sorteo, nivel_premio);

-- Ejemplo de datos esperados:
-- id_rifa=1, sorteo=1, nivel_premio=1 (primer premio del primer sorteo de la rifa 1)
-- id_rifa=1, sorteo=1, nivel_premio=2 (segundo premio del primer sorteo de la rifa 1)
-- id_rifa=1, sorteo=2, nivel_premio=1 (primer premio del segundo sorteo de la rifa 1)
-- NO SE PUEDE repetir: id_rifa=1, sorteo=1, nivel_premio=1 (ya existe)
