const pool = require('../config/db');

async function testSupervision() {
  try {
    console.log('🔍 Consultando usuarios...\n');

    // Buscar supervisores
    const [supervisores] = await pool.execute(
      "SELECT id, nombre, correo, rol FROM usuario WHERE rol = 'supervisor' LIMIT 5"
    );

    console.log('📋 Supervisores disponibles:');
    console.table(supervisores);

    // Buscar vendedores
    const [vendedores] = await pool.execute(
      "SELECT id, nombre, correo, rol FROM usuario WHERE rol = 'vendedor' LIMIT 10"
    );

    console.log('\n📋 Vendedores disponibles:');
    console.table(vendedores);

    // Consultar relaciones de supervisión existentes
    const [relaciones] = await pool.execute(`
      SELECT 
        s.id,
        s.id_supervisor,
        sup.nombre as supervisor_nombre,
        s.id_supervisado,
        v.nombre as vendedor_nombre,
        s.created_at
      FROM supervision s
      INNER JOIN usuario sup ON s.id_supervisor = sup.id
      INNER JOIN usuario v ON s.id_supervisado = v.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `);

    console.log('\n📋 Relaciones de supervisión existentes:');
    if (relaciones.length > 0) {
      console.table(relaciones);
    } else {
      console.log('❌ No hay relaciones de supervisión registradas.');
      console.log('\n💡 Para crear una relación, ejecuta:');
      if (supervisores.length > 0 && vendedores.length > 0) {
        console.log(`   INSERT INTO supervision (id_supervisor, id_supervisado) VALUES (${supervisores[0].id}, ${vendedores[0].id});`);
        console.log(`   Esto asignará al supervisor "${supervisores[0].nombre}" para supervisar a "${vendedores[0].nombre}"\n`);
      }
    }

    await pool.end();
    console.log('\n✅ Consulta completada exitosamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

testSupervision();
