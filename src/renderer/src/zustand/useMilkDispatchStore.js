import { create } from 'zustand'
import api from './axiosConfig'

// Safe JSON parse function
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
  getDailyMilkSaleData: async () => {
    try {
      const res = await api.get('/all-daily-milk-sale')
      return res.data
    } catch (error) {
      console.error('ERROR IN DAILY MILK SALE GET ALL DATA API', error)
    }
  },
  getDailyMilkSaleDataForEdit: async (dailyMIlkSaleId) => {
    try {
      const res = await api.get(`/edit-daily-milk-sale/${dailyMIlkSaleId}`)
      return res.data
    } catch (error) {
      console.error('ERROR IN DAILY MILK SALE EDIT DATA API', error)
    }
  },
  updateDailyMilkData: async (dailyMIlkSaleId, dailyMilkSaleData) => {
    try {
      const res = await api.post(`/update-daily-milk-sale/${dailyMIlkSaleId}`, dailyMilkSaleData)
      return res.data
    } catch (error) {
      console.error('ERROR IN DAILY MILK SALE UPDATE DATA API', error)
    }
  },
  deleteDailyMilkSaleRecordByID: async (dailyMIlkSaleId) => {
    try {
      const res = await api.post(`/delete-daily-milk-sale/${dailyMIlkSaleId}`)
      return res.data
    } catch (error) {
      console.error('ERROR IN DAILY MILK SALE UPDATE DATA API', error)
    }
  }
}))

export default useDailyMilkDispatchStore
