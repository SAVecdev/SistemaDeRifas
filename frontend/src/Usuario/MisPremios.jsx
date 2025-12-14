import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../utils/api';
import './MisPremios.css';

const MisPremios = () => {
  const { usuario } = useAuth();
  const [premios, setPremios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cobrando, setCobrando] = useState(null);

  useEffect(() => {
    cargarPremios();
  }, [usuario?.id]);

  const cargarPremios = async () => {
    if (!usuario?.id) return;

    try {
      setCargando(true);
      setError(null);

      const data = await apiGet(`/premios-usuario/usuario/${usuario.id}/pendientes`);

      if (data.status === 'success') {
        setPremios(data.data || []);
      } else {
        setError(data.message || 'Error al cargar premios');
      }
    } catch (err) {
      console.error('Error cargando premios:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const cobrarPremio = async (premio) => {
    if (cobrando) return;
    
    const confirmar = window.confirm(
      `¿Deseas cobrar este premio?\n\n` +
      `Premio: Q ${parseFloat(premio.saldo_premio).toFixed(2)}\n` +
      `Nivel: ${premio.nivel_premio}\n` +
      `Número: ${premio.numero}\n` +
      `Factura: ${premio.numero_factura}\n\n` +
      `El monto será agregado a tu saldo.`
    );

    if (!confirmar) return;

    try {
      setCobrando(premio.id_factura + '-' + premio.nivel_premio);

      const response = await fetch('/api/premios-usuario/cobrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: premio.id_usuario,
          id_factura: premio.id_factura,
          nivel_premio: premio.nivel_premio
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert(
          `✅ ¡Premio cobrado exitosamente!\n\n` +
          `Monto: Q ${data.data.monto_premio.toFixed(2)}\n` +
          `Saldo anterior: Q ${data.data.saldo_anterior.toFixed(2)}\n` +
          `Saldo nuevo: Q ${data.data.saldo_nuevo.toFixed(2)}`
        );
        
        // Recargar premios y actualizar el usuario
        await cargarPremios();
        window.location.reload(); // Para actualizar el saldo en el contexto
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Error cobrando premio:', err);
      alert('Error al cobrar el premio. Intenta nuevamente.');
    } finally {
      setCobrando(null);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (cargando) {
    return <div className="mis-premios-container"><div className="loading">Cargando premios...</div></div>;
  }

  if (error) {
    return (
      <div className="mis-premios-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  const totalPremios = premios.reduce((sum, p) => sum + parseFloat(p.saldo_premio || 0), 0);

  return (
    <div className="mis-premios-container">
      <div className="premios-header">
        <h1>🏆 Mis Premios</h1>
        <p>Consulta y cobra tus premios ganados</p>
      </div>

      {premios.length === 0 ? (
        <div className="sin-premios">
          <div className="sin-premios-icono">🎲</div>
          <h2>No tienes premios pendientes</h2>
          <p>Sigue participando en nuestras rifas para ganar premios increíbles</p>
        </div>
      ) : (
        <>
          <div className="resumen-premios">
            <div className="resumen-card">
              <div className="resumen-icono">🎁</div>
              <div className="resumen-info">
                <span className="resumen-label">Premios Pendientes</span>
                <span className="resumen-valor">{premios.length}</span>
              </div>
            </div>
            <div className="resumen-card destacado">
              <div className="resumen-icono">💰</div>
              <div className="resumen-info">
                <span className="resumen-label">Total a Cobrar</span>
                <span className="resumen-valor">Q {totalPremios.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="premios-lista">
            {premios.map((premio, index) => (
              <div key={`${premio.id_factura}-${premio.nivel_premio}`} className="premio-card">
                <div className="premio-badge">
                  <span className="premio-nivel">Nivel {premio.nivel_premio}</span>
                  <span className="premio-posicion">#{index + 1}</span>
                </div>
                
                <div className="premio-contenido">
                  <div className="premio-principal">
                    <div className="premio-info">
                      <h3 className="premio-rifa">
                        {premio.tipo_rifa} - {premio.rifa_nombre}
                      </h3>
                      <div className="premio-detalles">
                        <span className="detalle-item">
                          <strong>Número ganador:</strong> {premio.numero}
                        </span>
                        <span className="detalle-item">
                          <strong>Factura:</strong> {premio.numero_factura}
                        </span>
                        <span className="detalle-item">
                          <strong>Cantidad:</strong> {premio.cantidad}
                        </span>
                        <span className="detalle-item">
                          <strong>Apostado:</strong> Q {parseFloat(premio.total).toFixed(2)}
                        </span>
                      </div>
                      <div className="premio-fechas">
                        <span>Comprado: {formatearFecha(premio.fecha_compra)}</span>
                        <span>Jugó: {formatearFecha(premio.fecha_hora_juego)}</span>
                      </div>
                    </div>
                    
                    <div className="premio-accion">
                      <div className="premio-monto">
                        <span className="monto-label">Premio</span>
                        <span className="monto-valor">Q {parseFloat(premio.saldo_premio).toFixed(2)}</span>
                      </div>
                      <button 
                        className="btn-cobrar"
                        onClick={() => cobrarPremio(premio)}
                        disabled={cobrando === `${premio.id_factura}-${premio.nivel_premio}`}
                      >
                        {cobrando === `${premio.id_factura}-${premio.nivel_premio}` ? (
                          <>
                            <span className="spinner"></span>
                            Cobrando...
                          </>
                        ) : (
                          <>
                            💰 Cobrar Premio
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MisPremios;
