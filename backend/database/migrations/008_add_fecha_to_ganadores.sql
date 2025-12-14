-- ============================================
-- MIGRACIÓN 008: Agregar columna fecha a ganadores
-- ============================================
-- Fecha: 2025-12-07
-- Descripción: 
--   1. Agrega columna fecha a la tabla ganadores
--   2. Actualiza triggers para incluir la fecha de venta
-- ============================================

-- 1. AGREGAR COLUMNA FECHA A GANADORES
ALTER TABLE ganadores 
ADD COLUMN IF NOT EXISTS fecha DATE NULL AFTER numerol;

-- 2. ACTUALIZAR TRIGGERS
DROP TRIGGER IF EXISTS tr_asignar_ganadores_venta;

DROP TRIGGER IF EXISTS tr_revalidar_ganadores_venta;

CREATE TRIGGER tr_asignar_ganadores_venta
AFTER INSERT ON numero_ganadores
FOR EACH ROW
BEGIN
    INSERT INTO ganadores (
        id_usuario,
        id_factura,
        numerol,
        fecha,
        saldo_premio,
        nivel_premio,
        id_area,
        id_numero_ganador,
        pagada,
        fecha_hora_pago
    )
    SELECT
        v.id_usuario,
        v.id_factura,
        v.numero,
        v.fecha,
        COALESCE(CAST(op.valor_premio AS CHAR), '0') as saldo_premio,
        NEW.nivel_premio,
        u.id_area,
        NEW.id,
        0,
        NULL
    FROM
        venta v
        INNER JOIN usuario u ON v.id_usuario = u.id
        INNER JOIN rifa r ON v.id_rifas = r.id
        LEFT JOIN opciones_premios op ON r.id_tipo = op.id_tipo_rifa 
                                      AND u.id_area = op.id_area 
                                      AND v.valor = op.saldo_ganado
                                      AND LENGTH(v.numero) = op.digitos
                                      AND op.nivel_premio = NEW.nivel_premio
    WHERE
        v.id_rifas = NEW.id_rifa
        AND NEW.numero_ganador LIKE CONCAT('%', v.numero)
        AND v.eliminada = 0;
END;

CREATE TRIGGER tr_revalidar_ganadores_venta
AFTER UPDATE ON numero_ganadores
FOR EACH ROW
BEGIN
    DELETE FROM ganadores
    WHERE id_numero_ganador = OLD.id;

    INSERT INTO ganadores (
        id_usuario,
        id_factura,
        numerol,
        fecha,
        saldo_premio,
        nivel_premio,
        id_area,
        id_numero_ganador,
        pagada,
        fecha_hora_pago
    )
    SELECT
        v.id_usuario,
        v.id_factura,
        v.numero,
        v.fecha,
        COALESCE(CAST(op.valor_premio AS CHAR), '0') as saldo_premio,
        NEW.nivel_premio,
        u.id_area,
        NEW.id,
        0,
        NULL
    FROM
        venta v
        INNER JOIN usuario u ON v.id_usuario = u.id
        INNER JOIN rifa r ON v.id_rifas = r.id
        LEFT JOIN opciones_premios op ON r.id_tipo = op.id_tipo_rifa 
                                      AND u.id_area = op.id_area 
                                      AND v.valor = op.saldo_ganado
                                      AND LENGTH(v.numero) = op.digitos
                                      AND op.nivel_premio = NEW.nivel_premio
    WHERE
        v.id_rifas = NEW.id_rifa
        AND NEW.numero_ganador LIKE CONCAT('%', v.numero)
        AND v.eliminada = 0;
END;
