import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiDelete } from '../utils/api';
import './AdminImagenes.css';

const AdminImagenes = () => {
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

  useEffect(() => {
    cargarImagenes();
  }, []);

  const cargarImagenes = async () => {
    setLoading(true);
    try {
      const response = await apiGet('/imagenes');
      setImagenes(response.imagenes || []);
    } catch (error) {
      console.error('Error cargando imágenes:', error);
      mostrarMensaje('error', 'Error al cargar imágenes');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      mostrarMensaje('error', 'Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      mostrarMensaje('error', 'La imagen no debe superar los 5MB');
      return;
    }

    setArchivoSeleccionado(file);

    // Crear vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setVistaPrevia(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const subirImagen = async () => {
    if (!archivoSeleccionado) {
      mostrarMensaje('error', 'Selecciona una imagen primero');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('imagen', archivoSeleccionado);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/imagenes/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir imagen');
      }

      const data = await response.json();
      mostrarMensaje('success', 'Imagen subida exitosamente');
      setArchivoSeleccionado(null);
      setVistaPrevia(null);
      document.getElementById('file-input').value = '';
      cargarImagenes();
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      mostrarMensaje('error', error.message || 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const eliminarImagen = async (id, nombre) => {
    if (!confirm(`¿Estás seguro de eliminar la imagen "${nombre}"?`)) return;

    try {
      await apiDelete(`/imagenes/${id}`);
      mostrarMensaje('success', 'Imagen eliminada correctamente');
      cargarImagenes();
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      mostrarMensaje('error', error.response?.data?.error || 'Error al eliminar imagen');
    }
  };

  const copiarURL = (url) => {
    navigator.clipboard.writeText(url);
    mostrarMensaje('success', 'URL copiada al portapapeles');
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 4000);
  };

  const cancelarSeleccion = () => {
    setArchivoSeleccionado(null);
    setVistaPrevia(null);
    document.getElementById('file-input').value = '';
  };

  return (
    <div className="admin-imagenes">
      <h1>🖼️ Gestor de Imágenes</h1>
      <p className="subtitle">Sube y administra las imágenes del sistema</p>

      {mensaje.texto && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Sección de subida */}
      <div className="upload-section card">
        <h2>📤 Subir Nueva Imagen</h2>
        
        <div className="upload-area">
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          {!vistaPrevia ? (
            <label htmlFor="file-input" className="upload-placeholder">
              <div className="upload-icon">📁</div>
              <p>Haz clic aquí para seleccionar una imagen</p>
              <small>Formatos: JPG, PNG, GIF (Máx. 5MB)</small>
            </label>
          ) : (
            <div className="preview-container">
              <img src={vistaPrevia} alt="Vista previa" className="preview-image" />
              <div className="preview-actions">
                <button onClick={subirImagen} disabled={uploading} className="btn-primary">
                  {uploading ? 'Subiendo...' : '✓ Subir Imagen'}
                </button>
                <button onClick={cancelarSeleccion} className="btn-secondary">
                  ✕ Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Galería de imágenes */}
      <div className="imagenes-section card">
        <h2>📂 Galería de Imágenes ({imagenes.length})</h2>
        
        {loading ? (
          <div className="loading">Cargando imágenes...</div>
        ) : imagenes.length === 0 ? (
          <div className="no-data">No hay imágenes subidas</div>
        ) : (
          <div className="imagenes-grid">
            {imagenes.map((img) => (
              <div key={img.id} className="imagen-card">
                <div className="imagen-preview">
                  <img src={img.url} alt={img.nombre} />
                </div>
                <div className="imagen-info">
                  <p className="imagen-nombre" title={img.nombre}>
                    {img.nombre}
                  </p>
                  <p className="imagen-fecha">
                    {new Date(img.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="imagen-actions">
                  <button
                    onClick={() => copiarURL(img.url)}
                    className="btn-icon"
                    title="Copiar URL"
                  >
                    📋
                  </button>
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-icon"
                    title="Ver imagen"
                  >
                    👁️
                  </a>
                  <button
                    onClick={() => eliminarImagen(img.id, img.nombre)}
                    className="btn-icon btn-danger"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminImagenes;
