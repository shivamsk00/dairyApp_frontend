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
      console.log('Login response', res)

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.admin))

      set({ user: res.data.admin, token: res.data.token, loading: false })
      return res.data
    } catch (err) {
      set({ error: 'Invalid credentials', loading: false })

      return err.response.data
    }
  },
  register_sendOtp: async (adminData) => {
    set({ loading: true, error: null })
    try {
      const res = await api.post('/create-admin', adminData)
      console.log('admin created', res)

      set({ user: res.data.admin, token: res.data.token, loading: false })
      return res.data
    } catch (error) {
      set({ loading: false })
      return error.response.data
    }
  },

  register_otpVerify: async (verifyData) => {
    set({ loading: true, error: null })
    try {
      const res = await api.post('/verify-otp', verifyData)
      console.log('admin created', res)
      set({ loading: false })
      localStorage.setItem('rememberEmail',"")
      return res.data
    } catch (error) {
      set({ loading: false })
      return err.response.data
    } finally {
      set({ loading: false })
    }
  },
  sendOtpForgotPassword: async (email) => {
    console.log('email in send otp forgot pass ', email)
    set({ loading: true, error: null })
    try {
      const res = await api.post('/send-otp-forget-password', email)
      console.log('admin send otp for forgot password', res)
      set({ loading: false, error: null })
      return res.data
    } catch (error) {
      set({ loading: false })
      return err.response.data
    } finally {
      set({ loading: false })
    }
  },
  // CHAN
  changeForgotPassword: async (newPasswordData) => {
    set({ loading: true, error: null })
    try {
      const res = await api.post('/forget-password', newPasswordData)
      console.log('admin forgot pasword', res)
      set({ loading: false })
      return res.data
    } catch (error) {
      set({ loading: false })
      return err.response.data
    } finally {
      set({ loading: false })
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
  }
}))

export default useAuthStore
