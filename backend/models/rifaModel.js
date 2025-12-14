import pool from '../database/connection.js';

// ===================== CRUD RIFAS =====================

// Crear nueva rifa
export const createRifa = async (rifaData) => {
  const { sorteos, descripcion, imagen, id_tipo, fecha_hora_juego } = rifaData;
  
  const [result] = await pool.execute(
    'INSERT INTO rifa (sorteos, descripcion, imagen, id_tipo, fecha_hora_juego) VALUES (?, ?, ?, ?, ?)',
    [sorteos, descripcion, imagen || null, id_tipo, fecha_hora_juego]
  );
  
  return result.insertId;
};

// Obtener todas las rifas
export const getAllRifas = async () => {
  const [rows] = await pool.execute(
    `SELECT r.*, tr.nombre as tipo_nombre
     FROM rifa r
     LEFT JOIN tipo_rifa tr ON r.id_tipo = tr.id
     ORDER BY r.fecha_hora_juego DESC`
  );
  return rows;
};

// Obtener rifa por ID
export const getRifaById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT r.*, tr.nombre as tipo_nombre
     FROM rifa r
     LEFT JOIN tipo_rifa tr ON r.id_tipo = tr.id
     WHERE r.id = ?`,
    [id]
  );
  return rows[0];
};

// Obtener rifas activas (futuras)
export const getRifasActivas = async () => {
  const [rows] = await pool.execute(
    `SELECT r.id, r.sorteos, r.descripcion, r.imagen, r.id_tipo,
            DATE_FORMAT(r.fecha_hora_juego, '%Y-%m-%d %H:%i:%s') as fecha_hora_juego,
            tr.nombre as tipo_nombre
     FROM rifa r
     LEFT JOIN tipo_rifa tr ON r.id_tipo = tr.id
     WHERE DATE(r.fecha_hora_juego) >= CURDATE()
     ORDER BY r.fecha_hora_juego ASC`
  );
  return rows;
};

// Obtener rifas pasadas (finalizadas)
export const getRifasFinalizadas = async () => {
  const [rows] = await pool.execute(
    `SELECT r.*, tr.nombre as tipo_nombre
     FROM rifa r
     LEFT JOIN tipo_rifa tr ON r.id_tipo = tr.id
     WHERE r.fecha_hora_juego <= NOW()
     ORDER BY r.fecha_hora_juego DESC`
  );
  return rows;
};

// Obtener rifas por tipo
export const getRifasByTipo = async (id_tipo) => {
  const [rows] = await pool.execute(
    `SELECT r.*, tr.nombre as tipo_nombre
     FROM rifa r
     LEFT JOIN tipo_rifa tr ON r.id_tipo = tr.id
     WHERE r.id_tipo = ?
     ORDER BY r.fecha_hora_juego DESC`,
    [id_tipo]
  );
  return rows;
};

// Actualizar rifa
export const updateRifa = async (id, rifaData) => {
  const { sorteos, descripcion, imagen, id_tipo, fecha_hora_juego } = rifaData;
  
  const [result] = await pool.execute(
    'UPDATE rifa SET sorteos = ?, descripcion = ?, imagen = ?, id_tipo = ?, fecha_hora_juego = ? WHERE id = ?',
    [sorteos, descripcion, imagen, id_tipo, fecha_hora_juego, id]
  );
  
  return result.affectedRows > 0;
};

// Eliminar rifa
export const deleteRifa = async (id) => {
  // Verificar si tiene ventas
  const [ventas] = await pool.execute(
    'SELECT COUNT(*) as total FROM venta WHERE id_rifas = ?',
    [id]
  );
  
  if (ventas[0].total > 0) {
    throw new Error('No se puede eliminar una rifa con ventas asociadas');
  }
  
  const [result] = await pool.execute(
    'DELETE FROM rifa WHERE id = ?',
    [id]
  );
  
  return result.affectedRows > 0;
};

// Obtener rifa con información completa (premios, ventas, ganadores)
export const getRifaCompleta = async (id) => {
  // Obtener rifa básica
  const rifa = await getRifaById(id);
  if (!rifa) return null;
  
  // Obtener opciones de premios
  const [premios] = await pool.execute(
    `SELECT op.* FROM opciones_premios op WHERE op.id_tipo_rifa = ?`,
    [rifa.id_tipo]
  );
  
  // Obtener números ganadores
  const [ganadores] = await pool.execute(
    'SELECT * FROM numero_ganadores WHERE id_rifa = ? ORDER BY nivel_premio',
    [id]
  );
  
  // Obtener estadísticas de ventas
  const [stats] = await pool.execute(
    `SELECT 
      COUNT(*) as total_ventas,
      SUM(cantidad) as total_numeros_vendidos,
      SUM(total) as total_recaudado
     FROM venta 
     WHERE id_rifas = ? AND eliminada = 0 AND pagada = 1`,
    [id]
  );
  
  return {
    ...rifa,
    premios,
    ganadores,
    estadisticas: stats[0]
  };
};

// Obtener rifas próximas (próximas 24 horas)
export const getRifasProximas = async () => {
  const [rows] = await pool.execute(
    `SELECT r.*, tr.nombre as tipo_nombre
     FROM rifa r
     LEFT JOIN tipo_rifa tr ON r.id_tipo = tr.id
     WHERE r.fecha_hora_juego BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
     ORDER BY r.fecha_hora_juego ASC`
  );
  return rows;
};

// Obtener rifas del día
export const getRifasDelDia = async (fecha) => {
  const [rows] = await pool.execute(
    `SELECT r.*, tr.nombre as tipo_nombre
     FROM rifa r
     LEFT JOIN tipo_rifa tr ON r.id_tipo = tr.id
     WHERE DATE(r.fecha_hora_juego) = ?
     ORDER BY r.fecha_hora_juego ASC`,
    [fecha]
  );
  return rows;
};

// Contar rifas por tipo
export const countRifasByTipo = async (id_tipo) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM rifa WHERE id_tipo = ?',
    [id_tipo]
  );
  return rows[0].total;
};

// Buscar rifas
export const searchRifas = async (searchTerm) => {
  const [rows] = await pool.execute(
    `SELECT r.*, tr.nombre as tipo_nombre
     FROM rifa r
     LEFT JOIN tipo_rifa tr ON r.id_tipo = tr.id
     WHERE r.descripcion LIKE ? OR tr.nombre LIKE ?
     ORDER BY r.fecha_hora_juego DESC`,
    [`%${searchTerm}%`, `%${searchTerm}%`]
  );
  return rows;
};
