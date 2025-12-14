import express from 'express';
import {
  buscarPremiosPorFactura,
  getPremiosPagadosPorVendedor,
  pagarPremio,
  pagarMultiplesPremios
} from '../models/premiosPagoModel.js';
import { verificarToken, verificarRol } from '../middleware/auth.js';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);
router.use(verificarRol('vendedor', 'administrador'));

/**
 * POST /api/premios-pago/buscar
 * Buscar premios por número de factura (solo del vendedor)
 */
router.post('/buscar', async (req, res) => {
  try {
    const { numeroFactura } = req.body;
    const idVendedor = req.usuario?.id;

    if (!numeroFactura) {
      return res.status(400).json({ 
        error: 'Número de factura requerido' 
      });
    }

    if (!idVendedor) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
    }

    const premios = await buscarPremiosPorFactura(numeroFactura, idVendedor);

    res.json({
      success: true,
      premios
    });

  } catch (error) {
    console.error('Error buscando premios:', error);
    res.status(500).json({ 
      error: 'Error al buscar premios',
      details: error.message 
    });
  }
});

/**
 * GET /api/premios-pago/pagados
 * Obtener premios pagados por el vendedor
 */
router.get('/pagados', async (req, res) => {
  try {
    const idVendedor = req.usuario?.id;
    
    if (!idVendedor) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
    }

    const { fechaInicio, fechaFin } = req.query;
    
    // Defaults: último mes
    const inicio = fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fechaFin || new Date().toISOString().split('T')[0];

    const premios = await getPremiosPagadosPorVendedor(idVendedor, inicio, fin);

    res.json({
      success: true,
      premios
    });

  } catch (error) {
    console.error('Error obteniendo premios pagados:', error);
    res.status(500).json({ 
      error: 'Error al obtener premios pagados',
      details: error.message 
    });
  }
});

/**
 * POST /api/premios-pago/pagar
 * Pagar un premio (solo facturas propias del vendedor)
 */
router.post('/pagar', async (req, res) => {
  try {
    const { idNumeroGanador, idUsuarioCliente, idFactura, numerol } = req.body;
    const idVendedor = req.usuario?.id;

    if (!idNumeroGanador || !idUsuarioCliente || !idFactura || !numerol) {
      return res.status(400).json({ 
        error: 'Datos incompletos para procesar el pago' 
      });
    }

    if (!idVendedor) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
    }

    const resultado = await pagarPremio(
      idNumeroGanador, 
      idUsuarioCliente, 
      idFactura, 
      numerol,
      idVendedor
    );

    res.json(resultado);

  } catch (error) {
    console.error('Error pagando premio:', error);
    res.status(500).json({ 
      error: 'Error al pagar premio',
      details: error.message 
    });
  }
});

/**
 * POST /api/premios-pago/pagar-multiples
 * Pagar múltiples premios de una vez
 */
router.post('/pagar-multiples', async (req, res) => {
  try {
    const { premios } = req.body;
    const idVendedor = req.usuario?.id;

    if (!premios || !Array.isArray(premios) || premios.length === 0) {
      return res.status(400).json({ 
        error: 'Debe proporcionar un array de premios a pagar' 
      });
    }

    if (!idVendedor) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
    }

    const resultado = await pagarMultiplesPremios(premios, idVendedor);

    res.json(resultado);

  } catch (error) {
    console.error('Error pagando múltiples premios:', error);
    res.status(500).json({ 
      error: 'Error al pagar premios',
      details: error.message 
    });
  }
});

export default router;
