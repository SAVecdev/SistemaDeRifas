import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axios';
import './AdminRifas.css';

function AdminRifas() {
  const navigate = useNavigate();
  const [rifas, setRifas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    cargarRifas();
  }, []);

  const cargarRifas = async () => {
    try {
      // Usar endpoint real que devuelve rifas desde la base de datos
      const response = await apiClient.get('/rifas-completas');
      setRifas(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar rifas:', error);
      setLoading(false);
    }
  };

  const handleEliminar = async (id, titulo) => {
    if (!confirm(`¿Está seguro de eliminar la rifa "${titulo}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      // Usar endpoint de rifas completas (backend gestiona validaciones)
      await apiClient.delete(`/rifas-completas/${id}`);
      alert('Rifa eliminada exitosamente');
      cargarRifas();
    } catch (error) {
      console.error('Error al eliminar rifa:', error);
      const msg = error.response?.data?.message || error.message || 'Error al eliminar la rifa';
      alert(msg);
    }
  };

  const handleCambiarEstado = async (id, estadoActual) => {
    const estados = ['activa', 'pausada', 'cancelada', 'finalizada'];
    const indiceActual = estados.indexOf(estadoActual);
    const nuevoEstado = estados[(indiceActual + 1) % estados.length];

    if (!confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) {
      return;
    }

    try {
      await apiClient.patch(`/rifas/${id}/estado`, { estado: nuevoEstado });
      alert(`Estado cambiado a "${nuevoEstado}"`);
      cargarRifas();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado');
    }
  };

  const rifasFiltradas = rifas.filter(rifa => {
    if (filtro === 'todas') return true;
    return (rifa.estado || '').toString() === filtro;
  });

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'activa': return 'badge-success';
      case 'pausada': return 'badge-warning';
      case 'cancelada': return 'badge-danger';
      case 'finalizada': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  if (loading) {
    return (
      <div className="admin-rifas">
        <p>Cargando rifas...</p>
      </div>
    );
  }

  return (
    <div className="admin-rifas">
      <div className="admin-header">
        <h1>🎰 Gestión de Rifas</h1>
        <button 
          className="btn btn-success"
          onClick={() => navigate('/admin/crear-rifa')}
        >
          + Nueva Rifa
        </button>
      </div>

      {/* Filtros */}
      <div className="card" style={{ padding: '15px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>Filtrar por estado:</span>
          <button 
            className={`btn-small ${filtro === 'todas' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltro('todas')}
          >
            Todas ({rifas.length})
          </button>
          <button 
            className={`btn-small ${filtro === 'activa' ? 'btn-success' : 'btn-secondary'}`}
            onClick={() => setFiltro('activa')}
          >
            Activas ({rifas.filter(r => r.estado === 'activa').length})
          </button>
          <button 
            className={`btn-small ${filtro === 'pausada' ? 'btn-warning' : 'btn-secondary'}`}
            onClick={() => setFiltro('pausada')}
          >
            Pausadas ({rifas.filter(r => r.estado === 'pausada').length})
          </button>
          <button 
            className={`btn-small ${filtro === 'finalizada' ? 'btn-secondary' : 'btn-secondary'}`}
            onClick={() => setFiltro('finalizada')}
          >
            Finalizadas ({rifas.filter(r => r.estado === 'finalizada').length})
          </button>
        </div>
      </div>

      <div className="tabla-container card">
        {rifasFiltradas.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No hay rifas con el estado seleccionado
          </p>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th>Sorteos</th>
                <th>Fecha Sorteo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rifasFiltradas.map(rifa => (
                <tr key={rifa.id}>
                  <td>#{rifa.id}</td>
                  <td className="descripcion-cell">{rifa.descripcion || rifa.titulo}</td>
                  <td>{rifa.tipo_nombre || (rifa.tipo || '—')}</td>
                  <td>{rifa.sorteos ?? '—'}</td>
                  <td>{rifa.fecha_hora_juego ? new Date(rifa.fecha_hora_juego).toLocaleString() : (rifa.fecha_sorteo ? new Date(rifa.fecha_sorteo).toLocaleString() : '—')}</td>
                  <td>
                    <span 
                      className={`badge ${getBadgeClass(rifa.estado)}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleCambiarEstado(rifa.id, rifa.estado)}
                      title="Click para cambiar estado"
                    >
                      {rifa.estado || '—'}
                    </span>
                  </td>
                  <td>
                    <div className="acciones-botones">
                      <button 
                        className="btn-small btn-primary"
                        onClick={() => navigate(`/admin/rifas/editar/${rifa.id}`)}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        className="btn-small btn-danger"
                        onClick={() => handleEliminar(rifa.id, rifa.titulo)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminRifas;
