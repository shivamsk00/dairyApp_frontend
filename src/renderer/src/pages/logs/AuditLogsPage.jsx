/* eslint-disable react/prop-types -- React 19 ignores propTypes */
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, History, RefreshCw, RotateCcw } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import {
  Badge,
  Breadcrumb,
  Button,
  DataTable,
  Input,
  Modal,
  SectionCard,
  SelectDropdown,
  useDocumentTitle
} from '../../components/ui'

const PAGE_SIZE = 20

const EVENTS = {
  created: { label: 'Created', tone: 'success' },
  updated: { label: 'Updated', tone: 'info' },
  deleted: { label: 'Deleted', tone: 'danger' },
  login: { label: 'Login', tone: 'primary' },
  logout: { label: 'Logout', tone: 'neutral' },
  login_failed: { label: 'Failed login', tone: 'warning' },
  password_changed: { label: 'Password changed', tone: 'accent' },
  export: { label: 'Export', tone: 'accent' }
}

const ENTITIES = {
  milk_collection: 'Milk collection',
  daily_milk_sale: 'Daily milk sale',
  product_sale: 'Product sale',
  payment: 'Payment',
  product: 'Product',
  product_category: 'Product category',
  product_stock: 'Product stock',
  head_dairy: 'Head dairy',
  milk_rate: 'Milk rate',
  snf_chart: 'SNF chart',
  snf_formula: 'SNF formula'
}

const eventOptions = Object.entries(EVENTS).map(([value, { label }]) => ({ value, label }))
const entityOptions = Object.entries(ENTITIES).map(([value, label]) => ({ value, label }))

const formatDateTime = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Summaries read like "Created milk collection #35182"; the record number has its own field.
const plainSummary = (text) =>
  String(text ?? '')
    .replace(/\s*#\d+\b/g, '')
    .trim()

const label = (key) => key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
const show = (v) =>
  v === null || v === undefined || v === ''
    ? '—'
    : typeof v === 'object'
      ? JSON.stringify(v)
      : String(v)

const EventBadge = ({ event }) => {
  const meta = EVENTS[event] || { label: event, tone: 'neutral' }
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}

const emptyFilters = { event: '', entity: '', from: '', to: '' }

const AuditLogsPage = () => {
  useDocumentTitle('Audit Logs')
  const getAuditLogs = useHomeStore((s) => s.getAuditLogs)
  const getAuditLogDetail = useHomeStore((s) => s.getAuditLogDetail)

  const [filters, setFilters] = useState(emptyFilters)
  const [applied, setApplied] = useState(emptyFilters)
  const [errors, setErrors] = useState({})
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  // Cursor paging: cursors[i] is the cursor that opens page i+1 (the first is null).
  const [cursors, setCursors] = useState([null])
  const [pageIndex, setPageIndex] = useState(0)
  const [nextCursor, setNextCursor] = useState(null)

  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const latest = useRef(0)

  const load = useCallback(
    async (cursor, f) => {
      const ticket = ++latest.current
      setLoading(true)
      const res = await getAuditLogs({ ...f, per_page: PAGE_SIZE, cursor })
      if (ticket !== latest.current) return // a newer request replaced this one
      if (res && Array.isArray(res.data)) {
        setRows(res.data)
        setNextCursor(res.meta?.next_cursor || null)
        setFailed(false)
      } else {
        setRows([])
        setNextCursor(null)
        setFailed(true)
      }
      setLoading(false)
    },
    [getAuditLogs]
  )

  useEffect(() => {
    load(null, emptyFilters)
  }, [load])

  const apply = (e) => {
    e?.preventDefault()
    const found = {}
    if (filters.from && filters.to && filters.to < filters.from)
      found.to = 'End date is before the start date'
    setErrors(found)
    if (Object.keys(found).length) return
    setApplied(filters)
    setCursors([null])
    setPageIndex(0)
    load(null, filters)
  }

  const reset = () => {
    setFilters(emptyFilters)
    setApplied(emptyFilters)
    setErrors({})
    setCursors([null])
    setPageIndex(0)
    load(null, emptyFilters)
  }

  // Reload the page being viewed (same filters, same position) to pick up new activity.
  const refresh = () => load(cursors[pageIndex], applied)

  const goNext = () => {
    if (!nextCursor) return
    const next = [...cursors.slice(0, pageIndex + 1), nextCursor]
    setCursors(next)
    setPageIndex(pageIndex + 1)
    load(nextCursor, applied)
  }

  const goPrev = () => {
    if (pageIndex === 0) return
    setPageIndex(pageIndex - 1)
    load(cursors[pageIndex - 1], applied)
  }

  const openDetail = async (row) => {
    setDetail({ ...row })
    setDetailLoading(true)
    const res = await getAuditLogDetail(row.id)
    if (res?.data) setDetail(res.data)
    else CustomToast.error('Could not load the details of this entry')
    setDetailLoading(false)
  }

  const columns = [
    {
      key: 'created_at',
      header: 'When',
      render: (r) => <span className="whitespace-nowrap">{formatDateTime(r.created_at)}</span>
    },
    { key: 'event', header: 'Action', render: (r) => <EventBadge event={r.event} /> },
    {
      key: 'entity',
      header: 'Module',
      render: (r) => (r.entity ? ENTITIES[r.entity] || label(r.entity) : '—')
    },
    {
      key: 'summary',
      header: 'Details',
      render: (r) => <span className="font-semibold">{plainSummary(r.summary)}</span>
    },
    {
      key: 'performed_by',
      header: 'Performed by',
      render: (r) => (
        <div className="leading-tight">
          <div className="font-semibold">{r.performed_by || '—'}</div>
          {r.performed_by_email && (
            <div className="ui-text-tertiary text-[12px]">{r.performed_by_email}</div>
          )}
        </div>
      )
    },
    {
      key: 'ip_address',
      header: 'IP address',
      render: (r) => <span className="ui-text-tertiary">{r.ip_address || '—'}</span>
    },
    {
      key: 'view',
      header: '',
      className: 'text-right',
      render: (r) => (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={Eye}
          onClick={() => openDetail(r)}
        >
          View
        </Button>
      )
    }
  ]

  // Changed fields, old next to new. Create/delete have only one side.
  const changeKeys = detail
    ? Array.from(
        new Set([...Object.keys(detail.old_values || {}), ...Object.keys(detail.new_values || {})])
      )
    : []

  return (
    <div className="ui-text-primary w-full">
      <Breadcrumb
        title="Audit Logs"
        items={[{ label: 'Home', to: '/' }, { label: 'Audit Logs' }]}
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <SectionCard
          title="Filter activity"
          subtitle="Only actions you performed are listed. Entries are permanent and cannot be edited or deleted."
          icon={History}
          tone="primary"
        >
          <form
            onSubmit={apply}
            noValidate
            className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]"
          >
            <SelectDropdown
              label="Action"
              ariaLabel="Action"
              clearable
              placeholder="All actions"
              options={eventOptions}
              value={filters.event}
              onChange={(v) => setFilters((p) => ({ ...p, event: v || '' }))}
            />
            <SelectDropdown
              label="Module"
              ariaLabel="Module"
              clearable
              searchable
              placeholder="All modules"
              options={entityOptions}
              value={filters.entity}
              onChange={(v) => setFilters((p) => ({ ...p, entity: v || '' }))}
            />
            <Input
              label="From"
              type="date"
              value={filters.from}
              onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
            />
            <Input
              label="To"
              type="date"
              value={filters.to}
              error={errors.to}
              onChange={(e) => {
                setFilters((p) => ({ ...p, to: e.target.value }))
                setErrors({})
              }}
            />
            <div className="flex gap-2 sm:col-span-2 sm:pt-6 xl:col-span-1">
              <Button type="submit" icon={Eye} loading={loading}>
                Apply
              </Button>
              <Button type="button" variant="secondary" icon={RotateCcw} onClick={reset}>
                Reset
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Activity log"
          subtitle={`Newest first · ${PAGE_SIZE} per page`}
          icon={History}
          tone="info"
          action={
            <Button
              type="button"
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              loading={loading}
              onClick={refresh}
            >
              Refresh
            </Button>
          }
        >
          <DataTable
            striped
            columns={columns}
            rows={rows}
            minWidth="760px"
            emptyMessage={
              loading
                ? 'Loading…'
                : failed
                  ? 'Could not load the audit log. Please try again.'
                  : 'No activity found'
            }
          />
          <nav
            aria-label="Pagination"
            className="ui-border-subtle mt-3 flex items-center justify-between gap-3 border-t pt-3"
          >
            <p className="ui-text-tertiary text-[12px]">Page {pageIndex + 1}</p>
            <div className="flex gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronLeft}
                disabled={pageIndex === 0 || loading}
                onClick={goPrev}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!nextCursor || loading}
                onClick={goNext}
              >
                Next
                <ChevronRight size={13} aria-hidden="true" />
              </Button>
            </div>
          </nav>
        </SectionCard>
      </div>

      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title="Activity details"
        maxWidth="60rem"
        className="p-5"
      >
        {detail && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <EventBadge event={detail.event} />
              </div>
              <p className="font-semibold">{plainSummary(detail.summary)}</p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] lg:grid-cols-1">
                <div>
                  <dt className="ui-text-tertiary">Performed by</dt>
                  <dd>{show(detail.performed_by)}</dd>
                  <dd className="ui-text-tertiary break-all">{detail.performed_by_email}</dd>
                </div>
                <div>
                  <dt className="ui-text-tertiary">When</dt>
                  <dd>{formatDateTime(detail.created_at)}</dd>
                </div>
                <div>
                  <dt className="ui-text-tertiary">Module</dt>
                  <dd>{detail.entity ? ENTITIES[detail.entity] || label(detail.entity) : '—'}</dd>
                </div>
                <div>
                  <dt className="ui-text-tertiary">Record no.</dt>
                  <dd>{show(detail.entity_id)}</dd>
                </div>
                <div>
                  <dt className="ui-text-tertiary">IP address</dt>
                  <dd>{show(detail.ip_address)}</dd>
                </div>
              </dl>
            </div>

            <div className="ui-scroll-thin h-[min(22rem,55vh)] overflow-y-auto">
              {detailLoading ? (
                <p className="ui-text-tertiary text-[13px]">Loading details…</p>
              ) : changeKeys.length ? (
                <DataTable
                  striped
                  stickyHeader
                  minWidth="420px"
                  rows={changeKeys.map((k) => ({
                    id: k,
                    field: k,
                    before: detail.old_values?.[k],
                    after: detail.new_values?.[k]
                  }))}
                  columns={[
                    {
                      key: 'field',
                      header: 'Field',
                      render: (r) => <span className="font-semibold">{label(r.field)}</span>
                    },
                    {
                      key: 'before',
                      header: detail.old_values ? 'Before' : '',
                      render: (r) => (detail.old_values ? show(r.before) : '')
                    },
                    {
                      key: 'after',
                      header: detail.new_values ? 'After' : '',
                      render: (r) => (detail.new_values ? show(r.after) : '')
                    }
                  ]}
                />
              ) : (
                <p className="ui-text-tertiary text-[13px]">
                  No field changes were recorded for this entry.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AuditLogsPage
