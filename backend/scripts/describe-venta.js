import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function describeVenta() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('🔍 Consultando estructura de la tabla venta...\n');

    // Describe table
    const [columns] = await connection.execute('DESCRIBE venta');
    
    console.log('📋 Columnas de la tabla venta:\n');
    console.table(columns);

    // Sample data
    const [samples] = await connection.execute('SELECT * FROM venta LIMIT 3');
    
    console.log('\n📊 Datos de ejemplo:\n');
    if (samples.length > 0) {
      console.table(samples);
    } else {
      console.log('(No hay datos en la tabla)');
    }

    // Check for date columns
    console.log('\n📅 Columnas que contienen "fecha" o "created":\n');
    const dateColumns = columns.filter(col => 
      col.Field.toLowerCase().includes('fecha') || 
      col.Field.toLowerCase().includes('created') ||
      col.Field.toLowerCase().includes('date') ||
      col.Field.toLowerCase().includes('time')
    );
    
    if (dateColumns.length > 0) {
      dateColumns.forEach(col => {
        console.log(`  ✅ ${col.Field} (${col.Type})`);
      });
    } else {
      console.log('  ❌ No se encontraron columnas de fecha/hora');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
    console.log('\n✅ Conexión cerrada');
  }
}

describeVenta();
