import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verificarToken, verificarRol } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

// Configurar multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/imagenes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WEBP)'));
    }
  }
});

// Aplicar middleware de autenticación y rol de administrador
router.use(verificarToken);
router.use(verificarRol('administrador'));

/**
 * GET /api/imagenes
 * Obtener todas las imágenes
 */
router.get('/', async (req, res) => {
  try {
    const [imagenes] = await pool.execute(
      `SELECT 
        id,
        nombre,
        ruta,
        CONCAT('http://localhost:', ?, '/uploads/imagenes/', nombre) as url,
        created_at
      FROM imagenes
      ORDER BY created_at DESC`,
      [process.env.PORT || 5000]
    );
    
    res.json({ imagenes });
  } catch (error) {
    console.error('Error obteniendo imágenes:', error);
    res.status(500).json({ error: 'Error al obtener imágenes' });
  }
});

/**
 * POST /api/imagenes/upload
 * Subir una nueva imagen
 */
router.post('/upload', upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }

    const { filename, path: filePath } = req.file;
    
    // Guardar en base de datos
    const [result] = await pool.execute(
      'INSERT INTO imagenes (nombre, ruta, created_at) VALUES (?, ?, NOW())',
      [filename, filePath]
    );

    const url = `http://localhost:${process.env.PORT || 5000}/uploads/imagenes/${filename}`;
    
    res.json({
      message: 'Imagen subida exitosamente',
      imagen: {
        id: result.insertId,
        nombre: filename,
        url
      }
    });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    
    // Eliminar archivo si hubo error en BD
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Error al subir imagen' });
  }
});

/**
 * DELETE /api/imagenes/:id
 * Eliminar una imagen
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener información de la imagen
    const [imagenes] = await pool.execute(
      'SELECT nombre, ruta FROM imagenes WHERE id = ?',
      [id]
    );
    
    if (imagenes.length === 0) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    
    const imagen = imagenes[0];
    
    // Eliminar archivo físico
    if (fs.existsSync(imagen.ruta)) {
      fs.unlinkSync(imagen.ruta);
    }
    
    // Eliminar de base de datos
    await pool.execute('DELETE FROM imagenes WHERE id = ?', [id]);
    
    res.json({ message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
});

export default router;
