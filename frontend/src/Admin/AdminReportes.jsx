import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminReportes.css';

const AdminReportes = () => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  // Estados para datos
  const [resumen, setResumen] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [premios, setPremios] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(false);

  // Inicializar fechas (primer día del mes actual hasta hoy)
  useEffect(() => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    // Formatear fechas como YYYY-MM-DD sin conversión UTC
    const formatearFecha = (fecha) => {
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setFechaInicio(formatearFecha(inicioMes));
    setFechaFin(formatearFecha(hoy));
  }, []);

  // Cargar datos cuando cambian las fechas o tab activo
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      cargarDatosActivos();
    }
  }, [activeTab, fechaInicio, fechaFin]);

  const cargarDatosActivos = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'resumen':
          await cargarResumen();
          break;
        case 'ventas':
          await cargarVentas();
          break;
        case 'premios':
          await cargarPremios();
          break;
        case 'transacciones':
          await cargarTransacciones();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarResumen = async () => {
    const res = await axios.get('http://localhost:5000/api/reportes/resumen', {
      params: { fechaInicio, fechaFin }
    });
    setResumen(res.data);
  };

  const cargarVentas = async () => {
    const res = await axios.get('http://localhost:5000/api/reportes/ventas', {
      params: { fechaInicio, fechaFin }
    });
    setVentas(res.data);
  };

  const cargarPremios = async () => {
    const res = await axios.get('http://localhost:5000/api/reportes/premios', {
      params: { fechaInicio, fechaFin }
    });
    setPremios(res.data);
  };

  const cargarTransacciones = async () => {
    const res = await axios.get('http://localhost:5000/api/reportes/transacciones', {
      params: { fechaInicio, fechaFin }
    });
    setTransacciones(res.data);
  };

  const formatearFecha = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const aplicarRangoRapido = (dias) => {
    const hoy = new Date();
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - dias);
    setFechaInicio(formatearFecha(inicio));
    setFechaFin(formatearFecha(hoy));
  };

  const aplicarMesActual = () => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    setFechaInicio(formatearFecha(inicioMes));
    setFechaFin(formatearFecha(hoy));
  };

  const exportarCSV = (datos, nombreArchivo) => {
    if (!datos || datos.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = Object.keys(datos[0]).join(',');
    const rows = datos.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombreArchivo}_${fechaInicio}_${fechaFin}.csv`;
    a.click();
  };

  return (
    <div className="admin-reportes">
      <h1>📊 Reportes</h1>

      {/* Filtros de fecha */}
      <div className="filtros-fecha">
        <div className="campo-fecha">
          <label>Fecha Inicio:</label>
          <input 
            type="date" 
            value={fechaInicio} 
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>
        <div className="campo-fecha">
          <label>Fecha Fin:</label>
          <input 
            type="date" 
            value={fechaFin} 
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
        <div className="rangos-rapidos">
          <button onClick={() => aplicarRangoRapido(7)}>Últimos 7 días</button>
          <button onClick={() => aplicarRangoRapido(30)}>Últimos 30 días</button>
          <button onClick={aplicarMesActual}>Mes actual</button>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="tabs-reportes">
        <button 
          className={activeTab === 'resumen' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('resumen')}
        >
          📈 Resumen
        </button>
        <button 
          className={activeTab === 'ventas' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('ventas')}
        >
          💰 Ventas
        </button>
        <button 
          className={activeTab === 'premios' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('premios')}
        >
          🏆 Premios
        </button>
        <button 
          className={activeTab === 'transacciones' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('transacciones')}
        >
          💳 Transacciones
        </button>
      </div>

      {/* Contenido según tab activo */}
      <div className="contenido-reporte">
        {loading && <p>Cargando...</p>}

        {/* RESUMEN */}
        {activeTab === 'resumen' && resumen && (
          <div className="stats-grid">
            <div className="stat-card ventas-periodo">
              <h3>Ventas del Período</h3>
              <div className="stat-number">${Number(resumen.ventas?.monto_total || 0).toFixed(2)}</div>
              <div className="stat-detail">{resumen.ventas?.total_ventas || 0} ventas • {resumen.ventas?.total_numeros || 0} números</div>
            </div>
            <div className="stat-card premios-periodo">
              <h3>Premios del Período</h3>
              <div className="stat-number">${Number(resumen.premios?.monto_premios || 0).toFixed(2)}</div>
              <div className="stat-detail">{resumen.premios?.total_premios || 0} premios</div>
            </div>
            <div className="stat-card premios-pagados">
              <h3>Premios Pagados</h3>
              <div className="stat-number">${Number(resumen.premios?.premios_pagados || 0).toFixed(2)}</div>
            </div>
            <div className="stat-card premios-pendientes">
              <h3>Premios Pendientes</h3>
              <div className="stat-number">${Number(resumen.premios?.premios_pendientes || 0).toFixed(2)}</div>
            </div>
            <div className="stat-card ventas-hoy">
              <h3>Ventas de Hoy</h3>
              <div className="stat-number">${Number(resumen.ventasHoy?.monto_total || 0).toFixed(2)}</div>
              <div className="stat-detail">{resumen.ventasHoy?.total_ventas || 0} ventas</div>
            </div>
            <div className="stat-card utilidad">
              <h3>Utilidad Neta</h3>
              <div className="stat-number">
                ${(Number(resumen.ventas?.monto_total || 0) - Number(resumen.premios?.premios_pagados || 0)).toFixed(2)}
              </div>
            </div>
            <div className="stat-card recargas-periodo">
              <h3>Recargas del Período</h3>
              <div className="stat-number">${Number(resumen.transacciones?.total_recargas || 0).toFixed(2)}</div>
              <div className="stat-detail">{resumen.transacciones?.cantidad_recargas || 0} recargas</div>
            </div>
            <div className="stat-card retiros-periodo">
              <h3>Retiros del Período</h3>
              <div className="stat-number">${Number(resumen.transacciones?.total_retiros || 0).toFixed(2)}</div>
              <div className="stat-detail">{resumen.transacciones?.cantidad_retiros || 0} retiros</div>
            </div>
          </div>
        )}

        {/* VENTAS */}
        {activeTab === 'ventas' && (
          <div>
            <div className="acciones-reporte">
              <button onClick={() => exportarCSV(ventas, 'reporte_ventas')} className="btn-exportar">
                📥 Exportar CSV
              </button>
            </div>
            <table className="tabla-reportes">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>ID Usuario</th>
                  <th>Usuario</th>
                  <th>Total Ventas</th>
                  <th>Total Números</th>
                  <th>Monto Total</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v, idx) => (
                  <tr key={idx}>
                    <td>{new Date(v.fecha).toLocaleDateString()}</td>
                    <td>{v.id_usuario}</td>
                    <td>{v.usuario}</td>
                    <td>{v.total_ventas}</td>
                    <td>{v.total_numeros}</td>
                    <td>${Number(v.monto_total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3"><strong>TOTAL</strong></td>
                  <td><strong>{ventas.reduce((sum, v) => sum + Number(v.total_ventas || 0), 0)}</strong></td>
                  <td><strong>{ventas.reduce((sum, v) => sum + Number(v.total_numeros || 0), 0)}</strong></td>
                  <td><strong>${ventas.reduce((sum, v) => sum + Number(v.monto_total || 0), 0).toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* PREMIOS */}
        {activeTab === 'premios' && (
          <div>
            <div className="acciones-reporte">
              <button onClick={() => exportarCSV(premios, 'reporte_premios')} className="btn-exportar">
                📥 Exportar CSV
              </button>
            </div>
            <table className="tabla-reportes">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>ID Usuario</th>
                  <th>Nombre</th>
                  <th>Total Premios Ganados</th>
                  <th>Total Premios Pagados</th>
                  <th>Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {premios.map((p, idx) => {
                  const ganados = Number(p.total_premios_ganados || 0);
                  const pagados = Number(p.total_premios_pagados || 0);
                  const pendiente = ganados - pagados;
                  
                  return (
                    <tr key={idx} className={pendiente > 0 ? 'row-alert' : ''}>
                      <td>{new Date(p.fecha).toLocaleDateString()}</td>
                      <td>{p.id_usuario}</td>
                      <td>{p.nombre}</td>
                      <td>${ganados.toFixed(2)}</td>
                      <td>${pagados.toFixed(2)}</td>
                      <td>
                        <span className={pendiente > 0 ? 'badge-danger' : 'badge-success'}>
                          ${pendiente.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3"><strong>TOTAL</strong></td>
                  <td>
                    <strong>
                      ${premios.reduce((sum, p) => sum + Number(p.total_premios_ganados || 0), 0).toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      ${premios.reduce((sum, p) => sum + Number(p.total_premios_pagados || 0), 0).toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      ${premios.reduce((sum, p) => {
                        const ganados = Number(p.total_premios_ganados || 0);
                        const pagados = Number(p.total_premios_pagados || 0);
                        return sum + (ganados - pagados);
                      }, 0).toFixed(2)}
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* TRANSACCIONES */}
        {activeTab === 'transacciones' && (
          <div>
            <div className="acciones-reporte">
              <button onClick={() => exportarCSV(transacciones, 'reporte_transacciones')} className="btn-exportar">
                📥 Exportar CSV
              </button>
            </div>
            <table className="tabla-reportes">
              <thead>
                <tr>
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
                {transacciones.map((t, idx) => (
                  <tr key={idx} className={t.tipo === 'recarga' ? 'row-recarga' : 'row-retiro'}>
                    <td>{new Date(t.fecha).toLocaleString('es-ES', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</td>
                    <td>
                      <span className={`badge-${t.tipo}`}>
                        {t.tipo === 'recarga' ? '💵 Recarga' : '💸 Retiro'}
                      </span>
                    </td>
                    <td>{t.cliente}</td>
                    <td>{t.vendedor}</td>
                    <td>${Number(t.monto).toFixed(2)}</td>
                    <td>${Number(t.saldo_anterior).toFixed(2)}</td>
                    <td>${Number(t.saldo_nuevo).toFixed(2)}</td>
                    <td>{t.descripcion}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4"><strong>TOTAL</strong></td>
                  <td>
                    <strong>${transacciones.reduce((sum, t) => sum + Number(t.monto || 0), 0).toFixed(2)}</strong>
                  </td>
                  <td colSpan="3"></td>
                </tr>
                <tr className="row-summary">
                  <td colSpan="4"><strong>Total Recargas</strong></td>
                  <td>
                    <strong className="text-success">
                      ${transacciones.filter(t => t.tipo === 'recarga').reduce((sum, t) => sum + Number(t.monto || 0), 0).toFixed(2)}
                    </strong>
                  </td>
                  <td colSpan="3">
                    ({transacciones.filter(t => t.tipo === 'recarga').length} recargas)
                  </td>
                </tr>
                <tr className="row-summary">
                  <td colSpan="4"><strong>Total Retiros</strong></td>
                  <td>
                    <strong className="text-danger">
                      ${transacciones.filter(t => t.tipo === 'retiro').reduce((sum, t) => sum + Number(t.monto || 0), 0).toFixed(2)}
                    </strong>
                  </td>
                  <td colSpan="3">
                    ({transacciones.filter(t => t.tipo === 'retiro').length} retiros)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportes;
