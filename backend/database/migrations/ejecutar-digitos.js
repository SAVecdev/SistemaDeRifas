import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '167.88.36.159',
      user: process.env.DB_USER || 'admin_rifas',
      password: process.env.DB_PASSWORD || 'M0n3d4.2024',
      database: process.env.DB_NAME || 'rifaparatodos'
    });

    console.log('✅ Conexión establecida');
    console.log('');
    
    // Verificar si la columna ya existe
    console.log('🔍 Verificando si la columna digitos existe...');
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'opciones_premios' AND COLUMN_NAME = 'digitos'`,
      [process.env.DB_NAME || 'rifaparatodos']
    );

    if (columns.length > 0) {
      console.log('⚠️  La columna digitos ya existe en opciones_premios');
      console.log('No es necesario ejecutar la migración');
    } else {
      console.log('➕ Agregando columna digitos a opciones_premios...');
      
      await connection.execute(
        'ALTER TABLE opciones_premios ADD COLUMN digitos int AFTER id_area'
      );
      
      console.log('✅ Columna digitos agregada exitosamente');
    }

    console.log('');
    console.log('📋 Estructura actual de opciones_premios:');
    const [structure] = await connection.execute('DESCRIBE opciones_premios');
    console.table(structure);

    console.log('');
    console.log('✅ Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error ejecutando la migración:');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('');
      console.log('🔌 Conexión cerrada');
    }
  }
};

runMigration();
