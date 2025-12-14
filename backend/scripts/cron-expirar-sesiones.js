/**
 * Tarea programada para expirar sesiones inactivas automáticamente
 * Se puede ejecutar con cron o como servicio
 */

import * as sessionModel from '../models/sessionModel.js';

const expirarSesionesInactivas = async () => {
  const ahora = new Date().toISOString();
  console.log(`\n[${ahora}] 🔍 Verificando sesiones inactivas...`);

  try {
    // Expirar sesiones inactivas (>180 minutos)
    const count = await sessionModel.expireInactiveSessions();
    
    if (count > 0) {
      console.log(`[${ahora}] ⚠️  Se expiraron ${count} sesiones por inactividad`);
    } else {
      console.log(`[${ahora}] ✅ No hay sesiones inactivas para expirar`);
    }

    // Limpiar sesiones antiguas (opcional, cada 7 días)
    const dia = new Date().getDay();
    const hora = new Date().getHours();
    
    // Ejecutar limpieza los domingos a las 3 AM
    if (dia === 0 && hora === 3) {
      console.log(`[${ahora}] 🗑️  Ejecutando limpieza de sesiones antiguas...`);
      const cleaned = await sessionModel.cleanOldSessions();
      console.log(`[${ahora}] 🗑️  Se eliminaron ${cleaned} sesiones antiguas (>30 días)`);
    }

  } catch (error) {
    console.error(`[${ahora}] ❌ Error al expirar sesiones:`, error);
  }
};

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  expirarSesionesInactivas()
    .then(() => {
      console.log('\n✅ Tarea completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

export default expirarSesionesInactivas;
