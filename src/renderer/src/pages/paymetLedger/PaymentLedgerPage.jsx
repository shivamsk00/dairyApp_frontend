import React from 'react';

const PaymentLedgerPage = () => {
  return (
    <div className="flex min-h-screen">
    

      {/* Main Content */}
      <main className="flex-1 p-6 bg-white">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Payment Register</h1>
          <p className="text-sm">
            MS, PACCA SAHARANA, 1187 Milk Center/ Cooperative Society
            <br />
            1187, VPO: Pacca Saharana, Hanumangarh
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="border p-4 mb-4 bg-gray-50 rounded w-full max-w-md">
          <h3 className="font-medium mb-2">Generate Payment Register</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium">From</label>
              <input type="date" className="border rounded px-2 py-1 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">To</label>
              <input type="date" className="border rounded px-2 py-1 w-full" />
            </div>
            <div className="flex space-x-2 pt-2">
              <button className="bg-green-600 text-white px-4 py-1 rounded">View</button>
              <button className="bg-gray-400 text-white px-4 py-1 rounded">Reset</button>
            </div>
          </div>
        </div>

        {/* Report Date Range */}
        <div className="mb-4">
          <strong>Report From Date:</strong> 2025-06-01 to <strong>Date:</strong> 2025-06-15
        </div>

        {/* Table */}
        <div className="overflow-auto border rounded">
          <table className="min-w-full table-auto text-sm border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-3 py-2">SN</th>
                <th className="border px-3 py-2">Ac No</th>
                <th className="border px-3 py-2">Member Name</th>
                <th className="border px-3 py-2">Total Quantity (Ltr.)</th>
                <th className="border px-3 py-2">Payable Amount</th>
                <th className="border px-3 py-2">CM Subsidy Amount</th>
                <th className="border px-3 py-2">Total Amount</th>
                <th className="border px-3 py-2">Member Sign</th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy Rows - replace with actual data map */}
              <tr>
                <td className="border px-3 py-2">1</td>
                <td className="border px-3 py-2">Walk-in-Customer</td>
                <td className="border px-3 py-2">-</td>
                <td className="border px-3 py-2">372.03</td>
                <td className="border px-3 py-2">0.00</td>
                <td className="border px-3 py-2">0.00</td>
                <td className="border px-3 py-2">11337.43</td>
                <td className="border px-3 py-2"></td>
              </tr>
              {/* Add more rows dynamically */}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default PaymentLedgerPage;
