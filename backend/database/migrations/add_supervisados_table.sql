-- Tabla de relación supervisor-vendedor (ya existe como supervision)
-- Este archivo es solo de referencia, la tabla supervision ya existe en la base de datos

-- Estructura de la tabla supervision:
-- CREATE TABLE IF NOT EXISTS `supervision` (
--   `id` int PRIMARY KEY AUTO_INCREMENT,
--   `id_supervisor` int NOT NULL,
--   `id_vendedor` int NOT NULL,
--   `fecha_asignacion` timestamp DEFAULT CURRENT_TIMESTAMP,
--   `activo` tinyint(1) DEFAULT 1,
--   FOREIGN KEY (`id_supervisor`) REFERENCES `usuario` (`id`) ON DELETE CASCADE,
--   FOREIGN KEY (`id_vendedor`) REFERENCES `usuario` (`id`) ON DELETE CASCADE,
--   UNIQUE KEY `unique_supervision` (`id_supervisor`, `id_vendedor`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para mejorar el rendimiento
-- CREATE INDEX `idx_supervisor` ON `supervision` (`id_supervisor`);
-- CREATE INDEX `idx_vendedor` ON `supervision` (`id_vendedor`);
