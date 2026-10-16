import { useState } from 'react'
import { Eye, IndianRupee, Landmark, ReceiptText, RotateCcw, Users, Droplets } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import {
  Breadcrumb,
  Button,
  DataTable,
  Input,
  KpiCard,
  SectionCard,
  todayISO,
  useDocumentTitle
} from '../../components/ui'

const n = (value) => Number(value || 0)
const money = (value) =>
  `₹${n(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const PaymentLedgerPage = () => {
  useDocumentTitle('Payment Register')
  // Local calendar day (toISOString() is UTC and gives yesterday before 05:30 IST)
  const today = todayISO()
  const paymentRegister = useHomeStore((state) => state.paymentRegister)

  const [summaryData, setSummaryData] = useState(null)
  const [generated, setGenerated] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({ start_date: today, end_date: today })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleGenerate = async (e) => {
    e?.preventDefault()
    const found = {}
    if (!form.start_date) found.start_date = 'Select the start date'
    if (!form.end_date) found.end_date = 'Select the end date'
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      found.end_date = 'End date is before the start date'
    }
    setErrors(found)
    if (Object.keys(found).length) return

    setLoading(true)
    try {
      const res = await paymentRegister({ ...form })
      if (
        res &&
        Array.isArray(res.data) &&
        (res.status_code === undefined || res.status_code == 200)
      ) {
        setSummaryData(res.data)
        setGenerated({ ...form })
        CustomToast.success('Payment register generated successfully')
      } else {
        setSummaryData(null)
        setGenerated(null)
        CustomToast.error(res?.message || 'Failed to generate payment register')
      }
    } catch (error) {
      console.error('Error generating payment register:', error)
      CustomToast.error('Failed to generate payment register')
      setSummaryData(null)
      setGenerated(null)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm({ start_date: today, end_date: today })
    setErrors({})
    setSummaryData(null)
    setGenerated(null)
  }

  const rows = (summaryData || []).map((item, i) => ({ ...item, sr: i + 1 }))
  const totals = rows.reduce(
    (sum, item) => ({
      milk: sum.milk + n(item.total_milk_in_ltr),
      payable: sum.payable + n(item.total_payable_amount),
      subsidy: sum.subsidy + n(item.total_other_price),
      grand: sum.grand + n(item.grand_total_amount_in_range)
    }),
    { milk: 0, payable: 0, subsidy: 0, grand: 0 }
  )

  const columns = [
    { key: 'sr', header: 'Sr no.' },
    {
      key: 'customer_account_number',
      header: 'Ac No',
      render: (item) => (
        <span className="ui-text-brand font-bold">{item.customer_account_number}</span>
      )
    },
    {
      key: 'customer_name',
      header: 'Member Name',
      render: (item) => <span className="font-semibold">{item.customer_name}</span>
    },
    {
      key: 'total_milk_in_ltr',
      header: 'Total Quantity (Ltr.)',
      className: 'text-right',
      render: (item) => n(item.total_milk_in_ltr).toFixed(2)
    },
    {
      key: 'total_payable_amount',
      header: 'Amount',
      className: 'text-right',
      render: (item) => n(item.total_payable_amount).toFixed(2)
    },
    { key: 'bank_account', header: 'Bank Acc' },
    { key: 'ifsc_code', header: 'IFSC' },
    { key: 'total_other_price', header: 'CM Subsidy Amount', className: 'text-right' },
    {
      key: 'grand_total_amount_in_range',
      header: 'Total Amount',
      className: 'text-right',
      render: (item) => (
        <span className="font-bold text-[color:var(--ui-success-600)]">
          {n(item.grand_total_amount_in_range).toFixed(2)}
        </span>
      )
    },
    {
      key: 'sign',
      header: 'Member Sign',
      render: () => <span className="ui-text-tertiary">&nbsp;</span>
    }
  ]

  return (
    <div className="ui-text-primary w-full">
      <Breadcrumb
        title="Payment Register"
        items={[{ label: 'Home', to: '/' }, { label: 'Accounts' }, { label: 'Payment Register' }]}
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <SectionCard
          title="Generate Payment Register"
          subtitle="MS, PACCA SAHARANA, 1187 Milk Center / Cooperative Society · 1187, VPO: Pacca Saharana, Hanumangarh"
          icon={ReceiptText}
          tone="primary"
        >
          <form
            onSubmit={handleGenerate}
            noValidate
            className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]"
          >
            <Input
              label="From"
              required
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              error={errors.start_date}
            />
            <Input
              label="To"
              required
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              error={errors.end_date}
            />
            <div className="flex gap-2 sm:col-span-2 sm:pt-6 lg:col-span-1">
              <Button type="submit" icon={Eye} loading={loading}>
                View
              </Button>
              <Button type="button" variant="secondary" icon={RotateCcw} onClick={handleReset}>
                Reset
              </Button>
            </div>
          </form>
        </SectionCard>

        {summaryData && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
            <KpiCard label="Members" value={rows.length} icon={Users} tone="primary" />
            <KpiCard
              label="Total milk"
              value={`${totals.milk.toFixed(2)} L`}
              icon={Droplets}
              tone="info"
            />
            <KpiCard
              label="Amount"
              value={money(totals.payable)}
              icon={IndianRupee}
              tone="accent"
            />
            <KpiCard
              label="CM subsidy"
              value={money(totals.subsidy)}
              icon={Landmark}
              tone="warning"
            />
            <KpiCard
              label="Grand total"
              value={money(totals.grand)}
              icon={IndianRupee}
              tone="success"
              className="col-span-2 lg:col-span-1"
            />
          </div>
        )}

        <SectionCard
          title="Payment Register"
          subtitle={
            generated
              ? `From ${generated.start_date} to ${generated.end_date}`
              : 'Choose a date range and press View'
          }
          icon={ReceiptText}
          tone="info"
        >
          <DataTable
            stickyHeader
            className="max-h-[65vh] overflow-y-auto px-1"
            minWidth="1000px"
            columns={columns}
            rows={rows}
            rowKey={(item, i) => `${item.customer_account_number}-${i}`}
            emptyMessage={
              summaryData
                ? 'No payments in this date range'
                : 'Choose a date range above and press View'
            }
          />
        </SectionCard>
      </div>
    </div>
  )
}

export default PaymentLedgerPage
