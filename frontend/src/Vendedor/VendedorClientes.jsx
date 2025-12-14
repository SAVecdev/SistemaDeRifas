import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../utils/api';
import './VendedorClientes.css';

const VendedorClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tipoTransaccion, setTipoTransaccion] = useState('recarga');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setLoading(true);
    try {
      const response = await apiGet('/vendedor-clientes');
      setClientes(response.clientes);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar clientes' });
    } finally {
      setLoading(false);
    }
  };

  const cargarTransacciones = async (idCliente) => {
    try {
      const response = await apiGet(`/vendedor-clientes/${idCliente}/transacciones?limite=50`);
      setTransacciones(Array.isArray(response.transacciones) ? response.transacciones : []);
    } catch (error) {
      console.error('Error cargando transacciones:', error);
      setTransacciones([]);
      setMensaje({ tipo: 'error', texto: 'Error al cargar transacciones' });
    }
  };

  const abrirModal = (cliente, tipo) => {
    setClienteSeleccionado(cliente);
    setTipoTransaccion(tipo);
    setMonto('');
    setDescripcion('');
    setMostrarModal(true);
    setMensaje({ tipo: '', texto: '' });
    cargarTransacciones(cliente.id);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setClienteSeleccionado(null);
    setTransacciones([]);
    setMonto('');
    setDescripcion('');
  };

  const procesarTransaccion = async (e) => {
    e.preventDefault();
    
    if (!monto || Number(monto) <= 0) {
      setMensaje({ tipo: 'error', texto: 'Ingrese un monto válido' });
      return;
    }

    setLoading(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const response = await apiPost(`/vendedor-clientes/${clienteSeleccionado.id}/transaccion`, {
        tipo: tipoTransaccion,
        monto: Number(monto),
        descripcion
      });

      setMensaje({ 
        tipo: 'success', 
        texto: response.message 
      });

      // Actualizar saldo del cliente en la lista
      setClientes(clientes.map(c => 
        c.id === clienteSeleccionado.id 
          ? { ...c, saldo: response.saldoNuevo }
          : c
      ));

      // Actualizar cliente seleccionado
      setClienteSeleccionado({
        ...clienteSeleccionado,
        saldo: response.saldoNuevo
      });

      // Recargar transacciones
      await cargarTransacciones(clienteSeleccionado.id);

      // Limpiar formulario
      setMonto('');
      setDescripcion('');

    } catch (error) {
      console.error('Error procesando transacción:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: error.details || error.error || 'Error al procesar transacción' 
      });
    } finally {
      setLoading(false);
    }
  };

  const clientesFiltrados = (clientes || []).filter(c => 
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono?.includes(busqueda) ||
    c.correo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const calcularTotales = () => {
    const clientesArray = clientes || [];
    return {
      totalClientes: clientesArray.length,
      saldoTotal: clientesArray.reduce((sum, c) => sum + Number(c.saldo || 0), 0),
      comprasTotal: clientesArray.reduce((sum, c) => sum + Number(c.monto_total_compras || 0), 0)
    };
  };

  const totales = calcularTotales();

  return (
    <div className="vendedor-clientes-container">
      <div className="clientes-header">
        <h1>👥 Gestión de Clientes</h1>
        <p className="subtitle">Administra recargas y retiros de saldo</p>
      </div>

      {/* Estadísticas */}
      <div className="stats-cards">
        <div className="stat-card-client">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-label">Total Clientes</span>
            <span className="stat-value">{totales.totalClientes}</span>
          </div>
        </div>
        <div className="stat-card-client">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-label">Saldo Total</span>
            <span className="stat-value">${totales.saldoTotal.toFixed(2)}</span>
          </div>
        </div>
        <div className="stat-card-client">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-label">Compras Totales</span>
            <span className="stat-value">${totales.comprasTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="search-section">
        <input
          type="text"
          placeholder="🔍 Buscar cliente por nombre, teléfono o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input-client"
        />
      </div>

      {/* Tabla de clientes */}
      {loading && !mostrarModal ? (
        <div className="loading-state">Cargando clientes...</div>
      ) : (
        <div className="clientes-table-card">
          <div className="table-responsive">
            <table className="clientes-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Área</th>
                  <th>Saldo</th>
                  <th>Compras</th>
                  <th>Total Gastado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      {busqueda ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                    </td>
                  </tr>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>
                        <div className="cliente-info">
                          <strong>{cliente.nombre}</strong>
                          {cliente.correo && <small>{cliente.correo}</small>}
                        </div>
                      </td>
                      <td>{cliente.telefono || 'N/A'}</td>
                      <td>
                        <span className="badge-area">{cliente.area || 'Sin área'}</span>
                      </td>
                      <td className="saldo-cell">
                        <span className={`saldo-badge ${Number(cliente.saldo) > 0 ? 'positivo' : 'cero'}`}>
                          ${Number(cliente.saldo || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="text-center">{cliente.total_compras || 0}</td>
                      <td className="monto-cell">${Number(cliente.monto_total_compras || 0).toFixed(2)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-recarga"
                            onClick={() => abrirModal(cliente, 'recarga')}
                            title="Recargar saldo"
                          >
                            💵 Recarga
                          </button>
                          <button
                            className="btn-retiro"
                            onClick={() => abrirModal(cliente, 'retiro')}
                            title="Retirar saldo"
                            disabled={Number(cliente.saldo) <= 0}
                          >
                            💸 Retiro
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de transacción */}
      {mostrarModal && clienteSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {tipoTransaccion === 'recarga' ? '💵 Recargar Saldo' : '💸 Retirar Saldo'}
              </h2>
              <button className="btn-close" onClick={cerrarModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="cliente-detalle">
                <div className="detalle-row">
                  <span className="label">Cliente:</span>
                  <span className="value">{clienteSeleccionado.nombre}</span>
                </div>
                <div className="detalle-row">
                  <span className="label">Saldo Actual:</span>
                  <span className={`value saldo-actual ${Number(clienteSeleccionado.saldo) > 0 ? 'positivo' : 'cero'}`}>
                    ${Number(clienteSeleccionado.saldo || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {mensaje.texto && (
                <div className={`mensaje-modal mensaje-${mensaje.tipo}`}>
                  {mensaje.texto}
                </div>
              )}

              <form onSubmit={procesarTransaccion} className="transaccion-form">
                <div className="form-group-modal">
                  <label>Tipo de Transacción:</label>
                  <div className="tipo-selector">
                    <button
                      type="button"
                      className={`tipo-btn ${tipoTransaccion === 'recarga' ? 'active' : ''}`}
                      onClick={() => setTipoTransaccion('recarga')}
                    >
                      💵 Recarga
                    </button>
                    <button
                      type="button"
                      className={`tipo-btn ${tipoTransaccion === 'retiro' ? 'active' : ''}`}
                      onClick={() => setTipoTransaccion('retiro')}
                      disabled={Number(clienteSeleccionado.saldo) <= 0}
                    >
                      💸 Retiro
                    </button>
                  </div>
                </div>

                <div className="form-group-modal">
                  <label htmlFor="monto">Monto: *</label>
                  <input
                    type="number"
                    id="monto"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group-modal">
                  <label htmlFor="descripcion">Descripción (opcional):</label>
                  <textarea
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Motivo de la transacción..."
                    rows="3"
                    disabled={loading}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-confirmar" disabled={loading}>
                    {loading ? 'Procesando...' : 'Confirmar'}
                  </button>
                </div>
              </form>

              {/* Historial de transacciones */}
              {Array.isArray(transacciones) && transacciones.length > 0 && (
                <div className="historial-section">
                  <h3>📜 Historial de Transacciones</h3>
                  <div className="transacciones-list">
                    {transacciones.slice(0, 10).map((t, idx) => (
                      <div key={idx} className={`transaccion-item ${t.tipo}`}>
                        <div className="transaccion-icon">
                          {t.tipo === 'recarga' ? '💵' : '💸'}
                        </div>
                        <div className="transaccion-info">
                          <div className="transaccion-tipo">
                            {t.tipo === 'recarga' ? 'Recarga' : 'Retiro'}
                          </div>
                          <div className="transaccion-fecha">
                            {new Date(t.fecha).toLocaleString()}
                          </div>
                          {t.descripcion && (
                            <div className="transaccion-desc">{t.descripcion}</div>
                          )}
                        </div>
                        <div className="transaccion-monto">
                          <span className={t.tipo}>
                            {t.tipo === 'recarga' ? '+' : '-'}${Number(t.monto).toFixed(2)}
                          </span>
                          <small>Saldo: ${Number(t.saldo_nuevo).toFixed(2)}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendedorClientes;
