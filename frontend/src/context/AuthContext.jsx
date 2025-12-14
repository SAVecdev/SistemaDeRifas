import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Context para manejar la autenticación del usuario
 */
const AuthContext = createContext(null);

/**
 * Hook personalizado para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

/**
 * Proveedor del contexto de autenticación
 * Maneja login, logout, verificación de token y persistencia de sesión
 */
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [recienLogueado, setRecienLogueado] = useState(false);
  const navigate = useNavigate();

  // Verificar si hay una sesión activa al cargar la aplicación
  useEffect(() => {
    verificarSesion();
  }, []);

  /**
   * Verifica si hay un token guardado y valida la sesión con el backend
   */
  const verificarSesion = async () => {
    try {
      const token = localStorage.getItem('token');
      const usuarioGuardado = localStorage.getItem('usuario');

      if (token && usuarioGuardado) {
        // Parsear datos del usuario
        const datosUsuario = JSON.parse(usuarioGuardado);
        
        // Verificar que el usuario tenga un rol
        if (!datosUsuario.rol) {
          cerrarSesion();
          return;
        }
        
        // VALIDAR CON EL BACKEND si la sesión está activa en la BD
        // (solo si no acabamos de hacer login)
        if (!recienLogueado) {
          try {
            const response = await fetch(`/api/sesiones/validate/${encodeURIComponent(token)}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });

            if (!response.ok) {
              // Si el servidor responde con error, la sesión no es válida
              console.warn('⚠️ Sesión inválida o expirada en el backend');
              cerrarSesion();
              return;
            }

            const data = await response.json();
            
            // Verificar si la sesión es válida según la BD
            if (data.status === 'success' && data.data.isValid) {
              // Sesión válida, restaurar usuario
              setUsuario(datosUsuario);
            } else {
              // Sesión no válida en BD
              console.warn('⚠️ Sesión no encontrada o expirada en la base de datos');
              cerrarSesion();
            }
          } catch (fetchError) {
            console.error('Error al validar sesión con backend:', fetchError);
            // Si hay error de conexión, permitir acceso temporal
            setUsuario(datosUsuario);
          }
        } else {
          // Si recién se hizo login, confiar en los datos guardados
          setUsuario(datosUsuario);
        }
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      cerrarSesion();
    } finally {
      setCargando(false);
      setRecienLogueado(false); // Resetear flag
    }
  };

  /**
   * Realiza el login del usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   */
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Verificar si la respuesta está vacía
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('El servidor no está respondiendo correctamente. Verifica que el backend esté corriendo en el puerto 5000.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al iniciar sesión');
      }

      // El backend devuelve { status, message, data: { token, usuario } }
      const { token, usuario } = data.data || data;

      if (!token || !usuario) {
        console.error('❌ Login: Respuesta incompleta del servidor', { token, usuario, data });
        throw new Error('Respuesta del servidor incompleta');
      }

      // Guardar token y datos del usuario
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      
      // Marcar que recién se hizo login (para evitar validación inmediata)
      setRecienLogueado(true);
      setUsuario(usuario);

      // Verificar el rol antes de redirigir
      if (!usuario.rol) {
        throw new Error('El usuario no tiene un rol asignado');
      }

      // Redirigir según el rol del usuario
      redirigirSegunRol(usuario.rol);

      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      
      // Mensajes de error más descriptivos
      let errorMessage = error.message;
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:5000';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Error al procesar la respuesta del servidor. Verifica que el backend esté corriendo correctamente.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Cierra la sesión del usuario
   */
  const cerrarSesion = async () => {
    try {
      // Intentar cerrar sesión en el backend
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(err => {
          // Si falla el cierre en backend, solo registrar el error
          console.error('Error al cerrar sesión en backend:', err);
        });
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      
      // Limpiar estado
      setUsuario(null);
      
      // Redirigir a login
      navigate('/login');
    }
  };

  /**
   * Redirige al usuario a su dashboard según su rol
   * @param {string} rol - Rol del usuario
   */
  const redirigirSegunRol = (rol) => {
    const rutasPorRol = {
      administrador: '/admin/dashboard',
      supervisor: '/supervisor/dashboard',
      vendedor: '/vendedor/dashboard',
      usuario_registrado: '/usuario/dashboard',
      cliente: '/usuario/dashboard',
    };

    const ruta = rutasPorRol[rol] || '/usuario/dashboard';
    
    // Usar setTimeout para asegurar que la navegación ocurre después de que el estado se actualice
    setTimeout(() => {
      navigate(ruta, { replace: true });
    }, 100);
  };

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string} rolRequerido - Rol a verificar
   * @returns {boolean}
   */
  const tieneRol = (rolRequerido) => {
    return usuario?.rol === rolRequerido;
  };

  /**
   * Verifica si el usuario tiene uno de varios roles
   * @param {Array<string>} roles - Array de roles permitidos
   * @returns {boolean}
   */
  const tieneAlgunRol = (roles) => {
    return roles.includes(usuario?.rol);
  };

  /**
   * Actualiza los datos del usuario en el contexto
   * @param {Object} nuevosDatos - Nuevos datos del usuario
   */
  const actualizarUsuario = (nuevosDatos) => {
    const usuarioActualizado = { ...usuario, ...nuevosDatos };
    setUsuario(usuarioActualizado);
    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
  };

  /**
   * Refresca el saldo del usuario desde el backend
   */
  const refrescarSaldo = async () => {
    if (!usuario?.id) return;
    
    try {
      const response = await fetch(`/api/usuarios/${usuario.id}/saldo`);
      if (!response.ok) throw new Error('Error al obtener saldo');
      
      const data = await response.json();
      if (data.status === 'success' && data.data) {
        actualizarUsuario({ saldo: data.data.saldo });
      }
    } catch (error) {
      console.error('Error al refrescar saldo:', error);
    }
  };

  const value = {
    usuario,
    cargando,
    login,
    cerrarSesion,
    tieneRol,
    tieneAlgunRol,
    actualizarUsuario,
    refrescarSaldo,
    estaAutenticado: !!usuario,
  };

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
