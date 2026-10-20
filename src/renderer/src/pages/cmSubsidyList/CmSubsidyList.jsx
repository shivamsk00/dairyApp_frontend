import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import {
  BarChart3,
  Calendar,
  Download,
  FileText,
  IndianRupee,
  Milk,
  Phone,
  RotateCcw,
  Search,
  Users
} from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import { toast } from 'react-toastify'
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  DataTable,
  IconBadge,
  Input,
  KpiCard,
  SectionCard,
  SelectDropdown,
  PageLoader,
  SurfaceCard,
  useDocumentTitle
} from '../../components/ui'
import logExport from '../../helper/auditExport'

// Helper functions for date handling
// Local calendar date as YYYY-MM-DD. (toISOString() is UTC, which is the previous day before 5:30 AM IST.)
const toLocalISO = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

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

const CmSubsidyList = () => {
  useDocumentTitle('CM Subsidy List')
  const fetchCmSubsidyCustomerReport = useHomeStore((state) => state.fetchCmSubsidyCustomerReport)
  const getAllCustomer = useHomeStore((state) => state.getAllCustomer)

  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [reportData, setReportData] = useState([])
  const [originalReportData, setOriginalReportData] = useState([])
  const [summaryData, setSummaryData] = useState(null)
  const [originalSummaryData, setOriginalSummaryData] = useState(null)
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [subsidyAmount, setSubsidyAmount] = useState('') // NEW: Added subsidy amount state

  // Date filter form
  const [dateForm, setDateForm] = useState({
    term: 'date_range',
    start_date: getToday(),
    end_date: getToday()
  })

  // Fetch customers and filter only those with subsidy codes
  const fetchCustomersWithSubsidy = async () => {
    if (loading) return

    try {
      setLoading(true)
      const response = await getAllCustomer('')

      if (response && response.status_code == 200) {
        // Filter customers who have subsidy_code (not null, not empty, not "N/A")
        const subsidyCustomers = response.data.filter(
          (customer) =>
            customer.subsidy_code &&
            customer.subsidy_code.trim() !== '' &&
            customer.subsidy_code !== null &&
            customer.subsidy_code.toLowerCase() !== 'n/a'
        )

        subsidyCustomers.sort((a, b) => {
          // Handle null or undefined subsidy_code by treating them as large numbers
          const codeA = a.subsidy_code ? Number(a.subsidy_code) : Number.MAX_SAFE_INTEGER
          const codeB = b.subsidy_code ? Number(b.subsidy_code) : Number.MAX_SAFE_INTEGER
          return codeA - codeB
        })

        setCustomers(subsidyCustomers)
        setFilteredCustomers(subsidyCustomers)
      } else {
        console.error('API Error:', response)
        CustomToast.error(response?.message || 'Failed to fetch customers')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      CustomToast.error('Failed to load customer data')
    } finally {
      setLoading(false)
    }
  }

  // Handle date form changes
  const handleDateChange = (e) => {
    const { name, value } = e.target
    setDateForm((prev) => ({ ...prev, [name]: value }))
  }

  // Update date range based on term selection
  useEffect(() => {
    if (dateForm.term === 'this_week') {
      const { start, end } = getWeekRange()
      setDateForm((prev) => ({ ...prev, start_date: start, end_date: end }))
    } else if (dateForm.term === 'this_month') {
      const { start, end } = getMonthRange()
      setDateForm((prev) => ({ ...prev, start_date: start, end_date: end }))
    } else if (dateForm.term === 'date_range') {
      const today = getToday()
      setDateForm((prev) => ({ ...prev, start_date: today, end_date: today }))
    }
  }, [dateForm.term])

  // Fetch report data for all CM subsidy customers
  const handleGenerateReportData = async () => {
    try {
      setLoading(true)
      const payload = {
        start_date: formatInputDate(dateForm.start_date),
        end_date: formatInputDate(dateForm.end_date)
      }

      const response = await fetchCmSubsidyCustomerReport(payload)

      if (response && response.status_code === 200) {
        setReportData(response.data)
        setOriginalReportData(response.data)
        setSummaryData(response.summary || null)
        setOriginalSummaryData(response.summary || null)
        toast.success('Report data loaded successfully')
      } else {
        toast.error(response?.message || 'Failed to fetch report')
      }
    } catch (error) {
      console.error('Error generating report data:', error)
      toast.error('Failed to generate report data')
      setReportData([])
    } finally {
      setLoading(false)
    }
  }

  // Reset date filter
  const handleResetDateFilter = () => {
    const today = getToday()
    setDateForm({
      term: 'date_range',
      start_date: today,
      end_date: today
    })
    setReportData([])
    setOriginalReportData([])
    setSummaryData(null)
    setOriginalSummaryData(null)
    setSubsidyAmount('') // NEW: Reset subsidy amount
    setSearchTerm('')
    setFilteredCustomers(customers)
  }

  // Search function
  const handleSearch = (value) => {
    setSearchTerm(value)

    const filtered = customers.filter((customer) => {
      const searchValue = value.toLowerCase()
      return (
        customer.name?.toLowerCase().includes(searchValue) ||
        customer.account_number?.toString().includes(searchValue) ||
        customer.subsidy_code?.toLowerCase().includes(searchValue) ||
        customer.mobile?.toString().includes(searchValue) ||
        customer.email?.toLowerCase().includes(searchValue) ||
        customer.address?.toLowerCase().includes(searchValue)
      )
    })

    setFilteredCustomers(filtered)
  }

  // Recalculate fat and snf based on target averages and original data
  const recalculateReportData = (targetAvgFat, targetAvgSnf) => {
    const origAvgFat = parseFloat(originalSummaryData?.avg_fat) || 0
    const origAvgSnf = parseFloat(originalSummaryData?.avg_snf) || 0

    const deltaFat = (parseFloat(targetAvgFat) || 0) - origAvgFat
    const deltaSnf = (parseFloat(targetAvgSnf) || 0) - origAvgSnf

    const updated = originalReportData.map((item) => {
      const origFat = parseFloat(item.fat) || 0
      const origSnf = parseFloat(item.snf) || 0
      return {
        ...item,
        fat: Math.max(0, origFat + deltaFat).toFixed(2),
        snf: Math.max(0, origSnf + deltaSnf).toFixed(2)
      }
    })
    setReportData(updated)
  }

  const handleAvgFatChange = (newAvgFatVal) => {
    setSummaryData((prev) => ({ ...prev, avg_fat: newAvgFatVal }))
    recalculateReportData(newAvgFatVal, summaryData?.avg_snf || 0)
  }

  const handleAvgSnfChange = (newAvgSnfVal) => {
    setSummaryData((prev) => ({ ...prev, avg_snf: newAvgSnfVal }))
    recalculateReportData(summaryData?.avg_fat || 0, newAvgSnfVal)
  }

  // NEW: Handle Excel Export
  const handleExportExcel = () => {
    if (reportData.length === 0) {
      toast.error('No data to export')
      return
    }

    const dataToExport = reportData.map((item) => {
      const uploaderCode =
        subsidyByAccount.get(String(item.farmer_code)) || item.uploader_code || ''

      return {
        'Customer Name': item.customer_name || '-',
        'Bank Account': item.bank_account || '-',
        'Document Date': item.document_date,
        Shift: item.shift === 'Morning' ? 'M' : 'E',
        'Uploader code': uploaderCode,
        'Farmer code': item.farmer_code,
        UOM: item.uom,
        'Milk Type': item.milk_type === 'cow' ? 'C' : 'B',
        'Milk Qty': item.milk_qty,
        'Fat %': item.fat,
        'SNF %': item.snf
      }
    })

    // Calculate totals for the footer row
    if (reportData.length > 0) {
      const totalMilkQty = reportData.reduce(
        (sum, item) => sum + (parseFloat(item.milk_qty) || 0),
        0
      )

      // Add empty row for spacing
      dataToExport.push({})

      // Add Total Row
      dataToExport.push({
        'Customer Name': '',
        'Bank Account': '',
        'Document Date': 'GRAND TOTAL',
        Shift: '',
        'Uploader code': '',
        'Farmer code': '',
        UOM: '',
        'Milk Type': '',
        'Milk Qty':
          summaryData && summaryData.total_qty !== undefined
            ? summaryData.total_qty
            : Number(totalMilkQty.toFixed(2)),
        'Fat %': summaryData && summaryData.avg_fat !== undefined ? summaryData.avg_fat : '',
        'SNF %': summaryData && summaryData.avg_snf !== undefined ? summaryData.avg_snf : ''
      })
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CM Subsidy Customers')

    // Generate filename with date
    const fileName = `CM_Subsidy_List_${getToday()}.xlsx`

    XLSX.writeFile(workbook, fileName)
    logExport('CM Subsidy List', 'xlsx')
    toast.success('Excel file downloaded successfully')
  }

  const isDateFormValid = dateForm.start_date && dateForm.end_date

  // account number -> subsidy code, for the report's "Uploader Code" column
  const subsidyByAccount = useMemo(
    () => new Map(customers.map((c) => [String(c.account_number), c.subsidy_code])),
    [customers]
  )

  useEffect(() => {
    fetchCustomersWithSubsidy()
  }, [])

  const inRange =
    !dateForm.start_date || !dateForm.end_date || dateForm.start_date <= dateForm.end_date
  const rowsTotalQty = reportData.reduce((sum, item) => sum + (parseFloat(item.milk_qty) || 0), 0)
  const totalQty =
    summaryData?.total_qty !== undefined ? parseFloat(summaryData.total_qty) || 0 : rowsTotalQty
  const uom = reportData[0]?.uom || 'LTR'
  const subsidyRate = parseFloat(subsidyAmount) || 0
  const hasReport = reportData.length > 0

  const subsidyCode = (value) =>
    value ? (
      <span className="ui-badge ui-soft-primary inline-flex font-mono">{value}</span>
    ) : (
      <span className="ui-text-tertiary">—</span>
    )

  const customerColumns = [
    { key: 'sr', header: 'Sr.' },
    {
      key: 'account_number',
      header: 'Acc. No.',
      render: (row) => <span className="ui-text-brand font-semibold">{row.account_number}</span>
    },
    {
      key: 'name',
      header: 'Customer Name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.name || 'C'} className="size-8 text-[11px]" />
          <span className="font-semibold">{row.name}</span>
        </div>
      )
    },
    {
      key: 'subsidy_code',
      header: 'CM Subsidy Code',
      render: (row) => subsidyCode(row.subsidy_code)
    },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (row) => (
        <a
          href={`tel:${row.mobile}`}
          className="inline-flex items-center gap-1.5 hover:text-[color:var(--ui-primary-600)]"
        >
          <Phone size={12} className="ui-text-tertiary" aria-hidden="true" />
          {row.mobile}
        </a>
      )
    }
  ]

  const reportColumns = [
    { key: 'sr', header: 'Sr.' },
    {
      key: 'customer_name',
      header: 'Customer Name',
      render: (item) => <span className="font-semibold">{item.customer_name || '-'}</span>
    },
    {
      key: 'bank_account',
      header: 'Bank Account',
      render: (item) => <span className="font-mono">{item.bank_account || '-'}</span>
    },
    { key: 'document_date', header: 'Document Date' },
    {
      key: 'shift',
      header: 'Shift',
      render: (item) => (
        <Badge tone={item.shift === 'Morning' ? 'accent' : 'info'} dot={false} title={item.shift}>
          {item.shift === 'Morning' ? 'M' : 'E'}
        </Badge>
      )
    },
    {
      key: 'uploader_code',
      header: 'Uploader Code',
      render: (item) =>
        subsidyCode(subsidyByAccount.get(String(item.farmer_code)) || item.uploader_code)
    },
    {
      key: 'farmer_code',
      header: 'Farmer Code',
      render: (item) => (
        <span className="ui-bg-sunken inline-flex rounded px-2 py-0.5 font-mono text-[11.5px]">
          {item.farmer_code}
        </span>
      )
    },
    { key: 'uom', header: 'UOM' },
    {
      key: 'milk_type',
      header: 'Milk Type',
      render: (item) => (
        <Badge tone="neutral" dot={false} title={item.milk_type}>
          {item.milk_type === 'cow' ? 'C' : 'B'}
        </Badge>
      )
    },
    {
      key: 'milk_qty',
      header: 'Milk Qty',
      className: 'text-right',
      render: (item) => <span className="ui-text-brand font-bold">{item.milk_qty}</span>
    },
    { key: 'fat', header: 'Fat %', className: 'text-right' },
    { key: 'snf', header: 'SNF %', className: 'text-right' }
  ]

  const numberRows = (list) => list.map((row, index) => ({ ...row, _sr: index + 1 }))
  const withSr = (columns) =>
    columns.map((column) =>
      column.key === 'sr'
        ? { ...column, render: (row) => <span className="ui-text-tertiary">{row._sr}</span> }
        : column
    )

  return (
    <div className="w-full ui-text-primary">
      <Breadcrumb
        title="CM Subsidy"
        items={[
          { label: 'Home', to: '/' },
          { label: 'Customers', to: '/customer' },
          { label: 'CM Subsidy' }
        ]}
        actions={
          <>
            <Button size="sm" variant="success" icon={Download} onClick={handleExportExcel}>
              Export Excel
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={Calendar}
              onClick={() => setShowDateFilter(!showDateFilter)}
            >
              {showDateFilter ? 'Hide' : 'Show'} Report Filter
            </Button>
          </>
        }
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <KpiCard
            label="Subsidy Customers"
            value={customers.length}
            icon={Users}
            tone="info"
            details={[{ label: 'Shown', value: filteredCustomers.length }]}
          />
          <KpiCard
            label="Report Entries"
            value={hasReport ? reportData.length : '—'}
            icon={FileText}
            tone="primary"
            details={[
              {
                label: 'Period',
                value: hasReport
                  ? `${formatInputDate(dateForm.start_date)} → ${formatInputDate(dateForm.end_date)}`
                  : 'Not generated'
              }
            ]}
          />
          <KpiCard
            label="Total Milk"
            value={hasReport ? `${totalQty.toFixed(2)} ${uom}` : '—'}
            icon={Milk}
            tone="success"
            details={
              hasReport
                ? [
                    { label: 'Avg Fat', value: summaryData?.avg_fat || '—' },
                    { label: 'Avg SNF', value: summaryData?.avg_snf || '—' }
                  ]
                : []
            }
          />
          <KpiCard
            label="Estimated Subsidy"
            value={
              hasReport && subsidyRate > 0
                ? `₹${(totalQty * subsidyRate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '—'
            }
            icon={IndianRupee}
            tone="accent"
            details={[
              {
                label: 'Rate per unit',
                value: subsidyRate > 0 ? `₹${subsidyRate}` : 'Enter in the filter'
              }
            ]}
          />
        </div>

        {showDateFilter && (
          <SectionCard
            title="Milk Collection Report"
            subtitle="Pick a period, then generate the report for all subsidy customers"
            icon={BarChart3}
            tone="primary"
            action={hasReport && <Badge tone="success">{reportData.length} entries</Badge>}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Input
                label="From Date"
                type="date"
                name="start_date"
                value={dateForm.start_date}
                onChange={handleDateChange}
                readOnly={dateForm.term !== 'date_range'}
              />
              <Input
                label="To Date"
                type="date"
                name="end_date"
                value={dateForm.end_date}
                onChange={handleDateChange}
                readOnly={dateForm.term !== 'date_range'}
                error={inRange ? undefined : 'End date must be on or after the start date'}
              />
              <SelectDropdown
                label="Select Term"
                name="term"
                value={dateForm.term}
                options={[
                  { value: 'date_range', label: 'Date Range' },
                  { value: 'this_week', label: 'This Week' },
                  { value: 'this_month', label: 'This Month' }
                ]}
                onChange={(value) => handleDateChange({ target: { name: 'term', value } })}
              />
              <Input
                label="Subsidy Amount (₹)"
                type="number"
                min="0"
                value={subsidyAmount}
                onChange={(e) => setSubsidyAmount(e.target.value)}
                placeholder="Per unit of milk"
              />
              <div className="flex items-end gap-2">
                <Button
                  className="flex-1"
                  icon={BarChart3}
                  loading={loading}
                  disabled={!isDateFormValid || !inRange}
                  onClick={handleGenerateReportData}
                >
                  Generate
                </Button>
                <Button variant="secondary" icon={RotateCcw} onClick={handleResetDateFilter}>
                  Reset
                </Button>
              </div>
            </div>
          </SectionCard>
        )}

        {!hasReport && (
          <SurfaceCard className="p-3 sm:p-4">
            <div className="relative">
              <Search
                size={15}
                className="ui-text-tertiary pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                type="search"
                aria-label="Search subsidy customers"
                placeholder="Search by name, account number, subsidy code, mobile, email, address…"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="!pl-9"
              />
            </div>
          </SurfaceCard>
        )}

        {loading && (
          <SurfaceCard>
            <PageLoader
              variant="inline"
              label={
                hasReport ? 'Generating report for all customers' : 'Loading CM subsidy customers'
              }
              className="!py-12"
            />
          </SurfaceCard>
        )}

        {!loading && !hasReport && filteredCustomers.length === 0 && (
          <SurfaceCard className="px-6 py-14 text-center">
            <IconBadge
              icon={Users}
              tone="neutral"
              variant="tint"
              size="xl"
              shape="circle"
              className="mx-auto mb-3"
            />
            <p className="ui-font-display text-[15px] font-bold">No CM subsidy customers found</p>
            <p className="ui-text-tertiary mt-1 text-[12.5px]">
              {searchTerm
                ? 'Try a different search.'
                : 'Customers with a CM subsidy code will appear here.'}
            </p>
          </SurfaceCard>
        )}

        {!loading && !hasReport && filteredCustomers.length > 0 && (
          <SurfaceCard className="overflow-hidden">
            <DataTable
              className="max-h-[62vh] overflow-y-auto px-2"
              minWidth="640px"
              columns={withSr(customerColumns)}
              rows={numberRows(filteredCustomers)}
            />
          </SurfaceCard>
        )}

        {!loading && hasReport && (
          <SurfaceCard className="overflow-hidden">
            <DataTable
              className="max-h-[62vh] overflow-y-auto px-2"
              minWidth="1100px"
              columns={withSr(reportColumns)}
              rows={numberRows(reportData)}
              rowKey={(row) => row._sr}
            />
            <div className="ui-border-subtle flex flex-col gap-3 border-t px-4 py-3 md:flex-row md:items-center md:justify-between">
              <p className="ui-text-tertiary text-[12px]">
                Showing <strong className="ui-text-secondary">{reportData.length}</strong> records
                from{' '}
                <strong className="ui-text-secondary">
                  {formatInputDate(dateForm.start_date)}
                </strong>{' '}
                to{' '}
                <strong className="ui-text-secondary">{formatInputDate(dateForm.end_date)}</strong>
              </p>
              {summaryData && (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px]">
                  <span>
                    <span className="ui-text-tertiary font-semibold">Total Qty: </span>
                    <strong className="text-[color:var(--ui-success-600)]">
                      {summaryData.total_qty} {uom}
                    </strong>
                  </span>
                  <label className="flex items-center gap-2">
                    <span className="ui-text-tertiary font-semibold">Avg Fat</span>
                    <Input
                      type="number"
                      step="0.01"
                      aria-label="Average fat"
                      value={summaryData.avg_fat || ''}
                      onChange={(e) => handleAvgFatChange(e.target.value)}
                      className="!min-h-8 !w-20 !px-2 !py-1 !text-center !text-[12.5px] !font-bold"
                    />
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="ui-text-tertiary font-semibold">Avg SNF</span>
                    <Input
                      type="number"
                      step="0.01"
                      aria-label="Average SNF"
                      value={summaryData.avg_snf || ''}
                      onChange={(e) => handleAvgSnfChange(e.target.value)}
                      className="!min-h-8 !w-20 !px-2 !py-1 !text-center !text-[12.5px] !font-bold"
                    />
                  </label>
                </div>
              )}
            </div>
          </SurfaceCard>
        )}
      </div>
    </div>
  )
}

export default CmSubsidyList
