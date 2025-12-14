import express from 'express';

const router = express.Router();

// ============ GESTIÓN DE PLANTILLAS DE PREMIOS ============

// Obtener todas las plantillas de premios
router.get('/', async (req, res) => {
  try {
    const { tipo, sucursal, activa } = req.query;
    
    // Mock: En producción filtrar por query params
    const plantillas = [
      {
        id: 1,
        tipo: 'PREMIUM',
        nombre: 'Premios Premium - Tecnología',
        descripcion: 'Plantilla de premios tecnológicos de alta gama',
        saldo: 15000.00,
        digitos: 4,
        premio_01: 'iPhone 15 Pro Max 256GB - $1200',
        premio_02: 'MacBook Air M2 - $1100',
        premio_03: 'iPad Pro 11" - $800',
        premio_04: 'Apple Watch Series 9 - $450',
        premio_05: 'AirPods Pro - $250',
        premio_06: 'Magic Keyboard - $150',
        premio_07: 'HomePod Mini - $100',
        premio_08: 'Apple TV 4K - $150',
        premio_09: 'MagSafe Battery Pack - $100',
        premio_10: 'Apple Gift Card $50',
        id_sucursal: 1,
        activa: true,
        created_at: '2025-01-01T10:00:00',
        updated_at: '2025-01-01T10:00:00'
      },
      {
        id: 2,
        tipo: 'BASICO',
        nombre: 'Premios Básicos - Tecnología',
        descripcion: 'Plantilla de premios tecnológicos económicos',
        saldo: 3500.00,
        digitos: 3,
        premio_01: 'Smartphone Samsung A54 - $350',
        premio_02: 'Tablet 10" - $200',
        premio_03: 'Auriculares Bluetooth - $80',
        premio_04: 'Smartwatch básico - $100',
        premio_05: 'Power Bank 20000mAh - $40',
        premio_06: null,
        premio_07: null,
        premio_08: null,
        premio_09: null,
        premio_10: null,
        id_sucursal: 1,
        activa: true,
        created_at: '2025-01-01T10:00:00',
        updated_at: '2025-01-01T10:00:00'
      },
      {
        id: 3,
        tipo: 'VEHICULOS',
        nombre: 'Premios Vehículos',
        descripcion: 'Plantilla para rifas de vehículos',
        saldo: 50000.00,
        digitos: 5,
        premio_01: 'Automóvil 0km - $25000',
        premio_02: 'Motocicleta - $5000',
        premio_03: 'Bicicleta eléctrica - $1500',
        premio_04: 'Scooter eléctrico - $800',
        premio_05: 'Accesorios auto $500',
        premio_06: null,
        premio_07: null,
        premio_08: null,
        premio_09: null,
        premio_10: null,
        id_sucursal: 2,
        activa: true,
        created_at: '2025-01-01T10:00:00',
        updated_at: '2025-01-01T10:00:00'
      }
    ];
    
    res.json({
      status: 'success',
      data: plantillas
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener una plantilla específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      status: 'success',
      data: {
        id: parseInt(id),
        tipo: 'PREMIUM',
        nombre: 'Premios Premium - Tecnología',
        descripcion: 'Plantilla de premios tecnológicos de alta gama',
        saldo: 15000.00,
        digitos: 4,
        premio_01: 'iPhone 15 Pro Max 256GB - $1200',
        premio_02: 'MacBook Air M2 - $1100',
        premio_03: 'iPad Pro 11" - $800',
        premio_04: 'Apple Watch Series 9 - $450',
        premio_05: 'AirPods Pro - $250',
        premio_06: 'Magic Keyboard - $150',
        premio_07: 'HomePod Mini - $100',
        premio_08: 'Apple TV 4K - $150',
        premio_09: 'MagSafe Battery Pack - $100',
        premio_10: 'Apple Gift Card $50',
        id_sucursal: 1,
        activa: true,
        created_at: '2025-01-01T10:00:00',
        updated_at: '2025-01-01T10:00:00'
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Crear nueva plantilla de premios
router.post('/', async (req, res) => {
  try {
    const plantillaData = req.body;
    
    // Validar campos requeridos
    if (!plantillaData.tipo || !plantillaData.nombre) {
      return res.status(400).json({
        status: 'error',
        message: 'Los campos tipo y nombre son obligatorios'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Plantilla de premios creada exitosamente',
      data: {
        id: Date.now(),
        ...plantillaData,
        activa: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar plantilla de premios
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const plantillaData = req.body;
    
    res.json({
      status: 'success',
      message: 'Plantilla de premios actualizada exitosamente',
      data: {
        id: parseInt(id),
        ...plantillaData,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar (desactivar) plantilla de premios
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si está en uso
    // En producción: SELECT COUNT(*) FROM rifas_premios WHERE plantilla_premio_id = id
    const enUso = false; // Mock
    
    if (enUso) {
      return res.status(400).json({
        status: 'error',
        message: 'No se puede eliminar una plantilla que está siendo usada por rifas activas'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Plantilla de premios eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Activar/Desactivar plantilla
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { activa } = req.body;
    
    res.json({
      status: 'success',
      message: `Plantilla ${activa ? 'activada' : 'desactivada'} exitosamente`,
      data: { id: parseInt(id), activa }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Duplicar plantilla
router.post('/:id/duplicar', async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoNombre } = req.body;
    
    res.json({
      status: 'success',
      message: 'Plantilla duplicada exitosamente',
      data: {
        id: Date.now(),
        nombre: nuevoNombre || 'Copia de plantilla',
        // ... resto de datos copiados
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener plantillas por tipo
router.get('/tipo/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    
    res.json({
      status: 'success',
      data: [
        // Filtrar por tipo
      ]
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener tipos de plantillas disponibles
router.get('/meta/tipos', async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: ['PREMIUM', 'BASICO', 'VEHICULOS', 'VIAJES', 'HOGAR', 'CUSTOM']
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
