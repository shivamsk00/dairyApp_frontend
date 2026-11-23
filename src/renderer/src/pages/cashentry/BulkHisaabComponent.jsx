import { useState } from 'react'
import {
  BarChart3,
  CalendarRange,
  Droplets,
  IndianRupee,
  Save,
  Undo2,
  Users,
  Wallet
} from 'lucide-react'
import CustomToast from '../../helper/costomeToast'
import useHomeStore from '../../zustand/useHomeStore'
import {
  Button,
  DataTable,
  IconButton,
  Input,
  KpiCard,
  SectionCard,
  Select,
  todayISO
} from '../../components/ui'

const money = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const cell = '!h-9 !py-1 text-[12.5px]'

const BulkHisaabComponent = () => {
  // Local calendar day (toISOString() is UTC and gives yesterday before 05:30 IST)
  const today = todayISO()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [milkEntries, setMilkEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState(null)
  const [errors, setErrors] = useState({})

  const dateWiseMilkEntries = useHomeStore((state) => state.dateWiseMilkEntries)
  const bulkRecordPayment = useHomeStore((state) => state.bulkRecordPayment)

  // Fetch milk entries based on date range
  const fetchMilkEntries = async (e) => {
    e?.preventDefault()
    const found = {}
    if (!startDate) found.startDate = 'Select the start date'
    if (!endDate) found.endDate = 'Select the end date'
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      found.endDate = 'End date must be on or after the start date'
    }
    setErrors(found)
    if (Object.keys(found).length) return

    try {
      setLoading(true)
      const res = await dateWiseMilkEntries({ start_date: startDate, end_date: endDate })
      if (res.status_code === 200) {
        setMilkEntries(res.data || [])
        setSummary(res.summary || null)
        // Initialize payment form with empty amounts
        setPayments(
          (res.data || []).map((entry) => ({
            customer_id: entry.customer_id,
            customer_account_number: entry.customer_account_number,
            customer_name: entry.customer_name,
            total_quantity: entry.total_quantity,
            total_amount: entry.total_amount,
            wallet_balance: entry.wallet_balance,
            payment_amount: '',
            credit_debit_mode: 'given',
            mode: 'cash',
            note: ''
          }))
        )
        CustomToast.success('Milk entries loaded successfully')
      } else {
        CustomToast.error(res.message || 'Failed to fetch entries')
        setMilkEntries([])
        setPayments([])
      }
    } catch (error) {
      console.error('Error fetching milk entries:', error)
      CustomToast.error('Error fetching milk entries')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentChange = (index, field, value) => {
    setPayments((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
  }

  const handleResetAmount = (index) => handlePaymentChange(index, 'payment_amount', '')

  // Single API call: save all payments together
  const handleBulkSubmit = async () => {
    const validPayments = payments.filter(
      (p) => p.payment_amount && parseFloat(p.payment_amount) > 0
    )
    if (validPayments.length === 0) {
      return CustomToast.error('Please enter at least one payment amount')
    }

    try {
      setSubmitting(true)
      const payload = {
        start_date: startDate,
        end_date: endDate,
        payments: validPayments.map((p) => ({
          customer_id: p.customer_id,
          customer_account_number: p.customer_account_number,
          amount: parseFloat(p.payment_amount),
          credit_debit_mode: p.credit_debit_mode,
          mode: p.mode,
          note: p.note,
          total_quantity: p.total_quantity,
          total_amount: p.total_amount
        }))
      }

      const res = await bulkRecordPayment(payload)
      if (res.status_code === 201 || res.status_code === 200) {
        CustomToast.success(
          `✓ Success! ${res.payments_created || validPayments.length} customers processed`
        )
        setPayments([])
        setMilkEntries([])
        setSummary(null)
        setStartDate('')
        setEndDate('')
      } else {
        CustomToast.error(res.message || 'Failed to process payments')
      }
    } catch (error) {
      console.error('Error submitting bulk payment:', error)
      CustomToast.error('Error processing bulk payment')
    } finally {
      setSubmitting(false)
    }
  }

  const totals = payments.reduce(
    (acc, p) => ({
      totalPayment: acc.totalPayment + (parseFloat(p.payment_amount) || 0),
      totalEntries: acc.totalEntries + 1,
      enteredPayments: acc.enteredPayments + (p.payment_amount ? 1 : 0)
    }),
    { totalPayment: 0, totalEntries: 0, enteredPayments: 0 }
  )

  const rows = payments.map((p, i) => ({ ...p, _i: i, sr: i + 1 }))

  const columns = [
    { key: 'sr', header: 'Sr No' },
    {
      key: 'customer_name',
      header: 'Customer Name',
      render: (p) => <span className="font-semibold">{p.customer_name}</span>
    },
    {
      key: 'customer_account_number',
      header: 'A/c',
      render: (p) => <span className="ui-text-brand font-bold">{p.customer_account_number}</span>
    },
    {
      key: 'total_quantity',
      header: 'Milk (L)',
      className: 'text-right',
      render: (p) => p.total_quantity?.toFixed(2)
    },
    {
      key: 'total_amount',
      header: 'Amount',
      className: 'text-right',
      render: (p) => (
        <span className="font-bold text-[color:var(--ui-success-600)]">
          ₹{p.total_amount?.toFixed(2)}
        </span>
      )
    },
    {
      key: 'wallet_balance',
      header: 'Wallet',
      className: 'text-right',
      render: (p) => (
        <span className="font-bold text-[color:var(--ui-info-600)]">
          ₹{parseFloat(p.wallet_balance)?.toFixed(2)}
        </span>
      )
    },
    {
      key: 'payment_amount',
      header: 'Payment',
      render: (p) => (
        <Input
          type="number"
          step="0.01"
          aria-label={`Payment for ${p.customer_name}`}
          placeholder="0.00"
          value={p.payment_amount}
          onChange={(e) => handlePaymentChange(p._i, 'payment_amount', e.target.value)}
          className={`${cell} w-28`}
        />
      )
    },
    {
      key: 'mode',
      header: 'Mode',
      render: (p) => (
        <Select
          aria-label={`Mode for ${p.customer_name}`}
          value={p.mode}
          onChange={(e) => handlePaymentChange(p._i, 'mode', e.target.value)}
          className={cell}
        >
          <option value="cash">Cash</option>
          <option value="bank">Bank</option>
          <option value="cheque">Cheque</option>
        </Select>
      )
    },
    {
      key: 'credit_debit_mode',
      header: 'Type',
      render: (p) => (
        <Select
          aria-label={`Type for ${p.customer_name}`}
          value={p.credit_debit_mode}
          onChange={(e) => handlePaymentChange(p._i, 'credit_debit_mode', e.target.value)}
          className={cell}
        >
          <option value="given">Given</option>
          <option value="received">Received</option>
        </Select>
      )
    },
    {
      key: 'note',
      header: 'Note',
      render: (p) => (
        <Input
          type="text"
          aria-label={`Note for ${p.customer_name}`}
          placeholder="Note..."
          value={p.note}
          onChange={(e) => handlePaymentChange(p._i, 'note', e.target.value)}
          className={`${cell} w-40`}
        />
      )
    },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-right',
      render: (p) => (
        <IconButton
          icon={Undo2}
          label="Reset"
          iconSize={15}
          className="!size-8"
          onClick={() => handleResetAmount(p._i)}
        />
      )
    }
  ]

  return (
    <div className="space-y-5">
      <SectionCard
        title="Bulk Hisaab Kitaab (हिसाब किताब)"
        subtitle="Settle payments for multiple customers in one go"
        icon={BarChart3}
        tone="primary"
      >
        <form
          onSubmit={fetchMilkEntries}
          noValidate
          className="grid grid-cols-1 items-start gap-4 sm:grid-cols-3"
        >
          <Input
            label="Start Date"
            required
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value)
              setErrors((p) => ({ ...p, startDate: undefined }))
            }}
            max={today}
            error={errors.startDate}
          />
          <Input
            label="End Date"
            required
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value)
              setErrors((p) => ({ ...p, endDate: undefined }))
            }}
            max={today}
            error={errors.endDate}
          />
          <div className="sm:pt-6">
            <Button type="submit" icon={CalendarRange} loading={loading} className="w-full">
              {loading ? 'Loading...' : 'Load Customers'}
            </Button>
          </div>
        </form>
      </SectionCard>

      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <KpiCard
            label="Total customers"
            value={summary.total_customers}
            icon={Users}
            tone="primary"
          />
          <KpiCard
            label="Total milk (L)"
            value={summary.total_quantity?.toFixed(2)}
            icon={Droplets}
            tone="info"
          />
          <KpiCard
            label="Total amount"
            value={`₹${summary.total_amount?.toFixed(2)}`}
            icon={IndianRupee}
            tone="success"
          />
          <KpiCard
            label="Entered payments"
            value={`${totals.enteredPayments}/${totals.totalEntries}`}
            icon={Wallet}
            tone="accent"
          />
        </div>
      )}

      {payments.length > 0 && (
        <SectionCard
          title="Payments"
          subtitle={`${totals.enteredPayments} of ${totals.totalEntries} customers have a payment · ${money(totals.totalPayment)} in total`}
          icon={Wallet}
          tone="accent"
          action={
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setPayments([])}>
                Clear All
              </Button>
              <Button
                size="sm"
                variant="success"
                icon={Save}
                loading={submitting}
                disabled={submitting || totals.enteredPayments === 0}
                onClick={handleBulkSubmit}
              >
                {submitting ? 'Processing...' : 'Save All & Update Wallets'}
              </Button>
            </div>
          }
        >
          <DataTable
            stickyHeader
            className="max-h-[65vh] overflow-y-auto px-1"
            minWidth="1100px"
            columns={columns}
            rows={rows}
            rowKey={(p) => `${p.customer_id}-${p._i}`}
          />
        </SectionCard>
      )}

      {!loading && milkEntries.length === 0 && summary === null && (
        <SectionCard
          title="Select dates to load customer data"
          subtitle="Choose a date range to view milk collection and make payments"
          icon={BarChart3}
          tone="neutral"
        >
          <p className="ui-text-tertiary py-6 text-center text-[13px]">No customers loaded yet.</p>
        </SectionCard>
      )}
    </div>
  )
}

export default BulkHisaabComponent
