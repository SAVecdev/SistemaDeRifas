import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas según el rol del usuario
 * Redirige si el usuario no tiene el rol adecuado
 * @param {Object} props
 * @param {React.Component} props.children - Componente hijo a renderizar
 * @param {Array<string>} props.rolesPermitidos - Array de roles que pueden acceder
 */
const RoleGuard = ({ children, rolesPermitidos }) => {
  const { usuario, tieneAlgunRol } = useAuth();

  // Si el usuario no tiene uno de los roles permitidos, redirigir
  if (!tieneAlgunRol(rolesPermitidos)) {
    // Redirigir a la página correspondiente según su rol actual
    const rutasPorRol = {
      administrador: '/admin/dashboard',
      supervisor: '/supervisor/dashboard',
      vendedor: '/vendedor/dashboard',
      usuario_registrado: '/usuario/dashboard',
      cliente: '/usuario/dashboard',
    };

    const rutaRedireccion = rutasPorRol[usuario?.rol] || '/';
    return <Navigate to={rutaRedireccion} replace />;
  }

  return children;
};

export default RoleGuard;
