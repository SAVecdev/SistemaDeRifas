import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Obtener información actualizada del usuario
router.get('/usuario/:idUsuario', async (req, res) => {
  try {
    const { idUsuario } = req.params;
    
    const [usuarios] = await pool.execute(`
      SELECT id, nombre, correo, saldo, telefono, direccion
      FROM usuario
      WHERE id = ? AND activo = 1
    `, [idUsuario]);
    
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(usuarios[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener información del usuario' });
  }
});

// Obtener rifas activas para clientes
router.get('/rifas-activas', async (req, res) => {
  try {
    const [rifas] = await pool.execute(`
      SELECT 
        r.id,
        r.sorteos,
        r.descripcion,
        r.imagen,
        r.fecha_hora_juego,
        r.id_tipo,
        tr.nombre as tipo_nombre,
        COUNT(DISTINCT v.numero) as numeros_vendidos
      FROM rifa r
      LEFT JOIN tipo_rifa tr ON r.id_tipo = tr.id
      LEFT JOIN venta v ON r.id = v.id_rifas AND v.eliminada = 0
      WHERE r.fecha_hora_juego > NOW()
      GROUP BY r.id, r.sorteos, r.descripcion, r.imagen, r.fecha_hora_juego, r.id_tipo, tr.nombre
      ORDER BY r.fecha_hora_juego ASC
    `);
    
    res.json({ data: rifas });
  } catch (error) {
    console.error('Error al obtener rifas activas:', error);
    res.status(500).json({ error: 'Error al obtener rifas activas' });
  }
});

// Obtener números comprados por un cliente
router.get('/mis-numeros/:idCliente', async (req, res) => {
  try {
    const { idCliente } = req.params;
    
    const [numeros] = await pool.execute(`
      SELECT 
        v.id,
        v.numero,
        v.total,
        v.created_at as fecha,
        v.pagada,
        r.descripcion as rifa_descripcion,
        r.fecha_hora_juego
      FROM venta v
      INNER JOIN rifa r ON v.id_rifas = r.id
      WHERE v.id_usuario = ?
        AND v.eliminada = 0
      ORDER BY v.created_at DESC
      LIMIT 100
    `, [idCliente]);
    
    res.json(numeros);
  } catch (error) {
    console.error('Error al obtener números del cliente:', error);
    res.status(500).json({ error: 'Error al obtener números' });
  }
});

// Obtener historial de transacciones
router.get('/transacciones/:idCliente', async (req, res) => {
  try {
    const { idCliente } = req.params;
    const { tipo, fechaInicio, fechaFin } = req.query;
    
    let query = `
      SELECT 
        v.id,
        v.created_at as fecha,
        'compra' as tipo,
        v.total as monto,
        v.numero,
        r.descripcion as descripcion
      FROM venta v
      INNER JOIN rifa r ON v.id_rifas = r.id
      WHERE v.id_usuario = ? AND v.eliminada = 0
    `;
    
    const params = [idCliente];
    
    if (fechaInicio && fechaFin) {
      query += ` AND DATE(v.created_at) BETWEEN ? AND ?`;
      params.push(fechaInicio, fechaFin);
    }
    
    query += ` ORDER BY v.created_at DESC LIMIT 100`;
    
    const [transacciones] = await pool.execute(query, params);
    
    res.json(transacciones);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

// Obtener premios del cliente
router.get('/premios/:idCliente', async (req, res) => {
  try {
    const { idCliente } = req.params;
    
    const [premios] = await pool.execute(`
      SELECT 
        g.id_numero_ganador,
        g.numerol as numero,
        g.saldo_premio,
        g.nivel_premio,
        g.fecha,
        g.pagada,
        g.fecha_hora_pago,
        v.id_rifas,
        r.descripcion as rifa_descripcion,
        r.fecha_hora_juego
      FROM ganadores g
      INNER JOIN factura f ON g.id_factura = f.id
      INNER JOIN venta v ON v.id_factura = f.id AND v.id_usuario = g.id_usuario
      INNER JOIN rifa r ON v.id_rifas = r.id
      WHERE g.id_usuario = ?
      GROUP BY g.id_numero_ganador
      ORDER BY g.fecha DESC
      LIMIT 50
    `, [idCliente]);
    
    res.json(premios);
  } catch (error) {
    console.error('Error al obtener premios:', error);
    res.status(500).json({ error: 'Error al obtener premios' });
  }
});

// Obtener detalle de una rifa para compra
router.get('/rifa-detalle/:idRifa', async (req, res) => {
  try {
    const { idRifa } = req.params;
    
    const [rifa] = await pool.execute(`
      SELECT 
        r.*,
        tr.nombre as tipo_nombre
      FROM rifa r
      LEFT JOIN tipo_rifa tr ON r.id_tipo = tr.id
      WHERE r.id = ?
    `, [idRifa]);
    
    if (rifa.length === 0) {
      return res.status(404).json({ error: 'Rifa no encontrada' });
    }
    
    // Obtener números disponibles (aquí se puede implementar lógica más compleja)
    const [numerosVendidos] = await pool.execute(`
      SELECT numero
      FROM venta
      WHERE id_rifas = ? AND eliminada = 0
    `, [idRifa]);
    
    // Obtener premios disponibles
    const [premios] = await pool.execute(`
      SELECT *
      FROM opciones_premios
      WHERE id_tipo_rifa = ?
      ORDER BY nivel_premio ASC
    `, [rifa[0].id_tipo]);
    
    res.json({
      rifa: rifa[0],
      numerosVendidos: numerosVendidos.map(n => n.numero),
      premios
    });
  } catch (error) {
    console.error('Error al obtener detalle de rifa:', error);
    res.status(500).json({ error: 'Error al obtener detalle de rifa' });
  }
});

// Obtener estadísticas del cliente para el dashboard
router.get('/estadisticas/:idCliente', async (req, res) => {
  try {
    const { idCliente } = req.params;
    
    // Total de números comprados
    const [numerosComprados] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM venta
      WHERE id_usuario = ? AND eliminada = 0
    `, [idCliente]);
    
    // Total invertido
    const [totalInvertido] = await pool.execute(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM venta
      WHERE id_usuario = ? AND eliminada = 0
    `, [idCliente]);
    
    // Premios ganados (total y pagados)
    const [premiosGanados] = await pool.execute(`
      SELECT 
        COUNT(*) as total_premios,
        COALESCE(SUM(CAST(saldo_premio AS DECIMAL(10,2))), 0) as monto_total,
        COALESCE(SUM(CASE WHEN pagada = 1 THEN CAST(saldo_premio AS DECIMAL(10,2)) ELSE 0 END), 0) as monto_pagado,
        COALESCE(SUM(CASE WHEN pagada = 0 THEN CAST(saldo_premio AS DECIMAL(10,2)) ELSE 0 END), 0) as monto_pendiente
      FROM ganadores
      WHERE id_usuario = ?
    `, [idCliente]);
    
    // Rifas participadas
    const [rifasParticipadas] = await pool.execute(`
      SELECT COUNT(DISTINCT id_rifas) as total
      FROM venta
      WHERE id_usuario = ? AND eliminada = 0
    `, [idCliente]);
    
    res.json({
      numeros_comprados: numerosComprados[0].total,
      total_invertido: totalInvertido[0].total,
      premios: {
        total: premiosGanados[0].total_premios,
        monto_total: premiosGanados[0].monto_total,
        monto_pagado: premiosGanados[0].monto_pagado,
        monto_pendiente: premiosGanados[0].monto_pendiente
      },
      rifas_participadas: rifasParticipadas[0].total
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

export default router;
