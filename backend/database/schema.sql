CREATE TABLE `usuario` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(255),
  `correo` varchar(255),
  `password` varchar(255),
  `direccion` varchar(255),
  `rol` enum('administrador','supervisor','vendedor','cliente'),
  `saldo` decimal(10,2),
  `activo` tinyint(1),
  `created_at` timestamp,
  `updated_at` timestamp,
  `foto_perfil` varchar(255),
  `telefono` varchar(20),
  `id_area` int
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `session` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_usuario` int,
  `token_sesion` varchar(255),
  `ip` varchar(45),
  `user_agent` text,
  `navegador` varchar(100),
  `sistema_operativo` varchar(100),
  `fecha_inicio` datetime,
  `ultimo_acceso` datetime,
  `fecha_cierre` datetime,
  `estado` enum('activa','expirada','cerrada'),
  `duracion_minutos` int,
  `created_at` timestamp
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Pueden haber varias sesiones por usuario. Tiempo máximo: 120 minutos
-- Se cierra automáticamente si no hay actividad en ese tiempo

CREATE TABLE `factura` (
  `id` int primary KEY AUTO_INCREMENT,
  `factura` int ,
  `id_usuario` int
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Cada factura pertenece a un usuario y debe incrementar por usuario
-- Se pueden repetir entre usuarios pero no para el mismo usuario

CREATE TABLE `venta` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_usuario` int,
  `id_rifas` int,
  `id_factura` int,
  `fecha` date,
  `numero` varchar(6),
  `cantidad` int,
  `valor` decimal(10,2),
  `total` decimal(10,2),
  `premio_01` varchar(255),
  `premio_02` varchar(255),
  `premio_03` varchar(255),
  `premio_04` varchar(255),
  `premio_05` varchar(255),
  `premio_06` varchar(255),
  `premio_07` varchar(255),
  `premio_08` varchar(255),
  `premio_09` varchar(255),
  `premio_10` varchar(255),
  `created_at` timestamp,
  `updated_at` timestamp,
  `eliminada` tinyint(1),
  `pagada` tinyint(1),
  `fecha_pago` datetime,
  `fecha_eliminada` datetime,
  `factura` varchar(45)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `tipo_rifa` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `opciones_premios` (
  `id_tipo_rifa` int,
  `valor_premio` decimal,
  `nivel_premio` int,
  `saldo_ganado` varchar(255),
  `id_area` int,
  `digitos` int
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `rifa` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `sorteos` int,
  `descripcion` text,
  `imagen` varchar(250),
  `id_tipo` int,
  `fecha_hora_juego` datetime
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `numero_ganadores` (
  `id_rifa` int,
  `nivel_premio` int,
  `numero_ganador` varchar(255),
  `sorteo` int
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `area` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(50),
  `saldo_02` decimal,
  `saldo_03` decimal,
  `saldo_04` decimal,
  `saldo_05` decimal,
  `saldo_06` decimal
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ganadores` (
  `id_usuario` int,
  `id_factura` int,
  `saldo_premio` varchar(255),
  `nivel_premio` int,
  `id_area` int,
  `pagada` tinyint,
  `fecha_hora_pago` datetime
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Foreign keys corregidas: la tabla hija referencia a la tabla padre
ALTER TABLE `session` ADD FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`);

ALTER TABLE `factura` ADD FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`);

ALTER TABLE `venta` ADD FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`);

ALTER TABLE `venta` ADD FOREIGN KEY (`id_rifas`) REFERENCES `rifa` (`id`);

ALTER TABLE `venta` ADD FOREIGN KEY (`id_factura`) REFERENCES `factura` (`id`);

ALTER TABLE `opciones_premios` ADD FOREIGN KEY (`id_tipo_rifa`) REFERENCES `tipo_rifa` (`id`);

ALTER TABLE `opciones_premios` ADD FOREIGN KEY (`id_area`) REFERENCES `area` (`id`);

ALTER TABLE `rifa` ADD FOREIGN KEY (`id_tipo`) REFERENCES `tipo_rifa` (`id`);

ALTER TABLE `numero_ganadores` ADD FOREIGN KEY (`id_rifa`) REFERENCES `rifa` (`id`);

ALTER TABLE `ganadores` ADD FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`);

ALTER TABLE `ganadores` ADD FOREIGN KEY (`id_factura`) REFERENCES `factura` (`id`);

ALTER TABLE `ganadores` ADD FOREIGN KEY (`id_area`) REFERENCES `area` (`id`);

ALTER TABLE `usuario` ADD FOREIGN KEY (`id_area`) REFERENCES `area` (`id`);
