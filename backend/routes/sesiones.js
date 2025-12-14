import express from 'express';
import * as sessionModel from '../models/sessionModel.js';
import { verificarToken, verificarRol } from '../middleware/auth.js';

const router = express.Router();

// Crear sesión
router.post('/', async (req, res) => {
  try {
    const sessionId = await sessionModel.createSession(req.body);
    res.status(201).json({ status: 'success', data: { id: sessionId } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener sesión por token
router.get('/token/:token', async (req, res) => {
  try {
    const session = await sessionModel.getSessionByToken(req.params.token);
    if (!session) {
      return res.status(404).json({ status: 'error', message: 'Sesión no encontrada' });
    }
    res.json({ status: 'success', data: session });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Validar sesión - Verifica si está activa en la BD y no ha expirado
// Este endpoint NO requiere autenticación (para verificación inicial)
router.get('/validate/:token', async (req, res) => {
  try {
    const token = decodeURIComponent(req.params.token);
    
    // Primero verificar si el token existe y es válido
    const isValid = await sessionModel.isSessionValid(token);
    
    if (isValid) {
      // Si la sesión es válida, actualizar último acceso
      const session = await sessionModel.getSessionByToken(token);
      if (session) {
        await sessionModel.updateLastAccess(session.id);
      }
      
      res.json({ 
        status: 'success', 
        data: { isValid: true },
        message: 'Sesión válida'
      });
    } else {
      // La sesión no es válida, pero no es un error de servidor
      res.json({ 
        status: 'success', 
        data: { isValid: false },
        message: 'Sesión inválida o expirada'
      });
    }
  } catch (error) {
    console.error('Error al validar sesión:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      data: { isValid: false }
    });
  }
});

// Obtener todas las sesiones activas (Solo administradores)
router.get('/activas', verificarToken, verificarRol('administrador'), async (req, res) => {
  try {
    console.log('📋 [SESIONES] Obteniendo sesiones activas...');
    const sessions = await sessionModel.getAllActiveSessions();
    console.log(`📊 [SESIONES] Total sesiones encontradas: ${sessions.length}`);
    
    // Calcular tiempo restante para cada sesión
    const sessionsConInfo = sessions.map(session => {
      const ultimoAcceso = new Date(session.ultimo_acceso);
      const ahora = new Date();
      const minutosTranscurridos = Math.floor((ahora - ultimoAcceso) / 1000 / 60);
      const minutosRestantes = Math.max(0, 180 - minutosTranscurridos);
      
      return {
        ...session,
        minutos_transcurridos: minutosTranscurridos,
        minutos_restantes: minutosRestantes,
        tiempo_restante: `${Math.floor(minutosRestantes / 60)}h ${minutosRestantes % 60}m`
      };
    });
    
    console.log('✅ [SESIONES] Enviando respuesta con', sessionsConInfo.length, 'sesiones');
    res.json({ 
      status: 'success', 
      data: sessionsConInfo,
      total: sessionsConInfo.length
    });
  } catch (error) {
    console.error('❌ [SESIONES] Error al obtener sesiones activas:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener sesiones por usuario
router.get('/usuario/:id_usuario', async (req, res) => {
  try {
    const sessions = await sessionModel.getSessionsByUsuario(req.params.id_usuario);
    res.json({ status: 'success', data: sessions });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar último acceso
router.put('/acceso/:token', async (req, res) => {
  try {
    const updated = await sessionModel.updateLastAccess(req.params.token);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Sesión no encontrada' });
    }
    res.json({ status: 'success', message: 'Último acceso actualizado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Cerrar sesión
router.put('/cerrar/:token', async (req, res) => {
  try {
    const closed = await sessionModel.closeSession(req.params.token);
    if (!closed) {
      return res.status(404).json({ status: 'error', message: 'Sesión no encontrada' });
    }
    res.json({ status: 'success', message: 'Sesión cerrada' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Cerrar sesión por ID (Solo administradores - para cerrar sesiones de otros usuarios)
router.delete('/admin/cerrar/:id', verificarToken, verificarRol('administrador'), async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    
    // Obtener información de la sesión antes de cerrarla
    const session = await sessionModel.getSessionById(sessionId);
    
    if (!session) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Sesión no encontrada' 
      });
    }
    
    // Cerrar la sesión
    const closed = await sessionModel.closeSession(sessionId);
    
    if (closed) {
      console.log(`✅ Administrador ${req.usuario.correo} cerró sesión de usuario ID: ${session.id_usuario}`);
      res.json({ 
        status: 'success', 
        message: 'Sesión cerrada exitosamente',
        data: { session_id: sessionId, usuario_id: session.id_usuario }
      });
    } else {
      res.status(500).json({ 
        status: 'error', 
        message: 'No se pudo cerrar la sesión' 
      });
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Cerrar todas las sesiones de un usuario (Solo administradores)
router.delete('/admin/cerrar-usuario/:id_usuario', verificarToken, verificarRol('administrador'), async (req, res) => {
  try {
    const id_usuario = parseInt(req.params.id_usuario);
    const count = await sessionModel.closeAllUserSessions(id_usuario);
    
    console.log(`✅ Administrador ${req.usuario.correo} cerró ${count} sesiones del usuario ID: ${id_usuario}`);
    
    res.json({ 
      status: 'success', 
      message: `${count} sesiones cerradas`,
      data: { sesiones_cerradas: count }
    });
  } catch (error) {
    console.error('Error al cerrar sesiones:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Expirar sesiones inactivas (Solo administradores)
router.post('/expirar-inactivas', verificarToken, verificarRol('administrador'), async (req, res) => {
  try {
    const count = await sessionModel.expireInactiveSessions();
    console.log(`✅ ${count} sesiones inactivas expiradas`);
    res.json({ 
      status: 'success', 
      message: `${count} sesiones expiradas`,
      data: { sesiones_expiradas: count }
    });
  } catch (error) {
    console.error('Error al expirar sesiones:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Limpiar sesiones antiguas (Solo administradores)
router.delete('/limpiar', verificarToken, verificarRol('administrador'), async (req, res) => {
  try {
    const count = await sessionModel.cleanOldSessions();
    console.log(`✅ ${count} sesiones antiguas eliminadas`);
    res.json({ 
      status: 'success', 
      message: `${count} sesiones eliminadas`,
      data: { sesiones_eliminadas: count }
    });
  } catch (error) {
    console.error('Error al limpiar sesiones:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
