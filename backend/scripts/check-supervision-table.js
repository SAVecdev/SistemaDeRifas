import pool from '../config/database.js';

async function checkSupervisionTable() {
  try {
    console.log('📋 Consultando estructura de la tabla supervision...\n');
    
    const [columns] = await pool.execute('DESCRIBE supervision');
    
    console.log('Columnas de la tabla supervision:');
    console.table(columns);
    
    const [sample] = await pool.execute('SELECT * FROM supervision LIMIT 5');
    console.log('\nDatos de ejemplo:');
    console.table(sample);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkSupervisionTable();
