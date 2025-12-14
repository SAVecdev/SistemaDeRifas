import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Obtener vendedores supervisados por un supervisor
router.get('/vendedores/:idSupervisor', async (req, res) => {
  const { idSupervisor } = req.params;

  try {
    // Obtener IDs de vendedores supervisados
    const [supervisados] = await pool.execute(
      'SELECT id_supervisado FROM supervision WHERE id_supervisor = ?',
      [idSupervisor]
    );

    if (supervisados.length === 0) {
      return res.json({ vendedores: [] });
    }

    const idsVendedores = supervisados.map(s => s.id_supervisado);
    const placeholders = idsVendedores.map(() => '?').join(',');

    // Obtener datos de los vendedores con estadísticas
    const query = `
      SELECT 
        u.id,
        u.nombre,
        u.correo,
        u.telefono,
        u.direccion,
        u.activo,
        u.foto_perfil,
        COUNT(DISTINCT v.id) as ventas_mes,
        COALESCE(SUM(v.total), 0) as monto_mes,
        COUNT(DISTINCT v.id_usuario) as clientes_registrados
      FROM usuario u
      LEFT JOIN factura f ON u.id = f.id_usuario
      LEFT JOIN venta v ON f.id = v.id_factura
        AND YEAR(v.created_at) = YEAR(CURDATE())
        AND MONTH(v.created_at) = MONTH(CURDATE())
      WHERE u.id IN (${placeholders})
        AND u.rol = 'vendedor'
      GROUP BY u.id, u.nombre, u.correo, u.telefono, u.direccion, u.activo, u.foto_perfil
      ORDER BY u.nombre ASC
    `;

    const [vendedores] = await pool.execute(query, idsVendedores);

    res.json({ vendedores });
  } catch (error) {
    console.error('Error obteniendo vendedores supervisados:', error);
    res.status(500).json({ error: 'Error al obtener vendedores supervisados' });
  }
});

// Obtener estadísticas detalladas de un vendedor específico
router.get('/vendedores/:idVendedor/estadisticas', async (req, res) => {
  const { idVendedor } = req.params;
  const { idSupervisor } = req.query;

  try {
    // Verificar que el supervisor tiene permiso para ver este vendedor
    if (idSupervisor) {
      const [verificacion] = await pool.execute(
        'SELECT id FROM supervision WHERE id_supervisor = ? AND id_supervisado = ?',
        [idSupervisor, idVendedor]
      );

      if (verificacion.length === 0) {
        return res.status(403).json({ error: 'No tienes permiso para ver este vendedor' });
      }
    }

    // Ventas totales
    const [ventasTotales] = await pool.execute(
      `SELECT 
        COUNT(*) as ventas_totales,
        COALESCE(SUM(v.total), 0) as monto_total,
        MAX(v.created_at) as ultima_venta
      FROM venta v
      INNER JOIN factura f ON v.id_factura = f.id
      WHERE f.id_usuario = ?`,
      [idVendedor]
    );

    // Ventas del mes
    const [ventasMes] = await pool.execute(
      `SELECT 
        COUNT(*) as ventas_mes,
        COALESCE(SUM(v.total), 0) as monto_mes
      FROM venta v
      INNER JOIN factura f ON v.id_factura = f.id
      WHERE f.id_usuario = ?
        AND YEAR(v.created_at) = YEAR(CURDATE())
        AND MONTH(v.created_at) = MONTH(CURDATE())`,
      [idVendedor]
    );

    // Clientes únicos que compraron con este vendedor
    const [clientes] = await pool.execute(
      `SELECT COUNT(DISTINCT v.id_usuario) as clientes_totales
      FROM venta v
      INNER JOIN factura f ON v.id_factura = f.id
      WHERE f.id_usuario = ?`,
      [idVendedor]
    );

    // Premios pagados
    const [premios] = await pool.execute(
      `SELECT 
        COUNT(DISTINCT g.id_usuario, g.id_factura, g.nivel_premio) as premios_pagados,
        COALESCE(SUM(CAST(g.saldo_premio AS DECIMAL(10,2))), 0) as monto_premios
      FROM ganadores g
      INNER JOIN factura f ON g.id_factura = f.id
      WHERE f.id_usuario = ? AND g.fecha_hora_pago IS NOT NULL`,
      [idVendedor]
    );

    const estadisticas = {
      ventas_totales: ventasTotales[0].ventas_totales,
      monto_total: ventasTotales[0].monto_total,
      ultima_venta: ventasTotales[0].ultima_venta,
      ventas_mes: ventasMes[0].ventas_mes,
      monto_mes: ventasMes[0].monto_mes,
      clientes_totales: clientes[0].clientes_totales,
      premios_pagados: premios[0].premios_pagados,
      monto_premios: premios[0].monto_premios
    };

    res.json(estadisticas);
  } catch (error) {
    console.error('Error obteniendo estadísticas del vendedor:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del vendedor' });
  }
});

// Cambiar estado de un vendedor (activar/desactivar)
router.put('/vendedores/:idVendedor/estado', async (req, res) => {
  const { idVendedor } = req.params;
  const { activo, idSupervisor } = req.body;

  try {
    // Verificar que el supervisor tiene permiso para modificar este vendedor
    if (idSupervisor) {
      const [verificacion] = await pool.execute(
        'SELECT id FROM supervision WHERE id_supervisor = ? AND id_supervisado = ?',
        [idSupervisor, idVendedor]
      );

      if (verificacion.length === 0) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este vendedor' });
      }
    }

    // Actualizar estado del vendedor
    await pool.execute(
      'UPDATE usuario SET activo = ? WHERE id = ? AND rol = "vendedor"',
      [activo, idVendedor]
    );

    res.json({ mensaje: 'Estado del vendedor actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando estado del vendedor:', error);
    res.status(500).json({ error: 'Error al actualizar estado del vendedor' });
  }
});

// Obtener reportes y estadísticas
router.get('/reportes', async (req, res) => {
  const { idSupervisor, fechaInicio, fechaFin, vendedorId } = req.query;

  try {
    // Obtener IDs de vendedores supervisados
    const [supervisados] = await pool.execute(
      'SELECT id_supervisado FROM supervision WHERE id_supervisor = ?',
      [idSupervisor]
    );

    if (supervisados.length === 0) {
      return res.json({
        resumen: { total_ventas: 0, monto_total: 0, clientes_unicos: 0, premios_pagados: 0, monto_premios: 0 },
        vendedores: [],
        ventas: [],
        premios: [],
        clientes: []
      });
    }

    const idsVendedores = supervisados.map(s => s.id_supervisado);
    
    // Filtrar por vendedor específico si se seleccionó
    let filtroVendedor = '';
    let vendedoresParaReporte = idsVendedores;
    
    if (vendedorId && vendedorId !== 'todos') {
      if (idsVendedores.includes(parseInt(vendedorId))) {
        vendedoresParaReporte = [parseInt(vendedorId)];
        filtroVendedor = `AND f.id_usuario = ${vendedorId}`;
      } else {
        return res.status(403).json({ error: 'No tienes permiso para ver ese vendedor' });
      }
    } else {
      filtroVendedor = `AND f.id_usuario IN (${idsVendedores.join(',')})`;
    }

    // Resumen general
    const [resumen] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT v.id) as total_ventas,
        COALESCE(SUM(v.total), 0) as monto_total,
        COUNT(DISTINCT v.id_usuario) as clientes_unicos
      FROM venta v
      INNER JOIN factura f ON v.id_factura = f.id
      WHERE DATE(v.created_at) BETWEEN ? AND ?
        ${filtroVendedor}
        AND (v.eliminada IS NULL OR v.eliminada = 0)
    `, [fechaInicio, fechaFin]);

    const [premiosResumen] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT g.id_usuario, g.id_factura, g.nivel_premio) as premios_pagados,
        COALESCE(SUM(CAST(g.saldo_premio AS DECIMAL(10,2))), 0) as monto_premios
      FROM ganadores g
      INNER JOIN factura f ON g.id_factura = f.id
      WHERE DATE(g.fecha_hora_pago) BETWEEN ? AND ?
        ${filtroVendedor}
        AND g.fecha_hora_pago IS NOT NULL
    `, [fechaInicio, fechaFin]);

    // Reporte por vendedor
    const placeholders = vendedoresParaReporte.map(() => '?').join(',');
    const [reporteVendedores] = await pool.execute(`
      SELECT 
        u.id,
        u.nombre,
        COUNT(DISTINCT v.id) as total_ventas,
        COALESCE(SUM(v.total), 0) as monto_total,
        COUNT(DISTINCT v.id_usuario) as clientes_unicos,
        (
          SELECT COUNT(DISTINCT g.id_usuario, g.id_factura, g.nivel_premio)
          FROM ganadores g
          INNER JOIN factura f2 ON g.id_factura = f2.id
          WHERE f2.id_usuario = u.id
            AND DATE(g.fecha_hora_pago) BETWEEN ? AND ?
            AND g.fecha_hora_pago IS NOT NULL
        ) as premios_pagados
      FROM usuario u
      LEFT JOIN factura f ON u.id = f.id_usuario
      LEFT JOIN venta v ON f.id = v.id_factura
        AND DATE(v.created_at) BETWEEN ? AND ?
        AND (v.eliminada IS NULL OR v.eliminada = 0)
      WHERE u.id IN (${placeholders})
      GROUP BY u.id, u.nombre
      ORDER BY monto_total DESC
    `, [fechaInicio, fechaFin, fechaInicio, fechaFin, ...vendedoresParaReporte]);

    // Ventas por día
    const [ventasDiarias] = await pool.execute(`
      SELECT 
        DATE(v.created_at) as fecha,
        COUNT(DISTINCT v.id) as total_ventas,
        COALESCE(SUM(v.total), 0) as monto_total,
        COALESCE(SUM(v.cantidad), 0) as numeros_vendidos
      FROM venta v
      INNER JOIN factura f ON v.id_factura = f.id
      WHERE DATE(v.created_at) BETWEEN ? AND ?
        ${filtroVendedor}
        AND (v.eliminada IS NULL OR v.eliminada = 0)
      GROUP BY DATE(v.created_at)
      ORDER BY fecha DESC
    `, [fechaInicio, fechaFin]);

    // Premios pagados y pendientes
    const [premiosPagados] = await pool.execute(`
      SELECT 
        u.id as cliente_id,
        u.nombre as cliente_nombre,
        v.nombre as vendedor_nombre,
        DATE_FORMAT(g.fecha, '%Y-%m-%d') as fecha,
        COALESCE(SUM(CASE WHEN g.fecha_hora_pago IS NOT NULL THEN CAST(g.saldo_premio AS DECIMAL(10,2)) ELSE 0 END), 0) as monto_pagado,
        COALESCE(SUM(CASE WHEN g.fecha_hora_pago IS NULL THEN CAST(g.saldo_premio AS DECIMAL(10,2)) ELSE 0 END), 0) as monto_pendiente
      FROM ganadores g
      INNER JOIN usuario u ON g.id_usuario = u.id
      INNER JOIN factura f ON g.id_factura = f.id
      INNER JOIN usuario v ON f.id_usuario = v.id
      WHERE g.fecha BETWEEN ? AND ?
        ${filtroVendedor}
      GROUP BY u.id, u.nombre, v.nombre, DATE_FORMAT(g.fecha, '%Y-%m-%d')
      HAVING (monto_pagado > 0 OR monto_pendiente > 0)
      ORDER BY DATE_FORMAT(g.fecha, '%Y-%m-%d') DESC, monto_pagado DESC
      LIMIT 100
    `, [fechaInicio, fechaFin]);

    // Ventas por vendedor y fecha
    const [ventasPorFecha] = await pool.execute(`
      SELECT 
        v.nombre as vendedor_nombre,
        DATE_FORMAT(ven.created_at, '%Y-%m-%d') as fecha,
        COUNT(DISTINCT ven.id) as total_ventas,
        COALESCE(SUM(ven.total), 0) as monto_total
      FROM venta ven
      INNER JOIN factura f ON ven.id_factura = f.id
      INNER JOIN usuario v ON f.id_usuario = v.id
      INNER JOIN supervision s ON v.id = s.id_supervisado
      WHERE s.id_supervisor = ?
        AND DATE(ven.created_at) BETWEEN ? AND ?
        AND ven.eliminada = 0
        ${filtroVendedor.replace('v.id', 'v.id')}
      GROUP BY v.id, v.nombre, DATE_FORMAT(ven.created_at, '%Y-%m-%d')
      ORDER BY fecha DESC, monto_total DESC
    `, [idSupervisor, fechaInicio, fechaFin]);

    // Top clientes
    const [topClientes] = await pool.execute(`
      SELECT 
        u.nombre,
        COUNT(DISTINCT v.id) as total_compras,
        COALESCE(SUM(v.total), 0) as monto_total,
        MAX(v.created_at) as ultima_compra
      FROM venta v
      INNER JOIN usuario u ON v.id_usuario = u.id
      INNER JOIN factura f ON v.id_factura = f.id
      WHERE DATE(v.created_at) BETWEEN ? AND ?
        ${filtroVendedor}
        AND (v.eliminada IS NULL OR v.eliminada = 0)
      GROUP BY u.id, u.nombre
      ORDER BY monto_total DESC
      LIMIT 10
    `, [fechaInicio, fechaFin]);

    // Ventas por vendedor por día (para detalles expandidos)
    const [ventasPorVendedor] = await pool.execute(`
      SELECT 
        f.id_usuario as vendedor_id,
        DATE(v.created_at) as fecha,
        COUNT(DISTINCT v.id) as total_ventas,
        COALESCE(SUM(v.total), 0) as monto_total
      FROM venta v
      INNER JOIN factura f ON v.id_factura = f.id
      WHERE DATE(v.created_at) BETWEEN ? AND ?
        ${filtroVendedor}
        AND (v.eliminada IS NULL OR v.eliminada = 0)
      GROUP BY f.id_usuario, DATE(v.created_at)
      ORDER BY fecha DESC
    `, [fechaInicio, fechaFin]);

    // Clientes por vendedor (para detalles expandidos)
    const [clientesPorVendedor] = await pool.execute(`
      SELECT 
        f.id_usuario as vendedor_id,
        u.nombre,
        COUNT(DISTINCT v.id) as total_compras,
        COALESCE(SUM(v.total), 0) as monto_total
      FROM venta v
      INNER JOIN usuario u ON v.id_usuario = u.id
      INNER JOIN factura f ON v.id_factura = f.id
      WHERE DATE(v.created_at) BETWEEN ? AND ?
        ${filtroVendedor}
        AND (v.eliminada IS NULL OR v.eliminada = 0)
      GROUP BY f.id_usuario, u.id, u.nombre
      ORDER BY monto_total DESC
    `, [fechaInicio, fechaFin]);

    // Transacciones realizadas por los vendedores
    const [transacciones] = await pool.execute(`
      SELECT 
        t.id,
        t.tipo,
        t.monto,
        t.saldo_anterior,
        t.saldo_nuevo,
        t.descripcion,
        t.fecha,
        u.nombre as cliente_nombre,
        u.correo as cliente_correo,
        v.nombre as vendedor_nombre
      FROM transaccion t
      INNER JOIN usuario u ON t.id_usuario = u.id
      INNER JOIN usuario v ON t.id_realizado_por = v.id
      WHERE DATE(t.fecha) BETWEEN ? AND ?
        AND v.id IN (${placeholders})
      ORDER BY t.fecha DESC
      LIMIT 200
    `, [fechaInicio, fechaFin, ...vendedoresParaReporte]);

    // Resumen de transacciones
    const [resumenTransacciones] = await pool.execute(`
      SELECT 
        COUNT(*) as total_transacciones,
        SUM(CASE WHEN t.tipo = 'deposito' THEN t.monto ELSE 0 END) as total_depositos,
        SUM(CASE WHEN t.tipo = 'retiro' THEN t.monto ELSE 0 END) as total_retiros,
        SUM(CASE WHEN t.tipo = 'ajuste' THEN t.monto ELSE 0 END) as total_ajustes
      FROM transaccion t
      INNER JOIN usuario v ON t.id_realizado_por = v.id
      WHERE DATE(t.fecha) BETWEEN ? AND ?
        AND v.id IN (${placeholders})
    `, [fechaInicio, fechaFin, ...vendedoresParaReporte]);

    // Transacciones por vendedor
    const [transaccionesPorVendedor] = await pool.execute(`
      SELECT 
        v.id as vendedor_id,
        v.nombre as vendedor_nombre,
        COUNT(*) as total_transacciones,
        SUM(CASE WHEN t.tipo = 'deposito' THEN t.monto ELSE 0 END) as total_depositos,
        SUM(CASE WHEN t.tipo = 'retiro' THEN t.monto ELSE 0 END) as total_retiros
      FROM transaccion t
      INNER JOIN usuario v ON t.id_realizado_por = v.id
      WHERE DATE(t.fecha) BETWEEN ? AND ?
        AND v.id IN (${placeholders})
      GROUP BY v.id, v.nombre
      ORDER BY total_transacciones DESC
    `, [fechaInicio, fechaFin, ...vendedoresParaReporte]);

    // Agrupar datos por vendedor
    const ventasPorVendedorAgrupado = {};
    ventasPorVendedor.forEach(v => {
      if (!ventasPorVendedorAgrupado[v.vendedor_id]) {
        ventasPorVendedorAgrupado[v.vendedor_id] = [];
      }
      ventasPorVendedorAgrupado[v.vendedor_id].push(v);
    });

    const clientesPorVendedorAgrupado = {};
    clientesPorVendedor.forEach(c => {
      if (!clientesPorVendedorAgrupado[c.vendedor_id]) {
        clientesPorVendedorAgrupado[c.vendedor_id] = [];
      }
      clientesPorVendedorAgrupado[c.vendedor_id].push(c);
    });

    res.json({
      resumen: {
        total_ventas: resumen[0].total_ventas,
        monto_total: resumen[0].monto_total,
        clientes_unicos: resumen[0].clientes_unicos,
        premios_pagados: premiosResumen[0].premios_pagados,
        monto_premios: premiosResumen[0].monto_premios,
        total_transacciones: resumenTransacciones[0].total_transacciones,
        total_depositos: resumenTransacciones[0].total_depositos,
        total_retiros: resumenTransacciones[0].total_retiros,
        total_ajustes: resumenTransacciones[0].total_ajustes
      },
      vendedores: reporteVendedores,
      ventas: ventasDiarias,
      premios: premiosPagados,
      ventasPorFecha,
      clientes: topClientes,
      ventasPorVendedor: ventasPorVendedorAgrupado,
      clientesPorVendedor: clientesPorVendedorAgrupado,
      transacciones: transacciones,
      transaccionesPorVendedor: transaccionesPorVendedor
    });
  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
});

export default router;
