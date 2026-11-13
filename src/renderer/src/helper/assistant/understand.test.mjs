// Checks of the question rules. Run: node src/renderer/src/helper/assistant/understand.test.mjs
import assert from 'node:assert'
import { understand } from './understand.js'
const today = new Date(2026, 10, 14) // 14 Nov 2026 (Saturday)
const cases = [
  [
    'account 12 ka is mahine ka report dikhao',
    { intent: 'customer_report', accounts: [12], from: '2026-11-01', to: '2026-11-14' }
  ],
  [
    'aaj kitna doodh aaya',
    { intent: 'collection_summary', accounts: [], from: '2026-11-14', to: '2026-11-14' }
  ],
  ['how do I change the rate chart?', { intent: 'help', accounts: [] }],
  [
    'accounts 1 to 5 report last month',
    { intent: 'customer_report', accounts: [1, 2, 3, 4, 5], from: '2026-10-01', to: '2026-10-31' }
  ],
  [
    '12 ka hisab 01-11-2026 se 10-11-2026',
    { intent: 'customer_report', accounts: [12], from: '2026-11-01', to: '2026-11-10' }
  ],
  ['details of account 7', { intent: 'customer_details', accounts: [7] }],
  ['cm subsidy report october', { intent: 'cm_subsidy', from: '2026-10-01', to: '2026-10-31' }],
  [
    'subah ka collection kal',
    { intent: 'collection_summary', shift: 'morning', from: '2026-11-13' }
  ],
  ['stock kitna bacha hai', { intent: 'stock' }],
  ['customer named ramesh kumar ka details', { intent: 'customer_search', name: 'ramesh kumar' }],
  [
    'payment register this week',
    { intent: 'payment_register', from: '2026-11-09', to: '2026-11-14' }
  ],
  [
    'account 3, 8, 15 ka report pichle 7 din',
    { intent: 'customer_report', accounts: [3, 8, 15], from: '2026-11-08' }
  ],
  ['how much milk came in last 30 days', { intent: 'collection_summary', from: '2026-10-16' }],
  ['cash entries of account 4', { intent: 'cash_entries', accounts: [4] }],
  ['kitne customer hai', { intent: 'customer_list' }],
  [
    'december report of account 2',
    { intent: 'customer_report', accounts: [2], from: '2025-12-01', to: '2025-12-31' }
  ],
  ['auto print kaise band kare', { intent: 'help' }],
  ['आज का दूध', { intent: 'collection_summary', from: '2026-11-14' }],
  ['what is the weather', { intent: 'help' }],
  ['suresh ka mobile number', { intent: 'customer_search', name: 'suresh' }],
  ['details of ramesh kumar', { intent: 'customer_search', name: 'ramesh kumar' }],
  ['naya grahak kaise jode', { intent: 'help', name: '' }],
  ['mera hisab', { intent: 'customer_report', name: '' }],
  ['account 5 ka mobile', { intent: 'customer_details', accounts: [5], name: '' }]
]
let fail = 0
for (const [q, want] of cases) {
  const got = understand(q, today)
  try {
    for (const k of Object.keys(want)) assert.deepStrictEqual(got[k], want[k], k)
    console.log('ok  ', q)
  } catch (e) {
    fail++
    console.log('FAIL', q, '\n     ', e.message.split('\n')[0], JSON.stringify(got))
  }
}
console.log(fail ? `${fail} failed` : 'all passed')
process.exitCode = fail ? 1 : 0
