import React, { useState, useEffect } from 'react';
import { apiPost, apiGet } from '../utils/api';
import './VendedorPremiosPagados.css';

const VendedorPremiosPagados = () => {
  const [vista, setVista] = useState('buscar'); // 'buscar' o 'historial'
  const [numeroFactura, setNumeroFactura] = useState('');
  const [premiosEncontrados, setPremiosEncontrados] = useState([]);
  const [premiosPagados, setPremiosPagados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [facturasAbiertas, setFacturasAbiertas] = useState({});

  // Inicializar fechas: último mes
  useEffect(() => {
    const hoy = new Date();
    const haceUnMes = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setFechaFin(formatDate(hoy));
    setFechaInicio(formatDate(haceUnMes));
  }, []);

  // Cargar historial cuando se cambia a esa vista
  useEffect(() => {
    if (vista === 'historial') {
      cargarHistorial();
    }
  }, [vista, fechaInicio, fechaFin]);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const buscarPremiosPorFactura = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ tipo: '', texto: '' });
    setPremiosEncontrados([]);

    try {
      const response = await apiPost('/premios-pago/buscar', {
        numeroFactura
      });

      if (response.premios.length === 0) {
        setMensaje({ 
          tipo: 'warning', 
          texto: 'No se encontraron premios para esta factura' 
        });
      } else {
        setPremiosEncontrados(response.premios);
        setMensaje({ 
          tipo: 'success', 
          texto: `Se encontraron ${response.premios.length} premio(s)` 
        });
      }
    } catch (error) {
      console.error('Error buscando premios:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: error.error || 'Error al buscar premios' 
      });
    } finally {
      setLoading(false);
    }
  };

  const pagarPremio = async (premio) => {
    if (!window.confirm(`¿Confirmar pago de $${Number(premio.saldo_premio).toFixed(2)} al cliente ${premio.cliente}?`)) {
      return;
    }

    setLoading(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const response = await apiPost('/premios-pago/pagar', {
        idNumeroGanador: premio.id_numero_ganador,
        idUsuarioCliente: premio.id_usuario,
        idFactura: premio.id_factura,
        numerol: premio.numero_ganador
      });

      setMensaje({ 
        tipo: 'success', 
        texto: `Premio de $${Number(response.monto).toFixed(2)} pagado exitosamente` 
      });

      // Refrescar lista de premios
      buscarPremiosPorFactura({ preventDefault: () => {} });

    } catch (error) {
      console.error('Error pagando premio:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: error.details || error.error || 'Error al pagar premio' 
      });
    } finally {
      setLoading(false);
    }
  };

  const pagarTodosPendientes = async () => {
    const pendientes = premiosEncontrados.filter(p => p.pagada === 0 && p.premio_expirado === 0);
    
    if (pendientes.length === 0) {
      setMensaje({ tipo: 'warning', texto: 'No hay premios pendientes para pagar' });
      return;
    }

    const total = pendientes.reduce((sum, p) => sum + Number(p.saldo_premio), 0);
    
    if (!window.confirm(`¿Confirmar pago de ${pendientes.length} premio(s) por un total de $${total.toFixed(2)}?`)) {
      return;
    }

    setLoading(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const premiosData = pendientes.map(p => ({
        idNumeroGanador: p.id_numero_ganador,
        idUsuarioCliente: p.id_usuario,
        idFactura: p.id_factura,
        numerol: p.numero_ganador
      }));

      const response = await apiPost('/premios-pago/pagar-multiples', {
        premios: premiosData
      });

      setMensaje({ 
        tipo: 'success', 
        texto: `${response.resultados.length} premio(s) pagado(s). Total: $${Number(response.totalPagado).toFixed(2)}` 
      });

      // Refrescar lista de premios
      buscarPremiosPorFactura({ preventDefault: () => {} });

    } catch (error) {
      console.error('Error pagando premios:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: error.details || error.error || 'Error al pagar premios' 
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarHistorial = async () => {
    setLoading(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const response = await apiGet(`/premios-pago/pagados?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);

      setPremiosPagados(response.premios);
      
      if (response.premios.length === 0) {
        setMensaje({ 
          tipo: 'info', 
          texto: 'No hay premios pagados en este período' 
        });
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: 'Error al cargar historial de premios pagados' 
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularTotales = (premios) => {
    return premios.reduce((total, p) => total + Number(p.saldo_premio || 0), 0);
  };

  const agruparPorFactura = (premios) => {
    const facturas = {};
    
    premios.forEach(premio => {
      const facturaId = premio.numero_factura;
      if (!facturas[facturaId]) {
        facturas[facturaId] = {
          numero_factura: premio.numero_factura,
          premios: [],
          total_monto: 0,
          cantidad_premios: 0
        };
      }
      
      facturas[facturaId].premios.push(premio);
      facturas[facturaId].total_monto += Number(premio.saldo_premio || 0);
      facturas[facturaId].cantidad_premios += 1;
    });
    
    return Object.values(facturas).sort((a, b) => {
      // Ordenar por fecha del primer premio (más reciente primero)
      const fechaA = new Date(a.premios[0].fecha_hora_pago || a.premios[0].fecha);
      const fechaB = new Date(b.premios[0].fecha_hora_pago || b.premios[0].fecha);
      return fechaB - fechaA;
    });
  };

  const toggleFactura = (numeroFactura) => {
    setFacturasAbiertas(prev => ({
      ...prev,
      [numeroFactura]: !prev[numeroFactura]
    }));
  };

  return (
    <div className="vendedor-premios-container">
      <div className="premios-header">
        <div className="header-content">
          <h1 className="premios-title">💰 Gestión de Premios</h1>
          <p className="premios-subtitle">Busca y paga premios por factura</p>
        </div>
      </div>

      {/* Pestañas */}
      <div className="premios-tabs">
        <button 
          className={`tab-btn ${vista === 'buscar' ? 'active' : ''}`}
          onClick={() => setVista('buscar')}
        >
          🔍 Buscar y Pagar
        </button>
        <button 
          className={`tab-btn ${vista === 'historial' ? 'active' : ''}`}
          onClick={() => setVista('historial')}
        >
          📋 Historial de Pagos
        </button>
      </div>

      {/* Mensajes */}
      {mensaje.texto && (
        <div className={`mensaje mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Vista: Buscar y Pagar */}
      {vista === 'buscar' && (
        <div className="buscar-section">
          <div className="search-card">
            <h2>Buscar Premios por Factura</h2>
            <form onSubmit={buscarPremiosPorFactura}>
              <div className="form-group">
                <label htmlFor="numeroFactura">Número de Factura:</label>
                <div className="search-input-group">
                  <input
                    type="text"
                    id="numeroFactura"
                    value={numeroFactura}
                    onChange={(e) => setNumeroFactura(e.target.value)}
                    placeholder="Ingrese el número de factura"
                    required
                    disabled={loading}
                  />
                  <button type="submit" disabled={loading} className="btn-search">
                    {loading ? '🔄 Buscando...' : '🔍 Buscar'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Resultados de búsqueda */}
          {premiosEncontrados.length > 0 && (
            <div className="resultados-card">
              <div className="resultados-header">
                <h3>Premios Encontrados</h3>
                {premiosEncontrados.some(p => p.pagada === 0) && (
                  <button 
                    className="btn-pagar-todos" 
                    onClick={pagarTodosPendientes}
                    disabled={loading}
                  >
                    💰 Pagar Todos los Pendientes
                  </button>
                )}
              </div>
              <div className="table-responsive">
                <table className="premios-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Teléfono</th>
                      <th>Número Ganador</th>
                      <th>Nivel</th>
                      <th>Monto Premio</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {premiosEncontrados.map((premio, idx) => (
                      <tr key={idx} className={premio.pagada === 1 ? 'premio-pagado' : ''}>
                        <td>
                          <div className="cliente-info">
                            <strong>{premio.cliente}</strong>
                            {premio.correo && <small>{premio.correo}</small>}
                          </div>
                        </td>
                        <td>{premio.telefono || 'N/A'}</td>
                        <td className="numero-ganador">{premio.numero_ganador}</td>
                        <td>
                          <span className="badge-nivel">{premio.nivel_premio}</span>
                        </td>
                        <td className="monto">${Number(premio.saldo_premio).toFixed(2)}</td>
                        <td>{new Date(premio.fecha).toLocaleDateString()}</td>
                        <td>
                          {premio.pagada === 1 ? (
                            <span className="badge badge-success">✓ Pagado</span>
                          ) : premio.premio_expirado === 1 ? (
                            <span className="badge badge-danger">❌ Expirado</span>
                          ) : (
                            <span className="badge badge-warning">⏳ Pendiente</span>
                          )}
                        </td>
                        <td>
                          {premio.pagada === 0 ? (
                            premio.premio_expirado === 1 ? (
                              <span className="texto-expirado" title={`Han transcurrido ${premio.dias_transcurridos} días desde el juego (máximo: 8 días)`}>
                                🔒 No se puede pagar
                              </span>
                            ) : (
                              <button
                                className="btn-pagar"
                                onClick={() => pagarPremio(premio)}
                                disabled={loading}
                              >
                                💵 Pagar
                              </button>
                            )
                          ) : (
                            <span className="fecha-pago">
                              {premio.fecha_hora_pago ? 
                                new Date(premio.fecha_hora_pago).toLocaleString() : 
                                'Pagado'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4"><strong>Total Premios:</strong></td>
                      <td className="monto">
                        <strong>${calcularTotales(premiosEncontrados).toFixed(2)}</strong>
                      </td>
                      <td colSpan="3">
                        <small>
                          {premiosEncontrados.filter(p => p.pagada === 0).length} pendiente(s) | 
                          {premiosEncontrados.filter(p => p.pagada === 1).length} pagado(s)
                        </small>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vista: Historial */}
      {vista === 'historial' && (
        <div className="historial-section">
          <div className="filtros-card">
            <h2>Filtros de Fecha</h2>
            <div className="filtros-group">
              <div className="form-group">
                <label>Fecha Inicio:</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Fecha Fin:</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
              <button onClick={cargarHistorial} className="btn-aplicar" disabled={loading}>
                {loading ? '🔄 Cargando...' : '🔍 Aplicar Filtros'}
              </button>
            </div>
          </div>

          {premiosPagados.length > 0 && (
            <div className="historial-card">
              <h3>Premios Pagados ({premiosPagados.length})</h3>
              <div className="stats-summary">
                <div className="stat-item">
                  <span className="stat-label">Total Pagado:</span>
                  <span className="stat-value">${calcularTotales(premiosPagados).toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Premios:</span>
                  <span className="stat-value">{premiosPagados.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Facturas:</span>
                  <span className="stat-value">{agruparPorFactura(premiosPagados).length}</span>
                </div>
              </div>
              <div className="table-responsive">
                <table className="premios-table premios-agrupados">
                  <thead>
                    <tr>
                      <th style={{width: '40px'}}></th>
                      <th>Factura</th>
                      <th>Cantidad</th>
                      <th>Total Pagado</th>
                      <th>Última Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agruparPorFactura(premiosPagados).map((factura, idx) => (
                      <React.Fragment key={`factura-${factura.numero_factura}`}>
                        <tr 
                          className="factura-row clickable" 
                          onClick={() => toggleFactura(factura.numero_factura)}
                        >
                          <td className="expand-cell">
                            <span className="expand-icon">
                              {facturasAbiertas[factura.numero_factura] ? '▼' : '▶'}
                            </span>
                          </td>
                          <td className="factura">{factura.numero_factura}</td>
                          <td>{factura.cantidad_premios} premio(s)</td>
                          <td className="monto">${factura.total_monto.toFixed(2)}</td>
                          <td>
                            {factura.premios[0].fecha_hora_pago ? 
                              new Date(factura.premios[0].fecha_hora_pago).toLocaleString('es-EC', {
                                timeZone: 'America/Guayaquil',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 
                              'N/A'}
                          </td>
                        </tr>
                        {facturasAbiertas[factura.numero_factura] && factura.premios.map((premio, premioIdx) => (
                          <tr key={`premio-${idx}-${premioIdx}`} className="premio-detalle">
                            <td></td>
                            <td colSpan="4">
                              <div className="premio-detalle-content">
                                <div className="detalle-row">
                                  <span className="detalle-label">Cliente:</span>
                                  <span className="detalle-value">{premio.cliente}</span>
                                </div>
                                <div className="detalle-row">
                                  <span className="detalle-label">Teléfono:</span>
                                  <span className="detalle-value">{premio.telefono || 'N/A'}</span>
                                </div>
                                <div className="detalle-row">
                                  <span className="detalle-label">Número Ganador:</span>
                                  <span className="detalle-value numero-ganador">{premio.numero_ganador}</span>
                                </div>
                                <div className="detalle-row">
                                  <span className="detalle-label">Nivel:</span>
                                  <span className="badge-nivel">{premio.nivel_premio}</span>
                                </div>
                                <div className="detalle-row">
                                  <span className="detalle-label">Monto:</span>
                                  <span className="detalle-value monto">${Number(premio.saldo_premio).toFixed(2)}</span>
                                </div>
                                <div className="detalle-row">
                                  <span className="detalle-label">Fecha Pago:</span>
                                  <span className="detalle-value">
                                    {premio.fecha_hora_pago ? 
                                      new Date(premio.fecha_hora_pago).toLocaleString('es-EC', {
                                        timeZone: 'America/Guayaquil'
                                      }) : 
                                      'N/A'}
                                  </span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendedorPremiosPagados;
