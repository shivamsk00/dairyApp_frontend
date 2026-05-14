// Single Entry Page

import React, { useEffect, useRef, useState } from 'react'
import CustomToast from '../../helper/costomeToast'
import useHomeStore from '../../zustand/useHomeStore'
import DateFormate from '../../helper/DateFormate'
import { FaPen, FaCheck, FaTimes, FaWallet, FaMoneyBillWave, FaCalendarAlt, FaUser, FaReceipt, FaSync, FaSearch } from 'react-icons/fa'
import { FaTrashCan, FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6'
import { HiDocumentText } from 'react-icons/hi2'

const CashCorrection = () => {
  const today = new Date().toISOString().split('T')[0];
  const allCashEntries = useHomeStore((state) => state.getAllCashEntries);
  const deleteCashEntries = useHomeStore(state => state.deleteCashEntries);
  const updateCashEntry = useHomeStore(state => state.updateCashEntry);
  const fetchCustomerDetailsByAccount = useHomeStore((state) => state.fetchCustomerDetailsByAccount);

  const [allEntries, setAllEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  const [modalType, setModalType] = useState(null);
  const [selectedCashEntry, setSelectedCashEntry] = useState(null);

  // Filter States
  const [filters, setFilters] = useState({
    accountNumber: '',
    customerName: '',
    date: ''
  });

  const cashEntriesAllDataFetch = async () => {
    try {
      setLoading(true);
      const res = await allCashEntries();
      if (res.status_code == 200) {
        setAllEntries(res.data);
        setFilteredEntries(res.data);
      } else {
        setAllEntries([]);
        setFilteredEntries([]);
      }
    } catch (error) {
      console.error('API error: ', error);
      CustomToast.error('Something went wrong while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cashEntriesAllDataFetch();
  }, []);

  // Filter Logic
  useEffect(() => {
    const filtered = allEntries.filter((entry) => {
      const matchAccount = filters.accountNumber ? String(entry.customer_account_number).includes(filters.accountNumber) : true;
      const matchName = filters.customerName ? entry.customer?.name?.toLowerCase().includes(filters.customerName.toLowerCase()) : true;

      let matchDate = true;
      if (filters.date) {
        let entryDateISO = entry.date;
        if (entry.date) {
          if (entry.date.includes('-')) {
            const parts = entry.date.split('-');
            if (parts[0].length === 2) entryDateISO = `${parts[2]}-${parts[1]}-${parts[0]}`;
          } else if (entry.date.includes('/')) {
            const parts = entry.date.split('/');
            if (parts[0].length === 2) entryDateISO = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }
        matchDate = entryDateISO === filters.date;
      }
      return matchAccount && matchName && matchDate;
    });
    setFilteredEntries(filtered);
  }, [filters, allEntries]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await cashEntriesAllDataFetch();
    setRefreshing(false);
    CustomToast.success('Refreshed successfully');
  };

  const handleEditClick = (entry) => {
    let formattedDate = entry.date;
    if (entry.date) {
      if (entry.date.includes('-')) {
        const parts = entry.date.split('-');
        if (parts[0].length === 2) formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else if (entry.date.includes('/')) {
        const parts = entry.date.split('/');
        if (parts[0].length === 2) formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    setEditingRowId(entry.id);
    setEditFormData({
      date: formattedDate,
      amount: entry.amount,
      credit_debit_mode: entry.credit_debit_mode,
      note: entry.note || '',
      customer_account_number: entry.customer_account_number,
      customer_name: entry.customer?.name || '',
      wallet: entry.customer?.wallet || '',
      entry_id: entry.id,
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    if (!editFormData.customer_account_number?.trim() || !editFormData.amount || !editFormData.credit_debit_mode) {
      return CustomToast.error('Please fill all required fields');
    }

    const payload = {
      date: DateFormate(editFormData.date),
      amount: editFormData.amount,
      credit_debit_mode: editFormData.credit_debit_mode,
      note: editFormData.note,
      customer_account_number: editFormData.customer_account_number,
    };

    try {
      const res = await updateCashEntry(editFormData.entry_id, payload);
      if (res.status_code == 200) {
        CustomToast.success(res.message);
        setEditingRowId(null);
        cashEntriesAllDataFetch();
      } else {
        CustomToast.error(res.message);
      }
    } catch (error) {
      CustomToast.error('Failed to update entry');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteCashEntries(id);
      if (res.status_code == 200) {
        CustomToast.success(res.message);
        setModalType(null);
        cashEntriesAllDataFetch();
      } else {
        CustomToast.error(res.message);
      }
    } catch (error) {
      CustomToast.error('Failed to delete entry');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-8xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <FaMoneyBillWave className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Cash Entry Correction</h2>
                  <p className="text-[10px] text-slate-600">Total: {filteredEntries.length} entries</p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-lg transition-all"
              >
                <FaSync className={refreshing ? 'animate-spin' : ''} size={12} />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by Account No."
                  value={filters.accountNumber}
                  onChange={(e) => setFilters(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by Customer Name"
                  value={filters.customerName}
                  onChange={(e) => setFilters(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-lg font-semibold text-slate-600 mt-6">Loading cash entries...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-200 sticky top-0 z-10">
                  <tr>
                    {['#', 'Account', 'Customer', 'Date', 'Amount', 'Type', 'Note', 'Actions'].map((header) => (
                      <th key={header} className="px-3 py-2 text-left text-[10px] font-bold text-slate-700 uppercase">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry, index) => (
                      <tr key={entry.id} className="hover:bg-indigo-50 transition-colors">
                        <td className="px-3 py-2 text-[10px] font-semibold text-slate-600">{index + 1}</td>
                        {editingRowId === entry.id ? (
                          <>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                name="customer_account_number"
                                value={editFormData.customer_account_number}
                                onChange={handleEditFormChange}
                                className="w-full px-2 py-1 text-[10px] rounded border border-indigo-300 outline-none"
                              />
                            </td>
                            <td className="px-3 py-2 text-[10px]">{entry.customer?.name || '-'}</td>
                            <td className="px-3 py-2">
                              <input
                                type="date"
                                name="date"
                                value={editFormData.date}
                                onChange={handleEditFormChange}
                                className="w-full px-2 py-1 text-[10px] rounded border border-indigo-300 outline-none"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                name="amount"
                                value={editFormData.amount}
                                onChange={handleEditFormChange}
                                className="w-full px-2 py-1 text-[10px] rounded border border-indigo-300 outline-none"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <select
                                name="credit_debit_mode"
                                value={editFormData.credit_debit_mode}
                                onChange={handleEditFormChange}
                                className="w-full px-2 py-1 text-[10px] rounded border border-indigo-300 outline-none"
                              >
                                <option value="received">Received</option>
                                <option value="given">Given</option>
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                name="note"
                                value={editFormData.note}
                                onChange={handleEditFormChange}
                                className="w-full px-2 py-1 text-[10px] rounded border border-indigo-300 outline-none"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex gap-2">
                                <button onClick={handleSaveClick} className="p-1 bg-green-100 text-green-700 rounded"><FaCheck size={10}/></button>
                                <button onClick={() => setEditingRowId(null)} className="p-1 bg-slate-100 text-slate-700 rounded"><FaTimes size={10}/></button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-2 text-[10px] font-bold text-indigo-600">{entry.customer_account_number}</td>
                            <td className="px-3 py-2 text-[10px] font-semibold text-slate-700">{entry.customer?.name || '-'}</td>
                            <td className="px-3 py-2 text-[10px] text-slate-600">{entry.date}</td>
                            <td className="px-3 py-2 text-[10px] font-bold text-slate-800">₹{entry.amount}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${entry.credit_debit_mode === 'received' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {entry.credit_debit_mode === 'received' ? 'Received' : 'Given'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-[10px] text-slate-500 max-w-xs truncate">{entry.note || '-'}</td>
                            <td className="px-3 py-2">
                              <div className="flex gap-2">
                                <button onClick={() => handleEditClick(entry)} className="p-2 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-all"><FaPen size={10}/></button>
                                <button onClick={() => { setSelectedCashEntry(entry); setModalType('delete'); }} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-all"><FaTrashCan size={10}/></button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center">
                          <div className="p-6 bg-slate-100 rounded-full mb-4">
                            <HiDocumentText className="text-slate-400 text-5xl" />
                          </div>
                          <p className="text-xl font-bold text-slate-700">No cash entries found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {modalType === 'delete' && selectedCashEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                <FaTrashCan size={30} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Confirm Deletion</h2>
              <p className="text-slate-600">Are you sure you want to delete this cash entry of ₹{selectedCashEntry.amount}?</p>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 px-6 py-3 rounded-xl bg-slate-200 font-semibold text-slate-700" onClick={() => setModalType(null)}>Cancel</button>
              <button className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold shadow-lg" onClick={() => handleDelete(selectedCashEntry.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashCorrection;