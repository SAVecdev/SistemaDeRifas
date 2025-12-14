import db from './database/connection.js';

try {
  // Contar sesiones activas
  const [count] = await db.query("SELECT COUNT(*) as total FROM session WHERE estado = 'activa'");
  console.log('✅ Total sesiones activas en BD:', count[0].total);
  
  // Obtener sesiones activas con JOIN
  const [sessions] = await db.query(`
    SELECT s.*, u.nombre, u.correo, u.rol 
    FROM session s 
    JOIN usuario u ON s.id_usuario = u.id 
    WHERE s.estado = 'activa' 
    LIMIT 5
  `);
  
  console.log('\n📋 Sesiones activas:');
  if (sessions.length === 0) {
    console.log('⚠️ No hay sesiones activas');
  } else {
    sessions.forEach((s, i) => {
      console.log(`\n[${i+1}] ID: ${s.id}`);
      console.log(`   Usuario: ${s.nombre} (${s.correo})`);
      console.log(`   Rol: ${s.rol}`);
      console.log(`   IP: ${s.ip}`);
      console.log(`   Estado: ${s.estado}`);
      console.log(`   Último acceso: ${s.ultimo_acceso}`);
    });
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  process.exit(0);
}
