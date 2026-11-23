// Dropdown options shared by the dispatch entry form and the dispatch edit dialog.
export const SHIFTS = [
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' }
]

export const MILK_TYPES = [
  { value: 'cow', label: 'Cow' },
  { value: 'buffalo', label: 'Buffalo' },
  { value: 'mixed', label: 'Mixed' }
]

export const emptyMilkRow = () => ({
  milk_type: '',
  qty: '',
  fat: '',
  snf: '',
  rate: '',
  amount: ''
})

export const money = (value) =>
  `₹${parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
