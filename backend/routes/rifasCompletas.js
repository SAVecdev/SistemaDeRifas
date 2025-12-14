import express from 'express';
import * as rifaModel from '../models/rifaModel.js';

const router = express.Router();

// Crear rifa
router.post('/', async (req, res) => {
  try {
    const rifaId = await rifaModel.createRifa(req.body);
    res.status(201).json({ status: 'success', data: { id: rifaId } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener rifa por ID
router.get('/:id', async (req, res) => {
  try {
    const rifa = await rifaModel.getRifaById(req.params.id);
    if (!rifa) {
      return res.status(404).json({ status: 'error', message: 'Rifa no encontrada' });
    }
    res.json({ status: 'success', data: rifa });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener rifa completa con premios, ganadores y estadísticas
router.get('/:id/completa', async (req, res) => {
  try {
    const rifa = await rifaModel.getRifaCompleta(req.params.id);
    if (!rifa) {
      return res.status(404).json({ status: 'error', message: 'Rifa no encontrada' });
    }
    res.json({ status: 'success', data: rifa });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener todas las rifas
router.get('/', async (req, res) => {
  try {
    const rifas = await rifaModel.getAllRifas();
    res.json({ status: 'success', data: rifas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener rifas activas (futuras)
router.get('/estado/activas', async (req, res) => {
  try {
    const rifas = await rifaModel.getRifasActivas();
    res.json({ status: 'success', data: rifas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener rifas finalizadas
router.get('/estado/finalizadas', async (req, res) => {
  try {
    const rifas = await rifaModel.getRifasFinalizadas();
    res.json({ status: 'success', data: rifas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener rifas próximas (próximas 24 horas)
router.get('/estado/proximas', async (req, res) => {
  try {
    const rifas = await rifaModel.getRifasProximas();
    res.json({ status: 'success', data: rifas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener rifas del día
router.get('/estado/del-dia', async (req, res) => {
  try {
    const rifas = await rifaModel.getRifasDelDia();
    res.json({ status: 'success', data: rifas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener rifas por tipo
router.get('/tipo/:id_tipo_rifa', async (req, res) => {
  try {
    const rifas = await rifaModel.getRifasByTipo(req.params.id_tipo_rifa);
    res.json({ status: 'success', data: rifas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Buscar rifas
router.get('/buscar/:termino', async (req, res) => {
  try {
    const rifas = await rifaModel.searchRifas(req.params.termino);
    res.json({ status: 'success', data: rifas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar rifa
router.put('/:id', async (req, res) => {
  try {
    const updated = await rifaModel.updateRifa(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Rifa no encontrada' });
    }
    res.json({ status: 'success', message: 'Rifa actualizada' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar rifa
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await rifaModel.deleteRifa(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Rifa no encontrada' });
    }
    res.json({ status: 'success', message: 'Rifa eliminada' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Contar ventas de una rifa
router.get('/:id/ventas-count', async (req, res) => {
  try {
    const count = await rifaModel.countVentasRifa(req.params.id);
    res.json({ status: 'success', data: { count } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
