import pool from '../database/connection.js';

// ===================== CRUD GANADORES =====================

// Crear registro de ganador
export const createGanador = async (ganadorData) => {
  const { id_usuario, id_factura, saldo_premio, nivel_premio, id_area } = ganadorData;
  
  const [result] = await pool.execute(
    'INSERT INTO ganadores (id_usuario, id_factura, saldo_premio, nivel_premio, id_area, pagada, fecha_hora_pago) VALUES (?, ?, ?, ?, ?, 0, NULL)',
    [id_usuario, id_factura, saldo_premio, nivel_premio, id_area || null]
  );
  
  return result.insertId;
};

// Obtener todos los ganadores
export const getAllGanadores = async () => {
  const [rows] = await pool.execute(
    `SELECT g.*, u.nombre as usuario_nombre, u.correo, a.nombre as area_nombre
     FROM ganadores g
     JOIN usuario u ON g.id_usuario = u.id
     LEFT JOIN area a ON g.id_area = a.id
     ORDER BY g.pagada ASC, g.nivel_premio ASC`
  );
  return rows;
};

// Obtener ganadores por usuario
export const getGanadoresByUsuario = async (id_usuario) => {
  const [rows] = await pool.execute(
    `SELECT g.*, a.nombre as area_nombre
     FROM ganadores g
     LEFT JOIN area a ON g.id_area = a.id
     WHERE g.id_usuario = ?
     ORDER BY g.fecha_hora_pago DESC`,
    [id_usuario]
  );
  return rows;
};

// Obtener ganadores por área
export const getGanadoresByArea = async (id_area) => {
  const [rows] = await pool.execute(
    `SELECT g.*, u.nombre as usuario_nombre, u.correo
     FROM ganadores g
     JOIN usuario u ON g.id_usuario = u.id
     WHERE g.id_area = ?
     ORDER BY g.pagada ASC, g.nivel_premio ASC`,
    [id_area]
  );
  return rows;
};

// Obtener ganadores no pagados
export const getGanadoresNoPagados = async () => {
  const [rows] = await pool.execute(
    `SELECT g.*, u.nombre as usuario_nombre, u.correo, u.telefono, a.nombre as area_nombre
     FROM ganadores g
     JOIN usuario u ON g.id_usuario = u.id
     LEFT JOIN area a ON g.id_area = a.id
     WHERE g.pagada = 0
     ORDER BY g.nivel_premio ASC`
  );
  return rows;
};

// Obtener ganadores pagados
export const getGanadoresPagados = async () => {
  const [rows] = await pool.execute(
    `SELECT g.*, u.nombre as usuario_nombre, u.correo, a.nombre as area_nombre
     FROM ganadores g
     JOIN usuario u ON g.id_usuario = u.id
     LEFT JOIN area a ON g.id_area = a.id
     WHERE g.pagada = 1
     ORDER BY g.fecha_hora_pago DESC`
  );
  return rows;
};

// Obtener ganador específico por factura y nivel
export const getGanadorByFacturaYNivel = async (id_factura, nivel_premio) => {
  const [rows] = await pool.execute(
    `SELECT g.*, u.nombre as usuario_nombre, u.correo, a.nombre as area_nombre
     FROM ganadores g
     JOIN usuario u ON g.id_usuario = u.id
     LEFT JOIN area a ON g.id_area = a.id
     WHERE g.id_factura = ? AND g.nivel_premio = ?`,
    [id_factura, nivel_premio]
  );
  return rows[0];
};

// Marcar premio como pagado
export const marcarPremioPagado = async (id_usuario, id_factura, nivel_premio) => {
  const [result] = await pool.execute(
    'UPDATE ganadores SET pagada = 1, fecha_hora_pago = NOW() WHERE id_usuario = ? AND id_factura = ? AND nivel_premio = ?',
    [id_usuario, id_factura, nivel_premio]
  );
  
  return result.affectedRows > 0;
};

// Actualizar área del ganador
export const updateAreaGanador = async (id_usuario, id_factura, nivel_premio, id_area) => {
  const [result] = await pool.execute(
    'UPDATE ganadores SET id_area = ? WHERE id_usuario = ? AND id_factura = ? AND nivel_premio = ?',
    [id_area, id_usuario, id_factura, nivel_premio]
  );
  
  return result.affectedRows > 0;
};

// Eliminar ganador
export const deleteGanador = async (id_usuario, id_factura, nivel_premio) => {
  const [result] = await pool.execute(
    'DELETE FROM ganadores WHERE id_usuario = ? AND id_factura = ? AND nivel_premio = ?',
    [id_usuario, id_factura, nivel_premio]
  );
  
  return result.affectedRows > 0;
};

// Contar ganadores no pagados por área
export const countGanadoresNoPagadosByArea = async (id_area) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM ganadores WHERE id_area = ? AND pagada = 0',
    [id_area]
  );
  return rows[0].total;
};

// Sumar total de premios no pagados
export const sumPremiosNoPagados = async () => {
  const [rows] = await pool.execute(
    'SELECT COALESCE(SUM(CAST(saldo_premio AS DECIMAL(10,2))), 0) as total FROM ganadores WHERE pagada = 0'
  );
  return rows[0].total;
};

// Sumar total de premios pagados
export const sumPremiosPagados = async () => {
  const [rows] = await pool.execute(
    'SELECT COALESCE(SUM(CAST(saldo_premio AS DECIMAL(10,2))), 0) as total FROM ganadores WHERE pagada = 1'
  );
  return rows[0].total;
};

// Obtener ganadores por rango de fechas
export const getGanadoresByDateRange = async (fecha_inicio, fecha_fin) => {
  const [rows] = await pool.execute(
    `SELECT g.*, u.nombre as usuario_nombre, u.correo, a.nombre as area_nombre
     FROM ganadores g
     JOIN usuario u ON g.id_usuario = u.id
     LEFT JOIN area a ON g.id_area = a.id
     WHERE g.pagada = 1 AND g.fecha_hora_pago BETWEEN ? AND ?
     ORDER BY g.fecha_hora_pago DESC`,
    [fecha_inicio, fecha_fin]
  );
  return rows;
};

// Obtener estadísticas de ganadores por nivel de premio
export const getEstadisticasByNivel = async () => {
  const [rows] = await pool.execute(
    `SELECT 
      nivel_premio,
      COUNT(*) as total_ganadores,
      SUM(CASE WHEN pagada = 1 THEN 1 ELSE 0 END) as pagados,
      SUM(CASE WHEN pagada = 0 THEN 1 ELSE 0 END) as pendientes,
      COALESCE(SUM(CASE WHEN pagada = 1 THEN CAST(saldo_premio AS DECIMAL(10,2)) ELSE 0 END), 0) as total_pagado,
      COALESCE(SUM(CASE WHEN pagada = 0 THEN CAST(saldo_premio AS DECIMAL(10,2)) ELSE 0 END), 0) as total_pendiente
     FROM ganadores
     GROUP BY nivel_premio
     ORDER BY nivel_premio`
  );
  return rows;
};

// Verificar si un usuario tiene premios pendientes
export const tienePremiosPendientes = async (id_usuario) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM ganadores WHERE id_usuario = ? AND pagada = 0',
    [id_usuario]
  );
  return rows[0].total > 0;
};
