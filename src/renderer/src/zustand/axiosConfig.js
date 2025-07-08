// axiosConfig.js
import axios from 'axios'

const api = axios.create({
  // baseURL: 'https://dairy.productionhouse.store/api/' // 🟡 Yaha tumhari real API base URL daalo
  baseURL: 'https://test.productionhouse.store/api/' // 🟡 Yaha tumhari real API base URL daalo
})

// 🛡️ Token auto set karne ke liye interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
