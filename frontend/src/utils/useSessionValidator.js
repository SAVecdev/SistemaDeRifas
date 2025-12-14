import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook para verificar periódicamente si la sesión sigue activa en la BD
 * Se ejecuta cada 2 minutos mientras el usuario está en la aplicación
 */
const useSessionValidator = () => {
  const { usuario, cerrarSesion } = useAuth();

  useEffect(() => {
    // Solo ejecutar si hay un usuario autenticado
    if (!usuario) return;

    const validarSesion = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        cerrarSesion();
        return;
      }

      try {
        const response = await fetch(
          `/api/sesiones/validate/${encodeURIComponent(token)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          console.warn('⚠️ Sesión inválida detectada');
          alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          cerrarSesion();
          return;
        }

        const data = await response.json();

        if (data.status === 'success' && !data.data.isValid) {
          console.warn('⚠️ Sesión expirada en la base de datos');
          alert('Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.');
          cerrarSesion();
        }
      } catch (error) {
        console.error('Error al validar sesión:', error);
        // No cerrar sesión en caso de error de red
      }
    };

    // Validar inmediatamente al montar
    validarSesion();

    // Validar cada 2 minutos (120000 ms)
    const interval = setInterval(validarSesion, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [usuario, cerrarSesion]);
};

export default useSessionValidator;
