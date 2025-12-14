import pool from '../database/connection.js';

// ===================== CRUD VENTAS =====================

// Crear nueva venta
export const createVenta = async (ventaData) => {
  const {
    id_usuario,
    id_rifas,
    id_factura,
    numero,
    cantidad,
    valor,
    total,
    premio_01,
    premio_02,
    premio_03,
    premio_04,
    premio_05,
    premio_06,
    premio_07,
    premio_08,
    premio_09,
    premio_10,
    factura
  } = ventaData;

  const [result] = await pool.execute(
    `INSERT INTO venta (
      id_usuario, id_rifas, id_factura, fecha, numero, cantidad, valor, total,
      premio_01, premio_02, premio_03, premio_04, premio_05,
      premio_06, premio_07, premio_08, premio_09, premio_10,
      created_at, updated_at, eliminada, pagada, factura
    ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 0, 0, ?)`,
    [
      id_usuario, id_rifas, id_factura, numero, cantidad, valor, total,
      premio_01 || null, premio_02 || null, premio_03 || null, premio_04 || null, premio_05 || null,
      premio_06 || null, premio_07 || null, premio_08 || null, premio_09 || null, premio_10 || null,
      factura || null
    ]
  );

  return result.insertId;
};

// Obtener venta por ID
export const getVentaById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM venta WHERE id = ?',
    [id]
  );
  return rows[0];
};

// Obtener todas las ventas de un usuario
export const getVentasByUsuario = async (id_usuario) => {
  const [rows] = await pool.execute(
    `SELECT v.*, r.descripcion as rifa_nombre, r.fecha_hora_juego
     FROM venta v
     LEFT JOIN rifa r ON v.id_rifas = r.id
     WHERE v.id_usuario = ? AND v.eliminada = 0
     ORDER BY v.created_at DESC`,
    [id_usuario]
  );
  return rows;
};

// Obtener ventas por rifa
export const getVentasByRifa = async (id_rifas) => {
  const [rows] = await pool.execute(
    `SELECT v.*, u.nombre as usuario_nombre, u.correo
     FROM venta v
     JOIN usuario u ON v.id_usuario = u.id
     WHERE v.id_rifas = ? AND v.eliminada = 0
     ORDER BY v.created_at DESC`,
    [id_rifas]
  );
  return rows;
};

// Obtener ventas por factura
export const getVentasByFactura = async (id_factura) => {
  const [rows] = await pool.execute(
    `SELECT v.*, r.descripcion as rifa_nombre
     FROM venta v
     LEFT JOIN rifa r ON v.id_rifas = r.id
     WHERE v.id_factura = ? AND v.eliminada = 0
     ORDER BY v.created_at DESC`,
    [id_factura]
  );
  return rows;
};

// Obtener ventas por número
export const getVentasByNumero = async (id_rifas, numero) => {
  const [rows] = await pool.execute(
    `SELECT v.*, u.nombre as usuario_nombre
     FROM venta v
     JOIN usuario u ON v.id_usuario = u.id
     WHERE v.id_rifas = ? AND v.numero = ? AND v.eliminada = 0`,
    [id_rifas, numero]
  );
  return rows;
};

// Verificar si un número ya está vendido
export const isNumeroVendido = async (id_rifas, numero) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM venta WHERE id_rifas = ? AND numero = ? AND eliminada = 0 AND pagada = 1',
    [id_rifas, numero]
  );
  return rows[0].total > 0;
};

// Marcar venta como pagada
export const marcarVentaPagada = async (id) => {
  const [result] = await pool.execute(
    'UPDATE venta SET pagada = 1, fecha_pago = NOW(), updated_at = NOW() WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};

// Eliminar venta (soft delete)
export const deleteVenta = async (id) => {
  const [result] = await pool.execute(
    'UPDATE venta SET eliminada = 1, fecha_eliminada = NOW(), updated_at = NOW() WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};

// Restaurar venta eliminada
export const restoreVenta = async (id) => {
  const [result] = await pool.execute(
    'UPDATE venta SET eliminada = 0, fecha_eliminada = NULL, updated_at = NOW() WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};

// Obtener ventas eliminadas
export const getVentasEliminadas = async () => {
  const [rows] = await pool.execute(
    `SELECT v.*, 
            u.nombre as usuario_nombre, 
            u.correo as usuario_correo,
            f.id as factura_id,
            f.factura as numero_factura,
            r.descripcion as rifa_nombre,
            r.fecha_hora_juego,
            t.nombre as tipo_rifa
     FROM venta v
     JOIN usuario u ON v.id_usuario = u.id
     LEFT JOIN factura f ON v.id_factura = f.id
     LEFT JOIN rifa r ON v.id_rifas = r.id
     LEFT JOIN tipo_rifa t ON r.id_tipo = t.id
     WHERE v.eliminada = 1
     ORDER BY v.fecha_eliminada DESC`
  );
  return rows;
};

// Obtener ventas no pagadas
export const getVentasNoPagadas = async (id_usuario = null) => {
  let query = `SELECT v.*, u.nombre as usuario_nombre, r.descripcion as rifa_nombre
               FROM venta v
               JOIN usuario u ON v.id_usuario = u.id
               LEFT JOIN rifa r ON v.id_rifas = r.id
               WHERE v.pagada = 0 AND v.eliminada = 0`;
  const params = [];

  if (id_usuario) {
    query += ' AND v.id_usuario = ?';
    params.push(id_usuario);
  }

  query += ' ORDER BY v.created_at DESC';

  const [rows] = await pool.execute(query, params);
  return rows;
};

// Obtener ventas pagadas
export const getVentasPagadas = async (id_usuario = null) => {
  let query = `SELECT v.*, u.nombre as usuario_nombre, r.descripcion as rifa_nombre
               FROM venta v
               JOIN usuario u ON v.id_usuario = u.id
               LEFT JOIN rifa r ON v.id_rifas = r.id
               WHERE v.pagada = 1 AND v.eliminada = 0`;
  const params = [];

  if (id_usuario) {
    query += ' AND v.id_usuario = ?';
    params.push(id_usuario);
  }

  query += ' ORDER BY v.fecha_pago DESC';

  const [rows] = await pool.execute(query, params);
  return rows;
};

// Contar ventas por rifa
export const countVentasByRifa = async (id_rifas) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM venta WHERE id_rifas = ? AND eliminada = 0',
    [id_rifas]
  );
  return rows[0].total;
};

// Sumar total vendido por rifa
export const sumTotalByRifa = async (id_rifas) => {
  const [rows] = await pool.execute(
    'SELECT COALESCE(SUM(total), 0) as total_vendido FROM venta WHERE id_rifas = ? AND eliminada = 0 AND pagada = 1',
    [id_rifas]
  );
  return rows[0].total_vendido;
};

// Obtener números vendidos de una rifa
export const getNumerosVendidos = async (id_rifas) => {
  const [rows] = await pool.execute(
    'SELECT numero FROM venta WHERE id_rifas = ? AND eliminada = 0 AND pagada = 1 ORDER BY numero',
    [id_rifas]
  );
  return rows.map(row => row.numero);
};

// Obtener estadísticas de ventas por usuario
export const getVentasStatsUsuario = async (id_usuario) => {
  const [rows] = await pool.execute(
    `SELECT 
      COUNT(*) as total_ventas,
      SUM(CASE WHEN pagada = 1 THEN 1 ELSE 0 END) as ventas_pagadas,
      SUM(CASE WHEN pagada = 0 THEN 1 ELSE 0 END) as ventas_pendientes,
      COALESCE(SUM(CASE WHEN pagada = 1 THEN total ELSE 0 END), 0) as total_pagado,
      COALESCE(SUM(CASE WHEN pagada = 0 THEN total ELSE 0 END), 0) as total_pendiente
     FROM venta 
     WHERE id_usuario = ? AND eliminada = 0`,
    [id_usuario]
  );
  return rows[0];
};

// Obtener ventas por rango de fechas
export const getVentasByDateRange = async (fecha_inicio, fecha_fin) => {
  const [rows] = await pool.execute(
    `SELECT v.*, u.nombre as usuario_nombre, r.descripcion as rifa_nombre
     FROM venta v
     JOIN usuario u ON v.id_usuario = u.id
     LEFT JOIN rifa r ON v.id_rifas = r.id
     WHERE v.fecha BETWEEN ? AND ? AND v.eliminada = 0
     ORDER BY v.fecha DESC`,
    [fecha_inicio, fecha_fin]
  );
  return rows;
};

// Actualizar venta
export const updateVenta = async (id, ventaData) => {
  const { cantidad, valor, total } = ventaData;
  
  const [result] = await pool.execute(
    'UPDATE venta SET cantidad = ?, valor = ?, total = ?, updated_at = NOW() WHERE id = ?',
    [cantidad, valor, total, id]
  );
  
  return result.affectedRows > 0;
};

// ===================== PROCESO COMPLETO DE VENTA =====================

/**
 * Función completa para crear una venta con todo el proceso:
 * 1. Obtiene el último número de factura del usuario (si no tiene, empieza en 10001)
 * 2. Crea una nueva factura con el número incrementado
 * 3. Busca los premios de la rifa en opciones_premios (uno por cada nivel del 1 al 10)
 * 4. Crea la venta con todos los datos incluyendo los 10 premios
 * 5. Retorna la venta creada completa
 * 
 * @param {Object} ventaData - { id_usuario, id_rifas, numero, cantidad, valor, total }
 * @returns {Object} - Venta creada con toda la información
 */
export const crearVentaCompleta = async (ventaData) => {
  const connection = await pool.getConnection();
  
  try {
    // Iniciar transacción para garantizar que todo se ejecute correctamente
    await connection.beginTransaction();
    
    const { id_usuario, id_rifas, numero, cantidad, valor, total } = ventaData;
    
    // PASO 1: Obtener el último número de factura del usuario
    const [ultimaFactura] = await connection.execute(
      'SELECT MAX(factura) as ultima_factura FROM factura WHERE id_usuario = ?',
      [id_usuario]
    );
    
    // Si no tiene facturas, empieza en 10001, si tiene, incrementa en 1
    const numeroFactura = ultimaFactura[0].ultima_factura 
      ? parseInt(ultimaFactura[0].ultima_factura) + 1 
      : 10001;
    
    // PASO 2: Crear la nueva factura
    const [resultFactura] = await connection.execute(
      'INSERT INTO factura (factura, id_usuario) VALUES (?, ?)',
      [numeroFactura, id_usuario]
    );
    
    const id_factura = resultFactura.insertId;
    
    // PASO 3: Obtener el tipo de rifa para buscar los premios
    const [rifaInfo] = await connection.execute(
      'SELECT id_tipo FROM rifa WHERE id = ?',
      [id_rifas]
    );
    
    if (rifaInfo.length === 0) {
      throw new Error('La rifa especificada no existe');
    }
    
    const id_tipo_rifa = rifaInfo[0].id_tipo;
    
    // PASO 3.1: Obtener el área del usuario
    const [usuarioInfo] = await connection.execute(
      'SELECT id_area FROM usuario WHERE id = ?',
      [id_usuario]
    );
    
    if (usuarioInfo.length === 0 || !usuarioInfo[0].id_area) {
      throw new Error('El usuario no tiene un área asignada');
    }
    
    const id_area = usuarioInfo[0].id_area;
    const cantidadDigitos = String(numero).length;
    
    // PASO 3.2: Buscar los premios según: tipo_rifa, área, saldo_ganado (valor) y dígitos
    const [premiosDisponibles] = await connection.execute(
      `SELECT nivel_premio, valor_premio, saldo_ganado 
       FROM opciones_premios 
       WHERE id_tipo_rifa = ? 
       AND id_area = ?
       AND saldo_ganado = ?
       AND digitos = ?
       ORDER BY nivel_premio ASC`,
      [id_tipo_rifa, id_area, valor, cantidadDigitos]
    );
    
    // Función para multiplicar premios por cantidad
    const multiplicarPremio = (valorPremio, cantidad) => {
      if (!valorPremio) return null;
      
      // Si es un número, multiplicar
      const numPremio = parseFloat(valorPremio);
      if (!isNaN(numPremio)) {
        return (numPremio * cantidad).toFixed(2);
      }
      
      // Si es texto, agregar "xN" al final
      if (cantidad > 1) {
        return `${valorPremio} x${cantidad}`;
      }
      return valorPremio;
    };
    
    // Crear objeto con los premios organizados por nivel
    const premiosPorNivel = {};
    premiosDisponibles.forEach(premio => {
      if (!premiosPorNivel[premio.nivel_premio]) {
        premiosPorNivel[premio.nivel_premio] = multiplicarPremio(premio.valor_premio, cantidad);
      }
    });
    
    // PASO 3.3: Asignar los premios del nivel 1 al 10 a las columnas premio_01 a premio_10
    const premio_01 = premiosPorNivel[1] || null;
    const premio_02 = premiosPorNivel[2] || null;
    const premio_03 = premiosPorNivel[3] || null;
    const premio_04 = premiosPorNivel[4] || null;
    const premio_05 = premiosPorNivel[5] || null;
    const premio_06 = premiosPorNivel[6] || null;
    const premio_07 = premiosPorNivel[7] || null;
    const premio_08 = premiosPorNivel[8] || null;
    const premio_09 = premiosPorNivel[9] || null;
    const premio_10 = premiosPorNivel[10] || null;
    
    // PASO 4: Crear la venta con todos los datos
    const [resultVenta] = await connection.execute(
      `INSERT INTO venta (
        id_usuario, id_rifas, id_factura, fecha, numero, cantidad, valor, total,
        premio_01, premio_02, premio_03, premio_04, premio_05,
        premio_06, premio_07, premio_08, premio_09, premio_10,
        created_at, updated_at, eliminada, pagada, factura
      ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 0, 0, ?)`,
      [
        id_usuario, id_rifas, id_factura, numero, cantidad, valor, total,
        premio_01, premio_02, premio_03, premio_04, premio_05,
        premio_06, premio_07, premio_08, premio_09, premio_10,
        numeroFactura
      ]
    );
    
    // Confirmar la transacción
    await connection.commit();
    
    // PASO 5: Retornar la venta creada con toda la información
    const [ventaCreada] = await connection.execute(
      'SELECT * FROM venta WHERE id_factura = ? ORDER BY id DESC LIMIT 1',
      [id_factura]
    );
    
    return ventaCreada[0];
    
  } catch (error) {
    // Si hay error, revertir toda la transacción
    await connection.rollback();
    throw error;
  } finally {
    // Liberar la conexión
    connection.release();
  }
};

/**
 * Crear múltiples ventas en lote de forma optimizada
 * @param {Object} data - { id_usuario, id_rifas, ventas: [{numero, cantidad, valor, total}] }
 */
export const crearVentasLote = async (data) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id_usuario, id_rifas, ventas } = data;
    
    // PASO 1: Generar número de factura
    const [ultimaFactura] = await connection.execute(
      'SELECT MAX(factura) as ultima_factura FROM factura WHERE id_usuario = ?',
      [id_usuario]
    );
    
    const numeroFactura = ultimaFactura[0].ultima_factura 
      ? parseInt(ultimaFactura[0].ultima_factura) + 1 
      : 10001;
    
    // PASO 2: Crear factura
    const [resultFactura] = await connection.execute(
      'INSERT INTO factura (factura, id_usuario) VALUES (?, ?)',
      [numeroFactura, id_usuario]
    );
    
    const id_factura = resultFactura.insertId;
    
    // PASO 3: Obtener información común (tipo de rifa, área del usuario)
    const [rifaInfo] = await connection.execute(
      'SELECT id_tipo FROM rifa WHERE id = ?',
      [id_rifas]
    );
    
    if (rifaInfo.length === 0) {
      throw new Error('Rifa no encontrada');
    }
    
    const [usuarioInfo] = await connection.execute(
      'SELECT id_area FROM usuario WHERE id = ?',
      [id_usuario]
    );
    
    if (usuarioInfo.length === 0 || !usuarioInfo[0].id_area) {
      throw new Error('Usuario sin área asignada');
    }
    
    const id_tipo_rifa = rifaInfo[0].id_tipo;
    const id_area = usuarioInfo[0].id_area;
    
    // PASO 4: Preparar valores para inserción masiva
    const values = [];
    const placeholders = [];
    const ventasConPremios = [];
    
    for (const venta of ventas) {
      const cantidadDigitos = String(venta.numero).length;
      
      // Buscar premios para este tipo de venta
      const [premios] = await connection.execute(
        `SELECT nivel_premio, valor_premio 
         FROM opciones_premios 
         WHERE id_tipo_rifa = ? AND id_area = ? AND saldo_ganado = ? AND digitos = ?
         ORDER BY nivel_premio ASC`,
        [id_tipo_rifa, id_area, venta.valor, cantidadDigitos]
      );
      
      const multiplicarPremio = (valorPremio, cantidad) => {
        if (!valorPremio) return null;
        const numPremio = parseFloat(valorPremio);
        if (!isNaN(numPremio)) {
          return (numPremio * cantidad).toFixed(2);
        }
        return cantidad > 1 ? `${valorPremio} x${cantidad}` : valorPremio;
      };
      
      const premiosPorNivel = {};
      premios.forEach(p => {
        if (!premiosPorNivel[p.nivel_premio]) {
          premiosPorNivel[p.nivel_premio] = multiplicarPremio(p.valor_premio, venta.cantidad);
        }
      });
      
      // Guardar venta con sus premios para devolverla
      ventasConPremios.push({
        numero: venta.numero,
        cantidad: venta.cantidad,
        valor: venta.valor,
        total: venta.total,
        premios: premiosPorNivel
      });
      
      placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 0, 0, ?)');
      values.push(
        id_usuario, id_rifas, id_factura, venta.numero, venta.cantidad, venta.valor, venta.total,
        premiosPorNivel[1] || null,
        premiosPorNivel[2] || null,
        premiosPorNivel[3] || null,
        premiosPorNivel[4] || null,
        premiosPorNivel[5] || null,
        premiosPorNivel[6] || null,
        premiosPorNivel[7] || null,
        premiosPorNivel[8] || null,
        premiosPorNivel[9] || null,
        premiosPorNivel[10] || null,
        numeroFactura
      );
    }
    
    // PASO 5: Inserción masiva (la columna fecha debe venir del trigger BEFORE INSERT)
    // Nota: El trigger debe ser BEFORE INSERT, no AFTER INSERT
    const query = `INSERT INTO venta (
      id_usuario, id_rifas, id_factura, numero, cantidad, valor, total,
      premio_01, premio_02, premio_03, premio_04, premio_05,
      premio_06, premio_07, premio_08, premio_09, premio_10,
      created_at, updated_at, eliminada, pagada, factura
    ) VALUES ${placeholders.join(', ')}`;
    
    await connection.execute(query, values);
    
    await connection.commit();
    
    return {
      numeroFactura,
      ventasCreadas: ventas.length,
      id_factura: id_factura
    };
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
