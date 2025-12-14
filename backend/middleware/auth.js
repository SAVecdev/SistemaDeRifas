import jwt from 'jsonwebtoken';
import * as sessionModel from '../models/sessionModel.js';

/**
 * Middleware para verificar el token JWT y validar sesión activa
 */
export const verificarToken = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Token no proporcionado'
      });
    }

    // Verificar token JWT
    jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
      if (error) {
        return res.status(403).json({
          status: 'error',
          message: 'Token inválido o expirado'
        });
      }

      try {
        // Verificar si la sesión está activa y no ha expirado (3 horas)
        const sessionValida = await sessionModel.isSessionValid(token);
        
        if (!sessionValida) {
          // Intentar cerrar la sesión si existe
          await sessionModel.closeSessionByToken(token);
          
          console.warn(`⚠️ Acceso denegado - Sesión inválida o expirada para usuario: ${decoded.correo}`);
          
          return res.status(401).json({
            status: 'error',
            message: 'Sesión expirada por inactividad. Por favor, inicie sesión nuevamente.',
            code: 'SESSION_EXPIRED'
          });
        }

        // Actualizar último acceso
        const session = await sessionModel.getSessionByToken(token);
        if (session) {
          await sessionModel.updateLastAccess(session.id);
          console.log(`✅ Sesión actualizada - Usuario: ${decoded.correo} | IP: ${session.ip}`);
        } else {
          console.warn(`⚠️ Sesión no encontrada en BD para token de usuario: ${decoded.correo}`);
          return res.status(401).json({
            status: 'error',
            message: 'Sesión no encontrada. Por favor, inicie sesión nuevamente.',
            code: 'SESSION_NOT_FOUND'
          });
        }

        // Agregar información del usuario y token al request
        req.usuario = decoded;
        req.token = token;
        next();
      } catch (sessionError) {
        console.error('Error al verificar sesión:', sessionError);
        return res.status(500).json({
          status: 'error',
          message: 'Error al verificar sesión'
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error al verificar token'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
export const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
    }

    if (rolesPermitidos.includes(req.usuario.rol)) {
      next();
    } else {
      res.status(403).json({
        status: 'error',
        message: 'No tienes permisos para acceder a este recurso',
        requiredRoles: rolesPermitidos
      });
    }
  };
};

/**
 * Middleware para verificar permisos específicos
 */
export const verificarPermiso = (modulo, accion) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
    }

    const usuarioRol = req.usuario.rol;
    
    // Matriz de permisos por rol
    const permisos = {
      administrador: {
        rifas: ['crear', 'leer', 'actualizar', 'eliminar'],
        usuarios: ['crear', 'leer', 'actualizar', 'eliminar'],
        transacciones: ['crear', 'leer', 'actualizar', 'eliminar'],
        configuracion: ['crear', 'leer', 'actualizar', 'eliminar'],
        reportes: ['leer']
      },
      supervisor: {
        rifas: ['leer'],
        usuarios: ['leer'],
        transacciones: ['leer'],
        vendedores: ['leer'],
        reportes: ['leer']
      },
      vendedor: {
        rifas: ['leer'],
        ventas: ['crear', 'leer', 'actualizar'],
        usuarios: ['crear', 'leer', 'actualizar'],
        pagos_premios: ['crear', 'leer'],
        mis_ventas: ['leer']
      },
      usuario_registrado: {
        rifas: ['leer'],
        mis_rifas: ['crear', 'leer'],
        perfil: ['leer', 'actualizar'],
        transacciones: ['leer']
      },
      cliente: {
        rifas: ['leer'],
        mis_rifas: ['crear', 'leer'],
        perfil: ['leer', 'actualizar'],
        transacciones: ['leer']
      }
    };

    const permisosUsuario = permisos[usuarioRol]?.[modulo] || [];
    
    if (permisosUsuario.includes(accion)) {
      next();
    } else {
      res.status(403).json({
        status: 'error',
        message: `No tienes permiso para ${accion} en ${modulo}`
      });
    }
  };
};

/**
 * Middleware para verificar si es vendedor o superior
 */
export const esVendedorOSuperior = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      status: 'error',
      message: 'Usuario no autenticado'
    });
  }

  const rolesPermitidos = ['administrador', 'supervisor', 'vendedor'];
  
  if (rolesPermitidos.includes(req.usuario.rol)) {
    next();
  } else {
    res.status(403).json({
      status: 'error',
      message: 'Acceso solo para personal autorizado'
    });
  }
};

/**
 * Middleware para verificar si es supervisor o administrador
 */
export const esSupervisorOAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      status: 'error',
      message: 'Usuario no autenticado'
    });
  }

  const rolesPermitidos = ['administrador', 'supervisor'];
  
  if (rolesPermitidos.includes(req.usuario.rol)) {
    next();
  } else {
    res.status(403).json({
      status: 'error',
      message: 'Acceso solo para administradores y supervisores'
    });
  }
};

export default {
  verificarToken,
  verificarRol,
  verificarPermiso,
  esVendedorOSuperior,
  esSupervisorOAdmin
};
