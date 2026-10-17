import { useState } from 'react'
import {
  Droplets,
  Eye,
  IndianRupee,
  Milk,
  Pencil,
  Percent,
  Printer,
  Search,
  Trash2,
  Waves
} from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import DateFormate from '../../helper/DateFormate'
import CustomToast from '../../helper/costomeToast'
import EditMilkCollectionModal from '../milkCollection/EditMilkCollectionPage'
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
  KpiCard,
  Modal,
  Pagination,
  SectionCard,
  SegmentedControl,
  SelectDropdown,
  todayISO,
  useDocumentTitle
} from '../../components/ui'

const SELECTIONS = [
  { value: 'all', label: 'All Records' },
  { value: 'customer', label: 'By Customer' }
]
const PAGE_SIZES = [10, 20, 50, 100].map((n) => ({ value: n, label: `${n} per page` }))

const fmtDate = (value) => {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value || '—' : d.toLocaleDateString('en-IN')
}
const num = (value) => Number(value || 0)

const MilkCorrectionPage = () => {
  useDocumentTitle('Milk Correction')
  const getMilkCorrectionData = useHomeStore((state) => state.getMilkCorrectionData)
  const deleteMilkCollection = useHomeStore((state) => state.deleteMilkCollection)
  // Local calendar day (toISOString() is UTC and gives yesterday before 05:30 IST)
  const today = todayISO()

  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selection, setSelection] = useState('all')
  const [milkData, setMilkData] = useState([])
  const [searchCustomer, setSearchCustomer] = useState('')
  const [form, setForm] = useState({
    start_date: today,
    end_date: today,
    customer_account_number: ''
  })
  const [errors, setErrors] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedMilkEntry, setSelectedMilkEntry] = useState(null)
  const [milkToDelete, setMilkToDelete] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editableEntry, setEditableEntry] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totals, setTotals] = useState({ milk: 0, amount: 0, fat: 0, snf: 0 })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSelectionChange = (value) => {
    setSelection(value)
    setErrors({})
    if (value === 'all') setForm((prev) => ({ ...prev, customer_account_number: '' }))
  }

  const validate = () => {
    const found = {}
    if (!form.start_date) found.start_date = 'Select the start date'
    if (!form.end_date) found.end_date = 'Select the end date'
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      found.end_date = 'End date is before the start date'
    }
    if (selection === 'customer' && !String(form.customer_account_number).trim()) {
      found.customer_account_number = 'Enter the account number'
    }
    return found
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) {
      setTimeout(() => document.querySelector('form [aria-invalid="true"]')?.focus(), 0)
      return
    }

    try {
      setLoading(true)
      const payload = {
        start_date: DateFormate(form.start_date),
        end_date: DateFormate(form.end_date),
        data_type: selection,
        customer_account_number: selection === 'customer' ? form.customer_account_number : ''
      }

      const res = await getMilkCorrectionData(payload)
      if (res?.status_code == 200) {
        setMilkData(res.data?.milk_collections || [])
        setTotals({
          milk: num(res.data?.totalMilk),
          amount: num(res.data?.totalAmount),
          fat: num(res.data?.averageFat),
          snf: num(res.data?.averageSnf)
        })
        setCurrentPage(1)
        setHasSearched(true)
      } else {
        CustomToast.error(res?.message || 'Failed to fetch milk records')
      }
    } catch (error) {
      console.log('ERROR IN MILK CORRECTION PAGE ==>', error)
      CustomToast.error('Something went wrong while fetching records')
    } finally {
      setLoading(false)
    }
  }

  const filteredData = milkData.filter((item) =>
    String(item.customer_account_number ?? '')
      .toLowerCase()
      .includes(searchCustomer.toLowerCase())
  )
  const pageCount = Math.max(1, Math.ceil(filteredData.length / rowsPerPage))
  const page = Math.min(currentPage, pageCount)
  const pageRows = filteredData
    .slice((page - 1) * rowsPerPage, page * rowsPerPage)
    .map((row, i) => ({ ...row, sr: (page - 1) * rowsPerPage + i + 1 }))

  const handlePrint = (data) => {
    const shift = data.shift === 'morning' ? 'M' : 'E'
    const localTime = new Date().toLocaleTimeString('en-IN', {
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
      other_price: data.other_price,
      total: data.total_amount
    }

    if (window.api?.printSlip) window.api.printSlip(slipData)
    else CustomToast.error('Printing is not available')
  }

  const openView = (row) => {
    setSelectedMilkEntry(row)
    setIsModalOpen(true)
  }

  const handleRemove = async () => {
    setDeleting(true)
    try {
      const res = await deleteMilkCollection(milkToDelete?.id)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        setIsConfirmOpen(false)
        setMilkToDelete(null)
        await handleSubmit()
      } else {
        CustomToast.error(res.message)
      }
    } catch (error) {
      console.log('ERROR IN MILK CORRECTION DELETE ROW DATA', error)
      CustomToast.error('Failed to delete the record')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'sr', header: '#' },
    {
      key: 'customer_account_number',
      header: 'Account',
      render: (row) => (
        <span className="ui-text-brand font-bold">{row.customer_account_number}</span>
      )
    },
    { key: 'date', header: 'Date', render: (row) => fmtDate(row.date) },
    {
      key: 'milk_type',
      header: 'Type',
      render: (row) => (
        <Badge tone={row.milk_type === 'cow' ? 'success' : 'warning'} dot={false}>
          {row.milk_type}
        </Badge>
      )
    },
    {
      key: 'shift',
      header: 'Shift',
      render: (row) => (
        <Badge tone={row.shift === 'morning' ? 'accent' : 'primary'} dot={false}>
          {row.shift === 'morning' ? 'Morning' : 'Evening'}
        </Badge>
      )
    },
    { key: 'quantity', header: 'Qty (L)', className: 'text-right' },
    { key: 'fat', header: 'FAT', className: 'text-right' },
    { key: 'snf', header: 'SNF', className: 'text-right' },
    {
      key: 'base_rate',
      header: 'Rate',
      className: 'text-right',
      render: (row) => `₹${row.base_rate}`
    },
    {
      key: 'total_amount',
      header: 'Amount',
      className: 'text-right',
      render: (row) => (
        <span className="font-bold text-[color:var(--ui-success-600)]">₹{row.total_amount}</span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-0.5">
          <IconButton
            icon={Printer}
            label="Print"
            iconSize={15}
            className="!size-8"
            onClick={() => handlePrint(row)}
          />
          <IconButton
            icon={Eye}
            label="View details"
            iconSize={15}
            className="!size-8"
            onClick={() => openView(row)}
          />
          <IconButton
            icon={Pencil}
            label="Edit"
            iconSize={15}
            className="!size-8"
            onClick={() => {
              setEditableEntry(row)
              setIsEditModalOpen(true)
            }}
          />
          <IconButton
            icon={Trash2}
            label="Delete"
            iconSize={15}
            className="!size-8 hover:!text-[color:var(--ui-danger-600)]"
            onClick={() => {
              setMilkToDelete(row)
              setIsConfirmOpen(true)
            }}
          />
        </div>
      )
    }
  ]

  return (
    <div className="ui-text-primary w-full">
      <Breadcrumb
        title="Milk Correction"
        items={[{ label: 'Home', to: '/' }, { label: 'All Correction' }, { label: 'Milk' }]}
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <SectionCard
          title="Find Milk Records"
          subtitle="Pick a date range, then search"
          icon={Search}
          tone="primary"
        >
          <form
            onSubmit={handleSubmit}
            noValidate
            className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_1fr_auto]"
          >
            <Input
              label="From Date"
              required
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              error={errors.start_date}
            />
            <Input
              label="To Date"
              required
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              error={errors.end_date}
            />
            <div>
              <p className="mb-1.5 text-[12.5px] font-semibold">Filter</p>
              <SegmentedControl
                ariaLabel="Filter options"
                options={SELECTIONS}
                value={selection}
                onChange={handleSelectionChange}
              />
            </div>
            {selection === 'customer' ? (
              <Input
                label="Account No."
                required
                type="text"
                name="customer_account_number"
                value={form.customer_account_number}
                onChange={handleChange}
                placeholder="Account No."
                error={errors.customer_account_number}
              />
            ) : (
              <span className="hidden lg:block" />
            )}
            <div className="sm:pt-6">
              <Button type="submit" icon={Search} loading={loading} className="w-full sm:w-auto">
                {loading ? 'Processing...' : 'Search'}
              </Button>
            </div>
          </form>
        </SectionCard>

        {hasSearched && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            <KpiCard
              label="Total milk"
              value={`${totals.milk.toFixed(2)} L`}
              icon={Droplets}
              tone="primary"
            />
            <KpiCard
              label="Total amount"
              value={`₹${totals.amount.toFixed(2)}`}
              icon={IndianRupee}
              tone="success"
            />
            <KpiCard label="Average FAT" value={totals.fat} icon={Percent} tone="accent" />
            <KpiCard label="Average SNF" value={totals.snf} icon={Waves} tone="info" />
          </div>
        )}

        <SectionCard
          title="Milk Collection Records"
          subtitle={
            hasSearched
              ? `${filteredData.length} of ${milkData.length} records`
              : 'Search to load records'
          }
          icon={Milk}
          tone="info"
        >
          {hasSearched && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Input
                type="text"
                aria-label="Search by account number"
                placeholder="Search by account number..."
                value={searchCustomer}
                onChange={(e) => {
                  setSearchCustomer(e.target.value)
                  setCurrentPage(1)
                }}
                fieldClassName="w-52"
              />
              <SelectDropdown
                ariaLabel="Rows per page"
                options={PAGE_SIZES}
                value={rowsPerPage}
                onChange={(n) => {
                  setRowsPerPage(Number(n))
                  setCurrentPage(1)
                }}
                fieldClassName="w-36"
              />
            </div>
          )}
          <DataTable
            stickyHeader
            className="max-h-[60vh] overflow-y-auto px-1"
            minWidth="900px"
            columns={columns}
            rows={pageRows}
            onRowClick={openView}
            emptyMessage={
              hasSearched ? 'No records found' : 'Choose a date range above and press Search'
            }
          />
          <Pagination
            page={page}
            pageSize={rowsPerPage}
            total={filteredData.length}
            onPageChange={setCurrentPage}
            itemLabel="records"
            className="mt-2"
          />
        </SectionCard>
      </div>

      <Modal
        isOpen={isModalOpen && !!selectedMilkEntry}
        onClose={() => setIsModalOpen(false)}
        ariaLabel="Record details"
        maxWidth="40rem"
        className="flex max-h-[90vh] flex-col overflow-hidden"
      >
        {selectedMilkEntry && (
          <>
            <div className="ui-border-subtle flex items-center gap-4 border-b px-6 py-5">
              <IconBadge icon={Eye} tone="primary" size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="ui-font-display text-[17px] font-extrabold">Record Details</h2>
                <p className="ui-text-tertiary text-[12.5px]">
                  A/C {selectedMilkEntry.customer_account_number}
                </p>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              <DetailList
                items={[
                  ['Record ID', selectedMilkEntry.id],
                  ['Account Number', selectedMilkEntry.customer_account_number],
                  ['Date', fmtDate(selectedMilkEntry.date)],
                  ['Milk Type', selectedMilkEntry.milk_type],
                  ['Shift', selectedMilkEntry.shift],
                  ['Quantity (Ltr)', selectedMilkEntry.quantity],
                  ['FAT (%)', selectedMilkEntry.fat],
                  ['SNF (%)', selectedMilkEntry.snf],
                  ['Rate (₹/Ltr)', selectedMilkEntry.base_rate],
                  ['Other Price (₹/Ltr)', selectedMilkEntry.other_price],
                  ['Total Amount (₹)', selectedMilkEntry.total_amount],
                  [
                    'Created At',
                    selectedMilkEntry.created_at
                      ? new Date(selectedMilkEntry.created_at).toLocaleString('en-IN')
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
                  setEditableEntry(selectedMilkEntry)
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

      <EditMilkCollectionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditableEntry(null)
        }}
        milkData={editableEntry}
        onUpdate={() => handleSubmit()}
      />

      <DeleteConfirmModal
        isOpen={isConfirmOpen}
        loading={deleting}
        onClose={() => {
          setIsConfirmOpen(false)
          setMilkToDelete(null)
        }}
        onConfirm={handleRemove}
        title="Delete Record"
        message="Are you sure you want to delete this milk collection record? This action cannot be undone."
      />
    </div>
  )
}

export default MilkCorrectionPage
