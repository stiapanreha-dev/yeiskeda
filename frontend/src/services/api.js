import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
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

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Stores API
export const storesAPI = {
  getAll: (params) => api.get('/stores', { params }),
  getById: (id) => api.get(`/stores/${id}`),
  getMy: (storeId) => api.get('/stores/my/store', {
    params: storeId ? { storeId } : {}
  }),
  create: (data, storeId) => api.post('/stores', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: storeId ? { storeId } : {}
  }),
  update: (data, storeId) => api.put('/stores', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: storeId ? { storeId } : {}
  }),
  delete: (storeId) => api.delete('/stores', {
    params: storeId ? { storeId } : {}
  })
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data, storeId) => api.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: storeId ? { storeId } : {}
  }),
  update: (id, data, storeId) => api.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: storeId ? { storeId } : {}
  }),
  markAsPickedUp: (id, storeId) => api.patch(`/products/${id}/picked-up`, {}, {
    params: storeId ? { storeId } : {}
  }),
  delete: (id, storeId) => api.delete(`/products/${id}`, {
    params: storeId ? { storeId } : {}
  })
};

// Admin API
export const adminAPI = {
  getStatistics: () => api.get('/admin/statistics'),
  getAllStores: () => api.get('/admin/stores'),
  updateStore: (id, data) => api.put(`/admin/stores/${id}`, data),
  deleteStore: (id) => api.delete(`/admin/stores/${id}`),
  getAllCustomers: () => api.get('/admin/customers'),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`)
};

export default api;
