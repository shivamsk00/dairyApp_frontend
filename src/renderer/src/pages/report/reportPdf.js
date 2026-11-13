/**
 * The HTML of the customer report as it is printed to PDF (see src/main/pdf.js). Plain HTML and CSS with its
 * own styles: it is drawn in a hidden window, not in the app.
 *
 * Every value that comes from the server goes through `esc`, so a name or note with < or & cannot change the
 * page.
 */
import { computeTotals, formatDate, mergedEntries } from './reportUtils'

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const num = (v) => parseFloat(v || 0)
const fixed = (v, d = 2) => num(v).toFixed(d)
const rupees = (v) => `₹${num(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const CSS = `
  * { box-sizing: border-box; }
  body { font: 11px/1.4 "Segoe UI", Arial, sans-serif; color: #1a2530; margin: 0; }
  h1 { font-size: 18px; margin: 0; }
  .dairy { font-size: 12px; color: #4a5a68; margin-bottom: 2px; }
  .head { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #0e8fa3; padding-bottom: 8px; margin-bottom: 10px; }
  .meta { text-align: right; color: #4a5a68; }
  .meta strong { color: #1a2530; font-size: 13px; }
  .cards { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .card { flex: 1 1 11%; min-width: 105px; border: 1px solid #d5dde3; border-radius: 6px; padding: 5px 8px; }
  .card span { display: block; color: #66778a; font-size: 9.5px; }
  .card b { font-size: 13px; }
  .pos { color: #15803d; } .neg { color: #b91c1c; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #0e8fa3; color: #fff; font-size: 10px; text-align: left; padding: 5px 6px; }
  td { padding: 4px 6px; border-bottom: 1px solid #e3e9ee; vertical-align: top; }
  tr:nth-child(even) td { background: #f6f9fb; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  .r { text-align: right; }
  .tag { font-size: 9px; font-weight: 600; text-transform: capitalize; }
  .totals td { font-weight: 700; background: #e8f4f7 !important; border-top: 2px solid #0e8fa3; }
  .empty { padding: 20px; text-align: center; color: #66778a; }
  .foot { margin-top: 10px; font-size: 9.5px; color: #66778a; }
`

const TYPE_LABEL = { milk: 'Milk', product: 'Product', payment: 'Payment' }

const row = (e, i) => {
  const milk = e.type === 'milk'
  const product = e.type === 'product'
  const payment = e.type === 'payment'
  const received = payment && e.credit_debit_mode === 'received'
  const given = payment && e.credit_debit_mode === 'given'
  return `<tr>
    <td>${i + 1}</td>
    <td>${esc(formatDate(e.date))}</td>
    <td class="tag">${TYPE_LABEL[e.type]}</td>
    <td class="tag">${milk ? esc(e.shift) : ''}</td>
    <td class="r">${milk ? fixed(e.quantity) : ''}</td>
    <td class="r">${milk ? fixed(e.fat, 1) : ''}</td>
    <td class="r">${milk ? fixed(e.snf, 1) : ''}</td>
    <td class="r">${milk ? fixed(e.base_rate) : ''}</td>
    <td class="r">${milk ? fixed(e.total_amount) : ''}</td>
    <td>${product ? `${esc(e.product?.name || 'N/A')} × ${esc(e.qty)}` : ''}</td>
    <td class="r">${product ? fixed(e.total) : ''}</td>
    <td class="r pos">${received ? fixed(e.amount) : ''}</td>
    <td class="r neg">${given ? fixed(e.amount) : ''}</td>
    <td>${payment ? esc(e.note) : ''}</td>
  </tr>`
}

/**
 * @param {object} summaryData the report answer from the server
 * @param {{ start_date: string, end_date: string, customer_account_number: string }} form
 * @param {{ dairyName?: string, address?: string }} [business]
 */
export function buildReportHtml(summaryData, form, business = {}) {
  const totals = computeTotals(summaryData)
  const entries = mergedEntries(summaryData)
  const wallet = num(summaryData.customer_wallet)
  const account =
    summaryData.milk_collections?.[0]?.customer_account_number || form.customer_account_number || 'N/A'
  const milkQty = Number.isFinite(Number(summaryData.total_milk_collections))
    ? Number(summaryData.total_milk_collections)
    : totals.milkQty

  const cards = [
    ['Milk quantity', `${milkQty.toFixed(2)} L`],
    ['Milk amount', rupees(totals.milkAmount)],
    ['Average FAT', totals.avgFat.toFixed(2)],
    ['Average SNF', totals.avgSnf.toFixed(2)],
    ['Product sales', rupees(totals.productAmount)],
    ['Received', rupees(totals.received), 'pos'],
    ['Given', rupees(totals.given), 'neg'],
    ['Total amount', rupees(totals.totalAmount), totals.totalAmount < 0 ? 'neg' : ''],
    ['Wallet balance', rupees(wallet), wallet < 0 ? 'neg' : 'pos']
  ]
    .map(([label, value, tone = '']) => `<div class="card"><span>${label}</span><b class="${tone}">${esc(value)}</b></div>`)
    .join('')

  const body = entries.length
    ? `<table>
        <thead><tr>
          <th>Sr.</th><th>Date</th><th>Entry</th><th>Shift</th><th class="r">Qty (L)</th><th class="r">Fat</th>
          <th class="r">SNF</th><th class="r">Rate</th><th class="r">Amount</th><th>Product</th>
          <th class="r">Product ₹</th><th class="r">Credit</th><th class="r">Debit</th><th>Message</th>
        </tr></thead>
        <tbody>
          ${entries.map(row).join('')}
          <tr class="totals">
            <td colspan="4">Total</td><td class="r">${milkQty.toFixed(2)}</td><td class="r">${totals.avgFat.toFixed(1)}</td>
            <td class="r">${totals.avgSnf.toFixed(1)}</td><td></td><td class="r">${totals.milkAmount.toFixed(2)}</td><td></td>
            <td class="r">${totals.productAmount.toFixed(2)}</td><td class="r">${totals.received.toFixed(2)}</td>
            <td class="r">${totals.given.toFixed(2)}</td><td></td>
          </tr>
        </tbody>
      </table>`
    : '<p class="empty">No entries in this period</p>'

  const printed = new Date().toLocaleString('en-IN')
  return `<!doctype html><html><head><meta charset="utf-8"><title>Customer Report</title><style>${CSS}</style></head><body>
    <div class="head">
      <div>
        ${business.dairyName ? `<div class="dairy">${esc(business.dairyName)}${business.address ? ` · ${esc(business.address)}` : ''}</div>` : ''}
        <h1>Customer Milk Collection Report</h1>
      </div>
      <div class="meta">
        <strong>${esc(summaryData.customer_name || '')}</strong><br>
        Acc No. ${esc(account)}<br>
        ${esc(formatDate(form.start_date))} to ${esc(formatDate(form.end_date))}
      </div>
    </div>
    <div class="cards">${cards}</div>
    ${body}
    <div class="foot">${totals.collections} collections · ${totals.productQty} items sold · Generated ${esc(printed)}</div>
  </body></html>`
}
