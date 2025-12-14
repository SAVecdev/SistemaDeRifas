import pool from '../database/connection.js';

// ===================== CRUD PREMIOS TEXTO =====================

// Crear nuevo premio en texto
export const createPremioTexto = async (premioData) => {
  const { id_tipo_rifa, nivel_premio, descripcion_premio, saldo_ganado, id_area, digitos } = premioData;
  
  console.log('💾 Model createPremioTexto - Datos recibidos:', premioData);
  
  const [result] = await pool.execute(
    'INSERT INTO premios_texto (id_tipo_rifa, nivel_premio, descripcion_premio, saldo_ganado, id_area, digitos) VALUES (?, ?, ?, ?, ?, ?)',
    [id_tipo_rifa, nivel_premio, descripcion_premio, saldo_ganado, id_area || null, digitos || null]
  );
  
  console.log('✅ Model createPremioTexto - Insertado con ID:', result.insertId);
  return result.insertId;
};

// Obtener todos los premios en texto
export const getAllPremiosTexto = async () => {
  const [rows] = await pool.execute(
    `SELECT pt.*, tr.nombre as tipo_rifa_nombre, a.nombre as area_nombre
     FROM premios_texto pt
     JOIN tipo_rifa tr ON pt.id_tipo_rifa = tr.id
     LEFT JOIN area a ON pt.id_area = a.id
     ORDER BY pt.id_tipo_rifa, pt.nivel_premio`
  );
  return rows;
};

// Obtener premios en texto por tipo de rifa
export const getPremiosTextoByTipo = async (id_tipo_rifa) => {
  const [rows] = await pool.execute(
    'SELECT * FROM premios_texto WHERE id_tipo_rifa = ? ORDER BY nivel_premio',
    [id_tipo_rifa]
  );
  return rows;
};

// Obtener premio en texto específico
export const getPremioTextoByNivel = async (id_tipo_rifa, nivel_premio) => {
  const [rows] = await pool.execute(
    'SELECT * FROM premios_texto WHERE id_tipo_rifa = ? AND nivel_premio = ?',
    [id_tipo_rifa, nivel_premio]
  );
  return rows[0];
};

// Actualizar premio en texto
export const updatePremioTexto = async (id_tipo_rifa, nivel_premio, premioData) => {
  const { descripcion_premio, saldo_ganado, id_area, digitos } = premioData;
  
  console.log('💾 Model updatePremioTexto - Tipo:', id_tipo_rifa, 'Nivel:', nivel_premio);
  console.log('💾 Model updatePremioTexto - Datos:', premioData);
  
  const [result] = await pool.execute(
    'UPDATE premios_texto SET descripcion_premio = ?, saldo_ganado = ?, id_area = ?, digitos = ? WHERE id_tipo_rifa = ? AND nivel_premio = ?',
    [descripcion_premio, saldo_ganado, id_area || null, digitos || null, id_tipo_rifa, nivel_premio]
  );
  
  console.log('✅ Model updatePremioTexto - Actualizado:', result.affectedRows, 'registros');
  return result.affectedRows > 0;
};

// Eliminar premio en texto
export const deletePremioTexto = async (id_tipo_rifa, nivel_premio) => {
  const [result] = await pool.execute(
    'DELETE FROM premios_texto WHERE id_tipo_rifa = ? AND nivel_premio = ?',
    [id_tipo_rifa, nivel_premio]
  );
  return result.affectedRows > 0;
};

// Eliminar todos los premios en texto de un tipo de rifa
export const deletePremiosTextoByTipo = async (id_tipo_rifa) => {
  const [result] = await pool.execute(
    'DELETE FROM premios_texto WHERE id_tipo_rifa = ?',
    [id_tipo_rifa]
  );
  return result.affectedRows;
};

// Vista consolidada de premios en texto (similar a opciones_premios)
export const getVistaConsolidadaPremiosTexto = async () => {
  const [rows] = await pool.execute(`
    SELECT 
      pt.id_tipo_rifa,
      tr.nombre as tipo_rifa_nombre,
      pt.saldo_ganado as saldo,
      pt.digitos,
      pt.id_area,
      a.nombre as area_nombre,
      MAX(CASE WHEN pt.nivel_premio = 1 THEN pt.descripcion_premio END) as premio_01,
      MAX(CASE WHEN pt.nivel_premio = 2 THEN pt.descripcion_premio END) as premio_02,
      MAX(CASE WHEN pt.nivel_premio = 3 THEN pt.descripcion_premio END) as premio_03,
      MAX(CASE WHEN pt.nivel_premio = 4 THEN pt.descripcion_premio END) as premio_04,
      MAX(CASE WHEN pt.nivel_premio = 5 THEN pt.descripcion_premio END) as premio_05,
      MAX(CASE WHEN pt.nivel_premio = 6 THEN pt.descripcion_premio END) as premio_06,
      MAX(CASE WHEN pt.nivel_premio = 7 THEN pt.descripcion_premio END) as premio_07,
      MAX(CASE WHEN pt.nivel_premio = 8 THEN pt.descripcion_premio END) as premio_08,
      MAX(CASE WHEN pt.nivel_premio = 9 THEN pt.descripcion_premio END) as premio_09,
      MAX(CASE WHEN pt.nivel_premio = 10 THEN pt.descripcion_premio END) as premio_10
    FROM premios_texto pt
    JOIN tipo_rifa tr ON pt.id_tipo_rifa = tr.id
    LEFT JOIN area a ON pt.id_area = a.id
    GROUP BY pt.id_tipo_rifa, pt.saldo_ganado, pt.digitos, pt.id_area, tr.nombre, a.nombre
    ORDER BY pt.id_tipo_rifa, pt.saldo_ganado
  `);
  return rows;
};

export default {
  createPremioTexto,
  getAllPremiosTexto,
  getPremiosTextoByTipo,
  getPremioTextoByNivel,
  updatePremioTexto,
  deletePremioTexto,
  deletePremiosTextoByTipo,
  getVistaConsolidadaPremiosTexto
};
