/**
 * What the assistant knows about using the software, and a small search over it (the "retrieval" part of
 * RAG). The best matching notes are handed to the chat model, which answers from them only. Without the model
 * the best note itself is shown.
 *
 * To teach the assistant something new, add or edit a note here. Keep each note about one page or task.
 */

export const HELP_NOTES = [
  {
    title: 'Dashboard',
    page: '/',
    words: 'dashboard home overview today summary morning evening customers amount',
    text: 'The Dashboard shows today at a glance: milk collected in the morning and evening shifts, the amount for each shift, the total amount and how many customers gave milk in each shift. Press Refresh on the Dashboard to load the latest numbers.'
  },
  {
    title: 'Daily Milk Collection (making an entry)',
    page: '/milkcollection',
    words:
      'milk collection entry add milk doodh entry account quantity fat clr snf rate shift morning evening enter key submit',
    text: 'Open Milk Center > Milk Collection. Pick the milk type, shift and date, then type the Account No and press Enter: the customer name, care of and mobile fill in by themselves. Type Quantity, FAT and CLR or SNF, pressing Enter to move to the next field. The rate is looked up from the Rate Chart when SNF is entered, and Total Amount = quantity x rate (plus Other Price if given). Press Submit (or Enter on the last field) to save. The list on the page shows the entries of the chosen day and shift.'
  },
  {
    title: 'Auto Print of the milk slip',
    page: '/milkcollection',
    words: 'auto print slip printer print receipt paper thermal 58mm print not working',
    text: 'On the Milk Collection page the Auto Print switch (next to Submit) prints a slip after each saved entry. Turn the switch off to stop printing. The slip prints silently on the default printer on a 50 mm x 300 mm page. If nothing prints, check that the thermal printer is the Windows default printer and is switched on; the app shows a message "Slip not printed" with the reason when printing fails.'
  },
  {
    title: 'Low SNF rule (rule 3)',
    page: '/ratechart',
    words:
      'low snf rule 3 not accepted 8.2 8.1 8.0 percent 94 92 90 fat 5 rate 500 per kg fat 8.3 8.4 93 87',
    text: 'Rule 3 for low SNF milk: SNF 8.2, 8.1 and 8.0 are paid 94%, 92% and 90% of the 8.5 SNF rate (for FAT up to 5.0). For FAT 5.1 to 10.0, milk below 8.3 SNF is not accepted. Where the list has no price for SNF 8.4 or 8.3 (FAT above 5.0), they are paid 93% and 87% of the 9.0 SNF rate. Milk below 8.0 SNF is paid Rs 500 per kg of fat.'
  },
  {
    title: 'Rate Chart',
    page: '/ratechart',
    words: 'rate chart price list rate change edit fat snf grid save import excel export excel',
    text: 'Milk Center > Rate Chart holds the price for every FAT (rows) and SNF (columns, from 8.1). Click a cell and type the price, then press Save at the top to store the chart. Import Excel loads a chart from an Excel file and Export Excel saves the current chart as Excel. The milk collection page uses this chart to find the rate.'
  },
  {
    title: 'Scan a printed rate list (OCR)',
    page: '/ratechart',
    words: 'scan picture photo image ocr read rate list camera crop preview change picture',
    text: 'On the Rate Chart page press the green Scan picture button and choose a photo of the printed rate list. A crop window opens: drag the box around the table (Whole picture selects everything, Change picture picks another photo), then press Read table. The prices read appear in a preview; red cells need checking or typing in, and SNF 8.1 and 8.2 are worked out from the 8.5 price. Press Save in the preview to put them in the chart, then Save at the top of the page to store it. Scanning works offline.'
  },
  {
    title: 'SNF Chart and SNF formula',
    page: '/snfchart',
    words: 'snf chart formula clr fat calculate snf from clr',
    text: 'Milk Center > SNF Chart shows the SNF for every FAT (3.0 to 10.0) and CLR (22 to 30) combination. The SNF Formula Settings at the top are used to build that chart; change them and save to rebuild it. When CLR is typed on the milk collection page, SNF is worked out from this chart.'
  },
  {
    title: 'Customers',
    page: '/customer',
    words:
      'customer add new customer edit delete member kisan grahak account number aadhar bank ifsc mobile care of animals cows buffalos customer type buyer seller',
    text: 'Customers > Customer lists all customers with search. Use Add Customer to create one: account number, name, care of, mobile, address, Aadhar, Jan Aadhar, bank account and IFSC, customer type (seller gives milk, buyer takes milk), number of cows and buffalos, and the CM Subsidy Code if the customer gets the CM subsidy. Click a customer to view, edit or delete. The list also shows each wallet balance.'
  },
  {
    title: 'CM Subsidy',
    page: '/cmsubsidylist',
    words: 'cm subsidy mukhyamantri subsidy list report subsidy code amount per litre',
    text: 'Customers > CM Subsidy List shows the milk of customers who have a CM Subsidy Code. Pick the term or a date range and generate: it lists each subsidy customer with total milk, average fat and SNF. Enter the subsidy amount per unit of milk to see the estimated subsidy. Customers appear here only when their CM Subsidy Code is filled in.'
  },
  {
    title: 'Cash Entry and Bulk Hisaab Kitaab',
    page: '/cashentry',
    words:
      'cash entry payment paid received given advance udhar jama bulk hisaab kitaab settle payment manual entry transaction mode',
    text: "Accounts > Cash Entry opens the cash entry window. Manual Cash Entry records one payment: account number, date, amount, transaction mode (received from or given to the customer) and a note. Bulk Hisaab Kitaab settles payments for many customers at once: pick the dates to load each customer's milk total and amount, then enter the payments and save."
  },
  {
    title: 'Payment Register',
    page: '/paymentregister',
    words: 'payment register ledger bhugtan members total milk amount grand total cm subsidy',
    text: 'Accounts > Payment Register lists every member with total milk and amount for the chosen dates, with the CM subsidy and a grand total. Pick From and To dates and press Generate.'
  },
  {
    title: 'Customer report',
    page: '/reports',
    words: 'report customer report statement passbook khata hisab export excel pdf print wallet',
    text: "Reports shows one customer's statement: enter the account number, pick this week, this month or a date range, and generate. It lists milk entries, product sales and payments by date with totals and the wallet balance, and can be exported to Excel."
  },
  {
    title: 'Corrections (milk, product, cash)',
    page: '/milkCorrection',
    words:
      'correction edit wrong entry delete entry change milk entry mistake fix product correction cash correction',
    text: 'All Correction has three pages. Milk: pick dates (all customers or one account), search, then edit or delete a wrong milk entry. Product: fix or delete product sales. Cash: fix or delete cash entries.'
  },
  {
    title: 'Products, stock and product sale',
    page: '/inventory',
    words: 'product inventory stock in out category unit price feed dana sell product sale sold',
    text: "Products > Inventory holds categories, products (name, price, unit) and stock records: add stock coming in or going out with Add Product Stock. Product Sell records a product sold to a customer; its amount is taken from the customer's account."
  },
  {
    title: 'Daily Milk Sale',
    page: '/dailyMilkSale',
    words: 'daily milk sale sell milk buyer sale entry milk type payment mode rate per litre',
    text: 'Milk Center > Daily Milk Sale records milk sold to a buyer: account number (name fills in), sale date, shift, milk type, quantity, rate per litre and payment mode. The list below shows the submitted sales, newest first.'
  },
  {
    title: 'Milk Dispatch and Head Dairy',
    page: '/milkDispatch',
    words: 'milk dispatch head dairy master send milk dairy plant tanker',
    text: 'Head Dairy Master keeps the dairies you send milk to (name, contact person, mobile, address). Milk Dispatch records the milk sent to a head dairy.'
  },
  {
    title: 'Audit Logs',
    page: '/auditlogs',
    words: 'audit log activity history who changed deleted login track',
    text: 'Audit Logs lists who did what and when: logins, created, updated and deleted records. Filter by search, action or dates and click an entry to see the details. It loads all matching entries and shows them 20 per page.'
  },
  {
    title: 'Updates and Version Control',
    page: '/update-history',
    words: 'update new version install update version control rollback older version download',
    text: 'The app tells you when a new version is ready; press Update to download and install it (it never downloads by itself). Version Control lists the latest 10 versions and can install an older one if a new version causes a problem.'
  },
  {
    title: 'Settings',
    page: '/settings',
    words: 'settings dairy name address contact font size sidebar colour theme',
    text: 'Settings holds the business info (dairy name, address, contact) and lets you change the font size of the whole software, the sidebar font size and the sidebar colour.'
  },
  {
    title: 'This assistant',
    page: '/assistant',
    words: 'assistant chat ask question model offline download what can you do',
    text: 'Ask Assistant answers questions about this software and about your data: customer details, customer reports for one or many accounts, milk collection totals by date and shift, CM subsidy, payment register, cash entries, stock, product sales and milk sales. It works offline; the small language model (378 MB) is downloaded once. Numbers always come straight from your server.'
  }
]

/** Menu name of each page a note points to, for the "Open …" button. */
export const PAGE_NAMES = {
  '/': 'Dashboard',
  '/milkcollection': 'Milk Collection',
  '/ratechart': 'Rate Chart',
  '/snfchart': 'SNF Chart',
  '/customer': 'Customers',
  '/cmsubsidylist': 'CM Subsidy List',
  '/cashentry': 'Cash Entry',
  '/paymentregister': 'Payment Register',
  '/reports': 'Reports',
  '/milkCorrection': 'Milk Correction',
  '/inventory': 'Inventory',
  '/dailyMilkSale': 'Daily Milk Sale',
  '/milkDispatch': 'Milk Dispatch',
  '/auditlogs': 'Audit Logs',
  '/update-history': 'Version Control',
  '/settings': 'Settings',
  '/assistant': 'Ask Assistant'
}

const SYNONYMS = {
  doodh: 'milk',
  dudh: 'milk',
  hisab: 'report',
  hisaab: 'report',
  khata: 'report',
  grahak: 'customer',
  kisan: 'customer',
  bhugtan: 'payment',
  chhapna: 'print',
  parchi: 'slip',
  daam: 'rate',
  bhav: 'rate',
  photo: 'picture',
  galti: 'correction',
  badlo: 'change',
  naya: 'new'
}

const STOP = new Set(
  'a an the to of in on and or is are do does i my me how what where kaise ka ki ke ko hai kya se me mein karna kare karen'.split(
    ' '
  )
)

const words = (text) =>
  String(text)
    .toLowerCase()
    .split(/[^a-z0-9.ऀ-ॿ]+/)
    .map((w) => SYNONYMS[w] || w)
    .filter((w) => w && !STOP.has(w))

const INDEX = HELP_NOTES.map((note) => ({
  note,
  terms: new Set(words(`${note.title} ${note.words} ${note.words} ${note.text}`))
}))

/** The help notes that best match the question, best first (only those that share a word with it). */
export function searchHelp(question, limit = 2) {
  const asked = [...new Set(words(question))]
  return INDEX.map(({ note, terms }) => ({
    note,
    score: asked.reduce(
      (s, w) =>
        s +
        (terms.has(w)
          ? 1
          : [...terms].some((t) => t.length > 3 && t.startsWith(w.slice(0, 4)))
            ? 0.5
            : 0),
      0
    )
  }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.note)
}
