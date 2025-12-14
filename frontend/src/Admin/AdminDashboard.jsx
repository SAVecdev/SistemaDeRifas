import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [rifasRecientes, setRifasRecientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [statsRes, rifasRes] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard/estadisticas'),
        axios.get('http://localhost:5000/api/dashboard/rifas-recientes')
      ]);
      setEstadisticas(statsRes.data);
      setRifasRecientes(rifasRes.data);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-dashboard"><p>Cargando...</p></div>;
  }

  if (!estadisticas) {
    return <div className="admin-dashboard"><p>Error al cargar datos</p></div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>⚙️ Panel de Administración</h1>
        <Link to="/admin/crear-rifa" className="btn btn-success">
          + Crear Nueva Rifa
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icono">🎲</div>
          <div className="stat-info">
            <div className="stat-titulo">Rifas Activas</div>
            <div className="stat-valor">{estadisticas.rifas?.rifas_activas || 0}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icono">✅</div>
          <div className="stat-info">
            <div className="stat-titulo">Rifas Finalizadas</div>
            <div className="stat-valor">{estadisticas.rifas?.rifas_finalizadas || 0}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icono">👥</div>
          <div className="stat-info">
            <div className="stat-titulo">Usuarios Registrados</div>
            <div className="stat-valor">{estadisticas.usuarios || 0}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icono">💰</div>
          <div className="stat-info">
            <div className="stat-titulo">Ventas Hoy</div>
            <div className="stat-valor">${Number(estadisticas.ventasHoy?.monto_total || 0).toFixed(2)}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icono">📊</div>
          <div className="stat-info">
            <div className="stat-titulo">Ventas del Mes</div>
            <div className="stat-valor">${Number(estadisticas.ventasMes?.monto_total || 0).toFixed(2)}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icono">🎫</div>
          <div className="stat-info">
            <div className="stat-titulo">Números Vendidos Hoy</div>
            <div className="stat-valor">{estadisticas.ventasHoy?.numeros_vendidos || 0}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icono">💎</div>
          <div className="stat-info">
            <div className="stat-titulo">Premios Pagados (8 días)</div>
            <div className="stat-valor">${Number(estadisticas.premiosRecientes?.monto_pagado || 0).toFixed(2)}</div>
            <div className="stat-subtitle">{estadisticas.premiosRecientes?.premios_pagados || 0} premios</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icono">⏳</div>
          <div className="stat-info">
            <div className="stat-titulo">Premios Pendientes (8 días)</div>
            <div className="stat-valor">${Number(estadisticas.premiosRecientes?.monto_pendiente || 0).toFixed(2)}</div>
            <div className="stat-subtitle">{estadisticas.premiosRecientes?.premios_pendientes || 0} premios</div>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="accesos-rapidos">
        <h2>Accesos Rápidos</h2>
        <div className="accesos-grid">
          <Link to="/admin/rifas" className="card acceso-card">
            <div className="acceso-icono">🎰</div>
            <h3>Gestionar Rifas</h3>
            <p>Ver, editar y administrar todas las rifas</p>
          </Link>

          <Link to="/admin/usuarios" className="card acceso-card">
            <div className="acceso-icono">👤</div>
            <h3>Gestionar Usuarios</h3>
            <p>Administrar usuarios y permisos</p>
          </Link>

          <Link to="/admin/sorteos" className="card acceso-card">
            <div className="acceso-icono">🎲</div>
            <h3>Realizar Sorteo</h3>
            <p>Ejecutar sorteos y declarar ganadores</p>
          </Link>

          <Link to="/admin/reportes" className="card acceso-card">
            <div className="acceso-icono">📈</div>
            <h3>Reportes</h3>
            <p>Ver estadísticas y reportes detallados</p>
          </Link>
        </div>
      </div>

      {/* Rifas Recientes */}
      <div className="card">
        <h2>Rifas Recientes</h2>
        <div className="tabla-container">
          <table className="tabla">
            <thead>
              <tr>
                <th>Título</th>
                <th>Progreso</th>
                <th>Ingresos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rifasRecientes.map(rifa => (
                <tr key={rifa.id}>
                  <td>{rifa.titulo}</td>
                  <td>
                    <div className="progreso-cell">
                      <span>{rifa.numeros_vendidos || 0} números vendidos</span>
                    </div>
                  </td>
                  <td>${Number(rifa.ingresos || 0).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${rifa.estado === 'activa' ? 'badge-success' : 'badge-secondary'}`}>
                      {rifa.estado}
                    </span>
                  </td>
                  <td>
                    <Link to={`/admin/rifas/${rifa.id}`} className="btn-small btn-primary">Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
