/* eslint-disable no-misleading-character-class -- the u0900-u097f ranges are the whole Devanagari block on purpose */
/**
 * Works out what a chat question asks for: the kind of answer (intent), the account numbers, the dates and
 * the shift. English, Hinglish ("account 12 ka is mahine ka hisab") and common Hindi words.
 *
 * Pure rules, no model: answers in a few milliseconds on any PC. Account numbers and dates always come from
 * here, never from the chat model (a small model invents numbers). The model is only asked for the intent
 * when these rules find none (see askModel.js).
 */

export const INTENTS = [
  'help',
  'customer_details',
  'customer_report',
  'customer_search',
  'customer_list',
  'collection_summary',
  'overview',
  'cm_subsidy',
  'payment_register',
  'cash_entries',
  'stock',
  'product_sales',
  'milk_sales'
]

export const PERIODS = [
  'today',
  'yesterday',
  'this_week',
  'last_week',
  'this_month',
  'last_month',
  'last_7_days',
  'last_30_days'
]

const MAX_ACCOUNTS = 50

// Order matters: the first group whose words appear wins. Specific reports before general words.
const INTENT_WORDS = [
  ['cm_subsidy', /\bcm\b|subsid|subsidi|mukhyamantri|सब्सिडी/],
  [
    'payment_register',
    /payment\s*register|bhugtan\s*register|payment\s*ledger|bhugtan\s*suchi|पेमेंट रजिस्टर/
  ],
  ['stock', /\bstock\b|inventory|\bmaal\b|godown|स्टॉक|kitna\s+bacha/],
  ['milk_sales', /milk\s*sale|doo?dh\s*(sale|bikri|becha)|daily\s*milk\s*sale|दूध\s*बिक्री/],
  [
    'product_sales',
    /product\s*(sale|sell|sold)|\bsold\b|\bbecha\b|bikri|\bfeed\b|\bdana\b|\bkhal\b|बिक्री/
  ],
  ['cash_entries', /\bcash\b|nakad|nakdi|\bjama\b|udhar|advance|नकद/],
  [
    'customer_list',
    /(all|sab|sabhi|saare|total|kitne)\s+(customers?|grahak|kisan|members?)|customers?\s+list|grahak\s+suchi/
  ],
  [
    'customer_report',
    /report|hisa+b|statement|ledger|khata|passbook|entries|entry\b|रिपोर्ट|हिसाब|खाता/
  ],
  [
    'customer_details',
    /detail|info|jankari|mobile|phone|wallet|balance|kaun\s+hai|who\s+is|address|careof|care\s+of|जानकारी/
  ],
  ['overview', /dashboard|overview|aaj\s+ka\s+(hal|summary)|today'?s\s+summary/],
  [
    'collection_summary',
    /collection|doo?dh|milk|\bfat\b|\bsnf\b|lit(er|re)s?|\bltr\b|kitna|kitni|subah|shaam|morning|evening|दूध|सुबह|शाम/
  ],
  [
    'help',
    /\bhow\b|kaise|kese|kaisa|\bkya\s+hai\b|what\s+is|where|kaha[n]?\b|kahan|\bhelp\b|madad|samjha|explain|setting|setup|kyon|kyu|\bwhy\b|\bjod|\badd\b|banana|banaye|hatana|\bdelete\b|badal|\bchange\b|nahi\s+ho|not\s+working|problem|error|कैसे|मदद/
  ]
]

const SHIFT_WORDS = [
  ['morning', /morning|subah|savere|सुबह/],
  ['evening', /evening|shaam|sham\b|शाम/]
]

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

const pad = (n) => String(n).padStart(2, '0')
/** Local calendar date as YYYY-MM-DD. */
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const validDate = (y, m, d) => {
  const date = new Date(y, m - 1, d)
  return date.getMonth() === m - 1 && date.getDate() === d ? date : null
}

/** { from, to } (YYYY-MM-DD) for a named period, counted from `today`. */
export function periodRange(period, today) {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const monday = addDays(t, -((t.getDay() + 6) % 7))
  switch (period) {
    case 'today':
      return { from: iso(t), to: iso(t) }
    case 'yesterday':
      return { from: iso(addDays(t, -1)), to: iso(addDays(t, -1)) }
    case 'this_week':
      return { from: iso(monday), to: iso(t) }
    case 'last_week':
      return { from: iso(addDays(monday, -7)), to: iso(addDays(monday, -1)) }
    case 'this_month':
      return { from: iso(new Date(t.getFullYear(), t.getMonth(), 1)), to: iso(t) }
    case 'last_month':
      return {
        from: iso(new Date(t.getFullYear(), t.getMonth() - 1, 1)),
        to: iso(new Date(t.getFullYear(), t.getMonth(), 0))
      }
    case 'last_7_days':
      return { from: iso(addDays(t, -6)), to: iso(t) }
    case 'last_30_days':
      return { from: iso(addDays(t, -29)), to: iso(t) }
    default:
      return null
  }
}

/**
 * Dates written in the question. Returns { range, rest } where `rest` is the text with the dates taken out
 * (so their digits are not read as account numbers).
 */
function readDates(text, today) {
  let rest = text
  const found = []
  const take = (re, toDate) => {
    rest = rest.replace(re, (...m) => {
      const date = toDate(m)
      if (!date) return m[0]
      found.push(date)
      return ' '
    })
  }
  // 2026-11-14
  take(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g, (m) => validDate(+m[1], +m[2], +m[3]))
  // 14-11-2026, 14/11/26, 14.11.2026
  take(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})\b/g, (m) =>
    validDate(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[2], +m[1])
  )
  // 14/11 (this year)
  take(/\b(\d{1,2})\/(\d{1,2})\b/g, (m) => validDate(today.getFullYear(), +m[2], +m[1]))
  // 14 nov, 14 november 2026
  take(
    /\b(\d{1,2})\s*(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?(?:\s+(\d{4}))?/g,
    (m) => validDate(m[3] ? +m[3] : today.getFullYear(), MONTHS.indexOf(m[2]) + 1, +m[1])
  )

  if (found.length) {
    found.sort((a, b) => a - b)
    return { range: { from: iso(found[0]), to: iso(found[found.length - 1]) }, rest }
  }

  // A whole month: "october", "oct 2025", "october ka hisab"
  const month = rest.match(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b(?:\s+(\d{4}))?/
  )
  if (month && !/\bmay\s+(i|we|you)\b/.test(rest)) {
    const m = MONTHS.indexOf(month[1])
    let y = month[2] ? +month[2] : today.getFullYear()
    if (!month[2] && m > today.getMonth()) y -= 1 // a later month name means last year's
    const last = new Date(y, m + 1, 0)
    rest = rest.replace(month[0], ' ')
    return { range: { from: iso(new Date(y, m, 1)), to: iso(last > today ? today : last) }, rest }
  }

  const lastDays = rest.match(/\b(?:last|pichl[ea]|past)\s+(\d{1,3})\s*(?:days?|din)\b/)
  if (lastDays) {
    rest = rest.replace(lastDays[0], ' ')
    const n = Math.max(1, +lastDays[1])
    return { range: { from: iso(addDays(today, -(n - 1))), to: iso(today) }, rest }
  }

  const named = [
    ['last_month', /last\s+month|pichl[ea]\s+(mahine|month)|पिछले\s+महीने/],
    ['this_month', /this\s+month|is\s+(mahine|month)|current\s+month|mahine\s+ka|इस\s+महीने/],
    ['last_week', /last\s+week|pichl[ea]\s+(hafte|week)/],
    ['this_week', /this\s+week|is\s+(hafte|week)/],
    ['yesterday', /yesterday|\bkal\b|कल/],
    ['today', /today|\baaj\b|\baj\b|आज/]
  ]
  for (const [period, re] of named) {
    if (re.test(rest))
      return { range: { ...periodRange(period, today), period }, rest: rest.replace(re, ' ') }
  }
  return { range: null, rest }
}

/** Account numbers: "account 12", "a/c 5", "khata 7", "accounts 1 to 10", "1, 4, 9", "12 number". */
function readAccounts(text, hasAccountWord) {
  const accounts = new Set()
  const add = (n) => n > 0 && n < 1_000_000 && accounts.add(n)
  let rest = text
  // ranges: 1 to 10, 1-10, 1 se 10
  rest = rest.replace(/\b(\d{1,6})\s*(?:-|to|se|till|tak)\s*(\d{1,6})\b/g, (all, a, b) => {
    const [lo, hi] = [+a, +b].sort((x, y) => x - y)
    if (!hasAccountWord || hi - lo > MAX_ACCOUNTS) return all
    for (let n = lo; n <= hi; n++) add(n)
    return ' '
  })
  const numbers = [...rest.matchAll(/\b\d{1,6}\b/g)].map((m) => +m[0])
  if (hasAccountWord) numbers.forEach(add)
  else if (numbers.length === 1) add(numbers[0]) // "12 ka report" - one bare number is an account
  return [...accounts].slice(0, MAX_ACCOUNTS)
}

// Words that are never part of a customer's name
const NOT_NAME = new Set(
  'account accounts customer customers grahak kisan member mera meri mere my sab sabhi all total aaj today kal is this that us month mahine week hafte milk doodh dudh report hisab hisaab details detail info jankari mobile number phone balance wallet naya new kaun who what kya kitna the of a an ka ki ke'.split(
    ' '
  )
)
/** 1 to 3 words of letters that are not common words, e.g. "ramesh kumar". */
export const looksLikeName = (s) => {
  const w = String(s ?? '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
  return w.length <= 3 && w.every((x) => /^[a-zऀ-ॿ.]{2,}$/.test(x) && !NOT_NAME.has(x))
}

const W = '[a-z\\u0900-\\u097f]+'
const NAME_PATTERNS = [
  // customer named Ramesh / naam Ramesh
  /\b(?:named|name|naam|nam)\s+(?:is\s+|hai\s+)?([a-zऀ-ॿ][a-zऀ-ॿ.\s]{1,40}?)(?=\s+(?:ka|ki|ke|ko|hai|details?|report|info)\b|[?.,!]|$)/,
  // ramesh ka mobile / ramesh kumar ki jankari
  new RegExp(
    `^(${W}(?:\\s+${W}){0,2}?)\\s+(?:ka|ki|ke)\\s+(?:mobile|number|phone|jankari|details?|info|balance|wallet|report|hisa+b|khata|address)`
  ),
  // details of ramesh
  new RegExp(
    `\\b(?:details?|info|information|mobile|phone|balance)\\s+of\\s+(${W}(?:\\s+${W}){0,2})\\s*[?.!]?$`
  ),
  // find ramesh
  new RegExp(
    `\\b(?:find|search|dhundo|khojo)\\s+(?:customer\\s+)?(${W}(?:\\s+${W}){0,2})\\s*[?.!]?$`
  )
]

/** A customer name written in the question, or ''. */
function readName(text) {
  const t = text.trim()
  for (const re of NAME_PATTERNS) {
    const m = t.match(re)
    if (m && looksLikeName(m[1])) return m[1].trim()
  }
  return ''
}

const ACCOUNT_WORD =
  /\b(?:accounts?|a\/c|acc|ac|khata|khate|customer|grahak|kisan|member|no\.?|number)\b|#\s*\d/

/**
 * @param {string} question
 * @param {Date} [today]
 * @returns {{ intent: string|null, accounts: number[], name: string, from: string|null, to: string|null,
 *   period: string|null, shift: string|null }}
 */
export function understand(question, today = new Date()) {
  const text = ` ${String(question).toLowerCase().replace(/\s+/g, ' ')} `
  const { range, rest } = readDates(text, today)
  const accounts = readAccounts(rest.replace(/#/g, ' '), ACCOUNT_WORD.test(rest))
  const name = readName(text)
  const shift = SHIFT_WORDS.find(([, re]) => re.test(text))?.[0] ?? null

  let intent = INTENT_WORDS.find(([, re]) => re.test(text))?.[0] ?? null
  // "how much milk" is data, not help
  if (intent === 'help' && /how\s+much|how\s+many|kitna|kitne|kitni/.test(text))
    intent = 'collection_summary'
  // A question about given accounts is about those customers
  if (
    accounts.length &&
    ['collection_summary', 'cash_entries', 'payment_register'].includes(intent)
  ) {
    if (intent === 'collection_summary' && !range) intent = 'customer_details'
    else if (intent !== 'cash_entries') intent = 'customer_report'
  }
  if (!intent && accounts.length) intent = range ? 'customer_report' : 'customer_details'
  if (!intent && name) intent = 'customer_search'
  if (intent === 'customer_details' && !accounts.length && name) intent = 'customer_search'

  return {
    intent,
    accounts,
    name,
    from: range?.from ?? null,
    to: range?.to ?? null,
    period: range?.period ?? null,
    shift
  }
}
