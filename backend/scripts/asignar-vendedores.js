const pool = require('../config/db');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function asignarVendedores() {
  try {
    console.log('🎯 Asignador de Vendedores a Supervisores\n');
    console.log('━'.repeat(50));

    // Buscar supervisores
    const [supervisores] = await pool.execute(
      "SELECT id, nombre, correo FROM usuario WHERE rol = 'supervisor' ORDER BY nombre"
    );

    if (supervisores.length === 0) {
      console.log('❌ No hay supervisores registrados en el sistema.');
      await pool.end();
      rl.close();
      return;
    }

    console.log('\n📋 Supervisores disponibles:\n');
    supervisores.forEach((sup, index) => {
      console.log(`${index + 1}. ${sup.nombre} (${sup.correo}) - ID: ${sup.id}`);
    });

    const supervisorIndex = await question('\n👤 Selecciona el número del supervisor: ');
    const supervisorSeleccionado = supervisores[parseInt(supervisorIndex) - 1];

    if (!supervisorSeleccionado) {
      console.log('❌ Selección inválida.');
      await pool.end();
      rl.close();
      return;
    }

    console.log(`\n✅ Supervisor seleccionado: ${supervisorSeleccionado.nombre}`);

    // Buscar vendedores no asignados a este supervisor
    const [vendedores] = await pool.execute(`
      SELECT u.id, u.nombre, u.correo, u.activo
      FROM usuario u
      WHERE u.rol = 'vendedor'
        AND u.id NOT IN (
          SELECT id_supervisado 
          FROM supervision 
          WHERE id_supervisor = ?
        )
      ORDER BY u.nombre
    `, [supervisorSeleccionado.id]);

    if (vendedores.length === 0) {
      console.log('❌ No hay vendedores disponibles para asignar.');
      await pool.end();
      rl.close();
      return;
    }

    console.log('\n📋 Vendedores disponibles para asignar:\n');
    vendedores.forEach((ven, index) => {
      const estado = ven.activo ? '🟢' : '🔴';
      console.log(`${index + 1}. ${estado} ${ven.nombre} (${ven.correo}) - ID: ${ven.id}`);
    });

    console.log('\n💡 Opciones:');
    console.log('   - Ingresa números separados por comas (ej: 1,3,5)');
    console.log('   - Ingresa "todos" para asignar todos los vendedores');
    console.log('   - Ingresa "cancelar" para salir\n');

    const respuesta = await question('🎯 Tu selección: ');

    if (respuesta.toLowerCase() === 'cancelar') {
      console.log('❌ Operación cancelada.');
      await pool.end();
      rl.close();
      return;
    }

    let vendedoresAAsignar = [];

    if (respuesta.toLowerCase() === 'todos') {
      vendedoresAAsignar = vendedores;
    } else {
      const indices = respuesta.split(',').map(n => parseInt(n.trim()) - 1);
      vendedoresAAsignar = indices
        .filter(i => i >= 0 && i < vendedores.length)
        .map(i => vendedores[i]);
    }

    if (vendedoresAAsignar.length === 0) {
      console.log('❌ No se seleccionaron vendedores válidos.');
      await pool.end();
      rl.close();
      return;
    }

    console.log(`\n📝 Se asignarán ${vendedoresAAsignar.length} vendedores:`);
    vendedoresAAsignar.forEach(v => console.log(`   - ${v.nombre}`));

    const confirmacion = await question('\n¿Confirmar asignación? (si/no): ');

    if (confirmacion.toLowerCase() !== 'si') {
      console.log('❌ Operación cancelada.');
      await pool.end();
      rl.close();
      return;
    }

    // Insertar las asignaciones
    console.log('\n⏳ Procesando asignaciones...');
    let exitosas = 0;

    for (const vendedor of vendedoresAAsignar) {
      try {
        await pool.execute(
          'INSERT INTO supervision (id_supervisor, id_supervisado) VALUES (?, ?)',
          [supervisorSeleccionado.id, vendedor.id]
        );
        console.log(`✅ ${vendedor.nombre} asignado correctamente`);
        exitosas++;
      } catch (error) {
        console.log(`❌ Error asignando ${vendedor.nombre}: ${error.message}`);
      }
    }

    console.log(`\n━`.repeat(50));
    console.log(`\n🎉 Proceso completado: ${exitosas}/${vendedoresAAsignar.length} asignaciones exitosas`);

    await pool.end();
    rl.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    rl.close();
    process.exit(1);
  }
}

asignarVendedores();
