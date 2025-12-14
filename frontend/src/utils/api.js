/**
 * Configuración centralizada de la API
 * Usa el proxy de Vite configurado en vite.config.js
 */

const API_BASE_URL = '/api';

/**
 * Realiza una petición fetch con configuración predeterminada
 * @param {string} endpoint - Endpoint de la API (sin /api)
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<Response>}
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, config);

  return response;
};

/**
 * GET request
 */
export const apiGet = async (endpoint) => {
  const response = await apiFetch(endpoint, { method: 'GET' });
  return response.json();
};

/**
 * POST request
 */
export const apiPost = async (endpoint, data) => {
  const response = await apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
};

/**
 * PUT request
 */
export const apiPut = async (endpoint, data) => {
  const response = await apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
};

/**
 * DELETE request
 */
export const apiDelete = async (endpoint) => {
  const response = await apiFetch(endpoint, {
    method: 'DELETE',
  });
  return response.json();
};

/**
 * PATCH request
 */
export const apiPatch = async (endpoint, data) => {
  const response = await apiFetch(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
};

export default {
  fetch: apiFetch,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  patch: apiPatch,
};
