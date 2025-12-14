import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../utils/api';
import './ClienteDashboard.css';

const ClienteDashboard = () => {
  const [misNumeros, setMisNumeros] = useState([]);
  const [saldoUsuario, setSaldoUsuario] = useState(0);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      
      // Cargar mis números
      const responseNumeros = await apiGet(`/cliente/mis-numeros/${usuario.id}`);
      setMisNumeros(responseNumeros || []);

      // Obtener saldo actualizado del usuario
      const responseUsuario = await apiGet(`/cliente/usuario/${usuario.id}`);
      setSaldoUsuario(responseUsuario.saldo || 0);
      
      // Cargar estadísticas
      const responseEstadisticas = await apiGet(`/cliente/estadisticas/${usuario.id}`);
      setEstadisticas(responseEstadisticas);
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="cliente-dashboard">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">🎰 ¡Bienvenido a RifaParaTodos!</h1>
          <p className="hero-subtitle">Participa en rifas transparentes y gana increíbles premios</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="info-cards">
        <div className="info-card saldo-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Mi Saldo</h3>
            <p className="saldo-amount">${Number(saldoUsuario).toFixed(2)}</p>
            <Link to="/cliente/recargar" className="btn-recarga">
              ➕ Recargar Saldo
            </Link>
          </div>
        </div>

        <div className="info-card numeros-card">
          <div className="card-icon">🎫</div>
          <div className="card-content">
            <h3>Mis Números</h3>
            <p className="numeros-count">{estadisticas?.numeros_comprados || 0}</p>
            <Link to="/usuario/historial" className="btn-ver">
              Ver Todos
            </Link>
          </div>
        </div>

        <div className="info-card rifas-card">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <h3>Total Invertido</h3>
            <p className="rifas-count">${Number(estadisticas?.total_invertido || 0).toFixed(2)}</p>
            <Link to="/cliente/rifas" className="btn-ver">
              Ver Rifas
            </Link>
          </div>
        </div>

        <div className="info-card premios-card">
          <div className="card-icon">🏆</div>
          <div className="card-content">
            <h3>Premios Ganados</h3>
            <p className="premios-amount">${Number(estadisticas?.premios?.monto_total || 0).toFixed(2)}</p>
            <p className="premios-detalle">
              {estadisticas?.premios?.total || 0} premio{estadisticas?.premios?.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Mis Últimos Números */}
      {misNumeros.length > 0 && (
        <section className="seccion-numeros">
          <div className="seccion-header">
            <h2>🎫 Mis Últimos Números</h2>
            <Link to="/cliente/mis-numeros" className="btn-ver-todas">
              Ver Todos →
            </Link>
          </div>

          <div className="numeros-recientes">
            {misNumeros.slice(0, 5).map((numero, index) => (
              <div key={index} className="numero-item">
                <div className="numero-badge">
                  <span className="numero-valor">{numero.numero}</span>
                </div>
                <div className="numero-info">
                  <p className="numero-rifa">{numero.rifa_descripcion}</p>
                  <p className="numero-fecha">
                    {new Date(numero.fecha).toLocaleDateString('es-EC')}
                  </p>
                </div>
                <div className="numero-monto">
                  ${Number(numero.total).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cómo Funciona */}
      <section className="seccion-como-funciona">
        <h2>¿Cómo Funciona?</h2>
        <div className="pasos-grid">
          <div className="paso-card">
            <div className="paso-numero">1</div>
            <h3>Recarga Saldo</h3>
            <p>Agrega fondos a tu cuenta de forma segura</p>
          </div>
          <div className="paso-card">
            <div className="paso-numero">2</div>
            <h3>Elige tu Rifa</h3>
            <p>Explora las rifas activas y selecciona la que más te guste</p>
          </div>
          <div className="paso-card">
            <div className="paso-numero">3</div>
            <h3>Compra Números</h3>
            <p>Selecciona tus números de la suerte</p>
          </div>
          <div className="paso-card">
            <div className="paso-numero">4</div>
            <h3>¡Gana!</h3>
            <p>Espera el sorteo y cobra tu premio</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClienteDashboard;
