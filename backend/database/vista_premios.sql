-- =====================================================
-- VISTA: vista_premios_consolidada
-- =====================================================
-- Vista SQL para la gestión de premios del administrador
-- Muestra: tipo | saldo (apuesta) | premio1 | premio2 | ... | premio10 | área
-- 
-- IMPORTANTE:
-- - saldo_ganado = Valor de la apuesta ($0.25 a $20.00)
-- - valor_premio = Premio que se gana si acierta
-- - Todos los premios del mismo tipo comparten el mismo saldo_ganado (apuesta)
-- =====================================================

CREATE OR REPLACE VIEW vista_premios_consolidada AS
SELECT 
  tr.id as id_tipo_rifa,
  tr.nombre as tipo,
  MAX(CASE WHEN op.nivel_premio = 1 THEN op.saldo_ganado END) as saldo,
  MAX(CASE WHEN op.nivel_premio = 1 THEN op.valor_premio END) as premio_01,
  MAX(CASE WHEN op.nivel_premio = 2 THEN op.valor_premio END) as premio_02,
  MAX(CASE WHEN op.nivel_premio = 3 THEN op.valor_premio END) as premio_03,
  MAX(CASE WHEN op.nivel_premio = 4 THEN op.valor_premio END) as premio_04,
  MAX(CASE WHEN op.nivel_premio = 5 THEN op.valor_premio END) as premio_05,
  MAX(CASE WHEN op.nivel_premio = 6 THEN op.valor_premio END) as premio_06,
  MAX(CASE WHEN op.nivel_premio = 7 THEN op.valor_premio END) as premio_07,
  MAX(CASE WHEN op.nivel_premio = 8 THEN op.valor_premio END) as premio_08,
  MAX(CASE WHEN op.nivel_premio = 9 THEN op.valor_premio END) as premio_09,
  MAX(CASE WHEN op.nivel_premio = 10 THEN op.valor_premio END) as premio_10,
  a.nombre as area,
  a.id as id_area
FROM tipo_rifa tr
LEFT JOIN opciones_premios op ON tr.id = op.id_tipo_rifa
LEFT JOIN area a ON op.id_area = a.id
GROUP BY tr.id, tr.nombre, a.id, a.nombre
ORDER BY tr.id;

-- =====================================================
-- EXPLICACIÓN DE LA VISTA
-- =====================================================
-- Esta vista consolida toda la información de premios en una sola fila por tipo de rifa
-- 
-- Ejemplo de resultado:
-- +-------+-------+----------+----------+----------+-----+-----------+---------+
-- | tipo  | saldo | premio_01| premio_02| premio_03| ... | premio_10 | area    |
-- +-------+-------+----------+----------+----------+-----+-----------+---------+
-- | Diaria| 5.00  | 50000    | 10000    | 5000     | ... | 20        | Central |
-- +-------+-------+----------+----------+----------+-----+-----------+---------+
--
-- USO:
-- SELECT * FROM vista_premios_consolidada;
-- SELECT * FROM vista_premios_consolidada WHERE tipo = 'Diaria';
-- SELECT * FROM vista_premios_consolidada WHERE area = 'Central';
