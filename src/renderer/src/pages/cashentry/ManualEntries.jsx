// import React, { useState, useRef, useEffect } from 'react'
// import { FaPlus, FaTrashAlt, FaSave, FaUndo, FaFileInvoice } from 'react-icons/fa'
// import { HiDocumentText } from 'react-icons/hi2'
// import useHomeStore from '../../zustand/useHomeStore'
// import CustomToast from '../../helper/costomeToast'
// import DateFormate from '../../helper/DateFormate'

// const ManualEntries = () => {
//     const today = new Date().toISOString().split('T')[0]

//     const [voucherData, setVoucherData] = useState({
//         date: today,
//         credit_debit_mode: '', // ✅ Changed from transaction_mode to credit_debit_mode
//     })

//     const [entries, setEntries] = useState([
//         {
//             id: 1,
//             sr_no: 1,
//             customer_name: '', // ✅ Changed from account_head
//             customer_account_number: '', // ✅ Changed from account_number
//             amount: '',
//             note: '', // ✅ Changed from narration
//         }
//     ])

//     const [total, setTotal] = useState(0)

//     const fetchCustomerDetailsByAccount = useHomeStore((state) => state.fetchCustomerDetailsByAccount)
//     const submitCashEntry = useHomeStore((state) => state.submitCashEntry)

//     // Calculate total whenever entries change
//     useEffect(() => {
//         const totalAmount = entries.reduce((sum, entry) => {
//             return sum + (parseFloat(entry.amount) || 0)
//         }, 0)
//         setTotal(totalAmount.toFixed(2))
//     }, [entries])

//     // Add new row
//     const handleAddRow = () => {
//         const newEntry = {
//             id: Date.now(),
//             sr_no: entries.length + 1,
//             customer_name: '',
//             customer_account_number: '',
//             amount: '',
//             note: '',
//         }
//         setEntries([...entries, newEntry])
//     }

//     // Delete row
//     const handleDeleteRow = (id) => {
//         if (entries.length === 1) {
//             CustomToast.error('At least one entry is required')
//             return
//         }
//         const updatedEntries = entries.filter(entry => entry.id !== id).map((entry, index) => ({
//             ...entry,
//             sr_no: index + 1
//         }))
//         setEntries(updatedEntries)
//     }

//     // Handle cell change
//     const handleCellChange = (id, field, value) => {
//         setEntries(entries.map(entry =>
//             entry.id === id ? { ...entry, [field]: value } : entry
//         ))
//     }

//     // Fetch customer details by account number
//     const handleAccountBlur = async (id, accountNo) => {
//         if (!accountNo.trim()) return

//         try {
//             const res = await fetchCustomerDetailsByAccount(accountNo)
//             if (res.status_code === 200) {
//                 setEntries(entries.map(entry =>
//                     entry.id === id
//                         ? { ...entry, customer_name: res.data.name || '', wallet: res.data.wallet || '' } // ✅ Changed to customer_name
//                         : entry
//                 ))
//                 CustomToast.success('Customer details loaded')
//             } else {
//                 CustomToast.error(res.message || 'Customer not found')
//             }
//         } catch (error) {
//             console.error('Error fetching customer:', error)
//             CustomToast.error('Failed to fetch customer details')
//         }
//     }

//     // Handle form submit
//     const handleSubmit = async () => {
//         // Validation
//         if (!voucherData.credit_debit_mode) {
//             return CustomToast.error('Please select transaction mode (Debit/Credit)')
//         }

//         const validEntries = entries.filter(e =>
//             e.customer_account_number && e.amount // ✅ Changed from account_number
//         )

//         if (validEntries.length === 0) {
//             return CustomToast.error('Please add at least one valid entry')
//         }

//         // ✅ Submit each entry individually
//         try {
//             for (const entry of validEntries) {
//                 const payload = {
//                     date: DateFormate(voucherData.date),
//                     amount: entry.amount,
//                     credit_debit_mode: voucherData.credit_debit_mode, // Use the selected mode directly
//                     note: entry.note || '',
//                     customer_account_number: entry.customer_account_number,
//                 }

//                 const res = await submitCashEntry(payload)
//                 if (res.status_code !== 200) {
//                     CustomToast.error(res.message || `Failed to save entry for account ${entry.customer_account_number}`)
//                     return
//                 }
//             }

//             CustomToast.success('All entries saved successfully')
//             handleReset()
//         } catch (error) {
//             console.error('Submit error:', error)
//             CustomToast.error('Error saving entries')
//         }
//     }

//     // Reset form
//     const handleReset = () => {
//         setVoucherData({
//             date: today,
//             credit_debit_mode: '',
//         })
//         setEntries([
//             {
//                 id: 1,
//                 sr_no: 1,
//                 customer_name: '',
//                 customer_account_number: '',
//                 amount: '',
//                 note: '',
//             }
//         ])
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
//             <div className="max-w-[95%] mx-auto">

//                 {/* Header */}
//                 <div className="mb-6">
//                     <div className="flex items-center gap-4">
//                         <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl shadow-lg">
//                             <FaFileInvoice className="text-white text-2xl" />
//                         </div>
//                         <div>
//                             <h1 className="text-3xl font-bold text-slate-800">Manual Cash Entry</h1>
//                             <p className="text-slate-600 mt-1">Create cash voucher entries with multiple transactions</p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Voucher Header Card */}
//                 <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 p-6 mb-6">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div>
//                             <label className="block text-sm font-bold text-slate-700 mb-2">
//                                 Date <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="date"
//                                 value={voucherData.date}
//                                 onChange={(e) => setVoucherData({ ...voucherData, date: e.target.value })}
//                                 max={today}
//                                 className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-semibold text-slate-700"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-bold text-slate-700 mb-2">
//                                 Transaction Mode <span className="text-red-500">*</span>
//                             </label>
//                             <select
//                                 value={voucherData.credit_debit_mode}
//                                 onChange={(e) => setVoucherData({ ...voucherData, credit_debit_mode: e.target.value })}
//                                 className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-semibold text-slate-700"
//                             >
//                                 <option value="">Select Mode</option>
//                                 <option value="given">💸 Given (Debit/Payment)</option>
//                                 <option value="received">💰 Received (Credit)</option>
//                             </select>
//                         </div>

//                         <div className="flex items-end gap-2">
//                             <button
//                                 onClick={handleAddRow}
//                                 className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
//                             >
//                                 <FaPlus /> Add Row
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Entry Table */}
//                 <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 overflow-hidden">
//                     <div className="overflow-x-auto">
//                         <table className="w-full">
//                             <thead className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
//                                 <tr>
//                                     <th className="px-3 py-3 text-left text-xs font-bold uppercase w-12">Sr.</th>
//                                     <th className="px-3 py-3 text-left text-xs font-bold uppercase w-32">Account No.</th>
//                                     <th className="px-3 py-3 text-left text-xs font-bold uppercase">Customer Name</th>
//                                     <th className="px-3 py-3 text-right text-xs font-bold uppercase w-40">
//                                         Amount (₹)
//                                     </th>
//                                     <th className="px-3 py-3 text-left text-xs font-bold uppercase">Note</th>
//                                     <th className="px-3 py-3 text-center text-xs font-bold uppercase w-20">Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-200">
//                                 {entries.map((entry, index) => (
//                                     <tr key={entry.id} className="hover:bg-orange-50 transition-colors">
//                                         {/* Serial Number */}
//                                         <td className="px-3 py-2 text-center font-bold text-slate-600">
//                                             {entry.sr_no}
//                                         </td>

//                                         {/* Account Number */}
//                                         <td className="px-3 py-2">
//                                             <input
//                                                 type="text"
//                                                 value={entry.customer_account_number}
//                                                 onChange={(e) => handleCellChange(entry.id, 'customer_account_number', e.target.value)}
//                                                 onBlur={(e) => handleAccountBlur(entry.id, e.target.value)}
//                                                 className="w-full px-2 py-1.5 rounded border-2 border-slate-200 focus:border-orange-500 outline-none text-sm font-semibold"
//                                                 placeholder="A/c No."
//                                             />
//                                         </td>

//                                         {/* Customer Name */}
//                                         <td className="px-3 py-2">
//                                             <input
//                                                 type="text"
//                                                 value={entry.customer_name}
//                                                 onChange={(e) => handleCellChange(entry.id, 'customer_name', e.target.value)}
//                                                 className="w-full px-2 py-1.5 rounded border-2 border-slate-200 focus:border-orange-500 outline-none text-sm"
//                                                 placeholder="Customer Name"
//                                             />
//                                         </td>

//                                         {/* Amount */}
//                                         <td className="px-3 py-2">
//                                             <input
//                                                 type="number"
//                                                 step="0.01"
//                                                 value={entry.amount}
//                                                 onChange={(e) => handleCellChange(entry.id, 'amount', e.target.value)}
//                                                 className={`w-full px-2 py-1.5 rounded border-2 border-slate-200 outline-none text-sm text-right font-bold ${voucherData.credit_debit_mode === 'given'
//                                                         ? 'focus:border-red-500'
//                                                         : 'focus:border-green-500'
//                                                     }`}
//                                                 placeholder="0.00"
//                                             />
//                                         </td>

//                                         {/* Note */}
//                                         <td className="px-3 py-2">
//                                             <input
//                                                 type="text"
//                                                 value={entry.note}
//                                                 onChange={(e) => handleCellChange(entry.id, 'note', e.target.value)}
//                                                 className="w-full px-2 py-1.5 rounded border-2 border-slate-200 focus:border-orange-500 outline-none text-sm"
//                                                 placeholder="Description..."
//                                             />
//                                         </td>

//                                         {/* Delete Button */}
//                                         <td className="px-3 py-2 text-center">
//                                             <button
//                                                 onClick={() => handleDeleteRow(entry.id)}
//                                                 className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all transform hover:scale-110"
//                                                 title="Delete Row"
//                                             >
//                                                 <FaTrashAlt size={14} />
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}

//                                 {/* Total Row */}
//                                 <tr className="bg-gradient-to-r from-slate-100 to-slate-200 font-bold">
//                                     <td colSpan="3" className="px-3 py-3 text-right text-base text-slate-800">
//                                         TOTAL AMOUNT:
//                                     </td>
//                                     <td className="px-3 py-3 text-right">
//                                         <div className={`text-lg font-bold ${voucherData.credit_debit_mode === 'given' ? 'text-red-700' : 'text-green-700'
//                                             }`}>
//                                             ₹ {total}
//                                         </div>
//                                     </td>
//                                     <td colSpan="2" className="px-3 py-3 text-center">
//                                         {voucherData.credit_debit_mode && (
//                                             <span className={`font-bold text-sm ${voucherData.credit_debit_mode === 'given' ? 'text-red-600' : 'text-green-600'
//                                                 }`}>
//                                                 {voucherData.credit_debit_mode === 'given' ? '💸 Given' : '💰 Received'}
//                                             </span>
//                                         )}
//                                     </td>
//                                 </tr>
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="mt-6 flex gap-4 justify-end">
//                     <button
//                         onClick={handleReset}
//                         className="px-8 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
//                     >
//                         <FaUndo /> Reset
//                     </button>
//                     <button
//                         onClick={handleSubmit}
//                         className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
//                     >
//                         <FaSave /> Save Entry
//                     </button>
//                 </div>

//             </div>
//         </div>
//     )
// }

// export default ManualEntries

import React, { useState, useRef, useEffect } from 'react'
import { FaPlus, FaTrashAlt, FaSave, FaUndo, FaFileInvoice } from 'react-icons/fa'
import { HiDocumentText } from 'react-icons/hi2'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import DateFormate from '../../helper/DateFormate'

const ManualEntries = () => {
    const today = new Date().toISOString().split('T')[0]
    const MIN_ROWS = 10

    const [voucherData, setVoucherData] = useState({
        date: today,
        credit_debit_mode: '',
    })

    const createEmptyRow = (srNo) => ({
        id: Date.now() + srNo,
        sr_no: srNo,
        customer_name: '',
        customer_account_number: '',
        amount: '',
        note: '',
    })

    const [entries, setEntries] = useState(
        Array.from({ length: MIN_ROWS }, (_, i) => createEmptyRow(i + 1))
    )

    const [total, setTotal] = useState(0)

    // ✅ Create refs for input fields
    const inputRefs = useRef({})

    const fetchCustomerDetailsByAccount = useHomeStore((state) => state.fetchCustomerDetailsByAccount)
    const submitCashEntry = useHomeStore((state) => state.submitCashEntry)

    // Calculate total whenever entries change
    useEffect(() => {
        const totalAmount = entries.reduce((sum, entry) => {
            return sum + (parseFloat(entry.amount) || 0)
        }, 0)
        setTotal(totalAmount.toFixed(2))
    }, [entries])

    // Add new row
    const handleAddRow = () => {
        const newEntry = createEmptyRow(entries.length + 1)
        setEntries([...entries, newEntry])
    }

    // Delete row
    const handleDeleteRow = (id) => {
        if (entries.length <= MIN_ROWS) {
            CustomToast.error(`At least ${MIN_ROWS} rows are required`)
            return
        }
        const updatedEntries = entries.filter(entry => entry.id !== id).map((entry, index) => ({
            ...entry,
            sr_no: index + 1
        }))
        setEntries(updatedEntries)
    }

    // ✅ Delete all entries (clear form)
    const handleDeleteAll = () => {
        if (window.confirm('Are you sure you want to clear all entries?')) {
            handleReset()
            CustomToast.success('All entries cleared')
        }
    }

    // Handle cell change
    const handleCellChange = (id, field, value) => {
        setEntries(entries.map(entry =>
            entry.id === id ? { ...entry, [field]: value } : entry
        ))
    }

    // ✅ Handle Enter key press on account number field
    const handleAccountKeyPress = async (e, id) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            const accountNo = e.target.value.trim()
            
            if (accountNo) {
                const success = await handleAccountBlur(id, accountNo)
                // ✅ Move focus to amount field after successful fetch
                if (success && inputRefs.current[`amount-${id}`]) {
                    inputRefs.current[`amount-${id}`].focus()
                }
            }
        }
    }

    // Fetch customer details by account number
    const handleAccountBlur = async (id, accountNo) => {
        if (!accountNo.trim()) return false

        try {
            const res = await fetchCustomerDetailsByAccount(accountNo)
            if (res.status_code === 200) {
                setEntries(entries.map(entry =>
                    entry.id === id
                        ? { ...entry, customer_name: res.data.name || '', wallet: res.data.wallet || '' }
                        : entry
                ))
                CustomToast.success('Customer details loaded')
                return true
            } else {
                CustomToast.error(res.message || 'Customer not found')
                return false
            }
        } catch (error) {
            console.error('Error fetching customer:', error)
            CustomToast.error('Failed to fetch customer details')
            return false
        }
    }

    // Handle form submit
    const handleSubmit = async () => {
        // Validation
        if (!voucherData.credit_debit_mode) {
            return CustomToast.error('Please select transaction mode (Debit/Credit)')
        }

        const validEntries = entries.filter(e =>
            e.customer_account_number && e.amount
        )

        if (validEntries.length === 0) {
            return CustomToast.error('Please add at least one valid entry')
        }

        // Submit each entry individually
        try {
            for (const entry of validEntries) {
                const payload = {
                    date: DateFormate(voucherData.date),
                    amount: entry.amount,
                    credit_debit_mode: voucherData.credit_debit_mode,
                    note: entry.note || '',
                    customer_account_number: entry.customer_account_number,
                }

                const res = await submitCashEntry(payload)
                if (res.status_code !== 200) {
                    CustomToast.error(res.message || `Failed to save entry for account ${entry.customer_account_number}`)
                    return
                }
            }

            CustomToast.success('All entries saved successfully')
            handleReset()
        } catch (error) {
            console.error('Submit error:', error)
            CustomToast.error('Error saving entries')
        }
    }

    // Reset form
    const handleReset = () => {
        setVoucherData({
            date: today,
            credit_debit_mode: '',
        })
        setEntries(Array.from({ length: MIN_ROWS }, (_, i) => createEmptyRow(i + 1)))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
            <div className="max-w-[100%] mx-auto">

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl shadow-lg">
                                <FaFileInvoice className="text-white text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800">Manual Cash Entry</h1>
                                <p className="text-slate-600 mt-1">Create cash voucher entries with multiple transactions</p>
                            </div>
                        </div>

                        {/* ✅ Action Buttons in Header */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteAll}
                                className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
                                title="Delete All Entries"
                            >
                                <FaTrashAlt /> Delete All
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
                            >
                                <FaUndo /> Reset
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                            >
                                <FaSave /> Save Entry
                            </button>
                        </div>
                    </div>
                </div>

                {/* Voucher Header Card */}
                <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={voucherData.date}
                                onChange={(e) => setVoucherData({ ...voucherData, date: e.target.value })}
                                max={today}
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-semibold text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Transaction Mode <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={voucherData.credit_debit_mode}
                                onChange={(e) => setVoucherData({ ...voucherData, credit_debit_mode: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-semibold text-slate-700"
                            >
                                <option value="">Select Mode</option>
                                <option value="given">💸 Given (Debit/Payment)</option>
                                <option value="received">💰 Received (Credit)</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                onClick={handleAddRow}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                            >
                                <FaPlus /> Add Row
                            </button>
                        </div>
                    </div>
                </div>

                {/* Entry Table */}
                <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-bold uppercase w-12">Sr.</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold uppercase w-32">Account No.</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">Customer Name</th>
                                    <th className="px-3 py-3 text-right text-xs font-bold uppercase w-40">
                                        Amount (₹)
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">Note</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold uppercase w-20">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {entries.map((entry, index) => (
                                    <tr key={entry.id} className="hover:bg-orange-50 transition-colors">
                                        {/* Serial Number */}
                                        <td className="px-3 py-2 text-center font-bold text-slate-600">
                                            {entry.sr_no}
                                        </td>

                                        {/* Account Number */}
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={entry.customer_account_number}
                                                onChange={(e) => handleCellChange(entry.id, 'customer_account_number', e.target.value)}
                                                onKeyPress={(e) => handleAccountKeyPress(e, entry.id)}
                                                onBlur={(e) => handleAccountBlur(entry.id, e.target.value)}
                                                className="w-full px-2 py-1.5 rounded border-2 border-slate-200 focus:border-orange-500 outline-none text-sm font-semibold"
                                                placeholder="A/c No."
                                            />
                                        </td>

                                        {/* Customer Name */}
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={entry.customer_name}
                                                onChange={(e) => handleCellChange(entry.id, 'customer_name', e.target.value)}
                                                className="w-full px-2 py-1.5 rounded border-2 border-slate-200 focus:border-orange-500 outline-none text-sm"
                                                placeholder="Customer Name"
                                            />
                                        </td>

                                        {/* Amount */}
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={entry.amount}
                                                onChange={(e) => handleCellChange(entry.id, 'amount', e.target.value)}
                                                ref={(el) => (inputRefs.current[`amount-${entry.id}`] = el)}
                                                className={`w-full px-2 py-1.5 rounded border-2 border-slate-200 outline-none text-sm text-right font-bold ${
                                                    voucherData.credit_debit_mode === 'given'
                                                        ? 'focus:border-red-500'
                                                        : 'focus:border-green-500'
                                                }`}
                                                placeholder="0.00"
                                            />
                                        </td>

                                        {/* Note */}
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={entry.note}
                                                onChange={(e) => handleCellChange(entry.id, 'note', e.target.value)}
                                                className="w-full px-2 py-1.5 rounded border-2 border-slate-200 focus:border-orange-500 outline-none text-sm"
                                                placeholder="Description..."
                                            />
                                        </td>

                                        {/* Delete Button */}
                                        <td className="px-3 py-2 text-center">
                                            {entries.length > MIN_ROWS && (
                                                <button
                                                    onClick={() => handleDeleteRow(entry.id)}
                                                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all transform hover:scale-110"
                                                    title="Delete Row"
                                                >
                                                    <FaTrashAlt size={14} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {/* Total Row */}
                                <tr className="bg-gradient-to-r from-slate-100 to-slate-200 font-bold">
                                    <td colSpan="3" className="px-3 py-3 text-right text-base text-slate-800">
                                        TOTAL AMOUNT:
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <div className={`text-lg font-bold ${
                                            voucherData.credit_debit_mode === 'given' ? 'text-red-700' : 'text-green-700'
                                        }`}>
                                            ₹ {total}
                                        </div>
                                    </td>
                                    <td colSpan="2" className="px-3 py-3 text-center">
                                        {voucherData.credit_debit_mode && (
                                            <span className={`font-bold text-sm ${
                                                voucherData.credit_debit_mode === 'given' ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                                {voucherData.credit_debit_mode === 'given' ? '💸 Given' : '💰 Received'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default ManualEntries
