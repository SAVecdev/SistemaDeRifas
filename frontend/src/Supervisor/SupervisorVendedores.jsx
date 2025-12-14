import { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../utils/api';
import './SupervisorVendedores.css';

const SupervisorVendedores = () => {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState(null);
  const [modalDetalles, setModalDetalles] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => {
    cargarVendedores();
  }, []);

  const cargarVendedores = async () => {
    try {
      setLoading(true);
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const response = await apiGet(`/supervisor/vendedores/${usuario.id}`);
      setVendedores(response.vendedores || []);
    } catch (error) {
      console.error('Error cargando vendedores:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar vendedores' });
    } finally {
      setLoading(false);
    }
  };

  const verDetalles = async (vendedor) => {
    try {
      setVendedorSeleccionado(vendedor);
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const stats = await apiGet(`/supervisor/vendedores/${vendedor.id}/estadisticas?idSupervisor=${usuario.id}`);
      setEstadisticas(stats);
      setModalDetalles(true);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar estadísticas del vendedor' });
    }
  };

  const cambiarEstado = async (vendedorId, nuevoEstado) => {
    if (!window.confirm(`¿Confirmar ${nuevoEstado === 1 ? 'activar' : 'desactivar'} vendedor?`)) {
      return;
    }

    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      await apiPut(`/supervisor/vendedores/${vendedorId}/estado`, { 
        activo: nuevoEstado,
        idSupervisor: usuario.id
      });
      setMensaje({ 
        tipo: 'success', 
        texto: `Vendedor ${nuevoEstado === 1 ? 'activado' : 'desactivado'} exitosamente` 
      });
      cargarVendedores();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      setMensaje({ tipo: 'error', texto: error.error || 'Error al cambiar estado' });
    }
  };

  const cerrarModal = () => {
    setModalDetalles(false);
    setVendedorSeleccionado(null);
    setEstadisticas(null);
  };

  if (loading) {
    return (
      <div className="supervisor-vendedores-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando vendedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supervisor-vendedores-container">
      <div className="vendedores-header">
        <div className="header-content">
          <h1 className="vendedores-title">👥 Mis Vendedores</h1>
          <p className="vendedores-subtitle">Gestiona a los vendedores bajo tu supervisión</p>
        </div>
      </div>

      {mensaje.texto && (
        <div className={`mensaje mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
          <button onClick={() => setMensaje({ tipo: '', texto: '' })} className="btn-cerrar-mensaje">
            ✕
          </button>
        </div>
      )}

      {vendedores.length === 0 ? (
        <div className="no-vendedores">
          <div className="no-vendedores-icon">👤</div>
          <h3>No tienes vendedores asignados</h3>
          <p>Contacta al administrador para que te asigne vendedores a supervisar</p>
        </div>
      ) : (
        <div className="vendedores-grid">
          {vendedores.map((vendedor) => (
            <div key={vendedor.id} className={`vendedor-card ${vendedor.activo === 0 ? 'inactivo' : ''}`}>
              <div className="vendedor-card-header">
                <div className="vendedor-avatar">
                  {vendedor.foto_perfil ? (
                    <img src={vendedor.foto_perfil} alt={vendedor.nombre} />
                  ) : (
                    <div className="avatar-placeholder">
                      {vendedor.nombre?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div className="vendedor-estado">
                  <span className={`badge-estado ${vendedor.activo === 1 ? 'activo' : 'inactivo'}`}>
                    {vendedor.activo === 1 ? '🟢 Activo' : '🔴 Inactivo'}
                  </span>
                </div>
              </div>

              <div className="vendedor-card-body">
                <h3 className="vendedor-nombre">{vendedor.nombre}</h3>
                <div className="vendedor-info">
                  <div className="info-item">
                    <span className="info-icon">📧</span>
                    <span className="info-text">{vendedor.correo}</span>
                  </div>
                  {vendedor.telefono && (
                    <div className="info-item">
                      <span className="info-icon">📱</span>
                      <span className="info-text">{vendedor.telefono}</span>
                    </div>
                  )}
                  {vendedor.direccion && (
                    <div className="info-item">
                      <span className="info-icon">📍</span>
                      <span className="info-text">{vendedor.direccion}</span>
                    </div>
                  )}
                </div>

                <div className="vendedor-stats">
                  <div className="stat-item">
                    <div className="stat-value">{vendedor.ventas_mes || 0}</div>
                    <div className="stat-label">Ventas este mes</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">${Number(vendedor.monto_mes || 0).toFixed(2)}</div>
                    <div className="stat-label">Total generado</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{vendedor.clientes_registrados || 0}</div>
                    <div className="stat-label">Clientes</div>
                  </div>
                </div>
              </div>

              <div className="vendedor-card-footer">
                <button 
                  className="btn btn-secondary btn-small"
                  onClick={() => verDetalles(vendedor)}
                >
                  📊 Ver Detalles
                </button>
                <button 
                  className={`btn ${vendedor.activo === 1 ? 'btn-danger' : 'btn-success'} btn-small`}
                  onClick={() => cambiarEstado(vendedor.id, vendedor.activo === 1 ? 0 : 1)}
                >
                  {vendedor.activo === 1 ? '🔒 Desactivar' : '✅ Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalles */}
      {modalDetalles && vendedorSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 Estadísticas de {vendedorSeleccionado.nombre}</h2>
              <button className="btn-close-modal" onClick={cerrarModal}>✕</button>
            </div>
            
            <div className="modal-body">
              {estadisticas ? (
                <>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">💰</div>
                      <div className="stat-info">
                        <div className="stat-titulo">Ventas Totales</div>
                        <div className="stat-valor">{estadisticas.ventas_totales || 0}</div>
                        <div className="stat-detalle">
                          ${Number(estadisticas.monto_total || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">📅</div>
                      <div className="stat-info">
                        <div className="stat-titulo">Este Mes</div>
                        <div className="stat-valor">{estadisticas.ventas_mes || 0}</div>
                        <div className="stat-detalle">
                          ${Number(estadisticas.monto_mes || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">👥</div>
                      <div className="stat-info">
                        <div className="stat-titulo">Clientes</div>
                        <div className="stat-valor">{estadisticas.clientes_totales || 0}</div>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">🏆</div>
                      <div className="stat-info">
                        <div className="stat-titulo">Premios Pagados</div>
                        <div className="stat-valor">{estadisticas.premios_pagados || 0}</div>
                        <div className="stat-detalle">
                          ${Number(estadisticas.monto_premios || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="detalles-adicionales">
                    <h3>Información Adicional</h3>
                    <div className="detalle-row">
                      <span className="detalle-label">Promedio por venta:</span>
                      <span className="detalle-value">
                        ${estadisticas.ventas_totales > 0 
                          ? (estadisticas.monto_total / estadisticas.ventas_totales).toFixed(2)
                          : '0.00'}
                      </span>
                    </div>
                    <div className="detalle-row">
                      <span className="detalle-label">Última venta:</span>
                      <span className="detalle-value">
                        {estadisticas.ultima_venta 
                          ? new Date(estadisticas.ultima_venta).toLocaleDateString('es-EC')
                          : 'Sin ventas'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Cargando estadísticas...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorVendedores;
