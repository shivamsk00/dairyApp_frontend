import React, { useEffect, useRef, useState } from 'react'
import CustomToast from '../../helper/costomeToast'
import useHomeStore from '../../zustand/useHomeStore'
import DateFormate from '../../helper/DateFormate'
import { FaEye, FaPen } from 'react-icons/fa'
import { FaTrashCan } from 'react-icons/fa6'

const CashEntryPage = () => {
  const today = new Date().toISOString().split('T')[0]
  const allCashEntries = useHomeStore((state) => state.getAllCashEntries)
  const [allEntries, setAllEntries] = useState([])
  const deleteCashEntries = useHomeStore(state => state.deleteCashEntries)
  const [loading, setLoading] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [selectedCashEntry, setSelectedCashEntry] = useState(null)
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

  // Sold Products Api Response
  const cashEntriesAllDataFetch = async () => {
    try {
      setLoading(true) // ✅ show loading if needed
      const res = await allCashEntries()
      if (res.status_code == 200) {
        setAllEntries(res.data) // ✅ fixed earlier
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

  // Customer Fetch from Account Number
  const fetchCustomerDetailByAccountNumber = async (accountNo) => {
    try {
      const res = await fetchCustomerDetailsByAccount(accountNo)


      if (res.status_code == 200) {
        CustomToast.success(res.message)

        setForm((prev) => ({
          ...prev,
          customer_name: res.data.name || '',
          wallet: res.data.wallet || '' // ✅ Update wallet inside form state
        }))
        return true; // ✅ success
      } else {
        CustomToast.error(res.message)

        return false; // ❌ failed
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
      customer_account_number: form.customer_account_number
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
        cashEntriesAllDataFetch() // ✅ Refresh table after submit
      } else {
        CustomToast.error(res.message)
      }
    } catch (error) {
      console.error('Submission error', error)
      CustomToast.error('Failed to submit cash entry')
    }
  }

  // Delete Cash Entry
  const handleDelete = async (id) => {
    try {
      const res = await deleteCashEntries(id) // <-- use the id directly
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
    console.log('cashentry', cashentry)
    setSelectedCashEntry(cashentry)
    setModalType(type)
    // setProductEdit(product.name)
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
    <>
      <form
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto p-3 bg-white shadow-md rounded-lg border border-gray-200"
      >
        <h2 className="text-1x font-bold mb-6 text-center text-gray-800">Cash Entry</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Account No */}
          <div>
            <label className="block text-sm font-small text-gray-700 mb-1">
              Customer Account No
            </label>
            <input
              type="text"
              name="customer_account_number"
              value={form.customer_account_number}
              ref={accRef}
              onChange={(e) => {
                const value = e.target.value
                setForm((prev) => ({
                  ...prev,
                  customer_account_number: value,
                  ...(value.trim() === '' && { customer_name: '', wallet: '' })
                }))
              }}
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const accNo = form.customer_account_number.trim();
                  if (accNo) {
                    const success = await fetchCustomerDetailByAccountNumber(accNo);
                    if (success) {
                      dateRef.current?.focus(); // ✅ Move focus only if fetch succeeded
                    }
                  }
                }
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter account number"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              name="customer_name"
              value={form.customer_name}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
              disabled
            />
          </div>

          {/* Wallet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wallet</label>
            <input
              type="text"
              name="wallet"
              value={form.wallet}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
              disabled
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              max={today}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ref={dateRef}
              onKeyDown={(e) => e.key === 'Enter' && amountRef.current?.focus()}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              ref={amountRef}
              required
              onKeyDown={(e) => e.key === 'Enter' && modeRef.current?.focus()}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <select
              name="credit_debit_mode"
              value={form.credit_debit_mode}
              onChange={handleChange}
              ref={modeRef}
              onKeyDown={(e) => e.key === 'Enter' && noteRef.current?.focus()}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select --</option>
              <option value="received">Received</option>
              <option value="given">Given</option>
            </select>
          </div>

          {/* Note */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              ref={noteRef}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter note"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
        >
          Submit Entry
        </button>
      </form>

      <div className="w-full mx-auto mt-10 overflow-x-auto bg-white shadow-md border border-gray-200 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">All Cash Entries</h2>
        {loading ? (
          <p className="text-center mt-6 text-gray-500">Loading entries...</p>
        ) : (
          <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">#</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Account No.
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Customer Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Wallet</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Mode</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Note</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allEntries.length > 0 ? (
                allEntries.map((entry, index) => (
                  <tr key={entry.id || index}>
                    <td className="px-4 py-2 text-sm text-gray-800">{index + 1}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {entry.customer_account_number || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {entry.customer?.name || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {entry.customer?.wallet || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">{entry.date}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{entry.amount}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 capitalize">
                      {entry.credit_debit_mode}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">{entry.note || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {/* <button
                        onClick={() => nav('/editStock', { state: { stockId: item.id } })}
                        className="bg-yellow-500 mx-1 text-white px-2 py-1 rounded text-xs"
                      >
                        <FaPen size={14} />
                      </button> */}
                      <button
                        onClick={() => {
                          openModal('delete', entry)
                        }}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                      >
                        <FaTrashCan size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* DELETE MODAL */}
        {modalType === 'delete' && selectedCashEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h2 className="text-lg font-semibold mb-4 text-red-600">Confirm Delete</h2>
              <p className="mb-6 text-gray-700">
                Are you sure you want to delete the entry of amount{' '}
                <strong>₹{selectedCashEntry.amount}</strong>?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  onClick={() => handleDelete(selectedCashEntry.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default CashEntryPage
