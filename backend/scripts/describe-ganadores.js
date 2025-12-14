import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function describeGanadores() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('🔍 Consultando estructura de la tabla ganadores...\n');

    const [columns] = await connection.execute('DESCRIBE ganadores');
    
    console.log('📋 Columnas de la tabla ganadores:\n');
    console.table(columns);

    const [samples] = await connection.execute('SELECT * FROM ganadores LIMIT 2');
    
    console.log('\n📊 Datos de ejemplo:\n');
    if (samples.length > 0) {
      console.table(samples);
    } else {
      console.log('(No hay datos en la tabla)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

describeGanadores();
