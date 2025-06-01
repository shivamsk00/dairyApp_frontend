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
      return res.data
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

  // ===============CUSTOMER CRUD API ==========================

  addCustomer: async (customerData) => {
    try {
      const res = await api.post('/customer-submit', customerData)
      return res.data
    } catch (error) {
      return err.response.data
    }
  },
  getAllCustomer: async () => {
    try {
      const res = await api.get('/all-customer')
      return res.data
    } catch (error) {
      return err.response.data
    }
  },
  updateCustomer: async (customer_id, customerData) => {
    try {
      const res = await api.post(`/update-customer/${customer_id}`, customerData)
      return res.data
    } catch (error) {
      return err.response.data
    }
  },
  deleteCustomer: async (customer_id) => {
    try {
      const res = await api.post(`delete-customer/${customer_id}`)
      return res.data
    } catch (error) {
      return err.response.data
    }
  },

  // ================MILK COLLECTION API =======================
  fetchCustomerDetailsByAccount: async (account_number) => {
    try {
      const res = await api.get(
        `/fetch-cumstomer-detail-by-account-number?account_number=${account_number}`
      )
      return res.data
    } catch (error) {
      return err.response.data
    }
  },
  getMilkRate: async (fat, clr, snf) => {
    try {
      const res = await api.get(`/milk-rate-fetch-by-fat-snf-clr`, {
        params: {
          fat: fat,
          clr: clr || '',
          snf: snf || ''
        }
      })
      return res.data
    } catch (error) {
      return error.response.data
    }
  },
  submitMilkCollection: async (milkCollectionData) => {
    console.log('milkCollectionData', milkCollectionData)
    try {
      const res = await api.post('/milk-collection-submit', milkCollectionData)
      return res.data
    } catch (error) {
      return error.response.data
    }
  },
  getMilkCollectionRecord: async (milkCollectionData) => {
    console.log('milkCollectionData', milkCollectionData)
    try {
      const res = await api.get('/all-milk-collection', milkCollectionData)
      return res.data
    } catch (error) {
      return error.response.data
    }
  },
  getMilkCollectionRecord: async (milkCollectionData) => {
    console.log('milkCollectionData', milkCollectionData)
    try {
      const res = await api.get('/all-milk-collection', milkCollectionData)
      return res.data
    } catch (error) {
      return error.response.data
    }
  },
  editMilkCollectionDetail: async (milk_collection_id, milkCollectionData) => {
    try {
      // set({loading:true})
      const res = await api.post(
        `/update-milk-collection/${milk_collection_id}`,
        milkCollectionData
      )
      // set({loading:false})
      return res.data
    } catch (error) {
      return error.response.data
    }
  },
  deleteMilkCollection: async (milk_collection_id) => {
    try {
      // set({loading:true})
      const res = await api.post(`/delete-milk-collection/${milk_collection_id}`)
      // set({loading:false})
      return res.data
    } catch (error) {
      return error.response.data
    }
  },

  // ADD PRODUCT API
  addProduct: async (productData) => {
    try {
      // set({loading:true})
      const res = await api.post(`/product-submit`, productData)
      // set({loading:false})
      return res.data
    } catch (error) {
      return error.response.data
    }
  },
  // FETCH ALL PRODUCT API
  allProductGet: async () => {
    try {
      // set({loading:true})
      const res = await api.get(`/all-product`)
      // set({loading:false})
      return res.data
    } catch (error) {
      return error.response.data
    }
  },

  // UPDATE PRODUCT STATUS API
  updateProductStatus: async (product_id) => {
    try {
      // set({loading:true})
      const res = await api.post(`/update-status-product/${product_id}`)
      // set({loading:false})
      return res.data
    } catch (error) {
      return error.response.data
    }
  },
  // FETCH EDIT PRODUCT API
  editProductDetailsFetch: async (product_id) => {
    try {
      // set({loading:true})
      const res = await api.get(`/edit-product/${product_id}`)
      // set({loading:false})
      return res.data
    } catch (error) {
      return error.response.data
    }
  },
  // UPDATE PRODUCT STATUS API
  updateProduct: async (product_id, productData) => {
    try {
      // set({loading:true})
      const res = await api.post(`/update-product/${product_id}`, productData)
      // set({loading:false})
      return res.data
    } catch (error) {
      return error.response.data
    }
  },
  // DELETE PRODUCT API
  deleteProduct: async (product_id) => {
    try {
      // set({loading:true})
      const res = await api.post(`/delete-product/${product_id}`)
      // set({loading:false})
      return res.data
    } catch (error) {
      return error.response.data
    }
  },

  // ========================== STOCK API =============================== //

  // add Product stock api
  addProductStock: async (stockData) => {
    try {
      // set({loading:true})
      const res = await api.post(`/product-stock-submit`, stockData)
      // set({loading:false})
      return res.data
    } catch (error) {
      return error.response.data
    }
  },

  // get all Product stock api
  getAllProductStock: async () => {
    try {
      // set({loading:true})
      const res = await api.get(`/all-product-stock`)
      // set({loading:false})
      return res.data
    } catch (error) {
      return error.response.data
    }
  },
  // get all Product stock for Edit api
  getEditProductStockData: async (productStock_id) => {
    try {
      // set({loading:true})
      const res = await api.get(`/edit-product-stock/${productStock_id}`)
      // set({loading:false})
      return res.data
    } catch (error) {
      return error.response.data
    }
  },

  // Update Product stock for Edit api
  updateProductStock: async (productStock_id, productStockData) => {
    try {
      // set({loading:true})
      const res = await api.post(`/update-product-stock/${productStock_id}`, productStockData)
      // set({loading:false})
      return res.data
    } catch (error) {
      return error.response.data
    }
  },
  // Delete Product stock for Edit api
  deleteProductStock: async (productStock_id, productStockData) => {
    try {
      // set({loading:true})
      const res = await api.post(`/delete-product-stock/${productStock_id}`, productStockData)
      // set({loading:false})
      return res.data
    } catch (error) {
      return error.response.data
    }
  }
}))

export default useHomeStore
