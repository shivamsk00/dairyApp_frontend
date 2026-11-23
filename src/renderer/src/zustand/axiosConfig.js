// axiosConfig.js
import axios from 'axios'
import { notifySessionExpired } from '../helper/sessionExpired'
import { rememberApiError } from '../helper/friendlyErrors'

const api = axios.create({
  baseURL: 'https://productionhouse.space/api/' 
  // baseURL: 'http://127.0.0.1:8000/api/' 
  
  // baseURL: 'https://test.productionhouse.store/api/' 
})


const systemIpPromise = (async () => {
  try {
    return (await window.api?.getSystemIp?.()) || null
  } catch {
    return null
  }
})()


api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  const systemIp = await systemIpPromise
  if (systemIp) config.headers['X-System-IP'] = systemIp
  return config
})


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
