// import React, { useEffect, useRef, useState } from 'react'
// import CustomToast from '../../helper/costomeToast'
// import useHomeStore from '../../zustand/useHomeStore'
// import DateFormate from '../../helper/DateFormate'
// import { FaEye, FaPen } from 'react-icons/fa'
// import { FaTrashCan } from 'react-icons/fa6'
// import { useNavigate } from 'react-router-dom'

// const CashEntryPage = () => {
//   const nav = useNavigate();
//   const today = new Date().toISOString().split('T')[0]
//   const allCashEntries = useHomeStore((state) => state.getAllCashEntries)
//   const [allEntries, setAllEntries] = useState([])
//   const deleteCashEntries = useHomeStore(state => state.deleteCashEntries)
//   const [loading, setLoading] = useState(false)
//   const [modalType, setModalType] = useState(null)
//   const [selectedCashEntry, setSelectedCashEntry] = useState(null)
//   const [form, setForm] = useState({
//     customer_account_number: '',
//     customer_name: '',
//     wallet: '',
//     date: today,
//     amount: '',
//     credit_debit_mode: '',
//     note: ''
//   })

//   const fetchCustomerDetailsByAccount = useHomeStore((state) => state.fetchCustomerDetailsByAccount)
//   const submitCashEntry = useHomeStore((state) => state.submitCashEntry)

//   // Sold Products Api Response
//   const cashEntriesAllDataFetch = async () => {
//     try {
//       setLoading(true) // ✅ show loading if needed
//       const res = await allCashEntries()
//       if (res.status_code == 200) {
//         setAllEntries(res.data) // ✅ fixed earlier
//       } else {
//         setAllEntries([])
//         CustomToast.error('Failed to load entries.')
//       }
//     } catch (error) {
//       console.error('API error: ', error)
//       CustomToast.error('Something went wrong while fetching data.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     cashEntriesAllDataFetch()
//   }, [])

//   // Customer Fetch from Account Number
//   const fetchCustomerDetailByAccountNumber = async (accountNo) => {
//     try {
//       const res = await fetchCustomerDetailsByAccount(accountNo)


//       if (res.status_code == 200) {
//         CustomToast.success(res.message)

//         setForm((prev) => ({
//           ...prev,
//           customer_name: res.data.name || '',
//           wallet: res.data.wallet || '' // ✅ Update wallet inside form state
//         }))
//         return true; // ✅ success
//       } else {
//         CustomToast.error(res.message)

//         return false; // ❌ failed
//       }
//     } catch (error) {
//       console.error('Error fetching customer details:', error)
//     }
//     return false;
//   }

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setForm((prev) => ({
//       ...prev,
//       [name]: value
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!form.customer_account_number.trim()) return CustomToast.error('Enter account number')
//     if (!form.amount.trim()) return CustomToast.error('Enter amount')
//     if (!form.credit_debit_mode) return CustomToast.error('Select mode')

//     const payload = {
//       date: DateFormate(form.date),
//       amount: form.amount,
//       credit_debit_mode: form.credit_debit_mode,
//       note: form.note,
//       customer_account_number: form.customer_account_number
//     }

//     try {
//       const res = await submitCashEntry(payload)
//       if (res.status_code == 200) {
//         CustomToast.success(res.message)
//         setForm({
//           customer_account_number: '',
//           customer_name: '',
//           wallet: '',
//           date: today,
//           amount: '',
//           credit_debit_mode: '',
//           note: ''
//         })
//         accRef.current?.focus()
//         cashEntriesAllDataFetch() // ✅ Refresh table after submit
//       } else {
//         CustomToast.error(res.message)
//       }
//     } catch (error) {
//       console.error('Submission error', error)
//       CustomToast.error('Failed to submit cash entry')
//     }
//   }

//   // Delete Cash Entry
//   const handleDelete = async (id) => {
//     try {
//       const res = await deleteCashEntries(id) // <-- use the id directly
//       if (res.status_code == 200) {
//         CustomToast.success(res.message)
//         closeModal()
//         cashEntriesAllDataFetch()
//       } else {
//         CustomToast.error(res.message)
//       }
//     } catch (error) {
//       console.log('ERROR IN DELETE FUNCTION', error)
//       CustomToast.error('Failed to delete entry')
//     }
//   }

//   const openModal = (type, cashentry) => {
//     console.log('cashentry', cashentry)
//     setSelectedCashEntry(cashentry)
//     setModalType(type)
//     // setProductEdit(product.name)
//   }
//   const closeModal = () => {
//     setSelectedCashEntry(null)
//     setModalType(null)
//   }


//   const accRef = useRef();
//   const dateRef = useRef();
//   const amountRef = useRef();
//   const modeRef = useRef();
//   const noteRef = useRef();

//   return (
//     <>
//       <form
//         onSubmit={handleSubmit}
//         className="max-w-6xl mx-auto p-3 bg-white shadow-md rounded-lg border border-gray-200"
//       >
//         <h2 className="text-1x font-bold mb-6 text-center text-gray-800">Cash Entry</h2>

//         {/* Row 1: 4 input fields */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
//           {/* Account No */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Customer Account No</label>
//             <input
//               type="text"
//               name="customer_account_number"
//               value={form.customer_account_number}
//               ref={accRef}
//               onChange={(e) => {
//                 const value = e.target.value;
//                 setForm((prev) => ({
//                   ...prev,
//                   customer_account_number: value,
//                   ...(value.trim() === '' && { customer_name: '', wallet: '' }),
//                 }));
//               }}
//               onKeyDown={async (e) => {
//                 if (e.key === 'Enter') {
//                   e.preventDefault();
//                   const accNo = form.customer_account_number.trim();
//                   if (accNo) {
//                     const success = await fetchCustomerDetailByAccountNumber(accNo);
//                     if (success) {
//                       dateRef.current?.focus(); // ✅ Move focus only if fetch succeeded
//                     }
//                   }
//                 }
//               }}
//               className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter account number"
//             />
//           </div>

//           {/* Customer Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
//             <input
//               type="text"
//               name="customer_name"
//               value={form.customer_name}
//               className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
//               disabled
//             />
//           </div>

//           {/* Wallet */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Wallet</label>
//             <input
//               type="text"
//               name="wallet"
//               value={form.wallet}
//               className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
//               disabled
//             />
//           </div>

//           {/* Date */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//             <input
//               type="date"
//               name="date"
//               value={form.date}
//               onChange={handleChange}
//               max={today}
//               className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               ref={dateRef}
//               onKeyDown={(e) => e.key === 'Enter' && amountRef.current?.focus()}
//             />
//           </div>
//         </div>

//         {/* Second Row: Amount, Mode */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
//           {/* Amount */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
//             <input
//               type="number"
//               name="amount"
//               value={form.amount}
//               onChange={handleChange}
//               ref={amountRef}
//               required
//               onKeyDown={(e) => e.key === 'Enter' && modeRef.current?.focus()}
//               className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {/* Mode */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
//             <select
//               name="credit_debit_mode"
//               value={form.credit_debit_mode}
//               onChange={handleChange}
//               ref={modeRef}
//               onKeyDown={(e) => e.key === 'Enter' && noteRef.current?.focus()}
//               className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">-- Select --</option>
//               <option value="received">Received (Credit)</option>
//               <option value="given">Given (Debit)</option>
//             </select>
//           </div>
//         </div>

//         {/* Note - Full Width */}
//         <div className="mt-3">
//           <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
//           <textarea
//             name="note"
//             value={form.note}
//             onChange={handleChange}
//             ref={noteRef}
//             onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
//             className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             rows={3}
//             placeholder="Enter note"
//           />
//         </div>

//         <button
//           type="submit"
//           className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
//         >
//           Submit Entry
//         </button>
//       </form>


//       <div className="w-full mx-auto mt-10 overflow-x-auto bg-white shadow-md border border-gray-200 rounded-lg p-4">
//         <h2 className="text-xl font-semibold mb-4">All Cash Entries</h2>
//         {loading ? (
//           <p className="text-center mt-6 text-gray-500">Loading entries...</p>
//         ) : (
//           <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">#</th>
//                 <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
//                   Account No.
//                 </th>
//                 <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
//                   Customer Name
//                 </th>
//                 <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Wallet</th>
//                 <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
//                 <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Amount</th>
//                 <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Mode</th>
//                 <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Note</th>
//                 <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {allEntries.length > 0 ? (
//                 allEntries.map((entry, index) => (
//                   <tr key={entry.id || index}>
//                     <td className="px-4 py-2 text-sm text-gray-800">{index + 1}</td>
//                     <td className="px-4 py-2 text-sm text-gray-800">
//                       {entry.customer_account_number || '-'}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-gray-800">
//                       {entry.customer?.name || '-'}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-gray-800">
//                       {entry.customer?.wallet || '-'}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-gray-800">{entry.date}</td>
//                     <td className="px-4 py-2 text-sm text-gray-800">{entry.amount}</td>
//                     <td className="px-4 py-2 text-sm text-gray-800 capitalize">
//                       {entry.credit_debit_mode}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-gray-800">{entry.note || '-'}</td>
//                     <td className="px-4 py-2 text-sm text-gray-800">
//                       <button
//                         onClick={(item) => nav('/editCashEntry', { state: { stockId: item.id } })}
//                         className="bg-yellow-500 mx-1 text-white px-2 py-1 rounded text-xs"
//                       >
//                         <FaPen size={14} />
//                       </button>
//                       <button
//                         onClick={() => {
//                           openModal('delete', entry)
//                         }}
//                         className="bg-red-600 text-white px-2 py-1 rounded text-xs"
//                       >
//                         <FaTrashCan size={14} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" className="text-center py-4 text-gray-500">
//                     No entries found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         )}

//         {/* DELETE MODAL */}
//         {modalType === 'delete' && selectedCashEntry && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//             <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
//               <h2 className="text-lg font-semibold mb-4 text-red-600">Confirm Delete</h2>
//               <p className="mb-6 text-gray-700">
//                 Are you sure you want to delete the entry of amount{' '}
//                 <strong>₹{selectedCashEntry.amount}</strong>?
//               </p>
//               <div className="flex justify-end gap-2">
//                 <button
//                   className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
//                   onClick={closeModal}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
//                   onClick={() => handleDelete(selectedCashEntry.id)}
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   )
// }

// export default CashEntryPage
import React, { useEffect, useRef, useState } from 'react'
import CustomToast from '../../helper/costomeToast'
import useHomeStore from '../../zustand/useHomeStore'
import DateFormate from '../../helper/DateFormate'
import { FaPen, FaCheck, FaTimes, FaWallet, FaMoneyBillWave, FaCalendarAlt, FaUser, FaReceipt } from 'react-icons/fa'
import { FaTrashCan, FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6'
import { HiDocumentText } from 'react-icons/hi2'

const CashEntryPage = () => {
  const today = new Date().toISOString().split('T')[0]
  const allCashEntries = useHomeStore((state) => state.getAllCashEntries)
  const [allEntries, setAllEntries] = useState([])
  const deleteCashEntries = useHomeStore(state => state.deleteCashEntries)
  const updateCashEntry = useHomeStore(state => state.updateCashEntry)
  const [loading, setLoading] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [selectedCashEntry, setSelectedCashEntry] = useState(null)
  
  const [editingRowId, setEditingRowId] = useState(null)
  const [editFormData, setEditFormData] = useState({})

  const [form, setForm] = useState({
    customer_account_number: '',
    customer_name: '',
    wallet: '',
    date: today,
    amount: '',
    credit_debit_mode: '',
    note: ''
  })

  const fetchCustomerDetailsByAccount = useHomeStore((state) => state.fetchCustomerDetailsByAccount)
  const submitCashEntry = useHomeStore((state) => state.submitCashEntry)

  // Fetch all cash entries
  const cashEntriesAllDataFetch = async () => {
    try {
      setLoading(true)
      const res = await allCashEntries()
      console.log('All entries', res.data)
      if (res.status_code == 200) {
        setAllEntries(res.data)
      } else {
        setAllEntries([])
        CustomToast.error('Failed to load entries.')
      }
    } catch (error) {
      console.error('API error: ', error)
      CustomToast.error('Something went wrong while fetching data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cashEntriesAllDataFetch()
  }, [])

  // Calculate statistics
  const statistics = {
    totalReceived: allEntries
      .filter(e => e.credit_debit_mode === 'received')
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
    totalGiven: allEntries
      .filter(e => e.credit_debit_mode === 'given')
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
    totalEntries: allEntries.length,
  }
  statistics.netBalance = statistics.totalReceived - statistics.totalGiven

  const fetchCustomerDetailByAccountNumber = async (accountNo) => {
    try {
      const res = await fetchCustomerDetailsByAccount(accountNo)

      if (res.status_code == 200) {
        CustomToast.success(res.message)

        setForm((prev) => ({
          ...prev,
          customer_name: res.data.name || '',
          wallet: res.data.wallet || ''
        }))
        return true;
      } else {
        CustomToast.error(res.message)
        return false;
      }
    } catch (error) {
      console.error('Error fetching customer details:', error)
    }
    return false;
  }

  const fetchCustomerDetailForEdit = async (accountNo) => {
    try {
      const res = await fetchCustomerDetailsByAccount(accountNo)

      if (res.status_code == 200) {
        CustomToast.success(res.message)

        setEditFormData((prev) => ({
          ...prev,
          customer_name: res.data.name || '',
          wallet: res.data.wallet || ''
        }))
        return true;
      } else {
        CustomToast.error(res.message)
        return false;
      }
    } catch (error) {
      console.error('Error fetching customer details:', error)
    }
    return false;
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.customer_account_number.trim()) return CustomToast.error('Enter account number')
    if (!form.amount.trim()) return CustomToast.error('Enter amount')
    if (!form.credit_debit_mode) return CustomToast.error('Select mode')

    const payload = {
      date: DateFormate(form.date),
      amount: form.amount,
      credit_debit_mode: form.credit_debit_mode,
      note: form.note,
      customer_account_number: form.customer_account_number,
    }

    try {
      const res = await submitCashEntry(payload)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        setForm({
          customer_account_number: '',
          customer_name: '',
          wallet: '',
          date: today,
          amount: '',
          credit_debit_mode: '',
          note: ''
        })
        accRef.current?.focus()
        cashEntriesAllDataFetch()
      } else {
        CustomToast.error(res.message)
      }
    } catch (error) {
      console.error('Submission error', error)
      CustomToast.error('Failed to submit cash entry')
    }
  }
// ✅ FIXED: START EDITING MODE with proper date formatting
const handleEditClick = async (entry) => {
  // Convert date to YYYY-MM-DD format if it's in different format
  let formattedDate = entry.date;
  
  // If date is in DD-MM-YYYY or DD/MM/YYYY format, convert it
  if (entry.date && entry.date.includes('-')) {
    const parts = entry.date.split('-');
    if (parts[0].length === 2) {
      // It's DD-MM-YYYY, convert to YYYY-MM-DD
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  } else if (entry.date && entry.date.includes('/')) {
    const parts = entry.date.split('/');
    if (parts[0].length === 2) {
      // It's DD/MM/YYYY, convert to YYYY-MM-DD
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  setEditingRowId(entry.id)
  setEditFormData({
    date: formattedDate, // ✅ Use formatted date
    amount: entry.amount,
    credit_debit_mode: entry.credit_debit_mode,
    note: entry.note || '',
    customer_account_number: entry.customer_account_number,
    customer_name: entry.customer?.name || '',
    wallet: entry.customer?.wallet || '',
    entry_id: entry.id,
  })
  
  console.log('Original date:', entry.date, 'Formatted date:', formattedDate) // Debug
}

  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    if (name === 'customer_account_number' && value.trim() === '') {
      setEditFormData((prev) => ({
        ...prev,
        customer_name: '',
        wallet: ''
      }))
    }
  }

  const handleSaveClick = async () => {
    if (!editFormData.customer_account_number?.trim()) {
      return CustomToast.error('Customer account number is required')
    }
    if (!editFormData.amount || !editFormData.credit_debit_mode) {
      return CustomToast.error('Amount and mode are required')
    }

    const payload = {
      date: DateFormate(editFormData.date),
      amount: editFormData.amount,
      credit_debit_mode: editFormData.credit_debit_mode,
      note: editFormData.note,
      customer_account_number: editFormData.customer_account_number,
    }

    try {
      const res = await updateCashEntry(editFormData.entry_id, payload)
      if (res.status_code == 200) {
        CustomToast.success(res.message || 'Entry updated successfully')
        setEditingRowId(null)
        setEditFormData({})
        cashEntriesAllDataFetch()
      } else {
        CustomToast.error(res.message || 'Failed to update entry')
      }
    } catch (error) {
      console.error('Update error', error)
      CustomToast.error('Failed to update entry')
    }
  }

  const handleCancelClick = () => {
    setEditingRowId(null)
    setEditFormData({})
  }

  const handleDelete = async (id) => {
    try {
      const res = await deleteCashEntries(id)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        closeModal()
        cashEntriesAllDataFetch()
      } else {
        CustomToast.error(res.message)
      }
    } catch (error) {
      console.log('ERROR IN DELETE FUNCTION', error)
      CustomToast.error('Failed to delete entry')
    }
  }

  const openModal = (type, cashentry) => {
    setSelectedCashEntry(cashentry)
    setModalType(type)
  }

  const closeModal = () => {
    setSelectedCashEntry(null)
    setModalType(null)
  }

  const accRef = useRef();
  const dateRef = useRef();
  const amountRef = useRef();
  const modeRef = useRef();
  const noteRef = useRef();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ">
      <div className="max-w-8xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <FaMoneyBillWave className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800">Cash Entry Management</h1>
              <p className="text-slate-600 mt-1">Track and manage all financial transactions</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Total Received</p>
                <p className="text-2xl font-bold text-green-600">₹{statistics.totalReceived.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-green-100 rounded-xl">
                <FaArrowTrendUp className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Total Given</p>
                <p className="text-2xl font-bold text-red-600">₹{statistics.totalGiven.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-red-100 rounded-xl">
                <FaArrowTrendDown className="text-red-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Net Balance</p>
                <p className={`text-2xl font-bold ${statistics.netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  ₹{statistics.netBalance.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-blue-100 rounded-xl">
                <FaWallet className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Total Entries</p>
                <p className="text-2xl font-bold text-indigo-600">{statistics.totalEntries}</p>
              </div>
              <div className="p-4 bg-indigo-100 rounded-xl">
                <HiDocumentText className="text-indigo-600 text-2xl" />
              </div>
            </div>
          </div>
        </div> */}

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <FaReceipt className="text-white text-xl" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">New Cash Entry</h2>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FaUser className="text-indigo-600" />
              <h3 className="text-lg font-semibold text-slate-700">Customer Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customer_account_number"
                  value={form.customer_account_number}
                  ref={accRef}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      customer_account_number: value,
                      ...(value.trim() === '' && { customer_name: '', wallet: '' }),
                    }));
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const accNo = form.customer_account_number.trim();
                      if (accNo) {
                        const success = await fetchCustomerDetailByAccountNumber(accNo);
                        if (success) {
                          dateRef.current?.focus();
                        }
                      }
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="Enter account number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Customer Name</label>
                <input
                  type="text"
                  name="customer_name"
                  value={form.customer_name}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600"
                  disabled
                  placeholder="Auto-filled"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Wallet Balance</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 font-bold">₹</span>
                  <input
                    type="text"
                    name="wallet"
                    value={form.wallet}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-indigo-50 text-indigo-700 font-semibold"
                    disabled
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    max={today}
                    ref={dateRef}
                    onKeyDown={(e) => e.key === 'Enter' && amountRef.current?.focus()}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FaMoneyBillWave className="text-indigo-600" />
              <h3 className="text-lg font-semibold text-slate-700">Transaction Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    ref={amountRef}
                    required
                    onKeyDown={(e) => e.key === 'Enter' && modeRef.current?.focus()}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Transaction Mode <span className="text-red-500">*</span>
                </label>
                <select
                  name="credit_debit_mode"
                  value={form.credit_debit_mode}
                  onChange={handleChange}
                  ref={modeRef}
                  onKeyDown={(e) => e.key === 'Enter' && noteRef.current?.focus()}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                >
                  <option value="">Select Transaction Type</option>
                  <option value="received">💰 Received (Credit)</option>
                  <option value="given">💸 Given (Debit)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Note (Optional)</label>
                <input
                  type="text"
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  ref={noteRef}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="Add a note..."
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-[1.02]"
          >
            Submit Cash Entry
          </button>
        </form>

        {/* Table Section */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <HiDocumentText className="text-white text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Transaction History</h2>
              </div>
              <div className="text-sm text-slate-600">
                Total: <span className="font-bold text-indigo-600">{allEntries.length}</span> entries
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <FaMoneyBillWave className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 text-2xl" />
              </div>
              <p className="text-lg font-semibold text-slate-600 mt-6">Loading transactions...</p>
            </div>
          ) : (
            <div className="overflow-y-auto h-[70vh]">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                  <tr>
                    {['#', 'Account', 'Customer', 'Wallet', 'Date', 'Amount', 'Type', 'Note', 'Actions'].map((header) => (
                      <th key={header} className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allEntries.length > 0 ? (
                    allEntries.map((entry, index) => (
                      <tr key={entry.id || index} className="hover:bg-indigo-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">{index + 1}</td>
                        
                        {editingRowId === entry.id ? (
                          <>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                name="customer_account_number"
                                value={editFormData.customer_account_number || ''}
                                onChange={handleEditFormChange}
                                onBlur={async (e) => {
                                  const accNo = e.target.value.trim();
                                  if (accNo && accNo !== entry.customer_account_number) {
                                    await fetchCustomerDetailForEdit(accNo);
                                  }
                                }}
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const accNo = editFormData.customer_account_number.trim();
                                    if (accNo) {
                                      await fetchCustomerDetailForEdit(accNo);
                                    }
                                  }
                                }}
                                className="w-full px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 outline-none"
                                placeholder="Account"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={editFormData.customer_name || ''}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
                                disabled
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={editFormData.wallet ? `₹${editFormData.wallet}` : ''}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-indigo-50 text-indigo-700 font-semibold"
                                disabled
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="date"
                                name="date"
                                value={editFormData.date || ''}
                                onChange={handleEditFormChange}
                                max={today}
                                className="w-full px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 outline-none"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                name="amount"
                                value={editFormData.amount || ''}
                                onChange={handleEditFormChange}
                                className="w-full px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 outline-none"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <select
                                name="credit_debit_mode"
                                value={editFormData.credit_debit_mode || ''}
                                onChange={handleEditFormChange}
                                className="w-full px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 outline-none"
                              >
                                <option value="">Select</option>
                                <option value="received">Received</option>
                                <option value="given">Given</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                name="note"
                                value={editFormData.note || ''}
                                onChange={handleEditFormChange}
                                className="w-full px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 outline-none"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveClick()}
                                  className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all transform hover:scale-110"
                                  title="Save"
                                >
                                  <FaCheck size={16} />
                                </button>
                                <button
                                  onClick={handleCancelClick}
                                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all transform hover:scale-110"
                                  title="Cancel"
                                >
                                  <FaTimes size={16} />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 text-sm font-bold text-indigo-600">{entry.customer_account_number || '-'}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700">{entry.customer?.name || '-'}</td>
                            <td className="px-6 py-4 text-sm font-bold text-green-600">₹{entry.customer?.wallet || '0'}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{entry.date}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-800">₹{entry.amount}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                                entry.credit_debit_mode === 'received' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {entry.credit_debit_mode === 'received' ? (
                                  <>
                                    <FaArrowTrendUp size={12} /> Received
                                  </>
                                ) : (
                                  <>
                                    <FaArrowTrendDown size={12} /> Given
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={entry.note}>
                              {entry.note || '-'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditClick(entry)}
                                  className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-all transform hover:scale-110"
                                  title="Edit"
                                >
                                  <FaPen size={14} />
                                </button>
                                <button
                                  onClick={() => openModal('delete', entry)}
                                  className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all transform hover:scale-110"
                                  title="Delete"
                                >
                                  <FaTrashCan size={14} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center">
                          <div className="p-6 bg-slate-100 rounded-full mb-4">
                            <HiDocumentText className="text-slate-400 text-5xl" />
                          </div>
                          <p className="text-xl font-bold text-slate-700 mb-2">No transactions found</p>
                          <p className="text-sm text-slate-500">Start by adding your first cash entry above</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Modal */}
        {modalType === 'delete' && selectedCashEntry && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in">
              <div className="text-center mb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                  <FaTrashCan className="text-red-600 text-3xl" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Confirm Deletion</h2>
                <p className="text-slate-600 mb-6">
                  Are you sure you want to delete this transaction? This action cannot be undone.
                </p>
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-left space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Amount:</span>
                    <span className="text-lg font-bold text-red-600">₹{selectedCashEntry.amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Type:</span>
                    <span className="text-sm font-medium text-slate-800 capitalize">{selectedCashEntry.credit_debit_mode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Date:</span>
                    <span className="text-sm font-medium text-slate-800">{selectedCashEntry.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  className="flex-1 px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 font-semibold text-slate-700 transition-all transform hover:scale-105"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold transition-all transform hover:scale-105 shadow-lg"
                  onClick={() => handleDelete(selectedCashEntry.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CashEntryPage
