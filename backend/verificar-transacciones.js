import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const verificarTransacciones = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('✅ Conectado a la base de datos:', process.env.DB_NAME);
    console.log('📍 Host:', process.env.DB_HOST);
    
    // Verificar estructura de la tabla
    const [estructura] = await connection.query('DESCRIBE transaccion');
    console.log('\n📋 Estructura de la tabla transaccion:');
    console.table(estructura);
    
    // Ver todas las transacciones
    const [todas] = await connection.query('SELECT * FROM transaccion ORDER BY fecha DESC LIMIT 10');
    console.log('\n📊 Últimas 10 transacciones:');
    console.table(todas);
    
    // Ver transacciones de hoy
    const [hoy] = await connection.query('SELECT * FROM transaccion WHERE DATE(fecha) = CURDATE()');
    console.log('\n📅 Transacciones de HOY:', hoy.length);
    console.table(hoy);
    
    // Estadísticas por vendedor
    const [stats] = await connection.query(`
      SELECT 
        id_realizado_por,
        tipo,
        COUNT(*) as total,
        SUM(monto) as monto_total
      FROM transaccion 
      WHERE DATE(fecha) = CURDATE()
      GROUP BY id_realizado_por, tipo
    `);
    console.log('\n📈 Estadísticas por vendedor HOY:');
    console.table(stats);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
};

verificarTransacciones();
