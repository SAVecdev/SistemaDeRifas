import express from 'express';
import { verificarToken, verificarRol } from '../middleware/auth.js';
import { getEstadisticasVendedor, getActividadReciente } from '../models/vendedorDashboardModel.js';

const router = express.Router();

// Aplicar middlewares a todas las rutas
router.use(verificarToken);
router.use(verificarRol('vendedor', 'administrador'));

/**
 * GET /api/vendedor-dashboard/estadisticas
 * Obtener estadísticas del dashboard del vendedor
 */
router.get('/estadisticas', async (req, res) => {
  try {
    console.log('Usuario:', req.usuario);
    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({ mensaje: 'Usuario no autenticado' });
    }
    const idVendedor = req.usuario.id;
    console.log('Obteniendo estadísticas para vendedor:', idVendedor);
    const estadisticas = await getEstadisticasVendedor(idVendedor);
    res.json(estadisticas);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      mensaje: 'Error al obtener estadísticas',
      error: error.message 
    });
  }
});

/**
 * GET /api/vendedor-dashboard/actividad
 * Obtener actividad reciente del vendedor
 */
router.get('/actividad', async (req, res) => {
  try {
    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({ mensaje: 'Usuario no autenticado' });
    }
    const idVendedor = req.usuario.id;
    const limite = parseInt(req.query.limite) || 10;
    console.log('Obteniendo actividad para vendedor:', idVendedor, 'limite:', limite);
    const actividad = await getActividadReciente(idVendedor, limite);
    res.json(actividad);
  } catch (error) {
    console.error('Error obteniendo actividad:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      mensaje: 'Error al obtener actividad reciente',
      error: error.message 
    });
  }
});

export default router;
