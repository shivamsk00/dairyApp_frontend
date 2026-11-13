/**
 * Answers one chat question.
 *
 *  1. The rules in understand.js read the intent, accounts, dates and shift (instant, no model).
 *  2. Only when the rules find no intent, the local model picks one (grammar-forced JSON).
 *  3. Data questions go to the server (actions.js). Help questions: the best help notes are found
 *     (knowledge.js) and the model answers from them, streaming; without the model the note is shown.
 */
import { INTENTS, looksLikeName, periodRange, understand } from './understand'
import { HELP_NOTES, PAGE_NAMES, searchHelp } from './knowledge'
import { NEEDS_ACCOUNT, runAction } from './actions'

// Dates used when the question gives none
const DEFAULT_PERIOD = {
  collection_summary: 'today',
  customer_report: 'this_month',
  cm_subsidy: 'this_month',
  payment_register: 'this_month'
}

// Only for questions the rules do not recognise. Worked examples matter a lot for a model this small.
const ROUTER_SYSTEM = `Pick the intent of a question asked in a dairy management software. Questions may be English, Hindi or Hinglish.
Intents:
help = how to use the software, a problem with it, where something is
customer_details = information about one customer (phone, balance, address)
customer_search = find a customer by a person's name
customer_list = all customers
collection_summary = milk collected (litres, amount, fat, snf), who gave the most milk
overview = today's dashboard
cm_subsidy = CM subsidy
payment_register = payment register of all members
cash_entries = cash paid or received
stock = product stock
product_sales = products sold
milk_sales = milk sold to buyers
customer_report = a customer's statement over dates
other = greetings, chit-chat, anything not about the dairy or this software
name = a person's name written in the question, else ""
Examples:
"ramesh ki jankari do" -> {"intent":"customer_search","name":"ramesh"}
"print nahi ho raha" -> {"intent":"help","name":""}
"hello" -> {"intent":"other","name":""}
"sabse zyada doodh kisne diya" -> {"intent":"collection_summary","name":""}
"capital of india" -> {"intent":"other","name":""}`

const ROUTER_SCHEMA = {
  type: 'object',
  properties: {
    intent: { enum: [...INTENTS, 'other'] },
    name: { type: 'string' }
  }
}

const HELP_SYSTEM = `You are the help assistant inside a dairy management software.
Answer the question using only the notes given with it. Be short: 2 to 5 sentences, simple words, name the page and the buttons to press.
Reply in the language of the question (English, or Hindi/Hinglish).
If the notes do not answer it, say you do not know and name the page that might help.`

const NOT_UNDERSTOOD = {
  text: 'I did not understand that. I can answer questions about this software and your dairy data, for example:',
  examples: [
    'account 12 ka is mahine ka report',
    "today's milk collection",
    'details of account 5',
    'how do I scan a rate list?'
  ]
}

/**
 * @param {string} question
 * @param {{ modelReady: boolean, onToken?: (text: string) => void, today?: Date }} options
 * @returns {Promise<object>} answer for the chat: { text, facts?, tables?, link?, examples?, error?, viaModel? }
 */
export async function answerQuestion(question, { modelReady, onToken, today = new Date() }) {
  const q = understand(question, today)
  let viaModel = false

  if (!q.intent && modelReady) {
    const res = await window.api.assistantAsk({
      system: ROUTER_SYSTEM,
      prompt: question,
      schema: ROUTER_SCHEMA,
      maxTokens: 60
    })
    if (res?.success && res.json) {
      viaModel = true
      const { intent, name } = res.json
      if (intent && intent !== 'other') q.intent = intent
      // only a name that is really written in the question
      if (!q.name && looksLikeName(name) && question.toLowerCase().includes(name.toLowerCase()))
        q.name = name
    }
  }
  if (!q.intent) {
    // Still nothing: a help note that matches is the best guess
    if (searchHelp(question).length) q.intent = 'help'
    else return NOT_UNDERSTOOD
  }

  if (q.intent === 'help') {
    const help = await helpAnswer(question, { modelReady, onToken })
    return { ...help, viaModel: viaModel || !!help.viaModel }
  }

  if (NEEDS_ACCOUNT.has(q.intent) && !q.accounts.length) {
    if (q.name) q.intent = 'customer_search'
    else
      return {
        text: 'Which account number? For example: "account 12 report this month" or "accounts 1 to 10 report".'
      }
  }
  if (q.intent === 'customer_search' && !q.name)
    return { text: 'Which customer name should I look for?' }

  if (!q.from && DEFAULT_PERIOD[q.intent])
    Object.assign(q, periodRange(DEFAULT_PERIOD[q.intent], today))
  return { ...(await runAction(q)), viaModel }
}

async function helpAnswer(question, { modelReady, onToken }) {
  const notes = searchHelp(question)
  if (!notes.length) {
    return {
      text: 'I could not find that in the help. I know these pages:',
      examples: HELP_NOTES.slice(0, 8).map((n) => `How do I use ${n.title}?`)
    }
  }
  const link =
    notes[0].page === '/assistant'
      ? undefined
      : { to: notes[0].page, label: `Open ${PAGE_NAMES[notes[0].page]}` }
  if (!modelReady) return { text: notes[0].text, title: notes[0].title, link }

  const context = notes.map((n) => `# ${n.title}\n${n.text}`).join('\n\n')
  const remove = window.api.onAssistantToken?.((chunk) => onToken?.(chunk))
  try {
    const res = await window.api.assistantAsk({
      system: HELP_SYSTEM,
      prompt: `Notes:\n${context}\n\nQuestion: ${question}`,
      maxTokens: 220
    })
    if (res?.success && res.text.trim()) return { text: res.text.trim(), link, viaModel: true }
    return { text: notes[0].text, title: notes[0].title, link }
  } finally {
    remove?.()
  }
}
