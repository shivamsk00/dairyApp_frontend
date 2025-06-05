import React, { useState } from 'react'
import * as XLSX from 'xlsx';
const ReportsPage = () => {
  const [form, setForm] = useState({
    term: 'date_range',
    from: '',
    to: '',
    accountNo: ''
  });

  const [summaryData, setSummaryData] = useState([
    // Example static data; replace with real fetched data
    {
      accountNo: 'CUST001',
      name: 'John Doe',
      from: '2025-06-01',
      to: '2025-06-05',
      totalBalance: 1225.50
    },
    {
      accountNo: 'CUST002',
      name: 'Jane Smith',
      from: '2025-06-01',
      to: '2025-06-05',
      totalBalance: 980.00
    }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = () => {
    console.log('Generating Report with Data:', form);
    // TODO: Fetch and update `summaryData` using real API here
  };

  const handleReset = () => {
    setForm({
      term: 'date_range',
      from: '',
      to: '',
      accountNo: ''
    });
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(summaryData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Summary Report');
    XLSX.writeFile(workbook, 'customer_summary_report.xlsx');
  };
  return (
    <>
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      {/* Left Form */}
      <form className="bg-gray-800 p-6 rounded shadow-xl w-full lg:w-1/2 flex flex-col gap-4 ">
        <div className=" w-full mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold text-orange-600 mb-4">Customer Milk Collection Report</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">Select Term:</label>
            <select
              name="term"
              value={form.term}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="date_range">Date Range</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              {/* Add other terms as needed */}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">From:</label>
            <input
              type="date"
              name="from"
              value={form.from}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">To:</label>
            <input
              type="date"
              name="to"
              value={form.to}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">Customer Ac No:</label>
            <input
              type="text"
              name="accountNo"
              value={form.accountNo}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Generate Report
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Reset
            </button>
          </div>
        </div>


        {/* <input
          type="submit"
          value="Submit"
          className="mt-6 w-24 text-white py-1 rounded bg-blue-600 cursor-pointer"
        /> */}
      </form>


    </div>

    {/* Summary Table */}
      <div className="mt-12 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Customer Summary Report</h3>
          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Export to Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="border px-2 py-2">Account No</th>
                <th className="border px-2 py-2">Customer Name</th>
                <th className="border px-2 py-2">From</th>
                <th className="border px-2 py-2">To</th>
                <th className="border px-2 py-2">Total Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4">
                    No summary data available.
                  </td>
                </tr>
              ) : (
                summaryData.map((item, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'} hover:bg-gray-200`}
                  >
                    <td className="border px-2 py-2 text-center">{item.accountNo}</td>
                    <td className="border px-2 py-2 text-center">{item.name}</td>
                    <td className="border px-2 py-2 text-center">{item.from}</td>
                    <td className="border px-2 py-2 text-center">{item.to}</td>
                    <td className="border px-2 py-2 text-center">{item.totalBalance.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
                </>
  )
}

export default ReportsPage