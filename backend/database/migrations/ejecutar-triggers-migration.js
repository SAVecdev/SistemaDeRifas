import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

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
  multipleStatements: true // Importante para ejecutar múltiples statements
};

async function ejecutarMigracion() {
  let connection;
  
  try {
    console.log('📡 Conectando a la base de datos...');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Database: ${dbConfig.database}`);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión establecida\n');

    console.log('🚀 Ejecutando migración 007_fix_ganadores_triggers...\n');
    
    // 1. Eliminar triggers antiguos
    console.log('   1/4: Eliminando tr_asignar_ganadores_venta...');
    try {
      await connection.query('DROP TRIGGER IF EXISTS tr_asignar_ganadores_venta');
      console.log('   ✅ Eliminado');
    } catch (error) {
      console.log('   ⚠️  No existe');
    }

    console.log('   2/4: Eliminando tr_revalidar_ganadores_venta...');
    try {
      await connection.query('DROP TRIGGER IF EXISTS tr_revalidar_ganadores_venta');
      console.log('   ✅ Eliminado');
    } catch (error) {
      console.log('   ⚠️  No existe');
    }

    // 2. Crear trigger para INSERT
    console.log('   3/4: Creando tr_asignar_ganadores_venta...');
    await connection.query(`
      CREATE TRIGGER tr_asignar_ganadores_venta
      AFTER INSERT ON numero_ganadores
      FOR EACH ROW
      BEGIN
          INSERT INTO ganadores (
              id_usuario,
              id_factura,
              numerol,
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
    console.log('   ✅ Creado');

    // 3. Crear trigger para UPDATE
    console.log('   4/4: Creando tr_revalidar_ganadores_venta...');
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
    console.log('   ✅ Creado');
    
    console.log('\n✅ Triggers eliminados y recreados correctamente\n');

    // Verificar los triggers creados
    console.log('🔍 Verificando triggers creados...');
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
