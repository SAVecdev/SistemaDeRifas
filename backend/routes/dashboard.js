import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * GET /api/dashboard/estadisticas
 * Obtiene estadísticas generales para el dashboard
 * Query params: id_usuario, rol, id_area (para supervisores)
 */
router.get('/estadisticas', async (req, res) => {
  try {
    const { id_usuario, rol } = req.query;
    const esSupervisor = rol === 'supervisor' && id_usuario;
    
    // Para supervisor: obtener IDs de vendedores supervisados
    let vendedoresSupervisados = [];
    if (esSupervisor) {
      const [supervisados] = await pool.execute(
        'SELECT id_supervisado FROM supervision WHERE id_supervisor = ?',
        [id_usuario]
      );
      vendedoresSupervisados = supervisados.map(s => s.id_supervisado);
      
      // Si no tiene vendedores asignados, devolver estadísticas vacías
      if (vendedoresSupervisados.length === 0) {
        return res.json({
          rifas: { total_rifas: 0, rifas_activas: 0, rifas_finalizadas: 0 },
          usuarios: 0,
          ventasHoy: { total_ventas: 0, numeros_vendidos: 0, monto_total: 0 },
          ventasMes: { total_ventas: 0, monto_total: 0 },
          premiosHoy: { total_premios: 0, monto_premios: 0 },
          premiosRecientes: { 
            total_premios: 0, 
            monto_total: 0, 
            monto_pagado: 0, 
            monto_pendiente: 0,
            premios_pagados: 0,
            premios_pendientes: 0
          }
        });
      }
    }
    
    // Filtro para supervisores: usar IN con los IDs de vendedores supervisados
    const filtroVendedores = esSupervisor 
      ? `AND v.id_usuario IN (${vendedoresSupervisados.join(',')})` 
      : '';
    const filtroUsuarios = esSupervisor 
      ? `AND u.id IN (${vendedoresSupervisados.join(',')})` 
      : '';

    // Total de rifas (sin filtro - información general)
    const [rifas] = await pool.execute(
      `SELECT 
        COUNT(*) as total_rifas,
        COUNT(CASE WHEN fecha_hora_juego > NOW() THEN 1 END) as rifas_activas,
        COUNT(CASE WHEN fecha_hora_juego <= NOW() THEN 1 END) as rifas_finalizadas
      FROM rifa`
    );

    // Clientes de los vendedores supervisados
    const queryUsuarios = `
      SELECT COUNT(DISTINCT c.id) as total 
      FROM usuario c
      INNER JOIN venta v ON c.id = v.id_usuario
      WHERE c.rol = 'cliente'
        ${filtroVendedores.replace('AND v.id_usuario', 'AND v.id_usuario')}`;
    const [usuarios] = await pool.execute(queryUsuarios);

    // Ventas de hoy (solo de vendedores supervisados)
    const queryVentasHoy = `
      SELECT 
        COUNT(v.id) as total_ventas,
        COALESCE(SUM(v.cantidad), 0) as numeros_vendidos,
        COALESCE(SUM(v.total), 0) as monto_total
      FROM venta v
      WHERE DATE(v.fecha) = CURDATE()
        AND (v.eliminada IS NULL OR v.eliminada = 0)
        ${filtroVendedores}`;
    const [ventasHoy] = await pool.execute(queryVentasHoy);

    // Ventas del mes (solo de vendedores supervisados)
    const queryVentasMes = `
      SELECT 
        COUNT(v.id) as total_ventas,
        COALESCE(SUM(v.total), 0) as monto_total
      FROM venta v
      WHERE YEAR(v.fecha) = YEAR(CURDATE()) 
        AND MONTH(v.fecha) = MONTH(CURDATE())
        AND (v.eliminada IS NULL OR v.eliminada = 0)
        ${filtroVendedores}`;
    const [ventasMes] = await pool.execute(queryVentasMes);

    // Premios del día (solo de vendedores supervisados)
    const queryPremiosHoy = `
      SELECT 
        COUNT(*) as total_premios,
        COALESCE(SUM(CAST(g.saldo_premio AS DECIMAL(10,2))), 0) as monto_premios
      FROM ganadores g
      INNER JOIN factura f ON g.id_factura = f.id
      WHERE DATE(g.fecha_hora_pago) = CURDATE()
        ${filtroVendedores.replace('v.id_usuario', 'f.id_usuario')}`;
    const [premiosHoy] = await pool.execute(queryPremiosHoy);

    // Premios últimos 8 días (solo de vendedores supervisados) 
    let queryPremiosRecientes = `
      SELECT 
        COUNT(DISTINCT g.id_usuario, g.id_factura, g.nivel_premio) as total_premios,
        COALESCE(SUM(CAST(g.saldo_premio AS DECIMAL(10,2))), 0) as monto_total,
        COALESCE(SUM(CASE WHEN g.pagada = 1 THEN CAST(g.saldo_premio AS DECIMAL(10,2)) ELSE 0 END), 0) as monto_pagado,
        COALESCE(SUM(CASE WHEN g.pagada = 0 THEN CAST(g.saldo_premio AS DECIMAL(10,2)) ELSE 0 END), 0) as monto_pendiente,
        COUNT(DISTINCT CASE WHEN g.pagada = 1 THEN CONCAT(g.id_usuario, '-', g.id_factura, '-', g.nivel_premio) END) as premios_pagados,
        COUNT(DISTINCT CASE WHEN g.pagada = 0 THEN CONCAT(g.id_usuario, '-', g.id_factura, '-', g.nivel_premio) END) as premios_pendientes
      FROM ganadores g
      INNER JOIN factura f ON g.id_factura = f.id
      WHERE 1=1
        ${filtroVendedores.replace('v.id_usuario', 'f.id_usuario')}`;
    const [premiosRecientes] = await pool.execute(queryPremiosRecientes);

    res.json({
      rifas: rifas[0],
      usuarios: usuarios[0].total,
      ventasHoy: ventasHoy[0],
      ventasMes: ventasMes[0],
      premiosHoy: premiosHoy[0],
      premiosRecientes: premiosRecientes[0]
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

/**
 * GET /api/dashboard/rifas-recientes
 * Obtiene las rifas más recientes con sus ventas
 * Query params: id_area, rol (para supervisores)
 */
router.get('/rifas-recientes', async (req, res) => {
  try {
    const { id_usuario, rol } = req.query;
    const esSupervisor = rol === 'supervisor' && id_usuario;
    
    // Para supervisor: obtener IDs de vendedores supervisados
    let filtroVendedores = '';
    if (esSupervisor) {
      const [supervisados] = await pool.execute(
        'SELECT id_supervisado FROM supervision WHERE id_supervisor = ?',
        [id_usuario]
      );
      const vendedoresSupervisados = supervisados.map(s => s.id_supervisado);
      
      if (vendedoresSupervisados.length === 0) {
        return res.json([]);
      }
      
      filtroVendedores = `AND v.id_usuario IN (${vendedoresSupervisados.join(',')})`;
    }
    
    const query = `
      SELECT 
        r.id,
        r.descripcion as titulo,
        CASE 
          WHEN r.fecha_hora_juego > NOW() THEN 'activa'
          ELSE 'finalizada'
        END as estado,
        r.fecha_hora_juego,
        COUNT(v.id) as total_ventas,
        COALESCE(SUM(v.cantidad), 0) as numeros_vendidos,
        COALESCE(SUM(v.total), 0) as ingresos
      FROM rifa r
      LEFT JOIN venta v ON r.id = v.id_rifas AND (v.eliminada IS NULL OR v.eliminada = 0) ${filtroVendedores}
      GROUP BY r.id, r.descripcion, r.fecha_hora_juego
      ORDER BY r.fecha_hora_juego DESC
      LIMIT 10`;
    
    const [rifas] = await pool.execute(query);

    res.json(rifas);
  } catch (error) {
    console.error('Error obteniendo rifas recientes:', error);
    res.status(500).json({ error: 'Error al obtener rifas recientes' });
  }
});

export default router;
