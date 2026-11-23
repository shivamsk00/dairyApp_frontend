import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Droplets,
  Download,
  FileText,
  IndianRupee,
  Percent,
  RotateCcw,
  Scale,
  ShoppingCart,
  Wallet,
  Waves
} from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import MergedReportTable from './MergedReportTable'
import { computeTotals, formatDate, mergedEntries } from './reportUtils'
import {
  Badge,
  Breadcrumb,
  Button,
  Input,
  KpiCard,
  SectionCard,
  SelectDropdown,
  toLocalISO,
  useDocumentTitle
} from '../../components/ui'
import logExport from '../../helper/auditExport'

const TERMS = [
  { value: 'date_range', label: 'Date Range' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' }
]

// Local calendar dates (toISOString() is UTC and shifts the day before 05:30 IST)
const getToday = () => toLocalISO(new Date())

const getWeekRange = () => {
  const today = new Date()
  const day = today.getDay() // 0 = Sunday, 1 = Monday
  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - (day === 0 ? 6 : day - 1)
  )
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)
  return { start: toLocalISO(monday), end: toLocalISO(sunday) }
}

const getMonthRange = () => {
  const today = new Date()
  return {
    start: toLocalISO(new Date(today.getFullYear(), today.getMonth(), 1)),
    end: toLocalISO(new Date(today.getFullYear(), today.getMonth() + 1, 0))
  }
}

const formatInputDate = (isoDateStr) => {
  if (!isoDateStr) return ''
  const [yyyy, mm, dd] = isoDateStr.split('-')
  return `${dd}-${mm}-${yyyy}`
}

const money = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const ReportsPage = () => {
  useDocumentTitle('Reports')
  const [summaryData, setSummaryData] = useState(null)
  const [isLoading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    term: 'date_range',
    start_date: getToday(),
    end_date: getToday(),
    customer_account_number: ''
  })

  const reportCustomer = useHomeStore((state) => state.reportCustomer)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  useEffect(() => {
    if (form.term === 'this_week') {
      const { start, end } = getWeekRange()
      setForm((prev) => ({ ...prev, start_date: start, end_date: end }))
    } else if (form.term === 'this_month') {
      const { start, end } = getMonthRange()
      setForm((prev) => ({ ...prev, start_date: start, end_date: end }))
    } else if (form.term === 'date_range') {
      const today = getToday()
      setForm((prev) => ({ ...prev, start_date: today, end_date: today }))
    }
  }, [form.term])

  const handleGenerate = async (e) => {
    e.preventDefault()
    const found = {}
    if (!String(form.customer_account_number).trim())
      found.customer_account_number = 'Enter the customer account number'
    if (!form.start_date) found.start_date = 'Select the start date'
    if (!form.end_date) found.end_date = 'Select the end date'
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      found.end_date = 'End date is before the start date'
    }
    setErrors(found)
    if (Object.keys(found).length) {
      setTimeout(() => document.querySelector('form [aria-invalid="true"]')?.focus(), 0)
      return
    }

    const payload = {
      ...form,
      start_date: formatInputDate(form.start_date),
      end_date: formatInputDate(form.end_date)
    }

    setLoading(true)
    try {
      const res = await reportCustomer(payload)
      if (res?.status_code == 200 && res?.data) {
        setSummaryData(res.data)
        CustomToast.success('Report generated successfully')
      } else {
        setSummaryData(null)
        CustomToast.error(res?.message || 'Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      CustomToast.error('Failed to generate report')
      setSummaryData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    const today = getToday()
    setForm({ term: 'date_range', start_date: today, end_date: today, customer_account_number: '' })
    setErrors({})
    setSummaryData(null)
  }

  const exportToExcel = () => {
    const hasMilk = summaryData?.milk_collections?.length > 0
    const hasProducts = summaryData?.product_sales?.length > 0
    const hasPayments = summaryData?.payments?.length > 0

    if (!hasMilk && !hasProducts && !hasPayments) {
      CustomToast.warn('No data to export')
      return
    }

    const entries = mergedEntries(summaryData)

    const dataToExport = entries.map((entry, index) => {
      const row = {
        'Sr. No': index + 1,
        Date: formatDate(entry.date),
        Shift: '',
        'Quantity (L)': '',
        Fat: '',
        SNF: '',
        Rate: '',
        'Milk Amount': '',
        'Product Name': '',
        'Product Qty': '',
        'Product Amount': '',
        Credit: '',
        Debit: '',
        Message: ''
      }

      if (entry.type === 'milk') {
        row['Shift'] = entry.shift
        row['Quantity (L)'] = parseFloat(entry.quantity).toFixed(2)
        row['Fat'] = parseFloat(entry.fat).toFixed(1)
        row['SNF'] = parseFloat(entry.snf).toFixed(1)
        row['Rate'] = parseFloat(entry.base_rate).toFixed(2)
        row['Milk Amount'] = parseFloat(entry.total_amount).toFixed(2)
      } else if (entry.type === 'product') {
        row['Product Name'] = entry.product?.name || 'N/A'
        row['Product Qty'] = entry.qty
        row['Product Amount'] = parseFloat(entry.total).toFixed(2)
      } else if (entry.type === 'payment') {
        if (entry.credit_debit_mode === 'received') {
          row['Credit'] = parseFloat(entry.amount).toFixed(2)
        } else {
          row['Debit'] = parseFloat(entry.amount).toFixed(2)
        }
        row['Message'] = entry.note || ''
      }

      return row
    })

    const totals = computeTotals(summaryData)

    dataToExport.push({})
    dataToExport.push({
      'Sr. No': '',
      Date: 'SUMMARY',
      Shift: '',
      'Quantity (L)': Number(summaryData?.total_milk_collections || 0).toFixed(2),
      Fat: totals.avgFat.toFixed(2),
      SNF: totals.avgSnf.toFixed(2),
      Rate: '',
      'Milk Amount': totals.milkAmount.toFixed(2),
      'Product Name': '',
      'Product Qty': '',
      'Product Amount': totals.productAmount.toFixed(2),
      Credit: totals.received.toFixed(2),
      Debit: totals.given.toFixed(2),
      Message: `Total Amount: ${totals.totalAmount.toFixed(2)}`
    })

    dataToExport.push({
      'Sr. No': '',
      Date: 'CURRENT BALANCE',
      Shift: '',
      'Quantity (L)': '',
      Fat: '',
      SNF: '',
      Rate: '',
      'Milk Amount': '',
      'Product Name': '',
      'Product Qty': '',
      'Product Amount': '',
      Credit: '',
      Debit: '',
      Message: `₹${parseFloat(summaryData.customer_wallet || 0).toFixed(2)}`
    })

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 8 },
      { wch: 8 },
      { wch: 10 },
      { wch: 12 },
      { wch: 20 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 30 }
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Report')

    const customerName = summaryData.customer_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Customer'
    const dateRange =
      `${formatInputDate(form.start_date)}_to_${formatInputDate(form.end_date)}`.replace(/\//g, '-')
    XLSX.writeFile(workbook, `${customerName}_Report_${dateRange}.xlsx`)
    logExport('Customer Report', 'xlsx')
    CustomToast.success('Report exported successfully')
  }

  const totals = computeTotals(summaryData)
  const milkQty =
    Number.isFinite(Number(summaryData?.total_milk_collections)) &&
    summaryData?.total_milk_collections !== undefined
      ? Number(summaryData.total_milk_collections)
      : totals.milkQty
  const wallet = parseFloat(summaryData?.customer_wallet || 0)
  const accountNo =
    summaryData?.milk_collections?.[0]?.customer_account_number ||
    form.customer_account_number ||
    'N/A'
  const readOnlyDates = form.term !== 'date_range'

  return (
    <div className="ui-text-primary w-full">
      <Breadcrumb
        title="Reports"
        items={[{ label: 'Home', to: '/' }, { label: 'Reports' }]}
        actions={
          summaryData && (
            <Button icon={Download} variant="secondary" onClick={exportToExcel}>
              Export Excel
            </Button>
          )
        }
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <SectionCard
          title="Customer Milk Collection Report"
          subtitle="Milk, product sales and payments for one customer"
          icon={FileText}
          tone="primary"
        >
          <form
            onSubmit={handleGenerate}
            noValidate
            className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <SelectDropdown
              label="Select Term"
              name="term"
              options={TERMS}
              value={form.term}
              onChange={(value) => handleChange({ target: { name: 'term', value } })}
            />
            <Input
              label="From"
              required
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              readOnly={readOnlyDates}
              className={readOnlyDates ? 'bg-[color:var(--ui-surface-sunken)]' : undefined}
              error={errors.start_date}
            />
            <Input
              label="To"
              required
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              readOnly={readOnlyDates}
              className={readOnlyDates ? 'bg-[color:var(--ui-surface-sunken)]' : undefined}
              error={errors.end_date}
            />
            <Input
              label="Customer Ac No"
              required
              type="text"
              name="customer_account_number"
              value={form.customer_account_number}
              onChange={handleChange}
              placeholder="Account Number"
              error={errors.customer_account_number}
            />
            <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-4">
              <Button type="submit" icon={FileText} loading={isLoading}>
                {isLoading ? 'Please wait...' : 'Generate Report'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                icon={RotateCcw}
                disabled={isLoading}
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          </form>
        </SectionCard>

        {summaryData && (
          <>
            <div className="ui-border-subtle ui-bg-raised flex flex-wrap items-center justify-between gap-3 rounded-xl border px-5 py-4">
              <div>
                <p className="ui-font-display text-[17px] font-extrabold">
                  {summaryData.customer_name}
                </p>
                <p className="ui-text-tertiary text-[12.5px]">
                  Acc No. {accountNo} · {formatDate(form.start_date)} to {formatDate(form.end_date)}
                </p>
              </div>
              <Badge tone={wallet < 0 ? 'danger' : 'success'} icon={Wallet} dot={false}>
                Wallet {money(wallet)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              <KpiCard
                label="Milk quantity"
                value={`${milkQty.toFixed(2)} L`}
                icon={Droplets}
                tone="primary"
              />
              <KpiCard
                label="Milk amount"
                value={money(totals.milkAmount)}
                icon={IndianRupee}
                tone="success"
              />
              <KpiCard
                label="Average FAT"
                value={totals.avgFat.toFixed(2)}
                icon={Percent}
                tone="accent"
              />
              <KpiCard
                label="Average SNF"
                value={totals.avgSnf.toFixed(2)}
                icon={Waves}
                tone="info"
              />
              <KpiCard
                label="Product sales"
                value={money(totals.productAmount)}
                icon={ShoppingCart}
                tone="warning"
              />
              <KpiCard
                label="Received"
                value={money(totals.received)}
                icon={ArrowDownLeft}
                tone="success"
              />
              <KpiCard
                label="Given"
                value={money(totals.given)}
                icon={ArrowUpRight}
                tone="danger"
              />
              <KpiCard
                label="Total amount"
                value={money(totals.totalAmount)}
                icon={Scale}
                tone={totals.totalAmount < 0 ? 'danger' : 'primary'}
              />
            </div>

            <SectionCard
              title="Statement"
              subtitle={`${totals.collections} collections · ${totals.productQty} items sold`}
              icon={FileText}
              tone="info"
            >
              <MergedReportTable summaryData={summaryData} />
            </SectionCard>
          </>
        )}
      </div>
    </div>
  )
}

export default ReportsPage
