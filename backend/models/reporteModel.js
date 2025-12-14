import pool from '../config/database.js';

/**
 * Reporte SIMPLE de ventas agrupadas por usuario y fecha
 */
export const getReporteVentas = async (fechaInicio, fechaFin) => {
  const [rows] = await pool.execute(
    `SELECT 
      DATE(v.fecha) as fecha,
      u.id as id_usuario,
      u.nombre as usuario,
      COUNT(v.id) as total_ventas,
      SUM(v.cantidad) as total_numeros,
      SUM(v.total) as monto_total
    FROM venta v
    INNER JOIN usuario u ON v.id_usuario = u.id
    WHERE v.fecha BETWEEN ? AND ?
      AND (v.eliminada IS NULL OR v.eliminada = 0)
    GROUP BY DATE(v.fecha), u.id, u.nombre
    ORDER BY fecha DESC, monto_total DESC`,
    [fechaInicio, fechaFin]
  );
  return rows;
};

/**
 * Reporte SIMPLE de premios por usuario (por día y rango)
 */
export const getReportePremios = async (fechaInicio, fechaFin) => {
  const [rows] = await pool.execute(
    `SELECT
      u.id AS id_usuario,
      u.nombre,
      g.fecha,
      SUM(g.saldo_premio) AS total_premios_ganados,
      SUM(CASE WHEN g.pagada = 1 THEN g.saldo_premio ELSE 0 END) AS total_premios_pagados
    FROM ganadores g
    INNER JOIN usuario u ON g.id_usuario = u.id
    WHERE DATE(g.fecha) BETWEEN DATE(?) AND DATE(?)
    GROUP BY u.id, u.nombre, g.fecha
    ORDER BY g.fecha DESC, total_premios_ganados DESC`,
    [fechaInicio, fechaFin]
  );
  return rows;
};

/**
 * Resumen general para dashboard
 */
export const getResumenGeneral = async (fechaInicio, fechaFin) => {
  // Ventas del período
  const [ventas] = await pool.execute(
    `SELECT 
      COUNT(DISTINCT id_factura) as total_facturas,
      COUNT(id) as total_ventas,
      SUM(cantidad) as total_numeros,
      SUM(total) as monto_total
    FROM venta 
    WHERE fecha BETWEEN ? AND ?
      AND (eliminada IS NULL OR eliminada = 0)`,
    [fechaInicio, fechaFin]
  );

  // Premios del período
  const [premios] = await pool.execute(
    `SELECT 
      COUNT(*) as total_premios,
      SUM(saldo_premio) as monto_premios,
      SUM(CASE WHEN pagada = 1 THEN saldo_premio ELSE 0 END) as premios_pagados,
      SUM(CASE WHEN pagada = 0 THEN saldo_premio ELSE 0 END) as premios_pendientes
    FROM ganadores 
    WHERE DATE(fecha) BETWEEN DATE(?) AND DATE(?)`,
    [fechaInicio, fechaFin]
  );

  // Ventas de hoy
  const [ventasHoy] = await pool.execute(
    `SELECT 
      COUNT(id) as total_ventas,
      SUM(cantidad) as total_numeros,
      SUM(total) as monto_total
    FROM venta 
    WHERE DATE(fecha) = CURDATE()
      AND (eliminada IS NULL OR eliminada = 0)`
  );

  // Transacciones del período (recargas y retiros)
  const [transacciones] = await pool.execute(
    `SELECT 
      SUM(CASE WHEN tipo = 'recarga' THEN monto ELSE 0 END) as total_recargas,
      COUNT(CASE WHEN tipo = 'recarga' THEN 1 END) as cantidad_recargas,
      SUM(CASE WHEN tipo = 'retiro' THEN monto ELSE 0 END) as total_retiros,
      COUNT(CASE WHEN tipo = 'retiro' THEN 1 END) as cantidad_retiros
    FROM transaccion 
    WHERE DATE(fecha) BETWEEN DATE(?) AND DATE(?)`,
    [fechaInicio, fechaFin]
  );

  return {
    ventas: ventas[0],
    premios: premios[0],
    ventasHoy: ventasHoy[0],
    transacciones: transacciones[0]
  };
};

/**
 * Reporte de transacciones (recargas y retiros)
 */
export const getReporteTransacciones = async (fechaInicio, fechaFin) => {
  const [rows] = await pool.execute(
    `SELECT 
      t.id,
      t.fecha,
      t.tipo,
      t.monto,
      t.saldo_anterior,
      t.saldo_nuevo,
      t.descripcion,
      c.nombre as cliente,
      v.nombre as vendedor
    FROM transaccion t
    INNER JOIN usuario c ON t.id_usuario = c.id
    LEFT JOIN usuario v ON t.id_realizado_por = v.id
    WHERE DATE(t.fecha) BETWEEN DATE(?) AND DATE(?)
    ORDER BY t.fecha DESC`,
    [fechaInicio, fechaFin]
  );
  return rows;
};
