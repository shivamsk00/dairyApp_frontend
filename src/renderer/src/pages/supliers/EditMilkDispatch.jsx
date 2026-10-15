/* eslint-disable react/prop-types -- props are documented by usage in MilkDispatchPage */
import { useEffect, useState } from 'react'
import { Pencil, Save, X } from 'lucide-react'
import CustomToast from '../../helper/costomeToast'
import useMilkDispatchStore from '../../zustand/useMilkDispatchStore'
import useHomeStore from '../../zustand/useHomeStore'
import {
  Button,
  IconBadge,
  IconButton,
  Input,
  Modal,
  SelectDropdown,
  Textarea
} from '../../components/ui'
import { SHIFTS, money } from './dispatchOptions'

// Server date -> YYYY-MM-DD for <input type="date">, without the UTC day shift.
const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  const match = String(dateString).match(/^(\d{4}-\d{2}-\d{2})/)
  if (match) return match[1]
  const d = new Date(dateString)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const EditMilkDispatchModal = ({ isOpen, onClose, milkDispatchData }) => {
  const updateMilkDispatch = useMilkDispatchStore((state) => state.updateMilkDispatch)
  const getAllHeadDairyMaster = useHomeStore((state) => state.getAllHeadDairyMaster)
  const [loading, setLoading] = useState(false)
  const [headDairies, setHeadDairies] = useState([])
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    dispatch_date: '',
    head_dairy_id: '',
    shift: '',
    vehicle_no: '',
    notes: '',
    milk_details: []
  })

  useEffect(() => {
    if (isOpen) {
      getAllHeadDairyMaster().then((res) => setHeadDairies(res?.data || []))
    }
  }, [isOpen])

  useEffect(() => {
    if (milkDispatchData) {
      setErrors({})
      setForm({
        dispatch_date: formatDateForInput(milkDispatchData.dispatch_date),
        head_dairy_id: milkDispatchData.head_dairy?.id ?? milkDispatchData.head_dairy_id ?? '',
        shift: milkDispatchData.shift,
        vehicle_no: milkDispatchData.vehicle_no ?? '',
        notes: milkDispatchData.notes || '',
        // copy rows so editing never mutates the list's data
        milk_details: (milkDispatchData.milk_details || []).map((row) => ({ ...row }))
      })
    }
  }, [milkDispatchData])

  // Totals always follow the rows (the old dialog sent the stale totals from before the edit).
  const totalQty = form.milk_details.reduce((sum, row) => sum + Number(row.qty || 0), 0)
  const totalAmount = form.milk_details.reduce((sum, row) => sum + Number(row.amount || 0), 0)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleMilkDetailChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      milk_details: prev.milk_details.map((row, i) => {
        if (i !== index) return row
        const updated = { ...row, [field]: value }
        if (['qty', 'rate'].includes(field)) {
          updated.amount = (parseFloat(updated.qty || 0) * parseFloat(updated.rate || 0)).toFixed(2)
        }
        return updated
      })
    }))
    setErrors((prev) => ({ ...prev, rows: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = {}
    if (!form.dispatch_date) found.dispatch_date = 'Select the dispatch date'
    if (!form.head_dairy_id) found.head_dairy_id = 'Choose a head dairy'
    if (!form.shift) found.shift = 'Select a shift'
    if (form.milk_details.some((row) => !(parseFloat(row.qty) > 0)))
      found.rows = 'Every row needs a quantity greater than 0'
    setErrors(found)
    if (Object.keys(found).length) return

    try {
      setLoading(true)
      const res = await updateMilkDispatch(milkDispatchData?.id, {
        ...form,
        total_qty: totalQty,
        total_amount: totalAmount.toFixed(2)
      })
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        onClose()
      } else {
        CustomToast.error(res.message)
      }
    } catch (error) {
      console.log('ERROR IN UPDATE EDITMILKDISPATCH', error)
      CustomToast.error('Failed to update the dispatch')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Edit milk dispatch"
      maxWidth="52rem"
      dismissible={!loading}
      className="flex max-h-[90vh] flex-col overflow-hidden"
    >
      <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="ui-border-subtle flex items-center gap-3 border-b px-6 py-4">
          <IconBadge icon={Pencil} tone="primary" />
          <div className="min-w-0 flex-1">
            <h2 className="ui-font-display text-[16px] font-bold">Edit Milk Dispatch</h2>
            <p className="ui-text-tertiary truncate text-[12px]">{milkDispatchData?.dairy_name}</p>
          </div>
          <IconButton icon={X} label="Close" disabled={loading} onClick={onClose} />
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Dispatch Date"
              required
              type="date"
              name="dispatch_date"
              value={form.dispatch_date}
              onChange={handleChange}
              error={errors.dispatch_date}
            />
            <SelectDropdown
              label="Head Dairy"
              required
              name="head_dairy_id"
              searchable
              options={headDairies.map((d) => ({ value: d.id, label: d.dairy_name }))}
              value={form.head_dairy_id}
              placeholder="Choose head dairy"
              onChange={(value) => handleChange({ target: { name: 'head_dairy_id', value } })}
              error={errors.head_dairy_id}
            />
            <SelectDropdown
              label="Shift"
              required
              name="shift"
              options={SHIFTS}
              value={form.shift}
              placeholder="Select shift"
              onChange={(value) => handleChange({ target: { name: 'shift', value } })}
              error={errors.shift}
            />
            <Input
              label="Vehicle No"
              type="text"
              name="vehicle_no"
              value={form.vehicle_no}
              onChange={handleChange}
            />
          </div>

          <div>
            <p className="ui-text-tertiary mb-2 text-[11px] font-semibold uppercase tracking-wide">
              Milk details
            </p>
            <div className="space-y-3">
              {form.milk_details.map((detail, index) => (
                <div
                  key={index}
                  className="ui-border-subtle grid grid-cols-2 gap-3 rounded-lg border p-3 md:grid-cols-6"
                >
                  <Input
                    label="Milk Type"
                    type="text"
                    value={detail.milk_type ?? ''}
                    readOnly
                    disabled
                  />
                  <Input
                    label="Qty (L)"
                    type="number"
                    min="0"
                    step="any"
                    value={detail.qty ?? ''}
                    onChange={(e) => handleMilkDetailChange(index, 'qty', e.target.value)}
                  />
                  <Input
                    label="Fat"
                    type="number"
                    step="any"
                    value={detail.fat ?? ''}
                    onChange={(e) => handleMilkDetailChange(index, 'fat', e.target.value)}
                  />
                  <Input
                    label="SNF"
                    type="text"
                    value={detail.snf ?? ''}
                    onChange={(e) => handleMilkDetailChange(index, 'snf', e.target.value)}
                  />
                  <Input
                    label="Rate"
                    type="number"
                    step="any"
                    value={detail.rate ?? ''}
                    onChange={(e) => handleMilkDetailChange(index, 'rate', e.target.value)}
                  />
                  <Input
                    label="Amount (₹)"
                    type="text"
                    value={detail.amount ?? ''}
                    readOnly
                    disabled
                  />
                </div>
              ))}
            </div>
            {errors.rows && (
              <p role="alert" className="mt-2 text-[11.5px] text-[color:var(--ui-danger-600)]">
                {errors.rows}
              </p>
            )}
          </div>

          <Textarea
            label="Notes"
            rows={2}
            name="notes"
            value={form.notes}
            onChange={handleChange}
          />

          <div className="ui-bg-sunken flex flex-wrap gap-8 rounded-lg px-4 py-3">
            <div>
              <p className="ui-text-tertiary text-[11px] font-semibold uppercase tracking-wide">
                Total quantity
              </p>
              <p className="ui-font-display text-[18px] font-extrabold">{totalQty} L</p>
            </div>
            <div>
              <p className="ui-text-tertiary text-[11px] font-semibold uppercase tracking-wide">
                Total amount
              </p>
              <p className="ui-font-display text-[18px] font-extrabold text-[color:var(--ui-success-600)]">
                {money(totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="ui-border-subtle flex justify-end gap-2 border-t px-6 py-4">
          <Button variant="secondary" disabled={loading} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" icon={Save} loading={loading}>
            Update
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditMilkDispatchModal
