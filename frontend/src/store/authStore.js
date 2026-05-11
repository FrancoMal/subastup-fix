import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { ENDPOINTS } from '../constants/api';

const useAuthStore = create((set) => ({
  user:       null,
  token:      null,
  isLoggedIn: false,
  isLoading:  false,
  error:      null,

  init: async () => {
    const token = await AsyncStorage.getItem('token');
    const user  = await AsyncStorage.getItem('user');
    if (token && user) {
      set({ token, user: JSON.parse(user), isLoggedIn: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(ENDPOINTS.LOGIN, { email, password });
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify({ id: data.userId, name: data.name }));
      set({ token: data.token, user: { id: data.userId, name: data.name }, isLoggedIn: true, isLoading: false });
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al iniciar sesión';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(ENDPOINTS.REGISTER, userData);
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify({ id: data.userId, name: data.name }));
      set({ token: data.token, user: { id: data.userId, name: data.name }, isLoggedIn: true, isLoading: false });
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al registrarse';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    try { await api.post(ENDPOINTS.LOGOUT); } catch {}
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    set({ user: null, token: null, isLoggedIn: false });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;