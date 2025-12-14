import { useState, useEffect } from 'react';
import apiClient from '../utils/axios';
import './AdminTipoRifa.css';

const AdminTipoRifa = () => {
  const [tiposRifa, setTiposRifa] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    opciones: [] // { nivel_premio: 1, valor_premio: '' }
  });

  useEffect(() => {
    cargarTiposRifa();
  }, []);

  const cargarTiposRifa = async () => {
    try {
      setCargando(true);
      const response = await apiClient.get('/tipos-rifa');
      console.log('📥 Tipos de rifa recibidos del backend:', response.data.data);
      setTiposRifa(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Error al cargar los tipos de rifa');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  const abrirModal = (tipoRifa = null) => {
    if (tipoRifa) {
      setFormData({
        id: tipoRifa.id,
        nombre: tipoRifa.nombre,
        opciones: tipoRifa.opciones || []
      });
      setModoEdicion(true);
    } else {
      setFormData({
        id: null,
        nombre: '',
        opciones: []
      });
      setModoEdicion(false);
    }
    setMostrarModal(true);
    setError('');
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setModoEdicion(false);
    setFormData({
      id: null,
      nombre: '',
      opciones: []
    });
    setError('');
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (formData.nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return false;
    }
    if (formData.nombre.trim().length > 255) {
      setError('El nombre no puede exceder 255 caracteres');
      return false;
    }
    // Validar opciones si existen
    if (formData.opciones && formData.opciones.length > 0) {
      for (const op of formData.opciones) {
        if (!op.valor_premio || op.valor_premio === '') {
          setError('Todas las opciones deben tener un valor');
          return false;
        }
        if (isNaN(parseFloat(op.valor_premio))) {
          setError('El valor de la opción debe ser numérico');
          return false;
        }
      }
    }

    return true;
  };

  // Handlers para las opciones a ganar en el formulario
  const handleAgregarOpcion = () => {
    const nextNivel = formData.opciones.length > 0
      ? Math.max(...formData.opciones.map(o => o.nivel_premio)) + 1
      : 1;
    setFormData({
      ...formData,
      opciones: [...formData.opciones, { nivel_premio: nextNivel, valor_premio: '' }]
    });
  };

  const handleCambiarOpcion = (index, key, value) => {
    const nuevas = [...formData.opciones];
    if (key === 'valor_premio') {
      nuevas[index][key] = value;
    } else if (key === 'nivel_premio') {
      nuevas[index][key] = parseInt(value) || 0;
    }
    setFormData({ ...formData, opciones: nuevas });
  };

  const handleEliminarOpcion = (index) => {
    const nuevas = [...formData.opciones];
    nuevas.splice(index, 1);
    setFormData({ ...formData, opciones: nuevas });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      setCargando(true);
      setError('');

      console.log('📋 FormData antes de procesar:', formData);

      // Preparar datos incluyendo las opciones a ganar
      const datos = {
        nombre: formData.nombre.trim(),
        opciones: (formData.opciones || []).map(op => ({
          nivel_premio: Number(op.nivel_premio),
          valor_premio: Number(op.valor_premio)
        }))
      };

      console.log('📤 Datos a enviar al backend:', datos);

      if (modoEdicion) {
        const response = await apiClient.put(`/tipos-rifa/${formData.id}`, datos);
        console.log('✅ Respuesta del backend (PUT):', response.data);
      } else {
        const response = await apiClient.post('/tipos-rifa', datos);
        console.log('✅ Respuesta del backend (POST):', response.data);
      }

      await cargarTiposRifa();
      cerrarModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el tipo de rifa');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este tipo de rifa?')) {
      return;
    }

    try {
      setCargando(true);
      await apiClient.delete(`/tipos-rifa/${id}`);
      await cargarTiposRifa();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar el tipo de rifa');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  const tiposRifaFiltrados = tiposRifa.filter(tipo =>
    tipo.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="admin-tipo-rifa">
      <div className="tipo-rifa-header">
        <div className="header-content">
          <h1>Gestión de Tipos de Rifa</h1>
          <p className="subtitle">Administra los tipos de rifas del sistema</p>
        </div>
        <button className="btn-nuevo" onClick={() => abrirModal()}>
          <span className="icon">+</span>
          Nuevo Tipo de Rifa
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="tipo-rifa-filtros">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="table-container">
        {cargando ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Cargando...</p>
          </div>
        ) : (
          <table className="tipo-rifa-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tiposRifaFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="3" className="no-data">
                    {busqueda ? 'No se encontraron resultados' : 'No hay tipos de rifa registrados'}
                  </td>
                </tr>
              ) : (
                tiposRifaFiltrados.map((tipo) => (
                  <tr key={tipo.id}>
                    <td>{tipo.id}</td>
                    <td className="nombre-cell">{tipo.nombre}</td>
                    <td className="actions-cell">
                      <button
                        className="btn-edit"
                        onClick={() => abrirModal(tipo)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleEliminar(tipo.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {mostrarModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modoEdicion ? 'Editar Tipo de Rifa' : 'Nuevo Tipo de Rifa'}</h2>
              <button className="btn-close" onClick={cerrarModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombre">
                  Nombre <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Rifa Diaria, Rifa Semanal, etc."
                  maxLength="255"
                  required
                />
              </div>
              
              <div className="form-group opciones-group">
                <label>Opciones a ganar</label>
                <div className="opciones-list">
                  {(formData.opciones || []).length === 0 && (
                    <div className="no-opciones">No hay opciones definidas. Agrega al menos una.</div>
                  )}
                  {(formData.opciones || []).map((op, idx) => (
                    <div key={idx} className="opcion-row">
                      <input
                        type="number"
                        min="1"
                        value={op.nivel_premio}
                        onChange={(e) => handleCambiarOpcion(idx, 'nivel_premio', e.target.value)}
                        className="input-nivel"
                        placeholder="Nivel"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={op.valor_premio}
                        onChange={(e) => handleCambiarOpcion(idx, 'valor_premio', e.target.value)}
                        className="input-valor"
                        placeholder="Valor premio"
                      />
                      <button type="button" className="btn-eliminar-opcion" onClick={() => handleEliminarOpcion(idx)}>Eliminar</button>
                    </div>
                  ))}
                </div>

                <div className="opciones-actions">
                  <button type="button" className="btn-add-opcion" onClick={handleAgregarOpcion}>➕ Agregar Opción</button>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={cerrarModal}
                  disabled={cargando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={cargando}
                >
                  {cargando ? 'Guardando...' : modoEdicion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTipoRifa;
