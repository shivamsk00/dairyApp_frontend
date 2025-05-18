import { create } from 'zustand'
import api from './axiosConfig'

// Safe JSON parse function
const useHomeStore = create((set) => ({
  loading: false,
  error: null,

  // Snf Chart Api
  snfChartDataFetch: async (snfData) => {
    console.log('SNF DATA IN FRONT SNF TABLE====>', snfData)
    try {
      const token = localStorage.getItem('token')
      const res = await api.post('/snf-chart/save', { data: snfData })
      console.log('response save snf data', res)
    } catch (error) {
      console.log('ERROR IN SNF CHART DATA', error)
    }
  },
  // Rate Chart Api
  rateChartDataFetch: async (rateData) => {
    try {
      const res = await api.post('/milk-rates-submit', rateData);
      console.log('response save rate data', res);

      // Return saved data so component can update its state
      return res.data.data; // returning saved data array
    } catch (error) {
      console.log('error in rate chart data', error);
      return null;
    }
  },
  // Show data Api 

fetchRateChartData: async () => {
  try {
    const res = await api.get('/milk-rates');
    return res.data.data;
  } catch (error) {
    console.log('Error fetching rate chart data:', error);
    return null;
  }
},

}))

export default useHomeStore
