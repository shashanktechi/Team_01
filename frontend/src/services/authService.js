import { api } from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('userId', response.data.userId);
      if (response.data.storeId) {
        localStorage.setItem('storeId', response.data.storeId);
      }
    }
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('userId', response.data.userId);
      if (response.data.storeId) {
        localStorage.setItem('storeId', response.data.storeId);
      }
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const role = localStorage.getItem('role');
    let endpoint = '/customer/profile'; // default for customers
    if (role === 'STORE_ADMIN') {
      endpoint = '/store/profile';
    } else if (role === 'DELIVERY_PARTNER') {
      endpoint = '/delivery/profile';
    } else if (role === 'SYSTEM_ADMIN') {
      // Admins might not have a dedicated profile endpoint in this design, fallback to a mocked profile or skip
      return { role: 'SYSTEM_ADMIN' };
    }
    const response = await api.get(endpoint);
    return response.data;
  }
};
