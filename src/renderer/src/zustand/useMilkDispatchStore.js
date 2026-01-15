import { create } from 'zustand'
import api from './axiosConfig'

// Safe JSON parse function
// Head Dairy Milk dispatch api for submit data
const useDailyMilkDispatchStore = create((set) => ({
  submitMilkDispatch: async (milkDispatchData) => {
    console.log("milkDispatchData", milkDispatchData)
    try {
      const res = await api.post('/milk-dispatch-submit', milkDispatchData)
      return res.data
    } catch (error) {
      console.error('ERROR IN  MILKDISPATCH SUBMIT API', error)
    }
  },
  // Head Dairy Milk dispatch api for All data ///////////////////////////
  getHeadDairyMilkData: async (page) => {
    try {
      const res = await api.get( `/all-milk-dispatch?page=${page}`)
      return res.data
    } catch (error) {
      console.error('ERROR IN HEAD DAIRY MILK SALE GET ALL DATA API', error)
    }
  },

  // Head Dairy Milk dispatch Delete Data Api///////////////////////////
    deleteHeadDairyMilkDispatch: async (id) => {
    try {
      const res = await api.post(`delete-milk-dispatch/${id}`)
      return res.data
    } catch (error) {
      return err.response.data
    }
  },
  // Head Dairy Edit Api///////////////////////////////////////////////////
    getHeadDairyMilkDispatchDataEdit: async (headDairyMilkDispatchId) => {
    try {
      const res = await api.get(`/edit-milk-dispatch/${headDairyMilkDispatchId}`)
      return res.data
    } catch (error) {
      console.error('ERROR IN Head Dairy Milk Dispatch EDIT DATA API', error)
    }
  },
  // updateDailyMilkData: async (dailyMIlkSaleId, dailyMilkSaleData) => {
  //   try {
  //     const res = await api.post(`/update-daily-milk-sale/${dailyMIlkSaleId}`, dailyMilkSaleData)
  //     return res.data
  //   } catch (error) {
  //     console.error('ERROR IN DAILY MILK SALE UPDATE DATA API', error)
  //   }
  // },


  // getDailyMilkSaleData: async () => {
  //   try {
  //     const res = await api.get('/all-daily-milk-sale')
  //     return res.data
  //   } catch (error) {
  //     console.error('ERROR IN DAILY MILK SALE GET ALL DATA API', error)
  //   }
  // },


}))

export default useDailyMilkDispatchStore
