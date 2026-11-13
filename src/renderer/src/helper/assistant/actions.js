/**
 * Fetches the data a question asks for, from the same server calls the app's pages use, and lays it out as
 * an answer: a sentence, a few figures (cards) and tables. Every number comes from the server; nothing here
 * is guessed.
 *
 * The logged-in user's token is used, so the server only returns what this user may see.
 */
import useHomeStore from '../../zustand/useHomeStore'
import useDailyMilkSaleStore from '../../zustand/useDailyMilkSaleStore'
import { computeTotals } from '../../pages/report/reportUtils'

const MAX_TABLE_ROWS = 200
const PARALLEL = 4 // requests at a time for many accounts

const home = () => useHomeStore.getState()
const n = (v) => {
  const x = parseFloat(v)
  return Number.isFinite(x) ? x : 0
}
export const money = (v) =>
  `₹${n(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const litres = (v) => `${n(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })} L`
const one = (v) => n(v).toFixed(1)
const dmy = (isoDate) => isoDate.split('-').reverse().join('-') // YYYY-MM-DD -> DD-MM-YYYY
const ok = (res) => res && (res.status_code === undefined || Number(res.status_code) === 200)
const rangeText = (from, to) => (from === to ? dmy(from) : `${dmy(from)} to ${dmy(to)}`)

/** Calls a store function; network errors become a failed response instead of a crash. */
async function call(fn, ...args) {
  try {
    return await fn(...args)
  } catch (error) {
    return { status_code: 0, message: error?.message || 'Could not reach the server' }
  }
}

/** The list inside a server answer, whichever shape it has (plain list, or a page of a paged list). */
function rowsOf(res) {
  for (const v of [res?.data, res?.data?.data, res?.data?.data?.data, res?.data?.items]) {
    if (Array.isArray(v)) return v
  }
  return []
}

/** A date from a record as YYYY-MM-DD (records use YYYY-MM-DD or DD-MM-YYYY). */
function rowDate(row) {
  const v = String(row.date ?? row.sale_date ?? row.entry_date ?? row.created_at ?? '').slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  if (/^\d{2}-\d{2}-\d{4}$/.test(v)) return v.split('-').reverse().join('-')
  return ''
}
const rowAccount = (row) =>
  String(row.customer_account_number ?? row.account_number ?? row.customer?.account_number ?? '')

function filterRows(rows, { accounts = [], from, to }) {
  return rows.filter((row) => {
    if (accounts.length && !accounts.map(String).includes(rowAccount(row))) return false
    const d = rowDate(row)
    if (from && d && (d < from || d > to)) return false
    return true
  })
}

const HIDDEN = /(^id$|_id$|password|token|image|photo|_at$|^pivot$|deleted)/
const label = (key) => key.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

/**
 * Table columns for records whose fields are not fixed: `prefer` first (when present), then the other plain
 * fields, nested objects as "product.name". At most `max` columns.
 */
function autoColumns(rows, prefer = [], max = 8) {
  const keys = []
  const sample = rows.slice(0, 20)
  const has = (key) => sample.some((r) => cell(r, key) !== '')
  prefer.forEach((key) => has(key) && keys.push(key))
  for (const r of sample) {
    for (const [k, v] of Object.entries(r)) {
      if (HIDDEN.test(k)) continue
      const key =
        v && typeof v === 'object' && !Array.isArray(v)
          ? v.name !== undefined
            ? `${k}.name`
            : null
          : k
      if (key && !Array.isArray(v) && !keys.includes(key) && has(key)) keys.push(key)
    }
  }
  return keys.slice(0, max).map((key) => ({ key, header: label(key.replace('.name', '')) }))
}
function cell(row, key) {
  const v = key.split('.').reduce((o, k) => (o == null ? o : o[k]), row)
  return v == null || typeof v === 'object' ? '' : String(v)
}
const table = (title, rows, prefer) => {
  const columns = autoColumns(rows, prefer)
  return {
    title,
    columns,
    rows: rows
      .slice(0, MAX_TABLE_ROWS)
      .map((r, i) => ({
        _key: r.id ?? i,
        ...Object.fromEntries(columns.map((c) => [c.key, cell(r, c.key)]))
      })),
    more: Math.max(0, rows.length - MAX_TABLE_ROWS)
  }
}
const fail = (res, what) => ({
  text: `Could not load ${what}: ${res?.message || 'the server did not answer'}.`,
  error: true
})

/** Runs `fn` for each item, a few at a time. */
async function mapLimited(items, fn) {
  const out = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(PARALLEL, items.length) }, worker))
  return out
}

// ---------------------------------------------------------------------------------------------------------

async function customerDetails({ accounts }) {
  const results = await mapLimited(accounts, async (acc) => ({
    acc,
    res: await call(home().fetchCustomerDetailsByAccount, acc)
  }))
  const found = results.filter((r) => ok(r.res) && r.res.data)
  const missing = results.filter((r) => !(ok(r.res) && r.res.data)).map((r) => r.acc)
  const note = missing.length ? ` No customer found for account ${missing.join(', ')}.` : ''
  if (!found.length)
    return { text: `No customer found for account ${missing.join(', ')}.`, error: true }

  if (found.length === 1) {
    const c = found[0].res.data
    const facts = Object.entries(c)
      .filter(([k, v]) => !HIDDEN.test(k) && v !== null && v !== '' && typeof v !== 'object')
      .map(([k, v]) => ({ label: label(k), value: k === 'wallet' ? money(v) : String(v) }))
    return {
      text: `Customer ${found[0].acc}: ${c.name ?? ''}.${note}`,
      facts,
      link: { to: '/customer', label: 'Open Customers' }
    }
  }
  const rows = found.map(({ acc, res }) => ({ account_number: acc, ...res.data }))
  return {
    text: `${found.length} customers.${note}`,
    tables: [
      table('Customers', rows, [
        'account_number',
        'name',
        'careof',
        'mobile',
        'wallet',
        'customer_type'
      ])
    ]
  }
}

async function customerReport({ accounts, from, to }) {
  const results = await mapLimited(accounts, async (acc) => ({
    acc,
    res: await call(home().reportCustomer, {
      term: 'date_range',
      start_date: dmy(from),
      end_date: dmy(to),
      customer_account_number: acc
    })
  }))
  // The server answers "success" with empty lists and no name for an account that does not exist
  const found = (d) =>
    d &&
    (d.customer_name != null ||
      d.milk_collections?.length ||
      d.product_sales?.length ||
      d.payments?.length)
  const good = results.filter((r) => ok(r.res) && found(r.res.data))
  const missing = results.filter((r) => !(ok(r.res) && found(r.res.data))).map((r) => r.acc)
  const note = missing.length ? ` No customer found for account ${missing.join(', ')}.` : ''
  if (!good.length)
    return { text: `No customer found for account ${missing.join(', ')}.`, error: true }

  if (good.length === 1) {
    const { acc, res } = good[0]
    const d = res.data
    const t = computeTotals(d)
    return {
      text: `Report of account ${acc} ${d.customer_name ? `(${d.customer_name}) ` : ''}for ${rangeText(from, to)}.${note}`,
      facts: [
        { label: 'Milk', value: `${litres(t.milkQty)} in ${t.collections} entries` },
        { label: 'Milk amount', value: money(t.milkAmount) },
        { label: 'Average FAT / SNF', value: `${one(t.avgFat)} / ${one(t.avgSnf)}` },
        { label: 'Average rate', value: `${money(t.avgRate)}/L` },
        { label: 'Products taken', value: money(t.productAmount) },
        { label: 'Payments received / given', value: `${money(t.received)} / ${money(t.given)}` },
        { label: 'Net for the period', value: money(t.totalAmount) },
        { label: 'Wallet balance', value: money(d.customer_wallet) },
        ...(n(d.buyer_milk_total_quantity) > 0
          ? [
              {
                label: 'Milk bought',
                value: `${litres(d.buyer_milk_total_quantity)} · ${money(d.buyer_milk_total_amount)}`
              }
            ]
          : [])
      ],
      tables: [
        table('Milk entries', d.milk_collections || [], [
          'date',
          'shift',
          'quantity',
          'fat',
          'snf',
          'base_rate',
          'total_amount'
        ]),
        ...(d.product_sales?.length
          ? [table('Products', d.product_sales, ['date', 'product.name', 'qty', 'total'])]
          : []),
        ...(d.payments?.length
          ? [table('Payments', d.payments, ['date', 'credit_debit_mode', 'amount', 'note'])]
          : [])
      ].filter((tb) => tb.rows.length),
      link: { to: '/reports', label: 'Open Reports' }
    }
  }

  const rows = good.map(({ acc, res }) => {
    const t = computeTotals(res.data)
    return {
      account: acc,
      name: res.data.customer_name ?? '',
      milk: t.milkQty,
      milk_amount: t.milkAmount,
      fat: t.avgFat,
      snf: t.avgSnf,
      products: t.productAmount,
      received: t.received,
      given: t.given,
      net: t.totalAmount,
      wallet: n(res.data.customer_wallet)
    }
  })
  const sum = (k) => rows.reduce((s, r) => s + r[k], 0)
  return {
    text: `Report of ${rows.length} customers for ${rangeText(from, to)}.${note}`,
    facts: [
      { label: 'Total milk', value: litres(sum('milk')) },
      { label: 'Milk amount', value: money(sum('milk_amount')) },
      { label: 'Products', value: money(sum('products')) },
      { label: 'Net', value: money(sum('net')) }
    ],
    tables: [
      {
        title: 'Customers',
        columns: [
          { key: 'account', header: 'A/c' },
          { key: 'name', header: 'Name' },
          { key: 'milk', header: 'Milk (L)' },
          { key: 'milk_amount', header: 'Milk ₹' },
          { key: 'fat', header: 'FAT' },
          { key: 'snf', header: 'SNF' },
          { key: 'products', header: 'Products ₹' },
          { key: 'received', header: 'Received ₹' },
          { key: 'given', header: 'Given ₹' },
          { key: 'net', header: 'Net ₹' },
          { key: 'wallet', header: 'Wallet ₹' }
        ],
        rows: rows.map((r) => ({
          ...r,
          _key: r.account,
          milk: n(r.milk).toFixed(2),
          milk_amount: n(r.milk_amount).toFixed(2),
          fat: one(r.fat),
          snf: one(r.snf),
          products: r.products.toFixed(2),
          received: r.received.toFixed(2),
          given: r.given.toFixed(2),
          net: r.net.toFixed(2),
          wallet: r.wallet.toFixed(2)
        })),
        more: 0
      }
    ]
  }
}

async function collectionSummary({ accounts, from, to, shift }) {
  const account = accounts[0]
  const res = await call(home().getMilkCorrectionData, {
    start_date: dmy(from),
    end_date: dmy(to),
    data_type: account ? 'customer' : 'all',
    customer_account_number: account ?? ''
  })
  if (!ok(res)) return fail(res, 'the milk collection')
  let rows = res.data?.milk_collections || []
  if (shift) rows = rows.filter((r) => String(r.shift).toLowerCase() === shift)

  const qty = rows.reduce((s, r) => s + n(r.quantity), 0)
  const amount = rows.reduce((s, r) => s + n(r.total_amount), 0)
  const avg = (k) => (rows.length ? rows.reduce((s, r) => s + n(r[k]), 0) / rows.length : 0)
  const customers = new Set(rows.map(rowAccount)).size

  // one line per day and shift
  const groups = new Map()
  for (const r of rows) {
    const key = `${rowDate(r)}|${String(r.shift).toLowerCase()}`
    const g = groups.get(key) || {
      date: rowDate(r),
      shift: r.shift,
      entries: 0,
      qty: 0,
      amount: 0,
      fat: 0,
      snf: 0
    }
    g.entries++
    g.qty += n(r.quantity)
    g.amount += n(r.total_amount)
    g.fat += n(r.fat)
    g.snf += n(r.snf)
    groups.set(key, g)
  }
  // who gave the most milk
  const byCustomer = new Map()
  for (const r of rows) {
    const acc = rowAccount(r)
    const c = byCustomer.get(acc) || {
      acc,
      name: r.customer_name ?? r.customer?.name ?? r.name ?? '',
      qty: 0,
      amount: 0
    }
    c.qty += n(r.quantity)
    c.amount += n(r.total_amount)
    byCustomer.set(acc, c)
  }
  const top = [...byCustomer.values()].sort((a, b) => b.qty - a.qty).slice(0, 10)

  const what = `${shift ? `${shift} ` : ''}milk collection${account ? ` of account ${account}` : ''}`
  return {
    text: rows.length
      ? `The ${what} for ${rangeText(from, to)}.`
      : `No ${what} for ${rangeText(from, to)}.`,
    facts: rows.length
      ? [
          { label: 'Total milk', value: litres(qty) },
          { label: 'Total amount', value: money(amount) },
          { label: 'Average FAT / SNF', value: `${one(avg('fat'))} / ${one(avg('snf'))}` },
          { label: 'Entries / customers', value: `${rows.length} / ${customers}` }
        ]
      : [],
    tables: groups.size
      ? [
          {
            title: 'By day and shift',
            columns: [
              { key: 'date', header: 'Date' },
              { key: 'shift', header: 'Shift' },
              { key: 'entries', header: 'Entries' },
              { key: 'qty', header: 'Milk (L)' },
              { key: 'amount', header: 'Amount ₹' },
              { key: 'fat', header: 'Avg FAT' },
              { key: 'snf', header: 'Avg SNF' }
            ],
            rows: [...groups.values()]
              .sort((a, b) => (a.date + a.shift).localeCompare(b.date + b.shift))
              .map((g) => ({
                _key: g.date + g.shift,
                date: dmy(g.date),
                shift: g.shift,
                entries: g.entries,
                qty: g.qty.toFixed(2),
                amount: g.amount.toFixed(2),
                fat: one(g.fat / g.entries),
                snf: one(g.snf / g.entries)
              })),
            more: 0
          },
          ...(!account && top.length > 1
            ? [
                {
                  title: 'Top customers by milk',
                  columns: [
                    { key: 'acc', header: 'A/c' },
                    { key: 'name', header: 'Name' },
                    { key: 'qty', header: 'Milk (L)' },
                    { key: 'amount', header: 'Amount ₹' }
                  ],
                  rows: top.map((c) => ({
                    ...c,
                    _key: c.acc,
                    qty: c.qty.toFixed(2),
                    amount: c.amount.toFixed(2)
                  })),
                  more: 0
                }
              ]
            : [])
        ]
      : [],
    link: { to: '/milkCorrection', label: 'Open Milk Records' }
  }
}

async function overview() {
  const res = await call(home().fetchDashboardData)
  if (!ok(res)) return fail(res, 'the dashboard')
  return {
    text: "Today's collection.",
    facts: [
      {
        label: 'Morning milk',
        value: `${litres(res.morning_total_milk)} · ${money(res.morning_total_amount)}`
      },
      {
        label: 'Evening milk',
        value: `${litres(res.evening_total_milk)} · ${money(res.evening_total_amount)}`
      },
      { label: 'Total amount', value: money(res.total_amount) },
      {
        label: 'Customers (morning / evening)',
        value: `${n(res.total_morning_customer)} / ${n(res.total_evening_customer)}`
      }
    ],
    link: { to: '/', label: 'Open Dashboard' }
  }
}

async function cmSubsidy({ from, to }) {
  const res = await call(home().fetchCmSubsidyCustomerReport, {
    start_date: dmy(from),
    end_date: dmy(to)
  })
  if (!ok(res)) return fail(res, 'the CM subsidy report')
  const rows = rowsOf(res)
  const facts = Object.entries(res.summary || {})
    .filter(([, v]) => v !== null && typeof v !== 'object')
    .map(([k, v]) => ({ label: label(k), value: String(v) }))
  return {
    text: rows.length
      ? `CM subsidy customers for ${rangeText(from, to)}: ${rows.length}.`
      : `No CM subsidy milk for ${rangeText(from, to)}.`,
    facts,
    tables: rows.length
      ? [
          table('CM subsidy', rows, [
            'account_number',
            'customer_account_number',
            'name',
            'customer_name',
            'subsidy_code',
            'total_milk',
            'average_fat',
            'average_snf'
          ])
        ]
      : [],
    link: { to: '/cmsubsidylist', label: 'Open CM Subsidy List' }
  }
}

async function paymentRegister({ from, to }) {
  const res = await call(home().paymentRegister, { start_date: from, end_date: to })
  if (!ok(res)) return fail(res, 'the payment register')
  const rows = rowsOf(res)
  return {
    text: rows.length
      ? `Payment register for ${rangeText(from, to)}: ${rows.length} members.`
      : `Nothing in the payment register for ${rangeText(from, to)}.`,
    tables: rows.length
      ? [
          table('Payment register', rows, [
            'customer_account_number',
            'customer_name',
            'total_milk_in_ltr',
            'total_payable_amount',
            'grand_total_amount_in_range',
            'account_number',
            'name',
            'total_milk',
            'total_amount'
          ])
        ]
      : [],
    link: { to: '/paymentregister', label: 'Open Payment Register' }
  }
}

/** Paged lists without server filters: the newest page, filtered here by account and dates. */
const listAnswer = (what, load, prefer, link) => async (q) => {
  const res = await call(load)
  if (!ok(res)) return fail(res, what)
  const rows = filterRows(rowsOf(res), q)
  const scope = [
    q.accounts.length && `account ${q.accounts.join(', ')}`,
    q.from && rangeText(q.from, q.to)
  ]
    .filter(Boolean)
    .join(', ')
  return {
    text: rows.length
      ? `${label(what)}${scope ? ` (${scope})` : ''}: ${rows.length} recent records.`
      : `No recent ${what}${scope ? ` for ${scope}` : ''}.`,
    tables: rows.length ? [table(label(what), rows, prefer)] : [],
    link
  }
}

async function customerSearch({ name }) {
  const res = await call(home().getAllCustomer, name)
  if (!ok(res)) return fail(res, 'customers')
  // the server may ignore the search text, so match the name here too
  const words = name.toLowerCase().split(/\s+/)
  const rows = rowsOf(res).filter((r) =>
    words.every((w) => `${r.name ?? ''} ${r.careof ?? ''}`.toLowerCase().includes(w))
  )
  return {
    text: rows.length
      ? `${rows.length} ${rows.length === 1 ? 'customer matches' : 'customers match'} "${name}".`
      : `No customer matches "${name}".`,
    tables: rows.length
      ? [table('Customers', rows, ['account_number', 'name', 'careof', 'mobile', 'wallet'])]
      : []
  }
}

async function customerList() {
  const res = await call(home().getAllCustomer, '')
  if (!ok(res)) return fail(res, 'customers')
  const rows = rowsOf(res)
  const wallet = rows.reduce((s, r) => s + n(r.wallet), 0)
  return {
    text: `${rows.length} customers.`,
    facts: [
      { label: 'Customers', value: String(rows.length) },
      { label: 'Total wallet balance', value: money(wallet) }
    ],
    tables: [
      table('Customers', rows, [
        'account_number',
        'name',
        'careof',
        'mobile',
        'wallet',
        'customer_type'
      ])
    ],
    link: { to: '/customer', label: 'Open Customers' }
  }
}

const ACTIONS = {
  customer_details: customerDetails,
  customer_report: customerReport,
  customer_search: customerSearch,
  customer_list: customerList,
  collection_summary: collectionSummary,
  overview,
  cm_subsidy: cmSubsidy,
  payment_register: paymentRegister,
  cash_entries: listAnswer(
    'cash entries',
    () => home().getAllCashEntries(),
    ['date', 'customer_account_number', 'customer.name', 'credit_debit_mode', 'amount', 'note'],
    { to: '/cashCorrection', label: 'Open Cash' }
  ),
  stock: listAnswer(
    'stock',
    () => home().getAllProductStock(1),
    ['product.name', 'stock_type', 'quantity', 'unit_quantity', 'date'],
    { to: '/inventory', label: 'Open Inventory' }
  ),
  product_sales: listAnswer(
    'product sales',
    () => home().getAllSoldProducts(1),
    ['date', 'customer_account_number', 'customer.name', 'product.name', 'qty', 'total'],
    { to: '/productCorrection', label: 'Open Product Sales' }
  ),
  milk_sales: listAnswer(
    'milk sales',
    () => useDailyMilkSaleStore.getState().getDailyMilkSaleData(1),
    [
      'sale_date',
      'customer_account_number',
      'customer_name',
      'shift',
      'milk_type',
      'quentity',
      'quantity',
      'rate_per_liter',
      'total_amount'
    ],
    { to: '/dailyMilkSale', label: 'Open Daily Milk Sale' }
  )
}

/** Intents that need at least one account number. */
export const NEEDS_ACCOUNT = new Set(['customer_details', 'customer_report'])

/** @param {{intent:string, accounts:number[], name:string, from:string, to:string, shift:string|null}} q */
export function runAction(q) {
  const action = ACTIONS[q.intent]
  return action ? action(q) : Promise.resolve({ text: 'I cannot answer that yet.', error: true })
}
