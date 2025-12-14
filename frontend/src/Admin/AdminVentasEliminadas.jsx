import { useState, useEffect, Fragment } from 'react';
import './AdminVentasEliminadas.css';

export default function AdminVentasEliminadas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Reducido de 20 a 10 para ver paginación más fácilmente
  const [facturaExpandida, setFacturaExpandida] = useState(null);

  useEffect(() => {
    cargarVentasEliminadas();
  }, []);

  const cargarVentasEliminadas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ventas/eliminadas/todas');
      const data = await response.json();

      if (data.status === 'success') {
        setVentas(data.data);
      } else {
        console.error('Error:', data.message);
        alert('Error al cargar ventas eliminadas');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar ventas eliminadas');
    } finally {
      setLoading(false);
    }
  };

  const restaurarVenta = async (idVenta) => {
    if (!confirm('¿Deseas restaurar esta venta?')) {
      return;
    }

    try {
      const response = await fetch(`/api/ventas/${idVenta}/restaurar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert('✅ Venta restaurada correctamente');
        cargarVentasEliminadas();
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error restaurando venta:', error);
      alert('❌ Error al restaurar la venta');
    }
  };

  // Agrupar ventas por id_factura
  const agruparPorFactura = () => {
    const grupos = {};
    ventas.forEach(venta => {
      const facturaId = venta.id_factura || 'sin_factura';
      if (!grupos[facturaId]) {
        grupos[facturaId] = {
          id_factura: venta.id_factura,
          numero_factura: venta.numero_factura,
          ventas: [],
          total: 0,
          cantidad_ventas: 0,
          cliente: venta.usuario_nombre,
          correo: venta.usuario_correo
        };
      }
      grupos[facturaId].ventas.push(venta);
      grupos[facturaId].total += Number(venta.total);
      grupos[facturaId].cantidad_ventas++;
    });
    return Object.values(grupos);
  };

  const facturasAgrupadas = agruparPorFactura();

  // Filtrado
  const facturasFiltradas = facturasAgrupadas.filter(factura => {
    if (!busqueda) return true;
    return (
      factura.cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
      factura.correo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      factura.id_factura?.toString().includes(busqueda) ||
      factura.ventas.some(v => v.numero?.includes(busqueda))
    );
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = facturasFiltradas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(facturasFiltradas.length / itemsPerPage);

  const cambiarPagina = (numeroPagina) => {
    setCurrentPage(numeroPagina);
  };

  const toggleFactura = (facturaId) => {
    setFacturaExpandida(facturaExpandida === facturaId ? null : facturaId);
  };

  return (
    <div className="admin-ventas-eliminadas">
      <div className="header">
        <h1>🗑️ Ventas Eliminadas</h1>
        <p>Gestiona y restaura ventas eliminadas por los vendedores</p>
      </div>

      <div className="estadisticas">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{ventas.length}</div>
            <div className="stat-label">Ventas Eliminadas</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{facturasAgrupadas.length}</div>
            <div className="stat-label">Facturas Afectadas</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">
              ${ventas.reduce((sum, v) => sum + Number(v.total), 0).toFixed(2)}
            </div>
            <div className="stat-label">Total en Eliminadas</div>
          </div>
        </div>
      </div>

      <div className="filtros">
        <input
          type="text"
          placeholder="🔍 Buscar por factura, cliente o número..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
        <button onClick={cargarVentasEliminadas} className="btn-refresh">
          🔄 Actualizar
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando ventas eliminadas...</div>
      ) : (
        <>
          <div className="tabla-container">
            <table className="tabla-ventas tabla-agrupada">
              <thead>
                <tr>
                  <th width="50px"></th>
                  <th>ID Factura</th>
                  <th>Cliente</th>
                  <th className="text-center">Ventas</th>
                  <th className="text-right">Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      {busqueda ? '🔍 No se encontraron resultados' : '✅ No hay ventas eliminadas'}
                    </td>
                  </tr>
                ) : (
                  currentItems.map((factura) => (
                    <Fragment key={`factura-${factura.id_factura}`}>
                      <tr 
                        className="fila-factura"
                        onClick={() => toggleFactura(factura.id_factura)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="text-center">
                          <span className="toggle-icon">
                            {facturaExpandida === factura.id_factura ? '▼' : '▶'}
                          </span>
                        </td>
                        <td>
                          <div className="factura-info">
                            <strong>Factura #{factura.numero_factura || 'N/A'}</strong>
                            <small>ID: {factura.id_factura || 'Sin asignar'}</small>
                          </div>
                        </td>
                        <td>
                          <div className="cliente-info">
                            <strong>{factura.cliente}</strong>
                            <small>{factura.correo}</small>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="badge badge-info">{factura.cantidad_ventas} ventas</span>
                        </td>
                        <td className="text-right">
                          <strong className="total-factura">${factura.total.toFixed(2)}</strong>
                        </td>
                        <td>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`¿Restaurar todas las ${factura.cantidad_ventas} ventas de esta factura?`)) {
                                factura.ventas.forEach(v => restaurarVenta(v.id));
                              }
                            }}
                            className="btn-restaurar-todos"
                            title="Restaurar todas las ventas de esta factura"
                          >
                            ↩️ Restaurar Todas
                          </button>
                        </td>
                      </tr>
                      {facturaExpandida === factura.id_factura && factura.ventas.map((venta) => (
                        <tr key={`venta-${venta.id}`} className="fila-detalle">
                          <td></td>
                          <td className="detalle-id">#{venta.id}</td>
                          <td>
                            <span className="badge-tipo">{venta.tipo_rifa}</span>
                          </td>
                          <td>
                            <div className="detalle-numeros">
                              <strong>Número:</strong> {venta.numero}
                              <br />
                              <small>Cantidad: {venta.cantidad} × ${Number(venta.valor).toFixed(2)}</small>
                            </div>
                          </td>
                          <td className="text-right">${Number(venta.total).toFixed(2)}</td>
                          <td>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                restaurarVenta(venta.id);
                              }}
                              className="btn-restaurar-individual"
                              title="Restaurar solo esta venta"
                            >
                              ↩️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación - Siempre visible si hay datos */}
          {facturasFiltradas.length > 0 && (
            <div className="paginacion">
              <button
                onClick={() => cambiarPagina(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-pag"
              >
                ← Anterior
              </button>
              
              {/* Números de página */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                // Mostrar primeras 2, últimas 2, y 2 alrededor de la página actual
                if (
                  pageNum === 1 ||
                  pageNum === 2 ||
                  pageNum === totalPages ||
                  pageNum === totalPages - 1 ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => cambiarPagina(pageNum)}
                      className={`btn-pag ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === 3 && currentPage > 4 ||
                  pageNum === totalPages - 2 && currentPage < totalPages - 3
                ) {
                  return <span key={pageNum} className="pag-dots">...</span>;
                }
                return null;
              })}

              <button
                onClick={() => cambiarPagina(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn-pag"
              >
                Siguiente →
              </button>
              
              <span className="pag-info">
                Página {currentPage} de {totalPages} ({facturasFiltradas.length} facturas)
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
