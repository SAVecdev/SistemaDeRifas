import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

async function checkGanadores() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('=== ESTRUCTURA DE LA TABLA GANADORES ===\n');
    const [columns] = await connection.execute('DESCRIBE ganadores');
    console.table(columns);

    console.log('\n=== DATOS DE EJEMPLO ===\n');
    const [rows] = await connection.execute('SELECT * FROM ganadores LIMIT 3');
    console.log(`Total registros: ${rows.length}`);
    console.table(rows);

    // Verificar qué columnas de fecha existen
    console.log('\n=== COLUMNAS DE FECHA EN GANADORES ===');
    const dateColumns = columns.filter(col => 
      col.Field.includes('fecha') || col.Field.includes('created') || col.Field.includes('updated')
    );
    console.table(dateColumns);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkGanadores();
