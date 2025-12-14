import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde el directorio raíz del backend
dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
};

async function ejecutarMigraciones() {
  let connection;
  
  try {
    console.log('🔌 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión establecida');

    // Ejecutar migración 006
    console.log('\n📄 Ejecutando migración 006_fix_numero_ganadores_table.sql...');
    const sql006 = await fs.readFile(path.join(__dirname, '006_fix_numero_ganadores_table.sql'), 'utf8');
    
    const statements006 = sql006
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    for (const statement of statements006) {
      if (statement) {
        try {
          await connection.query(statement);
          console.log('✅ Ejecutado:', statement.substring(0, 60) + '...');
        } catch (err) {
          if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEYNAME') {
            console.log('⚠️  Ya existe:', statement.substring(0, 60) + '...');
          } else {
            throw err;
          }
        }
      }
    }

    // Ejecutar migración 005
    console.log('\n📄 Ejecutando migración 005_fix_ganadores_table.sql...');
    const sql005 = await fs.readFile(path.join(__dirname, '005_fix_ganadores_table.sql'), 'utf8');
    
    const statements005 = sql005
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    for (const statement of statements005) {
      if (statement) {
        try {
          await connection.query(statement);
          console.log('✅ Ejecutado:', statement.substring(0, 60) + '...');
        } catch (err) {
          if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEYNAME') {
            console.log('⚠️  Ya existe:', statement.substring(0, 60) + '...');
          } else {
            throw err;
          }
        }
      }
    }

    // Verificar estructura final
    console.log('\n🔍 Verificando estructura de numero_ganadores...');
    const [columnsNG] = await connection.query('SHOW COLUMNS FROM numero_ganadores');
    console.log('Columnas de numero_ganadores:');
    columnsNG.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Key ? `[${col.Key}]` : ''}`);
    });

    console.log('\n🔍 Verificando estructura de ganadores...');
    const [columnsG] = await connection.query('SHOW COLUMNS FROM ganadores');
    console.log('Columnas de ganadores:');
    columnsG.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Key ? `[${col.Key}]` : ''}`);
    });

    console.log('\n✅ Migraciones completadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

ejecutarMigraciones();
