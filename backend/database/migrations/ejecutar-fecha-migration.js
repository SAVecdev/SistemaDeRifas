import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde el archivo .env en la raíz del backend
const envPath = join(__dirname, '..', '..', '.env');
console.log('🔍 Buscando .env en:', envPath);
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

    console.log('🚀 Ejecutando migración 008_add_fecha_to_ganadores...\n');
    
    // 1. Agregar columna fecha
    console.log('   1/4: Agregando columna fecha a ganadores...');
    try {
      await connection.query(`
        ALTER TABLE ganadores 
        ADD COLUMN fecha DATE NULL AFTER numerol
      `);
      console.log('   ✅ Columna agregada');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('   ⚠️  La columna ya existe');
      } else {
        throw error;
      }
    }

    // 2. Eliminar triggers antiguos
    console.log('   2/4: Eliminando triggers antiguos...');
    await connection.query('DROP TRIGGER IF EXISTS tr_asignar_ganadores_venta');
    await connection.query('DROP TRIGGER IF EXISTS tr_revalidar_ganadores_venta');
    console.log('   ✅ Triggers eliminados');

    // 3. Crear trigger para INSERT
    console.log('   3/4: Creando tr_asignar_ganadores_venta con fecha...');
    await connection.query(`
      CREATE TRIGGER tr_asignar_ganadores_venta
      AFTER INSERT ON numero_ganadores
      FOR EACH ROW
      BEGIN
          INSERT INTO ganadores (
              id_usuario,
              id_factura,
              numerol,
              fecha,
              saldo_premio,
              nivel_premio,
              id_area,
              id_numero_ganador,
              pagada,
              fecha_hora_pago
          )
          SELECT
              v.id_usuario,
              v.id_factura,
              v.numero,
              v.fecha,
              COALESCE(CAST(op.valor_premio AS CHAR), '0') as saldo_premio,
              NEW.nivel_premio,
              u.id_area,
              NEW.id,
              0,
              NULL
          FROM
              venta v
              INNER JOIN usuario u ON v.id_usuario = u.id
              INNER JOIN rifa r ON v.id_rifas = r.id
              LEFT JOIN opciones_premios op ON r.id_tipo = op.id_tipo_rifa 
                                            AND u.id_area = op.id_area 
                                            AND v.valor = op.saldo_ganado
                                            AND LENGTH(v.numero) = op.digitos
                                            AND op.nivel_premio = NEW.nivel_premio
          WHERE
              v.id_rifas = NEW.id_rifa
              AND NEW.numero_ganador LIKE CONCAT('%', v.numero)
              AND v.eliminada = 0;
      END
    `);
    console.log('   ✅ Trigger creado');

    // 4. Crear trigger para UPDATE
    console.log('   4/4: Creando tr_revalidar_ganadores_venta con fecha...');
    await connection.query(`
      CREATE TRIGGER tr_revalidar_ganadores_venta
      AFTER UPDATE ON numero_ganadores
      FOR EACH ROW
      BEGIN
          DELETE FROM ganadores
          WHERE id_numero_ganador = OLD.id;

          INSERT INTO ganadores (
              id_usuario,
              id_factura,
              numerol,
              fecha,
              saldo_premio,
              nivel_premio,
              id_area,
              id_numero_ganador,
              pagada,
              fecha_hora_pago
          )
          SELECT
              v.id_usuario,
              v.id_factura,
              v.numero,
              v.fecha,
              COALESCE(CAST(op.valor_premio AS CHAR), '0') as saldo_premio,
              NEW.nivel_premio,
              u.id_area,
              NEW.id,
              0,
              NULL
          FROM
              venta v
              INNER JOIN usuario u ON v.id_usuario = u.id
              INNER JOIN rifa r ON v.id_rifas = r.id
              LEFT JOIN opciones_premios op ON r.id_tipo = op.id_tipo_rifa 
                                            AND u.id_area = op.id_area 
                                            AND v.valor = op.saldo_ganado
                                            AND LENGTH(v.numero) = op.digitos
                                            AND op.nivel_premio = NEW.nivel_premio
          WHERE
              v.id_rifas = NEW.id_rifa
              AND NEW.numero_ganador LIKE CONCAT('%', v.numero)
              AND v.eliminada = 0;
      END
    `);
    console.log('   ✅ Trigger creado');
    
    console.log('\n✅ Migración completada correctamente\n');

    // Verificar estructura de la tabla ganadores
    console.log('🔍 Verificando estructura de la tabla ganadores...');
    const [columns] = await connection.query("SHOW COLUMNS FROM ganadores");
    
    console.log('\n📋 Columnas en la tabla ganadores:');
    columns.forEach(col => {
      const nullable = col.Null === 'YES' ? 'NULL' : 'NOT NULL';
      const extra = col.Extra ? ` (${col.Extra})` : '';
      const key = col.Key ? ` [${col.Key}]` : '';
      console.log(`   - ${col.Field}: ${col.Type} ${nullable}${key}${extra}`);
    });

    // Verificar los triggers
    console.log('\n🔍 Verificando triggers creados...');
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
