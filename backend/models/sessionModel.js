import pool from '../database/connection.js';

// ===================== CRUD SESIONES =====================

// Crear nueva sesión
export const createSession = async (sessionData) => {
  const { id_usuario, token_sesion, ip, user_agent, navegador, sistema_operativo } = sessionData;
  
  const [result] = await pool.execute(
    `INSERT INTO session (id_usuario, token_sesion, ip, user_agent, navegador, sistema_operativo, fecha_inicio, ultimo_acceso, estado, duracion_minutos, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), 'activa', 0, NOW())`,
    [id_usuario, token_sesion, ip, user_agent || null, navegador || null, sistema_operativo || null]
  );
  
  return result.insertId;
};

// Obtener sesión por ID
export const getSessionById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM session WHERE id = ?',
    [id]
  );
  return rows[0];
};

// Obtener sesión por token
export const getSessionByToken = async (token_sesion) => {
  const [rows] = await pool.execute(
    'SELECT * FROM session WHERE token_sesion = ? AND estado = "activa"',
    [token_sesion]
  );
  return rows[0];
};

// Obtener sesiones activas de un usuario
export const getSessionsByUsuario = async (id_usuario) => {
  const [rows] = await pool.execute(
    'SELECT * FROM session WHERE id_usuario = ? AND estado = "activa" ORDER BY ultimo_acceso DESC',
    [id_usuario]
  );
  return rows;
};

// Actualizar último acceso
export const updateLastAccess = async (id) => {
  const [result] = await pool.execute(
    `UPDATE session 
     SET ultimo_acceso = NOW(), 
         duracion_minutos = TIMESTAMPDIFF(MINUTE, fecha_inicio, NOW()) 
     WHERE id = ?`,
    [id]
  );
  
  return result.affectedRows > 0;
};

// Cerrar sesión
export const closeSession = async (id) => {
  const [result] = await pool.execute(
    `UPDATE session 
     SET estado = 'cerrada', 
         fecha_cierre = NOW(),
         duracion_minutos = TIMESTAMPDIFF(MINUTE, fecha_inicio, NOW())
     WHERE id = ?`,
    [id]
  );
  
  return result.affectedRows > 0;
};

// Cerrar sesión por token
export const closeSessionByToken = async (token_sesion) => {
  const [result] = await pool.execute(
    `UPDATE session 
     SET estado = 'cerrada', 
         fecha_cierre = NOW(),
         duracion_minutos = TIMESTAMPDIFF(MINUTE, fecha_inicio, NOW())
     WHERE token_sesion = ?`,
    [token_sesion]
  );
  
  return result.affectedRows > 0;
};

// Cerrar todas las sesiones de un usuario
export const closeAllUserSessions = async (id_usuario) => {
  const [result] = await pool.execute(
    `UPDATE session 
     SET estado = 'cerrada', 
         fecha_cierre = NOW(),
         duracion_minutos = TIMESTAMPDIFF(MINUTE, fecha_inicio, NOW())
     WHERE id_usuario = ? AND estado = 'activa'`,
    [id_usuario]
  );
  
  return result.affectedRows;
};

// Expirar sesiones inactivas (más de 120 minutos)
export const expireInactiveSessions = async () => {
  const [result] = await pool.execute(
    `UPDATE session 
     SET estado = 'expirada', 
         fecha_cierre = NOW(),
         duracion_minutos = TIMESTAMPDIFF(MINUTE, fecha_inicio, NOW())
     WHERE estado = 'activa' 
     AND TIMESTAMPDIFF(MINUTE, ultimo_acceso, NOW()) > 180`
  );
  
  return result.affectedRows;
};

// Obtener todas las sesiones activas
export const getAllActiveSessions = async () => {
  const [rows] = await pool.execute(
    `SELECT s.*, u.nombre, u.correo, u.rol, s.id_usuario as id_usuario
     FROM session s
     JOIN usuario u ON s.id_usuario = u.id
     WHERE s.estado = 'activa'
     ORDER BY s.ultimo_acceso DESC`
  );
  return rows;
};

// Contar sesiones activas
export const countActiveSessions = async () => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM session WHERE estado = "activa"'
  );
  return rows[0].total;
};

// Obtener historial de sesiones de un usuario
export const getSessionHistory = async (id_usuario, limit = 10) => {
  const [rows] = await pool.execute(
    'SELECT * FROM session WHERE id_usuario = ? ORDER BY fecha_inicio DESC LIMIT ?',
    [id_usuario, limit]
  );
  return rows;
};

// Validar si sesión está activa y no ha expirado
export const isSessionValid = async (token_sesion) => {
  const [rows] = await pool.execute(
    `SELECT * FROM session 
     WHERE token_sesion = ? 
     AND estado = 'activa'
     AND TIMESTAMPDIFF(MINUTE, ultimo_acceso, NOW()) <= 180`,
    [token_sesion]
  );
  return rows.length > 0;
};

// Limpiar sesiones antiguas (más de 30 días cerradas)
export const cleanOldSessions = async () => {
  const [result] = await pool.execute(
    `DELETE FROM session 
     WHERE estado IN ('cerrada', 'expirada') 
     AND fecha_cierre < DATE_SUB(NOW(), INTERVAL 30 DAY)`
  );
  
  return result.affectedRows;
};
