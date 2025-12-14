/**
 * Script de prueba del sistema de sesiones
 * Ejecutar con: node backend/scripts/test-sesiones.js
 */

import pool from '../database/connection.js';
import * as sessionModel from '../models/sessionModel.js';

const testSesiones = async () => {
  console.log('🧪 Iniciando pruebas del sistema de sesiones...\n');

  try {
    // 1. Probar obtención de sesiones activas
    console.log('1️⃣ Probando obtención de sesiones activas...');
    const sesionesActivas = await sessionModel.getAllActiveSessions();
    console.log(`   ✅ Sesiones activas encontradas: ${sesionesActivas.length}`);
    
    if (sesionesActivas.length > 0) {
      console.log('   📋 Primera sesión:');
      console.log(`      - Usuario: ${sesionesActivas[0].nombre} (${sesionesActivas[0].correo})`);
      console.log(`      - IP: ${sesionesActivas[0].ip}`);
      console.log(`      - Navegador: ${sesionesActivas[0].navegador}`);
      console.log(`      - Sistema: ${sesionesActivas[0].sistema_operativo}`);
      console.log(`      - Inicio: ${sesionesActivas[0].fecha_inicio}`);
      console.log(`      - Último acceso: ${sesionesActivas[0].ultimo_acceso}`);
    }
    console.log('');

    // 2. Probar conteo de sesiones activas
    console.log('2️⃣ Probando conteo de sesiones activas...');
    const totalActivas = await sessionModel.countActiveSessions();
    console.log(`   ✅ Total de sesiones activas: ${totalActivas}\n`);

    // 3. Verificar timeout de sesiones
    console.log('3️⃣ Verificando configuración de timeout...');
    console.log('   ℹ️  Timeout configurado: 3 horas (180 minutos)');
    
    // Buscar sesiones próximas a expirar
    const [rowsProximasExpirar] = await pool.execute(`
      SELECT 
        s.*,
        u.nombre,
        u.correo,
        TIMESTAMPDIFF(MINUTE, s.ultimo_acceso, NOW()) as minutos_inactivo,
        180 - TIMESTAMPDIFF(MINUTE, s.ultimo_acceso, NOW()) as minutos_restantes
      FROM session s
      JOIN usuario u ON s.id_usuario = u.id
      WHERE s.estado = 'activa'
      AND TIMESTAMPDIFF(MINUTE, s.ultimo_acceso, NOW()) > 150
      ORDER BY minutos_restantes ASC
      LIMIT 5
    `);
    
    if (rowsProximasExpirar.length > 0) {
      console.log(`   ⚠️  Sesiones próximas a expirar (>150 min inactividad):`);
      rowsProximasExpirar.forEach(s => {
        console.log(`      - ${s.nombre}: ${s.minutos_restantes} minutos restantes`);
      });
    } else {
      console.log('   ✅ No hay sesiones próximas a expirar');
    }
    console.log('');

    // 4. Probar detección de sesiones expiradas
    console.log('4️⃣ Buscando sesiones que deberían estar expiradas...');
    const [rowsExpiradas] = await pool.execute(`
      SELECT 
        s.*,
        u.nombre,
        TIMESTAMPDIFF(MINUTE, s.ultimo_acceso, NOW()) as minutos_inactivo
      FROM session s
      JOIN usuario u ON s.id_usuario = u.id
      WHERE s.estado = 'activa'
      AND TIMESTAMPDIFF(MINUTE, s.ultimo_acceso, NOW()) > 180
    `);
    
    if (rowsExpiradas.length > 0) {
      console.log(`   ⚠️  ADVERTENCIA: ${rowsExpiradas.length} sesiones deberían estar expiradas:`);
      rowsExpiradas.forEach(s => {
        console.log(`      - ${s.nombre}: ${s.minutos_inactivo} minutos inactivo`);
      });
      console.log('   💡 Ejecuta POST /api/sesiones/expirar-inactivas para corregir');
    } else {
      console.log('   ✅ No hay sesiones que deberían estar expiradas');
    }
    console.log('');

    // 5. Estadísticas por rol
    console.log('5️⃣ Estadísticas de sesiones por rol...');
    const [statsPorRol] = await pool.execute(`
      SELECT 
        u.rol,
        COUNT(*) as total_sesiones,
        COUNT(DISTINCT s.id_usuario) as usuarios_unicos
      FROM session s
      JOIN usuario u ON s.id_usuario = u.id
      WHERE s.estado = 'activa'
      GROUP BY u.rol
      ORDER BY total_sesiones DESC
    `);
    
    if (statsPorRol.length > 0) {
      console.log('   📊 Sesiones activas por rol:');
      statsPorRol.forEach(stat => {
        console.log(`      - ${stat.rol}: ${stat.total_sesiones} sesiones (${stat.usuarios_unicos} usuarios)`);
      });
    } else {
      console.log('   ℹ️  No hay sesiones activas');
    }
    console.log('');

    // 6. Sesiones múltiples del mismo usuario
    console.log('6️⃣ Detectando usuarios con múltiples sesiones activas...');
    const [usuariosMultipleSesiones] = await pool.execute(`
      SELECT 
        u.id,
        u.nombre,
        u.correo,
        u.rol,
        COUNT(*) as num_sesiones
      FROM session s
      JOIN usuario u ON s.id_usuario = u.id
      WHERE s.estado = 'activa'
      GROUP BY u.id, u.nombre, u.correo, u.rol
      HAVING COUNT(*) > 1
      ORDER BY num_sesiones DESC
    `);
    
    if (usuariosMultipleSesiones.length > 0) {
      console.log(`   👥 ${usuariosMultipleSesiones.length} usuarios con múltiples sesiones:`);
      usuariosMultipleSesiones.forEach(u => {
        console.log(`      - ${u.nombre} (${u.correo}): ${u.num_sesiones} sesiones activas`);
      });
    } else {
      console.log('   ✅ Todos los usuarios tienen una sola sesión activa');
    }
    console.log('');

    // 7. Historial de sesiones cerradas recientes
    console.log('7️⃣ Últimas sesiones cerradas...');
    const [sesionesCerradas] = await pool.execute(`
      SELECT 
        s.*,
        u.nombre,
        u.correo,
        s.duracion_minutos
      FROM session s
      JOIN usuario u ON s.id_usuario = u.id
      WHERE s.estado IN ('cerrada', 'expirada')
      ORDER BY s.fecha_cierre DESC
      LIMIT 5
    `);
    
    if (sesionesCerradas.length > 0) {
      console.log('   📋 Últimas 5 sesiones cerradas:');
      sesionesCerradas.forEach(s => {
        const duracionHoras = Math.floor(s.duracion_minutos / 60);
        const duracionMin = s.duracion_minutos % 60;
        console.log(`      - ${s.nombre}: ${s.estado} (duración: ${duracionHoras}h ${duracionMin}m)`);
      });
    } else {
      console.log('   ℹ️  No hay sesiones cerradas recientes');
    }
    console.log('');

    // 8. Sesiones antiguas para limpieza
    console.log('8️⃣ Verificando sesiones antiguas para limpieza...');
    const [sesionesAntiguas] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM session
      WHERE estado IN ('cerrada', 'expirada')
      AND fecha_cierre < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    if (sesionesAntiguas[0].total > 0) {
      console.log(`   🗑️  ${sesionesAntiguas[0].total} sesiones antiguas (>30 días) pueden eliminarse`);
      console.log('   💡 Ejecuta DELETE /api/sesiones/limpiar para eliminarlas');
    } else {
      console.log('   ✅ No hay sesiones antiguas para limpiar');
    }
    console.log('');

    // Resumen final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMEN DEL SISTEMA DE SESIONES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Sesiones activas: ${totalActivas}`);
    console.log(`⚠️  Sesiones a punto de expirar: ${rowsProximasExpirar.length}`);
    console.log(`❌ Sesiones que deberían expirar: ${rowsExpiradas.length}`);
    console.log(`👥 Usuarios con múltiples sesiones: ${usuariosMultipleSesiones.length}`);
    console.log(`🗑️  Sesiones antiguas para limpiar: ${sesionesAntiguas[0].total}`);
    console.log(`⏱️  Timeout configurado: 3 horas (180 minutos)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Pruebas completadas exitosamente!\n');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    throw error;
  } finally {
    // Cerrar conexión
    await pool.end();
  }
};

// Ejecutar pruebas
testSesiones()
  .then(() => {
    console.log('👋 Finalizando script de pruebas...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
