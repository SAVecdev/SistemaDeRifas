import { useState, useEffect } from 'react';
import { apiGet } from '../utils/api';
import './SupervisorReportes.css';

const SupervisorReportes = () => {
  const [reportes, setReportes] = useState({
    ventas: [],
    vendedores: [],
    premios: [],
    clientes: [],
    ventasPorFecha: []
  });
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    vendedorId: 'todos'
  });
  const [vendedoresDisponibles, setVendedoresDisponibles] = useState([]);
  const [vendedorExpandido, setVendedorExpandido] = useState(null);
  const [tabActiva, setTabActiva] = useState('vendedores');
  
  // Estados de paginación
  const [paginaActualVendedores, setPaginaActualVendedores] = useState(1);
  const [paginaActualVentasDiarias, setPaginaActualVentasDiarias] = useState(1);
  const [paginaActualPremios, setPaginaActualPremios] = useState(1);
  const [paginaActualVentasFecha, setPaginaActualVentasFecha] = useState(1);
  const [paginaActualClientes, setPaginaActualClientes] = useState(1);
  const [paginaActualTransacciones, setPaginaActualTransacciones] = useState(1);
  const itemsPorPagina = 10;

  useEffect(() => {
    cargarVendedores();
  }, []);

  useEffect(() => {
    if (vendedoresDisponibles.length > 0) {
      cargarReportes();
    }
  }, [filtros, vendedoresDisponibles]);

  const cargarVendedores = async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const response = await apiGet(`/supervisor/vendedores/${usuario.id}`);
      setVendedoresDisponibles(response.vendedores || []);
    } catch (error) {
      console.error('Error cargando vendedores:', error);
    }
  };

  const cargarReportes = async () => {
    try {
      setLoading(true);
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const params = new URLSearchParams({
        idSupervisor: usuario.id,
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin,
        vendedorId: filtros.vendedorId
      });

      const data = await apiGet(`/supervisor/reportes?${params}`);
      setReportes(data);
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const exportarCSV = (datos, nombre) => {
    if (!datos || datos.length === 0) return;

    const headers = Object.keys(datos[0]);
    const csv = [
      headers.join(','),
      ...datos.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombre}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Funciones de paginación
  const paginar = (datos, paginaActual) => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return datos.slice(inicio, fin);
  };

  const totalPaginas = (datos) => Math.ceil((datos?.length || 0) / itemsPorPagina);

  const Paginador = ({ paginaActual, setPagina, datos }) => {
    const total = totalPaginas(datos);
    if (total <= 1) return null;

    return (
      <div className="paginador">
        <button 
          onClick={() => setPagina(paginaActual - 1)} 
          disabled={paginaActual === 1}
          className="btn-pagina"
        >
          ← Anterior
        </button>
        <span className="info-pagina">
          Página {paginaActual} de {total} ({datos?.length || 0} registros)
        </span>
        <button 
          onClick={() => setPagina(paginaActual + 1)} 
          disabled={paginaActual === total}
          className="btn-pagina"
        >
          Siguiente →
        </button>
      </div>
    );
  };

  const toggleVendedor = (vendedorId) => {
    setVendedorExpandido(prev => prev === vendedorId ? null : vendedorId);
  };

  if (loading && vendedoresDisponibles.length === 0) {
    return (
      <div className="supervisor-reportes-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supervisor-reportes-container">
      <div className="reportes-header">
        <div className="header-content">
          <h1 className="reportes-title">📈 Reportes y Estadísticas</h1>
          <p className="reportes-subtitle">Análisis detallado del desempeño de tus vendedores</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtro-grupo">
          <label>📅 Fecha Inicio</label>
          <input
            type="date"
            value={filtros.fechaInicio}
            onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
            className="filtro-input"
          />
        </div>
        <div className="filtro-grupo">
          <label>📅 Fecha Fin</label>
          <input
            type="date"
            value={filtros.fechaFin}
            onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
            className="filtro-input"
          />
        </div>
        <div className="filtro-grupo">
          <label>👤 Vendedor</label>
          <select
            value={filtros.vendedorId}
            onChange={(e) => handleFiltroChange('vendedorId', e.target.value)}
            className="filtro-input"
          >
            <option value="todos">Todos los vendedores</option>
            {vendedoresDisponibles.map(v => (
              <option key={v.id} value={v.id}>{v.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Generando reportes...</p>
        </div>
      ) : (
        <>
          {/* Resumen General */}
          <div className="resumen-general">
            <div className="resumen-card">
              <div className="resumen-icon">💰</div>
              <div className="resumen-info">
                <div className="resumen-label">Total Ventas</div>
                <div className="resumen-valor">{reportes.resumen?.total_ventas || 0}</div>
                <div className="resumen-monto">${Number(reportes.resumen?.monto_total || 0).toFixed(2)}</div>
              </div>
            </div>
            <div className="resumen-card">
              <div className="resumen-icon">👥</div>
              <div className="resumen-info">
                <div className="resumen-label">Clientes Únicos</div>
                <div className="resumen-valor">{reportes.resumen?.clientes_unicos || 0}</div>
              </div>
            </div>
            <div className="resumen-card">
              <div className="resumen-icon">🏆</div>
              <div className="resumen-info">
                <div className="resumen-label">Premios Pagados</div>
                <div className="resumen-valor">{reportes.resumen?.premios_pagados || 0}</div>
                <div className="resumen-monto">${Number(reportes.resumen?.monto_premios || 0).toFixed(2)}</div>
              </div>
            </div>
            <div className="resumen-card">
              <div className="resumen-icon">�</div>
              <div className="resumen-info">
                <div className="resumen-label">Transacciones</div>
                <div className="resumen-valor">{reportes.resumen?.total_transacciones || 0}</div>
                <div className="resumen-detalles">
                  <small>Depósitos: ${Number(reportes.resumen?.total_depositos || 0).toFixed(2)}</small>
                  <small>Retiros: ${Number(reportes.resumen?.total_retiros || 0).toFixed(2)}</small>
                </div>
              </div>
            </div>
            <div className="resumen-card">
              <div className="resumen-icon">�📊</div>
              <div className="resumen-info">
                <div className="resumen-label">Promedio por Venta</div>
                <div className="resumen-valor">
                  ${reportes.resumen?.total_ventas > 0 
                    ? (reportes.resumen.monto_total / reportes.resumen.total_ventas).toFixed(2)
                    : '0.00'}
                </div>
              </div>
            </div>
          </div>

          {/* Sistema de Pestañas */}
          <div className="tabs-container">
            <div className="tabs-header">
              <button 
                className={`tab-btn ${tabActiva === 'vendedores' ? 'active' : ''}`}
                onClick={() => setTabActiva('vendedores')}
              >
                👤 Vendedores
              </button>
              <button 
                className={`tab-btn ${tabActiva === 'ventasDiarias' ? 'active' : ''}`}
                onClick={() => setTabActiva('ventasDiarias')}
              >
                📅 Ventas Diarias
              </button>
              <button 
                className={`tab-btn ${tabActiva === 'premios' ? 'active' : ''}`}
                onClick={() => setTabActiva('premios')}
              >
                🏆 Premios
              </button>
              <button 
                className={`tab-btn ${tabActiva === 'ventasFecha' ? 'active' : ''}`}
                onClick={() => setTabActiva('ventasFecha')}
              >
                📊 Ventas x Fecha
              </button>
              <button 
                className={`tab-btn ${tabActiva === 'clientes' ? 'active' : ''}`}
                onClick={() => setTabActiva('clientes')}
              >
                ⭐ Top Clientes
              </button>
              <button 
                className={`tab-btn ${tabActiva === 'transacciones' ? 'active' : ''}`}
                onClick={() => setTabActiva('transacciones')}
              >
                🔄 Transacciones
              </button>
            </div>

            <div className="tab-content">
              {/* Tab: Vendedores */}
              {tabActiva === 'vendedores' && (
                <div className="reporte-seccion">
                  <div className="seccion-header">
                    <h2>👤 Desempeño por Vendedor</h2>
                    <button 
                      className="btn-export"
                      onClick={() => exportarCSV(reportes.vendedores, 'reporte_vendedores')}
                    >
                      📥 Exportar CSV
                    </button>
                  </div>

                  {reportes.vendedores?.length > 0 ? (
              <div className="vendedores-acordeon">
                {reportes.vendedores.map((vendedor) => (
                  <div key={vendedor.id} className="vendedor-item">
                    <div 
                      className="vendedor-header-acordeon"
                      onClick={() => toggleVendedor(vendedor.id)}
                    >
                      <div className="vendedor-info-principal">
                        <span className="vendedor-nombre-acordeon">{vendedor.nombre}</span>
                        <div className="vendedor-stats-resumidas">
                          <span className="stat-badge">💰 {vendedor.total_ventas} ventas</span>
                          <span className="stat-badge monto">${Number(vendedor.monto_total || 0).toFixed(2)}</span>
                          <span className="stat-badge">👥 {vendedor.clientes_unicos} clientes</span>
                        </div>
                      </div>
                      <button className="toggle-btn">
                        {vendedorExpandido === vendedor.id ? '▼' : '▶'}
                      </button>
                    </div>

                    {vendedorExpandido === vendedor.id && (
                      <div className="vendedor-detalles-expandido">
                        <div className="detalles-grid">
                          <div className="detalle-card">
                            <div className="detalle-label">Total Ventas</div>
                            <div className="detalle-valor">{vendedor.total_ventas}</div>
                          </div>
                          <div className="detalle-card">
                            <div className="detalle-label">Monto Total</div>
                            <div className="detalle-valor monto">${Number(vendedor.monto_total || 0).toFixed(2)}</div>
                          </div>
                          <div className="detalle-card">
                            <div className="detalle-label">Clientes Únicos</div>
                            <div className="detalle-valor">{vendedor.clientes_unicos}</div>
                          </div>
                          <div className="detalle-card">
                            <div className="detalle-label">Premios Pagados</div>
                            <div className="detalle-valor">{vendedor.premios_pagados}</div>
                          </div>
                          <div className="detalle-card">
                            <div className="detalle-label">Promedio por Venta</div>
                            <div className="detalle-valor">
                              ${vendedor.total_ventas > 0 
                                ? (vendedor.monto_total / vendedor.total_ventas).toFixed(2)
                                : '0.00'}
                            </div>
                          </div>
                        </div>

                        {/* Ventas diarias del vendedor */}
                        {reportes.ventasPorVendedor?.[vendedor.id]?.length > 0 && (
                          <div className="ventas-diarias-vendedor">
                            <h4>📅 Ventas Diarias</h4>
                            <div className="mini-tabla">
                              <table>
                                <thead>
                                  <tr>
                                    <th>Fecha</th>
                                    <th>Ventas</th>
                                    <th>Monto</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {reportes.ventasPorVendedor[vendedor.id].slice(0, 5).map((v, idx) => (
                                    <tr key={idx}>
                                      <td>{new Date(v.fecha).toLocaleDateString('es-EC')}</td>
                                      <td className="numero">{v.total_ventas}</td>
                                      <td className="monto">${Number(v.monto_total || 0).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Top clientes del vendedor */}
                        {reportes.clientesPorVendedor?.[vendedor.id]?.length > 0 && (
                          <div className="clientes-vendedor">
                            <h4>⭐ Top 5 Clientes</h4>
                            <div className="mini-tabla">
                              <table>
                                <thead>
                                  <tr>
                                    <th>Cliente</th>
                                    <th>Compras</th>
                                    <th>Monto</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {reportes.clientesPorVendedor[vendedor.id].slice(0, 5).map((c, idx) => (
                                    <tr key={idx}>
                                      <td>{c.nombre}</td>
                                      <td className="numero">{c.total_compras}</td>
                                      <td className="monto">${Number(c.monto_total || 0).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Transacciones del vendedor */}
                        {(() => {
                          const transaccionesVendedor = reportes.transaccionesPorVendedor?.find(t => t.vendedor_id === vendedor.id);
                          return transaccionesVendedor ? (
                            <div className="transacciones-vendedor">
                              <h4>🔄 Transacciones</h4>
                              <div className="detalles-grid">
                                <div className="detalle-card transaccion">
                                  <div className="detalle-label">Total Transacciones</div>
                                  <div className="detalle-valor">{transaccionesVendedor.total_transacciones}</div>
                                </div>
                                <div className="detalle-card transaccion deposito">
                                  <div className="detalle-label">💵 Depósitos</div>
                                  <div className="detalle-valor monto">${Number(transaccionesVendedor.total_depositos || 0).toFixed(2)}</div>
                                </div>
                                <div className="detalle-card transaccion retiro">
                                  <div className="detalle-label">💸 Retiros</div>
                                  <div className="detalle-valor monto">${Number(transaccionesVendedor.total_retiros || 0).toFixed(2)}</div>
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                ))}
                    </div>
                  ) : (
                    <div className="no-data">No hay datos disponibles</div>
                  )}
                </div>
              )}

              {/* Tab: Ventas Diarias */}
              {tabActiva === 'ventasDiarias' && (
                <div className="reporte-seccion">
                  <div className="seccion-header">
                    <h2>📅 Ventas Diarias</h2>
                    <button 
                      className="btn-export"
                      onClick={() => exportarCSV(reportes.ventas, 'ventas_diarias')}
                    >
                      📥 Exportar CSV
                    </button>
                  </div>
                  <div className="tabla-container">
              <table className="reporte-tabla">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Ventas</th>
                    <th>Monto Total</th>
                    <th>Números Vendidos</th>
                  </tr>
                </thead>
                <tbody>
                  {reportes.ventas?.length > 0 ? (
                    paginar(reportes.ventas, paginaActualVentasDiarias).map((v, index) => (
                      <tr key={index}>
                        <td>{new Date(v.fecha).toLocaleDateString('es-EC')}</td>
                        <td className="numero">{v.total_ventas}</td>
                        <td className="monto">${Number(v.monto_total || 0).toFixed(2)}</td>
                        <td className="numero">{v.numeros_vendidos}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-data">No hay ventas en este período</td>
                    </tr>
                  )}
                </tbody>
              </table>
                  <Paginador 
                    paginaActual={paginaActualVentasDiarias} 
                    setPagina={setPaginaActualVentasDiarias} 
                    datos={reportes.ventas} 
                  />
                </div>
              </div>
              )}

              {/* Tab: Premios */}
              {tabActiva === 'premios' && (
                <div className="reporte-seccion">
                  <div className="seccion-header">
                    <h2>🏆 Premios por Cliente</h2>
                    <button 
                      className="btn-export"
                      onClick={() => exportarCSV(reportes.premios, 'premios_clientes')}
                    >
                      📅 Exportar CSV
                    </button>
                  </div>
                  <div className="tabla-container">
              <table className="reporte-tabla">
                <thead>
                  <tr>
                    <th>ID Cliente</th>
                    <th>Nombre</th>
                    <th>Vendedor</th>
                    <th>Fecha</th>
                    <th>Saldo Pagado</th>
                    <th>Saldo Pendiente</th>
                  </tr>
                </thead>
                <tbody>
                  {reportes.premios?.length > 0 ? (
                    paginar(reportes.premios, paginaActualPremios).map((p, index) => (
                      <tr key={index}>
                        <td className="numero">{p.cliente_id}</td>
                        <td className="cliente-nombre">{p.cliente_nombre}</td>
                        <td>{p.vendedor_nombre}</td>
                        <td>
                          {p.fecha ? new Date(p.fecha + 'T00:00:00').toLocaleDateString('es-EC', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : '-'}
                        </td>
                        <td className="monto premio-pagado">${Number(p.monto_pagado || 0).toFixed(2)}</td>
                        <td className="monto pendiente">${Number(p.monto_pendiente || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">No hay premios en este período</td>
                    </tr>
                  )}
                </tbody>
              </table>
                  <Paginador 
                    paginaActual={paginaActualPremios} 
                    setPagina={setPaginaActualPremios} 
                    datos={reportes.premios} 
                  />
                </div>
              </div>
              )}

              {/* Tab: Ventas por Fecha */}
              {tabActiva === 'ventasFecha' && (
                <div className="reporte-seccion">
                  <div className="seccion-header">
                    <h2>📊 Ventas por Vendedor y Fecha</h2>
                    <button 
                      className="btn-export"
                      onClick={() => exportarCSV(reportes.ventasPorFecha, 'ventas_vendedor_fecha')}
                    >
                      📅 Exportar CSV
                    </button>
                  </div>
                  <div className="tabla-container">
              <table className="reporte-tabla">
                <thead>
                  <tr>
                    <th>Vendedor</th>
                    <th>Fecha</th>
                    <th>Total Ventas</th>
                    <th>Monto Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reportes.ventasPorFecha?.length > 0 ? (
                    paginar(reportes.ventasPorFecha, paginaActualVentasFecha).map((v, index) => (
                      <tr key={index}>
                        <td>{v.vendedor_nombre}</td>
                        <td>
                          {v.fecha ? new Date(v.fecha + 'T00:00:00').toLocaleDateString('es-EC', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : '-'}
                        </td>
                        <td className="numero">{v.total_ventas}</td>
                        <td className="monto">${Number(v.monto_total || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-data">No hay datos de ventas en este período</td>
                    </tr>
                  )}
                </tbody>
              </table>
                  <Paginador 
                    paginaActual={paginaActualVentasFecha} 
                    setPagina={setPaginaActualVentasFecha} 
                    datos={reportes.ventasPorFecha} 
                  />
                </div>
              </div>
              )}

              {/* Tab: Top Clientes */}
              {tabActiva === 'clientes' && (
                <div className="reporte-seccion">
                  <div className="seccion-header">
                    <h2>⭐ Top 10 Clientes</h2>
                    <button 
                      className="btn-export"
                      onClick={() => exportarCSV(reportes.clientes, 'top_clientes')}
                    >
                      📅 Exportar CSV
                    </button>
                  </div>
                  <div className="tabla-container">
              <table className="reporte-tabla">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Total Compras</th>
                    <th>Monto Total</th>
                    <th>Última Compra</th>
                  </tr>
                </thead>
                <tbody>
                  {reportes.clientes?.length > 0 ? (
                    paginar(reportes.clientes, paginaActualClientes).map((c, index) => {
                      const rankingGlobal = (paginaActualClientes - 1) * itemsPorPagina + index + 1;
                      return (
                        <tr key={index}>
                          <td className="ranking">{rankingGlobal}</td>
                          <td className="cliente-nombre">{c.nombre}</td>
                          <td className="numero">{c.total_compras}</td>
                          <td className="monto">${Number(c.monto_total || 0).toFixed(2)}</td>
                          <td>{new Date(c.ultima_compra).toLocaleDateString('es-EC')}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">No hay datos de clientes</td>
                    </tr>
                  )}
                </tbody>
              </table>
                  <Paginador 
                    paginaActual={paginaActualClientes} 
                    setPagina={setPaginaActualClientes} 
                    datos={reportes.clientes} 
                  />
                </div>
              </div>
              )}

              {/* Tab: Transacciones */}
              {tabActiva === 'transacciones' && (
                <div className="reporte-seccion">
                  <div className="seccion-header">
                    <h2>🔄 Transacciones Realizadas</h2>
                    <button 
                      className="btn-export"
                      onClick={() => exportarCSV(reportes.transacciones, 'transacciones')}
                    >
                      📅 Exportar CSV
                    </button>
                  </div>
                  <div className="tabla-container">
              <table className="reporte-tabla">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Cliente</th>
                    <th>Vendedor</th>
                    <th>Monto</th>
                    <th>Saldo Anterior</th>
                    <th>Saldo Nuevo</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {reportes.transacciones?.length > 0 ? (
                    paginar(reportes.transacciones, paginaActualTransacciones).map((t) => (
                      <tr key={t.id}>
                        <td>{t.id}</td>
                        <td>
                          {new Date(t.fecha).toLocaleString('es-EC', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td>
                          <span className={`badge-tipo tipo-${t.tipo}`}>
                            {t.tipo === 'deposito' ? '💵 Depósito' : 
                             t.tipo === 'retiro' ? '💸 Retiro' : 
                             '⚙️ Ajuste'}
                          </span>
                        </td>
                        <td>{t.cliente_nombre}</td>
                        <td className="vendedor-nombre">{t.vendedor_nombre}</td>
                        <td className={`monto ${t.tipo === 'deposito' ? 'positivo' : 'negativo'}`}>
                          {t.tipo === 'deposito' ? '+' : '-'}${Number(t.monto || 0).toFixed(2)}
                        </td>
                        <td className="monto">${Number(t.saldo_anterior || 0).toFixed(2)}</td>
                        <td className="monto">${Number(t.saldo_nuevo || 0).toFixed(2)}</td>
                        <td className="descripcion">{t.descripcion || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="no-data">No hay transacciones en este período</td>
                    </tr>
                  )}
                </tbody>
              </table>
                  <Paginador 
                    paginaActual={paginaActualTransacciones} 
                    setPagina={setPaginaActualTransacciones} 
                    datos={reportes.transacciones} 
                  />
                </div>
              </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SupervisorReportes;
