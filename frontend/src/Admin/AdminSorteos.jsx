import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axios';
import './AdminSorteos.css';

export default function AdminSorteos() {
  const [rifas, setRifas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [winnersByRifa, setWinnersByRifa] = useState({});
  const [filter, setFilter] = useState('all'); // all | upcoming | finished
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const navigate = useNavigate();

  useEffect(() => { cargarRifas(); }, []);

  const cargarRifas = async () => {
    try {
      const resp = await apiClient.get('/rifas-completas');
      setRifas(resp.data.data || []);
    } catch (err) {
      console.error('Error cargando rifas:', err);
    } finally { setLoading(false); }
  };

  // prepare display list applying filter, date range and sort
  const now = Date.now();
  const displayRifas = (rifas || []).filter(r => {
    const fecha = r.fecha_hora_juego ? new Date(r.fecha_hora_juego).getTime() : null;
    // filter by status
    if (filter === 'upcoming' && fecha !== null && fecha <= now) return false;
    if (filter === 'finished' && (fecha === null || fecha > now)) return false;
    // filter by date range if provided
    if (dateFrom) {
      const fromTs = new Date(dateFrom).getTime();
      if (!fecha || fecha < fromTs) return false;
    }
    if (dateTo) {
      const toTs = new Date(dateTo).getTime();
      if (!fecha || fecha > toTs) return false;
    }
    return true;
  }).sort((a,b) => {
    const ta = a.fecha_hora_juego ? new Date(a.fecha_hora_juego).getTime() : 0;
    const tb = b.fecha_hora_juego ? new Date(b.fecha_hora_juego).getTime() : 0;
    return sortOrder === 'asc' ? ta - tb : tb - ta;
  });

  return (
    <div className="admin-sorteos">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🎟️ Sorteos</h1>
        <div className="controls-group">
          <div className="filter-controls">
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Todas</button>
            <button className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`} onClick={() => setFilter('upcoming')}>Próximas</button>
            <button className={`filter-btn ${filter === 'finished' ? 'active' : ''}`} onClick={() => setFilter('finished')}>Finalizadas</button>
          </div>
          <div className="date-controls">
            <label>Desde: <input type="datetime-local" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} /></label>
            <label>Hasta: <input type="datetime-local" value={dateTo} onChange={e=>setDateTo(e.target.value)} /></label>
            <button className="sort-btn" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>Orden: {sortOrder === 'asc' ? 'Asc' : 'Desc'}</button>
            <button className="clear-btn" onClick={() => { setDateFrom(''); setDateTo(''); setFilter('all'); setSortOrder('desc'); }}>Limpiar</button>
          </div>
        </div>
      </div>

      {loading ? <p>Cargando...</p> : (
        <table className="tabla" style={{ width: '100%', marginTop: 12 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Descripción</th>
              <th>Tipo</th>
              <th>Fecha Sorteo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const now = Date.now();
              const filtered = (rifas || []).filter(r => {
                const fecha = r.fecha_hora_juego ? new Date(r.fecha_hora_juego).getTime() : null;
                if (filter === 'all') return true;
                if (filter === 'upcoming') return !fecha || fecha > now;
                if (filter === 'finished') return fecha !== null && fecha <= now;
                return true;
              });
              return displayRifas.map(r => (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>{r.descripcion || '—'}</td>
                <td>{r.tipo_nombre || '—'}</td>
                <td>{r.fecha_hora_juego ? new Date(r.fecha_hora_juego).toLocaleString() : '—'}</td>
                <td>
                  <div>
                    <button onClick={async () => {
                      const newVal = !expanded[r.id];
                      setExpanded(prev => ({ ...prev, [r.id]: newVal }));
                      // if expanding and we don't have winners yet, fetch them
                      if (newVal && !winnersByRifa[r.id]) {
                        const sorteosCount = Number(r.sorteos) || 1;
                        const limit = sorteosCount; // show all sorteos
                        const promises = Array.from({ length: limit }, (_, i) => {
                          const s = i + 1;
                          return apiClient.get(`/numero-ganadores/rifa/${r.id}?sorteo=${s}`)
                            .then(resp => ({ sorteo: s, data: resp.data.data || [] }))
                            .catch(() => ({ sorteo: s, data: [] }));
                        });
                        const results = await Promise.all(promises);
                        setWinnersByRifa(prev => ({ ...prev, [r.id]: results }));
                      }
                    }} className="btn-small">{expanded[r.id] ? 'Ocultar sorteos' : 'Ver sorteos'}</button>
                  </div>
                  {expanded[r.id] && (
                    <div className="sorteos-list">
                      {(winnersByRifa[r.id] || Array.from({ length: Number(r.sorteos) || 1 }, (_, i) => ({ sorteo: i+1, data: [] }))).map(s => (
                        <div key={s.sorteo} className="sorteo-card" onClick={() => navigate(`/admin/sorteos/${r.id}/sorteo/${s.sorteo}`)} role="button">
                          <div className="sorteo-header">Rifa #{r.id} · Sorteo {s.sorteo}</div>
                          <div className="niveles-row">
                            {Array.from({ length: 10 }, (_, idx) => {
                              const nivel = idx + 1;
                              const found = (s.data || []).find(x => Number(x.nivel_premio) === nivel);
                              return (
                                <div key={nivel} className={`nivel-chip ${found ? 'filled' : ''}`}>
                                  <div className="nivel-num">{nivel}</div>
                                  <div className="nivel-val">{found ? found.numero_ganador : '—'}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))})()}
          </tbody>
        </table>
      )}
    </div>
  );
}
