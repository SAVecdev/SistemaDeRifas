import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde la raíz del proyecto backend
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const ejecutarMigracion = async () => {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });
    
    console.log('✅ Conexión establecida');
    
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, '004_fix_trigger_fecha_venta.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📝 Ejecutando migración del trigger...');
    
    // Dividir por DELIMITER y ejecutar cada parte
    const statements = sql.split('DELIMITER');
    
    for (let statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed || trimmed === '$$' || trimmed === ';') continue;
      
      // Limpiar el statement
      let cleanStatement = trimmed.replace(/\$\$/g, '');
      
      if (cleanStatement.trim()) {
        console.log('🔧 Ejecutando:', cleanStatement.substring(0, 50) + '...');
        await connection.query(cleanStatement);
      }
    }
    
    console.log('✅ Trigger actualizado correctamente');
    console.log('');
    console.log('📋 Verificando trigger...');
    
    const [triggers] = await connection.query(
      "SHOW TRIGGERS WHERE `Trigger` = 'trg_actualizar_fecha_venta'"
    );
    
    if (triggers.length > 0) {
      console.log('✅ Trigger encontrado:');
      console.log('   Nombre:', triggers[0].Trigger);
      console.log('   Timing:', triggers[0].Timing);
      console.log('   Event:', triggers[0].Event);
    } else {
      console.log('⚠️ No se encontró el trigger');
    }
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
};

ejecutarMigracion();
