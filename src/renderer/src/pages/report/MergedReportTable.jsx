import React from 'react'

const formatDate = (dateString) => {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-')
  return `${day}-${month}-${year}`
}

const mergeAllEntriesByDate = (milk, products, payments) => {
  const map = new Map()

  milk.forEach((entry) => {
    const key = entry.date
    if (!map.has(key)) map.set(key, [])
    map.get(key).push({ type: 'milk', ...entry })
  })

  products.forEach((entry) => {
    const key = entry.date?.split('-').reverse().join('-')
    if (!map.has(key)) map.set(key, [])
    map.get(key).push({ type: 'product', ...entry })
  })

  payments.forEach((entry) => {
    const key = entry.date?.split('-').reverse().join('-')
    if (!map.has(key)) map.set(key, [])
    map.get(key).push({ type: 'payment', ...entry })
  })

  return [...map.entries()]
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .flatMap(([date, entries]) =>
      entries.map((entry) => ({
        ...entry,
        date
      }))
    )
}

const MergedTableExact = ({ summaryData }) => {
  if (!summaryData) return null
  console.log('Summary Data:', summaryData)
  const entries = mergeAllEntriesByDate(
    summaryData.milk_collections || [],
    summaryData.product_sales || [],
    summaryData.payments || [],
    summaryData.customer_wallet || 0
  )

  let totalMilkQty = 0
  let totalMilkAmount = 0
  let totalProductQty = 0
  let totalProductAmount = 0
  let totalDebit = 0
  let totalCredit = 0

  return (
    <div className="p-4 mt-10 overflow-x-auto">
      <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-800 p-4 rounded-lg shadow mb-4">
        <p className="text-lg font-semibold">
          Account No: <span className="font-bold">{summaryData.milk_collections[0]?.customer_account_number || 'N/A'}</span>
        </p>
        <p className="text-lg font-semibold">
          Customer Name: <span className="font-bold">{summaryData.customer_name || 'N/A'}</span>
        </p>
      </div>

      <div className="relative border rounded overflow-hidden max-h-[70vh]">
        <div className="sticky top-0 z-10">
          <table className="min-w-full border border-white text-white text-sm">
            <thead className="bg-gray-800">
              <tr className="text-center border">
                <th className="border px-2 py-1 w-10">Sr.</th>
                <th className="border px-2 py-1 w-48">Date</th>
                <th className="border px-2 py-1 w-24">Shift</th>
                <th className="border px-2 py-1 w-20">Qty</th>
                <th className="border px-2 py-1 w-20">Rate</th>
                <th className="border px-2 py-1 w-24">Total</th>
                <th className="border px-2 py-1 w-48">Product + Qty</th>
                <th className="border px-2 py-1 w-60">Product Total Amount</th>
                <th className="border px-2 py-1 w-24">Debit [Received]</th>
                <th className="border px-2 py-1 w-24">Credit [Given]</th>
                <th className="border px-2 py-1 w-40">Message</th>
              </tr>
            </thead>
          </table>
        </div>
        <div className="overflow-auto max-h-[calc(70vh-7rem)]">
          <table className="min-w-full text-sm">
            <tbody>
              {entries.map((entry, idx) => {
                const isMilk = entry.type === 'milk'
                const isProduct = entry.type === 'product'
                const isPayment = entry.type === 'payment'

                if (isMilk) {
                  totalMilkQty += parseFloat(entry.quantity || 0)
                  totalMilkAmount += parseFloat(entry.total_amount || 0)
                }
                if (isProduct) {
                  totalProductQty += parseInt(entry.qty || 0)
                  totalProductAmount += parseFloat(entry.total || 0)
                }
                if (isPayment) {
                  if (entry.credit_debit_mode === 'received') {
                    totalDebit += parseFloat(entry.amount || 0)
                  } else {
                    totalCredit += parseFloat(entry.amount || 0)
                  }
                }

                return (
                  <tr key={idx} className="text-center border border-gray-600">
                    <td className="border px-2 py-1 text-black">{idx + 1}</td>
                    <td className="border px-2 py-1 text-black">{formatDate(entry.date)}</td>
                    <td className="border px-2 py-1 text-black">{isMilk ? entry.shift : ''}</td>
                    <td className="border px-2 py-1 text-black">{isMilk ? entry.quantity : ''}</td>
                    <td className="border px-2 py-1 text-black">{isMilk ? entry.base_rate : ''}</td>
                    <td className="border px-2 py-1 text-black">{isMilk ? entry.total_amount : ''}</td>
                    <td className="border px-2 py-1 text-black">
                      {isProduct ? `${entry.product?.name || ''} × ${entry.qty}` : ''}
                    </td>
                    <td className="border px-2 py-1 text-black">{isProduct ? entry.total : ''}</td>
                    <td className="border px-2 py-1 text-green-500">
                      {isPayment && entry.credit_debit_mode === 'received' ? entry.amount : ''}
                    </td>
                    <td className="border px-2 py-1 text-red-500">
                      {isPayment && entry.credit_debit_mode === 'given' ? entry.amount : ''}
                    </td>
                    <td className="border px-2 py-1 text-black">{isPayment ? entry.note : ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="sticky bottom-0">
          <table className="min-w-full text-sm">
            <tfoot>
              <tr className="bg-gray-800 font-semibold text-sm text-white">
                <td className="border px-2 py-2" colSpan={2}>
                  Total Milk Qty: {totalMilkQty} Ltr
                </td>
                <td className="border px-2 py-2" colSpan={2}>
                  Total Milk Amount: ₹{totalMilkAmount.toFixed(2)}
                </td>
                <td className="border px-2 py-2" colSpan={2}>
                  Purchased Products: {totalProductQty}
                </td>
                <td className="border px-2 py-2">₹{totalProductAmount.toFixed(2)}</td>
                <td className="border px-2 py-2 text-green-500">₹{totalDebit.toFixed(2)}</td>
                <td className="border px-2 py-2 text-red-500">₹{totalCredit.toFixed(2)}</td>
                <td className="border px-2 py-2" colSpan={2}>
                  Total Paybal Amount: ₹{parseFloat(summaryData.customer_wallet || 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MergedTableExact
