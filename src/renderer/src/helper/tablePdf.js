/**
 * PDF export for any list or chart that is a title plus a table. It builds the page's HTML (plain HTML and
 * CSS with its own styles, drawn in a hidden window, see src/main/pdf.js) and asks the main process to save
 * it. The customer report has its own, richer layout in pages/report/reportPdf.js.
 *
 * Every value goes through `esc`, so a name or note with < or & cannot change the page.
 */
import CustomToast from './costomeToast'
import logExport from './auditExport'
import { loadSettings } from '../pages/setting/settingsStorage'

export const esc = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  )

/** 1234.5 -> "₹1,234.50" */
export const rupees = (value) =>
  `₹${(parseFloat(value) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const CSS = (dense) => `
  * { box-sizing: border-box; }
  body { font: ${dense ? 9.5 : 11}px/1.35 "Segoe UI", Arial, sans-serif; color: #1a2530; margin: 0; }
  h1 { font-size: 18px; margin: 0; }
  .dairy { font-size: 12px; color: #4a5a68; margin-bottom: 2px; }
  .head { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #0e8fa3; padding-bottom: 8px; margin-bottom: 10px; }
  .meta { text-align: right; color: #4a5a68; }
  .cards { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
  .card { flex: 1 1 11%; min-width: 105px; border: 1px solid #d5dde3; border-radius: 6px; padding: 5px 8px; }
  .card span { display: block; color: #66778a; font-size: 9.5px; }
  .card b { font-size: 13px; }
  .pos { color: #15803d; } .neg { color: #b91c1c; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #0e8fa3; color: #fff; font-size: ${dense ? 9 : 10}px; text-align: left; padding: ${dense ? '3px 4px' : '5px 6px'}; }
  td { padding: ${dense ? '2px 4px' : '4px 6px'}; border-bottom: 1px solid #e3e9ee; vertical-align: top; }
  tr:nth-child(even) td { background: #f6f9fb; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  .r { text-align: right; } .c { text-align: center; }
  .key { font-weight: 700; background: #e8f4f7 !important; }
  .totals td { font-weight: 700; background: #e8f4f7 !important; border-top: 2px solid #0e8fa3; }
  .empty { padding: 20px; text-align: center; color: #66778a; }
  .foot { margin-top: 10px; font-size: 9.5px; color: #66778a; }
`

/**
 * @typedef {{ header: string, get: (row: object, index: number) => unknown, align?: 'r'|'c', tone?: (row: object) => 'pos'|'neg'|'' , key?: boolean }} PdfColumn
 *
 * @param {object} options
 * @param {string} options.title
 * @param {Array<[string, string]>} [options.details] right of the title: ["Period", "01-11-2026 to 14-11-2026"], ...
 * @param {Array<[string, string, ('pos'|'neg'|'')?]>} [options.cards] summary figures: [label, value, tone]
 * @param {PdfColumn[]} options.columns
 * @param {object[]} options.rows
 * @param {unknown[]} [options.totals] one cell per column for a bold last row (use '' for blanks)
 * @param {string} [options.note] small text under the table
 * @param {boolean} [options.dense] smaller type, for wide charts
 * @param {string} [options.emptyMessage]
 */
export function buildTableHtml({
  title,
  details = [],
  cards = [],
  columns,
  rows,
  totals,
  note,
  dense = false,
  emptyMessage = 'Nothing to show'
}) {
  const { dairyName, address } = loadSettings()
  const head = columns.map((c) => `<th class="${c.align ?? ''}">${esc(c.header)}</th>`).join('')
  const body = rows
    .map(
      (row, i) =>
        `<tr>${columns
          .map((c) => {
            const tone = c.tone?.(row) ?? ''
            return `<td class="${[c.align ?? '', c.key ? 'key' : '', tone].filter(Boolean).join(' ')}">${esc(c.get(row, i))}</td>`
          })
          .join('')}</tr>`
    )
    .join('')
  const totalRow = totals
    ? `<tr class="totals">${totals.map((t, i) => `<td class="${columns[i]?.align ?? ''}">${esc(t)}</td>`).join('')}</tr>`
    : ''
  const table = rows.length
    ? `<table><thead><tr>${head}</tr></thead><tbody>${body}${totalRow}</tbody></table>`
    : `<p class="empty">${esc(emptyMessage)}</p>`

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS(dense)}</style></head><body>
    <div class="head">
      <div>
        ${dairyName ? `<div class="dairy">${esc(dairyName)}${address ? ` · ${esc(address)}` : ''}</div>` : ''}
        <h1>${esc(title)}</h1>
      </div>
      <div class="meta">${details.map(([k, v]) => `${esc(k)}: <b>${esc(v)}</b>`).join('<br>')}</div>
    </div>
    ${cards.length ? `<div class="cards">${cards.map(([label, value, tone = '']) => `<div class="card"><span>${esc(label)}</span><b class="${tone}">${esc(value)}</b></div>`).join('')}</div>` : ''}
    ${table}
    <div class="foot">${note ? `${esc(note)} · ` : ''}Generated ${esc(new Date().toLocaleString('en-IN'))}</div>
  </body></html>`
}

/** A date as DD-MM-YYYY, whether the server wrote it YYYY-MM-DD or DD-MM-YYYY (it uses both). */
export const niceDate = (value) => {
  const text = String(value ?? '').slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text.split('-').reverse().join('-') : String(value ?? '')
}

/** A file-name-safe version of a label: "CM Subsidy List" -> "CM_Subsidy_List". */
export const fileSafe = (text) =>
  String(text)
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

const today = () => {
  const d = new Date()
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
}

/**
 * Builds the PDF of a table page and saves it (the user picks the file).
 *
 * @param {Parameters<typeof buildTableHtml>[0] & { report: string, fileName?: string, landscape?: boolean }} options
 *   `report` is the name written to the audit log; `landscape` defaults to true.
 * @returns {Promise<boolean>} true when a PDF was saved
 */
export async function exportTablePdf({ report, fileName, landscape = true, ...page }) {
  if (!window.api?.exportPdf) {
    CustomToast.error('PDF export is only available in the installed desktop app.')
    return false
  }
  if (!page.rows.length) {
    CustomToast.warn('No data to export')
    return false
  }
  try {
    const res = await window.api.exportPdf({
      html: buildTableHtml(page),
      fileName: fileName || `${fileSafe(report)}_${today()}.pdf`,
      landscape
    })
    if (res?.success) {
      logExport(report, 'pdf', page.rows.length)
      CustomToast.success('PDF saved')
      return true
    }
    if (!res?.canceled) CustomToast.error(res?.message || 'Could not create the PDF')
  } catch (error) {
    console.error('PDF export failed:', error)
    CustomToast.error('Could not create the PDF')
  }
  return false
}
