import React, { useState, useEffect } from 'react';
import apiClient from '../utils/axios';
import './AdminTiposRifa.css';

/**
 * Componente AdminTiposRifa
 * CRUD completo para gestión de tipos de rifa
 */
const AdminTiposRifa = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    tipo: '',
    descripcion: '',
  });

  useEffect(() => {
    cargarTipos();
  }, []);

  /**
   * Carga todos los tipos de rifa
   */
  const cargarTipos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/tipos-rifa');
      setTipos(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar tipos de rifa:', err);
      setError('Error al cargar los tipos de rifa');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja cambios en los inputs del formulario
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Abre el formulario para crear nuevo tipo
   */
  const handleNuevo = () => {
    setFormData({
      tipo: '',
      descripcion: '',
    });
    setModoEdicion(false);
    setTipoSeleccionado(null);
    setMostrarFormulario(true);
  };

  /**
   * Abre el formulario para editar tipo existente
   */
  const handleEditar = (tipo) => {
    setFormData({
      tipo: tipo.tipo,
      descripcion: tipo.descripcion || '',
    });
    setModoEdicion(true);
    setTipoSeleccionado(tipo.id);
    setMostrarFormulario(true);
  };

  /**
   * Guarda el tipo (crear o actualizar)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modoEdicion) {
        // Actualizar
        await apiClient.put(`/tipos-rifa/${tipoSeleccionado}`, formData);
        alert('Tipo de rifa actualizado exitosamente');
      } else {
        // Crear
        await apiClient.post('/tipos-rifa', formData);
        alert('Tipo de rifa creado exitosamente');
      }
      
      setMostrarFormulario(false);
      cargarTipos();
    } catch (err) {
      console.error('Error al guardar tipo de rifa:', err);
      alert('Error al guardar el tipo de rifa');
    }
  };

  /**
   * Elimina un tipo de rifa
   */
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este tipo de rifa? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await apiClient.delete(`/tipos-rifa/${id}`);
      alert('Tipo de rifa eliminado exitosamente');
      cargarTipos();
    } catch (err) {
      console.error('Error al eliminar tipo de rifa:', err);
      alert('Error al eliminar el tipo de rifa. Puede que tenga premios asociados.');
    }
  };

  /**
   * Cancela el formulario
   */
  const handleCancelar = () => {
    setMostrarFormulario(false);
    setFormData({
      tipo: '',
      descripcion: '',
    });
    setModoEdicion(false);
    setTipoSeleccionado(null);
  };

  if (loading) {
    return (
      <div className="admin-tipos-loading">
        <div className="spinner"></div>
        <p>Cargando tipos de rifa...</p>
      </div>
    );
  }

  return (
    <div className="admin-tipos-rifa">
      <div className="tipos-header">
        <div>
          <h1>Gestión de Tipos de Rifa</h1>
          <p className="tipos-subtitle">Administra los tipos de rifa disponibles en el sistema</p>
        </div>
        <button className="btn-nuevo" onClick={handleNuevo}>
          <span className="btn-icon">➕</span>
          Nuevo Tipo
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <div className="modal-overlay" onClick={handleCancelar}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modoEdicion ? 'Editar Tipo de Rifa' : 'Nuevo Tipo de Rifa'}</h2>
              <button className="btn-close" onClick={handleCancelar}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="tipos-form">
              <div className="form-group">
                <label htmlFor="tipo">
                  Nombre del Tipo <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  placeholder="Ej: Rifa Diaria, Rifa Semanal"
                  required
                  maxLength={100}
                />
                <small className="form-hint">Máximo 100 caracteres</small>
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Describe las características de este tipo de rifa..."
                  rows={4}
                  maxLength={500}
                />
                <small className="form-hint">Opcional - Máximo 500 caracteres</small>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancelar" onClick={handleCancelar}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  {modoEdicion ? 'Actualizar' : 'Crear'} Tipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de Tipos */}
      <div className="tipos-table-container">
        {tipos.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>No hay tipos de rifa registrados</h3>
            <p>Crea el primer tipo de rifa para comenzar</p>
            <button className="btn-nuevo-empty" onClick={handleNuevo}>
              Crear Primer Tipo
            </button>
          </div>
        ) : (
          <table className="tipos-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Fecha Creación</th>
                <th className="acciones-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tipos.map((tipo) => (
                <tr key={tipo.id}>
                  <td className="id-col">{tipo.id}</td>
                  <td className="tipo-col">
                    <strong>{tipo.tipo}</strong>
                  </td>
                  <td className="descripcion-col">
                    {tipo.descripcion || <em className="text-muted">Sin descripción</em>}
                  </td>
                  <td className="fecha-col">
                    {tipo.created_at ? new Date(tipo.created_at).toLocaleDateString('es-ES') : '-'}
                  </td>
                  <td className="acciones-col">
                    <div className="acciones-buttons">
                      <button
                        className="btn-editar"
                        onClick={() => handleEditar(tipo)}
                        title="Editar tipo"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-eliminar"
                        onClick={() => handleEliminar(tipo.id)}
                        title="Eliminar tipo"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Contador */}
      {tipos.length > 0 && (
        <div className="tipos-footer">
          <p className="tipos-count">
            Total: <strong>{tipos.length}</strong> tipo{tipos.length !== 1 ? 's' : ''} de rifa
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminTiposRifa;
