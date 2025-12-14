import pool from '../config/database.js';

/**
 * Obtener estadísticas del dashboard del vendedor
 */
export const getEstadisticasVendedor = async (idVendedor) => {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    console.log('\n📊 === OBTENIENDO ESTADÍSTICAS ===');
    console.log('ID Vendedor:', idVendedor);
    
    // Ventas del día
    let ventasHoy = [{ total_ventas: 0, monto_total: 0 }];
    try {
      const [ventasData] = await connection.execute(
        `SELECT 
          COUNT(*) as total_ventas,
          COALESCE(SUM(total), 0) as monto_total
        FROM venta
        WHERE id_usuario = ?
          AND DATE(fecha) = CURDATE()
          AND (eliminada IS NULL OR eliminada = 0)`,
        [idVendedor]
      );
      ventasHoy = ventasData;
    } catch (error) {
      console.log('Error obteniendo ventas del día:', error.message);
    }
    
    // Ventas del mes
    let ventasMes = [{ total_ventas: 0, monto_total: 0 }];
    try {
      const [ventasData] = await connection.execute(
        `SELECT 
          COUNT(*) as total_ventas,
          COALESCE(SUM(total), 0) as monto_total
        FROM venta
        WHERE id_usuario = ?
          AND YEAR(fecha) = YEAR(CURDATE())
          AND MONTH(fecha) = MONTH(CURDATE())
          AND (eliminada IS NULL OR eliminada = 0)`,
        [idVendedor]
      );
      ventasMes = ventasData;
    } catch (error) {
      console.log('Error obteniendo ventas del mes:', error.message);
    }
    
    // Clientes en el área del vendedor
    let clientes = [{ total: 0 }];
    try {
      const [clientesData] = await connection.execute(
        `SELECT COUNT(*) as total
        FROM usuario c
        INNER JOIN usuario v ON c.id_area = v.id_area
        WHERE v.id = ?
          AND c.rol = 'cliente'
          AND c.activo = 1`,
        [idVendedor]
      );
      clientes = clientesData;
    } catch (error) {
      console.log('Error obteniendo clientes:', error.message);
    }
    
    // Premios pagados del día
    let premiosHoy = [{ total_premios: 0, monto_total: 0 }];
    try {
      const [premiosData] = await connection.execute(
        `SELECT 
          COUNT(*) as total_premios,
          COALESCE(SUM(CAST(g.saldo_premio AS DECIMAL(10,2))), 0) as monto_total
        FROM ganadores g
        WHERE g.id_usuario = ?
          AND DATE(g.fecha_hora_pago) = CURDATE()
          AND g.pagada = 1`,
        [idVendedor]
      );
      premiosHoy = premiosData;
    } catch (error) {
      console.log('Error obteniendo premios:', error.message);
    }
    
    // Recargas del día - usar valores por defecto si la tabla no existe
    let recargasHoy = [{ total_recargas: 0, monto_total: 0 }];
    try {
      console.log('\n💵 Consultando RECARGAS del día...');
      const [recargas] = await connection.execute(
        `SELECT 
          COUNT(*) as total_recargas,
          COALESCE(SUM(t.monto), 0) as monto_total
        FROM transaccion t
        WHERE t.id_realizado_por = ?
          AND t.tipo = 'recarga'
          AND DATE(t.fecha) = CURDATE()`,
        [idVendedor]
      );
      console.log('Recargas encontradas:', recargas);
      recargasHoy = recargas;
    } catch (error) {
      console.log('❌ Error obteniendo recargas:', error.message);
    }
    
    // Retiros/Pagos del día - usar valores por defecto si la tabla no existe
    let retirosHoy = [{ total_retiros: 0, monto_total: 0 }];
    try {
      console.log('\n💸 Consultando RETIROS del día...');
      const [retiros] = await connection.execute(
        `SELECT 
          COUNT(*) as total_retiros,
          COALESCE(SUM(t.monto), 0) as monto_total
        FROM transaccion t
        WHERE t.id_realizado_por = ?
          AND t.tipo = 'retiro'
          AND DATE(t.fecha) = CURDATE()`,
        [idVendedor]
      );
      console.log('Retiros encontrados:', retiros);
      retirosHoy = retiros;
    } catch (error) {
      console.log('❌ Error obteniendo retiros:', error.message);
    }
    
    return {
      ventasHoy: {
        cantidad: ventasHoy[0].total_ventas,
        monto: parseFloat(ventasHoy[0].monto_total)
      },
      ventasMes: {
        cantidad: ventasMes[0].total_ventas,
        monto: parseFloat(ventasMes[0].monto_total)
      },
      clientes: clientes[0].total,
      premiosHoy: {
        cantidad: premiosHoy[0].total_premios,
        monto: parseFloat(premiosHoy[0].monto_total)
      },
      recargasHoy: {
        cantidad: recargasHoy[0].total_recargas,
        monto: parseFloat(recargasHoy[0].monto_total)
      },
      retirosHoy: {
        cantidad: retirosHoy[0].total_retiros,
        monto: parseFloat(retirosHoy[0].monto_total)
      }
    };
  } catch (error) {
    console.error('Error en getEstadisticasVendedor:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * Obtener actividad reciente del vendedor
 */
export const getActividadReciente = async (idVendedor, limite = 10) => {
  let actividades = [];
  
  try {
    // Ventas del día
    const [ventas] = await pool.execute(
      `SELECT 
        'venta' as tipo,
        CONCAT('Venta - Factura #', f.factura, ' - Número ', v.numero) as descripcion,
        v.total as monto,
        u.nombre as usuario,
        CAST(v.fecha AS DATETIME) as fecha
      FROM venta v
      INNER JOIN factura f ON v.id_factura = f.id
      INNER JOIN usuario u ON v.id_usuario = u.id
      WHERE v.id_usuario = ?
        AND DATE(v.fecha) = CURDATE()
        AND (v.eliminada IS NULL OR v.eliminada = 0)
      ORDER BY v.fecha DESC
      LIMIT ?`,
      [idVendedor, limite]
    );
    actividades.push(...ventas);
  } catch (error) {
    console.log('Error obteniendo ventas:', error.message);
  }
  
  try {
    // Premios del día
    const [premios] = await pool.execute(
      `SELECT 
        'premio' as tipo,
        CONCAT('Pago de premio - ', u.nombre) as descripcion,
        CAST(g.saldo_premio AS DECIMAL(10,2)) as monto,
        u.nombre as usuario,
        g.fecha_hora_pago as fecha
      FROM ganadores g
      INNER JOIN usuario u ON g.id_usuario = u.id
      WHERE g.id_usuario = ?
        AND DATE(g.fecha_hora_pago) = CURDATE()
        AND g.pagada = 1
      ORDER BY g.fecha_hora_pago DESC
      LIMIT ?`,
      [idVendedor, limite]
    );
    actividades.push(...premios);
  } catch (error) {
    console.log('Error obteniendo premios:', error.message);
  }
  
  try {
    // Transacciones del día (recargas y retiros)
    const [transacciones] = await pool.execute(
      `SELECT 
        t.tipo as tipo,
        CONCAT(
          CASE WHEN t.tipo = 'recarga' THEN 'Recarga' ELSE 'Retiro' END,
          ' - ', u.nombre
        ) as descripcion,
        t.monto as monto,
        u.nombre as usuario,
        t.fecha as fecha
      FROM transaccion t
      INNER JOIN usuario u ON t.id_usuario = u.id
      WHERE t.id_realizado_por = ?
        AND DATE(t.fecha) = CURDATE()
      ORDER BY t.fecha DESC
      LIMIT ?`,
      [idVendedor, limite]
    );
    actividades.push(...transacciones);
  } catch (error) {
    console.log('Error obteniendo transacciones:', error.message);
  }
  
  // Ordenar todas las actividades por fecha y limitar
  actividades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  return actividades.slice(0, limite);
};
