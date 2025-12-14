import pool from '../database/connection.js';

async function crearRifasActivas() {
  try {
    console.log('🎰 Creando rifas activas...');

    const rifas = [
      {
        sorteos: 150,
        descripcion: 'Gran Rifa Navideña - iPhone 15 Pro Max',
        imagen: 'https://via.placeholder.com/400x300?text=iPhone+15+Pro',
        id_tipo: 1,
        fecha_hora_juego: '2025-12-20 19:00:00'
      },
      {
        sorteos: 200,
        descripcion: 'Rifa Especial - PlayStation 5 + Juegos',
        imagen: 'https://via.placeholder.com/400x300?text=PlayStation+5',
        id_tipo: 2,
        fecha_hora_juego: '2025-12-25 20:00:00'
      },
      {
        sorteos: 100,
        descripcion: 'Rifa de Fin de Año - Smart TV 65 pulgadas',
        imagen: 'https://via.placeholder.com/400x300?text=Smart+TV',
        id_tipo: 1,
        fecha_hora_juego: '2025-12-31 18:00:00'
      },
      {
        sorteos: 80,
        descripcion: 'Rifa Express - AirPods Pro',
        imagen: 'https://via.placeholder.com/400x300?text=AirPods+Pro',
        id_tipo: 1,
        fecha_hora_juego: '2025-12-15 19:00:00'
      },
      {
        sorteos: 120,
        descripcion: 'Mega Rifa - Laptop Gamer MSI',
        imagen: 'https://via.placeholder.com/400x300?text=Laptop+Gamer',
        id_tipo: 2,
        fecha_hora_juego: '2025-12-28 20:00:00'
      },
      {
        sorteos: 90,
        descripcion: 'Rifa Diaria - Bicicleta Eléctrica',
        imagen: 'https://via.placeholder.com/400x300?text=Bicicleta',
        id_tipo: 1,
        fecha_hora_juego: '2025-12-18 19:00:00'
      }
    ];

    for (const rifa of rifas) {
      const [result] = await pool.execute(
        'INSERT INTO rifa (sorteos, descripcion, imagen, id_tipo, fecha_hora_juego) VALUES (?, ?, ?, ?, ?)',
        [rifa.sorteos, rifa.descripcion, rifa.imagen, rifa.id_tipo, rifa.fecha_hora_juego]
      );
      console.log(`✅ Rifa creada: ${rifa.descripcion} (ID: ${result.insertId})`);
    }

    console.log('🎉 ¡Rifas activas creadas exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando rifas:', error.message);
    process.exit(1);
  }
}

crearRifasActivas();
