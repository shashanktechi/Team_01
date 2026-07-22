import axios from 'axios';

export const api = axios.create({
  // When the Vite proxy is active, relative '/api' requests are forwarded to
  // http://localhost:8082, so we fall back to the full URL only in production.
  baseURL: (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '').endsWith('/api') 
    ? (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '') 
    : (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor ───────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear stored credentials
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Notify app context so it can clear the in-memory user state
      window.dispatchEvent(new CustomEvent('auth:logout'));
      // Redirect to login only when not already there
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

