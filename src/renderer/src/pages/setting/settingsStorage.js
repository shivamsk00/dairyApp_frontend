// Business, rate, print and notification settings are kept on this computer (localStorage).
const KEY = 'dairySettings'

export const DEFAULT_SETTINGS = {
  dairyName: '',
  address: '',
  rateBasis: 'fat_snf',
  cowRate: '',
  buffaloRate: '',
  rateFormula: '',
  autoPrint: false,
  printHeader: false,
  printFatSnfClr: false,
  smsApiKey: '',
  senderId: '',
  dailySummarySms: false
}

export const loadSettings = () => {
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(localStorage.getItem(KEY) || 'null') || {}) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export const saveSettings = (settings) => {
  localStorage.setItem(KEY, JSON.stringify(settings))
}
