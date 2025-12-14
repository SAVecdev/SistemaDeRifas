import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createImagenesTable = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('📊 Creando tabla imagenes...');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`imagenes\` (
        \`id\` int PRIMARY KEY AUTO_INCREMENT,
        \`nombre\` varchar(255) NOT NULL,
        \`ruta\` varchar(500) NOT NULL,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Tabla imagenes creada exitosamente');
    console.log('🎉 Migración completada');

  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
};

createImagenesTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
