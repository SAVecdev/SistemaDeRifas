import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../utils/axios';
import './CrearRifa.css';

function EditarRifa() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaActual, setPlantillaActual] = useState(null);
  const [cambiarPlantilla, setCambiarPlantilla] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'tecnologia',
    precioNumero: '',
    totalNumeros: '',
    fechaSorteo: '',
    loteriaBase: '',
    estado: 'activa',
    plantilla_premio_id: '',
    imagen: null
  });
  const [premios, setPremios] = useState([]);

  useEffect(() => {
    cargarPlantillas();
    cargarRifa();
    cargarPremios();
  }, [id]);

  const cargarPlantillas = async () => {
    try {
      const response = await apiClient.get('/plantillas-premios');
      setPlantillas(response.data.data.filter(p => p.activa));
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
    }
  };

  const cargarRifa = async () => {
    try {
      const response = await apiClient.get(`/rifas/${id}`);
      const rifa = response.data.data;
      
      setFormData({
        titulo: rifa.titulo,
        descripcion: rifa.descripcion,
        categoria: rifa.categoria,
        precioNumero: rifa.precio_numero,
        totalNumeros: rifa.total_numeros,
        fechaSorteo: rifa.fecha_sorteo ? rifa.fecha_sorteo.slice(0, 16) : '',
        loteriaBase: rifa.loteria_base,
        estado: rifa.estado,
        plantilla_premio_id: rifa.plantilla_premio_id || '',
        imagen: null
      });
      
      if (rifa.plantilla_premio) {
        setPlantillaActual(rifa.plantilla_premio);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar rifa:', error);
      alert('Error al cargar la rifa');
      setLoading(false);
    }
  };

  const cargarPremios = async () => {
    try {
      const response = await apiClient.get(`/rifas/${id}/premios`);
      setPremios(response.data.data);
    } catch (error) {
      console.error('Error al cargar premios:', error);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'file' ? e.target.files[0] : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        precio_numero: parseFloat(formData.precioNumero),
        total_numeros: parseInt(formData.totalNumeros),
        fecha_sorteo: formData.fechaSorteo,
        loteria_base: formData.loteriaBase,
        estado: formData.estado
      };
      
      // Solo enviar plantilla si se cambió
      if (cambiarPlantilla && formData.plantilla_premio_id) {
        dataToSend.plantilla_premio_id = parseInt(formData.plantilla_premio_id);
      }
      
      await apiClient.put(`/rifas/${id}`, dataToSend);
      
      alert('¡Rifa actualizada exitosamente!');
      navigate('/admin/rifas');
    } catch (error) {
      console.error('Error al actualizar rifa:', error);
      alert('Error al actualizar la rifa');
    }
  };

  const handleAgregarPremio = () => {
    setPremios([...premios, {
      id: null,
      posicion: '',
      descripcion: '',
      grado_loteria: '',
      valor_estimado: ''
    }]);
  };

  const handlePremioChange = (index, field, value) => {
    const nuevosPremios = [...premios];
    nuevosPremios[index][field] = value;
    setPremios(nuevosPremios);
  };

  const handleGuardarPremio = async (index) => {
    const premio = premios[index];
    try {
      if (premio.id) {
        // Actualizar premio existente
        await apiClient.put(`/rifas/${id}/premios/${premio.id}`, {
          posicion: premio.posicion,
          descripcion: premio.descripcion,
          grado_loteria: premio.grado_loteria,
          valor_estimado: parseFloat(premio.valor_estimado) || 0
        });
        alert('Premio actualizado');
      } else {
        // Crear nuevo premio
        const response = await apiClient.post(`/rifas/${id}/premios`, {
          posicion: premio.posicion,
          descripcion: premio.descripcion,
          grado_loteria: premio.grado_loteria,
          valor_estimado: parseFloat(premio.valor_estimado) || 0
        });
        
        // Actualizar el ID del premio recién creado
        const nuevosPremios = [...premios];
        nuevosPremios[index].id = response.data.data.id;
        setPremios(nuevosPremios);
        alert('Premio creado');
      }
    } catch (error) {
      console.error('Error al guardar premio:', error);
      alert('Error al guardar el premio');
    }
  };

  const handleEliminarPremio = async (index) => {
    const premio = premios[index];
    
    if (premio.id) {
      // Eliminar premio existente
      if (!confirm('¿Está seguro de eliminar este premio?')) return;
      
      try {
        await apiClient.delete(`/rifas/${id}/premios/${premio.id}`);
        const nuevosPremios = premios.filter((_, i) => i !== index);
        setPremios(nuevosPremios);
        alert('Premio eliminado');
      } catch (error) {
        console.error('Error al eliminar premio:', error);
        alert('Error al eliminar el premio');
      }
    } else {
      // Simplemente remover del array si no está guardado
      const nuevosPremios = premios.filter((_, i) => i !== index);
      setPremios(nuevosPremios);
    }
  };

  if (loading) {
    return <div className="crear-rifa"><p>Cargando...</p></div>;
  }

  return (
    <div className="crear-rifa">
      <h1>✏️ Editar Rifa #{id}</h1>

      <form onSubmit={handleSubmit} className="card crear-rifa-form">
        <h3>Información Básica</h3>
        
        <div className="form-group">
          <label className="form-label">Título de la Rifa *</label>
          <input
            type="text"
            name="titulo"
            className="form-control"
            placeholder="Ej: iPhone 15 Pro Max"
            value={formData.titulo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Descripción *</label>
          <textarea
            name="descripcion"
            className="form-control"
            rows="4"
            placeholder="Describe el premio y características..."
            value={formData.descripcion}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Categoría *</label>
            <select
              name="categoria"
              className="form-control"
              value={formData.categoria}
              onChange={handleChange}
              required
            >
              <option value="tecnologia">Tecnología</option>
              <option value="vehiculos">Vehículos</option>
              <option value="viajes">Viajes</option>
              <option value="hogar">Hogar</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Estado *</label>
            <select
              name="estado"
              className="form-control"
              value={formData.estado}
              onChange={handleChange}
              required
            >
              <option value="activa">Activa</option>
              <option value="pausada">Pausada</option>
              <option value="cancelada">Cancelada</option>
              <option value="finalizada">Finalizada</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Precio por Número *</label>
            <input
              type="number"
              name="precioNumero"
              className="form-control"
              placeholder="5"
              min="1"
              step="0.01"
              value={formData.precioNumero}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total de Números *</label>
            <input
              type="number"
              name="totalNumeros"
              className="form-control"
              placeholder="1000"
              min="10"
              value={formData.totalNumeros}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Fecha del Sorteo *</label>
          <input
            type="datetime-local"
            name="fechaSorteo"
            className="form-control"
            value={formData.fechaSorteo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Lotería Base *</label>
          <input
            type="text"
            name="loteriaBase"
            className="form-control"
            placeholder="Ej: Lotería Nacional de España"
            value={formData.loteriaBase}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Cambiar Imagen del Premio</label>
          <input
            type="file"
            name="imagen"
            className="form-control"
            accept="image/*"
            onChange={handleChange}
          />
          <small className="form-text">Dejar vacío para mantener la imagen actual</small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-success btn-large">
            💾 Guardar Cambios
          </button>
          <button 
            type="button" 
            className="btn btn-secondary btn-large"
            onClick={() => navigate('/admin/rifas')}
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Plantilla de Premios Actual */}
      <div className="card crear-rifa-form" style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '15px' }}>🏆 Plantilla de Premios</h3>
        
        {plantillaActual && !cambiarPlantilla ? (
          <div>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#d4edda', 
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#155724' }}>✅ {plantillaActual.nombre}</h4>
                  <span className="badge badge-primary" style={{ marginTop: '5px' }}>
                    {plantillaActual.tipo}
                  </span>
                </div>
                <button 
                  className="btn btn-warning btn-small"
                  onClick={() => setCambiarPlantilla(true)}
                >
                  🔄 Cambiar Plantilla
                </button>
              </div>
            </div>

            <div style={{ 
              padding: '15px', 
              backgroundColor: '#fff3cd', 
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <strong>⚠️ Nota:</strong> Esta rifa está usando la plantilla "{plantillaActual.nombre}". 
              Los premios no ganados se actualizarán si cambias la plantilla.
            </div>
          </div>
        ) : (
          <div>
            <div className="form-group">
              <label className="form-label">Seleccionar Nueva Plantilla</label>
              <select
                name="plantilla_premio_id"
                className="form-control"
                value={formData.plantilla_premio_id}
                onChange={handleChange}
              >
                <option value="">-- Seleccione una plantilla --</option>
                {plantillas.map(plantilla => (
                  <option key={plantilla.id} value={plantilla.id}>
                    {plantilla.nombre} ({plantilla.tipo})
                  </option>
                ))}
              </select>
            </div>

            {cambiarPlantilla && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn btn-secondary btn-small"
                  onClick={() => {
                    setCambiarPlantilla(false);
                    setFormData({ ...formData, plantilla_premio_id: plantillaActual?.id || '' });
                  }}
                >
                  Cancelar Cambio
                </button>
              </div>
            )}

            <div style={{ 
              padding: '15px', 
              backgroundColor: '#fff3cd', 
              borderRadius: '8px',
              marginTop: '15px',
              fontSize: '14px'
            }}>
              <strong>⚠️ Advertencia:</strong> Al cambiar la plantilla, los premios que aún no tienen ganador 
              se reemplazarán con los de la nueva plantilla. Los premios ya ganados se mantendrán.
            </div>
          </div>
        )}
      </div>

      {/* Gestión Individual de Premios */}
      <div className="card crear-rifa-form" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>📋 Premios Individuales (Edición Avanzada)</h3>
          <button 
            type="button" 
            className="btn btn-success"
            onClick={handleAgregarPremio}
          >
            + Agregar Premio
          </button>
        </div>

        {premios.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No hay premios configurados. Haga clic en "Agregar Premio" para añadir uno.
          </p>
        )}

        {premios.map((premio, index) => (
          <div key={index} className="premio-item" style={{ 
            border: '1px solid #ddd', 
            padding: '15px', 
            marginBottom: '15px', 
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
          }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Posición *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: 1er Premio"
                  value={premio.posicion}
                  onChange={(e) => handlePremioChange(index, 'posicion', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Grado de Lotería *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Primer Premio"
                  value={premio.grado_loteria}
                  onChange={(e) => handlePremioChange(index, 'grado_loteria', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción del Premio *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: iPhone 15 Pro Max 256GB"
                value={premio.descripcion}
                onChange={(e) => handlePremioChange(index, 'descripcion', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Valor Estimado ($)</label>
              <input
                type="number"
                className="form-control"
                placeholder="1200"
                min="0"
                step="0.01"
                value={premio.valor_estimado}
                onChange={(e) => handlePremioChange(index, 'valor_estimado', e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                type="button" 
                className="btn btn-primary btn-small"
                onClick={() => handleGuardarPremio(index)}
              >
                💾 Guardar Premio
              </button>
              <button 
                type="button" 
                className="btn btn-danger btn-small"
                onClick={() => handleEliminarPremio(index)}
              >
                🗑️ Eliminar
              </button>
            </div>

            {premio.ganador_usuario_id && (
              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '5px' }}>
                <strong>✅ Premio Ganado</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                  Número: {premio.numero_ganador} | 
                  {premio.entregado ? ' Entregado ✓' : ' Pendiente de entrega'}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EditarRifa;
