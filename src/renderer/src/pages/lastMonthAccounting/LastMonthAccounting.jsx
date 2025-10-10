import React, { useState, useEffect } from 'react';

const MilkAccountingDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [customers] = useState([
    { id: 1, name: 'Akshay', accountNo: 'A001' },
    { id: 2, name: 'Arjun', accountNo: 'A002' },
    { id: 3, name: 'Sunil Kumar', accountNo: 'A003' },
    { id: 4, name: 'Anil', accountNo: 'A004' },
    { id: 5, name: 'Rajesh', accountNo: 'A005' }
  ]);

  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newEntry, setNewEntry] = useState({
    customerId: '',
    accountNo: '',
    totalMilk: '',
    totalMilkAmount: '',
    debitAmount: '',
    creditAmount: '',
    remark: ''
  });

  // Filter entries by selected month
  const filteredEntries = entries.filter(entry => {
    const entryMonth = entry.date?.slice(0, 7);
    return entryMonth === selectedMonth;
  });

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c.id === parseInt(customerId));
    setNewEntry({
      ...newEntry,
      customerId,
      accountNo: customer ? customer.accountNo : ''
    });
  };

  const saveEntry = () => {
    if (!newEntry.customerId) {
      alert('Please select a customer');
      return;
    }

    const customer = customers.find(c => c.id === parseInt(newEntry.customerId));
    const entryData = {
      ...newEntry,
      customerName: customer.name,
      date: new Date().toISOString().split('T')[0],
      month: selectedMonth,
      id: editingId || Date.now()
    };

    if (editingId) {
      setEntries(entries.map(entry => entry.id === editingId ? entryData : entry));
      setEditingId(null);
    } else {
      setEntries([...entries, entryData]);
    }

    // Reset form
    setNewEntry({
      customerId: '',
      accountNo: '',
      totalMilk: '',
      totalMilkAmount: '',
      debitAmount: '',
      creditAmount: '',
      remark: ''
    });
  };

  const editEntry = (entry) => {
    setNewEntry({
      customerId: entry.customerId,
      accountNo: entry.accountNo,
      totalMilk: entry.totalMilk,
      totalMilkAmount: entry.totalMilkAmount,
      debitAmount: entry.debitAmount,
      creditAmount: entry.creditAmount,
      remark: entry.remark
    });
    setEditingId(entry.id);
  };

  const deleteEntry = (id) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewEntry({
      customerId: '',
      accountNo: '',
      totalMilk: '',
      totalMilkAmount: '',
      debitAmount: '',
      creditAmount: '',
      remark: ''
    });
  };

  // Calculate totals for selected month
  const monthTotals = filteredEntries.reduce((acc, entry) => {
    acc.totalMilk += parseFloat(entry.totalMilk || 0);
    acc.totalMilkAmount += parseFloat(entry.totalMilkAmount || 0);
    acc.totalDebit += parseFloat(entry.debitAmount || 0);
    acc.totalCredit += parseFloat(entry.creditAmount || 0);
    return acc;
  }, { totalMilk: 0, totalMilkAmount: 0, totalDebit: 0, totalCredit: 0 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg mb-6 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Milk Accounting Dashboard</h1>
              <p className="text-gray-600">Manage monthly milk collection and customer accounts</p>
            </div>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Select Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="text-sm text-gray-600">
              Showing {filteredEntries.length} entries for {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Entry Form */}
        <div className="bg-white rounded-xl shadow-lg mb-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Entry' : 'Add New Entry'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Customer</label>
              <select
                value={newEntry.customerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Account No.</label>
              <input
                type="text"
                value={newEntry.accountNo}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm"
                placeholder="Auto-filled"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Total Milk (L)</label>
              <input
                type="number"
                value={newEntry.totalMilk}
                onChange={(e) => setNewEntry({...newEntry, totalMilk: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Milk Amount (₹)</label>
              <input
                type="number"
                value={newEntry.totalMilkAmount}
                onChange={(e) => setNewEntry({...newEntry, totalMilkAmount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Debit (₹)</label>
              <input
                type="number"
                value={newEntry.debitAmount}
                onChange={(e) => setNewEntry({...newEntry, debitAmount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Credit (₹)</label>
              <input
                type="number"
                value={newEntry.creditAmount}
                onChange={(e) => setNewEntry({...newEntry, creditAmount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Remark</label>
              <input
                type="text"
                value={newEntry.remark}
                onChange={(e) => setNewEntry({...newEntry, remark: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Add note..."
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveEntry}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              {editingId ? 'Update Entry' : 'Save Entry'}
            </button>
            
            {editingId && (
              <button
                onClick={cancelEdit}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="text-sm opacity-90">Total Milk</div>
            <div className="text-2xl font-bold">{monthTotals.totalMilk.toFixed(2)} L</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="text-sm opacity-90">Milk Amount</div>
            <div className="text-2xl font-bold">₹{monthTotals.totalMilkAmount.toFixed(2)}</div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <div className="text-sm opacity-90">Total Debit</div>
            <div className="text-2xl font-bold">₹{monthTotals.totalDebit.toFixed(2)}</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="text-sm opacity-90">Total Credit</div>
            <div className="text-2xl font-bold">₹{monthTotals.totalCredit.toFixed(2)}</div>
          </div>
        </div>

        {/* Entries Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Entries</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Milk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Milk Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                      <div className="text-lg">No entries found for selected month</div>
                      <div className="text-sm">Add your first entry using the form above</div>
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry, index) => (
                    <tr key={entry.id} className={editingId === entry.id ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{entry.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.accountNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.totalMilk} L</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{entry.totalMilkAmount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                        {entry.debitAmount ? `₹${entry.debitAmount}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {entry.creditAmount ? `₹${entry.creditAmount}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.remark || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editEntry(entry)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilkAccountingDashboard;
