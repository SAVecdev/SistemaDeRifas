import { useEffect, useState } from 'react';
import apiClient from '../utils/axios';
import './AdminUsuarios.css';

export default function AdminClientes(){
  console.log('🔵 AdminClientes component rendering...');
  
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activoFilter, setActivoFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState({
    id: null,
    nombre: '',
    correo: '',
    password: '',
    direccion: '',
    telefono: '',
    rol: 'cliente',
    areaId: '',
    saldo: 0,
    activo: true,
  });

  useEffect(()=>{ 
    console.log('🔵 useEffect: cargarClientes');
    cargarClientes(); 
  }, []);
  useEffect(() => { 
    console.log('🔵 useEffect: cargarAreas');
    cargarAreas(); 
  }, []);

  const cargarAreas = async () => {
    try {
      const resp = await apiClient.get('/areas');
      setAreas(resp.data.data || []);
    } catch (err) {
      console.error('Error cargando areas:', err);
      setAreas([]);
    }
  };

  const cargarClientes = async () =>{
    try{
      console.log('🔵 cargarClientes: iniciando...');
      setLoading(true);
      const resp = await apiClient.get('/usuarios');
      console.log('🔵 cargarClientes: respuesta recibida', resp.data);
      const all = resp.data.data || [];
      const clientesFiltrados = all.filter(u => u.rol === 'cliente' || u.rol === 'usuario_registrado');
      console.log('🔵 cargarClientes: clientes filtrados', clientesFiltrados.length);
      setClientes(clientesFiltrados);
      setPage(1);
    }catch(err){
      console.error('❌ Error cargando clientes:', err);
      setClientes([]);
    }finally{ 
      setLoading(false);
      console.log('🔵 cargarClientes: finalizado');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar cliente? Esto solo desactiva la cuenta.')) return;
    try{
      const resp = await apiClient.delete(`/usuarios/${id}`);
      alert(resp.data.message || 'Cliente eliminado');
      await cargarClientes();
    }catch(err){
      console.error('Error eliminando cliente:', err);
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setForm({ id: null, nombre: '', correo: '', password: '', direccion: '', telefono: '', rol: 'cliente', areaId: '', foto_perfil: '', saldo: 0, activo: true });
    setShowModal(true);
  };

  const openEditModal = (cliente) => {
    setIsEditing(true);
    setForm({
      id: cliente.id,
      nombre: cliente.nombre || '',
      correo: cliente.correo || '',
      password: '',
      direccion: cliente.direccion || '',
      telefono: cliente.telefono || '',
      rol: cliente.rol || 'cliente',
      areaId: cliente.area_id || '',
      saldo: cliente.saldo ?? 0,
      activo: !!cliente.activo,
    });
    setShowModal(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && form.id) {
        // Update basic fields
        await apiClient.put(`/usuarios/${form.id}`, {
          nombre: form.nombre,
          correo: form.correo,
          direccion: form.direccion,
          telefono: form.telefono,
        });
        // Update password if provided
        if (form.password && form.password.length > 0) {
          await apiClient.put(`/usuarios/${form.id}/password`, { password: form.password });
        }
        // Update rol if changed
        if (form.rol) {
          await apiClient.put(`/usuarios/${form.id}/rol`, { rol: form.rol });
        }
        // Update saldo if provided
        if (typeof form.saldo === 'number') {
          await apiClient.put(`/usuarios/${form.id}/saldo`, { saldo: form.saldo });
        }
        // Note: toggle-activo endpoint flips state; keep explicit toggle action via list button
        alert('Cliente actualizado');
      } else {
        // Create
        const payload = {
          nombre: form.nombre,
          correo: form.correo,
          password: form.password || 'changeme',
          direccion: form.direccion,
          telefono: form.telefono,
          rol: form.rol,
          saldo: form.saldo,
          activo: form.activo ? 1 : 0,
          area_id: form.areaId || null,
        };
        const resp = await apiClient.post('/usuarios', payload);
        alert('Cliente creado (id: ' + resp.data.data.id + ')');
      }
      setShowModal(false);
      await cargarClientes();
    } catch (err) {
      console.error('Error en submit:', err);
      alert(err.response?.data?.message || 'Error al guardar cliente');
    }
  };

  const handleAgregarSaldo = async (id) => {
    try {
      const raw = prompt('Monto a agregar:');
      if (!raw) return;
      const monto = parseFloat(raw.replace(',', '.'));
      if (isNaN(monto) || monto <= 0) return alert('Monto inválido');
      await apiClient.put(`/usuarios/${id}/saldo/agregar`, { monto });
      alert('Saldo agregado');
      await cargarClientes();
    } catch (err) {
      console.error('Error agregando saldo:', err);
      alert(err.response?.data?.message || 'Error al agregar saldo');
    }
  };

  const handlePagar = async (id) => {
    try {
      // Encontrar el cliente para mostrar su saldo actual
      const cliente = clientes.find(c => c.id === id);
      if (!cliente) return alert('Cliente no encontrado');
      
      const saldoDisponible = Number(cliente.saldo) || 0;
      const raw = prompt(`Saldo disponible: $${saldoDisponible.toFixed(2)}\n\nMonto a descontar (pagar):`);
      if (!raw) return;
      
      const monto = parseFloat(raw.replace(',', '.'));
      if (isNaN(monto) || monto <= 0) return alert('Monto inválido');
      
      // Validación en frontend
      if (monto > saldoDisponible) {
        return alert(`❌ Monto inválido\n\nNo se puede descontar $${monto.toFixed(2)}\nSaldo disponible: $${saldoDisponible.toFixed(2)}`);
      }
      
      const resp = await apiClient.put(`/usuarios/${id}/saldo/restar`, { monto });
      alert(resp.data.message || 'Pago registrado');
      await cargarClientes();
    } catch (err) {
      console.error('Error registrando pago:', err);
      alert(err.response?.data?.message || 'Error al registrar pago');
    }
  };

  const handleToggleActivo = async (id) => {
    try {
      await apiClient.put(`/usuarios/${id}/toggle-activo`);
      alert('Estado actualizado');
      await cargarClientes();
    } catch (err) {
      console.error('Error toggling activo:', err);
      alert(err.response?.data?.message || 'Error al actualizar estado');
    }
  };

  console.log('🔵 AdminClientes: renderizando, loading=', loading, 'clientes.length=', clientes.length);
  
  return (
    <div className="admin-usuarios" style={{ background: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      <h1 style={{ color: '#2c3e50', fontSize: '2rem', marginBottom: '20px' }}>📋 Gestión de Clientes</h1>
      <div className="tabla-container card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          <input placeholder="Buscar rápido (nombre/email/id)" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} style={{ flex: 1, padding: 6 }} />
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="all">Todos los roles</option>
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
          <button onClick={openCreateModal} style={{ marginLeft: 8 }}>➕ Crear cliente</button>
        </div>

        {loading ? <p>Cargando clientes...</p> : (
          (() => {
            const q = query.trim().toLowerCase();
            let filtered = clientes.filter(c => (roleFilter === 'all' || c.rol === roleFilter));
            filtered = filtered.filter(c => {
              if (activoFilter === 'all') return true;
              if (activoFilter === 'activo') return !!c.activo;
              return !c.activo;
            });
            if (q) {
              filtered = filtered.filter(c => (
                String(c.id).includes(q) || (c.nombre || '').toLowerCase().includes(q) || (c.correo || '').toLowerCase().includes(q)
              ));
            }
            const total = filtered.length;
            const pageCount = Math.max(1, Math.ceil(total / perPage));
            const current = Math.min(page, pageCount);
            const start = (current - 1) * perPage;
            const visible = filtered.slice(start, start + perPage);

            return (
              <>
                <div style={{ marginBottom: 8 }}><small>Mostrando {visible.length} de {total} clientes</small></div>
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Saldo</th>
                      <th>Activo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map(c => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.nombre}</td>
                        <td>{c.correo}</td>
                        <td style={{ fontWeight: 'bold', color: (Number(c.saldo) || 0) > 0 ? '#27ae60' : '#e74c3c' }}>
                          ${(Number(c.saldo) || 0).toFixed(2)}
                        </td>
                        <td>{c.activo ? 'Sí' : 'No'}</td>
                        <td>
                          <button className="icon-btn" title="Ver cliente" onClick={() => alert(JSON.stringify(c, null, 2))}>👁️</button>
                          <button className="icon-btn" title="Editar cliente" onClick={() => openEditModal(c)} style={{ marginLeft: 6 }}>✏️</button>
                          <button className="icon-btn" title="Agregar saldo" onClick={() => handleAgregarSaldo(c.id)} style={{ marginLeft: 6 }}>➕</button>
                          <button className="icon-btn" title="Pagar (restar saldo)" onClick={() => handlePagar(c.id)} style={{ marginLeft: 6 }}>💸</button>
                          <button className="icon-btn" title="Alternar activo" onClick={() => handleToggleActivo(c.id)} style={{ marginLeft: 6 }}>🔁</button>
                          <button className="icon-btn icon-delete" title="Eliminar cliente" onClick={() => handleEliminar(c.id)} style={{ marginLeft: 6 }}>🗑️</button>
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
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 8, width: 720, maxWidth: '95%' }}>
            <h3>{isEditing ? 'Editar cliente' : 'Crear cliente'}</h3>
            <form className="client-form" onSubmit={handleSubmitForm}>
              <div className="form-grid">
                <div className="form-row">
                  <label>Nombre</label>
                  <input required className="input" placeholder="Nombre" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label>Correo</label>
                  <input required className="input" placeholder="Correo" type="email" value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label>Contraseña</label>
                  <input className="input" placeholder="Contraseña" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label>Teléfono</label>
                  <input className="input" placeholder="Teléfono" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label>Dirección</label>
                  <input className="input" placeholder="Dirección" value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label>Rol</label>
                  <select className="input" value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}>
                    <option value="cliente">Cliente</option>
                    <option value="usuario_registrado">Usuario registrado</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Área</label>
                  <select className="input" value={form.areaId} onChange={e => setForm(f => ({ ...f, areaId: e.target.value }))}>
                    <option value="">Sin área</option>
                    {areas.map(a => (<option key={a.id} value={a.id}>{a.nombre}</option>))}
                  </select>
                </div>
                <div className="form-row">
                  <label>Saldo inicial</label>
                  <input className="input" type="number" step="0.01" placeholder="Saldo inicial" value={form.saldo} onChange={e => setForm(f => ({ ...f, saldo: parseFloat(e.target.value || 0) }))} />
                </div>
                <div className="form-row form-check">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} /> Activo
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{isEditing ? 'Guardar cambios' : 'Crear cliente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
