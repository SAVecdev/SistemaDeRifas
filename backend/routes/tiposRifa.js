import express from 'express';
import * as tipoRifaModel from '../models/tipoRifaModel.js';

const router = express.Router();

// Crear tipo de rifa
router.post('/', async (req, res) => {
  try {
    console.log('📥 Backend POST /tipos-rifa - Body recibido:', req.body);
    const tipoId = await tipoRifaModel.createTipoRifa(req.body);
    console.log('✅ Tipo de rifa creado con ID:', tipoId);
    res.status(201).json({ status: 'success', data: { id: tipoId } });
  } catch (error) {
    console.error('❌ Error en POST /tipos-rifa:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener todos los tipos de rifa
router.get('/', async (req, res) => {
  try {
    const tipos = await tipoRifaModel.getAllTiposRifa();
    console.log('📥 Backend GET /tipos-rifa - Tipos obtenidos:', tipos.length);
    res.json({ status: 'success', data: tipos });
  } catch (error) {
    console.error('❌ Error en GET /tipos-rifa:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener tipo de rifa por ID
router.get('/:id', async (req, res) => {
  try {
    const tipo = await tipoRifaModel.getTipoRifaById(req.params.id);
    if (!tipo) {
      return res.status(404).json({ status: 'error', message: 'Tipo de rifa no encontrado' });
    }
    res.json({ status: 'success', data: tipo });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener tipo de rifa con premios
router.get('/:id/premios', async (req, res) => {
  try {
    const tipo = await tipoRifaModel.getTipoRifaWithPremios(req.params.id);
    if (!tipo) {
      return res.status(404).json({ status: 'error', message: 'Tipo de rifa no encontrado' });
    }
    res.json({ status: 'success', data: tipo });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar tipo de rifa
router.put('/:id', async (req, res) => {
  try {
    console.log('📥 Backend PUT /tipos-rifa/:id - ID:', req.params.id);
    console.log('📥 Backend PUT /tipos-rifa/:id - Body recibido:', req.body);
    const updated = await tipoRifaModel.updateTipoRifa(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Tipo de rifa no encontrado' });
    }
    console.log('✅ Tipo de rifa actualizado correctamente');
    res.json({ status: 'success', message: 'Tipo de rifa actualizado' });
  } catch (error) {
    console.error('❌ Error en PUT /tipos-rifa/:id:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar tipo de rifa
router.delete('/:id', async (req, res) => {
  try {
    console.log('📥 Backend DELETE /tipos-rifa/:id - ID:', req.params.id);
    const deleted = await tipoRifaModel.deleteTipoRifa(req.params.id);
    if (!deleted) {
      return res.status(400).json({ status: 'error', message: 'No se puede eliminar el tipo de rifa (tiene rifas activas)' });
    }
    console.log('✅ Tipo de rifa eliminado correctamente');
    res.json({ status: 'success', message: 'Tipo de rifa eliminado' });
  } catch (error) {
    console.error('❌ Error en DELETE /tipos-rifa/:id:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
