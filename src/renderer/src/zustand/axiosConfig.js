// axiosConfig.js
import axios from 'axios'
import { notifySessionExpired } from '../helper/sessionExpired'
import { rememberApiError } from '../helper/friendlyErrors'

const api = axios.create({
  baseURL: 'https://productionhouse.space/api/' // 🟡 Yaha tumhari real API base URL daalo
  // baseURL: 'http://127.0.0.1:8000/api/' // 🟡 Yaha tumhari real API base URL daalo
  // baseURL: 'https://test.productionhouse.store/api/' // 🟡 Yaha tumhari real API base URL daalo
})

// 🛡️ Token auto set karne ke liye interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 401 on a request that carried a token = the session ended (token expired or revoked): ask the user to log in again.
// The error is still passed on, so the screen that made the request can handle its own failure.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    rememberApiError(error)
    const sentToken = Boolean(error?.config?.headers?.Authorization)
    if (error?.response?.status === 401 && sentToken) notifySessionExpired()
    return Promise.reject(error)
  }
)

export default api
