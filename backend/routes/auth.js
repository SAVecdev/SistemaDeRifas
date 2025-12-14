import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUsuarioByEmail, createUsuario } from '../models/usuarioModel.js';
import * as sessionModel from '../models/sessionModel.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

// Login - Autenticación real con base de datos
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que se envíen los datos
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario en la base de datos
    const usuario = await getUsuarioByEmail(email);

    if (!usuario) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario desactivado. Contacte al administrador.'
      });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        correo: usuario.correo, 
        rol: usuario.rol 
      },
      process.env.JWT_SECRET || 'tu_secreto_super_seguro',
      { expiresIn: '24h' }
    );

    // Registrar sesión en la base de datos
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    
    // Extraer información del navegador y sistema operativo
    let navegador = 'Desconocido';
    let sistemaOperativo = 'Desconocido';
    
    if (userAgent) {
      // Detectar navegador
      if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) navegador = 'Chrome';
      else if (userAgent.includes('Firefox')) navegador = 'Firefox';
      else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) navegador = 'Safari';
      else if (userAgent.includes('Edg')) navegador = 'Edge';
      else if (userAgent.includes('Opera') || userAgent.includes('OPR')) navegador = 'Opera';
      
      // Detectar sistema operativo
      if (userAgent.includes('Windows')) sistemaOperativo = 'Windows';
      else if (userAgent.includes('Mac')) sistemaOperativo = 'macOS';
      else if (userAgent.includes('Linux')) sistemaOperativo = 'Linux';
      else if (userAgent.includes('Android')) sistemaOperativo = 'Android';
      else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) sistemaOperativo = 'iOS';
    }

    try {
      // Crear registro de sesión ANTES de responder al cliente
      const sessionId = await sessionModel.createSession({
        id_usuario: usuario.id,
        token_sesion: token,
        ip: ip,
        user_agent: userAgent,
        navegador: navegador,
        sistema_operativo: sistemaOperativo
      });

      console.log(`✅ Nueva sesión registrada (ID: ${sessionId}) para usuario: ${usuario.correo} (IP: ${ip})`);
    } catch (sessionError) {
      console.error('❌ Error al registrar sesión:', sessionError);
      // IMPORTANTE: Si falla el registro de sesión, NO permitir el login
      return res.status(500).json({
        status: 'error',
        message: 'Error al crear sesión. Por favor, intente nuevamente.'
      });
    }

    // Preparar datos del usuario (sin password)
    const usuarioRespuesta = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: '', // La BD no tiene campo apellido, se puede extraer del nombre si es necesario
      email: usuario.correo,
      rol: usuario.rol,
      saldo: usuario.saldo,
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      foto_perfil: usuario.foto_perfil,
      id_area: usuario.id_area
    };

    res.json({
      status: 'success',
      message: 'Login exitoso',
      data: {
        token: token,
        usuario: usuarioRespuesta
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error interno del servidor' 
    });
  }
});

// Registro - Creación real de usuario en base de datos
router.post('/registro', async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, password, direccion, rol } = req.body;
    
    // Validación básica
    if (!nombre || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Nombre, email y contraseña son requeridos'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Formato de email inválido'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await getUsuarioByEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({
        status: 'error',
        message: 'El email ya está registrado'
      });
    }
    
    // Concatenar nombre completo (la BD usa un solo campo)
    const nombreCompleto = apellido ? `${nombre} ${apellido}` : nombre;
    
    // Determinar rol: por defecto cliente (usuario_registrado)
    const rolAsignado = rol || 'cliente';
    
    // Crear usuario en la base de datos
    const nuevoUsuarioId = await createUsuario({
      nombre: nombreCompleto,
      correo: email,
      password: password,
      direccion: direccion || null,
      rol: rolAsignado,
      telefono: telefono || null,
      foto_perfil: null
    });

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: nuevoUsuarioId, 
        correo: email, 
        rol: rolAsignado 
      },
      process.env.JWT_SECRET || 'tu_secreto_super_seguro',
      { expiresIn: '24h' }
    );

    // Preparar respuesta
    const usuarioRespuesta = {
      id: nuevoUsuarioId,
      nombre: nombreCompleto,
      apellido: '',
      email: email,
      rol: rolAsignado,
      saldo: 0,
      telefono: telefono || null,
      direccion: direccion || null,
      id_area: null
    };
    
    res.json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      data: {
        token: token,
        usuario: usuarioRespuesta
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al registrar usuario' 
    });
  }
});

// Registro alternativo (compatibilidad)
router.post('/register', async (req, res) => {
  // Reutilizar la misma lógica del endpoint /registro
  return router.handle(req, res);
});

// Logout - Cerrar sesión
router.post('/logout', verificarToken, async (req, res) => {
  try {
    const token = req.token;
    
    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Token no proporcionado'
      });
    }

    // Cerrar sesión en la base de datos
    const cerrada = await sessionModel.closeSessionByToken(token);
    
    if (cerrada) {
      console.log(`✅ Sesión cerrada para usuario: ${req.usuario.correo}`);
      res.json({
        status: 'success',
        message: 'Sesión cerrada exitosamente'
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Sesión no encontrada'
      });
    }
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al cerrar sesión'
    });
  }
});

// Verificar token - Mock
router.get('/verify', async (req, res) => {
  res.json({
    status: 'success',
    data: {
      usuario: {
        id: 1,
        nombre: 'Usuario',
        email: 'usuario@email.com',
        rol: 'usuario'
      }
    }
  });
});

export default router;
