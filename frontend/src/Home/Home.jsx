import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import './Home.css';

function Home() {
  const { usuario } = useAuth();
  const [rifasDestacadas, setRifasDestacadas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarRifasActivas();
  }, []);

  const cargarRifasActivas = async () => {
    try {
      setCargando(true);
      const response = await fetch('http://localhost:5000/api/rifas/estado/activas');
      const data = await response.json();
      
      if (data.status === 'success') {
        // Tomar las primeras 6 rifas para mostrar en home
        setRifasDestacadas(data.data.slice(0, 6));
      } else {
        setError('Error al cargar las rifas');
      }
    } catch (error) {
      console.error('Error al cargar rifas:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="home">
      {/* Header de navegación */}
      <header className="home-header">
        <div className="header-container">
          <Link to="/" className="logo">
            <span className="logo-icon">🎰</span>
            <span className="logo-text">RifaParaTodos</span>
          </Link>
          
          <nav className="nav-menu">
            <Link to="/rifas" className="nav-link">Rifas</Link>
            <Link to="/como-funciona" className="nav-link">¿Cómo funciona?</Link>
            <Link to="/contacto" className="nav-link">Contacto</Link>
          </nav>

          <div className="header-actions">
            {usuario ? (
              <Link to={`/${usuario.rol === 'administrador' ? 'admin' : usuario.rol === 'supervisor' ? 'supervisor' : usuario.rol === 'vendedor' ? 'vendedor' : 'usuario'}/dashboard`} className="btn btn-primary">
                Mi Panel
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">Iniciar Sesión</Link>
                <Link to="/registro" className="btn btn-primary">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>🎰 Bienvenido a RifaParaTodos</h1>
          <p className="hero-subtitle">
            Sistema transparente de rifas basado en loterías nacionales
          </p>
          <p className="hero-description">
            Participa en rifas seguras y transparentes. Nuestros sorteos se realizan 
            con base en resultados de loterías nacionales, garantizando total imparcialidad.
          </p>
          <div className="hero-buttons">
            <Link to="/rifas" className="btn btn-primary btn-large">
              Ver Rifas Activas
            </Link>
            {!usuario && (
              <Link to="/registro" className="btn btn-success btn-large">
                Registrarse Ahora
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Rifas Destacadas */}
      <section className="rifas-destacadas">
        <h2>🏆 Rifas Activas</h2>
        
        {cargando ? (
          <div className="loading-message">
            <p>Cargando rifas...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : rifasDestacadas.length === 0 ? (
          <div className="no-rifas-message">
            <p>No hay rifas activas en este momento.</p>
            <p>Vuelve pronto para ver nuevas rifas.</p>
          </div>
        ) : (
          <>
            <div className="grid">
              {rifasDestacadas.map(rifa => (
                <div key={rifa.id} className="rifa-card">
                  <img 
                    src={rifa.imagen || 'https://via.placeholder.com/300x200?text=Rifa'} 
                    alt={rifa.descripcion || 'Rifa'} 
                    className="rifa-imagen" 
                  />
                  <div className="rifa-info">
                    <h3>{rifa.descripcion || 'Rifa sin descripción'}</h3>
                    <div className="rifa-detalles">
                      <p><strong>Tipo:</strong> {rifa.tipo_nombre || 'General'}</p>
                      <p><strong>Sorteos:</strong> {rifa.sorteos}</p>
                      <p><strong>Fecha de sorteo:</strong> {new Date(rifa.fecha_hora_juego).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                    <Link to={`/rifa/${rifa.id}`} className="btn btn-primary btn-block">
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="ver-mas">
              <Link to="/rifas" className="btn btn-secondary">
                Ver Todas las Rifas
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Cómo Funciona */}
      <section className="como-funciona">
        <h2>📋 ¿Cómo Funciona?</h2>
        <div className="pasos">
          <div className="paso">
            <div className="paso-numero">1</div>
            <h3>Regístrate</h3>
            <p>Crea tu cuenta de forma gratuita y segura</p>
          </div>
          <div className="paso">
            <div className="paso-numero">2</div>
            <h3>Elige tu Rifa</h3>
            <p>Explora las rifas disponibles y selecciona tus números</p>
          </div>
          <div className="paso">
            <div className="paso-numero">3</div>
            <h3>Realiza tu Pago</h3>
            <p>Paga de forma segura por los números que elegiste</p>
          </div>
          <div className="paso">
            <div className="paso-numero">4</div>
            <h3>Espera el Sorteo</h3>
            <p>El sorteo se realiza con base en loterías nacionales</p>
          </div>
          <div className="paso">
            <div className="paso-numero">5</div>
            <h3>¡Gana Premios!</h3>
            <p>Si tu número coincide, recibes tu premio</p>
          </div>
        </div>
      </section>

      {/* Transparencia */}
      <section className="transparencia card">
        <h2>✅ Transparencia Garantizada</h2>
        <p>
          Todos nuestros sorteos se basan en los resultados de loterías nacionales oficiales,
          lo que garantiza total transparencia e imparcialidad. No manipulamos resultados,
          simplemente tomamos los números ganadores de la lotería del país especificado en cada rifa.
        </p>
        <ul className="caracteristicas">
          <li>✓ Resultados verificables públicamente</li>
          <li>✓ Basado en loterías nacionales oficiales</li>
          <li>✓ Sistema automatizado sin intervención humana</li>
          <li>✓ Historial completo de sorteos</li>
        </ul>
      </section>
    </div>
  );
}

export default Home;
