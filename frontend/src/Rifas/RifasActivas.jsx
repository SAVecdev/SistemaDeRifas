import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './RifasActivas.css';

function RifasActivas() {
  const [rifas, setRifas] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    // Mock data - simular llamada a API
    const rifasMock = [
      {
        id: 1,
        titulo: "iPhone 15 Pro Max",
        descripcion: "El último modelo de iPhone con 256GB",
        imagen: "https://via.placeholder.com/300x200?text=iPhone+15",
        precioNumero: 5,
        numerosDisponibles: 850,
        totalNumeros: 1000,
        fechaSorteo: "2025-12-15",
        categoria: "tecnologia",
        loteriaBase: "Lotería Nacional de España"
      },
      {
        id: 2,
        titulo: "PlayStation 5 + 3 Juegos",
        descripcion: "Consola PS5 con 3 juegos AAA",
        imagen: "https://via.placeholder.com/300x200?text=PS5",
        precioNumero: 3,
        numerosDisponibles: 1200,
        totalNumeros: 1500,
        fechaSorteo: "2025-12-20",
        categoria: "tecnologia",
        loteriaBase: "Lotería Nacional de México"
      },
      {
        id: 3,
        titulo: "Motocicleta Honda CB500",
        descripcion: "Moto nueva modelo 2025",
        imagen: "https://via.placeholder.com/300x200?text=Moto+Honda",
        precioNumero: 10,
        numerosDisponibles: 450,
        totalNumeros: 2000,
        fechaSorteo: "2025-12-25",
        categoria: "vehiculos",
        loteriaBase: "Lotería Nacional de Colombia"
      },
      {
        id: 4,
        titulo: "Smart TV 65 pulgadas",
        descripcion: "TV 4K Ultra HD con HDR",
        imagen: "https://via.placeholder.com/300x200?text=Smart+TV",
        precioNumero: 4,
        numerosDisponibles: 300,
        totalNumeros: 800,
        fechaSorteo: "2025-12-18",
        categoria: "tecnologia",
        loteriaBase: "Lotería Nacional de Argentina"
      },
      {
        id: 5,
        titulo: "Viaje a Cancún para 2 personas",
        descripcion: "Todo incluido 5 días",
        imagen: "https://via.placeholder.com/300x200?text=Viaje+Cancun",
        precioNumero: 8,
        numerosDisponibles: 600,
        totalNumeros: 1000,
        fechaSorteo: "2025-12-30",
        categoria: "viajes",
        loteriaBase: "Lotería Nacional de México"
      },
      {
        id: 6,
        titulo: "MacBook Pro M3",
        descripcion: "Laptop profesional 16GB RAM",
        imagen: "https://via.placeholder.com/300x200?text=MacBook",
        precioNumero: 7,
        numerosDisponibles: 950,
        totalNumeros: 1200,
        fechaSorteo: "2025-12-22",
        categoria: "tecnologia",
        loteriaBase: "Lotería Nacional de España"
      }
    ];

    setRifas(rifasMock);
  }, []);

  const rifasFiltradas = rifas.filter(rifa => {
    const coincideBusqueda = rifa.titulo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro = filtro === 'todas' || rifa.categoria === filtro;
    return coincideBusqueda && coincideFiltro;
  });

  return (
    <div className="rifas-activas">
      <h1>🎲 Rifas Activas</h1>
      
      {/* Filtros y Búsqueda */}
      <div className="filtros-container card">
        <div className="busqueda">
          <input
            type="text"
            placeholder="Buscar rifas..."
            className="form-control"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        
        <div className="filtros">
          <button 
            className={`btn ${filtro === 'todas' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltro('todas')}
          >
            Todas
          </button>
          <button 
            className={`btn ${filtro === 'tecnologia' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltro('tecnologia')}
          >
            Tecnología
          </button>
          <button 
            className={`btn ${filtro === 'vehiculos' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltro('vehiculos')}
          >
            Vehículos
          </button>
          <button 
            className={`btn ${filtro === 'viajes' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltro('viajes')}
          >
            Viajes
          </button>
        </div>
      </div>

      {/* Lista de Rifas */}
      <div className="rifas-grid">
        {rifasFiltradas.length === 0 ? (
          <div className="no-rifas">
            <p>No se encontraron rifas con esos criterios</p>
          </div>
        ) : (
          rifasFiltradas.map(rifa => (
            <div key={rifa.id} className="rifa-card">
              <img src={rifa.imagen} alt={rifa.titulo} className="rifa-imagen" />
              <div className="rifa-info">
                <span className="categoria-badge">{rifa.categoria}</span>
                <h3>{rifa.titulo}</h3>
                <p className="descripcion">{rifa.descripcion}</p>
                
                <div className="rifa-detalles">
                  <div className="detalle-item">
                    <span className="label">Precio:</span>
                    <span className="valor">${rifa.precioNumero}/número</span>
                  </div>
                  <div className="detalle-item">
                    <span className="label">Disponibles:</span>
                    <span className="valor">{rifa.numerosDisponibles}/{rifa.totalNumeros}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="label">Sorteo:</span>
                    <span className="valor">{new Date(rifa.fechaSorteo).toLocaleDateString()}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="label">Lotería:</span>
                    <span className="valor">{rifa.loteriaBase}</span>
                  </div>
                </div>

                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${((rifa.totalNumeros - rifa.numerosDisponibles) / rifa.totalNumeros) * 100}%`}}
                  ></div>
                </div>
                <span className="progress-text">
                  {Math.round(((rifa.totalNumeros - rifa.numerosDisponibles) / rifa.totalNumeros) * 100)}% vendido
                </span>

                <Link to={`/rifa/${rifa.id}`} className="btn btn-primary btn-block">
                  Ver Detalles y Participar
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RifasActivas;
