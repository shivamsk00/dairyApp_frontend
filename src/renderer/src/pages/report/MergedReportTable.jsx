/* eslint-disable react/prop-types -- props are documented by usage in ReportsPage */
import { Badge, DataTable } from '../../components/ui'
import { formatDate, mergedEntries } from './reportUtils'

const money = (value) => `₹${parseFloat(value).toFixed(2)}`

const TYPE_BADGE = {
  milk: { tone: 'primary', label: 'Milk' },
  product: { tone: 'accent', label: 'Product' },
  payment: { tone: 'success', label: 'Payment' }
}

const MergedTableExact = ({ summaryData }) => {
  if (!summaryData) return null
  const rows = mergedEntries(summaryData).map((entry, i) => ({ ...entry, sr: i + 1 }))

  const columns = [
    { key: 'sr', header: 'Sr.' },
    { key: 'date', header: 'Date', render: (e) => formatDate(e.date) },
    {
      key: 'type',
      header: 'Entry',
      render: (e) => (
        <Badge tone={TYPE_BADGE[e.type].tone} dot={false}>
          {TYPE_BADGE[e.type].label}
        </Badge>
      )
    },
    {
      key: 'shift',
      header: 'Shift',
      render: (e) =>
        e.type === 'milk' ? (
          <Badge tone={e.shift === 'morning' ? 'warning' : 'info'} dot={false}>
            {e.shift}
          </Badge>
        ) : (
          ''
        )
    },
    {
      key: 'quantity',
      header: 'Qty (L)',
      className: 'text-right',
      render: (e) => (e.type === 'milk' ? parseFloat(e.quantity).toFixed(2) : '')
    },
    {
      key: 'fat',
      header: 'Fat',
      className: 'text-right',
      render: (e) => (e.type === 'milk' ? parseFloat(e.fat).toFixed(1) : '')
    },
    {
      key: 'snf',
      header: 'SNF',
      className: 'text-right',
      render: (e) => (e.type === 'milk' ? parseFloat(e.snf).toFixed(1) : '')
    },
    {
      key: 'base_rate',
      header: 'Rate',
      className: 'text-right',
      render: (e) => (e.type === 'milk' ? money(e.base_rate) : '')
    },
    {
      key: 'total_amount',
      header: 'Amount',
      className: 'text-right',
      render: (e) =>
        e.type === 'milk' ? (
          <span className="font-semibold text-[color:var(--ui-success-600)]">
            {money(e.total_amount)}
          </span>
        ) : (
          ''
        )
    },
    {
      key: 'product',
      header: 'Product + Qty',
      render: (e) =>
        e.type === 'product' ? (
          <div>
            <div className="font-medium">{e.product?.name || 'N/A'}</div>
            <div className="ui-text-tertiary text-[11.5px]">Qty: {e.qty}</div>
          </div>
        ) : (
          ''
        )
    },
    {
      key: 'total',
      header: 'Product Amount',
      className: 'text-right',
      render: (e) => (e.type === 'product' ? money(e.total) : '')
    },
    {
      key: 'credit',
      header: 'Credit',
      className: 'text-right',
      render: (e) =>
        e.type === 'payment' && e.credit_debit_mode === 'received' ? (
          <span className="font-semibold text-[color:var(--ui-success-600)]">
            {money(e.amount)}
          </span>
        ) : (
          ''
        )
    },
    {
      key: 'debit',
      header: 'Debit',
      className: 'text-right',
      render: (e) =>
        e.type === 'payment' && e.credit_debit_mode === 'given' ? (
          <span className="font-semibold text-[color:var(--ui-danger-600)]">{money(e.amount)}</span>
        ) : (
          ''
        )
    },
    { key: 'note', header: 'Message', render: (e) => (e.type === 'payment' ? e.note : '') }
  ]

  return (
    <DataTable
      stickyHeader
      className="max-h-[65vh] overflow-y-auto px-1"
      minWidth="1150px"
      columns={columns}
      rows={rows}
      rowKey={(e, i) => `${e.type}-${i}`}
      emptyMessage="No entries in this period"
    />
  )
}

export default MergedTableExact
