import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import rifasRoutes from './routes/rifas.js';
import usuariosRoutes from './routes/usuarios.js';
import transaccionesRoutes from './routes/transacciones.js';
import vendedoresRoutes from './routes/vendedores.js';
import plantillasPremiosRoutes from './routes/plantillasPremios.js';
import sesionesRoutes from './routes/sesiones.js';
import facturasRoutes from './routes/facturas.js';
import ventasRoutes from './routes/ventas.js';
import tiposRifaRoutes from './routes/tiposRifa.js';
import opcionesPremiosRoutes from './routes/opcionesPremios.js';
import rifasCompletasRoutes from './routes/rifasCompletas.js';
import numeroGanadoresRoutes from './routes/numeroGanadores.js';
import areasRoutes from './routes/areas.js';
import ganadoresRoutes from './routes/ganadores.js';
import configuracionRoutes from './routes/configuracion.js';
import reportesRoutes from './routes/reportes.js';
import dashboardRoutes from './routes/dashboard.js';
import premiosPagoRoutes from './routes/premiosPago.js';
import vendedorClientesRoutes from './routes/vendedorClientes.js';
import vendedorDashboardRoutes from './routes/vendedorDashboard.js';
import imagenesRoutes from './routes/imagenes.js';
import supervisorRoutes from './routes/supervisor.js';
import clienteRoutes from './routes/cliente.js';
import premiosTextoRoutes from './routes/premiosTexto.js';
import premiosUsuarioRoutes from './routes/premios-usuario.js';
import expirarSesionesInactivas from './scripts/cron-expirar-sesiones.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Rutas existentes
app.use('/api/auth', authRoutes);
app.use('/api/rifas', rifasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api/vendedores', vendedoresRoutes);
app.use('/api/plantillas-premios', plantillasPremiosRoutes);

// Rutas nuevas basadas en modelos
app.use('/api/sesiones', sesionesRoutes);
app.use('/api/facturas', facturasRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/tipos-rifa', tiposRifaRoutes);
app.use('/api/opciones-premios', opcionesPremiosRoutes);
app.use('/api/rifas-completas', rifasCompletasRoutes);
app.use('/api/numero-ganadores', numeroGanadoresRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/ganadores', ganadoresRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/premios-pago', premiosPagoRoutes);
app.use('/api/vendedor-clientes', vendedorClientesRoutes);
app.use('/api/vendedor-dashboard', vendedorDashboardRoutes);
app.use('/api/imagenes', imagenesRoutes);
app.use('/api/supervisor', supervisorRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/premios-texto', premiosTextoRoutes);
app.use('/api/premios-usuario', premiosUsuarioRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'API de RifaParaTodos funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: 'Ruta no encontrada' 
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error', 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV}`);
  
  // Iniciar tarea de expiración de sesiones cada 5 minutos
  console.log('⏱️  Iniciando verificación automática de sesiones inactivas...');
  setInterval(() => {
    expirarSesionesInactivas().catch(err => {
      console.error('Error en tarea de expiración de sesiones:', err);
    });
  }, 5 * 60 * 1000); // 5 minutos
  
  // Ejecutar inmediatamente al iniciar
  expirarSesionesInactivas().catch(err => {
    console.error('Error al verificar sesiones al inicio:', err);
  });
});
