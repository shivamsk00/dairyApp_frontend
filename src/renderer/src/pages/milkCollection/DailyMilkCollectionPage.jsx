/* eslint-disable react/prop-types -- SummaryTile is internal to this page */
import { useState, useEffect, useRef, useCallback } from 'react'
import { Droplets, Milk, Printer, RotateCcw, Send, Sun, Moon, Sigma, Wallet } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import EditMilkCollectionModal from './EditMilkCollectionPage'
import MilkCollectionTable from './MilkCollectionTable'
import {
  saveCustomersToDB,
  getCustomerFromDB,
  getAllCustomersFromDB,
  hasCustomersInDB
} from '../../helper/db'
import DateFormate from '../../helper/DateFormate'
import {
  Badge,
  Button,
  DeleteConfirmModal,
  DetailList,
  IconBadge,
  Input,
  Modal,
  SectionCard,
  SegmentedControl,
  Switch,
  useDocumentTitle,
  WindowHeader,
  todayISO
} from '../../components/ui'

const MILK_TYPES = [
  { value: 'cow', label: 'Cow' },
  { value: 'buffalo', label: 'Buffalo' },
  { value: 'other', label: 'Other' }
]
const SHIFT_OPTIONS = [
  { value: 'morning', label: 'Morning', icon: Sun },
  { value: 'evening', label: 'Evening', icon: Moon }
]

const SummaryTile = ({ icon, tone, label, milk, amount }) => (
  <div className="ui-border-subtle flex items-center gap-3 rounded-lg border p-3">
    <IconBadge icon={icon} tone={tone} />
    <div className="min-w-0 flex-1">
      <p className="ui-text-tertiary text-[11px] font-semibold uppercase tracking-wide">{label}</p>
      <p className="ui-font-display text-[15px] font-extrabold">{milk.toFixed(2)} L</p>
    </div>
    <p className="text-[14px] font-bold text-[color:var(--ui-success-600)]">₹{amount.toFixed(2)}</p>
  </div>
)

const DairyMilkCollectionPage = () => {
  useDocumentTitle('Daily Milk Collection')
  // Local calendar day (toISOString() is UTC and gave yesterday's date before 05:30 IST)
  const today = todayISO()

  const fetchCustomerDetailsByAccount = useHomeStore((state) => state.fetchCustomerDetailsByAccount)

  const getAllCustomer = useHomeStore((state) => state.getAllCustomer)
  const submitMilkCollection = useHomeStore((state) => state.submitMilkCollection)
  const getMilkCorrectionData = useHomeStore((state) => state.getMilkCorrectionData)
  const deleteMilkCollection = useHomeStore((state) => state.deleteMilkCollection)
  const getMilkRate = useHomeStore((state) => state.getMilkRate)

  // State variables
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [milkType, setMilkType] = useState('cow')
  const [shiftValue, setShiftValue] = useState('morning')
  const [isShift, setIsShift] = useState('morning')
  const [isEditeModal, setIsEditeModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetchingRate, setIsFetchingRate] = useState(false)
  const [isFetchingCustomer, setIsFetchingCustomer] = useState(false)
  const [, setCollections] = useState([])
  const [toggle, setToggle] = useState(true)
  const [milkCollectiionAvergeData, setMilkCollectionAvergeData] = useState({
    avg_base_rate: '',
    avg_fat: 0,
    avg_snf: 0,
    milk_total: 0,
    other_price_total: 0,
    total_amount: 0,
    morning_avg_base_rate: '',
    morning_avg_fat: 0,
    morning_avg_snf: 0,
    morning_total_amount: 0,
    morning_total_milk: 0,
    evening_avg_base_rate: '',
    evening_avg_fat: 0,
    evening_avg_snf: 0,
    evening_total_amount: 0,
    evening_total_milk: 0
  })

  const [dayTotal, setDayTotal] = useState({
    morning_total_amount: 0,
    morning_total_milk: 0,
    evening_total_amount: 0,
    evening_total_milk: 0,
    total_amount: 0,
    milk_total: 0
  })
  const [morningCollection, setMorningCollection] = useState([])
  const [eveningCollection, setEveningCollection] = useState([])
  const [customerWallet, setCustomerWallet] = useState(null)
  const [errors, setErrors] = useState({})

  function checkTimeOfDay() {
    const now = new Date()
    const hour = now.getHours()

    if (hour < 12) {
      setShiftValue('morning')
      setIsShift('morning')
    } else {
      setShiftValue('evening')
      setIsShift('evening')
    }
  }

  const [form, setForm] = useState({
    customer_account_number: '',
    name: '',
    careof: '',
    mobile: '',
    quantity: '',
    clr: '',
    fat: '',
    snf: '',
    base_rate: '',
    other_price: '0',
    rate: '',
    total_amount: '',
    milk_type: '',
    shift: '',
    date: today,
    print: false
  })

  const lastFetchedAccRef = useRef(null)
  const lastRateParamsRef = useRef({ fat: '', clr: '', snf: '' })

  // FETCH PER CUSTOMER
  const fetchCustomerDetailByAccountNumber = async (accountNo) => {
    if (!accountNo || isFetchingCustomer) return

    // Skip if this account was just fetched and name is already set
    if (lastFetchedAccRef.current === accountNo && form.name) return

    setIsFetchingCustomer(true)
    try {
      // 1. Try Local DB
      let localData = await getCustomerFromDB(accountNo)

      if (localData) {
        setForm((prev) => ({
          ...prev,
          name: localData.name || '',
          careof: localData.careof || '',
          mobile: localData.mobile || ''
        }))
        setCustomerWallet(localData.wallet)
        CustomToast.success('Customer Found')
        lastFetchedAccRef.current = accountNo
        setIsFetchingCustomer(false)
        return
      }

      // 2. DB returned null - check if DB is empty
      const hasCustomers = await hasCustomersInDB()
      if (!hasCustomers) {
        const res = await getAllCustomer('')

        if (res && (res.data || res)) {
          let customerData = res.data || res
          if (!Array.isArray(customerData)) {
            if (res.customers) customerData = res.customers
            else if (res.result) customerData = res.result
            else if (typeof res === 'object')
              customerData = Object.values(res).find((v) => Array.isArray(v))
          }

          if (Array.isArray(customerData) && customerData.length > 0) {
            await saveCustomersToDB(customerData)

            // Try DB lookup again
            localData = await getCustomerFromDB(accountNo)
            if (localData) {
              setForm((prev) => ({
                ...prev,
                name: localData.name || '',
                careof: localData.careof || '',
                mobile: localData.mobile || ''
              }))
              setCustomerWallet(localData.wallet)
              CustomToast.success('Customer Found (from refreshed DB)')
              lastFetchedAccRef.current = accountNo
              setIsFetchingCustomer(false)
              return
            }
          }
        }
      }

      // 3. Fallback to direct API lookup

      const res = await fetchCustomerDetailsByAccount(accountNo)

      if (res.status_code == 200) {
        CustomToast.success(res.message)
        setForm((prev) => ({
          ...prev,
          name: res.data.name || '',
          careof: res.data.careof || '',
          mobile: res.data.mobile || ''
        }))
        setCustomerWallet(res.data.wallet)
        lastFetchedAccRef.current = accountNo
      } else {
        CustomToast.error(res.message)
        setForm((prev) => ({
          ...prev,
          name: '',
          careof: '',
          mobile: ''
        }))
        lastFetchedAccRef.current = null
      }
    } catch (error) {
      console.error('Error fetching customer details:', error)
      setForm((prev) => ({
        ...prev,
        name: '',
        careof: '',
        mobile: ''
      }))
      lastFetchedAccRef.current = null
    } finally {
      setIsFetchingCustomer(false)
    }
  }

  // Helper for calculations
  const calculateTotals = (data) => {
    const b = parseFloat(data.base_rate) || 0
    const o = parseFloat(data.other_price) || 0
    const q = parseFloat(data.quantity) || 0
    const rate = q * b
    const total_amount = rate + o
    return {
      rate: rate.toFixed(2),
      total_amount: total_amount.toFixed(2)
    }
  }

  // Auto-calculate rate and total amount
  useEffect(() => {
    const totals = calculateTotals(form)
    if (totals.rate !== form.rate || totals.total_amount !== form.total_amount) {
      setForm((prev) => ({
        ...prev,
        ...totals
      }))
    }
  }, [form.base_rate, form.other_price, form.quantity])

  // The total error describes a missing rate; drop it as soon as a rate produces a valid total.
  useEffect(() => {
    if (parseFloat(form.total_amount) > 0) {
      setErrors((prev) => (prev.total_amount ? { ...prev, total_amount: undefined } : prev))
    }
  }, [form.total_amount])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))

    // Only clear name when account number changes - NOT other fields
    if (name === 'customer_account_number') {
      setForm((prev) => ({
        ...prev,
        [name]: value,
        name: '' // Only clear name field
      }))
      return
    }

    setForm((prev) => {
      let updated = { ...prev, [name]: type === 'checkbox' ? checked : value }

      if (name === 'clr') {
        updated.snf = ''
      } else if (name === 'snf') {
        updated.clr = ''
      }

      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isSubmitting) return
    if (isFetchingRate) {
      CustomToast.warn('Fetching rate, please wait...')
      return
    }

    // Final check for empty or invalid data (shown inline under the field, focus goes to the first one)
    const found = {}
    if (!form.customer_account_number || !form.name)
      found.customer_account_number = 'Enter a valid account number'
    if (!form.quantity || parseFloat(form.quantity) <= 0) found.quantity = 'Enter quantity'
    if (!form.total_amount || parseFloat(form.total_amount) <= 0)
      found.total_amount = 'Total must be greater than 0 — enter FAT and SNF to get a rate'
    setErrors(found)
    if (found.customer_account_number) {
      accRef.current?.focus()
      return
    }
    if (found.quantity) {
      qtyRef.current?.focus()
      return
    }
    if (found.total_amount) {
      fatRef.current?.focus()
      return
    }

    setIsSubmitting(true)

    // Safety recalculation to ensure data integrity even if user entered values very fast
    const totals = calculateTotals(form)
    const submitData = {
      ...form,
      ...totals,
      shift: shiftValue,
      milk_type: milkType
    }

    setCustomerWallet(null)

    try {
      const res = await submitMilkCollection(submitData)

      if (res.status_code == 200) {
        if (toggle) {
          handlePrint(submitData)
        }

        CustomToast.success(res.message)
        resetForm()
        fetchDateFilteredData()
      } else {
        CustomToast.error(res.message || res.errors)
      }
    } catch (error) {
      CustomToast.error(error.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchDateFilteredData = async () => {
    try {
      const payload = {
        start_date: DateFormate(form.date),
        end_date: DateFormate(form.date),
        data_type: 'all',
        customer_account_number: ''
      }

      const res = await getMilkCorrectionData(payload)

      if (res?.status_code == 200) {
        const collections = res.data?.milk_collections || []

        const morningData = collections.filter((item) => item.shift === 'morning')
        const eveningData = collections.filter((item) => item.shift === 'evening')

        setMorningCollection(morningData)
        setEveningCollection(eveningData)
        setCollections(isShift === 'morning' ? morningData : eveningData)

        const calculateSummary = (data) => {
          const totalMilk = data.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0)
          const totalAmount = data.reduce(
            (sum, item) => sum + (parseFloat(item.total_amount) || 0),
            0
          )
          const avgFat =
            data.length > 0
              ? data.reduce((sum, item) => sum + (parseFloat(item.fat) || 0), 0) / data.length
              : 0
          const avgSnf =
            data.length > 0
              ? data.reduce((sum, item) => sum + (parseFloat(item.snf) || 0), 0) / data.length
              : 0
          const avgBaseRate =
            data.length > 0
              ? data.reduce((sum, item) => sum + (parseFloat(item.base_rate) || 0), 0) / data.length
              : 0
          const otherPriceTotal = data.reduce(
            (sum, item) => sum + (parseFloat(item.other_price) || 0),
            0
          )
          return { totalMilk, totalAmount, avgFat, avgSnf, avgBaseRate, otherPriceTotal }
        }

        const morningSummary = calculateSummary(morningData)
        const eveningSummary = calculateSummary(eveningData)
        const overallSummary = calculateSummary(collections)

        setDayTotal({
          morning_total_amount: morningSummary.totalAmount,
          morning_total_milk: morningSummary.totalMilk,
          evening_total_amount: eveningSummary.totalAmount,
          evening_total_milk: eveningSummary.totalMilk,
          total_amount: overallSummary.totalAmount,
          milk_total: overallSummary.totalMilk
        })

        setMilkCollectionAvergeData({
          avg_base_rate: overallSummary.avgBaseRate.toFixed(2),
          avg_fat: overallSummary.avgFat.toFixed(2),
          avg_snf: overallSummary.avgSnf.toFixed(2),
          milk_total: overallSummary.totalMilk.toFixed(2),
          other_price_total: overallSummary.otherPriceTotal.toFixed(2),
          total_amount: overallSummary.totalAmount.toFixed(2),
          morning_avg_base_rate: morningSummary.avgBaseRate.toFixed(2),
          morning_avg_fat: morningSummary.avgFat.toFixed(2),
          morning_avg_snf: morningSummary.avgSnf.toFixed(2),
          morning_total_amount: morningSummary.totalAmount.toFixed(2),
          morning_total_milk: morningSummary.totalMilk.toFixed(2),
          evening_avg_base_rate: eveningSummary.avgBaseRate.toFixed(2),
          evening_avg_fat: eveningSummary.avgFat.toFixed(2),
          evening_avg_snf: eveningSummary.avgSnf.toFixed(2),
          evening_total_amount: eveningSummary.totalAmount.toFixed(2),
          evening_total_milk: eveningSummary.totalMilk.toFixed(2)
        })
      } else {
        CustomToast.error(res?.message || 'Failed to fetch data')
      }
    } catch (error) {
      console.error('Error fetching date filtered data:', error)
      CustomToast.error('Error fetching data')
    }
  }

  const handleRemove = async (id) => {
    try {
      const res = await deleteMilkCollection(id)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        fetchDateFilteredData()
      } else {
        CustomToast.error(res.message)
      }
    } catch (error) {
      console.error('Error deleting milk collection:', error)
      CustomToast.error('Failed to delete the entry')
    }
  }

  // PRINT HANDLER
  const handlePrint = useCallback((data) => {
    // Validate Data
    if (
      !data.customer_account_number ||
      !data.quantity ||
      !data.total_amount ||
      parseFloat(data.total_amount) <= 0
    ) {
      // Use CustomToast or alert
      console.warn('Print blocks: Missing or invalid data', data)
      return
    }

    const shift = data.shift === 'morning' ? 'M' : 'E'
    const now = new Date()
    const localTime = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })

    const slipData = {
      account_no: data.customer_account_number,
      customer: data.name,
      date: data.date,
      time: `${localTime}(${shift})`,
      qty: `${data.quantity} / Ltr`,
      fat: data.fat,
      snf: data.snf,
      rate: `${data.base_rate} / Ltr`,
      total: data.total_amount
    }

    if (window.api && window.api.printSlip) {
      window.api.printSlip(slipData)
    } else {
      console.error('Print API not available')
    }
  }, [])

  // Say so when a slip could not be printed (no printer, template missing...), instead of failing silently.
  useEffect(() => {
    return window.api?.onPrintResult?.((result) => {
      if (!result?.success) CustomToast.error(`Slip not printed: ${result?.error || 'check the printer.'}`)
    })
  }, [])

  useEffect(() => {
    checkTimeOfDay()

    // Sync Customers for Offline/Fast Access
    const syncCustomers = async () => {
      console.log('🔵 syncCustomers: Starting customer sync...')
      try {
        // Check if DB already has customers
        const hasCustomers = await hasCustomersInDB()

        if (hasCustomers) {
          console.log('✅ DB already has customers, skipping API fetch')
          return
        }

        const res = await getAllCustomer('')

        if (!res) {
          console.error('❌ No response from API')
          return
        }

        // Check if response is wrapped in a data property or is the array directly
        let customerData = res.data || res

        // If customerData is still not an array, try other possible keys
        if (!Array.isArray(customerData)) {
          console.log('⚠️ Response data is not an array, checking other properties...')
          if (res.customers) customerData = res.customers
          else if (res.result) customerData = res.result
          else if (typeof res === 'object')
            customerData = Object.values(res).find((v) => Array.isArray(v))
        }

        if (!Array.isArray(customerData)) {
          console.error('❌ Could not find customer array in response:', res)
          return
        }

        if (customerData.length > 0) {
          console.log('📋 First customer from API:', JSON.stringify(customerData[0], null, 2))
        }

        // Save to IndexedDB
        await saveCustomersToDB(customerData)

        // Verify save
        const savedCustomers = await getAllCustomersFromDB()
        console.log(`✅ Verified: ${savedCustomers.length} customers saved to DB`)
      } catch (err) {
        console.error('❌ Failed to sync customers:', err)
      }
    }

    syncCustomers()
  }, [])

  useEffect(() => {
    fetchDateFilteredData()
  }, [form.date])

  // INPUT REFS
  const accRef = useRef(null)
  const qtyRef = useRef(null)
  const nameRef = useRef(null)
  const fatRef = useRef(null)
  const mobileRef = useRef(null)
  const clrRef = useRef(null)
  const careOfRef = useRef(null)
  const snfRef = useRef(null)
  const otherRateRef = useRef(null)

  // Enhanced keyboard navigation with auto-fetch
  const handleAccountKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const accNo = form.customer_account_number.trim()
      if (accNo) {
        await fetchCustomerDetailByAccountNumber(accNo)
        qtyRef.current?.focus()
      } else {
        setForm((prev) => ({ ...prev, name: '', careof: '', mobile: '' }))
      }
    }
  }

  const handleQuantityKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const accNo = form.customer_account_number.trim()
      if (accNo && !form.name) {
        await fetchCustomerDetailByAccountNumber(accNo)
      }
      fatRef.current?.focus()
    }
  }

  const handleQuantityFocus = async () => {
    const accNo = form.customer_account_number.trim()
    if (accNo && !form.name) {
      await fetchCustomerDetailByAccountNumber(accNo)
    }
  }

  const handleFatKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const accNo = form.customer_account_number.trim()
      if (accNo && !form.name) {
        await fetchCustomerDetailByAccountNumber(accNo)
      }
      snfRef.current?.focus()
    }
  }

  const handleSnfKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (isFetchingRate) return

      const fat = form.fat?.trim()
      const clr = form.clr?.trim()
      const snfRaw = form.snf?.trim()

      if (!(fat && (clr || snfRaw))) return

      // Prevent redundant rate calculations if parameters haven't changed
      if (
        lastRateParamsRef.current.fat === fat &&
        lastRateParamsRef.current.clr === clr &&
        lastRateParamsRef.current.snf === snfRaw &&
        form.base_rate // only skip if we already have a rate
      ) {
        otherRateRef.current?.focus()
        return
      }

      const snfForApi = snfRaw && !snfRaw.includes('.') ? `${snfRaw}.0` : snfRaw

      setIsFetchingRate(true)
      try {
        const res = await getMilkRate(fat, clr, snfForApi)
        if (res) {
          lastRateParamsRef.current = { fat, clr, snf: snfRaw }
          setForm((prev) => {
            const updated = {
              ...prev,
              fat: res.fat || prev.fat,
              clr: res.clr || prev.clr,
              snf: res.snf || prev.snf,
              base_rate: res.rate || ''
            }
            const totals = calculateTotals(updated)
            return { ...updated, ...totals }
          })
          res.rate
            ? CustomToast.success('Rate Found', 'top-center')
            : CustomToast.warn('RATE not found', 'top-center')
        }
      } catch (err) {
        console.error('Rate error', err)
        CustomToast.error('Error fetching rate')
      } finally {
        setIsFetchingRate(false)
      }
      otherRateRef.current?.focus()
    }
  }

  // RESET FORM HANDLER
  const resetForm = () => {
    setErrors({})
    setForm({
      customer_account_number: '',
      name: '',
      careof: '',
      mobile: '',
      quantity: '',
      clr: '',
      fat: '',
      snf: '',
      base_rate: '',
      other_price: '0',
      rate: '',
      total_amount: '',
      milk_type: '',
      date: today
    })
    setTimeout(() => accRef.current?.focus(), 200)
  }

  const selectedTotal = selectedCustomer
    ? (selectedCustomer.total_amount ??
      (
        parseFloat(selectedCustomer.quantity) * parseFloat(selectedCustomer.base_rate) +
        parseFloat(selectedCustomer.other_price || 0)
      ).toFixed(2))
    : ''
  const ro = 'bg-[color:var(--ui-surface-sunken)]'

  return (
    <div className="ui-text-primary flex min-h-screen w-full flex-col">
      <WindowHeader title="Daily Milk Collection" icon={Milk} />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
          <form onSubmit={handleSubmit} noValidate>
            <SectionCard
              title="Collection Entry"
              subtitle="Enter = next field · SNF looks up the rate"
              icon={Droplets}
              tone="primary"
            >
              <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
                <div>
                  <p className="mb-1.5 text-[12.5px] font-semibold">Milk Type</p>
                  <SegmentedControl
                    ariaLabel="Milk type"
                    options={MILK_TYPES}
                    value={milkType}
                    onChange={setMilkType}
                  />
                </div>
                <div>
                  <p className="mb-1.5 text-[12.5px] font-semibold">Shift</p>
                  <SegmentedControl
                    ariaLabel="Shift"
                    options={SHIFT_OPTIONS}
                    value={shiftValue}
                    onChange={(shift) => {
                      setShiftValue(shift)
                      setIsShift(shift)
                    }}
                  />
                </div>
                <Input
                  label="Date"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  max={today}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                <Input
                  label="Account No"
                  required
                  name="customer_account_number"
                  type="text"
                  value={form.customer_account_number}
                  onChange={handleChange}
                  ref={accRef}
                  onKeyDown={handleAccountKeyDown}
                  placeholder="Account No"
                  error={errors.customer_account_number}
                  autoComplete="off"
                />
                <Input
                  label="Quantity (Ltr)"
                  required
                  name="quantity"
                  type="number"
                  step="any"
                  value={form.quantity}
                  onChange={handleChange}
                  ref={qtyRef}
                  onKeyDown={handleQuantityKeyDown}
                  onFocus={handleQuantityFocus}
                  placeholder="Quantity"
                  error={errors.quantity}
                />
                <Input
                  label="FAT (%)"
                  required
                  name="fat"
                  type="number"
                  step="any"
                  value={form.fat}
                  onChange={handleChange}
                  ref={fatRef}
                  onKeyDown={handleFatKeyDown}
                  placeholder="FAT %"
                />
                <Input
                  label="CLR"
                  name="clr"
                  type="number"
                  step="any"
                  value={form.clr}
                  onChange={handleChange}
                  ref={clrRef}
                  placeholder="CLR"
                />
                <Input
                  label="SNF (%)"
                  required
                  name="snf"
                  type="text"
                  value={form.snf}
                  onChange={handleChange}
                  ref={snfRef}
                  onKeyDown={handleSnfKeyDown}
                  placeholder="SNF %"
                />
                <Input
                  label="Base Rate (₹/Ltr)"
                  name="base_rate"
                  type="number"
                  value={form.base_rate}
                  readOnly
                  className={ro}
                  placeholder="Auto"
                />
                <Input
                  label="Name"
                  name="name"
                  type="text"
                  value={form.name}
                  disabled
                  ref={nameRef}
                  placeholder="Auto-filled"
                />
                <Input
                  label="Care of"
                  name="careof"
                  type="text"
                  value={form.careof}
                  disabled
                  ref={careOfRef}
                  placeholder="Auto-filled"
                />
                <Input
                  label="Mobile"
                  name="mobile"
                  type="text"
                  value={form.mobile}
                  disabled
                  ref={mobileRef}
                  placeholder="Auto-filled"
                />
                <Input
                  label="Other Price (₹)"
                  name="other_price"
                  type="number"
                  step="any"
                  value={form.other_price}
                  onChange={handleChange}
                  ref={otherRateRef}
                />
                <Input
                  label="Rate (Auto)"
                  name="rate"
                  type="number"
                  value={form.rate}
                  readOnly
                  className={ro}
                  placeholder="Auto"
                />
                <Input
                  label="Total Amount"
                  name="total_amount"
                  type="number"
                  value={form.total_amount}
                  readOnly
                  className="!font-bold !text-[color:var(--ui-success-600)]"
                  placeholder="Auto"
                  error={errors.total_amount}
                />
              </div>

              {customerWallet !== null && (
                <div className="ui-tint-info mt-4 flex items-center justify-between gap-3 rounded-lg px-4 py-3">
                  <span className="flex items-center gap-2 text-[13px] font-semibold">
                    <Wallet size={16} aria-hidden="true" />
                    Wallet Balance
                  </span>
                  <span className="ui-font-display text-[17px] font-extrabold">
                    ₹{customerWallet}
                  </span>
                </div>
              )}

              <div className="ui-border-subtle mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <Switch label="Auto Print" checked={toggle} onChange={setToggle} />
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" icon={RotateCcw} onClick={resetForm}>
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    icon={Send}
                    loading={isSubmitting}
                    disabled={isSubmitting || isFetchingRate}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </div>
            </SectionCard>
          </form>

          <SectionCard
            title="Daily Summary"
            subtitle={form.date ? DateFormate(form.date) : ''}
            icon={Sigma}
            tone="accent"
          >
            <div className="space-y-3">
              <SummaryTile
                icon={Sun}
                tone="accent"
                label="Morning"
                milk={dayTotal.morning_total_milk}
                amount={dayTotal.morning_total_amount}
              />
              <SummaryTile
                icon={Moon}
                tone="primary"
                label="Evening"
                milk={dayTotal.evening_total_milk}
                amount={dayTotal.evening_total_amount}
              />
              <SummaryTile
                icon={Sigma}
                tone="success"
                label="Total"
                milk={dayTotal.milk_total}
                amount={dayTotal.total_amount}
              />
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Collections" subtitle="Click a row for details" icon={Milk} tone="info">
          <MilkCollectionTable
            morningCollection={morningCollection}
            eveningCollection={eveningCollection}
            isShift={isShift}
            handlePrint={handlePrint}
            setSelectedCustomer={setSelectedCustomer}
            setIsModalOpen={setIsModalOpen}
            setIsEditeModal={setIsEditeModal}
            setDeleteId={setDeleteId}
            setShowConfirmModal={setShowConfirmModal}
            avgFat={milkCollectiionAvergeData.avg_fat}
            avgSnf={milkCollectiionAvergeData.avg_snf}
          />
        </SectionCard>
      </div>

      <Modal
        isOpen={isModalOpen && !!selectedCustomer}
        onClose={() => setIsModalOpen(false)}
        ariaLabel="Milk collection details"
        maxWidth="40rem"
        className="flex max-h-[90vh] flex-col overflow-hidden"
      >
        {selectedCustomer && (
          <>
            <div className="ui-border-subtle flex items-center gap-4 border-b px-6 py-5">
              <IconBadge icon={Milk} tone="primary" size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="ui-font-display text-[17px] font-extrabold">
                  Milk Collection Details
                </h2>
                <p className="ui-text-tertiary truncate text-[12.5px]">
                  {selectedCustomer.name} · A/C {selectedCustomer.customer_account_number}
                </p>
              </div>
              <Badge tone="primary" dot={false}>
                {selectedCustomer.shift}
              </Badge>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              <DetailList
                items={[
                  ['Name', selectedCustomer.name],
                  ['Mobile', selectedCustomer.mobile],
                  ['Care of', selectedCustomer.careof],
                  ['Account Number', selectedCustomer.customer_account_number],
                  ['Milk Type', selectedCustomer.milk_type],
                  ['Quantity (Ltr)', selectedCustomer.quantity],
                  ['FAT (%)', selectedCustomer.fat],
                  ['SNF (%)', selectedCustomer.snf],
                  ['CLR', selectedCustomer.clr],
                  ['Base Rate (₹)', selectedCustomer.base_rate],
                  ['Other Price (₹)', selectedCustomer.other_price],
                  ['Total amount (₹)', selectedTotal],
                  [
                    'Created At',
                    selectedCustomer.created_at
                      ? new Date(selectedCustomer.created_at).toLocaleString()
                      : ''
                  ]
                ]}
              />
            </div>
            <div className="ui-border-subtle flex justify-end gap-2 border-t px-6 py-4">
              <Button
                variant="secondary"
                icon={Printer}
                onClick={() => handlePrint(selectedCustomer)}
              >
                Print
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </>
        )}
      </Modal>

      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          handleRemove(deleteId)
          setShowConfirmModal(false)
          setDeleteId(null)
        }}
        title="Delete Entry"
        message="Are you sure you want to delete this milk collection entry? This action cannot be undone."
      />

      <EditMilkCollectionModal
        isOpen={isEditeModal}
        onClose={() => setIsEditeModal(false)}
        milkData={selectedCustomer}
        onUpdate={fetchDateFilteredData}
      />
    </div>
  )
}

export default DairyMilkCollectionPage
