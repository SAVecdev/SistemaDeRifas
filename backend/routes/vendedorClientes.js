import express from 'express';
import {
  getClientesPorAreaVendedor,
  getClienteDetalle,
  registrarTransaccion,
  getTransaccionesCliente
} from '../models/vendedorClienteModel.js';
import { verificarToken, verificarRol } from '../middleware/auth.js';

const router = express.Router();

// Aplicar middleware de autenticación
router.use(verificarToken);
router.use(verificarRol('vendedor', 'administrador'));

/**
 * GET /api/vendedor-clientes/
 * Obtener lista de clientes del área del vendedor
 */
router.get('/', async (req, res) => {
  try {
    const idVendedor = req.usuario?.id;

    if (!idVendedor) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
    }

    const clientes = await getClientesPorAreaVendedor(idVendedor);

    res.json({
      success: true,
      clientes
    });

  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ 
      error: 'Error al obtener clientes',
      details: error.message 
    });
  }
});

/**
 * GET /api/vendedor-clientes/:id
 * Obtener detalle de un cliente específico
 */
router.get('/:id', async (req, res) => {
  try {
    const idCliente = parseInt(req.params.id);
    const idVendedor = req.usuario?.id;

    if (!idVendedor) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
    }

    const cliente = await getClienteDetalle(idCliente, idVendedor);

    if (!cliente) {
      return res.status(404).json({ 
        error: 'Cliente no encontrado' 
      });
    }

    res.json({
      success: true,
      cliente
    });

  } catch (error) {
    console.error('Error obteniendo detalle del cliente:', error);
    res.status(500).json({ 
      error: 'Error al obtener detalle del cliente',
      details: error.message 
    });
  }
});

/**
 * POST /api/vendedor-clientes/:id/transaccion
 * Registrar recarga o retiro de saldo
 */
router.post('/:id/transaccion', async (req, res) => {
  try {
    const idCliente = parseInt(req.params.id);
    const idVendedor = req.usuario?.id;
    const { tipo, monto, descripcion } = req.body;

    if (!idVendedor) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
    }

    if (!tipo || !monto) {
      return res.status(400).json({ 
        error: 'Tipo y monto son requeridos' 
      });
    }

    if (!['recarga', 'retiro'].includes(tipo)) {
      return res.status(400).json({ 
        error: 'Tipo de transacción inválido. Use "recarga" o "retiro"' 
      });
    }

    if (monto <= 0) {
      return res.status(400).json({ 
        error: 'El monto debe ser mayor a 0' 
      });
    }

    const resultado = await registrarTransaccion(
      idCliente,
      idVendedor,
      tipo,
      monto,
      descripcion
    );

    res.json(resultado);

  } catch (error) {
    console.error('Error registrando transacción:', error);
    res.status(500).json({ 
      error: 'Error al registrar transacción',
      details: error.message 
    });
  }
});

/**
 * GET /api/vendedor-clientes/:id/transacciones
 * Obtener historial de transacciones del cliente
 */
router.get('/:id/transacciones', async (req, res) => {
  try {
    const idCliente = parseInt(req.params.id);
    const idVendedor = req.usuario?.id;
    const limite = parseInt(req.query.limite) || 20;

    if (!idVendedor) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
    }

    const transacciones = await getTransaccionesCliente(idCliente, idVendedor, limite);

    res.json({
      success: true,
      transacciones
    });

  } catch (error) {
    console.error('Error obteniendo transacciones:', error);
    res.status(500).json({ 
      error: 'Error al obtener transacciones',
      details: error.message 
    });
  }
});

export default router;
