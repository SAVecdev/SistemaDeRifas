import express from 'express';
import {
  createPremioTexto,
  getAllPremiosTexto,
  getPremiosTextoByTipo,
  getPremioTextoByNivel,
  updatePremioTexto,
  deletePremioTexto,
  deletePremiosTextoByTipo,
  getVistaConsolidadaPremiosTexto
} from '../models/premiosTextoModel.js';

const router = express.Router();

// ===================== RUTAS PREMIOS TEXTO =====================

// Obtener vista consolidada de premios en texto
router.get('/vista-consolidada', async (req, res) => {
  try {
    console.log('📋 GET /api/premios-texto/vista-consolidada');
    const premios = await getVistaConsolidadaPremiosTexto();
    res.json({
      status: 'success',
      data: premios
    });
  } catch (error) {
    console.error('❌ Error obteniendo vista consolidada de premios texto:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Obtener todos los premios en texto
router.get('/', async (req, res) => {
  try {
    console.log('📋 GET /api/premios-texto');
    const premios = await getAllPremiosTexto();
    res.json({
      status: 'success',
      data: premios
    });
  } catch (error) {
    console.error('❌ Error obteniendo premios texto:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Obtener premios en texto por tipo de rifa
router.get('/tipo/:id_tipo_rifa', async (req, res) => {
  try {
    const { id_tipo_rifa } = req.params;
    console.log(`📋 GET /api/premios-texto/tipo/${id_tipo_rifa}`);
    const premios = await getPremiosTextoByTipo(id_tipo_rifa);
    res.json({
      status: 'success',
      data: premios
    });
  } catch (error) {
    console.error('❌ Error obteniendo premios texto por tipo:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Obtener premio en texto específico
router.get('/tipo/:id_tipo_rifa/nivel/:nivel_premio', async (req, res) => {
  try {
    const { id_tipo_rifa, nivel_premio } = req.params;
    console.log(`📋 GET /api/premios-texto/tipo/${id_tipo_rifa}/nivel/${nivel_premio}`);
    const premio = await getPremioTextoByNivel(id_tipo_rifa, nivel_premio);
    if (!premio) {
      return res.status(404).json({
        status: 'error',
        message: 'Premio no encontrado'
      });
    }
    res.json({
      status: 'success',
      data: premio
    });
  } catch (error) {
    console.error('❌ Error obteniendo premio texto:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Crear nuevo premio en texto
router.post('/', async (req, res) => {
  try {
    console.log('📝 POST /api/premios-texto - Body:', req.body);
    const { id_tipo_rifa, nivel_premio, descripcion_premio, saldo_ganado, id_area, digitos } = req.body;
    
    // Validar campos requeridos
    if (!id_tipo_rifa || !nivel_premio || !descripcion_premio) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan campos obligatorios: id_tipo_rifa, nivel_premio, descripcion_premio'
      });
    }

    const id = await createPremioTexto(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Premio en texto creado correctamente',
      data: { id }
    });
  } catch (error) {
    console.error('❌ Error creando premio texto:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Actualizar premio en texto
router.put('/tipo/:id_tipo_rifa/nivel/:nivel_premio', async (req, res) => {
  try {
    const { id_tipo_rifa, nivel_premio } = req.params;
    console.log(`📝 PUT /api/premios-texto/tipo/${id_tipo_rifa}/nivel/${nivel_premio} - Body:`, req.body);
    
    const actualizado = await updatePremioTexto(id_tipo_rifa, nivel_premio, req.body);
    
    if (!actualizado) {
      return res.status(404).json({
        status: 'error',
        message: 'Premio no encontrado'
      });
    }

    res.json({
      status: 'success',
      message: 'Premio en texto actualizado correctamente'
    });
  } catch (error) {
    console.error('❌ Error actualizando premio texto:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Eliminar premio en texto específico
router.delete('/tipo/:id_tipo_rifa/nivel/:nivel_premio', async (req, res) => {
  try {
    const { id_tipo_rifa, nivel_premio } = req.params;
    console.log(`🗑️ DELETE /api/premios-texto/tipo/${id_tipo_rifa}/nivel/${nivel_premio}`);
    
    const eliminado = await deletePremioTexto(id_tipo_rifa, nivel_premio);
    
    if (!eliminado) {
      return res.status(404).json({
        status: 'error',
        message: 'Premio no encontrado'
      });
    }

    res.json({
      status: 'success',
      message: 'Premio en texto eliminado correctamente'
    });
  } catch (error) {
    console.error('❌ Error eliminando premio texto:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Eliminar todos los premios en texto de un tipo de rifa
router.delete('/tipo/:id_tipo_rifa', async (req, res) => {
  try {
    const { id_tipo_rifa } = req.params;
    console.log(`🗑️ DELETE /api/premios-texto/tipo/${id_tipo_rifa}`);
    
    const eliminados = await deletePremiosTextoByTipo(id_tipo_rifa);
    
    res.json({
      status: 'success',
      message: `${eliminados} premios eliminados correctamente`
    });
  } catch (error) {
    console.error('❌ Error eliminando premios texto:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

export default router;
