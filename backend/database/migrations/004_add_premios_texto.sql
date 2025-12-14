-- Crear tabla para premios en formato de texto
CREATE TABLE IF NOT EXISTS `premios_texto` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_tipo_rifa` int NOT NULL,
  `nivel_premio` int NOT NULL,
  `descripcion_premio` text NOT NULL,
  `saldo_ganado` varchar(255),
  `id_area` int,
  `digitos` int,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_tipo_rifa`) REFERENCES `tipo_rifa` (`id`),
  FOREIGN KEY (`id_area`) REFERENCES `area` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice para búsquedas rápidas
CREATE INDEX idx_premios_texto_tipo ON premios_texto(id_tipo_rifa);
CREATE INDEX idx_premios_texto_nivel ON premios_texto(id_tipo_rifa, nivel_premio);
