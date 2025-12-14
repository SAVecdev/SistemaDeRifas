import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiGet } from '../utils/api';
import './SupervisorDashboard.css';

function SupervisorDashboard() {
  const [estadisticas, setEstadisticas] = useState({
    rifas: { total_rifas: 0, rifas_activas: 0, rifas_finalizadas: 0 },
    usuarios: 0,
    ventasHoy: { total_ventas: 0, numeros_vendidos: 0, monto_total: 0 },
    ventasMes: { total_ventas: 0, monto_total: 0 },
    premiosHoy: { total_premios: 0, monto_premios: 0 },
    premiosRecientes: { 
      total_premios: 0, 
      monto_total: 0, 
      monto_pagado: 0, 
      monto_pendiente: 0,
      premios_pagados: 0,
      premios_pendientes: 0
    }
  });
  const [rifasRecientes, setRifasRecientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Obtener información del usuario actual
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const { rol, id } = usuario;
      
      console.log('Usuario supervisor:', { rol, id });
      
      // Construir parámetros de consulta para supervisores
      const queryParams = rol === 'supervisor' && id 
        ? `?rol=${rol}&id_usuario=${id}` 
        : '';
      
      const [stats, rifas] = await Promise.all([
        apiGet(`/dashboard/estadisticas${queryParams}`),
        apiGet(`/dashboard/rifas-recientes${queryParams}`)
      ]);
      
      setEstadisticas(stats);
      setRifasRecientes(rifas);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="supervisor-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supervisor-dashboard">
      <h1>👁️ Panel de Supervisor</h1>
      <p className="subtitle">Supervisa las operaciones y el desempeño del equipo</p>

      {/* Estadísticas Generales */}
      <div className="stats-grid">
        <div className="card stat-card stat-ventas">
          <div className="stat-icono">💰</div>
          <div className="stat-info">
            <div className="stat-titulo">Ventas del Mes</div>
            <div className="stat-valor">${Number(estadisticas.ventasMes.monto_total || 0).toFixed(2)}</div>
            <div className="stat-detalle">{estadisticas.ventasMes.total_ventas || 0} transacciones</div>
          </div>
        </div>

        <div className="card stat-card stat-rifas">
          <div className="stat-icono">🎲</div>
          <div className="stat-info">
            <div className="stat-titulo">Rifas Activas</div>
            <div className="stat-valor">{estadisticas.rifas.rifas_activas || 0}</div>
            <div className="stat-detalle">{estadisticas.rifas.total_rifas || 0} total</div>
          </div>
        </div>

        <div className="card stat-card stat-usuarios">
          <div className="stat-icono">👥</div>
          <div className="stat-info">
            <div className="stat-titulo">Clientes de mis Vendedores</div>
            <div className="stat-valor">{estadisticas.usuarios || 0}</div>
          </div>
        </div>

        <div className="card stat-card stat-hoy">
          <div className="stat-icono">📊</div>
          <div className="stat-info">
            <div className="stat-titulo">Ventas Hoy</div>
            <div className="stat-valor">{estadisticas.ventasHoy.total_ventas || 0}</div>
            <div className="stat-detalle">${Number(estadisticas.ventasHoy.monto_total || 0).toFixed(2)}</div>
          </div>
        </div>

        <div className="card stat-card stat-numeros">
          <div className="stat-icono">🎫</div>
          <div className="stat-info">
            <div className="stat-titulo">Números Vendidos Hoy</div>
            <div className="stat-valor">{estadisticas.ventasHoy.numeros_vendidos || 0}</div>
          </div>
        </div>

        <div className="card stat-card stat-premios">
          <div className="stat-icono">🏆</div>
          <div className="stat-info">
            <div className="stat-titulo">Premios (8 días)</div>
            <div className="stat-valor">{estadisticas.premiosRecientes.total_premios || 0}</div>
            <div className="stat-detalle">
              ${Number(estadisticas.premiosRecientes.monto_total || 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de Premios */}
      <div className="premios-stats-section">
        <h2>💰 Estado de Premios (Últimos 8 días)</h2>
        <div className="premios-stats-grid">
          <div className="card premio-stat-card pagados">
            <div className="premio-stat-icon">✅</div>
            <div className="premio-stat-info">
              <div className="premio-stat-titulo">Premios Pagados</div>
              <div className="premio-stat-valor">{estadisticas.premiosRecientes.premios_pagados || 0}</div>
              <div className="premio-stat-monto">
                ${Number(estadisticas.premiosRecientes.monto_pagado || 0).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="card premio-stat-card pendientes">
            <div className="premio-stat-icon">⏳</div>
            <div className="premio-stat-info">
              <div className="premio-stat-titulo">Premios Pendientes</div>
              <div className="premio-stat-valor">{estadisticas.premiosRecientes.premios_pendientes || 0}</div>
              <div className="premio-stat-monto">
                ${Number(estadisticas.premiosRecientes.monto_pendiente || 0).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="card premio-stat-card hoy">
            <div className="premio-stat-icon">🎁</div>
            <div className="premio-stat-info">
              <div className="premio-stat-titulo">Premios Hoy</div>
              <div className="premio-stat-valor">{estadisticas.premiosHoy.total_premios || 0}</div>
              <div className="premio-stat-monto">
                ${Number(estadisticas.premiosHoy.monto_premios || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="accesos-rapidos">
        <h2>Accesos Rápidos</h2>
        <div className="accesos-grid">
          <Link to="/supervisor/vendedores" className="card acceso-card">
            <div className="acceso-icono">👥</div>
            <h3>Gestión de Vendedores</h3>
            <p>Ver y supervisar vendedores</p>
          </Link>

          <Link to="/supervisor/rifas" className="card acceso-card">
            <div className="acceso-icono">🎰</div>
            <h3>Supervisar Rifas</h3>
            <p>Ver estado de rifas activas</p>
          </Link>

          <Link to="/supervisor/transacciones" className="card acceso-card">
            <div className="acceso-icono">💳</div>
            <h3>Transacciones</h3>
            <p>Revisar todas las transacciones</p>
          </Link>

          <Link to="/supervisor/reportes" className="card acceso-card">
            <div className="acceso-icono">📈</div>
            <h3>Reportes</h3>
            <p>Ver reportes y estadísticas</p>
          </Link>
        </div>
      </div>

      {/* Rifas Recientes */}
      <div className="card rifas-recientes-section">
        <h2>🎲 Rifas Recientes</h2>
        {rifasRecientes.length > 0 ? (
          <div className="rifas-table-container">
            <table className="rifas-table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Fecha Juego</th>
                  <th>Ventas</th>
                  <th>Números</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {rifasRecientes.map((rifa) => (
                  <tr key={rifa.id}>
                    <td className="rifa-titulo">{rifa.titulo}</td>
                    <td>
                      <span className={`badge-estado ${rifa.estado}`}>
                        {rifa.estado === 'activa' ? '🟢 Activa' : '🔴 Finalizada'}
                      </span>
                    </td>
                    <td>
                      {new Date(rifa.fecha_hora_juego).toLocaleString('es-EC', {
                        timeZone: 'America/Guayaquil',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="text-center">{rifa.total_ventas || 0}</td>
                    <td className="text-center">{rifa.numeros_vendidos || 0}</td>
                    <td className="monto">${Number(rifa.ingresos || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No hay rifas registradas</p>
        )}
      </div>

      {/* Nota informativa */}
      <div className="card info-card">
        <h3>ℹ️ Información</h3>
        <p>
          Como supervisor, puedes visualizar todas las operaciones del sistema, 
          incluyendo ventas y pagos realizados por los vendedores. Sin embargo, 
          no puedes modificar configuraciones del sistema ni realizar ventas directamente.
        </p>
      </div>
    </div>
  );
}

export default SupervisorDashboard;
