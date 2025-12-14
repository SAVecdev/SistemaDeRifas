import { useState, useEffect } from 'react';
import apiClient from '../utils/axios';
import './AdminAreas.css';

export default function AdminAreas() {
  const [areas, setAreas] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    saldo_02: 0,
    saldo_03: 0,
    saldo_04: 0,
    saldo_05: 0,
    saldo_06: 0
  });

  const [erroresValidacion, setErroresValidacion] = useState({});

  // Cargar áreas al montar el componente
  useEffect(() => {
    cargarAreas();
  }, []);

  const cargarAreas = async () => {
    try {
      setCargando(true);
      const response = await apiClient.get('/areas');
      console.log('📥 Áreas recibidas del backend:', response.data.data);
      setAreas(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Error al cargar las áreas');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  const abrirModal = (area = null) => {
    if (area) {
      setFormData({
        id: area.id,
        nombre: area.nombre,
        saldo_02: area.saldo_02 || 0,
        saldo_03: area.saldo_03 || 0,
        saldo_04: area.saldo_04 || 0,
        saldo_05: area.saldo_05 || 0,
        saldo_06: area.saldo_06 || 0
      });
      setModoEdicion(true);
    } else {
      setFormData({
        id: null,
        nombre: '',
        saldo_02: 0,
        saldo_03: 0,
        saldo_04: 0,
        saldo_05: 0,
        saldo_06: 0
      });
      setModoEdicion(false);
    }
    setErroresValidacion({});
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setFormData({
      id: null,
      nombre: '',
      saldo_02: 0,
      saldo_03: 0,
      saldo_04: 0,
      saldo_05: 0,
      saldo_06: 0
    });
    setErroresValidacion({});
  };

  const validarFormulario = () => {
    const errores = {};

    if (!formData.nombre.trim()) {
      errores.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 3) {
      errores.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre.length > 100) {
      errores.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    if (formData.descripcion && formData.descripcion.length > 500) {
      errores.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    setErroresValidacion(errores);
    return Object.keys(errores).length === 0;
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

      const datos = {
        nombre: formData.nombre.trim(),
        saldo_02: formData.saldo_02 === '' ? 0 : parseFloat(formData.saldo_02),
        saldo_03: formData.saldo_03 === '' ? 0 : parseFloat(formData.saldo_03),
        saldo_04: formData.saldo_04 === '' ? 0 : parseFloat(formData.saldo_04),
        saldo_05: formData.saldo_05 === '' ? 0 : parseFloat(formData.saldo_05),
        saldo_06: formData.saldo_06 === '' ? 0 : parseFloat(formData.saldo_06)
      };

      console.log('📤 Datos a enviar al backend:', datos);
      console.log('📤 Tipos de datos:', {
        saldo_02: typeof datos.saldo_02,
        saldo_03: typeof datos.saldo_03,
        saldo_04: typeof datos.saldo_04,
        saldo_05: typeof datos.saldo_05,
        saldo_06: typeof datos.saldo_06
      });

      if (modoEdicion) {
        const response = await apiClient.put(`/areas/${formData.id}`, datos);
        console.log('✅ Respuesta del backend (PUT):', response.data);
      } else {
        const response = await apiClient.post('/areas', datos);
        console.log('✅ Respuesta del backend (POST):', response.data);
      }

      await cargarAreas();
      cerrarModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el área');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta área?')) {
      return;
    }

    try {
      setCargando(true);
      await apiClient.delete(`/areas/${id}`);
      await cargarAreas();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar el área');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };



  const areasFiltradas = areas.filter(area =>
    area.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="admin-areas">
      <div className="areas-header">
        <div className="header-content">
          <h1>Gestión de Áreas</h1>
          <p className="subtitle">Administra las áreas de trabajo del sistema</p>
        </div>
        <button className="btn-nuevo" onClick={() => abrirModal()}>
          <span className="icon">+</span>
          Nueva Área
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="areas-filtros">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar áreas por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="stats">
          <span className="stat">
            <strong>{areasFiltradas.length}</strong> áreas encontradas
          </span>
          <span className="stat">
            <strong>{areas.length}</strong> en total
          </span>
        </div>
      </div>

      {cargando && areas.length === 0 ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando áreas...</p>
        </div>
      ) : areasFiltradas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No hay áreas disponibles</h3>
          <p>
            {busqueda
              ? 'No se encontraron áreas que coincidan con tu búsqueda'
              : 'Comienza creando tu primera área'}
          </p>
          {!busqueda && (
            <button className="btn-primary" onClick={() => abrirModal()}>
              Crear Primera Área
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="areas-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Saldo 2D</th>
                <th>Saldo 3D</th>
                <th>Saldo 4D</th>
                <th>Saldo 5D</th>
                <th>Saldo 6D</th>
                <th>Total Saldos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {areasFiltradas.map((area) => {
                const totalSaldos = 
                  (parseFloat(area.saldo_02) || 0) +
                  (parseFloat(area.saldo_03) || 0) +
                  (parseFloat(area.saldo_04) || 0) +
                  (parseFloat(area.saldo_05) || 0) +
                  (parseFloat(area.saldo_06) || 0);

                return (
                  <tr key={area.id}>
                    <td>
                      <span className="id-badge">#{area.id}</span>
                    </td>
                    <td>
                      <strong>{area.nombre}</strong>
                    </td>
                    <td>
                      <span className="saldo">${area.saldo_02 || 0}</span>
                    </td>
                    <td>
                      <span className="saldo">${area.saldo_03 || 0}</span>
                    </td>
                    <td>
                      <span className="saldo">${area.saldo_04 || 0}</span>
                    </td>
                    <td>
                      <span className="saldo">${area.saldo_05 || 0}</span>
                    </td>
                    <td>
                      <span className="saldo">${area.saldo_06 || 0}</span>
                    </td>
                    <td>
                      <span className="saldo saldo-total">${totalSaldos}</span>
                    </td>
                    <td>
                      <div className="acciones">
                        <button
                          className="btn-icon btn-editar"
                          onClick={() => abrirModal(area)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-eliminar"
                          onClick={() => handleEliminar(area.id)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para crear/editar área */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modoEdicion ? 'Editar Área' : 'Nueva Área'}</h2>
              <button className="btn-cerrar" onClick={cerrarModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="nombre">
                  Nombre del Área <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className={erroresValidacion.nombre ? 'input-error' : ''}
                  placeholder="Ej: Ventas, Soporte, Marketing..."
                  maxLength={100}
                  autoFocus
                />
                {erroresValidacion.nombre && (
                  <span className="error-message">{erroresValidacion.nombre}</span>
                )}
                <span className="char-count">
                  {formData.nombre.length}/100 caracteres
                </span>
              </div>

              <div className="form-group-row">
                <h3 className="section-title">💰 Saldos por Nivel de Premio</h3>
                <p className="section-subtitle">
                  Configura los montos disponibles para cada nivel de dígitos (2D-6D)
                </p>
              </div>

              <div className="form-group-row">
                <div className="form-group form-group-inline">
                  <label htmlFor="saldo_02">
                    Saldo 2 Dígitos (2D)
                  </label>
                  <input
                    type="number"
                    id="saldo_02"
                    value={formData.saldo_02}
                    onChange={(e) =>
                      setFormData({ ...formData, saldo_02: e.target.value })
                    }
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    lang="en"
                  />
                </div>

                <div className="form-group form-group-inline">
                  <label htmlFor="saldo_03">
                    Saldo 3 Dígitos (3D)
                  </label>
                  <input
                    type="number"
                    id="saldo_03"
                    value={formData.saldo_03}
                    onChange={(e) =>
                      setFormData({ ...formData, saldo_03: e.target.value })
                    }
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    lang="en"
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group form-group-inline">
                  <label htmlFor="saldo_04">
                    Saldo 4 Dígitos (4D)
                  </label>
                  <input
                    type="number"
                    id="saldo_04"
                    value={formData.saldo_04}
                    onChange={(e) =>
                      setFormData({ ...formData, saldo_04: e.target.value })
                    }
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    lang="en"
                  />
                </div>

                <div className="form-group form-group-inline">
                  <label htmlFor="saldo_05">
                    Saldo 5 Dígitos (5D)
                  </label>
                  <input
                    type="number"
                    id="saldo_05"
                    value={formData.saldo_05}
                    onChange={(e) =>
                      setFormData({ ...formData, saldo_05: e.target.value })
                    }
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    lang="en"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="saldo_06">
                  Saldo 6 Dígitos (6D)
                </label>
                <input
                  type="number"
                  id="saldo_06"
                  value={formData.saldo_06}
                  onChange={(e) =>
                    setFormData({ ...formData, saldo_06: e.target.value })
                  }
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  lang="en"
                />
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
                  {cargando ? (
                    <>
                      <span className="spinner-small"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      {modoEdicion ? 'Actualizar' : 'Crear'} Área
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
