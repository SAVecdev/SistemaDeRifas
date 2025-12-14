import express from 'express';
import * as areaModel from '../models/areaModel.js';

const router = express.Router();

// Crear área
router.post('/', async (req, res) => {
  try {
    console.log('📥 Backend POST /areas - Body recibido:', req.body);
    console.log('📥 Tipos de datos recibidos:', {
      saldo_02: typeof req.body.saldo_02,
      saldo_03: typeof req.body.saldo_03,
      saldo_04: typeof req.body.saldo_04,
      saldo_05: typeof req.body.saldo_05,
      saldo_06: typeof req.body.saldo_06
    });
    const areaId = await areaModel.createArea(req.body);
    console.log('✅ Área creada con ID:', areaId);
    res.status(201).json({ status: 'success', data: { id: areaId } });
  } catch (error) {
    console.error('❌ Error en POST /areas:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener todas las áreas
router.get('/', async (req, res) => {
  try {
    const areas = await areaModel.getAllAreas();
    res.json({ status: 'success', data: areas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener área por ID
router.get('/:id', async (req, res) => {
  try {
    const area = await areaModel.getAreaById(req.params.id);
    if (!area) {
      return res.status(404).json({ status: 'error', message: 'Área no encontrada' });
    }
    res.json({ status: 'success', data: area });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar área
router.put('/:id', async (req, res) => {
  try {
    console.log('📥 Backend PUT /areas/:id - ID:', req.params.id);
    console.log('📥 Backend PUT /areas/:id - Body recibido:', req.body);
    console.log('📥 Tipos de datos recibidos:', {
      saldo_02: typeof req.body.saldo_02,
      saldo_03: typeof req.body.saldo_03,
      saldo_04: typeof req.body.saldo_04,
      saldo_05: typeof req.body.saldo_05,
      saldo_06: typeof req.body.saldo_06
    });

    const { nombre, saldo_02, saldo_03, saldo_04, saldo_05, saldo_06 } = req.body;
    
    if (!nombre || nombre.trim().length === 0) {
      return res.status(400).json({ status: 'error', message: 'El nombre es requerido' });
    }

    const dataToUpdate = { 
      nombre, 
      saldo_02, 
      saldo_03, 
      saldo_04, 
      saldo_05, 
      saldo_06 
    };

    console.log('💾 Datos a actualizar en BD:', dataToUpdate);

    const updated = await areaModel.updateArea(req.params.id, dataToUpdate);
    
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Área no encontrada' });
    }
    console.log('✅ Área actualizada correctamente');
    res.json({ status: 'success', message: 'Área actualizada correctamente' });
  } catch (error) {
    console.error('❌ Error en PUT /areas/:id:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar saldo de un área
router.put('/:id/saldo', async (req, res) => {
  try {
    const { nivel_saldo, nuevo_saldo } = req.body;
    const updated = await areaModel.updateSaldoArea(req.params.id, nivel_saldo, nuevo_saldo);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Área no encontrada' });
    }
    res.json({ status: 'success', message: 'Saldo actualizado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Añadir saldo a un área
router.put('/:id/saldo/agregar', async (req, res) => {
  try {
    const { nivel_saldo, monto } = req.body;
    const updated = await areaModel.addSaldoArea(req.params.id, nivel_saldo, monto);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Área no encontrada' });
    }
    res.json({ status: 'success', message: 'Saldo agregado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Restar saldo de un área
router.put('/:id/saldo/restar', async (req, res) => {
  try {
    const { nivel_saldo, monto } = req.body;
    const result = await areaModel.subtractSaldoArea(req.params.id, nivel_saldo, monto);
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    res.json({ status: 'success', message: 'Saldo restado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener saldo específico de un área
router.get('/:id/saldo/:nivel_saldo', async (req, res) => {
  try {
    const saldo = await areaModel.getSaldoArea(req.params.id, req.params.nivel_saldo);
    if (saldo === null) {
      return res.status(404).json({ status: 'error', message: 'Área no encontrada' });
    }
    res.json({ status: 'success', data: { saldo } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener total de todos los saldos de un área
router.get('/:id/saldo-total', async (req, res) => {
  try {
    const total = await areaModel.getTotalSaldosArea(req.params.id);
    res.json({ status: 'success', data: { total } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Resetear saldos de un área
router.put('/:id/resetear-saldos', async (req, res) => {
  try {
    const updated = await areaModel.resetSaldosArea(req.params.id);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Área no encontrada' });
    }
    res.json({ status: 'success', message: 'Saldos reseteados' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar área
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await areaModel.deleteArea(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Área no encontrada' });
    }
    res.json({ status: 'success', message: 'Área eliminada' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
