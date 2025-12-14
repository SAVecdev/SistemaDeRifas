import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../utils/axios';
import './GanadoresRifa.css';

export default function GanadoresRifa(){
  const { id, sorteo } = useParams();
  const navigate = useNavigate();
  const [rifa, setRifa] = useState(null);
  const [ganadores, setGanadores] = useState([]); // existing
  const [formState, setFormState] = useState(() => {
    // prepare 10 levels
    return Array.from({length:10}, (_,i) => ({ nivel: i+1, enabled: false, numero: '' }));
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ cargarDatos(); }, [id, sorteo]);

  const cargarDatos = async ()=>{
    try{
      setLoading(true);
      const s = sorteo ? Number(sorteo) : 1;
      const [rResp, gResp] = await Promise.all([
        apiClient.get(`/rifas-completas/${id}`),
        apiClient.get(`/numero-ganadores/rifa/${id}?sorteo=${s}`)
      ]);
      setRifa(rResp.data.data);
      const existentes = gResp.data.data || [];
      setGanadores(existentes);

      // fill formState with existing numbers
      setFormState(prev => prev.map(f => {
        const ex = existentes.find(e => Number(e.nivel_premio) === f.nivel);
        return {
          nivel: f.nivel,
          enabled: !!ex,
          numero: ex ? ex.numero_ganador : ''
        };
      }));
    }catch(err){
      console.error('Error cargando datos:', err);
    }finally{ setLoading(false); }
  };

  const toggleLevel = (index) => {
    setFormState(prev => prev.map((p,i)=> i===index ? {...p, enabled: !p.enabled} : p));
  };

  const setNumero = (index, value) => {
    setFormState(prev => prev.map((p,i)=> i===index ? {...p, numero: value} : p));
  };

  const handleGuardar = async () =>{
    // collect enabled levels
    const toSave = formState.filter(f => f.enabled && f.numero !== '').map(f=>({ nivel_premio: f.nivel, numero_ganador: f.numero }));
    if(toSave.length === 0){
      alert('Seleccione y complete al menos un nivel para guardar');
      return;
    }
    try{
      setSaving(true);
      // Use multiples endpoint to insert; it will insert regardless of existing -> backend may error on duplicates
      const s = sorteo ? Number(sorteo) : 1;
      const resp = await apiClient.post('/numero-ganadores/multiples', { id_rifa: Number(id), numeros: toSave, sorteo: s });
      alert(resp.data.message || 'Ganadores guardados');
      await cargarDatos();
    }catch(err){
      console.error('Error guardando ganadores:', err);
      alert(err.response?.data?.message || err.message || 'Error al guardar');
    }finally{ setSaving(false); }
  };

  const handleActualizarNivel = async (nivel, numero) => {
    try{
      const s = sorteo ? Number(sorteo) : 1;
      const resp = await apiClient.put(`/numero-ganadores/rifa/${id}/nivel/${nivel}?sorteo=${s}`, { numero });
      alert(resp.data.message || 'Nivel actualizado');
      await cargarDatos();
    }catch(err){
      console.error('Error actualizando nivel:', err);
      alert(err.response?.data?.message || err.message || 'Error al actualizar');
    }
  };

  const handleEliminarNivel = async (nivel) => {
    if(!confirm(`Eliminar ganador del nivel ${nivel}?`)) return;
    try{
      const s = sorteo ? Number(sorteo) : 1;
      const resp = await apiClient.delete(`/numero-ganadores/rifa/${id}/nivel/${nivel}?sorteo=${s}`);
      alert(resp.data.message || 'Nivel eliminado');
      await cargarDatos();
    }catch(err){
      console.error('Error eliminando nivel:', err);
      alert(err.response?.data?.message || err.message || 'Error al eliminar');
    }
  };

  if(loading) return <div className="ganadores-loading">Cargando...</div>;

  return (
    <div className="ganadores-rifa container">
      <div className="grilla-header">
        <h2 className="title">Ganadores — Rifa #{id} {sorteo ? `· Sorteo ${sorteo}` : ''}</h2>
        <div className="rifa-meta">{rifa?.descripcion ? `- ${rifa.descripcion}` : ''}</div>
      </div>
      <p className="lead">Define hasta 10 niveles. Marca el checkbox para habilitar un nivel y escribe el número ganador.</p>

      <div className="niveles-grid">
        {formState.map((f, idx) => (
          <div key={f.nivel} className={`nivel-card ${f.enabled ? 'activo' : ''}`}>
            <div className="nivel-header">
              <label className="nivel-label">
                <input type="checkbox" checked={f.enabled} onChange={() => toggleLevel(idx)} />
                <span className="nivel-title">Nivel {f.nivel}</span>
              </label>
            </div>

            <div className="nivel-body">
              <input className="input-numero" type="text" placeholder="Número ganador" value={f.numero} onChange={(e)=> setNumero(idx, e.target.value)} />
            </div>

            <div className="nivel-actions">
              <button className="btn btn-primary" onClick={() => handleActualizarNivel(f.nivel, f.numero)} disabled={!f.enabled}>Actualizar</button>
              <button className="btn btn-danger" onClick={() => handleEliminarNivel(f.nivel)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      <div className="acciones-globales">
        <button className="btn btn-success" onClick={handleGuardar} disabled={saving}>Guardar seleccionados</button>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/sorteos')}>Volver</button>
      </div>
    </div>
  );
}
