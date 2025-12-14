import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createTransaccionTable = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rifaparatodos'
  });

  try {
    console.log('📊 Creando tabla transaccion...');

    // Crear tabla transaccion
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`transaccion\` (
        \`id\` int PRIMARY KEY AUTO_INCREMENT,
        \`id_usuario\` int NOT NULL,
        \`id_realizado_por\` int,
        \`tipo\` enum('recarga','retiro') NOT NULL,
        \`monto\` decimal(10,2) NOT NULL,
        \`saldo_anterior\` decimal(10,2) NOT NULL,
        \`saldo_nuevo\` decimal(10,2) NOT NULL,
        \`descripcion\` text,
        \`fecha\` datetime NOT NULL,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`id_usuario\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`id_realizado_por\`) REFERENCES \`usuario\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Tabla transaccion creada exitosamente');

    // Crear índices
    console.log('📊 Creando índices...');
    
    try {
      await connection.execute(`CREATE INDEX idx_transaccion_usuario ON transaccion(id_usuario)`);
    } catch (e) {
      if (e.code !== 'ER_DUP_KEYNAME') throw e;
      console.log('  Índice idx_transaccion_usuario ya existe');
    }
    
    try {
      await connection.execute(`CREATE INDEX idx_transaccion_fecha ON transaccion(fecha)`);
    } catch (e) {
      if (e.code !== 'ER_DUP_KEYNAME') throw e;
      console.log('  Índice idx_transaccion_fecha ya existe');
    }
    
    try {
      await connection.execute(`CREATE INDEX idx_transaccion_tipo ON transaccion(tipo)`);
    } catch (e) {
      if (e.code !== 'ER_DUP_KEYNAME') throw e;
      console.log('  Índice idx_transaccion_tipo ya existe');
    }
    
    console.log('✅ Índices creados exitosamente');
    console.log('🎉 Migración completada');

  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
};

// Ejecutar migración
createTransaccionTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
