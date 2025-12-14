import pool from '../database/connection.js';
import bcrypt from 'bcryptjs';

// ===================== CRUD USUARIOS =====================

// Obtener todos los usuarios
export const getAllUsuarios = async () => {
  const [rows] = await pool.execute(
    `SELECT u.id, u.nombre, u.correo, u.direccion, u.rol, u.saldo, u.activo, 
            u.created_at, u.updated_at, u.foto_perfil, u.telefono, u.id_area,
            a.nombre as area_nombre
     FROM usuario u
     LEFT JOIN area a ON u.id_area = a.id`
  );
  return rows;
};

// Obtener usuario por ID
export const getUsuarioById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT u.id, u.nombre, u.correo, u.direccion, u.rol, u.saldo, u.activo, 
            u.created_at, u.updated_at, u.foto_perfil, u.telefono, u.id_area,
            a.nombre as area_nombre
     FROM usuario u
     LEFT JOIN area a ON u.id_area = a.id
     WHERE u.id = ?`,
    [id]
  );
  return rows[0];
};

// Obtener usuario por correo
export const getUsuarioByEmail = async (correo) => {
  const [rows] = await pool.execute(
    'SELECT * FROM usuario WHERE correo = ?',
    [correo]
  );
  return rows[0];
};

// Crear nuevo usuario
export const createUsuario = async (userData) => {
  const { nombre, correo, password, direccion, rol, telefono, foto_perfil, id_area } = userData;
  
  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const [result] = await pool.execute(
    `INSERT INTO usuario (nombre, correo, password, direccion, rol, telefono, foto_perfil, saldo, activo, id_area, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1, ?, NOW(), NOW())`,
    [nombre, correo, hashedPassword, direccion || null, rol || 'cliente', telefono || null, foto_perfil || null, id_area || null]
  );
  
  return result.insertId;
};

// Actualizar usuario
export const updateUsuario = async (id, userData) => {
  const { nombre, correo, direccion, telefono, foto_perfil, id_area } = userData;
  
  const [result] = await pool.execute(
    `UPDATE usuario SET nombre = ?, correo = ?, direccion = ?, telefono = ?, foto_perfil = ?, id_area = ?, updated_at = NOW() 
     WHERE id = ?`,
    [nombre, correo, direccion || null, telefono || null, foto_perfil || null, id_area || null, id]
  );
  
  return result.affectedRows > 0;
};

// Actualizar contraseña
export const updatePassword = async (id, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const [result] = await pool.execute(
    'UPDATE usuario SET password = ?, updated_at = NOW() WHERE id = ?',
    [hashedPassword, id]
  );
  
  return result.affectedRows > 0;
};

// Actualizar saldo
export const updateSaldo = async (id, nuevoSaldo) => {
  const [result] = await pool.execute(
    'UPDATE usuario SET saldo = ?, updated_at = NOW() WHERE id = ?',
    [nuevoSaldo, id]
  );
  
  return result.affectedRows > 0;
};

// Agregar saldo
export const addSaldo = async (id, monto) => {
  const [result] = await pool.execute(
    'UPDATE usuario SET saldo = saldo + ?, updated_at = NOW() WHERE id = ?',
    [monto, id]
  );
  
  return result.affectedRows > 0;
};

// Restar saldo
export const subtractSaldo = async (id, monto) => {
  // Primero verificar saldo disponible
  const [rows] = await pool.execute(
    'SELECT saldo FROM usuario WHERE id = ?',
    [id]
  );
  
  if (rows.length === 0) {
    return { success: false, message: 'Usuario no encontrado' };
  }
  
  const saldoActual = Number(rows[0].saldo) || 0;
  
  if (saldoActual < monto) {
    return { 
      success: false, 
      message: `Saldo insuficiente. Disponible: $${saldoActual.toFixed(2)}, Solicitado: $${monto.toFixed(2)}` 
    };
  }
  
  // Proceder con la resta si hay suficiente saldo
  const [result] = await pool.execute(
    'UPDATE usuario SET saldo = saldo - ?, updated_at = NOW() WHERE id = ?',
    [monto, id]
  );
  
  return { 
    success: result.affectedRows > 0,
    message: result.affectedRows > 0 ? 'Pago registrado correctamente' : 'Error al actualizar saldo'
  };
};

// Cambiar rol
export const updateRol = async (id, nuevoRol) => {
  const [result] = await pool.execute(
    'UPDATE usuario SET rol = ?, updated_at = NOW() WHERE id = ?',
    [nuevoRol, id]
  );
  
  return result.affectedRows > 0;
};

// Activar/Desactivar usuario
export const toggleUsuarioActivo = async (id, activo) => {
  const [result] = await pool.execute(
    'UPDATE usuario SET activo = ?, updated_at = NOW() WHERE id = ?',
    [activo ? 1 : 0, id]
  );
  
  return result.affectedRows > 0;
};

// Actualizar usuario completo (para administradores)
export const updateUsuarioCompleto = async (id, updates) => {
  const fields = [];
  const values = [];
  
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  });
  
  if (fields.length === 0) {
    throw new Error('No hay campos para actualizar');
  }
  
  fields.push('updated_at = NOW()');
  values.push(id);
  
  const query = `UPDATE usuario SET ${fields.join(', ')} WHERE id = ?`;
  const [result] = await pool.execute(query, values);
  
  return result.affectedRows > 0;
};

// Eliminar usuario (soft delete desactivando)
export const deleteUsuario = async (id) => {
  const [result] = await pool.execute(
    'UPDATE usuario SET activo = 0, updated_at = NOW() WHERE id = ?',
    [id]
  );
  
  return result.affectedRows > 0;
};

// Verificar contraseña
export const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Obtener usuarios por rol
export const getUsuariosByRol = async (rol) => {
  const [rows] = await pool.execute(
    'SELECT id, nombre, correo, direccion, rol, saldo, activo, created_at, updated_at, foto_perfil, telefono, id_area FROM usuario WHERE rol = ?',
    [rol]
  );
  return rows;
};

// Obtener usuarios activos
export const getUsuariosActivos = async () => {
  const [rows] = await pool.execute(
    'SELECT id, nombre, correo, direccion, rol, saldo, activo, created_at, updated_at, foto_perfil, telefono, id_area FROM usuario WHERE activo = 1'
  );
  return rows;
};

// Contar usuarios por rol
export const countUsuariosByRol = async (rol) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM usuario WHERE rol = ? AND activo = 1',
    [rol]
  );
  return rows[0].total;
};

// Buscar usuarios
export const searchUsuarios = async (searchTerm) => {
  const [rows] = await pool.execute(
    `SELECT id, nombre, correo, direccion, rol, saldo, activo, created_at, updated_at, foto_perfil, telefono, id_area 
     FROM usuario 
     WHERE nombre LIKE ? OR correo LIKE ? OR telefono LIKE ?`,
    [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
  );
  return rows;
}
