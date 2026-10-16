/* eslint-disable react/prop-types -- SummaryRow is internal to this page */
import { useState, useEffect, useRef } from 'react'
import {
  Eye,
  Loader2,
  Pencil,
  Plus,
  Receipt,
  Send,
  Trash2,
  Truck,
  TriangleAlert,
  X
} from 'lucide-react'
import useMilkDispatchStore from '../../zustand/useMilkDispatchStore'
import CustomToast from '../../helper/costomeToast'
import useHomeStore from '../../zustand/useHomeStore'
import EditMilkDispatch from './EditMilkDispatch'
import { MILK_TYPES, SHIFTS, emptyMilkRow, money } from './dispatchOptions'
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
  SurfaceCard,
  Textarea,
  todayISO,
  useDocumentTitle
} from '../../components/ui'

const LOCAL_KEY = 'milkDispatchDraft'

const emptyForm = () => ({
  dispatch_date: todayISO(),
  shift: '',
  head_dairy_id: '',
  vehicle_no: '',
  total_qty: '',
  total_amount: '',
  notes: '',
  milk_details: [emptyMilkRow()]
})

// Errors: { dispatch_date, head_dairy_id, shift, rows: [{ milk_type, qty }] }
const validate = (form) => {
  const errors = {}
  if (!form.dispatch_date) errors.dispatch_date = 'Select the dispatch date'
  if (!form.head_dairy_id) errors.head_dairy_id = 'Choose a head dairy'
  if (!form.shift) errors.shift = 'Select a shift'
  const rows = form.milk_details.map((row) => {
    const rowErrors = {}
    if (!row.milk_type) rowErrors.milk_type = 'Select type'
    if (!(parseFloat(row.qty) > 0)) rowErrors.qty = 'Enter quantity'
    return rowErrors
  })
  if (rows.some((r) => Object.keys(r).length)) errors.rows = rows
  return errors
}

const SummaryRow = ({ label, children }) => (
  <div className="ui-border-subtle flex items-center justify-between gap-3 border-b py-2.5 last:border-b-0">
    <dt className="ui-text-tertiary text-[12px] font-semibold">{label}</dt>
    <dd className="text-right text-[13px] font-medium capitalize">
      {children || <span className="ui-text-tertiary">—</span>}
    </dd>
  </div>
)

const MilkDispatchPage = () => {
  useDocumentTitle('Milk Dispatch')
  const submitMilkDispatch = useMilkDispatchStore((state) => state.submitMilkDispatch)
  const getHeadDairyMilkData = useMilkDispatchStore((state) => state.getHeadDairyMilkData)
  const getAllHeadDairyMaster = useHomeStore((state) => state.getAllHeadDairyMaster)
  const deleteHeadDairyMilkDispatch = useMilkDispatchStore(
    (state) => state.deleteHeadDairyMilkDispatch
  )
  const getMilkRate = useHomeStore((state) => state.getMilkRate)

  const [headDairies, setHeadDairies] = useState([])
  const [collections, setCollections] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedHeadDairy, setSelectedHeadDairy] = useState(null)
  const [headDairyToDelete, setHeadDairyToDelete] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedDairy, setSelectedDairy] = useState(null)
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [errors, setErrors] = useState({})
  const [showErrors, setShowErrors] = useState(false)
  const [form, setForm] = useState(emptyForm)
  // One pending rate lookup at a time (a plain variable in the component body is recreated every render,
  // so the old debounce never actually cancelled anything).
  const snfDebounceRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllHeadDairyMaster()
      setHeadDairies(res.data || [])
    }
    fetchData()
  }, [])

  // Auto calculate total qty and amount
  useEffect(() => {
    const totalQty = form.milk_details.reduce((sum, item) => sum + Number(item.qty || 0), 0)
    const totalAmount = form.milk_details.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    setForm((prev) => ({
      ...prev,
      total_qty: totalQty,
      total_amount: totalAmount.toFixed(2)
    }))
  }, [form.milk_details])

  // Re-check after each edit once the user has tried to submit.
  useEffect(() => {
    if (showErrors) setErrors(validate(form))
  }, [form, showErrors])

  const saveDraft = (next) => localStorage.setItem(LOCAL_KEY, JSON.stringify(next))

  const handleFormChange = (e) => {
    const { name, value } = e.target
    const updatedForm = { ...form, [name]: value }
    setForm(updatedForm)
    saveDraft(updatedForm)
  }

  const setField = (name) => (value) => handleFormChange({ target: { name, value } })

  const handleMilkDetailChange = (index, e) => {
    const { name, value } = e.target
    const updatedDetails = form.milk_details.map((row, i) =>
      i === index ? { ...row, [name]: value } : row
    )
    const { qty, fat, clr } = updatedDetails[index]

    // Update amount if qty & rate available
    updatedDetails[index].amount =
      qty && updatedDetails[index].rate
        ? (parseFloat(qty) * parseFloat(updatedDetails[index].rate)).toFixed(2)
        : ''

    // SNF -> rate lookup, debounced
    if (name === 'snf') {
      clearTimeout(snfDebounceRef.current)
      snfDebounceRef.current = setTimeout(() => {
        const snfValue = value.includes('.') ? parseFloat(value) : parseFloat(`${value}.0`)
        if (isNaN(snfValue)) return
        if (!fat) {
          CustomToast.error('⚠️ Please enter FAT value first')
          return
        }
        fetchRateAndUpdate(index, fat, clr || '', snfValue, updatedDetails, qty)
      }, 800)
    }

    const updatedForm = { ...form, milk_details: updatedDetails }
    setForm(updatedForm)
    saveDraft(updatedForm)
  }

  const fetchRateAndUpdate = async (index, fat, clr, snf, updatedDetails, qty) => {
    try {
      const result = await getMilkRate(fat, clr, snf)
      const updatedMilk = { ...updatedDetails[index] }

      if (result?.rate) {
        updatedMilk.rate = parseFloat(result.rate).toFixed(2)
        updatedMilk.amount = qty ? (parseFloat(qty) * result.rate).toFixed(2) : ''
        CustomToast.success('✅ Rate updated')
      } else {
        // No rate found — clear rate & amount
        updatedMilk.rate = ''
        updatedMilk.amount = ''
      }

      setForm((prev) => {
        const updatedMilkDetails = [...prev.milk_details]
        updatedMilkDetails[index] = updatedMilk
        return { ...prev, milk_details: updatedMilkDetails }
      })
    } catch (err) {
      console.error('❌ Error fetching milk rate:', err)
      CustomToast.error('❌ Error fetching milk rate')
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY)
    if (saved) {
      try {
        setForm(JSON.parse(saved))
      } catch {
        localStorage.removeItem(LOCAL_KEY)
      }
    }
    return () => clearTimeout(snfDebounceRef.current)
  }, [])

  const addMilkDetailRow = () => {
    setForm((prev) => ({ ...prev, milk_details: [...prev.milk_details, emptyMilkRow()] }))
  }

  const removeMilkDetailRow = (index) => {
    if (form.milk_details.length > 1) {
      setForm((prev) => ({
        ...prev,
        milk_details: prev.milk_details.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    setShowErrors(true)
    if (Object.keys(found).length) {
      setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0)
      return
    }

    setLoading(true)
    try {
      const res = await submitMilkDispatch(form)
      if (res.status_code === 200) {
        CustomToast.success(res.message)
        fetchMilkCollectionDetails()
        localStorage.removeItem(LOCAL_KEY)
        setForm(emptyForm())
        setShowErrors(false)
        setErrors({})
      } else {
        CustomToast.error(res.message)
      }
    } catch (error) {
      console.error('ERROR IN SUBMIT MILK DISPATCH', error)
      CustomToast.error('❌ Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  // All Data Coming Through this API
  const fetchMilkCollectionDetails = async (page = 1) => {
    try {
      setListLoading(true)
      const res = await getHeadDairyMilkData(page)
      if (res.status_code == 200) {
        setCollections(res.data.data)
        setCurrentPage(res.data.current_page)
        setTotalPages(res.data.last_page)
      } else {
        CustomToast.error(res.message)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    fetchMilkCollectionDetails()
  }, [isEditModalOpen])

  // Delete
  const confirmDeleteHeadDairyMilkDispatch = async () => {
    setDeleting(true)
    try {
      const res = await deleteHeadDairyMilkDispatch(headDairyToDelete?.id)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        fetchMilkCollectionDetails(currentPage)
      } else {
        CustomToast.error(res.message)
      }
    } catch {
      CustomToast.error('Failed to delete the dispatch')
    } finally {
      setDeleting(false)
      setIsConfirmOpen(false)
      setHeadDairyToDelete(null)
    }
  }

  const openView = (item) => {
    setSelectedHeadDairy(item)
    setIsModalOpen(true)
  }

  const headDairyName = headDairies.find(
    (d) => String(d.id) === String(form.head_dairy_id)
  )?.dairy_name
  const first = (item) => item.milk_details?.[0] ?? {}

  const columns = [
    {
      key: 'dairy_name',
      header: 'Head Dairy',
      render: (item) => <span className="font-semibold">{item.dairy_name || '--'}</span>
    },
    { key: 'dispatch_date', header: 'Date', render: (item) => item.dispatch_date || '--' },
    {
      key: 'shift',
      header: 'Shift',
      render: (item) =>
        item.shift ? (
          <Badge tone={item.shift === 'morning' ? 'accent' : 'primary'} dot={false}>
            {item.shift}
          </Badge>
        ) : (
          '--'
        )
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => <span className="capitalize">{first(item).milk_type || '--'}</span>
    },
    {
      key: 'qty',
      header: 'Qty',
      className: 'text-right',
      render: (item) => first(item).qty || '--'
    },
    {
      key: 'fat',
      header: 'Fat',
      className: 'text-right',
      render: (item) => first(item).fat || '--'
    },
    {
      key: 'snf',
      header: 'SNF',
      className: 'text-right',
      render: (item) => first(item).snf || '--'
    },
    {
      key: 'rate',
      header: 'Rate',
      className: 'text-right',
      render: (item) => (first(item).rate ? `₹${first(item).rate}` : '--')
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (item) =>
        first(item).amount ? (
          <span className="font-bold text-[color:var(--ui-success-600)]">
            ₹{first(item).amount}
          </span>
        ) : (
          '--'
        )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex justify-end gap-0.5">
          <IconButton
            icon={Eye}
            label="View details"
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
              setSelectedDairy(item)
              setIsEditModalOpen(true)
            }}
          />
          <IconButton
            icon={Trash2}
            label="Delete"
            iconSize={15}
            className="!size-8 hover:!text-[color:var(--ui-danger-600)]"
            onClick={() => {
              setHeadDairyToDelete(item)
              setIsConfirmOpen(true)
            }}
          />
        </div>
      )
    }
  ]

  return (
    <div className="w-full ui-text-primary">
      <Breadcrumb
        title="Milk Dispatch"
        items={[{ label: 'Home', to: '/' }, { label: 'Milk Center' }, { label: 'Milk Dispatch' }]}
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <form onSubmit={handleSubmit} noValidate className="space-y-5 lg:col-span-2">
            <SectionCard
              title="Dispatch Entry"
              subtitle="Milk sent to a head dairy"
              icon={Truck}
              tone="primary"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Dispatch Date"
                  required
                  type="date"
                  name="dispatch_date"
                  value={form.dispatch_date}
                  onChange={handleFormChange}
                  error={errors.dispatch_date}
                />
                <SelectDropdown
                  label="Shift"
                  required
                  name="shift"
                  options={SHIFTS}
                  value={form.shift}
                  placeholder="Select shift"
                  onChange={setField('shift')}
                  error={errors.shift}
                />
                <SelectDropdown
                  label="Head Dairy"
                  required
                  name="head_dairy_id"
                  searchable
                  options={headDairies.map((d) => ({ value: d.id, label: d.dairy_name }))}
                  value={form.head_dairy_id}
                  placeholder="Choose head dairy"
                  onChange={setField('head_dairy_id')}
                  error={errors.head_dairy_id}
                />
                <Input
                  label="Vehicle No."
                  type="text"
                  name="vehicle_no"
                  value={form.vehicle_no}
                  onChange={handleFormChange}
                />
                <Textarea
                  label="Notes"
                  rows={2}
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  fieldClassName="sm:col-span-2"
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Milk Details"
              subtitle="Add a row for each kind of milk in this dispatch"
              icon={Receipt}
              tone="accent"
              action={
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  icon={Plus}
                  onClick={addMilkDetailRow}
                >
                  Add Row
                </Button>
              }
            >
              <div className="space-y-3">
                {form.milk_details.map((item, index) => {
                  const rowErrors = errors.rows?.[index] ?? {}
                  return (
                    <div
                      key={index}
                      className="ui-border-subtle grid grid-cols-2 items-start gap-3 rounded-lg border p-3 md:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_1.2fr_auto]"
                    >
                      <SelectDropdown
                        label="Type"
                        name={`milk_type_${index}`}
                        options={MILK_TYPES}
                        value={item.milk_type}
                        placeholder="Type"
                        onChange={(value) =>
                          handleMilkDetailChange(index, { target: { name: 'milk_type', value } })
                        }
                        error={rowErrors.milk_type}
                      />
                      <Input
                        label="Qty"
                        type="number"
                        name="qty"
                        min="0"
                        step="any"
                        value={item.qty}
                        onChange={(e) => handleMilkDetailChange(index, e)}
                        error={rowErrors.qty}
                      />
                      <Input
                        label="Fat"
                        type="number"
                        name="fat"
                        step="any"
                        value={item.fat}
                        onChange={(e) => handleMilkDetailChange(index, e)}
                      />
                      <Input
                        label="SNF"
                        type="text"
                        name="snf"
                        value={item.snf}
                        onChange={(e) => handleMilkDetailChange(index, e)}
                      />
                      <Input
                        label="Rate"
                        type="number"
                        name="rate"
                        step="any"
                        value={item.rate}
                        onChange={(e) => handleMilkDetailChange(index, e)}
                      />
                      <Input
                        label="Amount"
                        type="number"
                        name="amount"
                        value={item.amount}
                        readOnly
                      />
                      {form.milk_details.length > 1 && index > 0 ? (
                        <IconButton
                          icon={X}
                          label="Remove row"
                          iconSize={16}
                          className="col-span-2 mt-0 w-full md:col-span-1 md:mt-6 hover:!text-[color:var(--ui-danger-600)]"
                          onClick={() => removeMilkDetailRow(index)}
                        />
                      ) : (
                        <span className="hidden md:block md:w-[2.375rem]" />
                      )}
                    </div>
                  )
                })}
              </div>

              {showErrors && Object.keys(errors).length > 0 && (
                <div
                  role="alert"
                  className="ui-tint-danger mt-4 flex items-center gap-2 rounded-lg px-4 py-3 text-[13px] font-medium"
                >
                  <TriangleAlert size={16} aria-hidden="true" />
                  Please fix the highlighted fields and try again.
                </div>
              )}

              <div className="ui-border-subtle mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <div className="flex gap-8">
                  <div>
                    <p className="ui-text-tertiary text-[11px] font-semibold uppercase tracking-wide">
                      Total quantity
                    </p>
                    <p className="ui-font-display text-[20px] font-extrabold">
                      {form.total_qty || 0} L
                    </p>
                  </div>
                  <div>
                    <p className="ui-text-tertiary text-[11px] font-semibold uppercase tracking-wide">
                      Total amount
                    </p>
                    <p className="ui-font-display text-[20px] font-extrabold text-[color:var(--ui-success-600)]">
                      {money(form.total_amount)}
                    </p>
                  </div>
                </div>
                <Button type="submit" icon={Send} loading={loading}>
                  Submit Dispatch
                </Button>
              </div>
            </SectionCard>
          </form>

          <SectionCard
            title="Dispatch Summary"
            subtitle="Live preview"
            icon={Receipt}
            tone="accent"
            className="lg:col-span-1"
          >
            <dl>
              <SummaryRow label="Dispatch Date">{form.dispatch_date}</SummaryRow>
              <SummaryRow label="Shift">{form.shift}</SummaryRow>
              <SummaryRow label="Head Dairy">{headDairyName}</SummaryRow>
              <SummaryRow label="Vehicle No">{form.vehicle_no}</SummaryRow>
              <SummaryRow label="Rows">{form.milk_details.length}</SummaryRow>
              <SummaryRow label="Total Qty">
                <span className="font-bold text-[color:var(--ui-success-600)]">
                  {form.total_qty ? `${form.total_qty} L` : ''}
                </span>
              </SummaryRow>
              <SummaryRow label="Total Amount">
                <span className="font-bold text-[color:var(--ui-success-600)]">
                  {Number(form.total_amount) ? money(form.total_amount) : ''}
                </span>
              </SummaryRow>
              <SummaryRow label="Notes">{form.notes}</SummaryRow>
            </dl>
          </SectionCard>
        </div>

        <SectionCard
          title="Recent Dispatches"
          subtitle="First milk row of each dispatch — open one to see all rows"
          icon={Truck}
          tone="info"
        >
          {listLoading && collections.length === 0 ? (
            <div className="flex items-center justify-center gap-3 py-10">
              <Loader2 size={20} className="ui-text-brand animate-spin" aria-hidden="true" />
              <span className="ui-text-secondary text-[13px]">Loading dispatches…</span>
            </div>
          ) : (
            <>
              <DataTable
                className="px-1"
                minWidth="980px"
                columns={columns}
                rows={collections}
                onRowClick={openView}
                emptyMessage="No dispatches yet"
              />
              <Pagination
                page={currentPage}
                pageCount={totalPages}
                onPageChange={fetchMilkCollectionDetails}
                className="mt-2"
              />
            </>
          )}
        </SectionCard>
      </div>

      {/* Edit */}
      <EditMilkDispatch
        milkDispatchData={selectedDairy}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* View */}
      <Modal
        isOpen={isModalOpen && !!selectedHeadDairy}
        onClose={() => setIsModalOpen(false)}
        ariaLabel="Milk dispatch details"
        maxWidth="44rem"
        className="flex max-h-[90vh] flex-col overflow-hidden"
      >
        {selectedHeadDairy && (
          <>
            <div className="ui-border-subtle flex items-center gap-4 border-b px-6 py-5">
              <IconBadge icon={Truck} tone="primary" size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="ui-font-display text-[17px] font-extrabold">
                  Milk Dispatch Details
                </h2>
                <p className="ui-text-tertiary truncate text-[12.5px]">
                  {selectedHeadDairy.dairy_name}
                </p>
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
              <DetailList
                items={[
                  ['Name', selectedHeadDairy.dairy_name],
                  ['Date', selectedHeadDairy.dispatch_date],
                  ['Shift', selectedHeadDairy.shift],
                  ['Vehicle No.', selectedHeadDairy.vehicle_no],
                  ['Total Qty', selectedHeadDairy.total_qty],
                  ['Total Amount', money(selectedHeadDairy.total_amount)]
                ]}
              />
              {selectedHeadDairy.milk_details?.length > 0 && (
                <div>
                  <p className="ui-text-tertiary mb-2 text-[11px] font-semibold uppercase tracking-wide">
                    Milk details
                  </p>
                  <SurfaceCard className="overflow-hidden">
                    <DataTable
                      minWidth="460px"
                      columns={[
                        {
                          key: 'milk_type',
                          header: 'Type',
                          render: (r) => <span className="capitalize">{r.milk_type}</span>
                        },
                        { key: 'qty', header: 'Qty', className: 'text-right' },
                        { key: 'fat', header: 'Fat', className: 'text-right' },
                        { key: 'snf', header: 'SNF', className: 'text-right' },
                        { key: 'rate', header: 'Rate', className: 'text-right' },
                        { key: 'amount', header: 'Amount', className: 'text-right' }
                      ]}
                      rows={selectedHeadDairy.milk_details.map((r, i) => ({ ...r, id: i }))}
                    />
                  </SurfaceCard>
                </div>
              )}
            </div>
            <div className="ui-border-subtle flex justify-end gap-2 border-t px-6 py-4">
              <Button
                icon={Pencil}
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedDairy(selectedHeadDairy)
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

      {/* Delete */}
      <DeleteConfirmModal
        isOpen={isConfirmOpen}
        loading={deleting}
        onClose={() => {
          setIsConfirmOpen(false)
          setHeadDairyToDelete(null)
        }}
        onConfirm={confirmDeleteHeadDairyMilkDispatch}
        title="Delete Dispatch"
        message="Are you sure you want to delete this dispatch? This action cannot be undone."
      />
    </div>
  )
}

export default MilkDispatchPage
