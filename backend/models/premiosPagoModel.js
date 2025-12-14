import pool from '../config/database.js';

/**
 * Buscar premios por número de factura (solo del vendedor)
 */
export const buscarPremiosPorFactura = async (numeroFactura, idVendedor) => {
  const [rows] = await pool.execute(
    `SELECT 
      g.id_numero_ganador,
      g.id_usuario,
      g.id_factura,
      g.numerol as numero_ganador,
      g.fecha,
      g.saldo_premio,
      g.nivel_premio,
      g.pagada,
      g.fecha_hora_pago,
      u.nombre as cliente,
      u.telefono,
      u.correo,
      f.factura as numero_factura,
      r.fecha_hora_juego,
      DATEDIFF(NOW(), r.fecha_hora_juego) as dias_transcurridos,
      CASE WHEN DATEDIFF(NOW(), r.fecha_hora_juego) > 8 THEN 1 ELSE 0 END as premio_expirado
    FROM ganadores g
    INNER JOIN factura f ON g.id_factura = f.id
    INNER JOIN usuario u ON g.id_usuario = u.id
    INNER JOIN venta v ON f.id = v.id_factura
    INNER JOIN rifa r ON v.id_rifas = r.id
    WHERE f.factura = ?
      AND v.id_usuario = ?
    GROUP BY g.id_numero_ganador, g.id_usuario, g.id_factura, g.numerol, 
             g.fecha, g.saldo_premio, g.nivel_premio, g.pagada, g.fecha_hora_pago,
             u.nombre, u.telefono, u.correo, f.factura, r.fecha_hora_juego
    ORDER BY g.fecha DESC, g.id_numero_ganador ASC`,
    [numeroFactura, idVendedor]
  );
  return rows;
};

/**
 * Obtener premios pagados por vendedor
 */
export const getPremiosPagadosPorVendedor = async (idVendedor, fechaInicio, fechaFin) => {
  const [rows] = await pool.execute(
    `SELECT 
      g.id_numero_ganador,
      g.id_usuario,
      g.id_factura,
      g.numerol as numero_ganador,
      g.fecha,
      g.saldo_premio,
      g.nivel_premio,
      r.fecha_hora_juego,
      DATEDIFF(g.fecha_hora_pago, r.fecha_hora_juego) as dias_para_pago,
      g.fecha_hora_pago,
      u.nombre as cliente,
      u.telefono,
      f.factura as numero_factura,
      v.id_usuario as id_vendedor
    FROM ganadores g
    INNER JOIN factura f ON g.id_factura = f.id
    INNER JOIN usuario u ON g.id_usuario = u.id
    INNER JOIN venta v ON f.id = v.id_factura
    INNER JOIN rifa r ON v.id_rifas = r.id
    WHERE g.pagada = 1 
      AND v.id_usuario = ?
      AND g.fecha BETWEEN ? AND ?
    GROUP BY g.id_numero_ganador, g.id_usuario, g.id_factura, g.numerol, 
             g.fecha, g.saldo_premio, g.nivel_premio, g.fecha_hora_pago,
             u.nombre, u.telefono, f.factura, v.id_usuario, r.fecha_hora_juego
    ORDER BY g.fecha_hora_pago DESC`,
    [idVendedor, fechaInicio, fechaFin]
  );
  return rows;
};

/**
 * Pagar premio (actualiza ganadores y resta del saldo del usuario cliente)
 */
export const pagarPremio = async (idNumeroGanador, idUsuarioCliente, idFactura, numerol, idVendedor) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Verificar que la factura pertenece al vendedor
    const [facturaVendedor] = await connection.execute(
      `SELECT v.id_usuario 
       FROM venta v 
       WHERE v.id_factura = ? 
       LIMIT 1`,
      [idFactura]
    );

    if (facturaVendedor.length === 0 || facturaVendedor[0].id_usuario !== idVendedor) {
      throw new Error('No tienes permiso para pagar premios de esta factura');
    }

    // 2. Obtener el monto del premio y fecha de juego
    const [premios] = await connection.execute(
      `SELECT g.saldo_premio, g.pagada, r.fecha_hora_juego,
              DATEDIFF(NOW(), r.fecha_hora_juego) as dias_transcurridos
       FROM ganadores g
       INNER JOIN venta v ON g.id_factura = v.id_factura AND g.numerol = v.numero
       INNER JOIN rifa r ON v.id_rifas = r.id
       WHERE g.id_numero_ganador = ? 
         AND g.id_usuario = ? 
         AND g.id_factura = ? 
         AND g.numerol = ?`,
      [idNumeroGanador, idUsuarioCliente, idFactura, numerol]
    );

    if (premios.length === 0) {
      throw new Error('Premio no encontrado');
    }

    if (premios[0].pagada === 1) {
      throw new Error('Este premio ya fue pagado');
    }

    // 3. Validar que no han pasado más de 8 días desde el juego
    const diasTranscurridos = premios[0].dias_transcurridos;
    if (diasTranscurridos > 8) {
      throw new Error(`No se puede pagar este premio. Han transcurrido ${diasTranscurridos} días desde el juego (máximo permitido: 8 días)`);
    }

    const montoPremio = Number(premios[0].saldo_premio);

    // 4. Actualizar la tabla ganadores
    await connection.execute(
      `UPDATE ganadores 
       SET pagada = 1, fecha_hora_pago = NOW() 
       WHERE id_numero_ganador = ? 
         AND id_usuario = ? 
         AND id_factura = ? 
         AND numerol = ?`,
      [idNumeroGanador, idUsuarioCliente, idFactura, numerol]
    );

    // 5. Actualizar la tabla venta (marcar como pagada el registro específico)
    await connection.execute(
      `UPDATE venta 
       SET pagada = 1, fecha_pago = NOW() 
       WHERE id_factura = ? 
         AND numero = ?
         AND id_usuario = ?`,
      [idFactura, numerol, idUsuarioCliente]
    );

    // 6. Restar el saldo del usuario cliente
    await connection.execute(
      `UPDATE usuario 
       SET saldo = saldo - ? 
       WHERE id = ?`,
      [montoPremio, idUsuarioCliente]
    );

    await connection.commit();
    
    return {
      success: true,
      message: 'Premio pagado exitosamente',
      monto: montoPremio
    };
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Pagar múltiples premios de una factura
 */
export const pagarMultiplesPremios = async (premios, idVendedor) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    let totalPagado = 0;
    const resultados = [];

    for (const premio of premios) {
      // Verificar que la factura pertenece al vendedor
      const [facturaVendedor] = await connection.execute(
        `SELECT v.id_usuario 
         FROM venta v 
         WHERE v.id_factura = ? 
         LIMIT 1`,
        [premio.idFactura]
      );

      if (facturaVendedor.length === 0 || facturaVendedor[0].id_usuario !== idVendedor) {
        throw new Error(`No tienes permiso para pagar premios de la factura ${premio.idFactura}`);
      }

      // Verificar estado del premio y fecha de juego
      const [premioData] = await connection.execute(
        `SELECT g.saldo_premio, g.pagada, r.fecha_hora_juego,
                DATEDIFF(NOW(), r.fecha_hora_juego) as dias_transcurridos
         FROM ganadores g
         INNER JOIN venta v ON g.id_factura = v.id_factura AND g.numerol = v.numero
         INNER JOIN rifa r ON v.id_rifas = r.id
         WHERE g.id_numero_ganador = ? 
           AND g.id_usuario = ? 
           AND g.id_factura = ? 
           AND g.numerol = ?`,
        [premio.idNumeroGanador, premio.idUsuarioCliente, premio.idFactura, premio.numerol]
      );

      if (premioData.length === 0) {
        throw new Error(`Premio ${premio.numerol} no encontrado`);
      }

      if (premioData[0].pagada === 1) {
        continue; // Ya está pagado, saltarlo
      }

      // Validar que no han pasado más de 8 días
      const diasTranscurridos = premioData[0].dias_transcurridos;
      if (diasTranscurridos > 8) {
        throw new Error(`No se puede pagar el premio ${premio.numerol}. Han transcurrido ${diasTranscurridos} días desde el juego (máximo permitido: 8 días)`);
      }

      const montoPremio = Number(premioData[0].saldo_premio);

      // Actualizar ganadores
      await connection.execute(
        `UPDATE ganadores 
         SET pagada = 1, fecha_hora_pago = NOW() 
         WHERE id_numero_ganador = ? 
           AND id_usuario = ? 
           AND id_factura = ? 
           AND numerol = ?`,
        [premio.idNumeroGanador, premio.idUsuarioCliente, premio.idFactura, premio.numerol]
      );

      // Actualizar venta
      await connection.execute(
        `UPDATE venta 
         SET pagada = 1, fecha_pago = NOW() 
         WHERE id_factura = ? 
           AND numero = ?
           AND id_usuario = ?`,
        [premio.idFactura, premio.numerol, premio.idUsuarioCliente]
      );

      // Restar del saldo del cliente
      await connection.execute(
        `UPDATE usuario 
         SET saldo = saldo - ? 
         WHERE id = ?`,
        [montoPremio, premio.idUsuarioCliente]
      );

      totalPagado += montoPremio;
      resultados.push({ numerol: premio.numerol, monto: montoPremio });
    }

    await connection.commit();
    
    return {
      success: true,
      message: `${resultados.length} premio(s) pagado(s) exitosamente`,
      totalPagado,
      resultados
    };
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  buscarPremiosPorFactura,
  getPremiosPagadosPorVendedor,
  pagarPremio,
  pagarMultiplesPremios
};
