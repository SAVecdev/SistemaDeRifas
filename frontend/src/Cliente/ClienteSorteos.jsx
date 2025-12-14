import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axios';
import '../Admin/AdminSorteos.css';

export default function ClienteSorteos(){
  const [rifas, setRifas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try{
      setLoading(true);
      const resp = await apiClient.get('/rifas-completas');
      setRifas(resp.data.data || []);
    }catch(err){
      console.error('Error cargando rifas para cliente:', err);
      setRifas([]);
    }finally{ setLoading(false); }
  };

  if(loading) return <div style={{padding:18}}>Cargando rifas...</div>;

  return (
    <div className="admin-sorteos">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🎟️ Sorteos disponibles</h1>
      </div>

      <div className="sorteos-list" style={{ marginTop: 12 }}>
        {rifas.map(r => (
          <div key={r.id} className="sorteo-card" onClick={() => navigate(`/rifa/${r.id}`)} role="button">
            <div className="sorteo-header">{r.descripcion || `Rifa #${r.id}`}</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>{r.tipo_nombre || ''} · {r.fecha_hora_juego ? new Date(r.fecha_hora_juego).toLocaleString() : 'Fecha por definir'}</div>
            <div className="niveles-row" style={{ gap: 6 }}>
              {Array.from({ length: Number(r.sorteos) || 1 }, (_, i) => (
                <div key={i} className="nivel-chip" style={{ width: 72, height: 40, padding: 6, borderRadius: 6 }}>{`Sorteo ${i+1}`}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
