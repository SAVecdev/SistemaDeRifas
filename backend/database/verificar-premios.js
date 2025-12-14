import pool from '../database/connection.js';

const verificarDatos = async () => {
  try {
    console.log('🔍 Verificando datos de opciones_premios...\n');
    
    // Ver todos los registros
    const [rows] = await pool.execute('SELECT * FROM opciones_premios LIMIT 10');
    
    if (rows.length === 0) {
      console.log('⚠️ No hay registros en opciones_premios');
    } else {
      console.log('📋 Registros encontrados:');
      console.table(rows);
    }
    
    console.log('\n📊 Total de registros:', rows.length);
    
    // Ver vista consolidada
    console.log('\n🔍 Vista consolidada:');
    const [vista] = await pool.execute('SELECT * FROM vista_premios_consolidada LIMIT 5');
    console.table(vista);
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

verificarDatos();
