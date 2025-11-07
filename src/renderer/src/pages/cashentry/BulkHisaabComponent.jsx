// import React, { useEffect, useRef, useState } from 'react'
// import CustomToast from '../../helper/costomeToast'
// import useHomeStore from '../../zustand/useHomeStore'
// // import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaChartBar, FaIndianRupeeSign } from 'react-icons/fa6'
// // import { FaArrowTrendUp, FaArrowTrendDown, FaUndo } from 'react-icons/fa'
// import {
//     FaCalendarAlt,
//     FaCheckCircle,
//     FaChartBar,
//     FaArrowUp,
//     FaArrowDown,
//     FaUndo,

// } from 'react-icons/fa'

// const BulkHisaabComponent = () => {
//     const today = new Date().toISOString().split('T')[0]

//     const [startDate, setStartDate] = useState('')
//     const [endDate, setEndDate] = useState('')
//     const [milkEntries, setMilkEntries] = useState([])
//     const [loading, setLoading] = useState(false)
//     const [submitting, setSubmitting] = useState(false)
//     const [payments, setPayments] = useState([])
//     const [summary, setSummary] = useState(null)

//     // Zustand store hooks
//     const dateWiseMilkEntries = useHomeStore((state) => state.dateWiseMilkEntries) // You need to add this
//     const bulkRecordPayment = useHomeStore((state) => state.bulkRecordPayment) // You need to add this

//     // Fetch milk entries based on date range
//     const fetchMilkEntries = async () => {
//         if (!startDate || !endDate) {
//             return CustomToast.error('Please select both start and end dates')
//         }

//         if (new Date(startDate) > new Date(endDate)) {
//             return CustomToast.error('Start date must be before end date')
//         }

//         try {
//             setLoading(true)
//             const res = await dateWiseMilkEntries({
//                 start_date: startDate,
//                 end_date: endDate
//             })

//             if (res.status_code === 200) {
//                 setMilkEntries(res.data || [])
//                 setSummary(res.summary || null)

//                 // Initialize payment form with empty amounts
//                 setPayments(
//                     (res.data || []).map((entry) => ({
//                         customer_id: entry.customer_id,
//                         customer_account_number: entry.customer_account_number,
//                         customer_name: entry.customer_name,
//                         total_quantity: entry.total_quantity,
//                         total_amount: entry.total_amount,
//                         wallet_balance: entry.wallet_balance,
//                         payment_amount: '',
//                         credit_debit_mode: 'given',
//                         mode: 'cash',
//                         note: ''
//                     }))
//                 )
//                 CustomToast.success('Milk entries loaded successfully')
//             } else {
//                 CustomToast.error(res.message || 'Failed to fetch entries')
//                 setMilkEntries([])
//                 setPayments([])
//             }
//         } catch (error) {
//             console.error('Error fetching milk entries:', error)
//             CustomToast.error('Error fetching milk entries')
//         } finally {
//             setLoading(false)
//         }
//     }

//     // Handle payment field changes
//     const handlePaymentChange = (index, field, value) => {
//         const updatedPayments = [...payments]
//         updatedPayments[index][field] = value
//         setPayments(updatedPayments)
//     }

//     // Reset payment amount
//     const handleResetAmount = (index) => {
//         const updatedPayments = [...payments]
//         updatedPayments[index].payment_amount = ''
//         setPayments(updatedPayments)
//     }

//     // Submit bulk payments
//     const handleBulkSubmit = async () => {
//         // Validate at least one payment
//         const validPayments = payments.filter((p) => p.payment_amount && parseFloat(p.payment_amount) > 0)

//         if (validPayments.length === 0) {
//             return CustomToast.error('Please enter at least one payment amount')
//         }

//         try {
//             setSubmitting(true)

//             const payload = {
//                 start_date: startDate,
//                 end_date: endDate,
//                 payments: validPayments.map((p) => ({
//                     customer_id: p.customer_id,
//                     customer_account_number: p.customer_account_number,
//                     amount: parseFloat(p.payment_amount),
//                     credit_debit_mode: p.credit_debit_mode,
//                     mode: p.mode,
//                     note: p.note
//                 }))
//             }

//             const res = await bulkRecordPayment(payload)

//             if (res.status_code === 201) {
//                 CustomToast.success(`Payments recorded for ${res.payments_created} customers`)

//                 // Reset form
//                 setPayments([])
//                 setMilkEntries([])
//                 setSummary(null)
//                 setStartDate('')
//                 setEndDate('')
//             } else {
//                 CustomToast.error(res.message || 'Failed to record payments')
//             }
//         } catch (error) {
//             console.error('Error submitting payments:', error)
//             CustomToast.error('Error recording payments')
//         } finally {
//             setSubmitting(false)
//         }
//     }

//     // Calculate totals
//     const calculateTotals = () => {
//         return payments.reduce(
//             (acc, p) => ({
//                 totalPayment: acc.totalPayment + (parseFloat(p.payment_amount) || 0),
//                 totalEntries: acc.totalEntries + 1,
//                 enteredPayments: acc.enteredPayments + (p.payment_amount ? 1 : 0)
//             }),
//             { totalPayment: 0, totalEntries: 0, enteredPayments: 0 }
//         )
//     }

//     const totals = calculateTotals()
//     const startDateRef = useRef()
//     const endDateRef = useRef()

//     return (
//         <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-3xl shadow-2xl p-8 mb-8 border border-slate-200">
//             {/* Header */}
//             <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-slate-200">
//                 <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg">
//                     <FaChartBar className="text-white text-2xl" />
//                 </div>
//                 <div>
//                     <h2 className="text-3xl font-bold text-slate-800">Bulk Hisaab Kitaab (हिसाब किताब)</h2>
//                     <p className="text-slate-600 mt-1">Settle payments for multiple customers in one go</p>
//                 </div>
//             </div>

//             {/* Date Range Selection */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//                 <div>
//                     <label className="block text-sm font-semibold text-slate-700 mb-2">
//                         Start Date <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                         <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
//                         <input
//                             type="date"
//                             ref={startDateRef}
//                             value={startDate}
//                             onChange={(e) => setStartDate(e.target.value)}
//                             max={today}
//                             className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
//                         />
//                     </div>
//                 </div>

//                 <div>
//                     <label className="block text-sm font-semibold text-slate-700 mb-2">
//                         End Date <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                         <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
//                         <input
//                             type="date"
//                             ref={endDateRef}
//                             value={endDate}
//                             onChange={(e) => setEndDate(e.target.value)}
//                             max={today}
//                             className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
//                         />
//                     </div>
//                 </div>

//                 <div className="flex items-end">
//                     <button
//                         onClick={fetchMilkEntries}
//                         disabled={loading}
//                         className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
//                     >
//                         {loading ? 'Loading...' : 'Load Customers'}
//                     </button>
//                 </div>
//             </div>

//             {/* Summary Section */}
//             {summary && (
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//                     <div className="bg-white rounded-xl p-6 border-2 border-blue-100 shadow-md">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-slate-600 font-semibold">Total Customers</p>
//                                 <p className="text-3xl font-bold text-blue-600 mt-2">{summary.total_customers}</p>
//                             </div>
//                             <FaChartBar className="text-blue-300 text-3xl" />
//                         </div>
//                     </div>

//                     <div className="bg-white rounded-xl p-6 border-2 border-green-100 shadow-md">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-slate-600 font-semibold">Total Milk (L)</p>
//                                 <p className="text-3xl font-bold text-green-600 mt-2">{summary.total_quantity?.toFixed(2)}</p>
//                             </div>
//                             <FaArrowUp className="text-green-300 text-3xl" />
//                         </div>
//                     </div>

//                     <div className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-md">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-slate-600 font-semibold">Total Amount</p>
//                                 <p className="text-3xl font-bold text-purple-600 mt-2">₹{summary.total_amount?.toFixed(2)}</p>
//                             </div>

//                         </div>
//                     </div>

//                     <div className="bg-white rounded-xl p-6 border-2 border-orange-100 shadow-md">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-slate-600 font-semibold">Entered Payments</p>
//                                 <p className="text-3xl font-bold text-orange-600 mt-2">{totals.enteredPayments}/{totals.totalEntries}</p>
//                             </div>
//                             <FaCheckCircle className="text-orange-300 text-3xl" />
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Payment Table */}
//             {payments.length > 0 && (
//                 <div className="mb-8">
//                     <div className="overflow-x-auto rounded-xl border-2 border-slate-200 shadow-lg">
//                         <table className="w-full">
//                             <thead className="bg-gradient-to-r from-indigo-600 to-blue-600">
//                                 <tr>
//                                     <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">#</th>
//                                     <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Customer Name</th>
//                                     <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">A/c #</th>
//                                     <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Milk (L)</th>
//                                     <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Amount</th>
//                                     <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Wallet</th>
//                                     <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Payment</th>
//                                     <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Mode</th>
//                                     <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Type</th>
//                                     <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Note</th>
//                                     <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-100">
//                                 {payments.map((payment, index) => (
//                                     <tr key={index} className="hover:bg-indigo-50 transition-colors">
//                                         <td className="px-4 py-4 text-sm font-semibold text-slate-600">{index + 1}</td>
//                                         <td className="px-4 py-4 text-sm font-semibold text-slate-700">{payment.customer_name}</td>
//                                         <td className="px-4 py-4 text-sm font-bold text-indigo-600">{payment.customer_account_number}</td>
//                                         <td className="px-4 py-4 text-sm text-right font-semibold text-slate-700">
//                                             {payment.total_quantity?.toFixed(2)}
//                                         </td>
//                                         <td className="px-4 py-4 text-sm text-right font-bold text-green-600">
//                                             ₹{payment.total_amount?.toFixed(2)}
//                                         </td>
//                                         <td className="px-4 py-4 text-sm text-right font-bold text-blue-600">
//                                             ₹{parseFloat(payment.wallet_balance)?.toFixed(2)}
//                                         </td>
//                                         <td className="px-4 py-4">
//                                             <div className="relative">
//                                                 <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
//                                                 <input
//                                                     type="number"
//                                                     step="0.01"
//                                                     placeholder="0.00"
//                                                     value={payment.payment_amount}
//                                                     onChange={(e) => handlePaymentChange(index, 'payment_amount', e.target.value)}
//                                                     className="w-full pl-6 pr-3 py-2 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm font-semibold"
//                                                 />
//                                             </div>
//                                         </td>
//                                         <td className="px-4 py-4">
//                                             <select
//                                                 value={payment.mode}
//                                                 onChange={(e) => handlePaymentChange(index, 'mode', e.target.value)}
//                                                 className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium"
//                                             >
//                                                 <option value="cash">Cash</option>
//                                                 <option value="bank">Bank</option>
//                                                 <option value="cheque">Cheque</option>
//                                             </select>
//                                         </td>
//                                         <td className="px-4 py-4">
//                                             <select
//                                                 value={payment.credit_debit_mode}
//                                                 onChange={(e) => handlePaymentChange(index, 'credit_debit_mode', e.target.value)}
//                                                 className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium"
//                                             >
//                                                 <option value="given">Given </option>
//                                                 <option value="received">Received </option>
//                                             </select>
//                                         </td>
//                                         <td className="px-4 py-4">
//                                             <input
//                                                 type="text"
//                                                 placeholder="Note..."
//                                                 value={payment.note}
//                                                 onChange={(e) => handlePaymentChange(index, 'note', e.target.value)}
//                                                 className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
//                                             />
//                                         </td>
//                                         <td className="px-4 py-4 text-center">
//                                             <button
//                                                 onClick={() => handleResetAmount(index)}
//                                                 className="p-2 hover:bg-slate-200 rounded-lg transition-all transform hover:scale-110"
//                                                 title="Reset"
//                                             >
//                                                 <FaUndo className="text-slate-500 text-sm" />
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Totals Footer */}
//                     <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-200">
//                             <p className="text-sm text-slate-600 font-semibold mb-2">Entries with Payment</p>
//                             <p className="text-2xl font-bold text-indigo-600">{totals.enteredPayments}</p>
//                         </div>

//                         <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-200">
//                             <p className="text-sm text-slate-600 font-semibold mb-2">Total Payment Amount</p>
//                             <p className="text-2xl font-bold text-green-600">₹{totals.totalPayment.toFixed(2)}</p>
//                         </div>

//                         <div className="flex gap-3">
//                             <button
//                                 onClick={() => {
//                                     setPayments([])
//                                     setMilkEntries([])
//                                     setSummary(null)
//                                     setStartDate('')
//                                     setEndDate('')
//                                 }}
//                                 className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 font-bold py-3 rounded-lg transition-all transform hover:scale-105"
//                             >
//                                 Clear
//                             </button>
//                             <button
//                                 onClick={handleBulkSubmit}
//                                 disabled={submitting || totals.enteredPayments === 0}
//                                 className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
//                             >
//                                 {submitting ? 'Processing...' : 'Update All Payments & Wallets'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Empty State */}
//             {!loading && milkEntries.length === 0 && summary === null && (
//                 <div className="text-center py-16">
//                     <FaChartBar className="mx-auto text-slate-300 text-5xl mb-4" />
//                     <p className="text-lg font-semibold text-slate-700 mb-2">Select dates to load customer data</p>
//                     <p className="text-sm text-slate-500">Choose a date range to view milk collection and make payments</p>
//                 </div>
//             )}
//         </div>
//     )
// }

// export default BulkHisaabComponent

import React, { useEffect, useRef, useState } from 'react'
import CustomToast from '../../helper/costomeToast'
import useHomeStore from '../../zustand/useHomeStore'
import {
    FaCalendarAlt,
    FaCheckCircle,
    FaChartBar,
    FaArrowUp,
    FaArrowDown,
    FaUndo,
    FaSave,
    FaSpinner
} from 'react-icons/fa'

const BulkHisaabComponent = () => {
    const today = new Date().toISOString().split('T')[0]

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [milkEntries, setMilkEntries] = useState([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [payments, setPayments] = useState([])
    const [summary, setSummary] = useState(null)

    // Zustand store hooks
    const dateWiseMilkEntries = useHomeStore((state) => state.dateWiseMilkEntries)
    const bulkRecordPayment = useHomeStore((state) => state.bulkRecordPayment)

    // ✅ Fetch milk entries based on date range
    const fetchMilkEntries = async () => {
        if (!startDate || !endDate) {
            return CustomToast.error('Please select both start and end dates')
        }

        if (new Date(startDate) > new Date(endDate)) {
            return CustomToast.error('Start date must be before end date')
        }

        try {
            setLoading(true)
            const res = await dateWiseMilkEntries({
                start_date: startDate,
                end_date: endDate
            })

            if (res.status_code === 200) {
                setMilkEntries(res.data || [])
                setSummary(res.summary || null)

                // Initialize payment form with empty amounts
                setPayments(
                    (res.data || []).map((entry) => ({
                        customer_id: entry.customer_id,
                        customer_account_number: entry.customer_account_number,
                        customer_name: entry.customer_name,
                        total_quantity: entry.total_quantity,
                        total_amount: entry.total_amount,
                        wallet_balance: entry.wallet_balance,
                        payment_amount: '',
                        credit_debit_mode: 'given',
                        mode: 'cash',
                        note: ''
                    }))
                )
                CustomToast.success('Milk entries loaded successfully')
            } else {
                CustomToast.error(res.message || 'Failed to fetch entries')
                setMilkEntries([])
                setPayments([])
            }
        } catch (error) {
            console.error('Error fetching milk entries:', error)
            CustomToast.error('Error fetching milk entries')
        } finally {
            setLoading(false)
        }
    }

    // Handle payment field changes
    const handlePaymentChange = (index, field, value) => {
        const updatedPayments = [...payments]
        updatedPayments[index][field] = value
        setPayments(updatedPayments)
    }

    // Reset payment amount
    const handleResetAmount = (index) => {
        const updatedPayments = [...payments]
        updatedPayments[index].payment_amount = ''
        setPayments(updatedPayments)
    }

    // ✅ SINGLE API CALL - Save all entries and payments together
    const handleBulkSubmit = async () => {
        // Validate that at least one payment is entered
        const validPayments = payments.filter((p) => p.payment_amount && parseFloat(p.payment_amount) > 0)

        if (validPayments.length === 0) {
            return CustomToast.error('Please enter at least one payment amount')
        }

        try {
            setSubmitting(true)

            // ✅ Prepare single payload with both milk entries and payments
            const payload = {
                start_date: startDate,
                end_date: endDate,
                payments: validPayments.map((p) => ({
                    customer_id: p.customer_id,
                    customer_account_number: p.customer_account_number,
                    amount: parseFloat(p.payment_amount),
                    credit_debit_mode: p.credit_debit_mode,
                    mode: p.mode,
                    note: p.note,
                    // ✅ Include milk collection data
                    total_quantity: p.total_quantity,
                    total_amount: p.total_amount
                }))
            }

            console.log('Submitting all data via single API:', payload)

            // ✅ Call only this ONE API function
            const res = await bulkRecordPayment(payload)

            if (res.status_code === 201 || res.status_code === 200) {
                CustomToast.success(`✓ Success! ${res.payments_created || validPayments.length} customers processed`)

                if (res.data?.wallet_updates) {
                    console.log('Wallet Updates:', res.data.wallet_updates)
                }

                // Reset all form data
                setPayments([])
                setMilkEntries([])
                setSummary(null)
                setStartDate('')
                setEndDate('')
            } else {
                CustomToast.error(res.message || 'Failed to process payments')
            }
        } catch (error) {
            console.error('Error submitting bulk payment:', error)
            CustomToast.error('Error processing bulk payment')
        } finally {
            setSubmitting(false)
        }
    }

    // Calculate totals
    const calculateTotals = () => {
        return payments.reduce(
            (acc, p) => ({
                totalPayment: acc.totalPayment + (parseFloat(p.payment_amount) || 0),
                totalEntries: acc.totalEntries + 1,
                enteredPayments: acc.enteredPayments + (p.payment_amount ? 1 : 0)
            }),
            { totalPayment: 0, totalEntries: 0, enteredPayments: 0 }
        )
    }

    const totals = calculateTotals()
    const startDateRef = useRef()
    const endDateRef = useRef()

    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-3xl shadow-2xl p-8 mb-8 border border-slate-200">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-slate-200">
                <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg">
                    <FaChartBar className="text-white text-2xl" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Bulk Hisaab Kitaab (हिसाब किताब)</h2>
                    <p className="text-slate-600 mt-1">Settle payments for multiple customers in one go</p>
                </div>
            </div>

            {/* Date Range Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="date"
                            ref={startDateRef}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            max={today}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        End Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="date"
                            ref={endDateRef}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            max={today}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-end">
                    <button
                        onClick={fetchMilkEntries}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    >
                        {loading && <FaSpinner className="animate-spin" />}
                        {loading ? 'Loading...' : 'Load Customers'}
                    </button>
                </div>
            </div>

            {/* Summary Section */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 border-2 border-blue-100 shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-semibold">Total Customers</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{summary.total_customers}</p>
                            </div>
                            <FaChartBar className="text-blue-300 text-3xl" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border-2 border-green-100 shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-semibold">Total Milk (L)</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{summary.total_quantity?.toFixed(2)}</p>
                            </div>
                            <FaArrowUp className="text-green-300 text-3xl" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-semibold">Total Amount</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">₹{summary.total_amount?.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border-2 border-orange-100 shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-semibold">Entered Payments</p>
                                <p className="text-3xl font-bold text-orange-600 mt-2">{totals.enteredPayments}/{totals.totalEntries}</p>
                            </div>
                            <FaCheckCircle className="text-orange-300 text-3xl" />
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Table */}
            {payments.length > 0 && (
                <div className="mb-8">
                    <div className="overflow-x-auto rounded-xl border-2 border-slate-200 shadow-lg">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-indigo-600 to-blue-600">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">#</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Customer Name</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">A/c #</th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Milk (L)</th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Wallet</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Payment</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Mode</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Note</th>
                                    <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payments.map((payment, index) => (
                                    <tr key={index} className="hover:bg-indigo-50 transition-colors">
                                        <td className="px-4 py-4 text-sm font-semibold text-slate-600">{index + 1}</td>
                                        <td className="px-4 py-4 text-sm font-semibold text-slate-700">{payment.customer_name}</td>
                                        <td className="px-4 py-4 text-sm font-bold text-indigo-600">{payment.customer_account_number}</td>
                                        <td className="px-4 py-4 text-sm text-right font-semibold text-slate-700">
                                            {payment.total_quantity?.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-right font-bold text-green-600">
                                            ₹{payment.total_amount?.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-right font-bold text-blue-600">
                                            ₹{parseFloat(payment.wallet_balance)?.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={payment.payment_amount}
                                                    onChange={(e) => handlePaymentChange(index, 'payment_amount', e.target.value)}
                                                    className="w-full pl-6 pr-3 py-2 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm font-semibold"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <select
                                                value={payment.mode}
                                                onChange={(e) => handlePaymentChange(index, 'mode', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium"
                                            >
                                                <option value="cash">Cash</option>
                                                <option value="bank">Bank</option>
                                                <option value="cheque">Cheque</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-4">
                                            <select
                                                value={payment.credit_debit_mode}
                                                onChange={(e) => handlePaymentChange(index, 'credit_debit_mode', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium"
                                            >
                                                <option value="given">Given (खिलाया)</option>
                                                <option value="received">Received (लिया)</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-4">
                                            <input
                                                type="text"
                                                placeholder="Note..."
                                                value={payment.note}
                                                onChange={(e) => handlePaymentChange(index, 'note', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                onClick={() => handleResetAmount(index)}
                                                className="p-2 hover:bg-slate-200 rounded-lg transition-all transform hover:scale-110"
                                                title="Reset"
                                            >
                                                <FaUndo className="text-slate-500 text-sm" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Footer */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-200">
                            <p className="text-sm text-slate-600 font-semibold mb-2">Entries with Payment</p>
                            <p className="text-2xl font-bold text-indigo-600">{totals.enteredPayments}</p>
                        </div>

                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-200">
                            <p className="text-sm text-slate-600 font-semibold mb-2">Total Payment Amount</p>
                            <p className="text-2xl font-bold text-green-600">₹{totals.totalPayment.toFixed(2)}</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setPayments([])
                                    setMilkEntries([])
                                    setSummary(null)
                                    setStartDate('')
                                    setEndDate('')
                                }}
                                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 font-bold py-3 rounded-lg transition-all transform hover:scale-105"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={handleBulkSubmit}
                                disabled={submitting || totals.enteredPayments === 0}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        💾 Save All & Update Wallets
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && milkEntries.length === 0 && summary === null && (
                <div className="text-center py-16">
                    <FaChartBar className="mx-auto text-slate-300 text-5xl mb-4" />
                    <p className="text-lg font-semibold text-slate-700 mb-2">Select dates to load customer data</p>
                    <p className="text-sm text-slate-500">Choose a date range to view milk collection and make payments</p>
                </div>
            )}
        </div>
    )
}

export default BulkHisaabComponent
