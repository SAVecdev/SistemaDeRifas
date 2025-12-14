import { useEffect, useState } from 'react';
import apiClient from '../utils/axios';
import '../Admin/AdminUsuarios.css';

export default function ClienteUsuarios(){
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ cargarPerfil(); }, []);

  const cargarPerfil = async () => {
    try{
      setLoading(true);
      const resp = await apiClient.get('/usuarios/perfil');
      setPerfil(resp.data.data || null);
    }catch(err){
      console.error('Error cargando perfil:', err);
      setPerfil(null);
    }finally{ setLoading(false); }
  };

  if(loading) return <div style={{padding:18}}>Cargando perfil...</div>;

  if(!perfil) return <div style={{padding:18}}>No hay perfil disponible. Inicia sesión.</div>;

  return (
    <div className="admin-usuarios">
      <h1>Mi Perfil</h1>
      <div className="tabla-container card" style={{ padding: 18 }}>
        <p><strong>Nombre:</strong> {perfil.nombre}</p>
        <p><strong>Email:</strong> {perfil.correo}</p>
        <p><strong>Teléfono:</strong> {perfil.telefono || '—'}</p>
        <p><strong>Rol:</strong> <span className={`badge ${perfil.rol === 'administrador' ? 'badge-admin' : 'badge-success'}`}>{perfil.rol}</span></p>
        <p><strong>Saldo:</strong> {perfil.saldo ?? 0}</p>
        <p><strong>Registrado:</strong> {perfil.created_at ? new Date(perfil.created_at).toLocaleString() : '—'}</p>
      </div>
    </div>
  );
}
