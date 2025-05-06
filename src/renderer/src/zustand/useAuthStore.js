import { create } from 'zustand'
import api from './axiosConfig'

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async ({ email, password }) => {
    set({ loading: true, error: null })
    try {
      const loginData = {
        email,
        password
      }
      // Simulated user (you can replace with API call)
      const res = await api.post('/login-admin', loginData)
      console.log('res', res.data)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.admin))

      set({ user: res.data.admin, token: res.data.token, loading: false })
      return res.data
    } catch (err) {
      set({ error: 'Invalid credentials', loading: false })
    }
  },

  logout: async () => {
    set({ loading: true, error: null })
    try {
      const res = await api.post('/logout')
      console.log('logoout response', res.data)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      set({ user: null, token: null, loading: false })
      return res.data
    } catch (error) {
      console.log('ERROR IN LOGOUT API ', error)
      set({ error: error, loading: false })
    }
  },

  changePassword: async (changePasswordData) => {
    set({ loading: true })
    try {
      const res = await api.post('/change-password', changePasswordData)

      set({ loading: false })
      return res.data
    } catch (error) {
      console.log('ERROR IN CHANGE PASSWORD', error)
    }
  }
}))

export default useAuthStore
