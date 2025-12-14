import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axios';
import './AdminRifas.css';

function PlantillasPremios() {
  const navigate = useNavigate();
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);

  const [formData, setFormData] = useState({
    tipo: 'PREMIUM',
    nombre: '',
    descripcion: '',
    saldo: '',
    digitos: 4,
    premio_01: '',
    premio_02: '',
    premio_03: '',
    premio_04: '',
    premio_05: '',
    premio_06: '',
    premio_07: '',
    premio_08: '',
    premio_09: '',
    premio_10: '',
    id_sucursal: 1
  });

  useEffect(() => {
    cargarPlantillas();
  }, []);

  const cargarPlantillas = async () => {
    try {
      const response = await apiClient.get('/plantillas-premios');
      setPlantillas(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNuevaPlantilla = () => {
    setModoEdicion(false);
    setPlantillaSeleccionada(null);
    setFormData({
      tipo: 'PREMIUM',
      nombre: '',
      descripcion: '',
      saldo: '',
      digitos: 4,
      premio_01: '',
      premio_02: '',
      premio_03: '',
      premio_04: '',
      premio_05: '',
      premio_06: '',
      premio_07: '',
      premio_08: '',
      premio_09: '',
      premio_10: '',
      id_sucursal: 1
    });
    setMostrarFormulario(true);
  };

  const handleEditarPlantilla = async (id) => {
    try {
      const response = await apiClient.get(`/plantillas-premios/${id}`);
      const plantilla = response.data.data;
      
      setModoEdicion(true);
      setPlantillaSeleccionada(id);
      setFormData(plantilla);
      setMostrarFormulario(true);
    } catch (error) {
      console.error('Error al cargar plantilla:', error);
      alert('Error al cargar la plantilla');
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!confirm(`¿Está seguro de eliminar la plantilla "${nombre}"?\n\nLas rifas que usan esta plantilla NO perderán sus premios.`)) {
      return;
    }

    try {
      await apiClient.delete(`/plantillas-premios/${id}`);
      alert('Plantilla eliminada exitosamente');
      cargarPlantillas();
    } catch (error) {
      console.error('Error al eliminar plantilla:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Error al eliminar la plantilla');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modoEdicion) {
        await apiClient.put(`/plantillas-premios/${plantillaSeleccionada}`, formData);
        alert('Plantilla actualizada exitosamente');
      } else {
        await apiClient.post('/plantillas-premios', formData);
        alert('Plantilla creada exitosamente');
      }
      
      setMostrarFormulario(false);
      cargarPlantillas();
    } catch (error) {
      console.error('Error al guardar plantilla:', error);
      alert('Error al guardar la plantilla');
    }
  };

  const handleToggleActiva = async (id, activaActual) => {
    try {
      await apiClient.patch(`/plantillas-premios/${id}/toggle`, {
        activa: !activaActual
      });
      cargarPlantillas();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado');
    }
  };

  const plantillasFiltradas = plantillas.filter(p => {
    if (filtroTipo === 'todas') return true;
    return p.tipo === filtroTipo;
  });

  const tiposUnicos = [...new Set(plantillas.map(p => p.tipo))];

  if (loading) {
    return (
      <div className="admin-rifas">
        <p>Cargando plantillas...</p>
      </div>
    );
  }

  return (
    <div className="admin-rifas">
      <div className="admin-header">
        <h1>🏆 Plantillas de Premios</h1>
        <button 
          className="btn btn-success"
          onClick={handleNuevaPlantilla}
        >
          + Nueva Plantilla
        </button>
      </div>

      {/* Información */}
      <div className="card" style={{ padding: '15px', marginBottom: '20px', backgroundColor: '#e7f3ff' }}>
        <strong>💡 ¿Qué son las plantillas de premios?</strong>
        <p style={{ margin: '5px 0 0 0' }}>
          Las plantillas te permiten definir un conjunto de premios una sola vez y reutilizarlos en múltiples rifas.
          Ideal para rifas diarias con los mismos premios.
        </p>
      </div>

      {/* Formulario de creación/edición */}
      {mostrarFormulario && (
        <div className="card crear-rifa-form" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>{modoEdicion ? '✏️ Editar Plantilla' : '➕ Nueva Plantilla de Premios'}</h3>
            <button 
              className="btn btn-secondary btn-small"
              onClick={() => setMostrarFormulario(false)}
            >
              Cerrar
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo de Plantilla *</label>
                <select
                  name="tipo"
                  className="form-control"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                >
                  <option value="PREMIUM">Premium</option>
                  <option value="BASICO">Básico</option>
                  <option value="VEHICULOS">Vehículos</option>
                  <option value="VIAJES">Viajes</option>
                  <option value="HOGAR">Hogar</option>
                  <option value="CUSTOM">Personalizado</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nombre de la Plantilla *</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control"
                  placeholder="Ej: Premios Premium - Tecnología"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                name="descripcion"
                className="form-control"
                rows="2"
                placeholder="Descripción general de los premios..."
                value={formData.descripcion}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Saldo Total de Premios</label>
                <input
                  type="number"
                  name="saldo"
                  className="form-control"
                  placeholder="15000.00"
                  step="0.01"
                  value={formData.saldo}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Dígitos</label>
                <input
                  type="number"
                  name="digitos"
                  className="form-control"
                  placeholder="4"
                  min="3"
                  max="6"
                  value={formData.digitos}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sucursal</label>
                <input
                  type="number"
                  name="id_sucursal"
                  className="form-control"
                  placeholder="1"
                  value={formData.id_sucursal}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h4 style={{ marginTop: '20px', marginBottom: '15px' }}>Premios</h4>

            <div className="form-row">
              {[1, 2, 3, 4, 5].map(num => (
                <div key={num} className="form-group">
                  <label className="form-label">Premio {num}</label>
                  <input
                    type="text"
                    name={`premio_0${num}`}
                    className="form-control"
                    placeholder="Ej: iPhone 15 Pro Max - $1200"
                    value={formData[`premio_0${num}`]}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>

            <div className="form-row">
              {[6, 7, 8, 9, 10].map(num => (
                <div key={num} className="form-group">
                  <label className="form-label">Premio {num}</label>
                  <input
                    type="text"
                    name={num === 10 ? 'premio_10' : `premio_0${num}`}
                    className="form-control"
                    placeholder="(Opcional)"
                    value={formData[num === 10 ? 'premio_10' : `premio_0${num}`]}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>

            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button type="submit" className="btn btn-success btn-large">
                {modoEdicion ? '💾 Guardar Cambios' : '✅ Crear Plantilla'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-large"
                onClick={() => setMostrarFormulario(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="card" style={{ padding: '15px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 'bold' }}>Filtrar por tipo:</span>
          <button 
            className={`btn-small ${filtroTipo === 'todas' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltroTipo('todas')}
          >
            Todas ({plantillas.length})
          </button>
          {tiposUnicos.map(tipo => (
            <button 
              key={tipo}
              className={`btn-small ${filtroTipo === tipo ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFiltroTipo(tipo)}
            >
              {tipo} ({plantillas.filter(p => p.tipo === tipo).length})
            </button>
          ))}
        </div>
      </div>

      {/* Lista de plantillas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
        {plantillasFiltradas.map(plantilla => {
          const premios = [];
          for (let i = 1; i <= 10; i++) {
            const premio = plantilla[`premio_${i < 10 ? '0' : ''}${i}`];
            if (premio) premios.push(premio);
          }

          return (
            <div key={plantilla.id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <h3 style={{ margin: 0 }}>{plantilla.nombre}</h3>
                    <span className={`badge ${plantilla.activa ? 'badge-success' : 'badge-secondary'}`}>
                      {plantilla.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <span className="badge badge-primary">{plantilla.tipo}</span>
                  {plantilla.id_sucursal && (
                    <span className="badge badge-secondary" style={{ marginLeft: '5px' }}>
                      Sucursal {plantilla.id_sucursal}
                    </span>
                  )}
                </div>
              </div>

              {plantilla.descripcion && (
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                  {plantilla.descripcion}
                </p>
              )}

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                  <div>
                    <strong>Saldo:</strong> ${plantilla.saldo?.toLocaleString() || '0'}
                  </div>
                  <div>
                    <strong>Dígitos:</strong> {plantilla.digitos}
                  </div>
                  <div>
                    <strong>Premios:</strong> {premios.length}
                  </div>
                </div>
              </div>

              <div style={{ 
                padding: '15px', 
                backgroundColor: '#f9f9f9', 
                borderRadius: '8px',
                marginBottom: '15px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                <strong style={{ display: 'block', marginBottom: '10px' }}>🏆 Premios:</strong>
                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                  {premios.map((premio, idx) => (
                    <li key={idx} style={{ marginBottom: '5px' }}>{premio}</li>
                  ))}
                </ol>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn btn-primary btn-small"
                  onClick={() => handleEditarPlantilla(plantilla.id)}
                  style={{ flex: 1 }}
                >
                  ✏️ Editar
                </button>
                <button 
                  className={`btn ${plantilla.activa ? 'btn-warning' : 'btn-success'} btn-small`}
                  onClick={() => handleToggleActiva(plantilla.id, plantilla.activa)}
                >
                  {plantilla.activa ? '⏸️ Desactivar' : '▶️ Activar'}
                </button>
                <button 
                  className="btn btn-danger btn-small"
                  onClick={() => handleEliminar(plantilla.id, plantilla.nombre)}
                >
                  🗑️
                </button>
              </div>

              <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
                Creada: {new Date(plantilla.created_at).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>

      {plantillasFiltradas.length === 0 && (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>No hay plantillas con el tipo seleccionado</p>
        </div>
      )}
    </div>
  );
}

export default PlantillasPremios;
