import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../utils/api';
import './Transacciones.css';

const Transacciones = () => {
  const { usuario } = useAuth();
  const [transacciones, setTransacciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todas'); // todas, recarga, retiro
  const [paginaActual, setPaginaActual] = useState(1);
  const transaccionesPorPagina = 10;

  useEffect(() => {
    cargarTransacciones();
  }, [usuario?.id]);

  const cargarTransacciones = async () => {
    if (!usuario?.id) return;

    try {
      setCargando(true);
      setError(null);

      const data = await apiGet(`/transacciones/usuario/${usuario.id}`);

      console.log('Transacciones del usuario ID:', usuario.id);
      console.log('Datos recibidos:', data);

      if (data.status === 'success') {
        setTransacciones(data.data || []);
      } else {
        setError(data.message || 'Error al cargar transacciones');
      }
    } catch (err) {
      console.error('Error cargando transacciones:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const transaccionesFiltradas = transacciones.filter(t => {
    if (filtroTipo === 'todas') return true;
    return t.tipo === filtroTipo;
  });

  // Paginación
  const totalPaginas = Math.ceil(transaccionesFiltradas.length / transaccionesPorPagina);
  const indiceInicio = (paginaActual - 1) * transaccionesPorPagina;
  const indiceFin = indiceInicio + transaccionesPorPagina;
  const transaccionesPaginadas = transaccionesFiltradas.slice(indiceInicio, indiceFin);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  // Reset página cuando cambia el filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroTipo]);

  const calcularTotales = () => {
    const recargas = transacciones
      .filter(t => t.tipo === 'recarga')
      .reduce((sum, t) => sum + parseFloat(t.monto || 0), 0);
    
    const retiros = transacciones
      .filter(t => t.tipo === 'retiro')
      .reduce((sum, t) => sum + parseFloat(t.monto || 0), 0);

    return { recargas, retiros, neto: recargas - retiros };
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearMonto = (monto) => {
    return parseFloat(monto || 0).toFixed(2);
  };

  if (cargando) {
    return <div className="transacciones-container"><div className="loading">Cargando transacciones...</div></div>;
  }

  if (error) {
    return (
      <div className="transacciones-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  const totales = calcularTotales();

  return (
    <div className="transacciones-container">
      <div className="transacciones-header">
        <h1>💳 Historial de Transacciones</h1>
        <p>Consulta todas tus recargas y retiros de saldo</p>
      </div>

      {/* Resumen de totales */}
      <div className="totales-resumen">
        <div className="total-card recarga">
          <div className="total-icono">↑</div>
          <div className="total-info">
            <span className="total-label">Total Recargas</span>
            <span className="total-valor">Q {formatearMonto(totales.recargas)}</span>
          </div>
        </div>
        <div className="total-card retiro">
          <div className="total-icono">↓</div>
          <div className="total-info">
            <span className="total-label">Total Retiros</span>
            <span className="total-valor">Q {formatearMonto(totales.retiros)}</span>
          </div>
        </div>
        <div className="total-card neto">
          <div className="total-icono">Σ</div>
          <div className="total-info">
            <span className="total-label">Balance Neto</span>
            <span className="total-valor">Q {formatearMonto(totales.neto)}</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="transacciones-filtros">
        <button 
          className={`filtro-btn ${filtroTipo === 'todas' ? 'activo' : ''}`}
          onClick={() => setFiltroTipo('todas')}
        >
          Todas ({transacciones.length})
        </button>
        <button 
          className={`filtro-btn ${filtroTipo === 'recarga' ? 'activo' : ''}`}
          onClick={() => setFiltroTipo('recarga')}
        >
          Recargas ({transacciones.filter(t => t.tipo === 'recarga').length})
        </button>
        <button 
          className={`filtro-btn ${filtroTipo === 'retiro' ? 'activo' : ''}`}
          onClick={() => setFiltroTipo('retiro')}
        >
          Retiros ({transacciones.filter(t => t.tipo === 'retiro').length})
        </button>
      </div>

      {/* Lista de transacciones */}
      {transaccionesFiltradas.length === 0 ? (
        <div className="sin-transacciones">
          <p>📭 No hay transacciones registradas</p>
        </div>
      ) : (
        <>
        <div className="transacciones-lista">
          {transaccionesPaginadas.map((transaccion) => (
            <div key={transaccion.id} className={`transaccion-item ${transaccion.tipo}`}>
              <div className="transaccion-icono">
                {transaccion.tipo === 'recarga' ? '↑' : '↓'}
              </div>
              <div className="transaccion-contenido">
                <div className="transaccion-principal">
                  <div className="transaccion-info">
                    <h4>{transaccion.tipo === 'recarga' ? '💰 Recarga' : '💸 Retiro'}</h4>
                    {transaccion.descripcion && (
                      <p className="transaccion-descripcion">{transaccion.descripcion}</p>
                    )}
                    {transaccion.realizado_por && (
                      <p className="transaccion-realizado">
                        Realizado por: {transaccion.realizado_por}
                      </p>
                    )}
                  </div>
                  <div className="transaccion-monto">
                    <span className={`monto ${transaccion.tipo}`}>
                      {transaccion.tipo === 'recarga' ? '+' : '-'} Q {formatearMonto(transaccion.monto)}
                    </span>
                  </div>
                </div>
                <div className="transaccion-detalles">
                  <div className="detalle-item">
                    <span className="detalle-label">Saldo anterior:</span>
                    <span className="detalle-valor">Q {formatearMonto(transaccion.saldo_anterior)}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Saldo nuevo:</span>
                    <span className="detalle-valor">Q {formatearMonto(transaccion.saldo_nuevo)}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Fecha:</span>
                    <span className="detalle-valor">{formatearFecha(transaccion.fecha)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="paginacion">
            <button 
              className="paginacion-btn"
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
            >
              ‹ Anterior
            </button>
            
            <div className="paginacion-numeros">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numero => (
                <button
                  key={numero}
                  className={`paginacion-numero ${paginaActual === numero ? 'activo' : ''}`}
                  onClick={() => cambiarPagina(numero)}
                >
                  {numero}
                </button>
              ))}
            </div>
            
            <button 
              className="paginacion-btn"
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente ›
            </button>
          </div>
        )}
        
        <div className="paginacion-info">
          Mostrando {indiceInicio + 1}-{Math.min(indiceFin, transaccionesFiltradas.length)} de {transaccionesFiltradas.length} transacciones
        </div>
        </>
      )}
    </div>
  );
};

export default Transacciones;
