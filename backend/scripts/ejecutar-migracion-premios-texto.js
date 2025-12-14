import pool from '../database/connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ejecutarMigracion() {
  try {
    console.log('🔧 Ejecutando migración: crear tabla premios_texto...');

    const sqlPath = path.join(__dirname, '../database/migrations/004_add_premios_texto.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Dividir por punto y coma para ejecutar múltiples sentencias
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Ejecutando:', statement.substring(0, 50) + '...');
        await pool.execute(statement);
      }
    }

    console.log('✅ Migración completada exitosamente');
    console.log('📋 Tabla premios_texto creada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    process.exit(1);
  }
}

ejecutarMigracion();
