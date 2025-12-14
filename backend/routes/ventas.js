import express from 'express';
import * as ventaModel from '../models/ventaModel.js';
import pool from '../database/connection.js';

const router = express.Router();

// ===================== VERIFICAR SALDO DISPONIBLE =====================

/**
 * POST /api/ventas/verificar-saldo
 * Verifica si un número tiene saldo disponible antes de agregar al carrito
 * Body: { id_rifa, numero, valor_agregar }
 */
router.post('/verificar-saldo', async (req, res) => {
  try {
    const { id_rifa, numero, valor_agregar, id_usuario } = req.body;
    
    console.log('🔍 Verificando saldo:', { id_rifa, numero, valor_agregar, id_usuario });
    
    // 1. Obtener la cantidad de dígitos del número
    const cantidadDigitos = String(numero).length;
    console.log('📏 Cantidad de dígitos:', cantidadDigitos);
    
    // 2. Obtener el id_area del usuario (vendedor/cliente)
    const [usuarioInfo] = await pool.execute(
      'SELECT id_area FROM usuario WHERE id = ?',
      [id_usuario]
    );
    
    console.log('👤 Usuario info:', usuarioInfo[0]);
    
    if (usuarioInfo.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Usuario no encontrado',
        disponible: false 
      });
    }
    
    const id_area = usuarioInfo[0].id_area;
    
    if (!id_area) {
      console.log('⚠️ Usuario sin área asignada');
      return res.status(400).json({ 
        status: 'error', 
        message: 'El usuario no tiene un área asignada. Contacte al administrador.',
        disponible: false 
      });
    }
    
    console.log('📍 ID Area:', id_area);
    
    // 3. Obtener el saldo límite del área según los dígitos
    const campoSaldo = `saldo_0${cantidadDigitos}`;
    console.log('💰 Buscando campo:', campoSaldo, 'en área:', id_area);
    
    const [areaInfo] = await pool.execute(
      `SELECT ${campoSaldo} as saldo_limite FROM area WHERE id = ?`,
      [id_area]
    );
    
    console.log('📋 Area info:', areaInfo[0]);
    
    if (areaInfo.length === 0 || areaInfo[0].saldo_limite === null) {
      console.log('⚠️ Sin límite configurado para', campoSaldo);
      return res.json({ 
        status: 'success', 
        disponible: true,
        message: 'Sin límite de saldo configurado para números de ' + cantidadDigitos + ' dígitos' 
      });
    }
    
    const saldoLimite = parseFloat(areaInfo[0].saldo_limite);
    console.log('💵 Saldo límite:', saldoLimite);
    
    // 4. Sumar el total vendido del número en la tabla venta
    const [ventasTotal] = await pool.execute(
      'SELECT COALESCE(SUM(total), 0) as total_vendido FROM venta WHERE id_rifas = ? AND numero = ?',
      [id_rifa, numero]
    );
    
    const totalVendido = parseFloat(ventasTotal[0].total_vendido || 0);
    const totalIntentando = totalVendido + parseFloat(valor_agregar);
    
    console.log('📊 Total vendido en BD:', totalVendido);
    console.log('➕ Valor a agregar:', valor_agregar);
    console.log('🎯 Total intentando:', totalIntentando);
    
    // 5. Verificar si está dentro del límite
    const disponible = totalIntentando <= saldoLimite;
    const saldoRestante = saldoLimite - totalVendido;
    
    console.log(disponible ? '✅ PERMITIDO' : '❌ EXCEDE LÍMITE');
    
    res.json({
      status: 'success',
      disponible,
      saldo_limite: saldoLimite,
      total_vendido: totalVendido,
      saldo_restante: saldoRestante,
      total_intentando: totalIntentando,
      message: disponible 
        ? `Disponible. Saldo restante: $${saldoRestante.toFixed(2)}`
        : `Límite excedido. Saldo disponible: $${saldoRestante.toFixed(2)}`
    });
    
  } catch (error) {
    console.error('Error verificando saldo:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      disponible: false 
    });
  }
});

// ===================== RUTA PARA PROCESO COMPLETO DE VENTA =====================

/**
 * POST /api/ventas/crear-completa
 * Crea una venta completa siguiendo todo el proceso:
 * 1. Busca última factura del usuario (o crea la primera con número 10001)
 * 2. Crea nueva factura incrementada
 * 3. Busca los 10 premios en opciones_premios según el tipo de rifa
 * 4. Crea la venta con todos los datos
 * 5. Retorna la venta completa
 * 
 * Body esperado:
 * {
 *   "id_usuario": 1,          // ID del usuario que compra
 *   "id_rifas": 1,            // ID de la rifa
 *   "numero": "123456",       // Número de lotería comprado (6 dígitos)
 *   "cantidad": 1,            // Cantidad de números (normalmente 1)
 *   "valor": 5000,            // Valor unitario del número
 *   "total": 5000             // Total a pagar (valor * cantidad)
 * }
 */
router.post('/crear-completa', async (req, res) => {
  try {
    const ventaCompleta = await ventaModel.crearVentaCompleta(req.body);
    res.status(201).json({ 
      status: 'success', 
      message: 'Venta creada exitosamente con todos los premios asignados',
      data: ventaCompleta 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

/**
 * POST /api/ventas/crear-lote
 * Crea múltiples ventas en un solo proceso optimizado
 * Body: { id_usuario, id_rifas, ventas: [{numero, cantidad, valor, total}] }
 */
router.post('/crear-lote', async (req, res) => {
  try {
    const { id_usuario, id_rifas, ventas } = req.body;
    
    if (!ventas || ventas.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Debe incluir al menos una venta'
      });
    }
    
    const resultado = await ventaModel.crearVentasLote({
      id_usuario,
      id_rifas,
      ventas
    });
    
    // Obtener las ventas creadas desde la BD con todos los datos
    const [ventasCreadas] = await pool.execute(
      `SELECT v.*, u.nombre as vendedor_nombre, u.telefono as vendedor_telefono, u.foto_perfil as vendedor_foto_perfil,
              r.id_tipo, r.descripcion as rifa_descripcion, r.fecha_hora_juego,
              t.nombre as tipo_nombre
       FROM venta v
       JOIN usuario u ON v.id_usuario = u.id
       JOIN rifa r ON v.id_rifas = r.id
       JOIN tipo_rifa t ON r.id_tipo = t.id
       WHERE v.id_factura = ?`,
      [resultado.id_factura]
    );
    
    res.status(201).json({
      status: 'success',
      message: `${ventas.length} ventas creadas exitosamente`,
      factura: resultado.numeroFactura,
      ventas_creadas: resultado.ventasCreadas,
      ventas: ventasCreadas
    });
  } catch (error) {
    console.error('Error en crear-lote:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Crear venta (método simple, sin proceso completo)
router.post('/', async (req, res) => {
  try {
    const ventaId = await ventaModel.createVenta(req.body);
    res.status(201).json({ status: 'success', data: { id: ventaId } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener venta por ID
router.get('/:id', async (req, res) => {
  try {
    const venta = await ventaModel.getVentaById(req.params.id);
    if (!venta) {
      return res.status(404).json({ status: 'error', message: 'Venta no encontrada' });
    }
    res.json({ status: 'success', data: venta });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener todas las ventas
router.get('/', async (req, res) => {
  try {
    const ventas = await ventaModel.getAllVentas();
    res.json({ status: 'success', data: ventas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener ventas por usuario
router.get('/usuario/:id_usuario', async (req, res) => {
  try {
    const ventas = await ventaModel.getVentasByUsuario(req.params.id_usuario);
    res.json({ status: 'success', data: ventas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener ventas por rifa
router.get('/rifa/:id_rifa', async (req, res) => {
  try {
    const ventas = await ventaModel.getVentasByRifa(req.params.id_rifa);
    res.json({ status: 'success', data: ventas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener ventas por factura
router.get('/factura/:id_factura', async (req, res) => {
  try {
    const ventas = await ventaModel.getVentasByFactura(req.params.id_factura);
    res.json({ status: 'success', data: ventas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Verificar si número está vendido
router.get('/verificar/:id_rifa/:numero', async (req, res) => {
  try {
    const vendido = await ventaModel.isNumeroVendido(req.params.id_rifa, req.params.numero);
    res.json({ status: 'success', data: { vendido } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener números vendidos de una rifa
router.get('/numeros-vendidos/:id_rifa', async (req, res) => {
  try {
    const numeros = await ventaModel.getNumerosVendidos(req.params.id_rifa);
    res.json({ status: 'success', data: numeros });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener ventas no pagadas
router.get('/no-pagadas/todas', async (req, res) => {
  try {
    const ventas = await ventaModel.getVentasNoPagadas();
    res.json({ status: 'success', data: ventas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener ventas no eliminadas
router.get('/activas/todas', async (req, res) => {
  try {
    const ventas = await ventaModel.getVentasNoEliminadas();
    res.json({ status: 'success', data: ventas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Marcar venta como pagada
router.put('/:id/pagar', async (req, res) => {
  try {
    const updated = await ventaModel.marcarVentaPagada(req.params.id);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Venta no encontrada' });
    }
    res.json({ status: 'success', message: 'Venta marcada como pagada' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar venta (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await ventaModel.deleteVenta(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Venta no encontrada' });
    }
    res.json({ status: 'success', message: 'Venta eliminada' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Restaurar venta eliminada
router.put('/:id/restaurar', async (req, res) => {
  try {
    const restored = await ventaModel.restaurarVenta(req.params.id);
    if (!restored) {
      return res.status(404).json({ status: 'error', message: 'Venta no encontrada' });
    }
    res.json({ status: 'success', message: 'Venta restaurada' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Estadísticas de ventas por usuario
router.get('/estadisticas/usuario/:id_usuario', async (req, res) => {
  try {
    const stats = await ventaModel.getVentasStatsUsuario(req.params.id_usuario);
    res.json({ status: 'success', data: stats });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ventas por rango de fechas
router.get('/rango-fechas/:fecha_inicio/:fecha_fin', async (req, res) => {
  try {
    const ventas = await ventaModel.getVentasByDateRange(req.params.fecha_inicio, req.params.fecha_fin);
    res.json({ status: 'success', data: ventas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Total de ventas por rifa
router.get('/total/:id_rifa', async (req, res) => {
  try {
    const total = await ventaModel.getTotalVentasByRifa(req.params.id_rifa);
    res.json({ status: 'success', data: { total } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener facturas del vendedor
router.get('/facturas/vendedor/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;
    
    // Obtener todas las facturas únicas del vendedor con información resumida
    const [facturas] = await pool.execute(
      `SELECT 
        f.id,
        f.factura,
        MIN(v.created_at) as created_at,
        COUNT(v.id) as total_items,
        SUM(v.total) as monto_total,
        r.descripcion as rifa_descripcion,
        t.nombre as tipo_nombre,
        DATE_FORMAT(r.fecha_hora_juego, '%Y-%m-%d %H:%i:%s') as fecha_hora_juego
      FROM factura f
      INNER JOIN venta v ON v.id_factura = f.id
      INNER JOIN rifa r ON v.id_rifas = r.id
      INNER JOIN tipo_rifa t ON r.id_tipo = t.id
      WHERE f.id_usuario = ?
      GROUP BY f.id, f.factura, r.descripcion, t.nombre, r.fecha_hora_juego
      ORDER BY f.id DESC`,
      [id_usuario]
    );
    
    res.json({ status: 'success', data: facturas });
  } catch (error) {
    console.error('Error obteniendo facturas del vendedor:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener detalles completos de una factura para reimpresión
router.get('/factura/:id_factura/detalles', async (req, res) => {
  try {
    const { id_factura } = req.params;
    
    // Obtener información de la factura
    const [facturaInfo] = await pool.execute(
      'SELECT * FROM factura WHERE id = ?',
      [id_factura]
    );
    
    if (facturaInfo.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Factura no encontrada' });
    }
    
    // Obtener todas las ventas de la factura con JOINs
    const [ventas] = await pool.execute(
      `SELECT v.*, 
              u.nombre as vendedor_nombre, 
              u.telefono as vendedor_telefono,
              r.id_tipo, 
              r.descripcion as rifa_descripcion, 
              DATE_FORMAT(r.fecha_hora_juego, '%Y-%m-%d %H:%i:%s') as fecha_hora_juego,
              t.nombre as tipo_nombre
       FROM venta v
       JOIN usuario u ON v.id_usuario = u.id
       JOIN rifa r ON v.id_rifas = r.id
       JOIN tipo_rifa t ON r.id_tipo = t.id
       WHERE v.id_factura = ?`,
      [id_factura]
    );
    
    if (ventas.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No se encontraron ventas para esta factura' });
    }
    
    res.json({ 
      status: 'success', 
      data: {
        factura: facturaInfo[0],
        ventas: ventas
      }
    });
  } catch (error) {
    console.error('Error obteniendo detalles de factura:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener historial de ventas del vendedor con detalles
router.get('/historial/vendedor/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { fecha_inicio, fecha_fin, id_rifa, limite = '500' } = req.query;
    
    // Validar y convertir límite a número
    const limiteNum = Math.min(Math.max(parseInt(limite) || 500, 1), 1000);
    
    console.log(`📊 Cargando historial del vendedor ${id_usuario} (límite: ${limiteNum})...`);
    
    let query = `
      SELECT 
        v.id,
        v.numero,
        v.cantidad,
        v.valor,
        v.total,
        v.fecha as fecha_juego,
        v.created_at as fecha_venta,
        f.id as factura_id,
        f.factura as numero_factura,
        r.descripcion as rifa_descripcion,
        r.fecha_hora_juego,
        t.nombre as tipo_nombre,
        v.premio_01, v.premio_02, v.premio_03, v.premio_04, v.premio_05,
        v.premio_06, v.premio_07, v.premio_08, v.premio_09, v.premio_10
      FROM venta v
      INNER JOIN factura f ON v.id_factura = f.id
      INNER JOIN rifa r ON v.id_rifas = r.id
      INNER JOIN tipo_rifa t ON r.id_tipo = t.id
      WHERE v.id_usuario = ? AND v.eliminada = 0
    `;
    
    const params = [id_usuario];
    
    if (fecha_inicio && fecha_fin) {
      query += ' AND DATE(v.created_at) BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    }
    
    if (id_rifa) {
      query += ' AND v.id_rifas = ?';
      params.push(id_rifa);
    }
    
    query += ` ORDER BY v.created_at DESC LIMIT ${limiteNum}`;
    
    const [ventas] = await pool.execute(query, params);
    
    console.log(`✅ Historial cargado: ${ventas.length} registros`);
    
    res.json({ status: 'success', data: ventas });
  } catch (error) {
    console.error('❌ Error obteniendo historial del vendedor:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ===================== ELIMINAR Y RESTAURAR VENTAS =====================

/**
 * POST /api/ventas/factura/:id_factura/eliminar
 * Marca todas las ventas de una factura como eliminadas (soft delete)
 * Solo permite eliminar si la rifa no ha llegado a su fecha de juego
 */
router.post('/factura/:id_factura/eliminar', async (req, res) => {
  try {
    const { id_factura } = req.params;
    
    // Obtener todas las ventas de esta factura
    const [ventas] = await pool.execute(
      'SELECT v.id, v.id_rifas, v.eliminada FROM venta v WHERE v.id_factura = ?',
      [id_factura]
    );
    
    if (ventas.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'No se encontraron ventas para esta factura' 
      });
    }
    
    // Verificar que ninguna esté ya eliminada
    const yaEliminadas = ventas.filter(v => v.eliminada === 1);
    if (yaEliminadas.length > 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Esta factura ya está eliminada' 
      });
    }
    
    // Obtener la rifa de la primera venta (todas deben ser de la misma rifa)
    const id_rifa = ventas[0].id_rifas;
    
    // Verificar fecha de juego
    const [resultado] = await pool.execute(
      `SELECT 
        fecha_hora_juego,
        NOW() as fecha_actual,
        CASE WHEN fecha_hora_juego > NOW() THEN 1 ELSE 0 END as puede_eliminar
       FROM rifa 
       WHERE id = ?`,
      [id_rifa]
    );
    
    if (resultado.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Rifa no encontrada' 
      });
    }
    
    const rifaInfo = resultado[0];
    
    if (rifaInfo.puede_eliminar === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No se puede eliminar esta factura. La rifa ya alcanzó su fecha de juego.' 
      });
    }
    
    // Eliminar todas las ventas de la factura
    await pool.execute(
      'UPDATE venta SET eliminada = 1, fecha_eliminada = NOW(), updated_at = NOW() WHERE id_factura = ?',
      [id_factura]
    );
    
    res.json({ 
      status: 'success', 
      message: `Factura eliminada correctamente (${ventas.length} ventas)` 
    });
  } catch (error) {
    console.error('Error eliminando factura:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * POST /api/ventas/:id/eliminar
 * Marca una venta como eliminada (soft delete)
 * Solo permite eliminar si la rifa no ha llegado a su fecha de juego
 */
router.post('/:id/eliminar', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la venta existe
    const venta = await ventaModel.getVentaById(id);
    if (!venta) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Venta no encontrada' 
      });
    }
    
    // Verificar que no esté ya eliminada
    if (venta.eliminada) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'La venta ya está eliminada' 
      });
    }
    
    // Obtener la fecha de juego de la rifa y compararla directamente en MySQL
    const [resultado] = await pool.execute(
      `SELECT 
        fecha_hora_juego,
        NOW() as fecha_actual,
        CASE WHEN fecha_hora_juego > NOW() THEN 1 ELSE 0 END as puede_eliminar
       FROM rifa 
       WHERE id = ?`,
      [venta.id_rifas]
    );
    
    if (resultado.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Rifa no encontrada' 
      });
    }
    
    const rifaInfo = resultado[0];
    
    console.log('=== VALIDACIÓN DE FECHA PARA ELIMINAR VENTA ===');
    console.log('📅 Fecha de juego (BD):', rifaInfo.fecha_hora_juego);
    console.log('📅 Fecha actual (BD):', rifaInfo.fecha_actual);
    console.log('⏰ Puede eliminar (1=sí, 0=no):', rifaInfo.puede_eliminar);
    console.log('🔍 Comparación: fecha_hora_juego > NOW()');
    console.log('===============================================');
    
    // Validar que la fecha de juego no haya pasado (comparación hecha en MySQL)
    if (rifaInfo.puede_eliminar === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No se puede eliminar esta venta. La rifa ya alcanzó su fecha de juego.' 
      });
    }
    
    // Eliminar venta
    const eliminado = await ventaModel.deleteVenta(id);
    
    if (!eliminado) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'No se pudo eliminar la venta' 
      });
    }
    
    res.json({ 
      status: 'success', 
      message: 'Venta eliminada correctamente' 
    });
  } catch (error) {
    console.error('Error eliminando venta:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * POST /api/ventas/factura/:id_factura/restaurar
 * Restaura todas las ventas de una factura eliminada
 */
router.post('/factura/:id_factura/restaurar', async (req, res) => {
  try {
    const { id_factura } = req.params;
    
    // Obtener todas las ventas eliminadas de esta factura
    const [ventas] = await pool.execute(
      'SELECT id, eliminada FROM venta WHERE id_factura = ? AND eliminada = 1',
      [id_factura]
    );
    
    if (ventas.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'No se encontraron ventas eliminadas para esta factura' 
      });
    }
    
    // Restaurar todas las ventas de la factura
    await pool.execute(
      'UPDATE venta SET eliminada = 0, fecha_eliminada = NULL, updated_at = NOW() WHERE id_factura = ?',
      [id_factura]
    );
    
    res.json({ 
      status: 'success', 
      message: `Factura restaurada correctamente (${ventas.length} ventas)` 
    });
  } catch (error) {
    console.error('Error restaurando factura:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * POST /api/ventas/:id/restaurar
 * Restaura una venta eliminada
 */
router.post('/:id/restaurar', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la venta existe
    const venta = await ventaModel.getVentaById(id);
    if (!venta) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Venta no encontrada' 
      });
    }
    
    // Verificar que esté eliminada
    if (!venta.eliminada) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'La venta no está eliminada' 
      });
    }
    
    // Restaurar venta
    const restaurado = await ventaModel.restoreVenta(id);
    
    if (!restaurado) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'No se pudo restaurar la venta' 
      });
    }
    
    res.json({ 
      status: 'success', 
      message: 'Venta restaurada correctamente' 
    });
  } catch (error) {
    console.error('Error restaurando venta:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * GET /api/ventas/eliminadas/todas
 * Obtiene todas las ventas eliminadas (admin)
 */
router.get('/eliminadas/todas', async (req, res) => {
  try {
    const ventas = await ventaModel.getVentasEliminadas();
    res.json({ status: 'success', data: ventas });
  } catch (error) {
    console.error('Error obteniendo ventas eliminadas:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * GET /api/ventas/eliminadas/vendedor/:id_usuario
 * Obtiene las ventas eliminadas de un vendedor específico
 */
router.get('/eliminadas/vendedor/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;
    
    const [ventas] = await pool.execute(
      `SELECT 
        v.id,
        v.numero,
        v.cantidad,
        v.valor,
        v.total,
        v.fecha_eliminada,
        v.created_at as fecha_venta,
        v.id_factura,
        f.id as factura_id,
        f.factura as numero_factura,
        r.descripcion as rifa_descripcion,
        r.fecha_hora_juego,
        t.nombre as tipo_nombre
      FROM venta v
      INNER JOIN factura f ON v.id_factura = f.id
      INNER JOIN rifa r ON v.id_rifas = r.id
      INNER JOIN tipo_rifa t ON r.id_tipo = t.id
      WHERE v.id_usuario = ? AND v.eliminada = 1
      ORDER BY v.fecha_eliminada DESC`,
      [id_usuario]
    );
    
    res.json({ status: 'success', data: ventas });
  } catch (error) {
    console.error('Error obteniendo ventas eliminadas del vendedor:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
