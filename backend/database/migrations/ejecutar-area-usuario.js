import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const runMigration = async () => {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Conexión establecida\n');
    
    // Leer el archivo SQL
    const migrationPath = path.join(__dirname, '003_add_area_usuario.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Ejecutando migración 003_add_area_usuario.sql...\n');
    
    // Dividir por punto y coma y ejecutar cada statement
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    
    for (const statement of statements) {
      await connection.query(statement);
    }
    
    console.log('\n✅ Migración completada exitosamente\n');
    
    // Verificar la estructura
    console.log('📋 Verificando estructura de usuario:');
    const [structure] = await connection.execute('DESCRIBE usuario');
    console.table(structure);

  } catch (error) {
    console.error('❌ Error ejecutando la migración:');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n👋 Conexión cerrada');
    }
  }
};

runMigration();
