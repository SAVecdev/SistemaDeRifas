-- ============================================
-- MIGRACIÓN 009: Crear tablas supervision y permisos
-- ============================================
-- Fecha: 2025-12-07
-- Descripción: 
--   1. Crea tabla supervision (supervisores y supervisados)
--   2. Crea tabla permisos (permisos personalizados por usuario)
-- ============================================

-- 1. CREAR TABLA SUPERVISION
CREATE TABLE IF NOT EXISTS supervision (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_supervisor INT NOT NULL,
    id_supervisado INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_supervisor) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (id_supervisado) REFERENCES usuario(id) ON DELETE CASCADE,
    UNIQUE KEY ux_supervision (id_supervisor, id_supervisado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CREAR TABLA PERMISOS
CREATE TABLE IF NOT EXISTS permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
    UNIQUE KEY ux_permisos (id_usuario, modulo, accion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CREAR ÍNDICES
CREATE INDEX idx_supervision_supervisor ON supervision(id_supervisor);
CREATE INDEX idx_supervision_supervisado ON supervision(id_supervisado);
CREATE INDEX idx_permisos_usuario ON permisos(id_usuario);
CREATE INDEX idx_permisos_modulo ON permisos(modulo);
