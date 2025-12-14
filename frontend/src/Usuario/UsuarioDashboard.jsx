import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UsuarioDashboard.css';

/**
 * Dashboard para usuarios registrados (clientes)
 */
const UsuarioDashboard = () => {
  const { usuario } = useAuth();
  
  // Debug log
  console.log('UsuarioDashboard - usuario:', usuario);
  
  // Prevenir errores si usuario no está cargado
  if (!usuario) {
    return (
      <div style={{ 
        padding: '40px', 
        background: '#fffbea', 
        color: '#333',
        minHeight: '100vh',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        ⏳ Cargando información del usuario...
      </div>
    );
  }
  
  const [stats, setStats] = useState({
    rifasActivas: 12,
    misParticipaciones: 5,
    saldoDisponible: Number(usuario?.saldo) || 0,
    proximoSorteo: '15 de Diciembre, 2025'
  });

  const [rifasParticipando, setRifasParticipando] = useState([
    {
      id: 1,
      titulo: 'iPhone 15 Pro Max',
      numerosComprados: 3,
      fechaSorteo: '2025-12-15',
      estado: 'activa'
    },
    {
      id: 2,
      titulo: 'PlayStation 5',
      numerosComprados: 2,
      fechaSorteo: '2025-12-20',
      estado: 'activa'
    },
    {
      id: 3,
      titulo: 'Laptop Dell XPS',
      numerosComprados: 1,
      fechaSorteo: '2025-12-10',
      estado: 'finalizada'
    }
  ]);

  const [transaccionesRecientes, setTransaccionesRecientes] = useState([
    {
      id: 1,
      tipo: 'compra',
      descripcion: 'Compra de 3 números - iPhone 15',
      monto: -15,
      fecha: '2025-12-01'
    },
    {
      id: 2,
      tipo: 'recarga',
      descripcion: 'Recarga de saldo',
      monto: 50,
      fecha: '2025-11-28'
    },
    {
      id: 3,
      tipo: 'compra',
      descripcion: 'Compra de 2 números - PlayStation 5',
      monto: -6,
      fecha: '2025-11-25'
    }
  ]);

  return (
    <div className="usuario-dashboard" style={{ 
      padding: '20px', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      {/* Header de bienvenida */}
      <div className="dashboard-header">
        <div>
          <h1 style={{ color: 'white', fontSize: '2rem' }}>
            ¡Bienvenido, {usuario?.nombre || 'Usuario'}! 👋
          </h1>
          <p className="dashboard-subtitle">Aquí puedes ver tus rifas y gestionar tu cuenta</p>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🎰</div>
          <div className="stat-content">
            <h3>Rifas Activas</h3>
            <p className="stat-number">{stats.rifasActivas}</p>
            <span className="stat-label">Disponibles ahora</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <h3>Mis Participaciones</h3>
            <p className="stat-number">{stats.misParticipaciones}</p>
            <span className="stat-label">Rifas en las que participo</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Saldo Disponible</h3>
            <p className="stat-number">${stats.saldoDisponible}</p>
            <span className="stat-label">Para comprar números</span>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Próximo Sorteo</h3>
            <p className="stat-text">{stats.proximoSorteo}</p>
            <span className="stat-label">iPhone 15 Pro Max</span>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="quick-actions">
        <h2>⚡ Acciones Rápidas</h2>
        <div className="actions-grid">
          <Link to="/usuario/rifas" className="action-card">
            <span className="action-icon">🎯</span>
            <h3>Ver Rifas</h3>
            <p>Explora todas las rifas disponibles</p>
          </Link>

          <Link to="/usuario/historial" className="action-card">
            <span className="action-icon">📜</span>
            <h3>Mi Historial</h3>
            <p>Revisa tus participaciones</p>
          </Link>

          <Link to="/usuario/transacciones" className="action-card">
            <span className="action-icon">💳</span>
            <h3>Transacciones</h3>
            <p>Consulta tus movimientos</p>
          </Link>

          <Link to="/usuario/perfil" className="action-card">
            <span className="action-icon">⚙️</span>
            <h3>Mi Perfil</h3>
            <p>Actualiza tus datos</p>
          </Link>
        </div>
      </div>

      {/* Rifas en las que estoy participando */}
      <div className="section">
        <div className="section-header">
          <h2>🎫 Mis Rifas Activas</h2>
          <Link to="/usuario/historial" className="btn btn-secondary btn-sm">Ver Todas</Link>
        </div>

        {rifasParticipando.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎰</span>
            <h3>No estás participando en ninguna rifa</h3>
            <p>Explora las rifas disponibles y compra tus números</p>
            <Link to="/usuario/rifas" className="btn btn-primary">Ver Rifas Disponibles</Link>
          </div>
        ) : (
          <div className="rifas-list">
            {rifasParticipando.map(rifa => (
              <div key={rifa.id} className={`rifa-item ${rifa.estado}`}>
                <div className="rifa-info">
                  <h3>{rifa.titulo}</h3>
                  <div className="rifa-details">
                    <span className="badge">
                      {rifa.numerosComprados} {rifa.numerosComprados === 1 ? 'número' : 'números'}
                    </span>
                    <span className="rifa-date">
                      📅 {new Date(rifa.fechaSorteo).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
                <div className="rifa-actions">
                  <Link to={`/rifa/${rifa.id}`} className="btn btn-outline btn-sm">
                    Ver Detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transacciones recientes */}
      <div className="section">
        <div className="section-header">
          <h2>💳 Transacciones Recientes</h2>
          <Link to="/usuario/transacciones" className="btn btn-secondary btn-sm">Ver Todas</Link>
        </div>

        <div className="transacciones-list">
          {transaccionesRecientes.map(transaccion => (
            <div key={transaccion.id} className="transaccion-item">
              <div className="transaccion-icon">
                {transaccion.tipo === 'compra' ? '🛒' : '💰'}
              </div>
              <div className="transaccion-info">
                <h4>{transaccion.descripcion}</h4>
                <span className="transaccion-fecha">
                  {new Date(transaccion.fecha).toLocaleDateString('es-ES')}
                </span>
              </div>
              <div className={`transaccion-monto ${transaccion.monto > 0 ? 'positivo' : 'negativo'}`}>
                {transaccion.monto > 0 ? '+' : ''}{transaccion.monto} USD
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsuarioDashboard;
