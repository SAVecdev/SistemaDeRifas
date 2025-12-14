import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../utils/api';
import './ClienteRifas.css';

const ClienteRifas = () => {
  const [rifas, setRifas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarRifas();
  }, []);

  const cargarRifas = async () => {
    try {
      const response = await apiGet('/cliente/rifas-activas');
      setRifas(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar rifas:', error);
      setLoading(false);
    }
  };

  const rifasFiltradas = rifas.filter(rifa => {
    const cumpleTipo = filtroTipo === 'todas' || rifa.tipo_nombre === filtroTipo;
    const cumpleBusqueda = rifa.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleTipo && cumpleBusqueda;
  });

  const tiposUnicos = [...new Set(rifas.map(r => r.tipo_nombre))].filter(Boolean);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando rifas...</p>
      </div>
    );
  }

  return (
    <div className="cliente-rifas">
      {/* Header */}
      <div className="rifas-header">
        <h1>🎰 Rifas Disponibles</h1>
        <p>Elige tu rifa favorita y compra tus números de la suerte</p>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtro-busqueda">
          <input
            type="text"
            placeholder="🔍 Buscar rifas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda"
          />
        </div>
        
        <div className="filtro-tipos">
          <button
            className={`btn-filtro ${filtroTipo === 'todas' ? 'active' : ''}`}
            onClick={() => setFiltroTipo('todas')}
          >
            Todas
          </button>
          {tiposUnicos.map(tipo => (
            <button
              key={tipo}
              className={`btn-filtro ${filtroTipo === tipo ? 'active' : ''}`}
              onClick={() => setFiltroTipo(tipo)}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      {/* Rifas Grid */}
      {rifasFiltradas.length === 0 ? (
        <div className="no-rifas">
          <span className="no-rifas-icon">🎰</span>
          <h2>No hay rifas disponibles</h2>
          <p>No se encontraron rifas que coincidan con tu búsqueda</p>
        </div>
      ) : (
        <div className="rifas-grid">
          {rifasFiltradas.map((rifa) => {
            const diasRestantes = Math.ceil(
              (new Date(rifa.fecha_hora_juego) - new Date()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div key={rifa.id} className="rifa-card">
                <div className="rifa-imagen-container">
                  {rifa.imagen ? (
                    <img src={rifa.imagen} alt={rifa.descripcion} className="rifa-imagen" />
                  ) : (
                    <div className="rifa-imagen-placeholder">
                      <span>🎰</span>
                    </div>
                  )}
                  
                  <div className="rifa-badges">
                    <span className="badge-live">🔴 EN VIVO</span>
                    {diasRestantes <= 2 && (
                      <span className="badge-urgente">⚡ Última oportunidad</span>
                    )}
                  </div>
                </div>

                <div className="rifa-content">
                  <div className="rifa-tipo-badge">{rifa.tipo_nombre || 'Rifa'}</div>
                  
                  <h3 className="rifa-titulo">{rifa.descripcion}</h3>
                  
                  <div className="rifa-info-grid">
                    <div className="info-item">
                      <span className="info-icon">📅</span>
                      <div>
                        <p className="info-label">Fecha del Sorteo</p>
                        <p className="info-value">
                          {new Date(rifa.fecha_hora_juego).toLocaleDateString('es-EC', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="info-item">
                      <span className="info-icon">⏰</span>
                      <div>
                        <p className="info-label">Hora</p>
                        <p className="info-value">
                          {new Date(rifa.fecha_hora_juego).toLocaleTimeString('es-EC', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="info-item">
                      <span className="info-icon">🎯</span>
                      <div>
                        <p className="info-label">Sorteos</p>
                        <p className="info-value">{rifa.sorteos || 1}</p>
                      </div>
                    </div>

                    <div className="info-item">
                      <span className="info-icon">⏳</span>
                      <div>
                        <p className="info-label">Tiempo Restante</p>
                        <p className="info-value">
                          {diasRestantes > 0 ? `${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}` : 'Hoy'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link to={`/usuario/comprar?rifaId=${rifa.id}`} className="btn-comprar">
                    <span>🎫</span>
                    <span>Comprar Números</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClienteRifas;
