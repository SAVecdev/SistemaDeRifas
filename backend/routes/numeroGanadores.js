import express from 'express';
import * as numeroGanadoresModel from '../models/numeroGanadoresModel.js';

const router = express.Router();

// Crear número ganador
router.post('/', async (req, res) => {
  try {
    const payload = req.body || {};
    const sorteo = payload.sorteo || 1;
    const id = await numeroGanadoresModel.createNumeroGanador({ ...payload, sorteo });
    res.status(201).json({ status: 'success', data: { id } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Crear múltiples números ganadores
router.post('/multiples', async (req, res) => {
  try {
    const { id_rifa, numeros, sorteo = 1 } = req.body;
    const count = await numeroGanadoresModel.createMultiplesGanadores(id_rifa, numeros, sorteo);
    res.status(201).json({ status: 'success', message: `${count} números ganadores creados` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener números ganadores por rifa
router.get('/rifa/:id_rifa', async (req, res) => {
  try {
    const sorteo = req.query.sorteo ? Number(req.query.sorteo) : 1;
    const numeros = await numeroGanadoresModel.getNumeroGanadoresByRifa(req.params.id_rifa, sorteo);
    res.json({ status: 'success', data: numeros });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener números ganadores con información de ventas
router.get('/rifa/:id_rifa/con-ventas', async (req, res) => {
  try {
    const sorteo = req.query.sorteo ? Number(req.query.sorteo) : 1;
    const ganadores = await numeroGanadoresModel.getGanadoresConVentas(req.params.id_rifa, sorteo);
    res.json({ status: 'success', data: ganadores });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener número ganador por rifa y nivel
router.get('/rifa/:id_rifa/nivel/:nivel_premio', async (req, res) => {
  try {
    const sorteo = req.query.sorteo ? Number(req.query.sorteo) : 1;
    const numero = await numeroGanadoresModel.getNumeroGanadorByNivel(
      req.params.id_rifa,
      req.params.nivel_premio,
      sorteo
    );
    if (!numero) {
      return res.status(404).json({ status: 'error', message: 'Número ganador no encontrado' });
    }
    res.json({ status: 'success', data: numero });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Verificar si un número es ganador
router.get('/verificar/:id_rifa/:numero', async (req, res) => {
  try {
    const sorteo = req.query.sorteo ? Number(req.query.sorteo) : 1;
    const isGanador = await numeroGanadoresModel.isNumeroGanador(
      req.params.id_rifa,
      req.params.numero,
      sorteo
    );
    res.json({ status: 'success', data: { isGanador } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener nivel de premio de un número
router.get('/nivel/:id_rifa/:numero', async (req, res) => {
  try {
    const sorteo = req.query.sorteo ? Number(req.query.sorteo) : 1;
    const nivel = await numeroGanadoresModel.getNivelPremioByNumero(
      req.params.id_rifa,
      req.params.numero,
      sorteo
    );
    if (nivel === null) {
      return res.status(404).json({ status: 'error', message: 'Número no es ganador' });
    }
    res.json({ status: 'success', data: { nivel_premio: nivel } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar número ganador
router.put('/rifa/:id_rifa/nivel/:nivel_premio', async (req, res) => {
  try {
    const sorteo = req.query.sorteo ? Number(req.query.sorteo) : (req.body.sorteo || 1);
    const updated = await numeroGanadoresModel.updateNumeroGanador(
      req.params.id_rifa,
      req.params.nivel_premio,
      req.body.numero,
      sorteo
    );
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Número ganador no encontrado' });
    }
    res.json({ status: 'success', message: 'Número ganador actualizado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar número ganador
router.delete('/rifa/:id_rifa/nivel/:nivel_premio', async (req, res) => {
  try {
    const sorteo = req.query.sorteo ? Number(req.query.sorteo) : 1;
    const deleted = await numeroGanadoresModel.deleteNumeroGanador(
      req.params.id_rifa,
      req.params.nivel_premio,
      sorteo
    );
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Número ganador no encontrado' });
    }
    res.json({ status: 'success', message: 'Número ganador eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Contar números ganadores de una rifa
router.get('/rifa/:id_rifa/count', async (req, res) => {
  try {
    const sorteo = req.query.sorteo ? Number(req.query.sorteo) : 1;
    // use getNumeroGanadoresByRifa and count rows for compatibility
    const numeros = await numeroGanadoresModel.getNumeroGanadoresByRifa(req.params.id_rifa, sorteo);
    res.json({ status: 'success', data: { count: numeros.length } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
