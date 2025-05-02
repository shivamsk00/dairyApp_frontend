import { create } from 'zustand'
import api from './axiosConfig'  // 👈 yeh updated hai

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/login', { email, password }); // 👈 axios ki jagah api
      const { token, user } = res.data;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      set({ user, token, loading: false });
    } catch (err) {
      set({ error: 'Invalid credentials', loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));

export default useAuthStore;
