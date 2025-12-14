import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a login si el usuario no está autenticado
 * @param {Object} props
 * @param {React.Component} props.children - Componente hijo a renderizar si está autenticado
 */
const PrivateRoute = ({ children }) => {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.5rem',
        color: '#667eea',
      }}>
        Cargando...
      </div>
    );
  }

  return estaAutenticado ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
