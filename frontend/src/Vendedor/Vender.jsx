import { useEffect, useState } from 'react';
import apiClient from '../utils/axios';
import './Vender.css';

export default function Vender(){
  const [rifas, setRifas] = useState([]);
  const [selectedRifa, setSelectedRifa] = useState(null);
  const [blockedNumbers, setBlockedNumbers] = useState([]);
  const [numero, setNumero] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [tipoTicket, setTipoTicket] = useState('LTT');
  const [juego, setJuego] = useState('');
  const [valor, setValor] = useState(1.00);
  const [cart, setCart] = useState([]);

  useEffect(()=>{ cargarRifas(); }, []);

  const cargarRifas = async () => {
    try{
      const resp = await apiClient.get('/rifas/estado/activas');
      setRifas(resp.data.data || []);
    }catch(err){
      console.error('Error cargando rifas', err);
      setRifas([]);
    }
  };

  const onSelectRifa = async (id) => {
    const r = rifas.find(x => x.id === Number(id));
    setSelectedRifa(r || null);
    setCart([]);
    if (!r) return setBlockedNumbers([]);

    // cargar numeros ganadores y vendidos
    try{
      const [g, v] = await Promise.all([
        apiClient.get(`/numero-ganadores/rifa/${r.id}`),
        apiClient.get(`/ventas/numeros-vendidos/${r.id}`)
      ]);
      const gan = (g.data.data || []).map(x => String(x.numero));
      const vend = (v.data.data || []).map(x => String(x));
      const combined = Array.from(new Set([...gan, ...vend]));
      setBlockedNumbers(combined);
    }catch(err){
      console.error('Error cargando numeros bloqueados', err);
      setBlockedNumbers([]);
    }
  };

  const isRifaExpired = () => {
    if (!selectedRifa) return true;
    const deadline = new Date(selectedRifa.fecha_hora_juego);
    return deadline <= new Date();
  };

  const addToCart = () => {
    if (!selectedRifa) return alert('Seleccione una rifa primero');
    if (isRifaExpired()) return alert('La rifa ya alcanzó su fecha/hora límite');
    const n = String(numero).trim();
    if (!n) return alert('Ingrese un número');
    if (blockedNumbers.includes(n)) return alert('El número no está disponible');
    // check duplicates in cart
    if (cart.find(i => i.numero === n)) return alert('El número ya está en el carrito');

    const item = {
      id: Date.now(),
      id_rifa: selectedRifa.id,
      fecha: new Date().toISOString(),
      tipo: tipoTicket,
      numero: n,
      cantidad: Number(cantidad) || 1,
      valor: Number(valor) || 0,
      total: (Number(cantidad) || 1) * (Number(valor) || 0)
    };
    setCart(c => [...c, item]);
    setNumero('');
  };

  const removeFromCart = (id) => setCart(c => c.filter(i => i.id !== id));

  const pagar = async () => {
    if (!selectedRifa) return alert('Seleccione una rifa');
    if (cart.length === 0) return alert('Carrito vacío');
    if (isRifaExpired()) return alert('La rifa ya alcanzó su fecha/hora límite');

    // process each cart item sequentially (simple approach)
    try{
      for(const item of cart){
        const payload = {
          id_usuario: item.id_usuario || 1, // vendedor puede usar id_usuario por defecto o implementar búsqueda
          id_rifas: item.id_rifa,
          numero: item.numero,
          cantidad: item.cantidad,
          valor: item.valor,
          total: item.total
        };
        const resp = await apiClient.post('/ventas/crear-completa', payload);
        console.log('Venta creada', resp.data);
      }
      alert('Ventas realizadas con éxito');
      setCart([]);
      // recargar numeros bloqueados
      await onSelectRifa(selectedRifa.id);
    }catch(err){
      console.error('Error en pago', err);
      alert(err.response?.data?.message || 'Error al procesar pago');
    }
  };

  return (
    <div className="vender-page">
      <h1>🎫 Venta de Números</h1>
      <div className="blocked-numbers">
        {blockedNumbers.map(n => (
          <span key={n} className="chip blocked">{n}</span>
        ))}
      </div>

      <div className="vender-grid">
        <div className="vender-form card">
          <div className="row">
            <label>Rifa</label>
            <select onChange={e => onSelectRifa(e.target.value)} value={selectedRifa?.id || ''}>
              <option value="">-- Seleccione rifa --</option>
              {rifas.map(r=> (<option key={r.id} value={r.id}>{r.descripcion} — {new Date(r.fecha_hora_juego).toLocaleString()}</option>))}
            </select>
          </div>

          <div className="row">
            <label>Número</label>
            <input value={numero} onChange={e=>setNumero(e.target.value)} placeholder="Ingrese número" />
          </div>

          <div className="row inline">
            <div>
              <label>Cantidad</label>
              <input type="number" value={cantidad} onChange={e=>setCantidad(e.target.value)} min={1} />
            </div>
            <div>
              <label>Tipo</label>
              <select value={tipoTicket} onChange={e=>setTipoTicket(e.target.value)}>
                <option value="LTT">LTT</option>
                <option value="LTRIA">LTRIA</option>
                <option value="LTT+LTRIA">LTT+LTRIA</option>
              </select>
            </div>
          </div>

          <div className="row">
            <label>Juego</label>
            <input value={juego} onChange={e=>setJuego(e.target.value)} placeholder="Juego" />
          </div>

          <div className="valor-buttons">
            {[0.25,0.5,1,2,3,5,10,20].map(v=> (
              <button key={v} type="button" className={v===valor? 'active':''} onClick={()=>setValor(v)}>{v.toFixed(2)}</button>
            ))}
          </div>

          <div style={{marginTop:12}}>
            <button className="btn-add" onClick={addToCart}>Agregar al carrito</button>
          </div>
        </div>

        <div className="vender-cart card">
          <div className="cart-actions">
            <div>Filas por página: <select><option>10</option></select></div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn-pay" onClick={pagar}>Pagar</button>
              <button onClick={()=>setCart([])}>Limpiar</button>
            </div>
          </div>

          <table className="tabla">
            <thead>
              <tr><th>ID</th><th>FECHA</th><th>TIPO</th><th>NUMERO</th><th>CANTIDAD</th><th>VALOR</th><th>TOTAL</th><th>ACCION</th></tr>
            </thead>
            <tbody>
              {cart.map((it, idx)=> (
                <tr key={it.id}>
                  <td>{idx+1}</td>
                  <td>{new Date(it.fecha).toLocaleString()}</td>
                  <td>{it.tipo}</td>
                  <td>{it.numero}</td>
                  <td>{it.cantidad}</td>
                  <td>{it.valor.toFixed(2)}</td>
                  <td>{it.total.toFixed(2)}</td>
                  <td><button className="icon-btn" onClick={()=>removeFromCart(it.id)}>Eliminar</button></td>
                </tr>
              ))}
              {cart.length===0 && (
                <tr><td colSpan={8} style={{padding:20}}>No hay números en el carrito</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
