import express from 'express';
import * as ganadoresModel from '../models/ganadoresModel.js';

const router = express.Router();

// Crear ganador
router.post('/', async (req, res) => {
  try {
    const id = await ganadoresModel.createGanador(req.body);
    res.status(201).json({ status: 'success', data: { id } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener todos los ganadores
router.get('/', async (req, res) => {
  try {
    const ganadores = await ganadoresModel.getAllGanadores();
    res.json({ status: 'success', data: ganadores });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener ganadores por usuario
router.get('/usuario/:id_usuario', async (req, res) => {
  try {
    const ganadores = await ganadoresModel.getGanadoresByUsuario(req.params.id_usuario);
    res.json({ status: 'success', data: ganadores });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener ganadores por área
router.get('/area/:id_area', async (req, res) => {
  try {
    const ganadores = await ganadoresModel.getGanadoresByArea(req.params.id_area);
    res.json({ status: 'success', data: ganadores });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener ganadores no pagados
router.get('/estado/no-pagados', async (req, res) => {
  try {
    const ganadores = await ganadoresModel.getGanadoresNoPagados();
    res.json({ status: 'success', data: ganadores });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener ganadores pagados
router.get('/estado/pagados', async (req, res) => {
  try {
    const ganadores = await ganadoresModel.getGanadoresPagados();
    res.json({ status: 'success', data: ganadores });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener ganador por factura y nivel
router.get('/factura/:id_factura/nivel/:nivel_premio', async (req, res) => {
  try {
    const ganador = await ganadoresModel.getGanadorByFacturaYNivel(
      req.params.id_factura,
      req.params.nivel_premio
    );
    if (!ganador) {
      return res.status(404).json({ status: 'error', message: 'Ganador no encontrado' });
    }
    res.json({ status: 'success', data: ganador });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Marcar premio como pagado
router.put('/pagar', async (req, res) => {
  try {
    const { id_usuario, id_factura, nivel_premio } = req.body;
    const updated = await ganadoresModel.marcarPremioPagado(id_usuario, id_factura, nivel_premio);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Ganador no encontrado' });
    }
    res.json({ status: 'success', message: 'Premio marcado como pagado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar área del ganador
router.put('/actualizar-area', async (req, res) => {
  try {
    const { id_usuario, id_factura, nivel_premio, id_area } = req.body;
    const updated = await ganadoresModel.updateAreaGanador(id_usuario, id_factura, nivel_premio, id_area);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Ganador no encontrado' });
    }
    res.json({ status: 'success', message: 'Área actualizada' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar ganador
router.delete('/', async (req, res) => {
  try {
    const { id_usuario, id_factura, nivel_premio } = req.body;
    const deleted = await ganadoresModel.deleteGanador(id_usuario, id_factura, nivel_premio);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Ganador no encontrado' });
    }
    res.json({ status: 'success', message: 'Ganador eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Contar ganadores no pagados por área
router.get('/area/:id_area/no-pagados-count', async (req, res) => {
  try {
    const count = await ganadoresModel.countGanadoresNoPagadosByArea(req.params.id_area);
    res.json({ status: 'success', data: { count } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Sumar total de premios no pagados
router.get('/estadisticas/premios-no-pagados', async (req, res) => {
  try {
    const total = await ganadoresModel.sumPremiosNoPagados();
    res.json({ status: 'success', data: { total } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Sumar total de premios pagados
router.get('/estadisticas/premios-pagados', async (req, res) => {
  try {
    const total = await ganadoresModel.sumPremiosPagados();
    res.json({ status: 'success', data: { total } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener ganadores por rango de fechas
router.get('/rango-fechas/:fecha_inicio/:fecha_fin', async (req, res) => {
  try {
    const ganadores = await ganadoresModel.getGanadoresByDateRange(
      req.params.fecha_inicio,
      req.params.fecha_fin
    );
    res.json({ status: 'success', data: ganadores });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener estadísticas por nivel de premio
router.get('/estadisticas/por-nivel', async (req, res) => {
  try {
    const estadisticas = await ganadoresModel.getEstadisticasByNivel();
    res.json({ status: 'success', data: estadisticas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Verificar si usuario tiene premios pendientes
router.get('/usuario/:id_usuario/tiene-pendientes', async (req, res) => {
  try {
    const tienePendientes = await ganadoresModel.tienePremiosPendientes(req.params.id_usuario);
    res.json({ status: 'success', data: { tienePendientes } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
