import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

/**
 * Componente Header - Barra superior de navegación
 * Muestra información del usuario y opciones de perfil/cierre de sesión
 * @param {Object} props
 * @param {Object} props.usuario - Datos del usuario actual
 * @param {Function} props.onLogout - Función para cerrar sesión
 */
const Header = ({ usuario, onLogout }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const handlePerfil = () => {
    const rutasPorRol = {
      administrador: '/admin/perfil',
      supervisor: '/supervisor/perfil',
      vendedor: '/vendedor/perfil',
      cliente: '/usuario/perfil',
    };
    navigate(rutasPorRol[usuario?.rol] || '/perfil');
    setMenuAbierto(false);
  };

  const handleLogout = () => {
    setMenuAbierto(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" aria-label="Toggle menu">
          ☰
        </button>
        <h1 className="header-title">Sistema de Rifas</h1>
      </div>

      <div className="header-right">
        <div className="user-info">
          <span className="user-name">{usuario?.nombre || 'Usuario'}</span>
          <span className="user-email">{usuario?.email || ''}</span>
        </div>

        <div className="user-menu">
          <button className="user-avatar" onClick={toggleMenu}>
            <span className="avatar-icon">👤</span>
          </button>

          {menuAbierto && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={handlePerfil}>
                <span className="dropdown-icon">👤</span>
                Mi Perfil
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <span className="dropdown-icon">🚪</span>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para cerrar menú al hacer clic fuera */}
      {menuAbierto && (
        <div className="menu-overlay" onClick={() => setMenuAbierto(false)}></div>
      )}
    </header>
  );
};

export default Header;
