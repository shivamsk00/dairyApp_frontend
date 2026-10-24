/* eslint-disable react/prop-types -- props are documented by usage in MilkSalesPage */
import { useState, useEffect } from 'react'
import { Loader2, Pencil, Save, X } from 'lucide-react'
import useDailyMilkSaleStore from '../../zustand/useDailyMilkSaleStore'
import { Button, IconBadge, IconButton, Input, SelectDropdown } from '../../components/ui'
import { MILK_TYPES, PAYMENT_MODES, SHIFTS } from './saleOptions'

// A date from the server -> YYYY-MM-DD for <input type="date">, without the UTC day shift.
const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  const match = String(dateString).match(/^(\d{4}-\d{2}-\d{2})/)
  if (match) return match[1]
  const d = new Date(dateString)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const EditeMilkSale = ({ dailyMilkSaleId, onSubmit, onCancel }) => {
  const getDailyMilkSaleDataForEdit = useDailyMilkSaleStore(
    (state) => state.getDailyMilkSaleDataForEdit
  )
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    customer_account_number: '',
    customer_name: '',
    sale_date: '',
    shift: '',
    milk_type: '',
    quentity: '',
    rate_per_liter: '',
    payment_mode: '',
    notes: ''
  })

  // Fetch data for editing
  useEffect(() => {
    const fetchEditData = async () => {
      setLoading(true)
      try {
        const res = await getDailyMilkSaleDataForEdit(dailyMilkSaleId?.id)
        const d = res.data
        setForm({
          customer_account_number: d.customer_account_number,
          customer_name: d.customer_name,
          sale_date: formatDateForInput(d.sale_date),
          shift: d.shift,
          milk_type: (d.milk_type || '').toLowerCase(), // normalize spelling
          quentity: d.quentity,
          rate_per_liter: d.rate_per_liter,
          payment_mode: d.payment_mode,
          notes: d.notes
        })
      } catch (error) {
        console.error('Error fetching milk sale data', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEditData()
  }, [dailyMilkSaleId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }
  const choose = (name) => (value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const totalAmount = (
    parseFloat(form.quentity || 0) * parseFloat(form.rate_per_liter || 0)
  ).toFixed(2)

  const handleSubmit = (e) => {
    e.preventDefault()
    const found = {}
    if (!form.sale_date) found.sale_date = 'Select the sale date'
    if (!form.shift) found.shift = 'Select a shift'
    if (!form.milk_type) found.milk_type = 'Select the milk type'
    if (!(parseFloat(form.quentity) > 0)) found.quentity = 'Quantity must be greater than 0'
    if (!(parseFloat(form.rate_per_liter) > 0)) found.rate_per_liter = 'Rate must be greater than 0'
    if (!form.payment_mode) found.payment_mode = 'Select the payment mode'
    setErrors(found)
    if (Object.keys(found).length) return
    onSubmit && onSubmit({ ...form, total_amount: totalAmount })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="ui-border-subtle flex items-center gap-3 border-b px-6 py-4">
        <IconBadge icon={Pencil} tone="primary" />
        <div className="min-w-0 flex-1">
          <h2 className="ui-font-display text-[16px] font-bold">Edit Daily Milk Sale</h2>
          <p className="ui-text-tertiary truncate text-[12px]">
            {form.customer_name
              ? `${form.customer_name} — A/c: ${form.customer_account_number}`
              : 'Loading…'}
          </p>
        </div>
        <IconButton icon={X} label="Close" onClick={onCancel} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-12">
            <Loader2 size={20} className="ui-text-brand animate-spin" aria-hidden="true" />
            <span className="ui-text-secondary text-[13px]">Loading sale…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Acc No."
              type="text"
              value={form.customer_account_number ?? ''}
              readOnly
              disabled
            />
            <Input
              label="Customer Name"
              type="text"
              value={form.customer_name ?? ''}
              readOnly
              disabled
            />
            <Input
              label="Sale Date"
              required
              type="date"
              name="sale_date"
              value={form.sale_date}
              onChange={handleChange}
              error={errors.sale_date}
            />
            <SelectDropdown
              label="Shift"
              required
              name="shift"
              options={SHIFTS}
              value={form.shift}
              placeholder="Select shift"
              onChange={choose('shift')}
              error={errors.shift}
            />
            <SelectDropdown
              label="Milk Type"
              required
              name="milk_type"
              options={MILK_TYPES}
              value={form.milk_type}
              placeholder="Select milk type"
              onChange={choose('milk_type')}
              error={errors.milk_type}
            />
            <Input
              label="Quantity (Ltr)"
              required
              type="number"
              name="quentity"
              min="0"
              step="any"
              value={form.quentity ?? ''}
              onChange={handleChange}
              error={errors.quentity}
            />
            <Input
              label="Rate per Liter (₹)"
              required
              type="number"
              name="rate_per_liter"
              min="0"
              step="any"
              value={form.rate_per_liter ?? ''}
              onChange={handleChange}
              error={errors.rate_per_liter}
            />
            <Input label="Total Amount (₹)" type="text" value={totalAmount} readOnly disabled />
            <SelectDropdown
              label="Payment Mode"
              required
              name="payment_mode"
              options={PAYMENT_MODES}
              value={form.payment_mode}
              placeholder="Select payment mode"
              onChange={choose('payment_mode')}
              error={errors.payment_mode}
            />
            <Input
              label="Notes"
              type="text"
              name="notes"
              value={form.notes ?? ''}
              onChange={handleChange}
            />
          </div>
        )}
      </div>

      <div className="ui-border-subtle flex justify-end gap-2 border-t px-6 py-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" icon={Save} disabled={loading}>
          Update
        </Button>
      </div>
    </form>
  )
}

export default EditeMilkSale
