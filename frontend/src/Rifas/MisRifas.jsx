import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MisRifas.css';

function MisRifas() {
  const { usuario } = useAuth();
  const [filtro, setFiltro] = useState('activas');
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (usuario?.id) {
      cargarVentas();
    }
  }, [usuario]);

  const cargarVentas = async () => {
    try {
      setCargando(true);
      setError(null);
      
      const response = await fetch(`/api/ventas/usuario/${usuario.id}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setVentas(data.data || []);
      } else {
        setError('Error al cargar las ventas');
      }
    } catch (error) {
      console.error('Error cargando ventas:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  // Agrupar ventas por rifa
  const agruparVentasPorRifa = () => {
    const grupos = {};
    
    ventas.forEach(venta => {
      const rifaId = venta.id_rifas;
      if (!grupos[rifaId]) {
        grupos[rifaId] = {
          id_rifa: rifaId,
          titulo: venta.rifa_nombre || `Rifa #${rifaId}`,
          fecha_sorteo: venta.fecha_hora_juego,
          numeros: [],
          total_invertido: 0,
          ventas: []
        };
      }
      
      grupos[rifaId].numeros.push(venta.numero);
      grupos[rifaId].total_invertido += parseFloat(venta.total || 0);
      grupos[rifaId].ventas.push(venta);
    });
    
    return Object.values(grupos);
  };

  const rifasAgrupadas = agruparVentasPorRifa();
  
  // Filtrar por estado (activas vs finalizadas)
  const rifasActivas = rifasAgrupadas.filter(rifa => {
    if (!rifa.fecha_sorteo) return true;
    return new Date(rifa.fecha_sorteo) >= new Date();
  });
  
  const rifasFinalizadas = rifasAgrupadas.filter(rifa => {
    if (!rifa.fecha_sorteo) return false;
    return new Date(rifa.fecha_sorteo) < new Date();
  });

  const rifasAMostrar = filtro === 'activas' ? rifasActivas : rifasFinalizadas;

  if (cargando) {
    return (
      <div className="mis-rifas-container">
        <div className="loading">Cargando historial de compras...</div>
      </div>
    );
  }

  return (
    <div className="mis-rifas-container">
      <h1>🎲 Mi Historial de Compras</h1>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Resumen */}
      <div className="resumen-grid">
        <div className="card resumen-card">
          <div className="resumen-icono">🎫</div>
          <div className="resumen-info">
            <div className="resumen-valor">{rifasActivas.length}</div>
            <div className="resumen-label">Rifas Activas</div>
          </div>
        </div>

        <div className="card resumen-card">
          <div className="resumen-icono">🔢</div>
          <div className="resumen-info">
            <div className="resumen-valor">
              {rifasActivas.reduce((sum, r) => sum + r.numeros.length, 0)}
            </div>
            <div className="resumen-label">Números en Juego</div>
          </div>
        </div>

        <div className="card resumen-card">
          <div className="resumen-icono">💰</div>
          <div className="resumen-info">
            <div className="resumen-valor">
              ${rifasActivas.reduce((sum, r) => sum + r.total_invertido, 0).toFixed(2)}
            </div>
            <div className="resumen-label">Invertido en Activas</div>
          </div>
        </div>

        <div className="card resumen-card">
          <div className="resumen-icono">📊</div>
          <div className="resumen-info">
            <div className="resumen-valor">{ventas.length}</div>
            <div className="resumen-label">Total Compras</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-rifas">
        <button
          className={`btn ${filtro === 'activas' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFiltro('activas')}
        >
          Rifas Activas
        </button>
        <button
          className={`btn ${filtro === 'finalizadas' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFiltro('finalizadas')}
        >
          Historial
        </button>
      </div>

      {/* Lista de Rifas */}
      <div className="rifas-lista">
        {rifasAMostrar.length === 0 ? (
          <div className="no-rifas card">
            <p>No tienes {filtro === 'activas' ? 'rifas activas' : 'compras finalizadas'}</p>
            <Link to="/rifas" className="btn btn-primary">
              Explorar Rifas
            </Link>
          </div>
        ) : (
          rifasAMostrar.map(rifa => (
            <div key={rifa.id_rifa} className="card rifa-item">
              <div className="rifa-item-info">
                <h3>{rifa.titulo}</h3>
                
                <div className="rifa-detalles-grid">
                  <div className="detalle">
                    <span className="detalle-label">Mis números:</span>
                    <div className="numeros-badges">
                      {rifa.numeros.map((num, idx) => (
                        <span key={idx} className="numero-badge">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>

                  {rifa.fecha_sorteo && (
                    <div className="detalle">
                      <span className="detalle-label">Fecha sorteo:</span>
                      <span className="detalle-valor">
                        {new Date(rifa.fecha_sorteo).toLocaleString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}

                  <div className="detalle">
                    <span className="detalle-label">Total Invertido:</span>
                    <span className="detalle-valor">${rifa.total_invertido.toFixed(2)}</span>
                  </div>

                  <div className="detalle">
                    <span className="detalle-label">Cantidad de compras:</span>
                    <span className="detalle-valor">{rifa.ventas.length}</span>
                  </div>

                  <div className="detalle">
                    <span className="detalle-label">Estado de pago:</span>
                    <span className="detalle-valor">
                      {rifa.ventas.every(v => v.pagada) ? '✅ Pagado' : '⏳ Pendiente'}
                    </span>
                  </div>
                </div>

                {/* Detalle de cada compra/venta */}
                <div className="ventas-detalle">
                  <h4>Detalle de compras:</h4>
                  {rifa.ventas.map(venta => (
                    <div key={venta.id} className="venta-item">
                      <div className="venta-info">
                        <span className="venta-numero">Número: <strong>{venta.numero}</strong></span>
                        <span className="venta-cantidad">Cantidad: {venta.cantidad}</span>
                        <span className="venta-total">Total: ${parseFloat(venta.total).toFixed(2)}</span>
                        <span className="venta-fecha">
                          {new Date(venta.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      {venta.factura && (
                        <span className="venta-factura">Factura: {venta.factura}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rifa-item-acciones">
                <Link to="/usuario/comprar" className="btn btn-primary">
                  Comprar Más Números
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MisRifas;
