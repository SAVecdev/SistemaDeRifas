import express from 'express';
import * as facturaModel from '../models/facturaModel.js';

const router = express.Router();

// Crear factura
router.post('/', async (req, res) => {
  try {
    const facturaId = await facturaModel.createFactura(req.body);
    res.status(201).json({ status: 'success', data: { id: facturaId } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener factura por ID
router.get('/:id', async (req, res) => {
  try {
    const factura = await facturaModel.getFacturaById(req.params.id);
    if (!factura) {
      return res.status(404).json({ status: 'error', message: 'Factura no encontrada' });
    }
    res.json({ status: 'success', data: factura });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener facturas por usuario
router.get('/usuario/:id_usuario', async (req, res) => {
  try {
    const facturas = await facturaModel.getFacturasByUsuario(req.params.id_usuario);
    res.json({ status: 'success', data: facturas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener todas las facturas
router.get('/', async (req, res) => {
  try {
    const facturas = await facturaModel.getAllFacturas();
    res.json({ status: 'success', data: facturas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener facturas con ventas
router.get('/con-ventas/todas', async (req, res) => {
  try {
    const facturas = await facturaModel.getFacturasWithVentas();
    res.json({ status: 'success', data: facturas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Verificar si factura tiene ventas
router.get('/:id/tiene-ventas', async (req, res) => {
  try {
    const tieneVentas = await facturaModel.facturaHasVentas(req.params.id);
    res.json({ status: 'success', data: { tieneVentas } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar factura
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await facturaModel.deleteFactura(req.params.id);
    if (!deleted) {
      return res.status(400).json({ status: 'error', message: 'No se puede eliminar la factura (tiene ventas asociadas)' });
    }
    res.json({ status: 'success', message: 'Factura eliminada' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
