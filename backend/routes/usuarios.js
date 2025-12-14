import express from 'express';
import * as usuarioModel from '../models/usuarioModel.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Crear usuario
router.post('/', async (req, res) => {
  try {
    const usuarioId = await usuarioModel.createUsuario(req.body);
    res.status(201).json({ status: 'success', data: { id: usuarioId } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await usuarioModel.getAllUsuarios();
    res.json({ status: 'success', data: usuarios });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const usuario = await usuarioModel.getUsuarioById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }
    res.json({ status: 'success', data: usuario });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener usuario por correo
router.get('/correo/:correo', async (req, res) => {
  try {
    const usuario = await usuarioModel.getUsuarioByCorreo(req.params.correo);
    if (!usuario) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }
    res.json({ status: 'success', data: usuario });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener usuarios por rol
router.get('/rol/:rol', async (req, res) => {
  try {
    const usuarios = await usuarioModel.getUsuariosByRol(req.params.rol);
    res.json({ status: 'success', data: usuarios });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Buscar usuarios
router.get('/buscar/:termino', async (req, res) => {
  try {
    const usuarios = await usuarioModel.searchUsuarios(req.params.termino);
    res.json({ status: 'success', data: usuarios });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const updated = await usuarioModel.updateUsuario(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }
    res.json({ status: 'success', message: 'Usuario actualizado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar contraseña
router.put('/:id/password', async (req, res) => {
  try {
    const { password } = req.body;
    const updated = await usuarioModel.updatePassword(req.params.id, password);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }
    res.json({ status: 'success', message: 'Contraseña actualizada' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener saldo del usuario
router.get('/:id/saldo', async (req, res) => {
  try {
    const usuario = await usuarioModel.getUsuarioById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }
    res.json({ status: 'success', data: { saldo: usuario.saldo } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar saldo
router.put('/:id/saldo', async (req, res) => {
  try {
    const { saldo } = req.body;
    const updated = await usuarioModel.updateSaldo(req.params.id, saldo);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }
    res.json({ status: 'success', message: 'Saldo actualizado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Agregar saldo
router.put('/:id/saldo/agregar', async (req, res) => {
  try {
    const { monto } = req.body;
    const updated = await usuarioModel.addSaldo(req.params.id, monto);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }
    res.json({ status: 'success', message: 'Saldo agregado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Restar saldo
router.put('/:id/saldo/restar', async (req, res) => {
  try {
    const { monto } = req.body;
    const result = await usuarioModel.subtractSaldo(req.params.id, monto);
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message });
    }
    res.json({ status: 'success', message: 'Saldo restado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar rol
router.put('/:id/rol', async (req, res) => {
  try {
    const { rol } = req.body;
    const updated = await usuarioModel.updateRol(req.params.id, rol);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }
    res.json({ status: 'success', message: 'Rol actualizado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Activar/Desactivar usuario
router.put('/:id/toggle-activo', async (req, res) => {
  try {
    const updated = await usuarioModel.toggleUsuarioActivo(req.params.id);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }
    res.json({ status: 'success', message: 'Estado actualizado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Verificar contraseña
router.post('/:id/verificar-password', async (req, res) => {
  try {
    const { password } = req.body;
    const isValid = await usuarioModel.verifyPassword(req.params.id, password);
    res.json({ status: 'success', data: { isValid } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Verificar si correo existe
router.get('/verificar-correo/:correo', async (req, res) => {
  try {
    const exists = await usuarioModel.correoExists(req.params.correo);
    res.json({ status: 'success', data: { exists } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Verificar si teléfono existe
router.get('/verificar-telefono/:telefono', async (req, res) => {
  try {
    const exists = await usuarioModel.telefonoExists(req.params.telefono);
    res.json({ status: 'success', data: { exists } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Editar usuario completo (para administradores)
router.post('/:id/editar', async (req, res) => {
  try {
    // Configurar multer
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = './uploads/perfiles';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'perfil-' + uniqueSuffix + path.extname(file.originalname));
      }
    });
    
    const upload = multer({ storage }).single('foto_perfil');
    
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: 'Error al subir foto' });
      }
      
      try {
        const { id } = req.params;
        const { nombre, correo, telefono, direccion, rol, activo, password } = req.body;
        
        // Preparar datos de actualización
        const updates = {
          nombre,
          correo,
          telefono: telefono || null,
          direccion: direccion || null,
          rol,
          activo: activo === '1' || activo === true ? 1 : 0
        };
        
        // Si hay nueva contraseña
        if (password && password.trim() !== '') {
          const hashedPassword = await bcrypt.hash(password, 10);
          updates.password = hashedPassword;
        }
        
        // Si hay nueva foto subida
        if (req.file) {
          const fotoUrl = `/uploads/perfiles/${req.file.filename}`;
          updates.foto_perfil = fotoUrl;
        }
        // Si se seleccionó una imagen de la galería
        else if (req.body.foto_perfil_url) {
          updates.foto_perfil = req.body.foto_perfil_url;
        }
        
        // Actualizar usuario
        await usuarioModel.updateUsuarioCompleto(id, updates);
        
        res.json({ message: 'Usuario actualizado correctamente' });
      } catch (error) {
        console.error('Error editando usuario:', error);
        res.status(500).json({ error: 'Error al editar usuario' });
      }
    });
  } catch (error) {
    console.error('Error en endpoint de edición:', error);
    res.status(500).json({ error: 'Error al procesar solicitud' });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    // Verificar rol del usuario objetivo
    const usuario = await usuarioModel.getUsuarioById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }
    if (usuario.rol === 'administrador') {
      return res.status(403).json({ status: 'error', message: 'No está permitido eliminar usuarios con rol administrador' });
    }

    const deleted = await usuarioModel.deleteUsuario(req.params.id);
    if (!deleted) {
      return res.status(500).json({ status: 'error', message: 'No se pudo eliminar el usuario' });
    }
    res.json({ status: 'success', message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
