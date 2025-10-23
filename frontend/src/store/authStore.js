import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (credentials) => {
    const response = await authAPI.login(credentials);
    const { user, token } = response.data.data;

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);

    set({
      user,
      token,
      isAuthenticated: true
    });

    return user;
  },

  register: async (userData) => {
    const response = await authAPI.register(userData);
    const { user, token } = response.data.data;

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);

    set({
      user,
      token,
      isAuthenticated: true
    });

    return user;
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    set({
      user: null,
      token: null,
      isAuthenticated: false
    });
  },

  updateUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  }
}));
