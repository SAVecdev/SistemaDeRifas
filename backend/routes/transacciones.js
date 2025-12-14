import express from 'express';
import pool from '../database/connection.js';

const router = express.Router();

// Obtener historial de transacciones del usuario
router.get('/usuario/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT 
        t.id,
        t.tipo,
        t.monto,
        t.saldo_anterior,
        t.saldo_nuevo,
        t.descripcion,
        t.fecha,
        u.nombre as realizado_por
      FROM transaccion t
      LEFT JOIN usuario u ON t.id_realizado_por = u.id
      WHERE t.id_usuario = ?
      ORDER BY t.fecha DESC`,
      [id_usuario]
    );
    
    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error obteniendo transacciones:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Obtener historial de transacciones (todas)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        t.id,
        t.id_usuario,
        t.tipo,
        t.monto,
        t.saldo_anterior,
        t.saldo_nuevo,
        t.descripcion,
        t.fecha,
        u.nombre as usuario_nombre,
        ur.nombre as realizado_por
      FROM transaccion t
      LEFT JOIN usuario u ON t.id_usuario = u.id
      LEFT JOIN usuario ur ON t.id_realizado_por = ur.id
      ORDER BY t.fecha DESC
      LIMIT 100`
    );
    
    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error obteniendo transacciones:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

export default router;
