import { create } from 'zustand'
import api from './axiosConfig'

// Safe JSON parse function
const safeParse = (value) => {
  try {
    return value ? JSON.parse(value) : null
  } catch (e) {
    console.error('Invalid JSON in localStorage:', value)
    return null
  }
}

const useAuthStore = create((set) => ({
  user: safeParse(localStorage.getItem('user')) || {},
  token: localStorage.getItem('token') || '',
  loading: false,
  error: null,

  login: async ({ email, password }) => {
    set({ loading: true, error: null })
    try {
      const loginData = { email, password }
      const res = await api.post('/login-admin', loginData)
      console.log('jjkjhgfjf', res)

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.admin))

      set({ user: res.data.admin, token: res.data.token, loading: false })
      return res.data
    } catch (err) {
      set({ error: 'Invalid credentials', loading: false })

      return err.response.data
    }
  },

  logout: async () => {
    set({ loading: true, error: null })
    try {
      const res = await api.post('/logout')

      localStorage.removeItem('user')
      localStorage.removeItem('token')
      set({ user: null, token: null, loading: false })
      return res.data
    } catch (error) {
      console.error('ERROR IN LOGOUT API', error)
      set({ error, loading: false })
    }
  },

  changePassword: async (changePasswordData) => {
    set({ loading: true })
    try {
      const res = await api.post('/change-password', changePasswordData)
      set({ loading: false })
      return res.data
    } catch (error) {
      console.error('ERROR IN CHANGE PASSWORD', error)
      set({ loading: false, error: 'Password change failed' })
    }
  }
}))

export default useAuthStore
