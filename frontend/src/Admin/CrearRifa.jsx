import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axios';
import './CrearRifa.css';

function CrearRifa() {
  const navigate = useNavigate();
  const [tipos, setTipos] = useState([]);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    sorteos: 1,
    fechaSorteo: '',
    id_tipo: '',
    imagen: null
  });

  useEffect(() => {
    cargarTipos();
  }, []);

  const cargarTipos = async () => {
    try {
      const response = await apiClient.get('/tipos-rifa');
      setTipos(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar tipos de rifa:', error);
    }
  };

  const handleTipoChange = (e) => {
    const tipoId = e.target.value;
    setFormData({ ...formData, id_tipo: tipoId });
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

    if (!formData.id_tipo) {
      alert('Debe seleccionar un tipo de rifa');
      return;
    }

    try {
      const payload = {
        sorteos: Number(formData.sorteos) || 1,
        descripcion: formData.descripcion,
        imagen: null,
        id_tipo: parseInt(formData.id_tipo),
        fecha_hora_juego: formData.fechaSorteo
      };

      const rifaResponse = await apiClient.post('/rifas-completas', payload);

      alert('¡Rifa creada exitosamente usando el tipo seleccionado!');
      navigate('/admin/rifas');
    } catch (error) {
      console.error('Error al crear rifa:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Error al crear la rifa');
      }
    }
  };

  return (
    <div className="crear-rifa">
      <h1>➕ Crear Nueva Rifa (usando Tipo de Rifa)</h1>

      <form onSubmit={handleSubmit} className="card crear-rifa-form">
        <div className="form-group">
          <label className="form-label">Descripción *</label>
          <textarea
            name="descripcion"
            className="form-control"
            rows="3"
            placeholder="Descripción de la rifa/prize"
            value={formData.descripcion}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tipo de Rifa *</label>
            <select
              name="id_tipo"
              className="form-control"
              value={formData.id_tipo}
              onChange={handleTipoChange}
              required
            >
              <option value="">-- Seleccione un tipo --</option>
              {tipos.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Sorteos</label>
            <input
              type="number"
              name="sorteos"
              className="form-control"
              min="1"
              value={formData.sorteos}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Fecha del Sorteo</label>
            <input
              type="datetime-local"
              name="fechaSorteo"
              className="form-control"
              value={formData.fechaSorteo}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* No mostramos las opciones a ganar aquí: se gestionan por área en otro módulo */}

        <div className="form-actions" style={{ marginTop: '20px' }}>
          <button 
            type="submit" 
            className="btn btn-success btn-large"
            disabled={!formData.id_tipo}
          >
            ✅ Crear Rifa usando Tipo
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
    </div>
  );
}

export default CrearRifa;
