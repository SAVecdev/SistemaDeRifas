import pool from '../database/connection.js';

// ===================== CRUD AREAS =====================

// Crear nueva área
export const createArea = async (areaData) => {
  const { 
    nombre, 
    saldo_02, 
    saldo_03, 
    saldo_04, 
    saldo_05, 
    saldo_06 
  } = areaData;
  
  console.log('💾 Model createArea - Datos recibidos:', areaData);
  
  const values = [
    nombre, 
    saldo_02 || 0, 
    saldo_03 || 0, 
    saldo_04 || 0, 
    saldo_05 || 0, 
    saldo_06 || 0
  ];

  console.log('💾 Model createArea - Valores a insertar:', values);
  
  const [result] = await pool.execute(
    'INSERT INTO area (nombre, saldo_02, saldo_03, saldo_04, saldo_05, saldo_06) VALUES (?, ?, ?, ?, ?, ?)',
    values
  );
  
  console.log('✅ Model createArea - Área insertada con ID:', result.insertId);
  return result.insertId;
};

// Obtener todas las áreas
export const getAllAreas = async () => {
  const [rows] = await pool.execute('SELECT * FROM area');
  console.log('📥 Model getAllAreas - Áreas obtenidas:', rows.length);
  if (rows.length > 0) {
    console.log('📥 Ejemplo primera área:', rows[0]);
  }
  return rows;
};

// Obtener área por ID
export const getAreaById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM area WHERE id = ?',
    [id]
  );
  return rows[0];
};

// Actualizar área
export const updateArea = async (id, areaData) => {
  const { nombre, saldo_02, saldo_03, saldo_04, saldo_05, saldo_06 } = areaData;
  
  console.log('💾 Model updateArea - ID:', id);
  console.log('💾 Model updateArea - Datos recibidos:', areaData);
  
  // Construir la query dinámicamente según los campos que vengan
  let query = 'UPDATE area SET ';
  const values = [];
  const updates = [];

  if (nombre !== undefined) {
    updates.push('nombre = ?');
    values.push(nombre);
  }
  if (saldo_02 !== undefined) {
    updates.push('saldo_02 = ?');
    values.push(saldo_02);
    console.log('💾 Saldo_02 a actualizar:', saldo_02, 'tipo:', typeof saldo_02);
  }
  if (saldo_03 !== undefined) {
    updates.push('saldo_03 = ?');
    values.push(saldo_03);
    console.log('💾 Saldo_03 a actualizar:', saldo_03, 'tipo:', typeof saldo_03);
  }
  if (saldo_04 !== undefined) {
    updates.push('saldo_04 = ?');
    values.push(saldo_04);
    console.log('💾 Saldo_04 a actualizar:', saldo_04, 'tipo:', typeof saldo_04);
  }
  if (saldo_05 !== undefined) {
    updates.push('saldo_05 = ?');
    values.push(saldo_05);
    console.log('💾 Saldo_05 a actualizar:', saldo_05, 'tipo:', typeof saldo_05);
  }
  if (saldo_06 !== undefined) {
    updates.push('saldo_06 = ?');
    values.push(saldo_06);
    console.log('💾 Saldo_06 a actualizar:', saldo_06, 'tipo:', typeof saldo_06);
  }

  if (updates.length === 0) {
    return false;
  }

  query += updates.join(', ') + ' WHERE id = ?';
  values.push(id);
  
  console.log('💾 Query SQL:', query);
  console.log('💾 Valores:', values);
  
  const [result] = await pool.execute(query, values);
  
  console.log('✅ Model updateArea - Resultado:', { affectedRows: result.affectedRows });
  
  return result.affectedRows > 0;
};

// Actualizar saldo específico de área
export const updateSaldoArea = async (id, nivelSaldo, monto) => {
  const campo = `saldo_${String(nivelSaldo).padStart(2, '0')}`;
  
  const [result] = await pool.execute(
    `UPDATE area SET ${campo} = ? WHERE id = ?`,
    [monto, id]
  );
  
  return result.affectedRows > 0;
};

// Agregar saldo a área
export const addSaldoArea = async (id, nivelSaldo, monto) => {
  const campo = `saldo_${String(nivelSaldo).padStart(2, '0')}`;
  
  const [result] = await pool.execute(
    `UPDATE area SET ${campo} = ${campo} + ? WHERE id = ?`,
    [monto, id]
  );
  
  return result.affectedRows > 0;
};

// Restar saldo de área
export const subtractSaldoArea = async (id, nivelSaldo, monto) => {
  const campo = `saldo_${String(nivelSaldo).padStart(2, '0')}`;
  
  const [result] = await pool.execute(
    `UPDATE area SET ${campo} = ${campo} - ? WHERE id = ? AND ${campo} >= ?`,
    [monto, id, monto]
  );
  
  return result.affectedRows > 0;
};

// Eliminar área
export const deleteArea = async (id) => {
  // Verificar si tiene ganadores asociados
  const [ganadores] = await pool.execute(
    'SELECT COUNT(*) as total FROM ganadores WHERE id_area = ?',
    [id]
  );
  
  if (ganadores[0].total > 0) {
    throw new Error('No se puede eliminar un área con ganadores asociados');
  }
  
  const [result] = await pool.execute(
    'DELETE FROM area WHERE id = ?',
    [id]
  );
  
  return result.affectedRows > 0;
};

// Obtener total de saldos de un área
export const getTotalSaldosArea = async (id) => {
  const [rows] = await pool.execute(
    'SELECT (saldo_02 + saldo_03 + saldo_04 + saldo_05 + saldo_06) as total_saldo FROM area WHERE id = ?',
    [id]
  );
  return rows[0].total_saldo;
};

// Resetear saldos de un área
export const resetSaldosArea = async (id) => {
  const [result] = await pool.execute(
    'UPDATE area SET saldo_02 = 0, saldo_03 = 0, saldo_04 = 0, saldo_05 = 0, saldo_06 = 0 WHERE id = ?',
    [id]
  );
  
  return result.affectedRows > 0;
};
