/* eslint-disable react/prop-types -- props are documented by usage in DailyMilkCollectionPage */
import { useEffect, useState } from 'react'
import { Pencil, Save, TriangleAlert, X } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import {
  Button,
  ConfirmActionModal,
  IconBadge,
  IconButton,
  Input,
  Modal,
  SelectDropdown
} from '../../components/ui'

const MILK_TYPES = ['cow', 'buffalo', 'other'].map((v) => ({
  value: v,
  label: v[0].toUpperCase() + v.slice(1)
}))
const SHIFTS = ['morning', 'evening', 'both'].map((v) => ({
  value: v,
  label: v[0].toUpperCase() + v.slice(1)
}))

const EditMilkCollectionModal = ({ isOpen, onClose, milkData, onUpdate }) => {
  const editMilkCollectionDetail = useHomeStore((state) => state.editMilkCollectionDetail)
  const loading = useHomeStore((state) => state.loading)
  const fetchCustomerDetailsByAccount = useHomeStore((state) => state.fetchCustomerDetailsByAccount)
  const getMilkRate = useHomeStore((state) => state.getMilkRate)
  const [isCustomer, setIscustomer] = useState(true)
  const [rateFieldsTouched, setRateFieldsTouched] = useState(false)
  const [showConfirmChange, setShowConfirmChange] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    milk_type: '',
    customer_account_number: '',
    name: '',
    careof: '',
    mobile: '',
    quantity: '',
    fat: '',
    clr: '',
    snf: '',
    base_rate: '',
    other_price: '',
    rate: '',
    total_amount: '',
    shift: ''
  })

  useEffect(() => {
    if (milkData) {
      setForm({
        milk_type: milkData.milk_type || '',
        customer_account_number: milkData.customer_account_number || '',
        name: milkData.name || '',
        careof: milkData.careof || '',
        mobile: milkData.mobile || '',
        quantity: milkData.quantity || '',
        fat: milkData.fat || '',
        clr: milkData.clr || '',
        snf: milkData.snf || '',
        base_rate: milkData.base_rate || '',
        other_price: milkData.other_price || '',
        rate: milkData.base_rate || '',
        total_amount: milkData.quantity * milkData.base_rate || '',
        shift: milkData.shift || '',
        date: milkData.date
      })
    }
  }, [milkData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))

    if (['fat', 'snf', 'clr'].includes(name)) {
      setRateFieldsTouched(true)
    }

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: value
      }

      if (name === 'base_rate') updated.rate = value

      // When quantity or base_rate changes, update total_amount
      if (name === 'quantity' || name === 'base_rate') {
        const quantity = parseFloat(name === 'quantity' ? value : updated.quantity)
        const baseRate = parseFloat(name === 'base_rate' ? value : updated.base_rate)

        if (!isNaN(quantity) && !isNaN(baseRate)) {
          updated.total_amount = (quantity * baseRate).toFixed(2)
        } else {
          updated.total_amount = ''
        }
      }

      return updated
    })
  }

  // FETCH ALL CUSTOMER
  const fetchCustomerDetailByAccountNumber = async (accountNo) => {
    try {
      const res = await fetchCustomerDetailsByAccount(accountNo) // Your zustand API call
      if (res.status_code == 200) {
        setIscustomer(false)
        setAccountError('')
        setForm((prev) => ({
          ...prev,
          name: res.data.name || '',
          careof: res.data.careof || '',
          mobile: res.data.mobile || ''
        }))
        // setCustomerWallet(res.data.wallet)
      } else {
        setIscustomer(true)
        setAccountError(res.message || 'Customer not found')
        setForm((prev) => ({
          ...prev,
          name: '',
          careof: '',
          mobile: ''
        }))
      }
    } catch (error) {
      console.error('Error fetching customer details:', error)
      setForm((prev) => ({
        ...prev,
        name: '',
        careof: '',
        mobile: ''
      }))
    }
  }

  // Debounced fetch on account number input
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (form.customer_account_number) {
        fetchCustomerDetailByAccountNumber(form.customer_account_number)
      } else {
        setForm((prev) => ({
          ...prev,
          name: '',
          careof: '',
          mobile: ''
        }))
      }
    }, 500) // wait 500ms after user stops typing

    return () => clearTimeout(timeout) // cleanup on next input
  }, [form.customer_account_number])

  const executeUpdate = async () => {
    try {
      const res = await editMilkCollectionDetail(milkData.id, form)
      if (res.status_code === 200) {
        CustomToast.success(res.message)
        setShowConfirmChange(false)
        await onUpdate()
        onClose()
      } else {
        CustomToast.error(res.message)
      }
    } catch (error) {
      console.error('Error updating milk collection:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const found = {}
    if (!form.date) found.date = 'Select the date'
    if (!form.customer_account_number) found.customer_account_number = 'Enter the account number'
    if (!form.milk_type) found.milk_type = 'Select the milk type'
    if (!form.shift) found.shift = 'Select a shift'
    if (!(parseFloat(form.quantity) > 0)) found.quantity = 'Enter the quantity'
    setErrors(found)
    if (Object.keys(found).length) return

    // Check if account number has changed
    const isAccountChanged = form.customer_account_number !== milkData.customer_account_number

    if (isAccountChanged) {
      setShowConfirmChange(true)
    } else {
      await executeUpdate()
    }
  }

  useEffect(() => {
    const fat = form.fat?.toString().trim()
    const clr = form.clr?.toString().trim()
    const snfRaw = form.snf?.toString().trim()

    // ✅ Keep user input clean, but send '.0' to API for integer values (e.g., 8 -> 8.0)
    const snfForApi = snfRaw && !snfRaw.includes('.') ? `${snfRaw}.0` : snfRaw

    // ✅ Trigger only when FAT is present, and either SNF or CLR is updated
    if ((snfForApi || clr) && fat) {
      // Check if values have actually changed from milkData
      // Convert to numbers for robust comparison
      const currentFat = parseFloat(fat || '0')
      const originalFat = parseFloat(milkData?.fat || '0')
      const currentSnf = parseFloat(snfRaw || '0')
      const originalSnf = parseFloat(milkData?.snf || '0')
      const currentClr = parseFloat(clr || '0')
      const originalClr = parseFloat(milkData?.clr || '0')

      // Check differences with a small epsilon for float safety, or just direct value check
      const isFatChanged = milkData && Math.abs(currentFat - originalFat) > 0.001
      const isSnfChanged = milkData && Math.abs(currentSnf - originalSnf) > 0.001
      const isClrChanged = milkData && Math.abs(currentClr - originalClr) > 0.001

      console.log('Comparison:', {
        currentFat,
        originalFat,
        isFatChanged,
        currentSnf,
        originalSnf,
        isSnfChanged,
        currentClr,
        originalClr,
        isClrChanged,
        rateFieldsTouched
      })

      // If we have milkData AND user has NOT touched the fields, skipt fetch.
      // We rely on the touched state primarily.
      if (milkData && !rateFieldsTouched) {
        return
      }

      const timeout = setTimeout(() => {
        const getBaseRateFetch = async () => {
          try {
            const res = await getMilkRate(fat, clr, snfForApi)
            console.log('milk rate fetch', res)

            setForm((prev) => ({
              ...prev,
              base_rate: res.rate || '',
              rate: res.rate || '' // Update displayed rate as well
            }))

            // 🎯 Prioritize meaningful feedback
            if (res.rate) {
              // CustomToast.success("Rate Found", "top-center");
            } else {
              if (!res.fat) CustomToast.warn('FAT not found', 'top-center')
              if (!res.snf) CustomToast.warn('SNF not found', 'top-center')
              if (!res.clr) CustomToast.warn('CLR not found', 'top-center')
              CustomToast.warn('RATE not found', 'top-center')
            }
          } catch (error) {
            console.error('Error fetching milk rate:', error)
          }
        }

        getBaseRateFetch()
      }, 800) // Slightly quicker feedback

      return () => clearTimeout(timeout)
    }
  }, [form.fat, form.snf, form.clr, milkData, rateFieldsTouched])

  // Calculate rate and total_amount automatically
  useEffect(() => {
    const { base_rate, other_price, quantity } = form
    const b = parseFloat(base_rate) || 0
    const o = parseFloat(other_price) || 0
    const q = parseFloat(quantity) || 0
    const rate = q * b
    const total_amount = rate + o

    setForm((prev) => ({
      ...prev,
      total_amount: total_amount.toFixed(2)
    }))
  }, [form.fat, form.snf, form.base_rate, form.other_price, form.quantity])

  const pick = (name) => (value) => handleChange({ target: { name, value } })
  const err = (name) => errors[name]

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        ariaLabel="Edit milk collection"
        maxWidth="52rem"
        className="flex max-h-[90vh] flex-col overflow-hidden"
      >
        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="ui-border-subtle flex items-center gap-3 border-b px-6 py-4">
            <IconBadge icon={Pencil} tone="primary" />
            <div className="min-w-0 flex-1">
              <h2 className="ui-font-display text-[16px] font-bold">Edit Milk Collection</h2>
              <p className="ui-text-tertiary truncate text-[12px]">
                {milkData?.name} · A/C {milkData?.customer_account_number}
              </p>
            </div>
            <IconButton icon={X} label="Close" onClick={onClose} />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Date"
                required
                type="date"
                name="date"
                value={form.date || ''}
                onChange={handleChange}
                error={err('date')}
              />
              <Input
                label="Account No"
                required
                type="text"
                name="customer_account_number"
                value={form.customer_account_number}
                onChange={handleChange}
                error={
                  err('customer_account_number') ||
                  (form.customer_account_number && isCustomer ? accountError : '')
                }
                hint={
                  form.customer_account_number && isCustomer && !accountError
                    ? 'Looking up customer…'
                    : undefined
                }
              />
              <Input label="Name" type="text" name="name" value={form.name} readOnly disabled />
              <Input
                label="Care of"
                type="text"
                name="careof"
                value={form.careof}
                readOnly
                disabled
              />
              <SelectDropdown
                label="Milk Type"
                required
                name="milk_type"
                options={MILK_TYPES}
                value={form.milk_type}
                placeholder="Select milk type"
                onChange={pick('milk_type')}
                error={err('milk_type')}
              />
              <SelectDropdown
                label="Shift"
                required
                name="shift"
                options={SHIFTS}
                value={form.shift}
                placeholder="Select shift"
                onChange={pick('shift')}
                error={err('shift')}
              />
              <Input
                label="Mobile"
                type="text"
                name="mobile"
                value={form.mobile}
                readOnly
                disabled
              />
              <Input
                label="Quantity (Ltr)"
                required
                type="number"
                step="any"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                error={err('quantity')}
              />
              <Input
                label="FAT"
                type="number"
                step="any"
                name="fat"
                value={form.fat}
                onChange={handleChange}
              />
              <Input
                label="SNF"
                type="number"
                step="any"
                name="snf"
                value={form.snf}
                onChange={handleChange}
              />
              <Input
                label="Rate (₹/Ltr)"
                type="number"
                step="any"
                name="base_rate"
                value={form.base_rate}
                onChange={handleChange}
              />
              <Input
                label="Other Price (₹)"
                type="number"
                step="any"
                name="other_price"
                value={form.other_price}
                onChange={handleChange}
              />
              <Input
                label="Total Amount"
                type="number"
                name="total_amount"
                value={form.total_amount}
                readOnly
                className="!font-bold !text-[color:var(--ui-success-600)]"
              />
            </div>
          </div>

          <div className="ui-border-subtle flex justify-end gap-2 border-t px-6 py-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" icon={Save} loading={loading} disabled={loading || isCustomer}>
              {loading ? 'Please wait...' : 'Update'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmActionModal
        isOpen={showConfirmChange}
        onClose={() => {
          setShowConfirmChange(false)
          onClose() // closes the main dialog too, as before
        }}
        onConfirm={executeUpdate}
        tone="warning"
        icon={TriangleAlert}
        title="Confirm Account Update"
        message={`You are changing the account number from ${milkData?.customer_account_number} to ${form.customer_account_number}. Are you sure you want to proceed with this update?`}
        cancelLabel="No, Cancel"
        confirmLabel="Yes, Update"
      />
    </>
  )
}

export default EditMilkCollectionModal
