import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useSessionValidator from '../utils/useSessionValidator';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

/**
 * Componente Layout - Estructura principal de la aplicación
 * Contiene el sidebar, header y el área de contenido principal
 * Obtiene el usuario y función de logout del AuthContext
 * Valida la sesión periódicamente contra la BD
 */
const Layout = () => {
  const { usuario, cerrarSesion } = useAuth();
  
  // Validar sesión cada 2 minutos
  useSessionValidator();

  return (
    <div className="layout">
      <Sidebar rol={usuario?.rol || 'cliente'} />
      <div className="layout-main">
        <Header usuario={usuario} onLogout={cerrarSesion} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
