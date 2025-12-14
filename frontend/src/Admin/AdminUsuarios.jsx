import { useEffect, useState } from 'react';
import apiClient from '../utils/axios';
import { apiPut, apiPost, apiGet } from '../utils/api';
import './AdminUsuarios.css';

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activoFilter, setActivoFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Estados para modal de edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    direccion: '',
    rol: '',
    activo: true,
    nueva_password: '',
    confirmar_password: ''
  });
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [imagenes, setImagenes] = useState([]);
  const [mostrarGaleria, setMostrarGaleria] = useState(false);
  const [urlImagenSeleccionada, setUrlImagenSeleccionada] = useState(null);

  useEffect(() => { 
    cargarUsuarios();
    cargarImagenes();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const resp = await apiClient.get('/usuarios');
      setUsuarios(resp.data.data || []);
      setPage(1);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setUsuarios([]);
    } finally { setLoading(false); }
  };

  const cargarImagenes = async () => {
    try {
      const response = await apiGet('/imagenes');
      setImagenes(response.imagenes || []);
    } catch (error) {
      console.error('Error cargando imágenes:', error);
    }
  };

  const abrirModalEdicion = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      nombre: usuario.nombre || '',
      correo: usuario.correo || '',
      telefono: usuario.telefono || '',
      direccion: usuario.direccion || '',
      rol: usuario.rol || 'cliente',
      activo: !!usuario.activo,
      nueva_password: '',
      confirmar_password: ''
    });
    setVistaPrevia(usuario.foto_perfil || null);
    setArchivoFoto(null);
    setModalAbierto(true);
    setMensaje({ tipo: '', texto: '' });
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioEditando(null);
    setFormData({
      nombre: '',
      correo: '',
      telefono: '',
      direccion: '',
      rol: '',
      activo: true,
      nueva_password: '',
      confirmar_password: ''
    });
    setArchivoFoto(null);
    setVistaPrevia(null);
    setMensaje({ tipo: '', texto: '' });
    setMostrarGaleria(false);
    setUrlImagenSeleccionada(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      mostrarMensaje('error', 'Solo se permiten imágenes');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      mostrarMensaje('error', 'La imagen no debe superar 2MB');
      return;
    }

    setArchivoFoto(file);
    setUrlImagenSeleccionada(null);
    const reader = new FileReader();
    reader.onloadend = () => setVistaPrevia(reader.result);
    reader.readAsDataURL(file);
  };

  const seleccionarImagenGaleria = (imagen) => {
    setVistaPrevia(imagen.url);
    setUrlImagenSeleccionada(imagen.ruta);
    setArchivoFoto(null);
    setMostrarGaleria(false);
  };

  const guardarCambios = async () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      mostrarMensaje('error', 'El nombre es requerido');
      return;
    }

    if (!formData.correo.trim()) {
      mostrarMensaje('error', 'El correo es requerido');
      return;
    }

    if (formData.nueva_password && formData.nueva_password !== formData.confirmar_password) {
      mostrarMensaje('error', 'Las contraseñas no coinciden');
      return;
    }

    if (formData.nueva_password && formData.nueva_password.length < 6) {
      mostrarMensaje('error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setGuardando(true);
    try {
      // Preparar datos
      const dataToSend = new FormData();
      dataToSend.append('nombre', formData.nombre);
      dataToSend.append('correo', formData.correo);
      dataToSend.append('telefono', formData.telefono || '');
      dataToSend.append('direccion', formData.direccion || '');
      dataToSend.append('rol', formData.rol);
      dataToSend.append('activo', formData.activo ? '1' : '0');
      
      if (formData.nueva_password) {
        dataToSend.append('password', formData.nueva_password);
      }
      
      if (archivoFoto) {
        dataToSend.append('foto_perfil', archivoFoto);
      } else if (urlImagenSeleccionada) {
        dataToSend.append('foto_perfil_url', urlImagenSeleccionada);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/usuarios/${usuarioEditando.id}/editar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: dataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar cambios');
      }

      mostrarMensaje('success', 'Usuario actualizado correctamente');
      setTimeout(() => {
        cerrarModal();
        cargarUsuarios();
      }, 1500);
    } catch (err) {
      console.error('Error guardando cambios:', err);
      mostrarMensaje('error', err.message || 'Error al guardar cambios');
    } finally {
      setGuardando(false);
    }
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 4000);
  };

  const handleEliminar = async (id, rol) => {
    if (rol === 'administrador') {
      alert('No está permitido eliminar administradores');
      return;
    }
    if (!confirm('¿Eliminar usuario? Esto solo desactiva la cuenta.')) return;
    try {
      const resp = await apiClient.delete(`/usuarios/${id}`);
      alert(resp.data.message || 'Usuario eliminado');
      await cargarUsuarios();
    } catch (err) {
      console.error('Error eliminando usuario:', err);
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  return (
    <div className="admin-usuarios">
      <h1>👥 Gestión de Usuarios</h1>

      <div className="tabla-container card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          <input placeholder="Buscar rápido (nombre/email/id)" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} style={{ flex: 1, padding: 6 }} />
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="all">Todos los roles</option>
            <option value="administrador">Administrador</option>
            <option value="cliente">Cliente</option>
            <option value="usuario_registrado">Usuario registrado</option>
          </select>
          <select value={activoFilter} onChange={e => { setActivoFilter(e.target.value); setPage(1); }}>
            <option value="all">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
          <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        {loading ? <p>Cargando usuarios...</p> : (
          (() => {
            const q = query.trim().toLowerCase();
            let filtered = usuarios.filter(u => (roleFilter === 'all' || u.rol === roleFilter));
            filtered = filtered.filter(u => {
              if (activoFilter === 'all') return true;
              if (activoFilter === 'activo') return !!u.activo;
              return !u.activo;
            });
            if (q) {
              filtered = filtered.filter(u => (
                String(u.id).includes(q) || (u.nombre || '').toLowerCase().includes(q) || (u.correo || '').toLowerCase().includes(q)
              ));
            }
            const total = filtered.length;
            const pageCount = Math.max(1, Math.ceil(total / perPage));
            const current = Math.min(page, pageCount);
            const start = (current - 1) * perPage;
            const visible = filtered.slice(start, start + perPage);

            return (
              <>
                <div style={{ marginBottom: 8 }}><small>Mostrando {visible.length} de {total} usuarios</small></div>
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Saldo</th>
                      <th>Activo</th>
                      <th>Rol</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.nombre}</td>
                        <td>{user.correo}</td>
                        <td>{user.saldo ?? 0}</td>
                        <td>{user.activo ? 'Sí' : 'No'}</td>
                        <td><span className={`badge ${user.rol === 'administrador' ? 'badge-admin' : 'badge-success'}`}>{user.rol}</span></td>
                        <td>
                          <button className="icon-btn" title="Editar usuario" onClick={() => abrirModalEdicion(user)}>✏️</button>
                          <button className="icon-btn icon-delete" title="Eliminar usuario" onClick={() => handleEliminar(user.id, user.rol)} disabled={user.rol === 'administrador'}>
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={current <= 1}>Anterior</button>
                  <div>Página {current} / {pageCount}</div>
                  <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={current >= pageCount}>Siguiente</button>
                  <div style={{ marginLeft: 'auto' }}>
                    <button onClick={() => { setPage(1); }}>Ir a la primera</button>
                  </div>
                </div>
              </>
            );
          })()
        )}
      </div>

      {/* Modal de edición */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Editar Usuario</h2>
              <button className="btn-close" onClick={cerrarModal}>✕</button>
            </div>

            {mensaje.texto && (
              <div className={`mensaje ${mensaje.tipo}`}>
                {mensaje.texto}
              </div>
            )}

            <div className="modal-body">
              {/* Foto de perfil */}
              <div className="form-group-foto">
                <label>Foto de Perfil</label>
                <div className="foto-container">
                  <div className="foto-preview">
                    {vistaPrevia ? (
                      <img src={vistaPrevia} alt="Perfil" />
                    ) : (
                      <div className="foto-placeholder">👤</div>
                    )}
                  </div>
                  <div className="foto-actions">
                    <input
                      type="file"
                      id="foto-input"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="foto-input" className="btn-secondary">
                      📁 Subir Nueva
                    </label>
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => setMostrarGaleria(!mostrarGaleria)}
                    >
                      🖼️ Galería
                    </button>
                    {vistaPrevia && (
                      <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={() => {
                          setVistaPrevia(null);
                          setArchivoFoto(null);
                          setUrlImagenSeleccionada(null);
                          document.getElementById('foto-input').value = '';
                        }}
                      >
                        🗑️ Quitar
                      </button>
                    )}
                  </div>
                </div>

                {/* Galería de imágenes */}
                {mostrarGaleria && (
                  <div className="galeria-imagenes">
                    <div className="galeria-header">
                      <h4>Selecciona una imagen</h4>
                      <button 
                        type="button" 
                        className="btn-close-small"
                        onClick={() => setMostrarGaleria(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="galeria-grid">
                      {imagenes.length === 0 ? (
                        <p className="no-imagenes">No hay imágenes disponibles. Ve a la sección de Imágenes para subir algunas.</p>
                      ) : (
                        imagenes.map(imagen => (
                          <div 
                            key={imagen.id} 
                            className="galeria-item"
                            onClick={() => seleccionarImagenGaleria(imagen)}
                          >
                            <img src={imagen.url} alt={imagen.nombre} />
                            <span className="galeria-item-nombre">{imagen.nombre}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Información básica */}
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Nombre completo"
                  />
                </div>
                <div className="form-group">
                  <label>Correo *</label>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({...formData, correo: e.target.value})}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    placeholder="3001234567"
                  />
                </div>
                <div className="form-group">
                  <label>Rol</label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({...formData, rol: e.target.value})}
                  >
                    <option value="cliente">Cliente</option>
                    <option value="vendedor">Vendedor</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  placeholder="Dirección completa"
                />
              </div>

              {/* Cambiar contraseña */}
              <div className="form-section">
                <h3>🔒 Cambiar Contraseña</h3>
                <p className="help-text">Deja en blanco si no deseas cambiar la contraseña</p>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Nueva Contraseña</label>
                    <input
                      type="password"
                      value={formData.nueva_password}
                      onChange={(e) => setFormData({...formData, nueva_password: e.target.value})}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirmar Contraseña</label>
                    <input
                      type="password"
                      value={formData.confirmar_password}
                      onChange={(e) => setFormData({...formData, confirmar_password: e.target.value})}
                      placeholder="Repite la contraseña"
                    />
                  </div>
                </div>
              </div>

              {/* Estado */}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  />
                  Usuario activo
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={cerrarModal}>
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={guardarCambios}
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : '💾 Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsuarios;

