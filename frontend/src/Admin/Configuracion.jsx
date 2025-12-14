import { useState, useEffect } from 'react';
import apiClient from '../utils/axios';
import './Configuracion.css';

function Configuracion() {
  const [activeTab, setActiveTab] = useState('supervision');
  const [usuarios, setUsuarios] = useState([]);
  const [supervisiones, setSupervisiones] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para crear supervisión
  const [supervisorId, setSupervisorId] = useState('');
  const [supervisadoId, setSupervisadoId] = useState('');

  // Estados para permisos
  const [permisoUsuarioId, setPermisoUsuarioId] = useState('');
  const [permisoModulo, setPermisoModulo] = useState('');
  const [permisoAccion, setPermisoAccion] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar usuarios
      const respUsuarios = await apiClient.get('/usuarios');
      setUsuarios(respUsuarios.data.data || []);

      if (activeTab === 'supervision') {
        // Cargar supervisiones
        const respSupervision = await apiClient.get('/configuracion/supervisiones');
        setSupervisiones(respSupervision.data.data || []);
      } else if (activeTab === 'permisos') {
        // Cargar permisos
        const respPermisos = await apiClient.get('/configuracion/permisos');
        setPermisos(respPermisos.data.data || []);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== SUPERVISIÓN ====================
  const crearSupervision = async (e) => {
    e.preventDefault();
    if (!supervisorId || !supervisadoId) {
      alert('Selecciona supervisor y supervisado');
      return;
    }
    if (supervisorId === supervisadoId) {
      alert('El supervisor no puede supervisarse a sí mismo');
      return;
    }

    try {
      await apiClient.post('/configuracion/supervisiones', {
        id_supervisor: supervisorId,
        id_supervisado: supervisadoId
      });
      alert('Supervisión creada correctamente');
      setSupervisorId('');
      setSupervisadoId('');
      cargarDatos();
    } catch (error) {
      console.error('Error creando supervisión:', error);
      alert(error.response?.data?.message || 'Error al crear supervisión');
    }
  };

  const eliminarSupervision = async (id) => {
    if (!confirm('¿Eliminar esta supervisión?')) return;
    try {
      await apiClient.delete(`/configuracion/supervisiones/${id}`);
      alert('Supervisión eliminada');
      cargarDatos();
    } catch (error) {
      console.error('Error eliminando supervisión:', error);
      alert('Error al eliminar supervisión');
    }
  };

  // ==================== PERMISOS ====================
  const crearPermiso = async (e) => {
    e.preventDefault();
    if (!permisoUsuarioId || !permisoModulo || !permisoAccion) {
      alert('Completa todos los campos');
      return;
    }

    try {
      await apiClient.post('/configuracion/permisos', {
        id_usuario: permisoUsuarioId,
        modulo: permisoModulo,
        accion: permisoAccion
      });
      alert('Permiso otorgado correctamente');
      setPermisoUsuarioId('');
      setPermisoModulo('');
      setPermisoAccion('');
      cargarDatos();
    } catch (error) {
      console.error('Error creando permiso:', error);
      alert(error.response?.data?.message || 'Error al crear permiso');
    }
  };

  const eliminarPermiso = async (id) => {
    if (!confirm('¿Revocar este permiso?')) return;
    try {
      await apiClient.delete(`/configuracion/permisos/${id}`);
      alert('Permiso revocado');
      cargarDatos();
    } catch (error) {
      console.error('Error eliminando permiso:', error);
      alert('Error al revocar permiso');
    }
  };

  // Obtener supervisores (administrador y supervisor)
  const supervisores = usuarios.filter(u => ['administrador', 'supervisor'].includes(u.rol));
  // Obtener supervisados (vendedor y cliente)
  const supervisados = usuarios.filter(u => ['vendedor', 'cliente'].includes(u.rol));

  const modulos = [
    'rifas', 'ventas', 'usuarios', 'reportes', 'configuracion', 'sorteos', 'premios', 'areas', 'facturas'
  ];

  const acciones = ['crear', 'leer', 'actualizar', 'eliminar'];

  return (
    <div className="configuracion-container">
      <h1>⚙️ Configuración del Sistema</h1>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'supervision' ? 'active' : ''}`}
          onClick={() => setActiveTab('supervision')}
        >
          👥 Supervisión
        </button>
        <button 
          className={`tab ${activeTab === 'permisos' ? 'active' : ''}`}
          onClick={() => setActiveTab('permisos')}
        >
          🔐 Permisos
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          {/* ==================== TAB SUPERVISIÓN ==================== */}
          {activeTab === 'supervision' && (
            <div className="tab-content">
              <div className="card">
                <h2>➕ Crear Supervisión</h2>
                <form onSubmit={crearSupervision} className="form-supervision">
                  <div className="form-group">
                    <label>Supervisor:</label>
                    <select 
                      value={supervisorId} 
                      onChange={(e) => setSupervisorId(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar supervisor...</option>
                      {supervisores.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} ({s.rol}) - {s.correo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Supervisado:</label>
                    <select 
                      value={supervisadoId} 
                      onChange={(e) => setSupervisadoId(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar supervisado...</option>
                      {supervisados.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} ({s.rol}) - {s.correo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Crear Supervisión
                  </button>
                </form>
              </div>

              <div className="card">
                <h2>📋 Supervisiones Activas</h2>
                {supervisiones.length === 0 ? (
                  <p className="empty-message">No hay supervisiones configuradas</p>
                ) : (
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Supervisor</th>
                        <th>Rol Supervisor</th>
                        <th>Supervisado</th>
                        <th>Rol Supervisado</th>
                        <th>Fecha Creación</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supervisiones.map(sup => (
                        <tr key={sup.id}>
                          <td>{sup.id}</td>
                          <td>
                            <div className="user-info">
                              <strong>{sup.supervisor_nombre}</strong>
                              <small>{sup.supervisor_correo}</small>
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-${sup.supervisor_rol}`}>
                              {sup.supervisor_rol}
                            </span>
                          </td>
                          <td>
                            <div className="user-info">
                              <strong>{sup.supervisado_nombre}</strong>
                              <small>{sup.supervisado_correo}</small>
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-${sup.supervisado_rol}`}>
                              {sup.supervisado_rol}
                            </span>
                          </td>
                          <td>{new Date(sup.created_at).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="btn-delete"
                              onClick={() => eliminarSupervision(sup.id)}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB PERMISOS ==================== */}
          {activeTab === 'permisos' && (
            <div className="tab-content">
              <div className="card">
                <h2>➕ Otorgar Permiso</h2>
                <form onSubmit={crearPermiso} className="form-permisos">
                  <div className="form-group">
                    <label>Usuario:</label>
                    <select 
                      value={permisoUsuarioId} 
                      onChange={(e) => setPermisoUsuarioId(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar usuario...</option>
                      {usuarios.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.nombre} ({u.rol}) - {u.correo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Módulo:</label>
                    <select 
                      value={permisoModulo} 
                      onChange={(e) => setPermisoModulo(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar módulo...</option>
                      {modulos.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Acción:</label>
                    <select 
                      value={permisoAccion} 
                      onChange={(e) => setPermisoAccion(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar acción...</option>
                      {acciones.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Otorgar Permiso
                  </button>
                </form>
              </div>

              <div className="card">
                <h2>📋 Permisos Configurados</h2>
                {permisos.length === 0 ? (
                  <p className="empty-message">No hay permisos especiales configurados</p>
                ) : (
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Rol</th>
                        <th>Módulo</th>
                        <th>Acción</th>
                        <th>Fecha Creación</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permisos.map(perm => (
                        <tr key={perm.id}>
                          <td>{perm.id}</td>
                          <td>
                            <div className="user-info">
                              <strong>{perm.usuario_nombre}</strong>
                              <small>{perm.usuario_correo}</small>
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-${perm.usuario_rol}`}>
                              {perm.usuario_rol}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-modulo">{perm.modulo}</span>
                          </td>
                          <td>
                            <span className="badge badge-accion">{perm.accion}</span>
                          </td>
                          <td>{new Date(perm.created_at).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="btn-delete"
                              onClick={() => eliminarPermiso(perm.id)}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Configuracion;
