import pool from '../config/database.js';

/**
 * Obtener clientes del área del vendedor
 */
export const getClientesPorAreaVendedor = async (idVendedor) => {
  const [rows] = await pool.execute(
    `SELECT 
      c.id,
      c.nombre,
      c.telefono,
      c.correo,
      c.saldo,
      c.id_area,
      a.nombre as area,
      (SELECT COUNT(*) FROM venta v WHERE v.id_usuario = c.id AND (v.eliminada IS NULL OR v.eliminada = 0)) as total_compras,
      (SELECT COALESCE(SUM(v.total), 0) FROM venta v WHERE v.id_usuario = c.id AND (v.eliminada IS NULL OR v.eliminada = 0)) as monto_total_compras
    FROM usuario c
    INNER JOIN usuario v ON c.id_area = v.id_area
    LEFT JOIN area a ON c.id_area = a.id
    WHERE v.id = ?
      AND c.rol = 'cliente'
      AND c.activo = 1
    ORDER BY c.nombre ASC`,
    [idVendedor]
  );
  return rows;
};

/**
 * Obtener detalle de un cliente específico
 */
export const getClienteDetalle = async (idCliente, idVendedor) => {
  const [rows] = await pool.execute(
    `SELECT 
      c.id,
      c.nombre,
      c.telefono,
      c.correo,
      c.saldo,
      c.id_area,
      a.nombre as area,
      c.fecha_registro
    FROM usuario c
    INNER JOIN usuario v ON c.id_area = v.id_area
    LEFT JOIN area a ON c.id_area = a.id
    WHERE c.id = ?
      AND v.id = ?
      AND c.rol = 'cliente'
      AND c.activo = 1
    LIMIT 1`,
    [idCliente, idVendedor]
  );
  return rows[0] || null;
};

/**
 * Registrar transacción de recarga o retiro
 */
export const registrarTransaccion = async (idCliente, idVendedor, tipo, monto, descripcion) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Verificar que el cliente pertenece al área del vendedor
    const [cliente] = await connection.execute(
      `SELECT c.id, c.saldo, c.id_area, v.id_area as area_vendedor
       FROM usuario c
       INNER JOIN usuario v ON c.id_area = v.id_area
       WHERE c.id = ? AND v.id = ? AND c.rol = 'cliente'`,
      [idCliente, idVendedor]
    );

    if (cliente.length === 0) {
      throw new Error('Cliente no encontrado o no pertenece a tu área');
    }

    const saldoActual = Number(cliente[0].saldo);
    const montoNum = Number(monto);

    // Calcular nuevo saldo
    let nuevoSaldo;
    if (tipo === 'recarga') {
      nuevoSaldo = saldoActual + montoNum;
    } else if (tipo === 'retiro') {
      if (saldoActual < montoNum) {
        throw new Error('Saldo insuficiente para realizar el retiro');
      }
      nuevoSaldo = saldoActual - montoNum;
    } else {
      throw new Error('Tipo de transacción inválido');
    }

    // Actualizar saldo del cliente
    await connection.execute(
      `UPDATE usuario SET saldo = ? WHERE id = ?`,
      [nuevoSaldo, idCliente]
    );

    // Registrar en tabla transacciones
    await connection.execute(
      `INSERT INTO transaccion (id_usuario, id_realizado_por, tipo, monto, saldo_anterior, saldo_nuevo, descripcion, fecha)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [idCliente, idVendedor, tipo, montoNum, saldoActual, nuevoSaldo, descripcion || `${tipo} realizado por vendedor`]
    );

    await connection.commit();
    
    return {
      success: true,
      message: `${tipo === 'recarga' ? 'Recarga' : 'Retiro'} realizado exitosamente`,
      saldoAnterior: saldoActual,
      saldoNuevo: nuevoSaldo,
      monto: montoNum
    };
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Obtener historial de transacciones de un cliente
 */
export const getTransaccionesCliente = async (idCliente, idVendedor, limite = 20) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        t.id,
        t.tipo,
        t.monto,
        t.saldo_anterior,
        t.saldo_nuevo,
        t.descripcion,
        t.fecha,
        u.nombre as realizado_por
      FROM transaccion t
      INNER JOIN usuario c ON t.id_usuario = c.id
      INNER JOIN usuario v ON c.id_area = v.id_area
      LEFT JOIN usuario u ON t.id_realizado_por = u.id
      WHERE t.id_usuario = ?
        AND v.id = ? ?
      ORDER BY t.fecha DESC
      LIMIT ?`,
      [idCliente, idVendedor, limite]
    );
    return rows;
  } catch (error) {
    console.log('Tabla transaccion no existe, devolviendo array vacío:', error.message);
    // Si la tabla no existe, devolver array vacío
    return [];
  }
};

export default {
  getClientesPorAreaVendedor,
  getClienteDetalle,
  registrarTransaccion,
  getTransaccionesCliente
};
