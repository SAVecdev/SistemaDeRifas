import express from 'express';
import pool from '../database/connection.js';

const router = express.Router();

// Obtener premios pendientes del usuario con detalles de la venta
router.get('/usuario/:id_usuario/pendientes', async (req, res) => {
  try {
    const { id_usuario } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT 
        g.id_usuario,
        g.id_factura,
        g.saldo_premio,
        g.nivel_premio,
        g.pagada,
        g.fecha_hora_pago,
        f.factura as numero_factura,
        v.numero,
        v.cantidad,
        v.total,
        v.fecha as fecha_compra,
        r.descripcion as rifa_nombre,
        r.fecha_hora_juego,
        t.nombre as tipo_rifa
      FROM ganadores g
      INNER JOIN factura f ON g.id_factura = f.id
      INNER JOIN venta v ON v.id_factura = f.id AND v.id_usuario = g.id_usuario
      INNER JOIN rifa r ON v.id_rifas = r.id
      LEFT JOIN tipo_rifa t ON r.id_tipo = t.id
      WHERE g.id_usuario = ? AND g.pagada = 0
      ORDER BY g.nivel_premio ASC`,
      [id_usuario]
    );
    
    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error obteniendo premios pendientes:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Cobrar premio (agregar al saldo del usuario)
router.post('/cobrar', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id_usuario, id_factura, nivel_premio } = req.body;
    
    if (!id_usuario || !id_factura || !nivel_premio) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan datos requeridos: id_usuario, id_factura, nivel_premio'
      });
    }
    
    await connection.beginTransaction();
    
    // 1. Obtener información del premio
    const [premios] = await connection.execute(
      `SELECT saldo_premio, pagada 
       FROM ganadores 
       WHERE id_usuario = ? AND id_factura = ? AND nivel_premio = ?`,
      [id_usuario, id_factura, nivel_premio]
    );
    
    if (premios.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Premio no encontrado'
      });
    }
    
    if (premios[0].pagada === 1) {
      await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Este premio ya fue cobrado'
      });
    }
    
    const montoPremio = parseFloat(premios[0].saldo_premio) || 0;
    
    // 2. Obtener saldo actual del usuario
    const [usuarios] = await connection.execute(
      'SELECT saldo FROM usuario WHERE id = ?',
      [id_usuario]
    );
    
    if (usuarios.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }
    
    const saldoAnterior = parseFloat(usuarios[0].saldo) || 0;
    const saldoNuevo = saldoAnterior + montoPremio;
    
    // 3. Actualizar saldo del usuario
    await connection.execute(
      'UPDATE usuario SET saldo = ? WHERE id = ?',
      [saldoNuevo, id_usuario]
    );
    
    // 4. Marcar premio como pagado
    await connection.execute(
      'UPDATE ganadores SET pagada = 1, fecha_hora_pago = NOW() WHERE id_usuario = ? AND id_factura = ? AND nivel_premio = ?',
      [id_usuario, id_factura, nivel_premio]
    );
    
    // 5. Registrar transacción
    await connection.execute(
      `INSERT INTO transaccion (id_usuario, id_realizado_por, tipo, monto, saldo_anterior, saldo_nuevo, descripcion, fecha)
       VALUES (?, NULL, 'recarga', ?, ?, ?, ?, NOW())`,
      [
        id_usuario,
        montoPremio,
        saldoAnterior,
        saldoNuevo,
        `Premio cobrado - Nivel ${nivel_premio} - Factura ${id_factura}`
      ]
    );
    
    await connection.commit();
    
    res.json({
      status: 'success',
      message: 'Premio cobrado exitosamente',
      data: {
        monto_premio: montoPremio,
        saldo_anterior: saldoAnterior,
        saldo_nuevo: saldoNuevo
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error cobrando premio:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  } finally {
    connection.release();
  }
});

export default router;
