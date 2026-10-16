/* eslint-disable react/prop-types -- SummaryRow is internal to this page */
import { useState, useEffect } from 'react'
import {
  Eye,
  Loader2,
  Milk,
  Pencil,
  Receipt,
  Save,
  ShoppingBag,
  Trash2,
  Wallet
} from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import useDailyMilkSaleStore from '../../zustand/useDailyMilkSaleStore'
import EditeMilkSale from './EditeMilkSale'
import { MILK_TYPES, PAYMENT_MODES, SHIFTS } from './saleOptions'
import {
  Badge,
  Breadcrumb,
  Button,
  DataTable,
  DeleteConfirmModal,
  DetailList,
  IconBadge,
  IconButton,
  Input,
  Modal,
  Pagination,
  SectionCard,
  SelectDropdown,
  todayISO,
  useDocumentTitle
} from '../../components/ui'

const emptyForm = () => ({
  account_number: '',
  name: '',
  careof: '',
  mobile: '',
  sale_date: todayISO(),
  shift: '',
  milk_type: '',
  quentity: '',
  rate_per_liter: '',
  total_amount: '',
  payment_mode: '',
  notes: ''
})

const money = (value) =>
  `₹${parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// One message per field, or '' when it is fine.
const validateField = (name, value, form) => {
  const text = String(value ?? '').trim()
  switch (name) {
    case 'account_number':
      return !text
        ? 'Enter the account number'
        : !form.name
          ? 'No customer found for this account number'
          : ''
    case 'sale_date':
      return text ? '' : 'Select the sale date'
    case 'shift':
      return text ? '' : 'Select a shift'
    case 'milk_type':
      return text ? '' : 'Select the milk type'
    case 'quentity':
      return !text
        ? 'Enter the quantity'
        : parseFloat(text) > 0
          ? ''
          : 'Quantity must be greater than 0'
    case 'rate_per_liter':
      return !text
        ? 'Enter the rate per liter'
        : parseFloat(text) > 0
          ? ''
          : 'Rate must be greater than 0'
    case 'payment_mode':
      return text ? '' : 'Select the payment mode'
    default:
      return ''
  }
}
const REQUIRED = [
  'account_number',
  'sale_date',
  'shift',
  'milk_type',
  'quentity',
  'rate_per_liter',
  'payment_mode'
]
const validateAll = (form) =>
  REQUIRED.reduce((found, name) => {
    const message = validateField(name, form[name], form)
    return message ? { ...found, [name]: message } : found
  }, {})

const SummaryRow = ({ label, children }) => (
  <div className="ui-border-subtle flex items-center justify-between gap-3 border-b py-2.5 last:border-b-0">
    <dt className="ui-text-tertiary text-[12px] font-semibold">{label}</dt>
    <dd className="text-right text-[13px] font-medium capitalize">
      {children || <span className="ui-text-tertiary">—</span>}
    </dd>
  </div>
)

const MilkSalesPage = () => {
  useDocumentTitle('Daily Milk Sale')
  const fetchCustomerDetailsByAccount = useHomeStore((state) => state.fetchCustomerDetailsByAccount)
  const dailyMilkSaleSubmit = useDailyMilkSaleStore((state) => state.submitDailyMilkSale)
  const getDailyMilkSaleData = useDailyMilkSaleStore((state) => state.getDailyMilkSaleData)
  const updateDailyMilkData = useDailyMilkSaleStore((state) => state.updateDailyMilkData)
  const deleteDailyMilkSaleRecordByID = useDailyMilkSaleStore(
    (state) => state.deleteDailyMilkSaleRecordByID
  )

  const [customerWallet, setCustomerWallet] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dailyMilkCollectionData, setDailyMilkCollectionData] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [listLoading, setListLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [form, setForm] = useState(emptyForm)

  // Total calculate on quantity or rate change
  useEffect(() => {
    const { quentity, rate_per_liter } = form
    if (quentity && rate_per_liter) {
      const total = parseFloat(quentity) * parseFloat(rate_per_liter)
      setForm((prev) => ({ ...prev, total_amount: total.toFixed(2) }))
    } else {
      setForm((prev) => ({ ...prev, total_amount: '' }))
    }
  }, [form.quentity, form.rate_per_liter])

  const setValue = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (touched[name])
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, { ...form, [name]: value })
      }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setValue(name, value)
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value, form) }))
  }

  // Dropdowns have no blur step, so a choice counts as visiting them.
  const choose = (name) => (value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value, form) }))
  }

  // Debounced fetch on account number input
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (form.account_number) {
        fetchCustomerDetailByAccountNumber(form.account_number)
      } else {
        setForm((prev) => ({ ...prev, name: '', careof: '', mobile: '' }))
        setCustomerWallet(null)
      }
    }, 500) // wait 500ms after user stops typing
    return () => clearTimeout(timeout) // cleanup on next input
  }, [form.account_number])

  // FETCH ONE CUSTOMER
  const fetchCustomerDetailByAccountNumber = async (accountNo) => {
    try {
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
        setErrors((prev) => ({ ...prev, account_number: '' }))
      } else {
        CustomToast.error(res.message)
        setForm((prev) => ({ ...prev, name: '', careof: '', mobile: '' }))
        setCustomerWallet(null)
      }
    } catch (error) {
      console.error('Error fetching customer details:', error)
      setForm((prev) => ({ ...prev, name: '', careof: '', mobile: '' }))
    }
  }

  // Data Submit
  const handleDailyMilkSubmit = async (e) => {
    e.preventDefault()
    const found = validateAll(form)
    setErrors(found)
    setTouched(Object.fromEntries(REQUIRED.map((name) => [name, true])))
    const invalid = Object.keys(found)
    if (invalid.length) {
      document.querySelector(`[name="${invalid[0]}"]`)?.focus()
      return
    }

    const dailyMilkSaleData = {
      customer_account_number: form.account_number,
      customer_name: form.name,
      sale_date: form.sale_date,
      shift: form.shift,
      milk_type: form.milk_type,
      quentity: form.quentity,
      rate_per_liter: form.rate_per_liter,
      total_amount: form.total_amount,
      payment_mode: form.payment_mode,
      notes: form.notes
    }

    setSubmitting(true)
    try {
      const res = await dailyMilkSaleSubmit(dailyMilkSaleData)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        if (res.response) CustomToast.success(res.response)
        fetchDailyMilkSaleData()
        setForm(emptyForm())
        setCustomerWallet(null)
        setErrors({})
        setTouched({})
      } else {
        CustomToast.error(res.message)
      }
    } catch (error) {
      console.log('ERROR IN SUBMIT API ', error)
      CustomToast.error('Failed to save the sale')
    } finally {
      setSubmitting(false)
    }
  }

  // ALL DAILY MILK SALE FETCH
  const fetchDailyMilkSaleData = async (page = 1) => {
    try {
      setListLoading(true)
      const res = await getDailyMilkSaleData(page)
      if (res) {
        setDailyMilkCollectionData(res.data)
        setCurrentPage(res.current_page)
        setTotalPages(res.last_page)
      } else {
        CustomToast.error('Failed to load sales')
      }
    } catch (error) {
      console.error('ERROR IN DAILY MILK SALE FETCH DATA API', error)
    } finally {
      setListLoading(false)
    }
  }

  // Update
  const handleUpdate = async (updatedData) => {
    setIsEditModalOpen(false)
    try {
      const res = await updateDailyMilkData(selectedCustomer.id, updatedData)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        fetchDailyMilkSaleData(currentPage)
      } else {
        CustomToast.error(res.message)
      }
    } catch {
      CustomToast.error('Failed to update the sale')
    }
  }

  // delete record by id
  const handleRemove = async () => {
    try {
      const res = await deleteDailyMilkSaleRecordByID(deleteId)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        fetchDailyMilkSaleData(currentPage)
      } else {
        CustomToast.error(res.message)
      }
    } catch {
      CustomToast.error('Failed to delete the sale')
    }
  }

  useEffect(() => {
    fetchDailyMilkSaleData()
  }, [])

  const openView = (item) => {
    setSelectedCustomer(item)
    setIsModalOpen(true)
  }

  const columns = [
    {
      key: 'sr',
      header: 'Sr.',
      render: (item) => <span className="ui-text-tertiary">{item._sr}</span>
    },
    {
      key: 'customer_account_number',
      header: 'Acc. No.',
      render: (item) => (
        <span className="ui-text-brand font-semibold">{item.customer_account_number}</span>
      )
    },
    {
      key: 'customer_name',
      header: 'Customer',
      render: (item) => <span className="font-semibold">{item.customer_name}</span>
    },
    { key: 'sale_date', header: 'Date' },
    {
      key: 'milk_type',
      header: 'Milk Type',
      render: (item) => (
        <Badge tone="info" dot={false}>
          {item.milk_type}
        </Badge>
      )
    },
    { key: 'quentity', header: 'Qty (Ltr)', className: 'text-right' },
    { key: 'rate_per_liter', header: 'Rate (₹)', className: 'text-right' },
    {
      key: 'total_amount',
      header: 'Amount',
      className: 'text-right',
      render: (item) => (
        <span className="font-bold text-[color:var(--ui-success-600)]">
          {money(item.total_amount)}
        </span>
      )
    },
    {
      key: 'shift',
      header: 'Shift',
      render: (item) => (
        <Badge tone={item.shift === 'morning' ? 'accent' : 'primary'} dot={false}>
          {item.shift}
        </Badge>
      )
    },
    {
      key: 'payment_mode',
      header: 'Payment',
      render: (item) => <span className="capitalize">{item.payment_mode}</span>
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (item) => <span className="block max-w-[160px] truncate">{item.notes}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex justify-end gap-0.5">
          <IconButton
            icon={Eye}
            label="View"
            iconSize={15}
            className="!size-8"
            onClick={() => openView(item)}
          />
          <IconButton
            icon={Pencil}
            label="Edit"
            iconSize={15}
            className="!size-8"
            onClick={() => {
              setSelectedCustomer(item)
              setIsEditModalOpen(true)
            }}
          />
          <IconButton
            icon={Trash2}
            label="Delete"
            iconSize={15}
            className="!size-8 hover:!text-[color:var(--ui-danger-600)]"
            onClick={() => {
              setDeleteId(item.id)
              setShowConfirmModal(true)
            }}
          />
        </div>
      )
    }
  ]
  const tableRows = (dailyMilkCollectionData || []).map((item, index) => ({
    ...item,
    _sr: index + 1
  }))
  const walletNegative = parseFloat(customerWallet) < 0

  return (
    <div className="w-full ui-text-primary">
      <Breadcrumb
        title="Daily Milk Sale"
        items={[{ label: 'Home', to: '/' }, { label: 'Milk Center' }, { label: 'Daily Milk Sale' }]}
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <form onSubmit={handleDailyMilkSubmit} noValidate className="lg:col-span-2">
            <SectionCard
              title="Milk Sale Entry"
              subtitle="Record a sale to a customer"
              icon={ShoppingBag}
              tone="primary"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Account Number"
                  required
                  type="text"
                  name="account_number"
                  value={form.account_number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.account_number}
                  autoComplete="off"
                />
                <Input
                  label="Sale Date"
                  required
                  type="date"
                  name="sale_date"
                  value={form.sale_date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.sale_date}
                />
                <Input
                  label="Customer Name"
                  type="text"
                  name="customer_name"
                  value={form.name}
                  readOnly
                  placeholder="Filled from the account number"
                  fieldClassName="sm:col-span-2"
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
                  placeholder="Select type"
                  onChange={choose('milk_type')}
                  error={errors.milk_type}
                />
                <Input
                  label="Quantity (L)"
                  required
                  type="number"
                  name="quentity"
                  min="0"
                  step="any"
                  value={form.quentity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.quentity}
                />
                <Input
                  label="Rate per Liter (₹)"
                  required
                  type="number"
                  name="rate_per_liter"
                  min="0"
                  step="any"
                  value={form.rate_per_liter}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.rate_per_liter}
                />
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
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>
              <div className="ui-border-subtle mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <div>
                  <p className="ui-text-tertiary text-[11px] font-semibold uppercase tracking-wide">
                    Total amount
                  </p>
                  <p className="ui-font-display text-[22px] font-extrabold text-[color:var(--ui-success-600)]">
                    {form.total_amount ? money(form.total_amount) : '—'}
                  </p>
                </div>
                <Button type="submit" icon={Save} loading={submitting}>
                  Submit Sale
                </Button>
              </div>
            </SectionCard>
          </form>

          <SectionCard
            title="Sale Summary"
            subtitle="Live preview of this sale"
            icon={Receipt}
            tone="accent"
            className="lg:col-span-1"
          >
            <div className="ui-bg-sunken mb-3 flex items-center justify-between rounded-lg px-4 py-3">
              <span className="ui-text-tertiary flex items-center gap-2 text-[12px] font-semibold">
                <Wallet size={14} aria-hidden="true" /> Wallet balance
              </span>
              {customerWallet === null ? (
                <span className="ui-text-tertiary text-[13px]">—</span>
              ) : (
                <Badge tone={walletNegative ? 'danger' : 'success'} dot={false}>
                  {money(customerWallet)}
                </Badge>
              )}
            </div>
            <dl>
              <SummaryRow label="Account No">{form.account_number}</SummaryRow>
              <SummaryRow label="Name">{form.name}</SummaryRow>
              <SummaryRow label="Care Of">{form.careof}</SummaryRow>
              <SummaryRow label="Sale Date">{form.sale_date}</SummaryRow>
              <SummaryRow label="Shift">{form.shift}</SummaryRow>
              <SummaryRow label="Milk Type">{form.milk_type}</SummaryRow>
              <SummaryRow label="Quantity (L)">{form.quentity}</SummaryRow>
              <SummaryRow label="Rate (₹/L)">
                {form.rate_per_liter && `₹${form.rate_per_liter}`}
              </SummaryRow>
              <SummaryRow label="Payment Mode">{form.payment_mode}</SummaryRow>
              <SummaryRow label="Notes">{form.notes}</SummaryRow>
              <SummaryRow label="Total Amount">
                <span className="font-bold text-[color:var(--ui-success-600)]">
                  {form.total_amount && money(form.total_amount)}
                </span>
              </SummaryRow>
            </dl>
          </SectionCard>
        </div>

        <SectionCard
          title="Submitted Daily Milk Sales"
          subtitle="Most recent first"
          icon={Milk}
          tone="info"
        >
          {listLoading && tableRows.length === 0 ? (
            <div className="flex items-center justify-center gap-3 py-10">
              <Loader2 size={20} className="ui-text-brand animate-spin" aria-hidden="true" />
              <span className="ui-text-secondary text-[13px]">Loading sales…</span>
            </div>
          ) : (
            <>
              <DataTable
                className="px-1"
                minWidth="1100px"
                columns={columns}
                rows={tableRows}
                onRowClick={openView}
                emptyMessage="कोई डेटा उपलब्ध नहीं है"
              />
              <Pagination
                page={currentPage}
                pageCount={totalPages}
                onPageChange={fetchDailyMilkSaleData}
                className="mt-2"
              />
            </>
          )}
        </SectionCard>
      </div>

      {/* View */}
      <Modal
        isOpen={isModalOpen && !!selectedCustomer}
        onClose={() => setIsModalOpen(false)}
        ariaLabel="Milk sale details"
        maxWidth="40rem"
        className="flex max-h-[90vh] flex-col overflow-hidden"
      >
        {selectedCustomer && (
          <>
            <div className="ui-border-subtle flex items-center gap-4 border-b px-6 py-5">
              <IconBadge icon={Receipt} tone="accent" size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="ui-font-display text-[17px] font-extrabold">Milk Sale Details</h2>
                <p className="ui-text-tertiary truncate text-[12.5px]">
                  {selectedCustomer.customer_name} · A/c {selectedCustomer.customer_account_number}
                </p>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              <DetailList
                items={[
                  ['Sale Date', selectedCustomer.sale_date],
                  ['Shift', selectedCustomer.shift],
                  ['Milk Type', selectedCustomer.milk_type],
                  ['Quantity (Ltr)', selectedCustomer.quentity],
                  ['Rate per Liter (₹)', selectedCustomer.rate_per_liter],
                  ['Total Amount', money(selectedCustomer.total_amount)],
                  ['Payment Mode', selectedCustomer.payment_mode],
                  ['Notes', selectedCustomer.notes],
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
                icon={Pencil}
                onClick={() => {
                  setIsModalOpen(false)
                  setIsEditModalOpen(true)
                }}
              >
                Edit
              </Button>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Edit */}
      <Modal
        isOpen={isEditModalOpen && !!selectedCustomer}
        onClose={() => setIsEditModalOpen(false)}
        ariaLabel="Edit daily milk sale"
        maxWidth="44rem"
        className="flex max-h-[90vh] flex-col overflow-hidden"
      >
        <EditeMilkSale
          dailyMilkSaleId={selectedCustomer}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Delete */}
      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setDeleteId(null)
        }}
        onConfirm={() => {
          handleRemove()
          setShowConfirmModal(false)
          setDeleteId(null)
        }}
        title="Delete Sale"
        message="Are you sure you want to delete this item? This action cannot be undone."
      />
    </div>
  )
}

export default MilkSalesPage
