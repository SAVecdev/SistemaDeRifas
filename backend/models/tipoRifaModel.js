import pool from '../database/connection.js';

// ===================== CRUD TIPO RIFA =====================

// Crear nuevo tipo de rifa
export const createTipoRifa = async (tipoData) => {
  const { nombre } = tipoData;
  console.log('💾 Model createTipoRifa - Datos recibidos:', tipoData);
  const [result] = await pool.execute(
    'INSERT INTO tipo_rifa (nombre) VALUES (?)',
    [nombre]
  );
  console.log('✅ Model createTipoRifa - Tipo insertado con ID:', result.insertId);
  return result.insertId;
};

// Obtener todos los tipos de rifa
export const getAllTiposRifa = async () => {
  const [rows] = await pool.execute('SELECT * FROM tipo_rifa');
  console.log('📥 Model getAllTiposRifa - Tipos obtenidos:', rows.length);
  if (rows.length > 0) {
    console.log('📥 Ejemplo primer tipo:', rows[0]);
  }
  return rows;
};

// Obtener tipo de rifa por ID
export const getTipoRifaById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM tipo_rifa WHERE id = ?',
    [id]
  );
  return rows[0];
};

// Actualizar tipo de rifa
export const updateTipoRifa = async (id, tipoData) => {
  const { nombre } = tipoData;
  console.log('💾 Model updateTipoRifa - ID:', id);
  console.log('💾 Model updateTipoRifa - Datos recibidos:', tipoData);
  const [result] = await pool.execute(
    'UPDATE tipo_rifa SET nombre = ? WHERE id = ?',
    [nombre, id]
  );
  console.log('✅ Model updateTipoRifa - Resultado:', { affectedRows: result.affectedRows });
  return result.affectedRows > 0;
};

// Eliminar tipo de rifa
export const deleteTipoRifa = async (id) => {
  console.log('💾 Model deleteTipoRifa - ID:', id);
  // Verificar si hay rifas con este tipo
  const [rifas] = await pool.execute(
    'SELECT COUNT(*) as total FROM rifa WHERE id_tipo = ?',
    [id]
  );
  
  console.log('💾 Rifas asociadas:', rifas[0].total);
  
  if (rifas[0].total > 0) {
    throw new Error('No se puede eliminar un tipo de rifa que está siendo usado');
  }
  
  const [result] = await pool.execute(
    'DELETE FROM tipo_rifa WHERE id = ?',
    [id]
  );
  
  console.log('✅ Model deleteTipoRifa - Resultado:', { affectedRows: result.affectedRows });
  return result.affectedRows > 0;
};

// Obtener tipo de rifa con opciones de premios
export const getTipoRifaWithPremios = async (id) => {
  const [rows] = await pool.execute(
    `SELECT tr.*, op.valor_premio, op.nivel_premio, op.saldo_ganado
     FROM tipo_rifa tr
     LEFT JOIN opciones_premios op ON tr.id = op.id_tipo_rifa
     WHERE tr.id = ?
     ORDER BY op.nivel_premio`,
    [id]
  );
  
  if (rows.length === 0) return null;
  
  // Agrupar premios
  const tipoRifa = {
    id: rows[0].id,
    nombre: rows[0].nombre,
    premios: rows.filter(r => r.nivel_premio).map(r => ({
      nivel_premio: r.nivel_premio,
      valor_premio: r.valor_premio,
      saldo_ganado: r.saldo_ganado
    }))
  };
  
  return tipoRifa;
};
