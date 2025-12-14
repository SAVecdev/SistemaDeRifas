import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

/**
 * Componente Sidebar - Menú lateral de navegación
 * Muestra opciones diferentes según el rol del usuario
 * @param {Object} props
 * @param {string} props.rol - Rol del usuario (administrador, supervisor, vendedor, cliente)
 */
const Sidebar = ({ rol }) => {
  const location = useLocation();

  // Configuración de menús según rol
  const menusPorRol = {
    administrador: [
      { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/admin/rifas', icon: '🎟️', label: 'Rifas' },
    { path: '/admin/usuarios', icon: '👥', label: 'Usuarios' },
    { path: '/admin/clientes', icon: '🧑‍🤝‍🧑', label: 'Clientes' },
      { path: '/admin/sesiones', icon: '🔐', label: 'Sesiones Activas' },
      { path: '/admin/sorteos', icon: '🎲', label: 'Sorteos' },
      { path: '/admin/gestion-premios', icon: '🏆', label: 'Opciones a Ganar' },
      { path: '/admin/tipos-rifa', icon: '📋', label: 'Tipos de Rifa' },
      { path: '/admin/areas', icon: '🗺️', label: 'Áreas' },
      { path: '/admin/reportes', icon: '📈', label: 'Reportes' },
      { path: '/admin/imagenes', icon: '🖼️', label: 'Imágenes' },
      { path: '/admin/ventas-eliminadas', icon: '🗑️', label: 'Ventas Eliminadas' },
      { path: '/admin/configuracion', icon: '⚙️', label: 'Configuración' },
    ],
    supervisor: [
      { path: '/supervisor/dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/supervisor/vendedores', icon: '🏪', label: 'Vendedores' },
      { path: '/supervisor/reportes', icon: '📈', label: 'Reportes' },
      { path: '/supervisor/transacciones', icon: '💳', label: 'Transacciones' },
    ],
    vendedor: [
      { path: '/vendedor/dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/vendedor/clientes', icon: '👥', label: 'Clientes' },
      { path: '/vendedor/ventas', icon: '💰', label: 'Ventas' },
      { path: '/vendedor/facturas', icon: '🧾', label: 'Facturas' },
      { path: '/vendedor/historial', icon: '📜', label: 'Historial de Ventas' },
      { path: '/vendedor/premios-pagados', icon: '🏆', label: 'Premios Pagados' },
    ],
    cliente: [
      { path: '/cliente/dashboard', icon: '🏠', label: 'Inicio' },
      { path: '/cliente/rifas', icon: '🎰', label: 'Rifas Disponibles' },
      { path: '/usuario/comprar', icon: '🎲', label: 'Comprar Números' },
      { path: '/usuario/historial', icon: '🎫', label: 'Mis Números' },
      { path: '/usuario/premios', icon: '🏆', label: 'Mis Premios' },
      { path: '/usuario/transacciones', icon: '💳', label: 'Transacciones' },
      { path: '/usuario/perfil', icon: '👤', label: 'Mi Perfil' },
    ],
    usuario_registrado: [
      { path: '/cliente/dashboard', icon: '🏠', label: 'Inicio' },
      { path: '/cliente/rifas', icon: '🎰', label: 'Rifas Disponibles' },
      { path: '/usuario/comprar', icon: '🎲', label: 'Comprar Números' },
      { path: '/usuario/historial', icon: '🎫', label: 'Mis Números' },
      { path: '/usuario/premios', icon: '🏆', label: 'Mis Premios' },
      { path: '/usuario/transacciones', icon: '💳', label: 'Transacciones' },
      { path: '/usuario/perfil', icon: '👤', label: 'Mi Perfil' },
    ],
  };

  const menuActual = menusPorRol[rol] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Rifaparatodos</h2>
        <p className="rol-badge">{rol}</p>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {menuActual.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
