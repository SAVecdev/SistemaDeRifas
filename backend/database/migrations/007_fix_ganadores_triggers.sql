-- ============================================
-- MIGRACIÓN 007: Corregir triggers de ganadores
-- ============================================
-- Fecha: 2025-12-07
-- Descripción: 
--   1. Elimina triggers antiguos con columna fecha_hora_pagada incorrecta
--   2. Crea nuevos triggers usando fecha_hora_pago
--   3. Usa la lógica correcta con opciones_premios
-- ============================================

-- 1. ELIMINAR TRIGGERS ANTIGUOS (si existen)
DROP TRIGGER IF EXISTS tr_asignar_ganadores_venta;

DROP TRIGGER IF EXISTS tr_revalidar_ganadores_venta;

-- 2. CREAR TRIGGER PARA INSERT EN numero_ganadores
CREATE TRIGGER tr_asignar_ganadores_venta
AFTER INSERT ON numero_ganadores
FOR EACH ROW
BEGIN
    INSERT INTO ganadores (
        id_usuario,
        id_factura,
        numerol,
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

-- 3. CREAR TRIGGER PARA UPDATE EN numero_ganadores
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
