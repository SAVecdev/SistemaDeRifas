import express from 'express';
import * as reporteModel from '../models/reporteModel.js';

const router = express.Router();

// Obtener fechas por defecto (inicio de mes actual hasta hoy)
const obtenerFechasPorDefecto = () => {
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  
  return {
    inicio: inicioMes.toISOString().split('T')[0],
    fin: hoy.toISOString().split('T')[0]
  };
};

/**
 * GET /api/reportes/resumen
 * Resumen general del período
 */
router.get('/resumen', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const fechas = obtenerFechasPorDefecto();
    const inicio = fechaInicio || fechas.inicio;
    const fin = fechaFin || fechas.fin;

    const resumen = await reporteModel.getResumenGeneral(inicio, fin);
    res.json(resumen);
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
});

/**
 * GET /api/reportes/ventas
 * Reporte simple de ventas por día
 */
router.get('/ventas', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const fechas = obtenerFechasPorDefecto();
    const inicio = fechaInicio || fechas.inicio;
    const fin = fechaFin || fechas.fin;

    const ventas = await reporteModel.getReporteVentas(inicio, fin);
    res.json(ventas);
  } catch (error) {
    console.error('Error obteniendo reporte de ventas:', error);
    res.status(500).json({ error: 'Error al obtener reporte de ventas' });
  }
});

/**
 * GET /api/reportes/premios
 * Reporte simple de premios por usuario y día
 */
router.get('/premios', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const fechas = obtenerFechasPorDefecto();
    const inicio = fechaInicio || fechas.inicio;
    const fin = fechaFin || fechas.fin;

    const premios = await reporteModel.getReportePremios(inicio, fin);
    res.json(premios);
  } catch (error) {
    console.error('Error obteniendo reporte de premios:', error);
    res.status(500).json({ error: 'Error al obtener reporte de premios' });
  }
});

/**
 * GET /api/reportes/transacciones
 * Reporte de transacciones (recargas y retiros)
 */
router.get('/transacciones', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const fechas = obtenerFechasPorDefecto();
    const inicio = fechaInicio || fechas.inicio;
    const fin = fechaFin || fechas.fin;

    const transacciones = await reporteModel.getReporteTransacciones(inicio, fin);
    res.json(transacciones);
  } catch (error) {
    console.error('Error obteniendo reporte de transacciones:', error);
    res.status(500).json({ error: 'Error al obtener reporte de transacciones' });
  }
});

export default router;
