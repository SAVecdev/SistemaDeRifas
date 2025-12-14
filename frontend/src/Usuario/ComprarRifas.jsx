import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import './ComprarRifas.css';

export default function ComprarRifas() {
  const { usuario, refrescarSaldo } = useAuth();
  const [searchParams] = useSearchParams();
  const [rifas, setRifas] = useState([]);
  const [selectedRifa, setSelectedRifa] = useState(null);
  const [blockedNumbers, setBlockedNumbers] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [cantidad, setCantidad] = useState(1);
  const [valor, setValor] = useState(1.00);
  const [valorTemp, setValorTemp] = useState('1.00');
  const [numero, setNumero] = useState('');
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isPaying, setIsPaying] = useState(false);

  // Cargar saldo del usuario al entrar a la vista
  useEffect(() => {
    if (refrescarSaldo) {
      refrescarSaldo();
    }
  }, []);

  useEffect(() => { cargarRifas(); }, [fecha]);

  // Precargar rifa desde URL si viene el parámetro rifaId
  useEffect(() => {
    const rifaId = searchParams.get('rifaId');
    if (rifaId && rifas.length > 0 && !selectedRifa) {
      onSelectRifa(rifaId);
    }
  }, [rifas, searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const v = Number(valorTemp);
      if (valorTemp && !isNaN(v) && v > 0) {
        const rounded = Math.round(v / 0.25) * 0.25;
        setValor(rounded);
        setValorTemp(rounded.toFixed(2));
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [valorTemp]);

  const cargarRifas = async () => {
    try {
      const resp = await fetch('/api/rifas/estado/activas');

      if (!resp.ok) {
        console.error('Error HTTP:', resp.status);
        setRifas([]);
        return;
      }

      const data = await resp.json();
      const rifasArray = Array.isArray(data) ? data : (data.data || []);

      // Filtrar rifas por fecha
      const rifasFiltradas = rifasArray.filter(r => {
        if (!r.fecha_hora_juego) return false;

        let fechaRifaSoloFecha;
        if (typeof r.fecha_hora_juego === 'string') {
          fechaRifaSoloFecha = r.fecha_hora_juego.substring(0, 10);
        } else {
          fechaRifaSoloFecha = new Date(r.fecha_hora_juego).toISOString().substring(0, 10);
        }

        return fechaRifaSoloFecha === fecha;
      });

      setRifas(rifasFiltradas);

      if (selectedRifa && !rifasFiltradas.find(r => r.id === selectedRifa.id)) {
        setSelectedRifa(null);
        setCart([]);
        setBlockedNumbers([]);
      }
    } catch (err) {
      console.error('Error cargando rifas:', err);
      setRifas([]);
    }
  };

  const onSelectRifa = async (id) => {
    const r = rifas.find(x => String(x.id) === String(id));
    setSelectedRifa(r || null);
    setCart([]);
    if (!r) return setBlockedNumbers([]);
    
    try {
      const [gRes, vRes] = await Promise.all([
        fetch(`/api/numero-ganadores/rifa/${r.id}`),
        fetch(`/api/ventas/numeros-vendidos/${r.id}`)
      ]);
      const g = await (gRes.ok ? gRes.json() : Promise.resolve([]));
      const v = await (vRes.ok ? vRes.json() : Promise.resolve([]));
      const gan = (g && (g.data || g)).map?.(x => String(x.numero)) || [];
      const vend = (v && (v.data || v)).map?.(x => String(x.numero || x)) || [];
      setBlockedNumbers(Array.from(new Set([...gan, ...vend])));
    } catch (err) {
      console.error('Error cargando bloqueados', err);
      setBlockedNumbers([]);
    }
  };

  const isExpired = () => {
    if (!selectedRifa) return true;
    const deadline = new Date(selectedRifa.fecha_hora_juego);
    return deadline <= new Date();
  };

  const addToCart = async () => {
    if (!usuario || !usuario.id) {
      return alert('❌ Error: Usuario no autenticado. Por favor, inicie sesión nuevamente.');
    }
    if (!selectedRifa) return alert('Seleccione una rifa');
    if (isExpired()) return alert('La rifa ya expiró');
    const n = String(numero).trim();
    if (!n) return alert('Ingrese un número');
    if (blockedNumbers.includes(n)) return alert('Número no disponible');

    const cantidadNum = Number(cantidad) || 1;
    const valorNum = Number(valor) || 0;
    const totalAgregar = cantidadNum * valorNum;

    // Calcular total del carrito actual
    const totalCarritoActual = cart.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const totalDespuesDeAgregar = totalCarritoActual + totalAgregar;

    // Verificar que el usuario tenga saldo suficiente
    const saldoUsuario = parseFloat(usuario.saldo) || 0;
    if (totalDespuesDeAgregar > saldoUsuario) {
      return alert(
        `❌ Saldo insuficiente.\n\n` +
        `Saldo disponible: Q ${saldoUsuario.toFixed(2)}\n` +
        `Total en carrito: Q ${totalCarritoActual.toFixed(2)}\n` +
        `Intentando agregar: Q ${totalAgregar.toFixed(2)}\n` +
        `Total necesario: Q ${totalDespuesDeAgregar.toFixed(2)}\n\n` +
        `Te faltan: Q ${(totalDespuesDeAgregar - saldoUsuario).toFixed(2)}`
      );
    }

    const totalEnCarrito = cart
      .filter(item => item.numero === n)
      .reduce((sum, item) => sum + (Number(item.total) || 0), 0);

    const totalIntentando = totalEnCarrito + totalAgregar;

    try {
      // Verificar límite de saldo por número en la rifa
      const resp = await fetch('/api/ventas/verificar-saldo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_rifa: selectedRifa.id,
          numero: n,
          valor_agregar: totalIntentando,
          id_usuario: usuario.id
        })
      });

      const data = await resp.json();

      if (!resp.ok || !data.disponible) {
        return alert(data.message || 'Límite de saldo excedido para este número');
      }

      const fechaRifa = selectedRifa.fecha_hora_juego ? selectedRifa.fecha_hora_juego.split('T')[0] : fecha;
      const item = {
        id: Date.now(),
        fecha: fechaRifa,
        numero: n,
        cantidad: cantidadNum,
        valor: valorNum,
        total: totalAgregar
      };
      setCart(c => [...c, item]);
      setNumero('');
    } catch (err) {
      console.error('Error verificando saldo:', err);
      alert('Error al verificar disponibilidad. Intente nuevamente.');
    }
  };

  const removeItem = (id) => setCart(c => c.filter(i => i.id !== id));

  const pagar = async () => {
    if (!usuario || !usuario.id) {
      return alert('❌ Error: Usuario no autenticado. Por favor, inicie sesión nuevamente.');
    }
    if (cart.length === 0) return alert('Carrito vacío');
    if (!selectedRifa) return alert('Seleccione una rifa');
    if (isExpired()) return alert('La rifa ya expiró');
    if (isPaying) return;

    const confirmar = window.confirm(`¿Confirmar compra de Q ${totalAPagar.toFixed(2)} por ${cart.length} números?`);
    if (!confirmar) return;

    setIsPaying(true);

    try {
      // Verificar saldo suficiente
      const saldoUsuario = parseFloat(usuario.saldo) || 0;
      if (saldoUsuario < totalAPagar) {
        alert(`❌ Saldo insuficiente.\nSaldo actual: Q ${saldoUsuario.toFixed(2)}\nTotal a pagar: Q ${totalAPagar.toFixed(2)}\n\nPor favor, recarga tu saldo.`);
        return;
      }

      const payload = {
        id_usuario: usuario.id,
        id_rifas: selectedRifa.id,
        ventas: cart.map(it => ({
          numero: it.numero,
          cantidad: it.cantidad,
          valor: it.valor,
          total: it.total
        }))
      };

      const res = await fetch('/api/ventas/crear-lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error en creación de ventas');
      }

      const result = await res.json();

      // Actualizar saldo del usuario
      await refrescarSaldo();

      // Limpiar carrito y recargar
      setCart([]);
      setCurrentPage(1);
      await onSelectRifa(selectedRifa.id);

      // Mostrar confirmación
      alert(`✅ Compra realizada exitosamente!\n${cart.length} números registrados.\nFactura: ${result.factura}\n\nPuedes ver tus compras en "Mi Historial"`);
    } catch (err) {
      console.error('Error en pago:', err);
      alert(`❌ Error procesando compra:\n${err.message}`);
    } finally {
      setIsPaying(false);
    }
  };

  // Calcular items paginados
  const totalPages = Math.ceil(cart.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cart.slice(indexOfFirstItem, indexOfLastItem);
  const totalAPagar = cart.reduce((sum, it) => sum + (Number(it.total) || 0), 0);

  return (
    <div className="comprar-rifas-page">
      <div className="comprar-header">
        <h1>🎲 Comprar Números de Rifa</h1>
        <div className="saldo-usuario">
          <span>Tu saldo: Q {parseFloat(usuario?.saldo || 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="chips-row">
        {blockedNumbers.slice(0, 200).map(n => (<span key={n} className="chip blocked">{n}</span>))}
      </div>

      <div className="comprar-grid">
        <div className="left-card form-card">
          <h2>Selecciona tu Número</h2>
          <label>Rifa</label>
          <select value={selectedRifa ? selectedRifa.id : ''} onChange={e => onSelectRifa(e.target.value)}>
            <option value="">-- seleccione --</option>
            {rifas.map(r => <option key={r.id} value={r.id}>{r.tipo_nombre || 'Sin tipo'} - {r.descripcion || r.titulo}</option>)}
          </select>

          <label>Fecha</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />

          <label>Número</label>
          <input
            value={numero}
            onChange={e => setNumero(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addToCart(); }}
            placeholder="Ingrese número"
          />

          <label>Valor</label>
          <input
            type="number"
            value={valorTemp}
            step="0.25"
            min="0.25"
            onChange={e => setValorTemp(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addToCart(); }}
            placeholder="Valor personalizado"
          />
          <div className="value-buttons">
            {[0.25, 0.5, 1, 2, 3, 5, 10, 20].map(v => (
              <button key={v} type="button" className={Number(valor) === v ? 'active' : ''} onClick={() => { setValor(v); setValorTemp(v.toFixed(2)); }}>{v.toFixed(2)}</button>
            ))}
          </div>

          <label>Cantidad</label>
          <input type="number" value={cantidad} min={1} onChange={e => setCantidad(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addToCart(); }} />

          <button className="btn-add" onClick={addToCart}>Agregar al carrito</button>
        </div>

        <div className="right-card cart-card">
          <div className="cart-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div>
                Filas por página:
                <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
                Total: Q {totalAPagar.toFixed(2)}
              </div>
            </div>
            <div className="actions">
              <button
                className="btn-pay"
                onClick={pagar}
                disabled={isPaying}
                style={{ opacity: isPaying ? 0.7 : 1, cursor: isPaying ? 'not-allowed' : 'pointer' }}
              >
                {isPaying ? (
                  <>
                    <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', marginRight: '8px' }}></span>
                    Comprando...
                  </>
                ) : 'Comprar'}
              </button>
              <button onClick={() => { setCart([]); setCurrentPage(1); }} className="btn-clear" disabled={isPaying}>Limpiar</button>
            </div>
          </div>

          <table className="cart-table">
            <thead>
              <tr><th>ID</th><th>FECHA</th><th>NUMERO</th><th>CANTIDAD</th><th>VALOR</th><th>TOTAL</th><th>ACCION</th></tr>
            </thead>
            <tbody>
              {currentItems.map((it, idx) => (
                <tr key={it.id}><td>{indexOfFirstItem + idx + 1}</td><td>{it.fecha}</td><td>{it.numero}</td><td>{it.cantidad}</td><td>{Number(it.valor).toFixed(2)}</td><td>{Number(it.total).toFixed(2)}</td><td><button className="icon-btn" onClick={() => removeItem(it.id)}>Eliminar</button></td></tr>
              ))}
              {cart.length === 0 && (<tr><td colSpan={7} style={{ padding: 20 }}>Sin items en el carrito</td></tr>)}
            </tbody>
          </table>

          {cart.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>
                Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, cart.length)} de {cart.length}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  Anterior
                </button>
                <span style={{ padding: '6px 12px', color: '#374151', fontWeight: '500' }}>
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
