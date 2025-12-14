import pool from '../database/connection.js';

// ===================== CRUD NUMERO GANADORES =====================

// Crear registro de número ganador
export const createNumeroGanador = async (ganadorData) => {
  const { id_rifa, nivel_premio, numero_ganador, sorteo = 1 } = ganadorData;

  const [result] = await pool.execute(
    'INSERT INTO numero_ganadores (id_rifa, sorteo, nivel_premio, numero_ganador) VALUES (?, ?, ?, ?)',
    [id_rifa, sorteo, nivel_premio, numero_ganador]
  );

  return result.insertId;
};

// Obtener números ganadores de una rifa
export const getNumeroGanadoresByRifa = async (id_rifa, sorteo = 1) => {
  const [rows] = await pool.execute(
    'SELECT * FROM numero_ganadores WHERE id_rifa = ? AND sorteo = ? ORDER BY nivel_premio',
    [id_rifa, sorteo]
  );
  return rows;
};

// Obtener número ganador específico
export const getNumeroGanadorByNivel = async (id_rifa, nivel_premio, sorteo = 1) => {
  const [rows] = await pool.execute(
    'SELECT * FROM numero_ganadores WHERE id_rifa = ? AND sorteo = ? AND nivel_premio = ?',
    [id_rifa, sorteo, nivel_premio]
  );
  return rows[0];
};

// Verificar si hay ganadores registrados para una rifa
export const hasGanadores = async (id_rifa, sorteo = 1) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM numero_ganadores WHERE id_rifa = ? AND sorteo = ?',
    [id_rifa, sorteo]
  );
  return rows[0].total > 0;
};

// Actualizar número ganador
// NOTA: El trigger tr_revalidar_ganadores_venta se encarga automáticamente de:
//   1. Eliminar ganadores antiguos
//   2. Insertar nuevos ganadores basados en el número actualizado
export const updateNumeroGanador = async (id_rifa, nivel_premio, numero_ganador, sorteo = 1) => {
  const [result] = await pool.execute(
    'UPDATE numero_ganadores SET numero_ganador = ? WHERE id_rifa = ? AND sorteo = ? AND nivel_premio = ?',
    [numero_ganador, id_rifa, sorteo, nivel_premio]
  );

  return result.affectedRows > 0;
};

// Eliminar número ganador
export const deleteNumeroGanador = async (id_rifa, nivel_premio, sorteo = 1) => {
  const [result] = await pool.execute(
    'DELETE FROM numero_ganadores WHERE id_rifa = ? AND sorteo = ? AND nivel_premio = ?',
    [id_rifa, sorteo, nivel_premio]
  );

  return result.affectedRows > 0;
};

// Eliminar todos los ganadores de una rifa
export const deleteAllGanadoresByRifa = async (id_rifa, sorteo = null) => {
  if (sorteo === null) {
    const [result] = await pool.execute(
      'DELETE FROM numero_ganadores WHERE id_rifa = ?',
      [id_rifa]
    );
    return result.affectedRows;
  }
  const [result] = await pool.execute(
    'DELETE FROM numero_ganadores WHERE id_rifa = ? AND sorteo = ?',
    [id_rifa, sorteo]
  );
  return result.affectedRows;
};

// Obtener ganadores con información de ventas
export const getGanadoresConVentas = async (id_rifa, sorteo = 1) => {
  const [rows] = await pool.execute(
    `SELECT ng.*, v.id_usuario, v.id_factura, u.nombre as ganador_nombre, u.correo as ganador_correo
     FROM numero_ganadores ng
     LEFT JOIN venta v ON ng.id_rifa = v.id_rifas AND ng.numero_ganador = v.numero AND v.eliminada = 0
     LEFT JOIN usuario u ON v.id_usuario = u.id
     WHERE ng.id_rifa = ? AND ng.sorteo = ?
     ORDER BY ng.nivel_premio`,
    [id_rifa, sorteo]
  );
  return rows;
};

// Registrar múltiples ganadores de una vez
// Crear múltiples números ganadores
// NOTA: El trigger tr_asignar_ganadores_venta se encarga automáticamente de:
//   - Buscar todas las ventas que coincidan con cada número ganador
//   - Insertar registros en la tabla ganadores con el premio correcto
export const createMultiplesGanadores = async (id_rifa, ganadores, sorteo = 1) => {
  const values = ganadores.map(g => [id_rifa, sorteo, g.nivel_premio, g.numero_ganador]);
  
  const [result] = await pool.query(
    'INSERT INTO numero_ganadores (id_rifa, sorteo, nivel_premio, numero_ganador) VALUES ?',
    [values]
  );
  
  return result.affectedRows;
};

// Verificar si un número es ganador
export const isNumeroGanador = async (id_rifa, numero, sorteo = 1) => {
  const [rows] = await pool.execute(
    'SELECT * FROM numero_ganadores WHERE id_rifa = ? AND sorteo = ? AND numero_ganador = ?',
    [id_rifa, sorteo, numero]
  );
  return rows[0];
};
