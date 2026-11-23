// Shared by ReportsPage (summary cards + Excel export) and MergedReportTable.

/** YYYY-MM-DD -> DD-MM-YYYY */
export const formatDate = (dateString) => {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-')
  return `${day}-${month}-${year}`
}

const num = (value) => parseFloat(value || 0)

/**
 * Milk entries carry ISO dates, product sales and payments carry DD-MM-YYYY. Everything is grouped by
 * ISO date and returned oldest first.
 */
export const mergeAllEntriesByDate = (milk, products, payments) => {
  const map = new Map()
  const push = (key, entry) => {
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(entry)
  }

  milk.forEach((entry) => push(entry.date, { type: 'milk', ...entry }))
  products.forEach((entry) =>
    push(entry.date?.split('-').reverse().join('-'), { type: 'product', ...entry })
  )
  payments.forEach((entry) =>
    push(entry.date?.split('-').reverse().join('-'), { type: 'payment', ...entry })
  )

  return [...map.entries()]
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .flatMap(([date, entries]) => entries.map((entry) => ({ ...entry, date })))
}

export const mergedEntries = (summaryData) =>
  mergeAllEntriesByDate(
    summaryData?.milk_collections || [],
    summaryData?.product_sales || [],
    summaryData?.payments || []
  )

/** Totals shown on the report. Total amount = milk + received - products - given. */
export const computeTotals = (summaryData) => {
  const milk = summaryData?.milk_collections || []
  const products = summaryData?.product_sales || []
  const payments = summaryData?.payments || []

  const milkQty = milk.reduce((sum, e) => sum + num(e.quantity), 0)
  const milkAmount = milk.reduce((sum, e) => sum + num(e.total_amount), 0)
  const productAmount = products.reduce((sum, e) => sum + num(e.total), 0)
  const productQty = products.reduce((sum, e) => sum + parseInt(e.qty || 0, 10), 0)
  const received = payments
    .filter((p) => p.credit_debit_mode === 'received')
    .reduce((sum, p) => sum + num(p.amount), 0)
  const given = payments
    .filter((p) => p.credit_debit_mode === 'given')
    .reduce((sum, p) => sum + num(p.amount), 0)
  const fat = milk.reduce((sum, e) => sum + num(e.fat), 0)
  const snf = milk.reduce((sum, e) => sum + num(e.snf), 0)
  const count = milk.length

  return {
    milkQty,
    milkAmount,
    productAmount,
    productQty,
    received,
    given,
    totalAmount: milkAmount + received - productAmount - given,
    avgFat: count > 0 ? fat / count : 0,
    avgSnf: count > 0 ? snf / count : 0,
    avgRate: milkQty > 0 ? milkAmount / milkQty : 0,
    collections: count
  }
}
