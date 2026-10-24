/* eslint-disable react/prop-types -- EditCashModal is internal to this page */
import { useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Banknote, Pencil, Save, Scale, Trash2, X } from 'lucide-react'
import CustomToast from '../../helper/costomeToast'
import useHomeStore from '../../zustand/useHomeStore'
import DateFormate from '../../helper/DateFormate'
import {
  Badge,
  Button,
  DataTable,
  DeleteConfirmModal,
  IconBadge,
  IconButton,
  Input,
  KpiCard,
  Modal,
  PageLoader,
  Pagination,
  SectionCard,
  SelectDropdown,
  toInputDate
} from '../../components/ui'

const MODES = [
  { value: 'received', label: 'Received' },
  { value: 'given', label: 'Given' }
]
const PAGE_SIZE = 25
const money = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const EditCashModal = ({ entry, onClose, onSaved }) => {
  const updateCashEntry = useHomeStore((state) => state.updateCashEntry)
  const fetchCustomerDetailsByAccount = useHomeStore((state) => state.fetchCustomerDetailsByAccount)
  const [form, setForm] = useState({})
  const [errors, setErrors] = useState({})
  const [customerName, setCustomerName] = useState('')
  const [accountError, setAccountError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!entry) return
    setErrors({})
    setAccountError('')
    setCustomerName(entry.customer?.name || '')
    setForm({
      date: toInputDate(entry.date),
      amount: entry.amount,
      credit_debit_mode: entry.credit_debit_mode,
      note: entry.note || '',
      customer_account_number: entry.customer_account_number,
      entry_id: entry.id
    })
  }, [entry])

  // Show who the new account number belongs to
  useEffect(() => {
    const account = String(form.customer_account_number ?? '').trim()
    if (!entry || !account || account === String(entry.customer_account_number)) {
      setAccountError('')
      if (entry && account === String(entry.customer_account_number))
        setCustomerName(entry.customer?.name || '')
      return undefined
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetchCustomerDetailsByAccount(account)
        if (res.status_code == 200) {
          setAccountError('')
          setCustomerName(res.data?.name || '')
        } else {
          setAccountError(res.message || 'Customer not found')
          setCustomerName('')
        }
      } catch {
        setAccountError('Failed to look up the customer')
        setCustomerName('')
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [form.customer_account_number])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const found = {}
    if (!form.date) found.date = 'Select the date'
    if (!String(form.customer_account_number ?? '').trim())
      found.customer_account_number = 'Enter the account number'
    else if (accountError) found.customer_account_number = accountError
    if (!(parseFloat(form.amount) > 0)) found.amount = 'Enter an amount greater than 0'
    if (!form.credit_debit_mode) found.credit_debit_mode = 'Select a type'
    setErrors(found)
    if (Object.keys(found).length) return

    const payload = {
      date: DateFormate(form.date),
      amount: form.amount,
      credit_debit_mode: form.credit_debit_mode,
      note: form.note,
      customer_account_number: form.customer_account_number
    }

    try {
      setSaving(true)
      const res = await updateCashEntry(form.entry_id, payload)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        onSaved()
      } else {
        CustomToast.error(res.message)
      }
    } catch {
      CustomToast.error('Failed to update entry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={!!entry}
      onClose={onClose}
      ariaLabel="Edit cash entry"
      maxWidth="40rem"
      dismissible={!saving}
      className="flex max-h-[90vh] flex-col overflow-hidden"
    >
      <form onSubmit={handleSave} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="ui-border-subtle flex items-center gap-3 border-b px-6 py-4">
          <IconBadge icon={Pencil} tone="primary" />
          <div className="min-w-0 flex-1">
            <h2 className="ui-font-display text-[16px] font-bold">Edit Cash Entry</h2>
            <p className="ui-text-tertiary truncate text-[12px]">
              {entry ? `Entry #${entry.id}` : ''}
            </p>
          </div>
          <IconButton icon={X} label="Close" disabled={saving} onClick={onClose} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Account No"
              required
              type="text"
              name="customer_account_number"
              value={form.customer_account_number ?? ''}
              onChange={handleChange}
              error={errors.customer_account_number || accountError}
            />
            <Input
              label="Customer"
              type="text"
              value={customerName}
              readOnly
              disabled
              placeholder="—"
            />
            <Input
              label="Date"
              required
              type="date"
              name="date"
              value={form.date ?? ''}
              onChange={handleChange}
              error={errors.date}
            />
            <Input
              label="Amount"
              required
              type="number"
              step="any"
              name="amount"
              value={form.amount ?? ''}
              onChange={handleChange}
              error={errors.amount}
            />
            <SelectDropdown
              label="Type"
              required
              name="credit_debit_mode"
              options={MODES}
              value={form.credit_debit_mode ?? ''}
              placeholder="Select type"
              onChange={(value) => handleChange({ target: { name: 'credit_debit_mode', value } })}
              error={errors.credit_debit_mode}
            />
            <Input
              label="Note"
              type="text"
              name="note"
              value={form.note ?? ''}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="ui-border-subtle flex justify-end gap-2 border-t px-6 py-4">
          <Button variant="secondary" disabled={saving} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" icon={Save} loading={saving}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}

/**
 * Cash entries list shared by Cash Correction and the Cash Entry window: filters, KPI cards, paged table,
 * edit dialog and delete confirmation. It loads the data itself.
 *
 * @param {number} [refreshToken] Change it to make the panel reload.
 * @param {boolean} [showWallet] Adds the customer's wallet column.
 * @param {(loading: boolean) => void} [onLoadingChange] Reports when a load starts and finishes.
 */
const CashEntriesPanel = ({ refreshToken = 0, showWallet = false, onLoadingChange }) => {
  const allCashEntries = useHomeStore((state) => state.getAllCashEntries)
  const deleteCashEntries = useHomeStore((state) => state.deleteCashEntries)

  const [allEntries, setAllEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [deleteEntry, setDeleteEntry] = useState(null)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ accountNumber: '', customerName: '', date: '' })

  const cashEntriesAllDataFetch = async () => {
    try {
      setLoading(true)
      onLoadingChange?.(true)
      const res = await allCashEntries()
      setAllEntries(res.status_code == 200 ? res.data : [])
    } catch (error) {
      console.error('API error: ', error)
      CustomToast.error('Something went wrong while fetching data.')
    } finally {
      setLoading(false)
      onLoadingChange?.(false)
    }
  }

  useEffect(() => {
    cashEntriesAllDataFetch()
  }, [refreshToken])

  const filteredEntries = useMemo(
    () =>
      allEntries.filter((entry) => {
        const matchAccount = filters.accountNumber
          ? String(entry.customer_account_number).includes(filters.accountNumber)
          : true
        const matchName = filters.customerName
          ? entry.customer?.name?.toLowerCase().includes(filters.customerName.toLowerCase())
          : true
        const matchDate = filters.date ? toInputDate(entry.date) === filters.date : true
        return matchAccount && matchName && matchDate
      }),
    [allEntries, filters]
  )

  const stats = useMemo(() => {
    const sum = (mode) =>
      filteredEntries
        .filter((e) => e.credit_debit_mode === mode)
        .reduce((total, e) => total + Number(e.amount || 0), 0)
    const received = sum('received')
    const given = sum('given')
    return { received, given, net: received - given }
  }, [filteredEntries])

  const pageCount = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const pageRows = filteredEntries
    .slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
    .map((entry, i) => ({ ...entry, sr: (current - 1) * PAGE_SIZE + i + 1 }))

  const setFilter = (name) => (e) => {
    setFilters((prev) => ({ ...prev, [name]: e.target.value }))
    setPage(1)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await deleteCashEntries(deleteEntry.id)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        setDeleteEntry(null)
        cashEntriesAllDataFetch()
      } else {
        CustomToast.error(res.message)
      }
    } catch {
      CustomToast.error('Failed to delete entry')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'sr', header: '#' },
    {
      key: 'customer_account_number',
      header: 'Account',
      render: (entry) => (
        <span className="ui-text-brand font-bold">{entry.customer_account_number}</span>
      )
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (entry) => <span className="font-semibold">{entry.customer?.name || '-'}</span>
    },
    ...(showWallet
      ? [
          {
            key: 'wallet',
            header: 'Wallet',
            className: 'text-right',
            render: (entry) => (
              <span className="font-semibold text-[color:var(--ui-info-600)]">
                ₹{entry.customer?.wallet || '0'}
              </span>
            )
          }
        ]
      : []),
    { key: 'date', header: 'Date' },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (entry) => <span className="font-bold">₹{entry.amount}</span>
    },
    {
      key: 'credit_debit_mode',
      header: 'Type',
      render: (entry) => (
        <Badge tone={entry.credit_debit_mode === 'received' ? 'success' : 'danger'} dot={false}>
          {entry.credit_debit_mode === 'received' ? 'Received' : 'Given'}
        </Badge>
      )
    },
    {
      key: 'note',
      header: 'Note',
      render: (entry) => (
        <span className="ui-text-tertiary block max-w-[16rem] truncate">{entry.note || '-'}</span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (entry) => (
        <div className="flex justify-end gap-0.5">
          <IconButton
            icon={Pencil}
            label="Edit"
            iconSize={15}
            className="!size-8"
            onClick={() => setEditingEntry(entry)}
          />
          <IconButton
            icon={Trash2}
            label="Delete"
            iconSize={15}
            className="!size-8 hover:!text-[color:var(--ui-danger-600)]"
            onClick={() => setDeleteEntry(entry)}
          />
        </div>
      )
    }
  ]

  return (
    <>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <KpiCard label="Entries" value={filteredEntries.length} icon={Banknote} tone="primary" />
          <KpiCard
            label="Received"
            value={money(stats.received)}
            icon={ArrowDownLeft}
            tone="success"
          />
          <KpiCard label="Given" value={money(stats.given)} icon={ArrowUpRight} tone="danger" />
          <KpiCard
            label="Net"
            value={money(stats.net)}
            icon={Scale}
            tone={stats.net >= 0 ? 'info' : 'warning'}
          />
        </div>

        <SectionCard
          title="Cash Entries"
          subtitle="Filter, then edit or delete an entry"
          icon={Banknote}
          tone="info"
        >
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input
              type="text"
              aria-label="Filter by account number"
              placeholder="Filter by Account No."
              value={filters.accountNumber}
              onChange={setFilter('accountNumber')}
            />
            <Input
              type="text"
              aria-label="Filter by customer name"
              placeholder="Filter by Customer Name"
              value={filters.customerName}
              onChange={setFilter('customerName')}
            />
            <Input
              type="date"
              aria-label="Filter by date"
              value={filters.date}
              onChange={setFilter('date')}
            />
          </div>

          {loading ? (
            <PageLoader variant="inline" label="Loading cash entries" />
          ) : (
            <>
              <DataTable
                stickyHeader
                className="max-h-[60vh] overflow-y-auto px-1"
                minWidth={showWallet ? '900px' : '820px'}
                columns={columns}
                rows={pageRows}
                emptyMessage="No cash entries found"
              />
              <Pagination
                page={current}
                pageSize={PAGE_SIZE}
                total={filteredEntries.length}
                onPageChange={setPage}
                itemLabel="entries"
                className="mt-2"
              />
            </>
          )}
        </SectionCard>
      </div>

      <EditCashModal
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSaved={() => {
          setEditingEntry(null)
          cashEntriesAllDataFetch()
        }}
      />

      <DeleteConfirmModal
        isOpen={!!deleteEntry}
        loading={deleting}
        onClose={() => setDeleteEntry(null)}
        onConfirm={handleDelete}
        title="Delete Cash Entry"
        message={`Are you sure you want to delete this cash entry of ₹${deleteEntry?.amount ?? ''}? This action cannot be undone.`}
      />
    </>
  )
}

export default CashEntriesPanel
