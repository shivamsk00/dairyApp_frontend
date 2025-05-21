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
      console.log('response save snf data return', res)
      return res.data
    } catch (error) {
      console.log('ERROR IN SNF CHART DATA', error)
    }
  },
  // Rate Chart Api
  rateChartDataFetch: async (rateData) => {
    try {
      const res = await api.post('/milk-rates-submit', rateData)
      console.log('response save rate data', res)

      // Return saved data so component can update its state
      return res.data.data // returning saved data array
    } catch (error) {
      console.log('error in rate chart data', error)
      return null
    }
  },
  // Show data Api

  fetchRateChartData: async () => {
    try {
      const res = await api.get('/milk-rates')
      return res.data.data
    } catch (error) {
      console.log('Error fetching rate chart data:', error)
      return null
    }
  },

  // Snf Formula Save Api
  snfFormulaDataFetch: async (snfFormulaData) => {
    console.log('SNF FORMULA DATA IN FRONT SNF TABLE====>', snfFormulaData)
    try {
      const token = localStorage.getItem('token')
      const res = await api.post('/snf-formula/save', { data: snfFormulaData })
      console.log('response save snf data', res)
    } catch (error) {
      console.log('ERROR IN SNF FORMULA DATA', error)
    }
  },

  // Snf Formula Tab latest values show always Api
  getSnfFormulaData: async () => {
    try {
      const res = await api.get('/snf-formula/latest')
      console.log('snf ', res)
      return res.data.data // should return { A: ..., B: ..., C: ... }
    } catch (error) {
      console.error('Failed to fetch SNF formula', error)
      return null
    }
  },

  // Add Category
  addCategory: async (categoryData) => {
    set({ loading: true })
    try {
      const res = await api.post('/product-category-submit', categoryData)
      set({ loading: false })
      return res.data
    } catch (error) {
      console.log('Error product category add:', error)
      return null
    } finally {
      set({ loading: false })
    }
  },
  // fetchCategory
  fetchCategory: async () => {
    try {
      const res = await api.get('/all-product-category')
      return res.data
    } catch (error) {
      console.log('Error product category add:', error)
      return null
    }
  },
  // updateCategoryStatus
  updateCategoryStatus: async (categroy_id) => {
    try {
      const res = await api.post(`/update-status-category/${categroy_id}`)
      return res.data
    } catch (error) {
      console.log('Error product category status update:', error)
      return null
    }
  },
  // updateCategoryStatus
  updateCategory: async (categroy_id, categoryData) => {
    console.log('categroy_id', categroy_id)
    console.log('categoryData', categoryData)
    try {
      const res = await api.post(`/update-product-category/${categroy_id}`, categoryData)
      console.log('response in update cate', res)
      return res.data
    } catch (error) {
      console.log('Error product category update:', error)
      return null
    }
  },
  // updateCategoryStatus
  deleteCategory: async (categroy_id) => {
    try {
      const res = await api.post(`/delete-product-category/${categroy_id}`)
      return res.data
    } catch (error) {
      console.log('Error product category add:', error)
      return null
    }
  },
  // Add Customer
  addCustomer: async (customerData) => {
    try {
      const res = await api.post('/customer-submit', customerData)
      return res.data
    } catch (error) {
      console.log('Error Customer add:', error)
      return null
    }
  }
}))

export default useHomeStore
