import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Perfil.css';

function Perfil() {
  const { usuario: usuarioAuth, actualizarUsuario } = useAuth();
  const [usuario, setUsuario] = useState(null);
  const [areas, setAreas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (usuarioAuth?.id) {
      cargarDatosUsuario();
      cargarAreas();
    }
  }, [usuarioAuth]);

  const cargarDatosUsuario = async () => {
    try {
      setCargando(true);
      setError(null);
      const response = await fetch(`/api/usuarios/${usuarioAuth.id}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setUsuario(data.data);
        setFormData({
          nombre: data.data.nombre || '',
          correo: data.data.correo || '',
          telefono: data.data.telefono || '',
          direccion: data.data.direccion || '',
          id_area: data.data.id_area || ''
        });
      } else {
        setError('Error al cargar los datos del usuario');
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const cargarAreas = async () => {
    try {
      const response = await fetch('/api/areas');
      const data = await response.json();
      
      if (data.status === 'success') {
        setAreas(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando áreas:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      setError(null);

      const response = await fetch(`/api/usuarios/${usuarioAuth.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.status === 'success') {
        await cargarDatosUsuario();
        // Actualizar el contexto de autenticación con los nuevos datos
        actualizarUsuario({
          nombre: formData.nombre,
          correo: formData.correo,
          telefono: formData.telefono,
          direccion: formData.direccion
        });
        setEditando(false);
        alert('Perfil actualizado exitosamente');
      } else {
        setError(data.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setFormData({
      nombre: usuario.nombre || '',
      correo: usuario.correo || '',
      telefono: usuario.telefono || '',
      direccion: usuario.direccion || '',
      id_area: usuario.id_area || ''
    });
    setEditando(false);
    setError(null);
  };

  if (cargando) {
    return (
      <div className="perfil-container">
        <div className="loading">Cargando perfil...</div>
      </div>
    );
  }

  if (error && !usuario) {
    return (
      <div className="perfil-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <h1>👤 Mi Perfil</h1>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="perfil-grid">
        {/* Información Personal */}
        <div className="card perfil-info">
          <div className="card-header">
            <h2>Información Personal</h2>
            {!editando ? (
              <button className="btn btn-primary" onClick={() => setEditando(true)}>
                Editar
              </button>
            ) : (
              <div className="button-group">
                <button 
                  className="btn btn-success" 
                  onClick={handleGuardar}
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleCancelar}
                  disabled={guardando}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div className="perfil-form">
            <div className="form-group">
              <label className="form-label">Nombre Completo *</label>
              <input
                type="text"
                name="nombre"
                className="form-control"
                value={formData.nombre}
                onChange={handleChange}
                disabled={!editando}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico *</label>
              <input
                type="email"
                name="correo"
                className="form-control"
                value={formData.correo}
                onChange={handleChange}
                disabled={!editando}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                className="form-control"
                value={formData.telefono}
                onChange={handleChange}
                disabled={!editando}
                placeholder="+57 300 1234567"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dirección</label>
              <input
                type="text"
                name="direccion"
                className="form-control"
                value={formData.direccion}
                onChange={handleChange}
                disabled={!editando}
                placeholder="Calle 123 #45-67"
              />
            </div>

            {usuario && (usuario.rol === 'vendedor' || usuario.rol === 'supervisor') && (
              <div className="form-group">
                <label className="form-label">Área Asignada</label>
                {editando && usuario.rol === 'administrador' ? (
                  <select
                    name="id_area"
                    className="form-control"
                    value={formData.id_area}
                    onChange={handleChange}
                  >
                    <option value="">Sin área</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>
                        {area.nombre}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    value={usuario.area_nombre || 'Sin área asignada'}
                    disabled
                  />
                )}
              </div>
            )}

            <div className="info-readonly">
              <div className="info-item">
                <span className="label">Rol:</span>
                <span className="value rol-badge">
                  {usuario?.rol === 'administrador' && '👑 Administrador'}
                  {usuario?.rol === 'supervisor' && '👔 Supervisor'}
                  {usuario?.rol === 'vendedor' && '💼 Vendedor'}
                  {usuario?.rol === 'cliente' && '👤 Cliente'}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Miembro desde:</span>
                <span className="value">
                  {usuario?.created_at ? new Date(usuario.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Estado:</span>
                <span className={`value status-badge ${usuario?.activo ? 'activo' : 'inactivo'}`}>
                  {usuario?.activo ? '✅ Activo' : '❌ Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Saldo y Estadísticas */}
        <div className="perfil-stats">
          <div className="card saldo-card">
            <h3>💰 Mi Saldo</h3>
            <div className="saldo-amount">
              ${usuario?.saldo ? parseFloat(usuario.saldo).toFixed(2) : '0.00'}
            </div>
            <p className="saldo-info">Saldo disponible para comprar números de rifas</p>
            {usuario?.rol === 'cliente' && (
              <button className="btn btn-success btn-block">
                Recargar Saldo
              </button>
            )}
          </div>

          <div className="card stats-card">
            <h3>📊 Información del Usuario</h3>
            <div className="stat-item">
              <div className="stat-label">ID de Usuario</div>
              <div className="stat-value">{usuario?.id}</div>
            </div>
            {usuario?.id_area && (
              <div className="stat-item">
                <div className="stat-label">Área</div>
                <div className="stat-value">{usuario?.area_nombre || `Área ${usuario.id_area}`}</div>
              </div>
            )}
            <div className="stat-item">
              <div className="stat-label">Tipo de Cuenta</div>
              <div className="stat-value">
                {usuario?.rol === 'administrador' && '👑 Administrador'}
                {usuario?.rol === 'supervisor' && '👔 Supervisor'}
                {usuario?.rol === 'vendedor' && '💼 Vendedor'}
                {usuario?.rol === 'cliente' && '👤 Cliente'}
              </div>
            </div>
            {usuario?.foto_perfil && (
              <div className="stat-item">
                <img 
                  src={usuario.foto_perfil} 
                  alt="Foto de perfil" 
                  className="perfil-foto"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cambiar Contraseña */}
      <div className="card">
        <h2>🔐 Cambiar Contraseña</h2>
        <p className="card-description">Por seguridad, cambia tu contraseña regularmente</p>
        <div className="password-form">
          <div className="form-group">
            <label className="form-label">Contraseña Actual</label>
            <input type="password" className="form-control" placeholder="••••••••" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nueva Contraseña</label>
              <input type="password" className="form-control" placeholder="••••••••" />
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar Nueva Contraseña</label>
              <input type="password" className="form-control" placeholder="••••••••" />
            </div>
          </div>

          <button className="btn btn-primary">
            Cambiar Contraseña
          </button>
        </div>
      </div>
    </div>
  );
}

export default Perfil;
