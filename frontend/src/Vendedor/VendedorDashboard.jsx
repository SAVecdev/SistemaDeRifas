import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiGet } from '../utils/api';
import './VendedorDashboard.css';

function VendedorDashboard() {
  const [estadisticas, setEstadisticas] = useState({
    ventasHoy: { cantidad: 0, monto: 0 },
    ventasMes: { cantidad: 0, monto: 0 },
    clientes: 0,
    premiosHoy: { cantidad: 0, monto: 0 },
    recargasHoy: { cantidad: 0, monto: 0 },
    retirosHoy: { cantidad: 0, monto: 0 }
  });
  
  const [actividad, setActividad] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Cargar estadísticas
      try {
        console.log('🔄 Cargando estadísticas del dashboard...');
        const statsData = await apiGet('/vendedor-dashboard/estadisticas');
        console.log('📊 Estadísticas recibidas:', statsData);
        
        if (statsData && typeof statsData === 'object') {
          console.log('✅ Recargas hoy:', statsData.recargasHoy);
          console.log('✅ Retiros hoy:', statsData.retirosHoy);
          setEstadisticas(statsData);
        }
      } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
      }
      
      // Cargar actividad
      try {
        console.log('🔄 Cargando actividad reciente...');
        const actividadData = await apiGet('/vendedor-dashboard/actividad?limite=10');
        console.log('📋 Actividad recibida:', actividadData);
        
        if (Array.isArray(actividadData)) {
          setActividad(actividadData);
        }
      } catch (error) {
        console.error('❌ Error cargando actividad:', error);
      }
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="vendedor-dashboard">
        <div className="loading">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="vendedor-dashboard">
      <h1>💼 Panel de Vendedor</h1>
      <p className="subtitle">Gestiona tus ventas y atiende a los clientes</p>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icono">📊</div>
          <div className="stat-info">
            <div className="stat-titulo">Ventas Hoy</div>
            <div className="stat-valor">{estadisticas?.ventasHoy?.cantidad || 0}</div>
            <div className="stat-monto">${(estadisticas?.ventasHoy?.monto || 0).toFixed(2)}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icono">📈</div>
          <div className="stat-info">
            <div className="stat-titulo">Ventas del Mes</div>
            <div className="stat-valor">{estadisticas?.ventasMes?.cantidad || 0}</div>
            <div className="stat-monto">${(estadisticas?.ventasMes?.monto || 0).toFixed(2)}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icono">👥</div>
          <div className="stat-info">
            <div className="stat-titulo">Clientes en mi Área</div>
            <div className="stat-valor">{estadisticas?.clientes || 0}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icono">🏆</div>
          <div className="stat-info">
            <div className="stat-titulo">Premios Pagados Hoy</div>
            <div className="stat-valor">{estadisticas?.premiosHoy?.cantidad || 0}</div>
            <div className="stat-monto">${(estadisticas?.premiosHoy?.monto || 0).toFixed(2)}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icono">💵</div>
          <div className="stat-info">
            <div className="stat-titulo">Recargas Hoy</div>
            <div className="stat-valor">{estadisticas?.recargasHoy?.cantidad || 0}</div>
            <div className="stat-monto">${(estadisticas?.recargasHoy?.monto || 0).toFixed(2)}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icono">💸</div>
          <div className="stat-info">
            <div className="stat-titulo">Retiros Hoy</div>
            <div className="stat-valor">{estadisticas?.retirosHoy?.cantidad || 0}</div>
            <div className="stat-monto">${(estadisticas?.retirosHoy?.monto || 0).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="acciones-rapidas">
        <h2>Acciones Rápidas</h2>
        <div className="acciones-grid">
          <Link to="/vendedor/vender" className="card accion-card">
            <div className="accion-icono">🎫</div>
            <h3>Vender Números</h3>
            <p>Vende números de rifas a clientes</p>
          </Link>

          <Link to="/vendedor/registrar-usuario" className="card accion-card">
            <div className="accion-icono">➕</div>
            <h3>Registrar Usuario</h3>
            <p>Registra nuevos clientes</p>
          </Link>

          <Link to="/vendedor/premios-pagados" className="card accion-card">
            <div className="accion-icono">💰</div>
            <h3>Pagar Premio</h3>
            <p>Paga premios a ganadores</p>
          </Link>

          <Link to="/vendedor/mis-ventas" className="card accion-card">
            <div className="accion-icono">📋</div>
            <h3>Mis Ventas</h3>
            <p>Ver historial de ventas</p>
          </Link>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="card">
        <h2>📜 Actividad Reciente</h2>
        <div className="actividad-lista">
          {!Array.isArray(actividad) || actividad.length === 0 ? (
            <div className="no-datos">No hay actividad reciente</div>
          ) : (
            actividad.map((item, index) => (
              <div key={index} className="actividad-item">
                <div className={`actividad-icono ${item.tipo}`}>
                  {item.tipo === 'venta' && '🎫'}
                  {item.tipo === 'premio' && '🏆'}
                  {item.tipo === 'recarga' && '💵'}
                  {item.tipo === 'retiro' && '💸'}
                </div>
                <div className="actividad-info">
                  <div className="actividad-titulo">{item.descripcion}</div>
                  <div className="actividad-detalle">
                    {item.usuario}
                    {item.monto && ` - $${parseFloat(item.monto).toFixed(2)}`}
                  </div>
                </div>
                <div className="actividad-fecha">
                  {new Date(item.fecha).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default VendedorDashboard;
