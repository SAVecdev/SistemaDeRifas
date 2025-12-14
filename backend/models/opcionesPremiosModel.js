import pool from '../database/connection.js';

// ===================== CRUD OPCIONES PREMIOS =====================

// Crear nueva opción de premio
export const createOpcionPremio = async (premioData) => {
  const { id_tipo_rifa, valor_premio, nivel_premio, saldo_ganado, id_area, digitos } = premioData;
  
  console.log('💾 Model createOpcionPremio - Datos recibidos:', premioData);
  
  const [result] = await pool.execute(
    'INSERT INTO opciones_premios (id_tipo_rifa, valor_premio, nivel_premio, saldo_ganado, id_area, digitos) VALUES (?, ?, ?, ?, ?, ?)',
    [id_tipo_rifa, valor_premio, nivel_premio, saldo_ganado, id_area || null, digitos || null]
  );
  
  console.log('✅ Model createOpcionPremio - Insertado con ID:', result.insertId);
  return result.insertId;
};

// Obtener todas las opciones de premios
export const getAllOpcionesPremios = async () => {
  const [rows] = await pool.execute(
    `SELECT op.*, tr.nombre as tipo_rifa_nombre, a.nombre as area_nombre
     FROM opciones_premios op
     JOIN tipo_rifa tr ON op.id_tipo_rifa = tr.id
     LEFT JOIN area a ON op.id_area = a.id
     ORDER BY op.id_tipo_rifa, op.nivel_premio`
  );
  return rows;
};

// Obtener opciones de premios por tipo de rifa
export const getOpcionesPremiosByTipo = async (id_tipo_rifa) => {
  const [rows] = await pool.execute(
    'SELECT * FROM opciones_premios WHERE id_tipo_rifa = ? ORDER BY nivel_premio',
    [id_tipo_rifa]
  );
  return rows;
};

// Obtener opción de premio específica
export const getOpcionPremioByNivel = async (id_tipo_rifa, nivel_premio) => {
  const [rows] = await pool.execute(
    'SELECT * FROM opciones_premios WHERE id_tipo_rifa = ? AND nivel_premio = ?',
    [id_tipo_rifa, nivel_premio]
  );
  return rows[0];
};

// Actualizar opción de premio
export const updateOpcionPremio = async (id_tipo_rifa, nivel_premio, premioData) => {
  const { valor_premio, saldo_ganado, id_area, digitos } = premioData;
  
  console.log('💾 Model updateOpcionPremio - Tipo:', id_tipo_rifa, 'Nivel:', nivel_premio);
  console.log('💾 Model updateOpcionPremio - Datos:', premioData);
  
  const [result] = await pool.execute(
    'UPDATE opciones_premios SET valor_premio = ?, saldo_ganado = ?, id_area = ?, digitos = ? WHERE id_tipo_rifa = ? AND nivel_premio = ?',
    [valor_premio, saldo_ganado, id_area || null, digitos || null, id_tipo_rifa, nivel_premio]
  );
  
  console.log('✅ Model updateOpcionPremio - Resultado:', { affectedRows: result.affectedRows });
  return result.affectedRows > 0;
};

// Eliminar opción de premio
export const deleteOpcionPremio = async (id_tipo_rifa, nivel_premio) => {
  const [result] = await pool.execute(
    'DELETE FROM opciones_premios WHERE id_tipo_rifa = ? AND nivel_premio = ?',
    [id_tipo_rifa, nivel_premio]
  );
  
  return result.affectedRows > 0;
};

// Eliminar todas las opciones de un tipo de rifa
export const deleteAllOpcionesByTipo = async (id_tipo_rifa) => {
  const [result] = await pool.execute(
    'DELETE FROM opciones_premios WHERE id_tipo_rifa = ?',
    [id_tipo_rifa]
  );
  
  return result.affectedRows;
};

// Eliminar opciones de premios por combinación específica (tipo + saldo + digitos + area)
export const deleteOpcionesByCombo = async (id_tipo_rifa, saldo_ganado, digitos, id_area) => {
  const [result] = await pool.execute(
    'DELETE FROM opciones_premios WHERE id_tipo_rifa = ? AND saldo_ganado = ? AND digitos = ? AND id_area = ?',
    [id_tipo_rifa, saldo_ganado, digitos, id_area]
  );
  
  return result.affectedRows;
};

// Contar opciones de premios por tipo
export const countOpcionesByTipo = async (id_tipo_rifa) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM opciones_premios WHERE id_tipo_rifa = ?',
    [id_tipo_rifa]
  );
  return rows[0].total;
};

/**
 * Obtener vista consolidada de premios por tipo de rifa
 * Agrupa los premios por tipo, saldo, dígitos y área
 * Cada fila representa una combinación única de estos campos con sus 10 niveles de premio
 * Formato: tipo | saldo | digitos | premio1-10 | area
 * 
 * IMPORTANTE:
 * - Una fila por cada combinación única de: id_tipo_rifa + saldo_ganado + digitos + id_area
 * - saldo = Valor de la apuesta (lo que el usuario paga)
 * - premio_01 a premio_10 = Premios que se ganan si acierta ese nivel
 */
export const getVistaPremiosConsolidada = async () => {
  const [rows] = await pool.execute(
    `SELECT 
      op.id_tipo_rifa,
      tr.nombre as tipo,
      op.saldo_ganado as saldo,
      op.digitos,
      op.id_area,
      a.nombre as area,
      MAX(CASE WHEN op.nivel_premio = 1 THEN op.valor_premio END) as premio_01,
      MAX(CASE WHEN op.nivel_premio = 2 THEN op.valor_premio END) as premio_02,
      MAX(CASE WHEN op.nivel_premio = 3 THEN op.valor_premio END) as premio_03,
      MAX(CASE WHEN op.nivel_premio = 4 THEN op.valor_premio END) as premio_04,
      MAX(CASE WHEN op.nivel_premio = 5 THEN op.valor_premio END) as premio_05,
      MAX(CASE WHEN op.nivel_premio = 6 THEN op.valor_premio END) as premio_06,
      MAX(CASE WHEN op.nivel_premio = 7 THEN op.valor_premio END) as premio_07,
      MAX(CASE WHEN op.nivel_premio = 8 THEN op.valor_premio END) as premio_08,
      MAX(CASE WHEN op.nivel_premio = 9 THEN op.valor_premio END) as premio_09,
      MAX(CASE WHEN op.nivel_premio = 10 THEN op.valor_premio END) as premio_10
     FROM opciones_premios op
     JOIN tipo_rifa tr ON op.id_tipo_rifa = tr.id
     LEFT JOIN area a ON op.id_area = a.id
     GROUP BY op.id_tipo_rifa, op.saldo_ganado, op.digitos, op.id_area, tr.nombre, a.nombre
     ORDER BY tr.nombre, op.digitos, op.saldo_ganado, a.nombre`
  );
  
  console.log('📥 Vista consolidada - Filas obtenidas:', rows.length);
  if (rows.length > 0) {
    console.log('📥 Ejemplo primera fila:', rows[0]);
  }
  
  return rows;
};

// ===================== FUNCIONES AUXILIARES PARA EXCEL =====================

/**
 * Obtener todos los tipos de rifa disponibles
 * Usado para mostrar en la plantilla Excel
 */
export const getAllTiposRifa = async () => {
  const [rows] = await pool.execute(
    'SELECT id, nombre FROM tipo_rifa ORDER BY nombre'
  );
  return rows;
};

/**
 * Obtener todas las áreas disponibles
 * Usado para mostrar en la plantilla Excel
 */
export const getAllAreas = async () => {
  const [rows] = await pool.execute(
    'SELECT id, nombre FROM area ORDER BY nombre'
  );
  return rows;
};

