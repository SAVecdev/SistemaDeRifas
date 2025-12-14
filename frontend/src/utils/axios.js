import axios from 'axios';

/**
 * Instancia de axios configurada para usar el proxy de Vite
 * El proxy está configurado en vite.config.js para redirigir /api a http://localhost:5000
 */
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar sesión expirada
    if (error.response?.status === 401) {
      const errorData = error.response?.data;
      
      // Si es una sesión expirada, mostrar mensaje específico
      if (errorData?.code === 'SESSION_EXPIRED') {
        alert('⏰ Tu sesión ha expirado por inactividad (3 horas). Por favor, inicia sesión nuevamente.');
      }
      
      // Limpiar datos y redirigir
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
