import express from 'express';
import { getRifasActivas, getAllRifas, getRifaById } from '../models/rifaModel.js';

const router = express.Router();

// Obtener rifas activas (futuras)
router.get('/estado/activas', async (req, res) => {
  try {
    console.log('📋 Consultando rifas activas...');
    const rifas = await getRifasActivas();
    console.log(`✅ Rifas activas encontradas: ${rifas.length}`);
    if(rifas.length > 0) {
      console.log('Primera rifa:', JSON.stringify(rifas[0], null, 2));
    }
    res.json({
      status: 'success',
      data: rifas
    });
  } catch (error) {
    console.error('❌ Error obteniendo rifas activas:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener todas las rifas
router.get('/', async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: [
        {
          id: 1,
          titulo: 'iPhone 15 Pro Max',
          descripcion: 'El último modelo de iPhone',
          imagen_url: 'https://via.placeholder.com/300x200?text=iPhone+15',
          categoria: 'tecnologia',
          precio_numero: 5,
          total_numeros: 1000,
          numeros_disponibles: 850,
          fecha_sorteo: '2025-12-15T20:00:00',
          loteria_base: 'Lotería Nacional de España',
          estado: 'activa'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener rifa por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      status: 'success',
      data: {
        id: parseInt(id),
        titulo: 'iPhone 15 Pro Max',
        descripcion: 'El último modelo de iPhone con 256GB',
        imagen_url: 'https://via.placeholder.com/600x400?text=iPhone+15',
        categoria: 'tecnologia',
        precio_numero: 5,
        total_numeros: 1000,
        numeros_disponibles: 850,
        fecha_sorteo: '2025-12-15T20:00:00',
        loteria_base: 'Lotería Nacional de España',
        estado: 'activa',
        plantilla_premio_id: 1,
        plantilla_premio: {
          id: 1,
          tipo: 'PREMIUM',
          nombre: 'Premios Premium - Tecnología'
        },
        premios: [
          { 
            premio_numero: 1, 
            descripcion_premio: 'iPhone 15 Pro Max 256GB - $1200', 
            grado_loteria: 'Primer Premio',
            ganador_usuario_id: null,
            entregado: false
          },
          { 
            premio_numero: 2, 
            descripcion_premio: 'MacBook Air M2 - $1100', 
            grado_loteria: 'Segundo Premio',
            ganador_usuario_id: null,
            entregado: false
          }
        ],
        numeros_vendidos: [5, 12, 23, 45, 67]
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Crear nueva rifa
router.post('/', async (req, res) => {
  try {
    const { plantilla_premio_id, ...rifaData } = req.body;
    
    if (!plantilla_premio_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Debe seleccionar una plantilla de premios'
      });
    }
    
    // Crear la rifa
    const rifaId = Date.now();
    
    // En producción: copiar premios de la plantilla a rifas_premios
    // INSERT INTO rifas_premios (rifa_id, plantilla_premio_id, premio_numero, descripcion_premio, grado_loteria)
    // SELECT rifaId, plantilla_premio_id, 1, premio_01, 'Primer Premio' FROM plantillas_premios WHERE id = plantilla_premio_id
    
    res.json({
      status: 'success',
      message: 'Rifa creada exitosamente con plantilla de premios',
      data: { 
        id: rifaId, 
        ...rifaData,
        plantilla_premio_id,
        premios_copiados: true
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Comprar números
router.post('/:id/comprar', async (req, res) => {
  try {
    const { numeros } = req.body;
    
    res.json({
      status: 'success',
      message: 'Números comprados exitosamente',
      data: {
        numeros_comprados: numeros,
        total_pagado: numeros.length * 5
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener números disponibles
router.get('/:id/numeros-disponibles', async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: {
        disponibles: Array.from({ length: 950 }, (_, i) => i + 1).filter(n => ![5, 12, 23, 45, 67].includes(n))
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============ ADMIN - GESTIÓN DE RIFAS ============

// Obtener todas las rifas (admin)
router.get('/admin/todas', async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: [
        {
          id: 1,
          titulo: 'iPhone 15 Pro Max',
          categoria: 'tecnologia',
          precio_numero: 5,
          total_numeros: 1000,
          numeros_vendidos: 150,
          fecha_sorteo: '2025-12-15T20:00:00',
          estado: 'activa',
          fecha_creacion: '2025-11-01T10:00:00'
        },
        {
          id: 2,
          titulo: 'PlayStation 5',
          categoria: 'tecnologia',
          precio_numero: 3,
          total_numeros: 1500,
          numeros_vendidos: 1200,
          fecha_sorteo: '2025-12-20T20:00:00',
          estado: 'activa',
          fecha_creacion: '2025-11-05T15:30:00'
        },
        {
          id: 3,
          titulo: 'Tesla Model 3',
          categoria: 'vehiculos',
          precio_numero: 50,
          total_numeros: 5000,
          numeros_vendidos: 4850,
          fecha_sorteo: '2025-11-30T18:00:00',
          estado: 'finalizada',
          fecha_creacion: '2025-10-01T09:00:00'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar rifa
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { plantilla_premio_id, ...rifaData } = req.body;
    
    // Si cambió la plantilla de premios, actualizar rifas_premios
    if (plantilla_premio_id) {
      // En producción:
      // 1. DELETE FROM rifas_premios WHERE rifa_id = id AND ganador_usuario_id IS NULL
      // 2. Copiar nuevos premios de la nueva plantilla
    }
    
    res.json({
      status: 'success',
      message: 'Rifa actualizada exitosamente',
      data: {
        id: parseInt(id),
        ...rifaData,
        plantilla_premio_id,
        fecha_actualizacion: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar rifa
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si tiene números vendidos
    const numerosVendidos = 150; // Mock
    
    if (numerosVendidos > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No se puede eliminar una rifa con números vendidos. Considere cancelarla en su lugar.'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Rifa eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Cambiar estado de rifa
router.patch('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    res.json({
      status: 'success',
      message: `Rifa ${estado} exitosamente`,
      data: { id: parseInt(id), estado }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============ GESTIÓN DE PREMIOS ============

// Obtener premios de una rifa (desde rifas_premios)
router.get('/:id/premios', async (req, res) => {
  try {
    const { id } = req.params;
    
    // En producción: SELECT * FROM rifas_premios WHERE rifa_id = id ORDER BY premio_numero
    res.json({
      status: 'success',
      data: [
        {
          id: 1,
          rifa_id: parseInt(id),
          plantilla_premio_id: 1,
          premio_numero: 1,
          descripcion_premio: 'iPhone 15 Pro Max 256GB - $1200',
          grado_loteria: 'Primer Premio',
          ganador_usuario_id: null,
          numero_ganador: null,
          entregado: false
        },
        {
          id: 2,
          rifa_id: parseInt(id),
          plantilla_premio_id: 1,
          premio_numero: 2,
          descripcion_premio: 'MacBook Air M2 - $1100',
          grado_loteria: 'Segundo Premio',
          ganador_usuario_id: null,
          numero_ganador: null,
          entregado: false
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Crear premio manual (solo para casos especiales)
router.post('/:id/premios', async (req, res) => {
  try {
    const { id } = req.params;
    const { premio_numero, descripcion_premio, grado_loteria, plantilla_premio_id } = req.body;
    
    // Validar que no exista el premio_numero para esta rifa
    // En producción: SELECT COUNT(*) FROM rifas_premios WHERE rifa_id = id AND premio_numero = premio_numero
    
    res.json({
      status: 'success',
      message: 'Premio agregado exitosamente',
      data: {
        id: Date.now(),
        rifa_id: parseInt(id),
        plantilla_premio_id: plantilla_premio_id || null,
        premio_numero,
        descripcion_premio,
        grado_loteria,
        ganador_usuario_id: null,
        numero_ganador: null,
        entregado: false
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar premio (solo descripción y grado, no número)
router.put('/:rifaId/premios/:premioId', async (req, res) => {
  try {
    const { rifaId, premioId } = req.params;
    const { descripcion_premio, grado_loteria } = req.body;
    
    // No permitir actualizar si ya tiene ganador
    // En producción: verificar ganador_usuario_id IS NULL
    
    res.json({
      status: 'success',
      message: 'Premio actualizado exitosamente',
      data: {
        id: parseInt(premioId),
        rifa_id: parseInt(rifaId),
        descripcion_premio,
        grado_loteria
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar premio
router.delete('/:rifaId/premios/:premioId', async (req, res) => {
  try {
    const { premioId } = req.params;
    
    res.json({
      status: 'success',
      message: 'Premio eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
