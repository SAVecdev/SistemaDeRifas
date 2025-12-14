import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Historial.css';

export default function Historial() {
  const { usuario } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Estado para pestaña activa
  const [pestanaActiva, setPestanaActiva] = useState('activas'); // 'activas' o 'eliminadas'
  const [ventasEliminadas, setVentasEliminadas] = useState([]);
  const [loadingEliminadas, setLoadingEliminadas] = useState(false);
  
  // Filtros
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => {
    if (usuario && usuario.id) {
      cargarHistorial();
    }
  }, [usuario]);

  useEffect(() => {
    aplicarFiltros();
  }, [ventas, busqueda, filtroTipo, fechaInicio, fechaFin]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ventas/historial/vendedor/${usuario.id}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setVentas(data.data);
      } else {
        console.error('Error cargando historial:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...ventas];

    // Filtro por búsqueda (número)
    if (busqueda) {
      resultado = resultado.filter(v => 
        v.numero.includes(busqueda) || 
        v.numero_factura.toString().includes(busqueda)
      );
    }

    // Filtro por tipo de rifa
    if (filtroTipo) {
      resultado = resultado.filter(v => v.tipo_nombre === filtroTipo);
    }

    // Filtro por rango de fechas
    if (fechaInicio) {
      resultado = resultado.filter(v => v.fecha_venta >= fechaInicio);
    }
    if (fechaFin) {
      resultado = resultado.filter(v => v.fecha_venta <= fechaFin + ' 23:59:59');
    }

    setVentasFiltradas(resultado);
    setCurrentPage(1);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroTipo('');
    setFechaInicio('');
    setFechaFin('');
  };

  const verDetallesPremios = (venta) => {
    const premios = [];
    for (let i = 1; i <= 10; i++) {
      const valor = venta[`premio_0${i}`] || venta[`premio_${i}`];
      if (valor) {
        premios.push(`${i}°: $${parseFloat(valor).toFixed(2)}`);
      }
    }
    
    alert(`🎁 Premios del número ${venta.numero}\n\n${premios.join('\n') || 'Sin premios asignados'}`);
  };

  const cargarVentasEliminadas = async () => {
    try {
      setLoadingEliminadas(true);
      const response = await fetch(`/api/ventas/eliminadas/vendedor/${usuario.id}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setVentasEliminadas(data.data);
      } else {
        console.error('Error cargando ventas eliminadas:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar las ventas eliminadas');
    } finally {
      setLoadingEliminadas(false);
    }
  };

  const cambiarPestana = (pestana) => {
    setPestanaActiva(pestana);
    if (pestana === 'eliminadas' && ventasEliminadas.length === 0) {
      cargarVentasEliminadas();
    }
  };

  const eliminarFactura = async (facturaId, numeroFactura) => {
    if (!confirm(`¿Estás seguro de eliminar toda la factura ${numeroFactura}?\n\nSe eliminarán todos los números de esta factura.\nPodrás restaurarla desde la pestaña "Eliminadas".`)) {
      return;
    }

    try {
      const response = await fetch(`/api/ventas/factura/${facturaId}/eliminar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert(`✅ Factura ${numeroFactura} eliminada correctamente`);
        cargarHistorial(); // Recargar lista activas
        if (pestanaActiva === 'eliminadas') {
          cargarVentasEliminadas(); // Actualizar eliminadas si estamos en esa pestaña
        }
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error eliminando factura:', error);
      alert('❌ Error al eliminar la factura');
    }
  };

  // Agrupar ventas por factura
  const agruparPorFactura = (ventasArray) => {
    const facturas = {};
    
    ventasArray.forEach(venta => {
      const facturaId = venta.factura_id;
      if (!facturas[facturaId]) {
        facturas[facturaId] = {
          factura_id: facturaId,
          numero_factura: venta.numero_factura,
          fecha_venta: venta.fecha_venta,
          fecha_eliminada: venta.fecha_eliminada,
          tipo_nombre: venta.tipo_nombre,
          rifa_descripcion: venta.rifa_descripcion,
          fecha_hora_juego: venta.fecha_hora_juego,
          ventas: [],
          total_cantidad: 0,
          total_monto: 0
        };
      }
      
      facturas[facturaId].ventas.push(venta);
      facturas[facturaId].total_cantidad += venta.cantidad;
      facturas[facturaId].total_monto += Number(venta.total);
    });
    
    // Ordenar por fecha de venta o fecha de eliminación (DESC)
    return Object.values(facturas).sort((a, b) => {
      const fechaA = new Date(a.fecha_eliminada || a.fecha_venta);
      const fechaB = new Date(b.fecha_eliminada || b.fecha_venta);
      return fechaB - fechaA; // Orden descendente (más recientes primero)
    });
  };



  // Estadísticas
  const totalVentas = ventasFiltradas.length;
  const totalMonto = ventasFiltradas.reduce((sum, v) => sum + Number(v.total), 0);
  const tiposUnicos = [...new Set(ventas.map(v => v.tipo_nombre))];

  // Agrupar y paginar
  const facturasAgrupadas = agruparPorFactura(ventasFiltradas);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = facturasAgrupadas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(facturasAgrupadas.length / itemsPerPage);

  return (
    <div className="historial-container">
      <div className="historial-header">
        <div className="header-content">
          <h1 className="historial-title">📊 Historial de Ventas</h1>
          <p className="historial-subtitle">Consulta detallada de todas tus ventas realizadas</p>
        </div>
        
        {!loading && ventas.length > 0 && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎫</div>
              <div className="stat-info">
                <div className="stat-value">{totalVentas}</div>
                <div className="stat-label">Números Vendidos</div>
              </div>
            </div>
            <div className="stat-card stat-card-money">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <div className="stat-value">${totalMonto.toFixed(2)}</div>
                <div className="stat-label">Total Vendido</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎲</div>
              <div className="stat-info">
                <div className="stat-value">{tiposUnicos.length}</div>
                <div className="stat-label">Tipos de Rifas</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Pestañas */}
      <div className="tabs-container">
        <button 
          className={`tab ${pestanaActiva === 'activas' ? 'tab-active' : ''}`}
          onClick={() => cambiarPestana('activas')}
        >
          ✅ Ventas Activas {ventas.length > 0 && `(${ventas.length})`}
        </button>
        <button 
          className={`tab ${pestanaActiva === 'eliminadas' ? 'tab-active' : ''}`}
          onClick={() => cambiarPestana('eliminadas')}
        >
          🗑️ Eliminadas {ventasEliminadas.length > 0 && `(${ventasEliminadas.length})`}
        </button>
      </div>

      {/* CONTENIDO DE VENTAS ACTIVAS */}
      {pestanaActiva === 'activas' && (
        <>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Cargando historial...</p>
            </div>
          ) : (
            <>
              {/* Filtros */}
              <div className="filtros-container">
            <div className="filtros-row">
              <div className="filtro-group">
                <label>🔍 Buscar</label>
                <input
                  type="text"
                  placeholder="Número o factura..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  className="filtro-input"
                />
              </div>

              <div className="filtro-group">
                <label>📅 Desde</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)}
                  className="filtro-input"
                />
              </div>

              <div className="filtro-group">
                <label>📅 Hasta</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={e => setFechaFin(e.target.value)}
                  className="filtro-input"
                />
              </div>

              <div className="filtro-group">
                <label>🎲 Tipo</label>
                <select
                  value={filtroTipo}
                  onChange={e => setFiltroTipo(e.target.value)}
                  className="filtro-input"
                >
                  <option value="">Todos</option>
                  {tiposUnicos.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div className="filtro-group">
                <button className="btn-limpiar" onClick={limpiarFiltros}>
                  🗑️ Limpiar
                </button>
              </div>
            </div>

            <div className="filtros-footer">
              <div className="resultados-info">
                Mostrando <strong>{ventasFiltradas.length}</strong> de <strong>{ventas.length}</strong> ventas
              </div>
              <div className="controles-paginacion">
                <span>Filas por página:</span>
                <select value={itemsPerPage} onChange={e => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="historial-table-container">
            <table className="historial-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Factura</th>
                  <th>Fecha Venta</th>
                  <th>Tipo Rifa</th>
                  <th>Números</th>
                  <th>Fecha Juego</th>
                  <th>Total Números</th>
                  <th>Total Monto</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((factura, idx) => {
                  const facturaRecortada = factura.numero_factura ? `***${factura.numero_factura.toString().slice(-4)}` : '****';
                  const fechaHoraJuego = new Date(factura.fecha_hora_juego);
                  const ahora = new Date();
                  const puedeEliminar = fechaHoraJuego > ahora;
                  
                  return (
                    <React.Fragment key={`factura-${factura.factura_id}`}>
                      <tr className="factura-row">
                        <td rowSpan={factura.ventas.length + 1}>{indexOfFirstItem + idx + 1}</td>
                        <td rowSpan={factura.ventas.length + 1}>
                          <span className="codigo-factura">{facturaRecortada}</span>
                        </td>
                        <td rowSpan={factura.ventas.length + 1} className="fecha-cell">
                          {new Date(factura.fecha_venta).toLocaleString('es-EC', { 
                            timeZone: 'America/Guayaquil',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td rowSpan={factura.ventas.length + 1}>
                          <span className="badge-tipo-small">{factura.tipo_nombre}</span>
                        </td>
                        <td colSpan={2} className="header-numeros">
                          📋 Números en esta factura:
                        </td>
                        <td rowSpan={factura.ventas.length + 1} className="cantidad-cell-total">
                          {factura.total_cantidad}
                        </td>
                        <td rowSpan={factura.ventas.length + 1} className="total-cell-factura">
                          ${factura.total_monto.toFixed(2)}
                        </td>
                        <td rowSpan={factura.ventas.length + 1}>
                          {puedeEliminar ? (
                            <button 
                              className="btn-eliminar"
                              onClick={() => eliminarFactura(factura.factura_id, facturaRecortada)}
                              title="Eliminar factura completa"
                            >
                              🗑️ Eliminar
                            </button>
                          ) : (
                            <span 
                              className="btn-disabled"
                              title="No se puede eliminar. La rifa ya alcanzó su fecha de juego."
                            >
                              🔒
                            </span>
                          )}
                        </td>
                      </tr>
                      {factura.ventas.map((venta, ventaIdx) => (
                        <tr key={`venta-${venta.id}-${ventaIdx}`} className="numero-row">
                          <td className="numero-cell">
                            <span className="numero-loteria">{venta.numero}</span>
                          </td>
                          <td className="detalle-cell">
                            Cant: {venta.cantidad} × ${Number(venta.valor).toFixed(2)} = ${Number(venta.total).toFixed(2)}
                            <button 
                              className="btn-premios-inline"
                              onClick={() => verDetallesPremios(venta)}
                              title="Ver premios"
                            >
                              🎁
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
                {facturasAgrupadas.length === 0 && (
                  <tr>
                    <td colSpan={9} className="no-data">
                      {busqueda || filtroTipo || fechaInicio || fechaFin 
                        ? '🔍 No se encontraron resultados con los filtros aplicados' 
                        : '📭 No hay ventas registradas'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {facturasAgrupadas.length > 0 && (
            <div className="historial-pagination">
              <div className="pagination-info">
                Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, facturasAgrupadas.length)} de {facturasAgrupadas.length} facturas
              </div>
              <div className="pagination-buttons">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                  className="btn-page"
                >
                  ← Anterior
                </button>
                <span className="page-info">
                  Página {currentPage} de {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages}
                  className="btn-page"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
            </>
          )}
        </>
      )}

      {/* CONTENIDO DE VENTAS ELIMINADAS */}
      {pestanaActiva === 'eliminadas' && (
        <>
          {loadingEliminadas ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Cargando ventas eliminadas...</p>
            </div>
          ) : (
            <>
              <div className="historial-stats-eliminadas">
                <p className="info-eliminadas">
                  🗑️ Estas ventas han sido eliminadas. Solo el administrador puede restaurarlas.
                </p>
              </div>

              <div className="table-container">
                <table className="historial-table">
                  <thead>
                    <tr>
                      <th>N°</th>
                      <th>Factura</th>
                      <th>Fecha Venta</th>
                      <th>Fecha Eliminación</th>
                      <th>Tipo Rifa</th>
                      <th>Números</th>
                      <th>Total Números</th>
                      <th>Total Monto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agruparPorFactura(ventasEliminadas).map((factura, idx) => {
                      return (
                        <React.Fragment key={`factura-eliminada-${factura.factura_id}`}>
                          <tr className="factura-row row-eliminada">
                            <td rowSpan={factura.ventas.length + 1}>{idx + 1}</td>
                            <td rowSpan={factura.ventas.length + 1}>
                              <span className="codigo-factura">{factura.numero_factura || '****'}</span>
                            </td>
                            <td rowSpan={factura.ventas.length + 1} className="fecha-cell">
                              {new Date(factura.fecha_venta).toLocaleString('es-EC', { 
                                timeZone: 'America/Guayaquil',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td rowSpan={factura.ventas.length + 1} className="fecha-cell fecha-eliminada">
                              {new Date(factura.fecha_eliminada).toLocaleString('es-EC', { 
                                timeZone: 'America/Guayaquil',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td rowSpan={factura.ventas.length + 1}>
                              <span className="badge-tipo-small">{factura.tipo_nombre}</span>
                            </td>
                            <td colSpan={1} className="header-numeros">
                              📋 Números eliminados:
                            </td>
                            <td rowSpan={factura.ventas.length + 1} className="cantidad-cell-total">
                              {factura.total_cantidad}
                            </td>
                            <td rowSpan={factura.ventas.length + 1} className="total-cell-factura">
                              ${factura.total_monto.toFixed(2)}
                            </td>
                            <td rowSpan={factura.ventas.length + 1}>
                              <span 
                                className="badge-eliminada"
                                title="Solo el administrador puede restaurar"
                              >
                                🔒 Eliminada
                              </span>
                            </td>
                          </tr>
                          {factura.ventas.map((venta, ventaIdx) => (
                            <tr key={`venta-eliminada-${venta.id}-${ventaIdx}`} className="numero-row row-eliminada">
                              <td className="numero-cell">
                                <span className="numero-loteria">{venta.numero}</span>
                                <span className="detalle-inline">
                                  (Cant: {venta.cantidad} × ${Number(venta.valor).toFixed(2)})
                                </span>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                    {ventasEliminadas.length === 0 && (
                      <tr>
                        <td colSpan={9} className="no-data">
                          ✅ No hay ventas eliminadas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
