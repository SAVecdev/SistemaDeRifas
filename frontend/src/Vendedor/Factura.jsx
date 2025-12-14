import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Factura.css';

export default function Factura() {
  const { usuario } = useAuth();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ventasModal, setVentasModal] = useState([]);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  useEffect(() => {
    if (usuario && usuario.id) {
      cargarFacturas();
    }
  }, [usuario]);

  const cargarFacturas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ventas/facturas/vendedor/${usuario.id}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setFacturas(data.data);
      } else {
        console.error('Error cargando facturas:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar las facturas');
    } finally {
      setLoading(false);
    }
  };

  const verDetallesFactura = async (id_factura, numeroFactura) => {
    try {
      // Obtener los detalles completos de la factura
      const response = await fetch(`/api/ventas/factura/${id_factura}/detalles`);
      const data = await response.json();
      
      if (data.status !== 'success') {
        return alert('Error al obtener los detalles de la factura');
      }
      
      const { factura, ventas } = data.data;
      
      if (ventas.length === 0) {
        return alert('No hay ventas en esta factura');
      }
      
      // Abrir modal con las ventas
      setFacturaSeleccionada({
        id: id_factura,
        numero: numeroFactura,
        tipo: ventas[0].tipo_nombre,
        fecha: ventas[0].fecha_hora_juego
      });
      setVentasModal(ventas);
      setModalAbierto(true);
      
    } catch (error) {
      console.error('Error al obtener detalles:', error);
      alert('Error al cargar los detalles de la factura');
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setVentasModal([]);
    setFacturaSeleccionada(null);
  };

  const reimprimir = async (id_factura, numeroFactura) => {
    try {
      // Obtener los detalles completos de la factura
      const response = await fetch(`/api/ventas/factura/${id_factura}/detalles`);
      const data = await response.json();
      
      if (data.status !== 'success') {
        return alert('Error al obtener los detalles de la factura');
      }
      
      const { factura, ventas } = data.data;
      
      if (ventas.length === 0) {
        return alert('No hay ventas en esta factura');
      }
      
      // Tomar datos del primer registro (todos comparten usuario y rifa)
      const primeraVenta = ventas[0];
      const totalCalculado = ventas.reduce((sum, v) => sum + Number(v.total), 0);
      
      // Preparar datos para la factura
      const facturaData = {
        numeroFactura: factura.factura,
        ventas: ventas.map(v => ({
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
          telefono: primeraVenta.vendedor_telefono
        },
        rifa: `${primeraVenta.tipo_nombre} - ${primeraVenta.rifa_descripcion}`,
        fechaJuego: primeraVenta.fecha_hora_juego
      };
      
      // Llamar a la función de impresión (copiada de Ventas.jsx)
      imprimirFactura(facturaData);
      
    } catch (error) {
      console.error('Error al reimprimir:', error);
      alert('Error al reimprimir la factura');
    }
  };

  const imprimirFactura = (facturaData) => {
    const { numeroFactura, ventas, total, usuario, rifa, fechaJuego } = facturaData;
    
    // Recortar la factura para la impresión (últimos 4 dígitos)
    const facturaRecortada = numeroFactura ? `***${numeroFactura.toString().slice(-4)}` : '****';
    
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
    
    const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Factura ${facturaRecortada}</title>
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
      <img src="/img/perfil/alcosto.png" alt="logo">
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
    <p class="text-center text-bold">KEY::${facturaRecortada}</p>
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

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = facturas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(facturas.length / itemsPerPage);

  // Estadísticas
  const totalFacturas = facturas.length;
  const totalVentas = facturas.reduce((sum, f) => sum + Number(f.monto_total), 0);
  const totalNumeros = facturas.reduce((sum, f) => sum + Number(f.total_items), 0);

  return (
    <div className="factura-container">
      <div className="factura-header">
        <div className="header-content">
          <h1 className="factura-title">📋 Historial de Facturas</h1>
          <p className="factura-subtitle">Gestiona y reimprimi tus facturas de ventas</p>
        </div>
        
        {!loading && facturas.length > 0 && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-info">
                <div className="stat-value">{totalFacturas}</div>
                <div className="stat-label">Facturas</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎫</div>
              <div className="stat-info">
                <div className="stat-value">{totalNumeros}</div>
                <div className="stat-label">Números Vendidos</div>
              </div>
            </div>
            <div className="stat-card stat-card-money">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <div className="stat-value">${totalVentas.toFixed(2)}</div>
                <div className="stat-label">Total Ventas</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando facturas...</p>
        </div>
      ) : (
        <>
          <div className="factura-controls">
            <div>
              Filas por página:
              <select value={itemsPerPage} onChange={e => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <button className="btn-refresh" onClick={cargarFacturas}>🔄 Actualizar</button>
          </div>

          <div className="factura-table-container">
            <table className="factura-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Código</th>
                  <th>Fecha Emisión</th>
                  <th>Tipo Rifa</th>
                  <th>Fecha Juego</th>
                  <th>Números</th>
                  <th>Monto</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((f, idx) => {
                  // Mostrar ID completo pero factura recortada (últimos 4 dígitos)
                  const facturaRecortada = f.factura ? `***${f.factura.toString().slice(-4)}` : '****';
                  
                  return (
                    <tr key={f.id}>
                      <td>{indexOfFirstItem + idx + 1}</td>
                      <td className="numero-factura">
                        <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                          <span style={{fontSize: '11px', color: '#9ca3af'}}>ID: {f.id}</span>
                          <span className="codigo-factura">#{facturaRecortada}</span>
                        </div>
                      </td>
                      <td>{new Date(f.created_at).toLocaleDateString('es-EC', { 
                        timeZone: 'America/Guayaquil',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</td>
                      <td>
                        <span className="badge-tipo">{f.tipo_nombre}</span>
                      </td>
                      <td>{new Date(f.fecha_hora_juego).toLocaleDateString('es-EC', { 
                        timeZone: 'America/Guayaquil',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</td>
                      <td>
                        <span className="badge-items">{f.total_items}</span>
                      </td>
                      <td className="monto-total">${Number(f.monto_total).toFixed(2)}</td>
                      <td>
                        <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                          <button 
                            className="btn-ver-detalle" 
                            onClick={() => verDetallesFactura(f.id, f.factura)}
                            title="Ver números vendidos"
                          >
                            👁️ Ver
                          </button>
                          <button 
                            className="btn-reimprimir" 
                            onClick={() => reimprimir(f.id, f.factura)}
                            title="Reimprimir factura"
                          >
                            🖨️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {facturas.length === 0 && (
                  <tr>
                    <td colSpan={8} className="no-data">No hay facturas registradas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {facturas.length > 0 && (
            <div className="factura-pagination">
              <div className="pagination-info">
                Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, facturas.length)} de {facturas.length}
              </div>
              <div className="pagination-buttons">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                  className="btn-page"
                >
                  Anterior
                </button>
                <span className="page-info">
                  Página {currentPage} de {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages}
                  className="btn-page"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de detalles */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>📋 Detalles de Factura</h2>
                {facturaSeleccionada && (
                  <p className="modal-subtitle">
                    Código: <strong>***{facturaSeleccionada.numero.toString().slice(-4)}</strong> | 
                    Tipo: <strong>{facturaSeleccionada.tipo}</strong>
                  </p>
                )}
              </div>
              <button className="btn-cerrar-modal" onClick={cerrarModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-stats">
                <div className="modal-stat">
                  <span className="modal-stat-label">Total Números:</span>
                  <span className="modal-stat-value">{ventasModal.length}</span>
                </div>
                <div className="modal-stat">
                  <span className="modal-stat-label">Total Vendido:</span>
                  <span className="modal-stat-value-money">
                    ${ventasModal.reduce((sum, v) => sum + Number(v.total), 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="modal-table-container">
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>N°</th>
                      <th>Número</th>
                      <th>Cantidad</th>
                      <th>Valor</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventasModal.map((v, idx) => (
                      <tr key={v.id}>
                        <td>{idx + 1}</td>
                        <td>
                          <span className="numero-modal">{v.numero}</span>
                        </td>
                        <td className="text-center">{v.cantidad}</td>
                        <td className="text-right">${Number(v.valor).toFixed(2)}</td>
                        <td className="text-right total-modal">${Number(v.total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-modal-cerrar" onClick={cerrarModal}>Cerrar</button>
              <button 
                className="btn-modal-reimprimir" 
                onClick={() => {
                  reimprimir(facturaSeleccionada.id, facturaSeleccionada.numero);
                  cerrarModal();
                }}
              >
                🖨️ Reimprimir Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
