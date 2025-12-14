import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde el archivo .env en la raíz del backend
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

    console.log('🚀 Agregando trigger de DELETE...\n');
    
    // Crear trigger para DELETE
    console.log('   1/1: Creando tr_eliminar_ganadores_venta...');
    try {
      await connection.query('DROP TRIGGER IF EXISTS tr_eliminar_ganadores_venta');
      await connection.query(`
        CREATE TRIGGER tr_eliminar_ganadores_venta
        AFTER DELETE ON numero_ganadores
        FOR EACH ROW
        BEGIN
            DELETE FROM ganadores
            WHERE id_numero_ganador = OLD.id;
        END
      `);
      console.log('   ✅ Trigger creado');
    } catch (error) {
      throw error;
    }
    
    console.log('\n✅ Trigger de DELETE agregado correctamente\n');

    // Verificar los triggers
    console.log('🔍 Verificando todos los triggers...');
    const [triggers] = await connection.query(
      "SHOW TRIGGERS WHERE `Trigger` LIKE '%ganadores%'"
    );
    
    console.log('\n📋 Triggers en la base de datos:');
    triggers.forEach(trigger => {
      console.log(`   - ${trigger.Trigger} (${trigger.Event} ${trigger.Table})`);
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

// Ejecutar la migración
ejecutarMigracion();
