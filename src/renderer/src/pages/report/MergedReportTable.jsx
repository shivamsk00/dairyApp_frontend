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
  let totalFat = 0
  let totalSNF = 0
  let milkEntryCount = 0

  return (
    <div className="p-4 mt-10 overflow-x-auto">
      {/* <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-800 p-4 rounded-lg shadow mb-4">
        <p className="text-lg font-semibold">
          Account No: <span className="font-bold">{summaryData.milk_collections[0]?.customer_account_number || 'N/A'}</span>
        </p>
        <p className="text-lg font-semibold">
          Customer Name: <span className="font-bold">{summaryData.customer_name || 'N/A'}</span>
        </p>
      </div> */}

      <div className="relative border rounded overflow-hidden max-h-[70vh]">
        <div className="overflow-auto max-h-[calc(70vh-7rem)]">
          <table className="min-w-full border border-white text-sm">
            <thead className="sticky top-0 z-10 bg-gray-800 text-white">
              <tr className="text-center">
                <th className="border px-2 py-1 w-10">Sr.</th>
                <th className="border px-2 py-1 w-24">Date</th>
                <th className="border px-2 py-1 w-20">Shift</th>
                <th className="border px-2 py-1 w-16">Qty (L)</th>
                <th className="border px-2 py-1 w-16">Fat</th>
                <th className="border px-2 py-1 w-16">SNF</th>
                <th className="border px-2 py-1 w-20">Rate</th>
                <th className="border px-2 py-1 w-20">Amount</th>
                <th className="border px-2 py-1 w-40">Product + Qty</th>
                <th className="border px-2 py-1 w-24">Product Amount</th>
                <th className="border px-2 py-1 w-20">Credit</th>
                <th className="border px-2 py-1 w-20">Debit</th>
                <th className="border px-2 py-1 w-32">Message</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => {
                const isMilk = entry.type === 'milk'
                const isProduct = entry.type === 'product'
                const isPayment = entry.type === 'payment'

                if (isMilk) {
                  totalMilkQty += parseFloat(entry.quantity || 0)
                  totalMilkAmount += parseFloat(entry.total_amount || 0)
                  totalFat += parseFloat(entry.fat || 0)
                  totalSNF += parseFloat(entry.snf || 0)
                  milkEntryCount++
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
                  <tr
                    key={idx}
                    className={`text-center border border-gray-600 ${isMilk ? 'bg-blue-50' :
                        isProduct ? 'bg-orange-50' :
                          isPayment ? 'bg-green-50' : 'bg-white'
                      }`}
                  >
                    <td className="border px-2 py-1 text-black w-10 font-medium">{idx + 1}</td>
                    <td className="border px-2 py-1 text-black w-24 font-medium">{formatDate(entry.date)}</td>
                    <td className="border px-2 py-1 text-black w-20">
                      {isMilk ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${entry.shift === 'morning' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'
                          }`}>
                          {entry.shift}
                        </span>
                      ) : ''}
                    </td>
                    <td className="border px-2 py-1 text-blue-600 w-16 font-semibold">
                      {isMilk ? parseFloat(entry.quantity).toFixed(2) : ''}
                    </td>
                    <td className="border px-2 py-1 text-yellow-600 w-16 font-semibold">
                      {isMilk ? `${parseFloat(entry.fat).toFixed(1)}` : ''}
                    </td>
                    <td className="border px-2 py-1 text-purple-600 w-16 font-semibold">
                      {isMilk ? `${parseFloat(entry.snf).toFixed(1)}` : ''}
                    </td>
                    <td className="border px-2 py-1 text-gray-700 w-20">
                      {isMilk ? `₹${parseFloat(entry.base_rate).toFixed(2)}` : ''}
                    </td>
                    <td className="border px-2 py-1 text-green-600 w-20 font-semibold">
                      {isMilk ? `₹${parseFloat(entry.total_amount).toFixed(2)}` : ''}
                    </td>
                    <td className="border px-2 py-1 text-black w-40">
                      {isProduct ? (
                        <div className="text-xs">
                          <div className="font-medium">{entry.product?.name || 'N/A'}</div>
                          <div className="text-gray-600">Qty: {entry.qty}</div>
                        </div>
                      ) : ''}
                    </td>
                    <td className="border px-2 py-1 text-orange-600 w-24 font-semibold">
                      {isProduct ? `₹${parseFloat(entry.total).toFixed(2)}` : ''}
                    </td>
                    <td className="border px-2 py-1 text-green-600 w-20 font-semibold">
                      {isPayment && entry.credit_debit_mode === 'received' ? `₹${parseFloat(entry.amount).toFixed(2)}` : ''}
                    </td>
                    <td className="border px-2 py-1 text-red-600 w-20 font-semibold">
                      {isPayment && entry.credit_debit_mode === 'given' ? `₹${parseFloat(entry.amount).toFixed(2)}` : ''}
                    </td>
                    <td className="border px-2 py-1 text-gray-700 w-32 text-xs">
                      {isPayment ? entry.note : ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>

            {/* Enhanced Footer with Fat and SNF Averages */}
            <tfoot className="sticky bottom-0 bg-gray-800 text-white">
              <tr className="font-semibold text-xs">
                {/* Sr. No Column */}
                <td className="border px-2 py-2 w-10 text-center">
                  <div className="text-xs text-gray-300">#</div>
                </td>

                {/* Date Column */}
                <td className="border px-2 py-2 w-24 text-center">
                  <div className="text-xs text-gray-300">Date</div>
                </td>

                {/* Shift Column - Total Milk Quantity */}
                <td className="border px-2 py-2 w-20 text-center">
                  <div>
                    <div className="text-blue-300 text-xs">Total Milk</div>
                    <div className="font-bold">{totalMilkQty.toFixed(2)} L</div>
                  </div>
                </td>

                {/* Qty Column - Total Milk Amount */}
                <td className="border px-2 py-2 w-16 text-center">
                  <div>
                    <div className="text-green-300 text-xs">Amount</div>
                    <div className="font-bold">₹{totalMilkAmount.toFixed(2)}</div>
                  </div>
                </td>

                {/* Fat Column */}
                <td className="border px-2 py-2 w-16 text-center">
                  <div>
                    <div className="text-yellow-300 text-xs">Avg Fat</div>
                    <div className="font-bold">{milkEntryCount > 0 ? (totalFat / milkEntryCount).toFixed(1) : '0.0'}%</div>
                  </div>
                </td>

                {/* SNF Column */}
                <td className="border px-2 py-2 w-16 text-center">
                  <div>
                    <div className="text-purple-300 text-xs">Avg SNF</div>
                    <div className="font-bold">{milkEntryCount > 0 ? (totalSNF / milkEntryCount).toFixed(1) : '0.0'}%</div>
                  </div>
                </td>

                {/* Rate Column */}
                <td className="border px-2 py-2 w-20 text-center">
                  <div>
                    <div className="text-gray-300 text-xs">Avg Rate</div>
                    <div className="font-bold">
                      ₹{milkEntryCount > 0 ? (totalMilkAmount / totalMilkQty).toFixed(2) : '0.00'}
                    </div>
                  </div>
                </td>

                {/* Amount Column - Collections */}
                <td className="border px-2 py-2 w-20 text-center">
                  <div>
                    <div className="text-indigo-300 text-xs">Collections</div>
                    <div className="font-bold">{milkEntryCount}</div>
                  </div>
                </td>

                {/* Product Column */}
                <td className="border px-2 py-2 w-40 text-center">
                  <div>
                    <div className="text-orange-300 text-xs">Products</div>
                    <div className="font-bold">₹{totalProductAmount.toFixed(2)}</div>
                  </div>
                </td>

                {/* Product Amount Column */}
                <td className="border px-2 py-2 w-24 text-center">
                  <div>
                    <div className="text-orange-300 text-xs">Items</div>
                    <div className="font-bold">{totalProductQty}</div>
                  </div>
                </td>

                {/* Credit Column */}
                <td className="border px-2 py-2 w-20 text-center">
                  <div>
                    <div className="text-green-300 text-xs">Received</div>
                    <div className="font-bold">₹{totalDebit.toFixed(2)}</div>
                  </div>
                </td>

                {/* Debit Column */}
                <td className="border px-2 py-2 w-20 text-center">
                  <div>
                    <div className="text-red-300 text-xs">Given</div>
                    <div className="font-bold">₹{totalCredit.toFixed(2)}</div>
                  </div>
                </td>

                {/* Message Column - Net Balance */}
                <td className="border px-2 py-2 w-32 text-center">
                  <div>
                    <div className="text-indigo-300 text-xs">Total Amount</div>
                    <div className="font-bold">₹{parseFloat(summaryData.net_milk_balance || 0).toFixed(2)}</div>
                  </div>
                </td>
              </tr>

              {/* Second Row for Current Balance (Optional) */}
              <tr className="bg-gray-700">
                <td className="border px-2 py-2 text-center" colSpan="13">
                  <div className="flex justify-center items-center space-x-6 gap-4">
                    <div>
                      <span className="text-gray-300 text-xs mr-3">Current Wallet Balance: </span>
                      <span className={`font-bold text-lg ${parseFloat(summaryData.customer_wallet || 0) < 0 ? 'text-red-300' : 'text-green-300'}`}>
                        ₹{parseFloat(summaryData.customer_wallet || 0).toFixed(2)}
                      </span>
                    </div>
                    
                  </div>
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
