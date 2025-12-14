import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

/**
 * Script para inicializar la base de datos con el esquema y datos de prueba
 * - Crea todas las tablas (schema.sql)
 * - Inserta usuarios de prueba con los 4 roles
 * - Inserta tipos de rifa y premios
 * - Inserta rifas de ejemplo
 */

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true // Permite ejecutar múltiples sentencias SQL
};

console.log('🔧 Configuración de base de datos:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Puerto: ${dbConfig.port}`);
console.log(`   Usuario: ${dbConfig.user}`);
console.log(`   Base de datos: ${dbConfig.database}`);
console.log('');

async function initializeDatabase() {
  let connection;
  
  try {
    // Conectar a la base de datos
    console.log('📡 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Conexión establecida correctamente\n');
    
    // Leer el archivo schema.sql
    console.log('📄 Leyendo archivo schema.sql...');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Eliminar tablas existentes (en orden inverso por las foreign keys)
    console.log('🗑️  Eliminando tablas existentes...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const tablesToDrop = [
      'ganadores', 'numero_ganadores', 'area', 'venta', 
      'factura', 'rifa', 'opciones_premios', 'tipo_rifa', 
      'session', 'usuario'
    ];
    
    for (const table of tablesToDrop) {
      try {
        await connection.query(`DROP TABLE IF EXISTS ${table}`);
        console.log(`   ✓ Tabla ${table} eliminada`);
      } catch (error) {
        // Ignorar si la tabla no existe
      }
    }
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('');
    
    // Crear las tablas
    console.log('🏗️  Creando tablas desde schema.sql...');
    
    // Limpiar comentarios y dividir por sentencias
    const cleanSQL = schemaSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    const statements = cleanSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      try {
        await connection.query(statement);
        // Extraer nombre de tabla para mostrar
        const matchCreate = statement.match(/CREATE TABLE\s+`?(\w+)`?/i);
        const matchAlter = statement.match(/ALTER TABLE\s+`?(\w+)`?/i);
        if (matchCreate) {
          console.log(`   ✓ Tabla ${matchCreate[1]} creada`);
        } else if (matchAlter) {
          console.log(`   ✓ Foreign key para ${matchAlter[1]}`);
        }
      } catch (error) {
        console.error(`   ✗ Error en: ${statement.substring(0, 50)}...`);
        throw error;
      }
    }
    console.log('✓ Todas las tablas creadas correctamente\n');
    
    // Leer y ejecutar seed.sql
    console.log('🌱 Cargando datos de prueba desde seed.sql...');
    const seedPath = path.join(__dirname, 'database', 'seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    // Ejecutar el seed
    await connection.query(seedSQL);
    console.log('✓ Datos de prueba cargados correctamente\n');
    
    // Crear la vista de premios consolidada
    console.log('📊 Creando vista de premios consolidada...');
    const vistaPath = path.join(__dirname, 'database', 'vista_premios.sql');
    const vistaSQL = fs.readFileSync(vistaPath, 'utf8');
    
    // Limpiar y ejecutar la vista
    const vistaClean = vistaSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .trim();
    
    await connection.query(vistaClean);
    console.log('✓ Vista de premios creada correctamente\n');
    
    // Verificar los datos insertados
    console.log('📊 Verificando datos insertados...');
    
    const [usuarios] = await connection.query('SELECT id, nombre, correo, rol FROM usuario');
    console.log(`   ✓ ${usuarios.length} usuarios creados:`);
    usuarios.forEach(u => {
      console.log(`      - ${u.nombre} (${u.correo}) - Rol: ${u.rol}`);
    });
    
    const [tiposRifa] = await connection.query('SELECT id, nombre FROM tipo_rifa');
    console.log(`   ✓ ${tiposRifa.length} tipos de rifa creados`);
    
    const [premios] = await connection.query('SELECT COUNT(*) as total FROM opciones_premios');
    console.log(`   ✓ ${premios[0].total} opciones de premios creadas`);
    
    const [rifas] = await connection.query('SELECT id, descripcion, fecha_hora_juego FROM rifa');
    console.log(`   ✓ ${rifas.length} rifas creadas`);
    
    const [areas] = await connection.query('SELECT id, nombre FROM area');
    console.log(`   ✓ ${areas.length} áreas creadas\n`);
    
    console.log('='.repeat(60));
    console.log('✅ BASE DE DATOS INICIALIZADA CORRECTAMENTE');
    console.log('='.repeat(60));
    console.log('\n🔐 CREDENCIALES DE ACCESO:\n');
    console.log('👨‍💼 ADMINISTRADOR:');
    console.log('   Correo: admin@rifas.com');
    console.log('   Password: password123\n');
    console.log('👔 SUPERVISOR:');
    console.log('   Correo: supervisor@rifas.com');
    console.log('   Password: password123\n');
    console.log('💼 VENDEDOR:');
    console.log('   Correo: vendedor@rifas.com');
    console.log('   Password: password123\n');
    console.log('👤 CLIENTE:');
    console.log('   Correo: cliente@rifas.com');
    console.log('   Password: password123\n');
    console.log('='.repeat(60));
    console.log('\n🚀 Puedes iniciar el servidor con: npm start');
    console.log('🌐 API estará disponible en: http://localhost:5000\n');
    
  } catch (error) {
    console.error('\n❌ Error inicializando la base de datos:');
    console.error(error.message);
    console.error('\nDetalles del error:');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada\n');
    }
  }
}

// Ejecutar la inicialización
initializeDatabase();
