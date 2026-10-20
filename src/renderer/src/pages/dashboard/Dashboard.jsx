import { useEffect, useState, useCallback, useMemo, lazy, Suspense } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Milk,
  Package,
  Banknote,
  IndianRupee,
  CalendarDays,
  LineChart,
  Sun,
  Moon,
  Download,
  RefreshCw,
  MoreHorizontal,
  FileSpreadsheet,
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Receipt,
  BookOpen,
  CreditCard,
  ChevronRight,
  Loader2
} from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import useAuthStore from '../../zustand/useAuthStore'
import useUpdateStore from '../../zustand/useUpdateStore'
import UpdateAvailableBanner from '../../components/UpdateAvailableBanner'
import {
  ActionLink,
  Badge,
  BentoGrid,
  Breadcrumb,
  Button,
  CommandPalette,
  DataTable,
  Dropdown,
  ExportModal,
  ExportStatusModal,
  IconBadge,
  IconButton,
  InsightCard,
  KpiCard,
  PageHero,
  SectionCard,
  SurfaceCard,
  useDocumentTitle
} from '../../components/ui'
import logExport from '../../helper/auditExport'

const DashboardChart = lazy(() => import('./DashboardChart'))

const fmt = (value) => Number(value || 0).toFixed(2)
const money = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const percentChange = (current, previous) =>
  previous > 0 ? ((current - previous) / previous) * 100 : null

const MENU_ITEM =
  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium hover:bg-[color:var(--ui-surface-sunken)]'

const QUICK_ACTIONS = [
  { label: 'All Customers', to: '/customer', icon: Users, tone: 'info' },
  { label: 'Add Product', to: '/AddProductPage', icon: Package, tone: 'accent' },
  { label: 'Milk Correction', to: '/milkCorrection', icon: Receipt, tone: 'warning' },
  { label: 'View Reports', to: '/reports', icon: BookOpen, tone: 'primary' },
  { label: 'Cash Entries', to: '/cashentry', icon: CreditCard, tone: 'success' }
]

const Dashboard = () => {
  useDocumentTitle('Dashboard')
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const getDashboardData = useHomeStore((state) => state.fetchDashboardData)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const checkForUpdates = useUpdateStore((state) => state.checkNow)
  const appVersion = useUpdateStore((state) => state.status.currentVersion)
  const [refreshing, setRefreshing] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [quickExport, setQuickExport] = useState(null)

  const fetchDashboardData = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) setLoading(true)
        const res = await getDashboardData()

        if (res.status_code === 200) {
          // Keep the per-shift "today" totals the API returns next to the main payload.
          setDashboardData({
            ...res.data,
            today: {
              morningMilk: res.morning_total_milk,
              eveningMilk: res.evening_total_milk,
              morningAmount: res.morning_total_amount,
              eveningAmount: res.evening_total_amount,
              totalAmount: res.total_amount,
              morningCustomers: res.total_morning_customer,
              eveningCustomers: res.total_evening_customer
            }
          })
        } else {
          if (!isSilent) {
            setError(res.message)
            toast.error(res.message)
          }
        }
      } catch (error) {
        if (!isSilent) {
          setError(error.message)
          toast.error(error.message)
        }
      } finally {
        if (!isSilent) setLoading(false)
      }
    },
    [getDashboardData]
  )

  useEffect(() => {
    fetchDashboardData(false)
  }, [fetchDashboardData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData(true)
    setRefreshing(false)
  }

  // Everything below derives from the API response.
  const stats = useMemo(() => {
    if (!dashboardData) return null
    const { summary, total_milk, last_7_days_shift_data: days = [], today = {} } = dashboardData
    const last = days[days.length - 1]
    const yesterday = days[days.length - 2]

    const todayTotal = total_milk?.total_milk_collected || 0
    const morningToday = today.morningMilk ?? last?.morning_milk ?? 0
    const eveningToday = today.eveningMilk ?? last?.evening_milk ?? 0
    const amountToday = today.totalAmount ?? last?.total_amount ?? 0
    const morningAmount = today.morningAmount ?? last?.morning_amount ?? 0
    const eveningAmount = today.eveningAmount ?? last?.evening_amount ?? 0

    const week = days.reduce(
      (sum, day) => ({
        total: sum.total + day.total_milk,
        morning: sum.morning + day.morning_milk,
        evening: sum.evening + day.evening_milk,
        amount: sum.amount + day.total_amount
      }),
      { total: 0, morning: 0, evening: 0, amount: 0 }
    )
    const best = days.reduce(
      (top, day) => (day.total_milk > (top?.total_milk ?? 0) ? day : top),
      null
    )

    return {
      customers: summary?.customers ?? 0,
      todayTotal,
      morningToday,
      eveningToday,
      amountToday,
      morningAmount,
      eveningAmount,
      morningCustomers: today.morningCustomers,
      eveningCustomers: today.eveningCustomers,
      days,
      week,
      best,
      vsYesterday: percentChange(todayTotal, yesterday?.total_milk),
      amountVsYesterday: percentChange(amountToday, yesterday?.total_amount),
      morningShare: week.total > 0 ? (week.morning / week.total) * 100 : 0,
      eveningShare: week.total > 0 ? (week.evening / week.total) * 100 : 0,
      avgPerDay: days.length ? week.total / days.length : 0,
      avgRate: week.total > 0 ? week.amount / week.total : 0
    }
  }, [dashboardData])

  const chartData = useMemo(
    () => ({
      labels: stats?.days.map((item) => item.day) || [],
      datasets: [
        {
          label: 'Morning Shift (L)',
          data: stats?.days.map((item) => item.morning_milk) || [],
          borderColor: 'hsl(38, 92%, 48%)',
          backgroundColor: 'hsla(38, 92%, 48%, 0.14)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        },
        {
          label: 'Evening Shift (L)',
          data: stats?.days.map((item) => item.evening_milk) || [],
          borderColor: 'hsl(187, 85%, 38%)',
          backgroundColor: 'hsla(187, 85%, 38%, 0.14)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        }
      ]
    }),
    [stats]
  )

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)} L`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: true, color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { callback: (value) => `${value} L` }
      },
      x: { grid: { display: false } }
    }
  }

  const exportRows = () =>
    (stats?.days || []).map((item) => ({
      Date: item.date,
      Day: item.day,
      'Morning (L)': Number(item.morning_milk.toFixed(2)),
      'Evening (L)': Number(item.evening_milk.toFixed(2)),
      'Total (L)': Number(item.total_milk.toFixed(2)),
      'Amount (₹)': Number(item.total_amount.toFixed(2))
    }))

  const runExport = async (format) => {
    const rows = exportRows()
    const name = 'dairy_last_7_days'
    if (format === 'JSON') {
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })
      )
      const link = document.createElement('a')
      link.href = url
      link.download = `${name}.json`
      link.click()
      URL.revokeObjectURL(url)
      logExport('Dashboard - Last 7 Days (JSON)', 'csv', rows.length)
      return
    }
    const XLSX = await import('xlsx')
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Last 7 Days')
    XLSX.writeFile(workbook, `${name}.${format === 'CSV' ? 'csv' : 'xlsx'}`)
    logExport('Dashboard - Last 7 Days', format === 'CSV' ? 'csv' : 'xlsx', rows.length)
  }

  const startQuickExport = async () => {
    setQuickExport('loading')
    try {
      await runExport('Excel')
      setQuickExport('done')
    } catch {
      setQuickExport(null)
      toast.error('Export failed')
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center gap-3 ui-text-secondary">
        <Loader2 size={22} className="animate-spin ui-text-brand" />
        <span className="text-base font-medium">Loading dashboard data...</span>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <SurfaceCard className="max-w-md w-full p-6 text-center">
          <p className="ui-font-display text-[15px] font-bold">Couldn&apos;t load the dashboard</p>
          <p className="mt-1.5 text-[12.5px] text-[color:var(--ui-danger-600)]">{error}</p>
          <Button
            className="mt-5"
            icon={RefreshCw}
            onClick={() => {
              setError(null)
              fetchDashboardData(false)
            }}
          >
            Try again
          </Button>
        </SurfaceCard>
      </div>
    )
  }

  // Wait for data to load
  if (!stats) {
    return null
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'there'
  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const insights = [
    stats.todayTotal === 0
      ? {
          tag: 'Action Needed',
          tone: 'warning',
          icon: Milk,
          text: <>No milk has been collected yet today.</>,
          actionLabel: 'Open collection',
          to: '/milkcollection'
        }
      : stats.vsYesterday !== null && {
          tag: stats.vsYesterday >= 0 ? 'Positive Trend' : 'Heads Up',
          tone: stats.vsYesterday >= 0 ? 'success' : 'warning',
          icon: stats.vsYesterday >= 0 ? TrendingUp : TrendingDown,
          text: (
            <>
              Today&apos;s collection is <strong>{Math.abs(stats.vsYesterday).toFixed(1)}%</strong>{' '}
              {stats.vsYesterday >= 0 ? 'higher' : 'lower'} than yesterday.
            </>
          ),
          actionLabel: 'Milk correction',
          to: '/milkCorrection'
        },
    stats.best &&
      stats.best.total_milk > 0 && {
        tag: 'Best Day',
        tone: 'primary',
        icon: Sparkles,
        text: (
          <>
            <strong>{fmt(stats.best.total_milk)} L</strong> collected on {stats.best.day},{' '}
            {stats.best.date} — your highest this week.
          </>
        ),
        actionLabel: 'View reports',
        to: '/reports'
      },
    stats.week.total > 0 && {
      tag: 'Shift Mix',
      tone: 'info',
      icon: stats.morningShare >= stats.eveningShare ? Sun : Moon,
      text: (
        <>
          The <strong>{stats.morningShare >= stats.eveningShare ? 'morning' : 'evening'}</strong>{' '}
          shift brings in{' '}
          <strong>{Math.max(stats.morningShare, stats.eveningShare).toFixed(1)}%</strong> of this
          week&apos;s milk.
        </>
      )
    },
    stats.week.total > 0 && {
      tag: 'Average Rate',
      tone: 'accent',
      icon: IndianRupee,
      text: (
        <>
          You paid an average of <strong>{money(stats.avgRate)}</strong> per litre over the last 7
          days.
        </>
      ),
      actionLabel: 'Rate chart',
      to: '/ratechart'
    }
  ].filter(Boolean)

  const rows = [
    ...stats.days.map((item) => ({ ...item, id: item.date })),
    {
      id: 'total',
      isTotal: true,
      date: 'Total',
      morning_milk: stats.week.morning,
      evening_milk: stats.week.evening,
      total_milk: stats.week.total,
      total_amount: stats.week.amount
    }
  ]
  const bold = (row, node) => (row.isTotal ? <strong>{node}</strong> : node)

  const paletteGroups = [
    {
      title: 'Navigate',
      items: [
        { id: 'customers', label: 'Customers', icon: Users, to: '/customer', keywords: 'grahak' },
        { id: 'collection', label: 'Milk Collection', icon: Milk, to: '/milkcollection' },
        { id: 'dispatch', label: 'Milk Dispatch', icon: Package, to: '/milkDispatch' },
        { id: 'payments', label: 'Payment Register', icon: IndianRupee, to: '/paymentregister' },
        { id: 'cash', label: 'Cash Entry', icon: Banknote, to: '/cashentry' },
        { id: 'reports', label: 'Reports', icon: BookOpen, to: '/reports' },
        { id: 'ratechart', label: 'Rate Chart', icon: LineChart, to: '/ratechart' },
        { id: 'inventory', label: 'Inventory', icon: Package, to: '/inventory' }
      ]
    },
    {
      title: 'Quick actions',
      items: [
        {
          id: 'export',
          label: 'Export last 7 days',
          icon: Download,
          tone: 'accent',
          onSelect: () => setExportOpen(true)
        },
        {
          id: 'refresh',
          label: 'Refresh dashboard',
          icon: RefreshCw,
          tone: 'success',
          onSelect: handleRefresh
        },
        {
          id: 'update',
          label: 'Check for updates',
          icon: Sparkles,
          tone: 'info',
          onSelect: checkForUpdates
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen relative ui-text-primary">
      <div className="max-w-8xl mx-auto">
        <Breadcrumb
          title="Dashboard"
          items={[{ label: 'Home', to: '/' }, { label: 'Dashboard' }]}
          actions={
            <>
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="ui-bg-raised ui-border-default hidden items-center gap-2 rounded-full border py-1 pl-2.5 pr-1.5 text-[11.5px] font-medium ui-text-tertiary sm:inline-flex"
              >
                <Search size={12} aria-hidden="true" />
                Quick search
                <kbd className="ui-kbd text-[10px]">Ctrl K</kbd>
              </button>
              <button
                type="button"
                onClick={checkForUpdates}
                title="Check for software updates"
                className="ui-bg-raised ui-border-default ui-text-tertiary hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium hover:text-[color:var(--ui-primary-600)] sm:inline-flex"
              >
                <Download size={12} aria-hidden="true" />
                {appVersion ? `v${appVersion} · ` : ''}Check for updates
              </button>
            </>
          }
        />

        <div className="space-y-6 p-3 sm:p-4 lg:p-6">
          <UpdateAvailableBanner />
          <PageHero
            title={`Welcome back, ${displayName}`}
            description={
              stats.todayTotal > 0
                ? `${fmt(stats.todayTotal)} L collected today from ${stats.customers} registered customers.`
                : `No collection recorded yet today. ${stats.customers} customers are registered.`
            }
            chips={[
              { label: 'Live data', icon: Sparkles },
              { label: `${stats.week.total.toFixed(0)} L this week`, icon: CalendarDays }
            ]}
            stats={[
              { label: "Today's Collection", value: `${fmt(stats.todayTotal)} L` },
              { label: "Today's Amount", value: money(stats.amountToday) },
              { label: 'Customers', value: stats.customers }
            ]}
            actions={
              <>
                <Button
                  icon={Download}
                  className="!border-0 bg-white/[0.14] !text-white !shadow-none hover:bg-white/20"
                  onClick={() => setExportOpen(true)}
                >
                  Export Report
                </Button>
                <Button
                  variant="secondary"
                  icon={RefreshCw}
                  loading={refreshing}
                  onClick={handleRefresh}
                >
                  Refresh Data
                </Button>
              </>
            }
            meta={todayLabel}
          />

          <BentoGrid>
            <KpiCard
              className="col-span-12 sm:col-span-6 lg:col-span-3"
              label="Total Customers"
              value={stats.customers}
              icon={Users}
              tone="info"
              details={[
                { label: 'Morning shift', value: stats.morningCustomers ?? '—' },
                { label: 'Evening shift', value: stats.eveningCustomers ?? '—' }
              ]}
            />
            <KpiCard
              className="col-span-12 sm:col-span-6 lg:col-span-3"
              label="Today's Collection"
              value={`${fmt(stats.todayTotal)} L`}
              icon={Milk}
              tone="primary"
              change={
                stats.vsYesterday !== null
                  ? {
                      value: `${Math.abs(stats.vsYesterday).toFixed(1)}%`,
                      direction: stats.vsYesterday >= 0 ? 'up' : 'down'
                    }
                  : undefined
              }
              details={[
                { label: 'Morning', value: `${fmt(stats.morningToday)} L` },
                { label: 'Evening', value: `${fmt(stats.eveningToday)} L` }
              ]}
            />
            <KpiCard
              className="col-span-12 sm:col-span-6 lg:col-span-3"
              label="Today's Amount"
              value={money(stats.amountToday)}
              icon={IndianRupee}
              tone="accent"
              change={
                stats.amountVsYesterday !== null
                  ? {
                      value: `${Math.abs(stats.amountVsYesterday).toFixed(1)}%`,
                      direction: stats.amountVsYesterday >= 0 ? 'up' : 'down'
                    }
                  : undefined
              }
              details={[
                { label: 'Morning', value: money(stats.morningAmount) },
                { label: 'Evening', value: money(stats.eveningAmount) }
              ]}
            />
            <KpiCard
              className="col-span-12 sm:col-span-6 lg:col-span-3"
              label="Last 7 Days"
              value={`${fmt(stats.week.total)} L`}
              icon={LineChart}
              tone="success"
              details={[
                { label: 'Daily average', value: `${fmt(stats.avgPerDay)} L` },
                { label: 'Total paid', value: money(stats.week.amount) }
              ]}
            />

            <SectionCard
              className="col-span-12 lg:col-span-8"
              title="Collection Trend"
              subtitle="Morning vs evening shift, last 7 days"
              icon={LineChart}
              tone="primary"
              action={
                <Dropdown
                  panelClassName="w-56 p-1.5"
                  trigger={({ toggle }) => (
                    <IconButton icon={MoreHorizontal} label="More actions" onClick={toggle} />
                  )}
                >
                  {(close) => (
                    <>
                      <button
                        type="button"
                        className={MENU_ITEM}
                        onClick={() => {
                          close()
                          handleRefresh()
                        }}
                      >
                        <RefreshCw size={15} aria-hidden="true" /> Refresh data
                      </button>
                      <button
                        type="button"
                        className={MENU_ITEM}
                        onClick={() => {
                          close()
                          setExportOpen(true)
                        }}
                      >
                        <Download size={15} aria-hidden="true" /> Export report…
                      </button>
                      <button
                        type="button"
                        className={MENU_ITEM}
                        onClick={() => {
                          close()
                          startQuickExport()
                        }}
                      >
                        <FileSpreadsheet size={15} aria-hidden="true" /> Quick export (Excel)
                      </button>
                    </>
                  )}
                </Dropdown>
              }
            >
              <div style={{ height: '300px' }}>
                <Suspense
                  fallback={<div className="ui-text-tertiary text-[13px]">Loading chart...</div>}
                >
                  <DashboardChart data={chartData} options={chartOptions} />
                </Suspense>
              </div>
            </SectionCard>

            <SectionCard
              className="col-span-12 lg:col-span-4"
              title="Shift Split"
              subtitle="Share of the last 7 days"
              icon={Sun}
              tone="accent"
            >
              <div className="space-y-5">
                {[
                  {
                    label: 'Morning Shift',
                    icon: Sun,
                    tone: 'warning',
                    value: stats.week.morning,
                    share: stats.morningShare,
                    bar: 'var(--ui-accent-500)'
                  },
                  {
                    label: 'Evening Shift',
                    icon: Moon,
                    tone: 'primary',
                    value: stats.week.evening,
                    share: stats.eveningShare,
                    bar: 'var(--ui-primary-600)'
                  }
                ].map((shift) => (
                  <div key={shift.label}>
                    <div className="flex items-center gap-3">
                      <IconBadge icon={shift.icon} tone={shift.tone} variant="tint" />
                      <div className="min-w-0 flex-1">
                        <p className="ui-text-tertiary text-[11.5px]">{shift.label}</p>
                        <p className="ui-font-display text-[18px] font-extrabold leading-tight">
                          {fmt(shift.value)} L
                        </p>
                      </div>
                      <Badge tone={shift.tone === 'warning' ? 'accent' : 'primary'} dot={false}>
                        {shift.share.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="ui-bg-sunken mt-2.5 h-2 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${shift.share}%`, background: shift.bar }}
                      />
                    </div>
                  </div>
                ))}
                <div className="ui-border-subtle flex items-center justify-between border-t pt-3 text-[12px]">
                  <span className="ui-text-tertiary">Total collection</span>
                  <span className="font-semibold">{fmt(stats.week.total)} L</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              className="col-span-12 lg:col-span-4"
              title="Quick Actions"
              subtitle="Frequently used operations"
              icon={Sparkles}
              tone="info"
            >
              <div className="-mx-1.5 space-y-1">
                {QUICK_ACTIONS.map((action) => (
                  <ActionLink
                    key={action.to}
                    to={action.to}
                    activeClassName=""
                    className="group flex items-center gap-3 rounded-lg px-1.5 py-2 text-[13px] font-medium hover:bg-[color:var(--ui-surface-sunken)]"
                  >
                    <IconBadge icon={action.icon} tone={action.tone} variant="tint" size="sm" />
                    <span className="flex-1">{action.label}</span>
                    <ChevronRight
                      size={14}
                      className="ui-text-tertiary transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </ActionLink>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              className="col-span-12 lg:col-span-8"
              title="Insights"
              subtitle="Generated from this week's collection data"
              icon={Sparkles}
              tone="accent"
              action={<Badge tone="success">Live</Badge>}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {insights.map((insight) => (
                  <InsightCard
                    key={insight.tag}
                    tag={insight.tag}
                    tone={insight.tone}
                    icon={insight.icon}
                    actionLabel={insight.actionLabel}
                    onAction={insight.to ? () => navigate(insight.to) : undefined}
                  >
                    {insight.text}
                  </InsightCard>
                ))}
                {insights.length === 0 && (
                  <p className="ui-text-tertiary col-span-full py-4 text-center text-[13px]">
                    Insights will appear once milk has been collected.
                  </p>
                )}
              </div>
            </SectionCard>

            <SectionCard
              className="col-span-12"
              title="Last 7 Days Detailed Report"
              subtitle="Day-wise collection breakdown"
              icon={CalendarDays}
              tone="primary"
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Download}
                  onClick={() => setExportOpen(true)}
                >
                  Export
                </Button>
              }
            >
              <DataTable
                minWidth="680px"
                rows={rows}
                columns={[
                  {
                    key: 'date',
                    header: 'Date',
                    render: (row) => <span className="font-medium">{bold(row, row.date)}</span>
                  },
                  {
                    key: 'day',
                    header: 'Day',
                    render: (row) =>
                      row.isTotal ? null : (
                        <Badge tone="info" dot={false}>
                          {row.day}
                        </Badge>
                      )
                  },
                  {
                    key: 'morning',
                    header: 'Morning (L)',
                    className: 'text-right',
                    render: (row) => bold(row, fmt(row.morning_milk))
                  },
                  {
                    key: 'evening',
                    header: 'Evening (L)',
                    className: 'text-right',
                    render: (row) => bold(row, fmt(row.evening_milk))
                  },
                  {
                    key: 'total',
                    header: 'Total (L)',
                    className: 'text-right font-bold',
                    render: (row) => fmt(row.total_milk)
                  },
                  {
                    key: 'amount',
                    header: 'Amount (₹)',
                    className: 'text-right font-semibold text-[color:var(--ui-success-600)]',
                    render: (row) => money(row.total_amount)
                  }
                ]}
              />
            </SectionCard>
          </BentoGrid>
        </div>
      </div>

      <CommandPalette isOpen={paletteOpen} onOpenChange={setPaletteOpen} groups={paletteGroups} />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Export Last 7 Days"
        formats={[{ value: 'CSV' }, { value: 'Excel', icon: FileSpreadsheet }, { value: 'JSON' }]}
        scopes={[{ value: 'week', label: 'Last 7 days report' }]}
        onExport={(format) => runExport(format)}
      />
      <ExportStatusModal
        isOpen={quickExport !== null}
        status={quickExport || 'loading'}
        format="Excel"
        onClose={() => setQuickExport(null)}
      />
    </div>
  )
}

export default Dashboard
