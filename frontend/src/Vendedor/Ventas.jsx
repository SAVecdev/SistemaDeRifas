import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Ventas.css';

export default function Ventas(){
  const { usuario } = useAuth();
  const [rifas, setRifas] = useState([]);
  const [selectedRifa, setSelectedRifa] = useState(null);
  const [blockedNumbers, setBlockedNumbers] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0,10));
  const [cantidad, setCantidad] = useState(1);
  const [juego, setJuego] = useState('');
  const [valor, setValor] = useState(1.00);
  const [valorTemp, setValorTemp] = useState('1.00');
  const [numero, setNumero] = useState('');
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(()=>{ cargarRifas(); }, [fecha]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const v = Number(valorTemp);
      if(valorTemp && !isNaN(v) && v > 0) {
        const rounded = Math.round(v / 0.25) * 0.25;
        setValor(rounded);
        setValorTemp(rounded.toFixed(2));
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [valorTemp]);

  const cargarRifas = async () => {
    try{
      console.log('🔄 Cargando rifas para fecha:', fecha);
      const resp = await fetch('/api/rifas/estado/activas');
      
      if(!resp.ok) {
        console.error('❌ Error HTTP:', resp.status, resp.statusText);
        setRifas([]);
        return;
      }
      
      const data = await resp.json();
      console.log('📦 Respuesta del servidor:', data);
      
      const rifasArray = Array.isArray(data)? data : (data.data || []);
      console.log(`📋 Total rifas activas: ${rifasArray.length}`);
      
      // Filtrar rifas: mostrar SOLO las que tienen fecha_hora_juego en la fecha seleccionada
      const rifasFiltradas = rifasArray.filter(r => {
        if(!r.fecha_hora_juego) {
          console.log('⚠️ Rifa sin fecha_hora_juego:', r.id);
          return false;
        }
        
        // La BD guarda en hora local de Ecuador: '2025-12-06 19:45:00'
        // Extraer solo la fecha (primeros 10 caracteres): '2025-12-06'
        let fechaRifaSoloFecha;
        
        if (typeof r.fecha_hora_juego === 'string') {
          // Si viene como string desde MySQL: '2025-12-06 19:45:00' o '2025-12-06T19:45:00.000Z'
          fechaRifaSoloFecha = r.fecha_hora_juego.substring(0, 10);
        } else {
          // Si viene como objeto Date
          fechaRifaSoloFecha = new Date(r.fecha_hora_juego).toISOString().substring(0, 10);
        }
        
        const coincide = fechaRifaSoloFecha === fecha;
        
        console.log(`${coincide ? '✅' : '❌'} Rifa ${r.id} (${r.descripcion || r.tipo_nombre}): fecha_juego=${r.fecha_hora_juego}, extraida=${fechaRifaSoloFecha}, filtro=${fecha}, coincide=${coincide}`);
        
        return coincide;
      });
      
      console.log(`🎯 Rifas filtradas para ${fecha}: ${rifasFiltradas.length} de ${rifasArray.length}`);
      setRifas(rifasFiltradas);
      
      // Si la rifa seleccionada ya no está en la lista filtrada, limpiarla
      if(selectedRifa && !rifasFiltradas.find(r => r.id === selectedRifa.id)){
        setSelectedRifa(null);
        setCart([]);
        setBlockedNumbers([]);
      }
    }catch(err){
      console.error('❌ Error cargando rifas:', err);
      setRifas([]);
    }
  };

  const onSelectRifa = async (id) => {
    const r = rifas.find(x => String(x.id) === String(id));
    setSelectedRifa(r || null);
    setCart([]);
    if (!r) return setBlockedNumbers([]);
    try{
      const [gRes, vRes] = await Promise.all([
        fetch(`/api/numero-ganadores/rifa/${r.id}`),
        fetch(`/api/ventas/numeros-vendidos/${r.id}`)
      ]);
      const g = await (gRes.ok ? gRes.json() : Promise.resolve([]));
      const v = await (vRes.ok ? vRes.json() : Promise.resolve([]));
      const gan = (g && (g.data||g)).map?.(x => String(x.numero)) || [];
      const vend = (v && (v.data||v)).map?.(x => String(x.numero || x)) || [];
      setBlockedNumbers(Array.from(new Set([...gan, ...vend])));
    }catch(err){
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
    
    // Calcular el total que se intenta agregar
    const cantidadNum = Number(cantidad) || 1;
    const valorNum = Number(valor) || 0;
    const totalAgregar = cantidadNum * valorNum;
    
    // Calcular el total acumulado en el carrito para este número
    const totalEnCarrito = cart
      .filter(item => item.numero === n)
      .reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    
    // Total que se intentará vender (BD + carrito + nuevo)
    const totalIntentando = totalEnCarrito + totalAgregar;
    
    try {
      const resp = await fetch('/api/ventas/verificar-saldo', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
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
      
      // Si el saldo está disponible, agregar al carrito
      const fechaRifa = selectedRifa.fecha_hora_juego ? selectedRifa.fecha_hora_juego.split('T')[0] : fecha;
      const item = { 
        id: Date.now(), 
        fecha: fechaRifa, 
        numero: n, 
        cantidad: cantidadNum, 
        valor: valorNum, 
        total: totalAgregar 
      };
      setCart(c=>[...c,item]);
      setNumero('');
    } catch (err) {
      console.error('Error verificando saldo:', err);
      alert('Error al verificar disponibilidad. Intente nuevamente.');
    }
  };

  const removeItem = (id) => setCart(c=>c.filter(i=>i.id!==id));

  const convertirImagenABase64 = async (url) => {
    try {
      // El backend corre en puerto 5000, no 3001
      const backendUrl = 'http://localhost:5000';
      const frontendUrl = window.location.origin;
      let fullUrl;
      
      console.log('🖼️ URL original recibida:', url);
      
      if (!url) {
        // Imagen por defecto del frontend
        fullUrl = `${frontendUrl}/img/perfil/alcosto.png`;
      } else if (url.startsWith('http')) {
        fullUrl = url;
      } else {
        // Normalizar separadores de Windows a forward slashes
        const normalizedUrl = url.replace(/\\/g, '/');
        // Asegurar que la URL comience con /
        const cleanUrl = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
        // Las imágenes subidas están en el backend (puerto 5000)
        fullUrl = `${backendUrl}${cleanUrl}`;
      }
      
      console.log('🌐 URL completa construida:', fullUrl);
      
      const response = await fetch(fullUrl);
      if (!response.ok) {
        console.error(`❌ Error HTTP ${response.status} al cargar: ${fullUrl}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('✅ Imagen convertida a base64 exitosamente');
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Error convirtiendo imagen:', error);
      // Retornar una imagen placeholder en base64 (1x1 pixel transparente)
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }
  };

  const imprimirFactura = async (facturaData) => {
    const { numeroFactura, ventas, total, usuario, rifa, fechaJuego, fotoPerfil } = facturaData;
    
    const now = new Date();
    const formatDateTime = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${d} ${h}:${min}`;
    };
    
    const formatDateShort = (date) => {
      const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      return `${months[date.getMonth()]}-${String(date.getDate()).padStart(2,'0')}`;
    };
    
    // Convertir imagen a base64 para incrustarla en el HTML
    const imagenBase64 = await convertirImagenABase64(fotoPerfil);
    
    const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Factura ${numeroFactura}</title>
<style>
@page{size:80mm auto;margin:0}
@media print{body{margin:0}.no-print{display:none}}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:sans-serif;font-size:14px;width:80mm;padding:4mm}
.container{width:100%;margin:0 auto}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.col-span-1{grid-column:span 1}
.col-span-2{grid-column:span 2}
.text-center{text-align:center}
.text-bold{font-weight:bold}
img{width:128px;height:128px}
table{width:100%;border-collapse:collapse;border:1px solid #000;margin:4px 0}
td{border:1px solid #000;padding:4px 2px;text-align:center;font-weight:bold}
.numero-info{text-align:center;font-weight:bold;margin:8px 0 4px 0}
.footer-box{border:1px solid #000;border-radius:4px;padding:8px;margin-top:8px}
.footer-box p{margin:4px 0}
.btn-print{margin:12px auto;display:block;padding:12px 24px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:bold}
.btn-print:hover{background:#1d4ed8}
</style></head><body>
<div class="container">
  <div class="grid-2">
    <div class="col-span-1">
      <img src="${imagenBase64}" alt="logo" style="object-fit: cover; border-radius: 8px;">
    </div>
    <div class="col-span-1">
      <p class="text-center text-bold">Tu suerte comenzó</p>
      <p class="text-center text-bold">${usuario.nombre}</p>
      <p class="text-center text-bold">${rifa.split('-')[0].trim()}</p>
      <p class="text-center text-bold">${formatDateTime(now)}</p>
    </div>
  </div>

  ${ventas.map(v => {
    const premios = v.premios || {};
    const premiosArray = [];
    for(let i=1; i<=10; i++) {
      const valor = premios[i];
      if (valor) {
        const numPremio = parseFloat(valor);
        premiosArray.push(isNaN(numPremio) ? valor : `$${numPremio.toFixed(2)}`);
      } else {
        premiosArray.push('$0.00');
      }
    }
    const rows = [];
    const sufijos = ['er','do','er','to','to','to','mo','vo','no','mo'];
    for(let i=0; i<10; i+=2) {
      rows.push(`<tr>
        <td>${i+1}${sufijos[i]}.-</td>
        <td>${premiosArray[i]}</td>
        <td>${i+2}${sufijos[i+1]}.-</td>
        <td>${premiosArray[i+1]}</td>
      </tr>`);
    }
    const tipoAbrev = rifa.split('-')[0].trim().substring(0,4).toLowerCase();
    return `
    <div class="numero-info">${tipoAbrev}::${v.numero}...${v.cantidad}x${Number(v.valor).toFixed(2)}=${Number(v.total).toFixed(2)}...${formatDateShort(new Date(fechaJuego))}</div>
    <table><tbody>${rows.join('')}</tbody></table>`;
  }).join('')}

  <div class="footer-box">
    <p class="text-center text-bold">Total:: $${Number(total).toFixed(2)}</p>
    <p class="text-center text-bold">FC:: ${formatDateTime(now)}</p>
    <p class="text-center text-bold">KEY::${numeroFactura}</p>
    <p class="text-center text-bold">Todos los premios serán entregados en electrodomésticos o víveres.</p>
    <p class="text-center text-bold">Caducidad 8 Días!</p>
  </div>
</div>
<div class="no-print" style="display:flex;gap:10px;justify-content:center;margin:12px 0">
<button class="btn-print" onclick="window.print()">Imprimir Factura</button>
<button class="btn-print" style="background:#16a34a" onmouseover="this.style.background='#15803d'" onmouseout="this.style.background='#16a34a'" onclick="window.print();setTimeout(()=>window.close(),500)">Guardar como PDF</button>
</div>
</body></html>`;
    
    const w = window.open('', '_blank', 'width=350,height=700');
    w.document.write(html);
    w.document.close();
  };

  const pagar = async () => {
    if (!usuario || !usuario.id) {
      return alert('❌ Error: Usuario no autenticado. Por favor, inicie sesión nuevamente.');
    }
    if (cart.length===0) return alert('Carrito vacío');
    if (!selectedRifa) return alert('Seleccione una rifa');
    if (isExpired()) return alert('La rifa ya expiró');
    if (isPaying) return;
    
    const confirmar = window.confirm(`¿Confirmar pago de $${totalAPagar.toFixed(2)} por ${cart.length} items?`);
    if (!confirmar) return;
    
    setIsPaying(true);
    
    try{
      // Crear todas las ventas en una sola llamada
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
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify(payload) 
      });
      
      if(!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error en creación de ventas');
      }
      
      const result = await res.json();
      
      console.log('📋 Resultado del pago:', result);
      
      // Las ventas ya vienen completas desde la BD con todos los datos
      const ventasBD = result.ventas || [];
      
      if (ventasBD.length === 0) {
        throw new Error('No se obtuvieron las ventas creadas desde la base de datos');
      }
      
      // Tomar los datos del primer registro (todos comparten el mismo usuario y rifa)
      const primeraVenta = ventasBD[0];
      
      // Calcular total
      const totalCalculado = ventasBD.reduce((sum, v) => sum + Number(v.total), 0);
      
      // Preparar datos para la factura usando datos reales de la BD
      const facturaData = {
        numeroFactura: result.factura,
        ventas: ventasBD.map(v => ({
          numero: v.numero,
          cantidad: v.cantidad,
          valor: v.valor,
          total: v.total,
          premios: {
            1: v.premio_01,
            2: v.premio_02,
            3: v.premio_03,
            4: v.premio_04,
            5: v.premio_05,
            6: v.premio_06,
            7: v.premio_07,
            8: v.premio_08,
            9: v.premio_09,
            10: v.premio_10
          }
        })),
        total: totalCalculado,
        usuario: {
          nombre: primeraVenta.vendedor_nombre,
          telefono: primeraVenta.vendedor_telefono || ''
        },
        rifa: `${primeraVenta.tipo_nombre} - ${primeraVenta.rifa_descripcion}`,
        fechaJuego: primeraVenta.fecha_hora_juego,
        fotoPerfil: primeraVenta.vendedor_foto_perfil || usuario?.foto_perfil || null
      };
      
      console.log('📋 Datos completos para factura desde BD:', facturaData);
      
      // Imprimir factura (se abre en nueva ventana)
      await imprimirFactura(facturaData);
      
      // Limpiar carrito y recargar
      setCart([]);
      setCurrentPage(1);
      await onSelectRifa(selectedRifa.id);
      
      // Mostrar confirmación después de abrir la factura
      alert(`✅ Pago ejecutado exitosamente!\n${cart.length} ventas registradas.\nFactura: ${result.factura}`);
    }catch(err){
      console.error('Error en pago:', err);
      alert(`❌ Error procesando pago:\n${err.message}`);
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
    <div className="ventas-page">
      <div className="chips-row">
        {blockedNumbers.slice(0, 200).map(n=> (<span key={n} className="chip blocked">{n}</span>))}
      </div>

      <div className="ventas-grid">
        <div className="left-card form-card">
          <h2>Formulario</h2>
          <label>Rifa</label>
          <select value={selectedRifa?selectedRifa.id:''} onChange={e=>onSelectRifa(e.target.value)}>
            <option value="">-- seleccione --</option>
            {rifas.map(r=> <option key={r.id} value={r.id}>{r.tipo_nombre || 'Sin tipo'} - {r.descripcion || r.titulo}</option>)}
          </select>

          <label>Fecha</label>
          <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} />

          <label>Número</label>
          <input 
            value={numero} 
            onChange={e=>setNumero(e.target.value)} 
            onKeyDown={e=>{ if(e.key==='Enter') addToCart(); }}
            placeholder="Ingrese número" 
          />

          <label>Valor</label>
          <input 
            type="number" 
            value={valorTemp} 
            step="0.25" 
            min="0.25" 
            onChange={e=>setValorTemp(e.target.value)} 
            onKeyDown={e=>{ if(e.key==='Enter') addToCart(); }}
            placeholder="Valor personalizado"
          />
          <div className="value-buttons">
            {[0.25,0.5,1,2,3,5,10,20].map(v=> (
              <button key={v} type="button" className={Number(valor)===v? 'active':''} onClick={()=>{setValor(v); setValorTemp(v.toFixed(2));}}>{v.toFixed(2)}</button>
            ))}
          </div>

          <label>Cantidad</label>
          <input type="number" value={cantidad} min={1} onChange={e=>setCantidad(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') addToCart(); }} />

          <button className="btn-add" onClick={addToCart}>Agregar al carrito</button>
        </div>

        <div className="right-card cart-card">
          <div className="cart-top">
            <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
              <div>
                Filas por página:
                <select value={itemsPerPage} onChange={e=>{setItemsPerPage(Number(e.target.value));setCurrentPage(1);}}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div style={{fontSize:'18px',fontWeight:'bold',color:'#059669'}}>
                Total: ${totalAPagar.toFixed(2)}
              </div>
            </div>
            <div className="actions">
              <button 
                className="btn-pay" 
                onClick={pagar}
                disabled={isPaying}
                style={{opacity: isPaying ? 0.7 : 1, cursor: isPaying ? 'not-allowed' : 'pointer'}}
              >
                {isPaying ? (
                  <>
                    <span style={{display:'inline-block',width:'14px',height:'14px',border:'2px solid #fff',borderTop:'2px solid transparent',borderRadius:'50%',animation:'spin 0.6s linear infinite',marginRight:'8px'}}></span>
                    Pagando...
                  </>
                ) : 'Pagar'}
              </button>
              <button onClick={()=>{setCart([]);setCurrentPage(1);}} className="btn-clear" disabled={isPaying}>Limpiar</button>
            </div>
          </div>

          <table className="cart-table">
            <thead>
              <tr><th>ID</th><th>FECHA</th><th>NUMERO</th><th>CANTIDAD</th><th>VALOR</th><th>TOTAL</th><th>ACCION</th></tr>
            </thead>
            <tbody>
              {currentItems.map((it,idx)=> (
                <tr key={it.id}><td>{indexOfFirstItem + idx + 1}</td><td>{it.fecha}</td><td>{it.numero}</td><td>{it.cantidad}</td><td>{Number(it.valor).toFixed(2)}</td><td>{Number(it.total).toFixed(2)}</td><td><button className="icon-btn" onClick={()=>removeItem(it.id)}>Eliminar</button></td></tr>
              ))}
              {cart.length===0 && (<tr><td colSpan={7} style={{padding:20}}>Sin items en el carrito</td></tr>)}
            </tbody>
          </table>

          {cart.length > 0 && (
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px',borderTop:'1px solid #e5e7eb'}}>
              <div style={{color:'#6b7280',fontSize:'14px'}}>
                Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, cart.length)} de {cart.length}
              </div>
              <div style={{display:'flex',gap:'8px'}}>
                <button 
                  onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} 
                  disabled={currentPage===1}
                  style={{padding:'6px 12px',border:'1px solid #d1d5db',borderRadius:'6px',background:'#fff',cursor:currentPage===1?'not-allowed':'pointer',opacity:currentPage===1?0.5:1}}
                >
                  Anterior
                </button>
                <span style={{padding:'6px 12px',color:'#374151',fontWeight:'500'}}>
                  Página {currentPage} de {totalPages}
                </span>
                <button 
                  onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} 
                  disabled={currentPage===totalPages}
                  style={{padding:'6px 12px',border:'1px solid #d1d5db',borderRadius:'6px',background:'#fff',cursor:currentPage===totalPages?'not-allowed':'pointer',opacity:currentPage===totalPages?0.5:1}}
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

