import { useEffect, useRef, useState } from 'react'
import { FileText, Plus, RotateCcw, Save, Trash2, TriangleAlert, X } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import DateFormate from '../../helper/DateFormate'
import {
  Button,
  ConfirmActionModal,
  DataTable,
  IconButton,
  Input,
  SectionCard,
  SelectDropdown,
  todayISO
} from '../../components/ui'

const MIN_ROWS = 10
const MODES = [
  { value: 'given', label: 'Given (Debit / Payment)' },
  { value: 'received', label: 'Received (Credit)' }
]
const money = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

let rowSeed = 0
const createEmptyRow = (srNo) => ({
  id: `${Date.now()}-${++rowSeed}`,
  sr_no: srNo,
  customer_name: '',
  customer_account_number: '',
  amount: '',
  note: ''
})
const freshRows = () => Array.from({ length: MIN_ROWS }, (_, i) => createEmptyRow(i + 1))

const ManualEntries = () => {
  // Local calendar day (toISOString() is UTC and gives yesterday before 05:30 IST)
  const today = todayISO()
  const [voucherData, setVoucherData] = useState({ date: today, credit_debit_mode: '' })
  const [entries, setEntries] = useState(freshRows)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  // Input refs so Enter can move through the sheet quickly
  const inputRefs = useRef({})
  const pendingFocus = useRef(null)
  const fetchCustomerDetailsByAccount = useHomeStore((state) => state.fetchCustomerDetailsByAccount)
  const submitCashEntry = useHomeStore((state) => state.submitCashEntry)

  const total = entries.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0)

  // Focus a field that was just created (a new row added with Enter)
  useEffect(() => {
    if (pendingFocus.current) {
      inputRefs.current[pendingFocus.current]?.focus()
      pendingFocus.current = null
    }
  }, [entries.length])

  const focusRef = (key) => inputRefs.current[key]?.focus()

  const handleAddRow = () => setEntries((prev) => [...prev, createEmptyRow(prev.length + 1)])

  const handleDeleteRow = (id) => {
    if (entries.length <= MIN_ROWS) {
      CustomToast.error(`At least ${MIN_ROWS} rows are required`)
      return
    }
    setEntries((prev) => prev.filter((e) => e.id !== id).map((e, i) => ({ ...e, sr_no: i + 1 })))
  }

  const handleReset = () => {
    setVoucherData({ date: today, credit_debit_mode: '' })
    setEntries(freshRows())
    setErrors({})
  }

  const handleDeleteAll = () => {
    setConfirmClear(false)
    handleReset()
    CustomToast.success('All entries cleared')
  }

  const handleCellChange = (id, field, value) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    )
    setErrors((prev) => ({ ...prev, entries: undefined }))
  }

  // Fetch customer details by account number
  const handleAccountBlur = async (id, accountNo) => {
    if (!accountNo.trim()) return false
    try {
      const res = await fetchCustomerDetailsByAccount(accountNo)
      if (res.status_code === 200) {
        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === id
              ? { ...entry, customer_name: res.data.name || '', wallet: res.data.wallet || '' }
              : entry
          )
        )
        CustomToast.success('Customer details loaded')
        return true
      }
      CustomToast.error(res.message || 'Customer not found')
      return false
    } catch (error) {
      console.error('Error fetching customer:', error)
      CustomToast.error('Failed to fetch customer details')
      return false
    }
  }

  const handleAccountKeyPress = async (e, id) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const accountNo = e.target.value.trim()
    if (accountNo) {
      const success = await handleAccountBlur(id, accountNo)
      if (success) focusRef(`amount-${id}`)
    } else {
      const index = entries.findIndex((entry) => entry.id === id)
      if (index < entries.length - 1) focusRef(`account-${entries[index + 1].id}`)
    }
  }

  const handleAmountKeyPress = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      focusRef(`note-${id}`)
    }
  }

  const handleNoteKeyPress = (e, id) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const index = entries.findIndex((entry) => entry.id === id)
    if (index < entries.length - 1) {
      focusRef(`account-${entries[index + 1].id}`)
    } else {
      // Last row: add a new one and focus its account field once it has rendered
      const next = createEmptyRow(entries.length + 1)
      pendingFocus.current = `account-${next.id}`
      setEntries((prev) => [...prev, next])
    }
  }

  const handleSubmit = async () => {
    const found = {}
    if (!voucherData.date) found.date = 'Select the date'
    if (!voucherData.credit_debit_mode)
      found.credit_debit_mode = 'Select the transaction mode (Given / Received)'
    const validEntries = entries.filter((e) => e.customer_account_number && e.amount)
    if (validEntries.length === 0)
      found.entries = 'Add at least one entry with an account number and an amount'
    setErrors(found)
    if (Object.keys(found).length) return

    setSaving(true)
    const savedIds = []
    try {
      for (const entry of validEntries) {
        const res = await submitCashEntry({
          date: DateFormate(voucherData.date),
          amount: entry.amount,
          credit_debit_mode: voucherData.credit_debit_mode,
          note: entry.note || '',
          customer_account_number: entry.customer_account_number
        })
        if (res.status_code !== 200) {
          CustomToast.error(
            res.message || `Failed to save entry for account ${entry.customer_account_number}`
          )
          return
        }
        savedIds.push(entry.id)
      }
      CustomToast.success('All entries saved successfully')
      handleReset()
    } catch (error) {
      console.error('Submit error:', error)
      CustomToast.error('Error saving entries')
    } finally {
      // Rows saved before a failure are cleared so retrying does not record them twice
      if (savedIds.length && savedIds.length < validEntries.length) {
        setEntries((prev) =>
          prev.map((e) => (savedIds.includes(e.id) ? { ...createEmptyRow(e.sr_no), id: e.id } : e))
        )
        CustomToast.warn(`${savedIds.length} entries were saved and cleared from the sheet`)
      }
      setSaving(false)
    }
  }

  const rowCols = [
    { key: 'sr_no', header: 'Sr.' },
    {
      key: 'account',
      header: 'Account No.',
      render: (entry) => (
        <Input
          type="text"
          aria-label={`Account number, row ${entry.sr_no}`}
          placeholder="A/c No."
          value={entry.customer_account_number}
          onChange={(e) => handleCellChange(entry.id, 'customer_account_number', e.target.value)}
          onKeyDown={(e) => handleAccountKeyPress(e, entry.id)}
          onBlur={(e) => handleAccountBlur(entry.id, e.target.value)}
          ref={(el) => (inputRefs.current[`account-${entry.id}`] = el)}
          className="!h-9 !py-1 w-32 text-[13px] font-semibold"
        />
      )
    },
    {
      key: 'customer_name',
      header: 'Customer Name',
      render: (entry) => (
        <span className={entry.customer_name ? 'font-semibold' : 'ui-text-tertiary'}>
          {entry.customer_name || '—'}
        </span>
      )
    },
    {
      key: 'amount',
      header: `Amount (${money(total)})`,
      className: 'text-right',
      render: (entry) => (
        <Input
          type="number"
          step="0.01"
          aria-label={`Amount, row ${entry.sr_no}`}
          placeholder="0.00"
          value={entry.amount}
          onChange={(e) => handleCellChange(entry.id, 'amount', e.target.value)}
          onKeyDown={(e) => handleAmountKeyPress(e, entry.id)}
          ref={(el) => (inputRefs.current[`amount-${entry.id}`] = el)}
          className="!h-9 !py-1 w-36 text-right text-[13px]"
        />
      )
    },
    {
      key: 'note',
      header: 'Note',
      render: (entry) => (
        <Input
          type="text"
          aria-label={`Note, row ${entry.sr_no}`}
          placeholder="Description..."
          value={entry.note}
          onChange={(e) => handleCellChange(entry.id, 'note', e.target.value)}
          onKeyDown={(e) => handleNoteKeyPress(e, entry.id)}
          ref={(el) => (inputRefs.current[`note-${entry.id}`] = el)}
          className="!h-9 !py-1 min-w-[12rem] text-[13px]"
        />
      )
    },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-right',
      render: (entry) =>
        entries.length > MIN_ROWS ? (
          <IconButton
            icon={Trash2}
            label="Delete row"
            iconSize={15}
            className="!size-8 hover:!text-[color:var(--ui-danger-600)]"
            onClick={() => handleDeleteRow(entry.id)}
          />
        ) : null
    }
  ]

  return (
    <div className="space-y-5">
      <SectionCard
        title="Manual Cash Entry"
        subtitle="Voucher with many transactions — Enter moves through the sheet"
        icon={FileText}
        tone="accent"
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={Trash2}
              onClick={() => setConfirmClear(true)}
            >
              Delete All
            </Button>
            <Button size="sm" variant="secondary" icon={RotateCcw} onClick={handleReset}>
              Reset
            </Button>
            <Button size="sm" variant="success" icon={Save} loading={saving} onClick={handleSubmit}>
              Save
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-3">
          <Input
            label="Date"
            required
            type="date"
            value={voucherData.date}
            onChange={(e) => {
              setVoucherData({ ...voucherData, date: e.target.value })
              setErrors((p) => ({ ...p, date: undefined }))
            }}
            max={today}
            error={errors.date}
          />
          <SelectDropdown
            label="Transaction Mode"
            required
            options={MODES}
            value={voucherData.credit_debit_mode}
            placeholder="Select Mode"
            onChange={(value) => {
              setVoucherData({ ...voucherData, credit_debit_mode: value })
              setErrors((p) => ({ ...p, credit_debit_mode: undefined }))
            }}
            error={errors.credit_debit_mode}
          />
          <div className="sm:pt-6">
            <Button
              type="button"
              variant="secondary"
              icon={Plus}
              onClick={handleAddRow}
              className="w-full"
            >
              Add Row
            </Button>
          </div>
        </div>

        {errors.entries && (
          <div
            role="alert"
            className="ui-tint-danger mt-4 flex items-center gap-2 rounded-lg px-4 py-3 text-[13px] font-medium"
          >
            <TriangleAlert size={16} aria-hidden="true" />
            {errors.entries}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Entries"
        subtitle={`${entries.filter((e) => e.customer_account_number && e.amount).length} filled · total ${money(total)}`}
        icon={FileText}
        tone="info"
      >
        <DataTable
          stickyHeader
          className="max-h-[65vh] overflow-y-auto px-1"
          minWidth="780px"
          columns={rowCols}
          rows={entries}
          rowKey={(e) => e.id}
        />
      </SectionCard>

      <ConfirmActionModal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={handleDeleteAll}
        tone="danger"
        icon={X}
        title="Clear all entries?"
        message="This removes every row on the sheet."
        confirmLabel="Clear all"
      />
    </div>
  )
}

export default ManualEntries
