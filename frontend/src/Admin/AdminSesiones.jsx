import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminSesiones.css';

const AdminSesiones = () => {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroRol, setFiltroRol] = useState('todos');
  const [ordenar, setOrdenar] = useState('reciente');
  const [busqueda, setBusqueda] = useState('');

  // Cargar sesiones activas
  const cargarSesiones = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔍 [AdminSesiones] Cargando sesiones activas...');
      console.log('🔑 [AdminSesiones] Token:', token ? 'Presente' : 'Ausente');
      console.log('🌐 [AdminSesiones] URL:', `${import.meta.env.VITE_API_URL}/sesiones/activas`);
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/sesiones/activas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ [AdminSesiones] Respuesta recibida:', response.data);
      console.log('📊 [AdminSesiones] Total sesiones:', response.data.data?.length || 0);
      
      if (response.data.status === 'success') {
        setSesiones(response.data.data);
        console.log('✅ [AdminSesiones] Sesiones cargadas exitosamente');
      }
    } catch (err) {
      console.error('❌ [AdminSesiones] Error al cargar sesiones:', err);
      console.error('   Detalles:', {
        mensaje: err.message,
        respuesta: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      setError(err.response?.data?.message || 'Error al cargar sesiones');
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión específica
  const cerrarSesion = async (sessionId, nombreUsuario) => {
    if (!confirm(`¿Estás seguro de cerrar la sesión de ${nombreUsuario}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/sesiones/admin/cerrar/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        alert('Sesión cerrada exitosamente');
        cargarSesiones();
      }
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      alert(err.response?.data?.message || 'Error al cerrar sesión');
    }
  };

  // Cerrar todas las sesiones de un usuario
  const cerrarTodasSesionesUsuario = async (userId, nombreUsuario) => {
    if (!confirm(`¿Estás seguro de cerrar TODAS las sesiones de ${nombreUsuario}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/sesiones/admin/cerrar-usuario/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        alert(`${response.data.data.sesiones_cerradas} sesiones cerradas exitosamente`);
        cargarSesiones();
      }
    } catch (err) {
      console.error('Error al cerrar sesiones:', err);
      alert(err.response?.data?.message || 'Error al cerrar sesiones');
    }
  };

  // Expirar sesiones inactivas
  const expirarInactivas = async () => {
    if (!confirm('¿Deseas expirar todas las sesiones inactivas (más de 3 horas)?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/sesiones/expirar-inactivas`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        alert(`${response.data.data.sesiones_expiradas} sesiones expiradas`);
        cargarSesiones();
      }
    } catch (err) {
      console.error('Error al expirar sesiones:', err);
      alert(err.response?.data?.message || 'Error al expirar sesiones');
    }
  };

  // Filtrar y ordenar sesiones
  const sesionesFiltradas = () => {
    let resultado = [...sesiones];

    // Filtro por búsqueda
    if (busqueda) {
      resultado = resultado.filter(s => 
        s.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.correo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.ip?.includes(busqueda)
      );
    }

    // Filtro por rol
    if (filtroRol !== 'todos') {
      resultado = resultado.filter(s => s.rol === filtroRol);
    }

    // Ordenar
    if (ordenar === 'reciente') {
      resultado.sort((a, b) => new Date(b.ultimo_acceso) - new Date(a.ultimo_acceso));
    } else if (ordenar === 'antiguo') {
      resultado.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
    } else if (ordenar === 'usuario') {
      resultado.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    }

    return resultado;
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener color según tiempo restante
  const getColorTiempoRestante = (minutosRestantes) => {
    if (minutosRestantes < 30) return 'critico';
    if (minutosRestantes < 60) return 'advertencia';
    return 'normal';
  };

  // Cargar sesiones al montar
  useEffect(() => {
    cargarSesiones();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarSesiones, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="admin-sesiones">
        <div className="loading">Cargando sesiones activas...</div>
      </div>
    );
  }

  const sesionesMostradas = sesionesFiltradas();

  return (
    <div className="admin-sesiones">
      <div className="sesiones-header">
        <h1>🔐 Gestión de Sesiones Activas</h1>
        <p className="subtitle">Administra las sesiones de usuarios en tiempo real</p>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="sesiones-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">{sesiones.length}</span>
            <span className="stat-label">Sesiones Activas</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍💼</div>
          <div className="stat-info">
            <span className="stat-value">{sesiones.filter(s => s.rol === 'administrador').length}</span>
            <span className="stat-label">Administradores</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <span className="stat-value">{sesiones.filter(s => s.rol === 'vendedor').length}</span>
            <span className="stat-label">Vendedores</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <span className="stat-value">{sesiones.filter(s => s.rol === 'cliente').length}</span>
            <span className="stat-label">Clientes</span>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="sesiones-controles">
        <div className="controles-izquierda">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre, email o IP..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
          
          <select 
            value={filtroRol} 
            onChange={(e) => setFiltroRol(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos los roles</option>
            <option value="administrador">Administradores</option>
            <option value="supervisor">Supervisores</option>
            <option value="vendedor">Vendedores</option>
            <option value="cliente">Clientes</option>
          </select>

          <select 
            value={ordenar} 
            onChange={(e) => setOrdenar(e.target.value)}
            className="filter-select"
          >
            <option value="reciente">Más reciente</option>
            <option value="antiguo">Más antiguo</option>
            <option value="usuario">Por usuario</option>
          </select>
        </div>

        <div className="controles-derecha">
          <button onClick={cargarSesiones} className="btn-refresh">
            🔄 Actualizar
          </button>
          <button onClick={expirarInactivas} className="btn-expirar">
            ⏰ Expirar Inactivas
          </button>
        </div>
      </div>

      {/* Tabla de sesiones */}
      <div className="sesiones-tabla-container">
        {sesionesMostradas.length === 0 ? (
          <div className="no-sesiones">
            <p>No hay sesiones activas que coincidan con los filtros</p>
          </div>
        ) : (
          <table className="sesiones-tabla">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>IP / Ubicación</th>
                <th>Dispositivo</th>
                <th>Inicio de Sesión</th>
                <th>Último Acceso</th>
                <th>Tiempo Restante</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sesionesMostradas.map((sesion) => (
                <tr key={sesion.id}>
                  <td>
                    <div className="usuario-info">
                      <strong>{sesion.nombre}</strong>
                      <small>{sesion.correo}</small>
                    </div>
                  </td>
                  <td>
                    <span className={`rol-badge rol-${sesion.rol}`}>
                      {sesion.rol}
                    </span>
                  </td>
                  <td>
                    <div className="ip-info">
                      <code>{sesion.ip}</code>
                    </div>
                  </td>
                  <td>
                    <div className="dispositivo-info">
                      <div>{sesion.navegador || 'Desconocido'}</div>
                      <small>{sesion.sistema_operativo || 'Desconocido'}</small>
                    </div>
                  </td>
                  <td>
                    <small>{formatearFecha(sesion.fecha_inicio)}</small>
                  </td>
                  <td>
                    <small>{formatearFecha(sesion.ultimo_acceso)}</small>
                  </td>
                  <td>
                    <span className={`tiempo-restante ${getColorTiempoRestante(sesion.minutos_restantes)}`}>
                      {sesion.tiempo_restante}
                    </span>
                  </td>
                  <td>
                    <div className="acciones-sesion">
                      <button
                        onClick={() => cerrarSesion(sesion.id, sesion.nombre)}
                        className="btn-cerrar-sesion"
                        title="Cerrar esta sesión"
                      >
                        🚫
                      </button>
                      <button
                        onClick={() => cerrarTodasSesionesUsuario(sesion.id_usuario, sesion.nombre)}
                        className="btn-cerrar-todas"
                        title="Cerrar todas las sesiones de este usuario"
                      >
                        ❌
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Información adicional */}
      <div className="sesiones-info">
        <div className="info-card">
          <h3>ℹ️ Información sobre Sesiones</h3>
          <ul>
            <li>Las sesiones expiran automáticamente después de <strong>3 horas de inactividad</strong></li>
            <li>El tiempo se actualiza con cada petición del usuario</li>
            <li>Puedes cerrar manualmente cualquier sesión desde este panel</li>
            <li>Los datos se actualizan automáticamente cada 30 segundos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSesiones;
