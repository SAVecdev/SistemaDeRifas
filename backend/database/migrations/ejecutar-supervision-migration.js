import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '..', '..', '.env');
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('⚠️  Error cargando .env:', result.error.message);
}

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
};

async function ejecutarMigracion() {
  let connection;
  
  try {
    console.log('📡 Conectando a la base de datos...');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Database: ${dbConfig.database}`);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión establecida\n');

    console.log('🚀 Ejecutando migración 009_create_supervision_permisos...\n');
    
    // 1. Crear tabla supervision
    console.log('   1/6: Creando tabla supervision...');
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS supervision (
            id INT AUTO_INCREMENT PRIMARY KEY,
            id_supervisor INT NOT NULL,
            id_supervisado INT NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_supervisor) REFERENCES usuario(id) ON DELETE CASCADE,
            FOREIGN KEY (id_supervisado) REFERENCES usuario(id) ON DELETE CASCADE,
            UNIQUE KEY ux_supervision (id_supervisor, id_supervisado)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('   ✅ Tabla supervision creada');
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('   ⚠️  La tabla supervision ya existe');
      } else {
        throw error;
      }
    }

    // 2. Crear tabla permisos
    console.log('   2/6: Creando tabla permisos...');
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS permisos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            id_usuario INT NOT NULL,
            modulo VARCHAR(50) NOT NULL,
            accion VARCHAR(50) NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
            UNIQUE KEY ux_permisos (id_usuario, modulo, accion)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('   ✅ Tabla permisos creada');
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('   ⚠️  La tabla permisos ya existe');
      } else {
        throw error;
      }
    }

    // 3. Crear índices para supervision
    console.log('   3/6: Creando índices para supervision...');
    try {
      await connection.query('CREATE INDEX idx_supervision_supervisor ON supervision(id_supervisor)');
      console.log('   ✅ Índice idx_supervision_supervisor creado');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('   ⚠️  Índice ya existe');
      } else {
        throw error;
      }
    }

    console.log('   4/6: Creando índice supervisado...');
    try {
      await connection.query('CREATE INDEX idx_supervision_supervisado ON supervision(id_supervisado)');
      console.log('   ✅ Índice idx_supervision_supervisado creado');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('   ⚠️  Índice ya existe');
      } else {
        throw error;
      }
    }

    // 4. Crear índices para permisos
    console.log('   5/6: Creando índices para permisos...');
    try {
      await connection.query('CREATE INDEX idx_permisos_usuario ON permisos(id_usuario)');
      console.log('   ✅ Índice idx_permisos_usuario creado');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('   ⚠️  Índice ya existe');
      } else {
        throw error;
      }
    }

    console.log('   6/6: Creando índice modulo...');
    try {
      await connection.query('CREATE INDEX idx_permisos_modulo ON permisos(modulo)');
      console.log('   ✅ Índice idx_permisos_modulo creado');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('   ⚠️  Índice ya existe');
      } else {
        throw error;
      }
    }
    
    console.log('\n✅ Migración completada correctamente\n');

    // Verificar estructura de las tablas
    console.log('🔍 Verificando estructura de las tablas...\n');
    
    const [colsSupervision] = await connection.query("SHOW COLUMNS FROM supervision");
    console.log('📋 Columnas en la tabla supervision:');
    colsSupervision.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}${col.Key ? ` [${col.Key}]` : ''}`);
    });

    const [colsPermisos] = await connection.query("SHOW COLUMNS FROM permisos");
    console.log('\n📋 Columnas en la tabla permisos:');
    colsPermisos.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}${col.Key ? ` [${col.Key}]` : ''}`);
    });

    console.log('\n✅ Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    if (error.sql) {
      console.error('SQL que falló:', error.sql);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

ejecutarMigracion();
