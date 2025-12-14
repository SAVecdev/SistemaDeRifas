import express from 'express';
import { verificarRol, verificarPermiso, esVendedorOSuperior, esSupervisorOAdmin } from '../middleware/auth.js';

const router = express.Router();

// Obtener lista de vendedores (solo supervisor y admin)
router.get('/vendedores', esSupervisorOAdmin, async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: [
        {
          id: 3,
          nombre: 'Ana',
          apellido: 'Vendedora',
          email: 'vendedor@rifaparatodos.com',
          ventas_hoy: 15,
          ventas_mes: 450,
          usuarios_registrados: 23
        },
        {
          id: 5,
          nombre: 'Pedro',
          apellido: 'Vendedor',
          email: 'vendedor2@rifaparatodos.com',
          ventas_hoy: 8,
          ventas_mes: 280,
          usuarios_registrados: 15
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener ventas de un vendedor específico (supervisor y admin pueden ver todas)
router.get('/vendedores/:id/ventas', esSupervisorOAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      status: 'success',
      data: {
        vendedor_id: parseInt(id),
        ventas: [
          {
            id: 1,
            tipo: 'venta',
            descripcion: 'Venta de 5 números - Rifa iPhone',
            monto: 25,
            fecha: '2025-12-04T10:30:00',
            usuario: 'Juan Pérez'
          },
          {
            id: 2,
            tipo: 'registro_usuario',
            descripcion: 'Registro de nuevo usuario',
            usuario: 'María García',
            fecha: '2025-12-04T11:00:00'
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Vender números (solo vendedores)
router.post('/ventas/vender-numeros', verificarRol('vendedor'), async (req, res) => {
  try {
    const { rifa_id, usuario_id, numeros, forma_pago } = req.body;
    
    res.json({
      status: 'success',
      message: 'Números vendidos exitosamente',
      data: {
        venta_id: Math.floor(Math.random() * 1000),
        numeros_vendidos: numeros,
        total: numeros.length * 5,
        forma_pago
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Registrar nuevo usuario (vendedor)
router.post('/ventas/registrar-usuario', verificarRol('vendedor'), async (req, res) => {
  try {
    const { nombre, apellido, email, telefono } = req.body;
    
    res.json({
      status: 'success',
      message: 'Usuario registrado por vendedor',
      data: {
        usuario_id: Math.floor(Math.random() * 1000),
        nombre,
        apellido,
        email,
        vendedor_asignado: req.usuario?.id
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Pagar premio a ganador (vendedor)
router.post('/ventas/pagar-premio', verificarRol('vendedor'), async (req, res) => {
  try {
    const { usuario_id, premio_id, monto, metodo_pago } = req.body;
    
    res.json({
      status: 'success',
      message: 'Premio pagado exitosamente',
      data: {
        pago_id: Math.floor(Math.random() * 1000),
        usuario_id,
        monto,
        metodo_pago,
        fecha_pago: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener mis ventas (vendedor)
router.get('/ventas/mis-ventas', verificarRol('vendedor'), async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: {
        ventas_hoy: 15,
        ventas_mes: 450,
        total_hoy: 375,
        total_mes: 11250,
        ventas_recientes: [
          {
            id: 1,
            tipo: 'venta',
            descripcion: 'Venta de 5 números',
            monto: 25,
            fecha: '2025-12-04T10:30:00'
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Reportes para supervisor
router.get('/reportes/general', esSupervisorOAdmin, async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: {
        ventas_totales: 45670,
        rifas_activas: 8,
        usuarios_activos: 1543,
        vendedores_activos: 5,
        transacciones_hoy: 234,
        top_vendedores: [
          { nombre: 'Ana Vendedora', ventas: 450 },
          { nombre: 'Pedro Vendedor', ventas: 280 }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
