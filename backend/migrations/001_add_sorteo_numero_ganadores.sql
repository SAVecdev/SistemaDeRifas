-- Migration: Add 'sorteo' column to numero_ganadores
-- Run this manually against the MySQL database that the app uses.
-- Example (PowerShell):
-- mysql -u <user> -p<password> < database_name < 001_add_sorteo_numero_ganadores.sql

ALTER TABLE numero_ganadores
ADD COLUMN `sorteo` INT NOT NULL DEFAULT 1 AFTER `id_rifa`;

-- Optional: add unique index to prevent duplicates per (id_rifa, sorteo, nivel_premio)
-- NOTE: add this only if you want DB-level uniqueness enforcement.
-- ALTER TABLE numero_ganadores
-- ADD UNIQUE INDEX ux_numero_ganadores_rifa_sorteo_nivel (id_rifa, sorteo, nivel_premio);

-- If your table already has a lot of rows and you need to backfill different sorteo values,
-- run appropriate UPDATE statements after adding the column.
