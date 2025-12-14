import pool from '../database/connection.js';

// ===================== CRUD FACTURAS =====================

// Crear nueva factura
export const createFactura = async (id_usuario) => {
  // Obtener el último número de factura del usuario
  const [lastFactura] = await pool.execute(
    'SELECT MAX(factura) as last_factura FROM factura WHERE id_usuario = ?',
    [id_usuario]
  );
  
  const nextFacturaNumber = (lastFactura[0].last_factura || 0) + 1;
  
  const [result] = await pool.execute(
    'INSERT INTO factura (factura, id_usuario) VALUES (?, ?)',
    [nextFacturaNumber, id_usuario]
  );
  
  return result.insertId;
};

// Obtener factura por ID
export const getFacturaById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM factura WHERE id = ?',
    [id]
  );
  return rows[0];
};

// Obtener todas las facturas de un usuario
export const getFacturasByUsuario = async (id_usuario) => {
  const [rows] = await pool.execute(
    'SELECT * FROM factura WHERE id_usuario = ? ORDER BY factura DESC',
    [id_usuario]
  );
  return rows;
};

// Obtener número de factura de un usuario
export const getNextFacturaNumber = async (id_usuario) => {
  const [rows] = await pool.execute(
    'SELECT MAX(factura) as last_factura FROM factura WHERE id_usuario = ?',
    [id_usuario]
  );
  
  return (rows[0].last_factura || 0) + 1;
};

// Obtener facturas con ventas
export const getFacturasWithVentas = async (id_usuario) => {
  const [rows] = await pool.execute(
    `SELECT f.*, COUNT(v.id) as total_ventas, SUM(v.total) as total_monto
     FROM factura f
     LEFT JOIN venta v ON f.id = v.id_factura
     WHERE f.id_usuario = ?
     GROUP BY f.id
     ORDER BY f.factura DESC`,
    [id_usuario]
  );
  return rows;
};

// Contar facturas por usuario
export const countFacturasByUsuario = async (id_usuario) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM factura WHERE id_usuario = ?',
    [id_usuario]
  );
  return rows[0].total;
};

// Eliminar factura (solo si no tiene ventas asociadas)
export const deleteFactura = async (id) => {
  // Verificar si tiene ventas
  const [ventas] = await pool.execute(
    'SELECT COUNT(*) as total FROM venta WHERE id_factura = ?',
    [id]
  );
  
  if (ventas[0].total > 0) {
    throw new Error('No se puede eliminar una factura con ventas asociadas');
  }
  
  const [result] = await pool.execute(
    'DELETE FROM factura WHERE id = ?',
    [id]
  );
  
  return result.affectedRows > 0;
};
