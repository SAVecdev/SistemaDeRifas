import express from 'express';
import pool from '../database/connection.js';

const router = express.Router();

// ==================== SUPERVISIÓN ====================

// Obtener todas las supervisiones
router.get('/supervisiones', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        s.id,
        s.id_supervisor,
        s.id_supervisado,
        s.created_at,
        supervisor.nombre as supervisor_nombre,
        supervisor.correo as supervisor_correo,
        supervisor.rol as supervisor_rol,
        supervisado.nombre as supervisado_nombre,
        supervisado.correo as supervisado_correo,
        supervisado.rol as supervisado_rol
      FROM supervision s
      INNER JOIN usuario supervisor ON s.id_supervisor = supervisor.id
      INNER JOIN usuario supervisado ON s.id_supervisado = supervisado.id
      ORDER BY s.created_at DESC
    `);
    res.json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error obteniendo supervisiones:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener supervisiones de un supervisor específico
router.get('/supervisiones/supervisor/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        s.id,
        s.id_supervisado,
        s.created_at,
        u.nombre as supervisado_nombre,
        u.correo as supervisado_correo,
        u.rol as supervisado_rol
      FROM supervision s
      INNER JOIN usuario u ON s.id_supervisado = u.id
      WHERE s.id_supervisor = ?
      ORDER BY s.created_at DESC
    `, [req.params.id]);
    res.json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error obteniendo supervisados:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Crear supervisión
router.post('/supervisiones', async (req, res) => {
  const { id_supervisor, id_supervisado } = req.body;

  if (!id_supervisor || !id_supervisado) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'id_supervisor e id_supervisado son requeridos' 
    });
  }

  if (id_supervisor === id_supervisado) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Un usuario no puede supervisarse a sí mismo' 
    });
  }

  try {
    // Verificar que el supervisor tenga rol adecuado
    const [supervisor] = await pool.execute(
      'SELECT rol FROM usuario WHERE id = ?',
      [id_supervisor]
    );

    if (!supervisor.length || !['administrador', 'supervisor'].includes(supervisor[0].rol)) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'El supervisor debe tener rol de administrador o supervisor' 
      });
    }

    // Verificar que no exista ya la supervisión
    const [existe] = await pool.execute(
      'SELECT id FROM supervision WHERE id_supervisor = ? AND id_supervisado = ?',
      [id_supervisor, id_supervisado]
    );

    if (existe.length > 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Esta supervisión ya existe' 
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO supervision (id_supervisor, id_supervisado, created_at) VALUES (?, ?, NOW())',
      [id_supervisor, id_supervisado]
    );

    res.status(201).json({ 
      status: 'success', 
      message: 'Supervisión creada correctamente',
      data: { id: result.insertId } 
    });
  } catch (error) {
    console.error('Error creando supervisión:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar supervisión
router.delete('/supervisiones/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM supervision WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Supervisión no encontrada' 
      });
    }

    res.json({ status: 'success', message: 'Supervisión eliminada' });
  } catch (error) {
    console.error('Error eliminando supervisión:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ==================== PERMISOS ====================

// Obtener todos los permisos
router.get('/permisos', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.id,
        p.id_usuario,
        p.modulo,
        p.accion,
        p.created_at,
        u.nombre as usuario_nombre,
        u.correo as usuario_correo,
        u.rol as usuario_rol
      FROM permisos p
      INNER JOIN usuario u ON p.id_usuario = u.id
      ORDER BY p.created_at DESC
    `);
    res.json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error obteniendo permisos:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener permisos de un usuario
router.get('/permisos/usuario/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, modulo, accion, created_at
      FROM permisos
      WHERE id_usuario = ?
      ORDER BY modulo, accion
    `, [req.params.id]);
    res.json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error obteniendo permisos del usuario:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Verificar si un usuario tiene un permiso específico
router.get('/permisos/verificar/:id_usuario/:modulo/:accion', async (req, res) => {
  try {
    const { id_usuario, modulo, accion } = req.params;
    const [rows] = await pool.execute(
      'SELECT id FROM permisos WHERE id_usuario = ? AND modulo = ? AND accion = ?',
      [id_usuario, modulo, accion]
    );
    res.json({ status: 'success', data: { tiene_permiso: rows.length > 0 } });
  } catch (error) {
    console.error('Error verificando permiso:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Crear permiso
router.post('/permisos', async (req, res) => {
  const { id_usuario, modulo, accion } = req.body;

  if (!id_usuario || !modulo || !accion) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'id_usuario, modulo y accion son requeridos' 
    });
  }

  try {
    // Verificar que no exista ya el permiso
    const [existe] = await pool.execute(
      'SELECT id FROM permisos WHERE id_usuario = ? AND modulo = ? AND accion = ?',
      [id_usuario, modulo, accion]
    );

    if (existe.length > 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Este permiso ya existe para el usuario' 
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO permisos (id_usuario, modulo, accion, created_at) VALUES (?, ?, ?, NOW())',
      [id_usuario, modulo, accion]
    );

    res.status(201).json({ 
      status: 'success', 
      message: 'Permiso otorgado correctamente',
      data: { id: result.insertId } 
    });
  } catch (error) {
    console.error('Error creando permiso:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar permiso
router.delete('/permisos/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM permisos WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Permiso no encontrado' 
      });
    }

    res.json({ status: 'success', message: 'Permiso revocado' });
  } catch (error) {
    console.error('Error eliminando permiso:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
