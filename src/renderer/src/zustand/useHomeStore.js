import { create } from 'zustand'
import api from './axiosConfig'

// Safe JSON parse function
const useHomeStore = create((set) => ({
  loading: false,
  error: null,

  snfChartDataFetch: async (snfData) => {
    console.log('alsjdfalksjdfkla====>', snfData)
    try {
      const token = localStorage.getItem('token')
      const res = await api.post('/snf-chart/save', { data: snfData })
      console.log('response save snf data', res)
    } catch (error) {
      console.log('ERROR IN SNF CHART DATA', error)
    }
  }
}))

export default useHomeStore
