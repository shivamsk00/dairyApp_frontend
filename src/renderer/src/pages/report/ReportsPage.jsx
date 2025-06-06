import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx';
import useHomeStore from '../../zustand/useHomeStore';
import { toast } from 'react-toastify';
import CustomToast from '../../helper/costomeToast';

const ReportsPage = () => {
  const [report, setReport] = useState([])
  const [summaryData, setSummaryData] = useState([])
  const [form, setForm] = useState({
    term: 'date_range',
    start_date: '',
    end_date: '',
    customer_account_number: ''
  });

  const reportCustomer = useHomeStore(state => state.reportCustomer)

  const reportDataFetch = async () => {
    try {
      const res = await reportCustomer();
      if (res?.status_code === 200 && res?.data?.data) {
        setReport(res.data.data)
        setSummaryData(res.data.data)
      } else {
        toast.error(res?.message || "Failed to fetch report data")
        setReport([])
        setSummaryData([])
      }
    } catch (error) {
      console.error("Error fetching report:", error)
      toast.error("Failed to fetch report data")
      setReport([])
      setSummaryData([])
    }
  }

  useEffect(() => {
    reportDataFetch()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    try {
      const res = await reportCustomer(form);
      if (res?.status_code === 200 && res?.data?.data) {
        setSummaryData(res.data.data)
        toast.success("Report generated successfully")
      } else {
        toast.error(res?.message || "Failed to generate report")
        setSummaryData([])
      }
    } catch (error) {
      console.error("Error generating report:", error)
      toast.error("Failed to generate report")
      setSummaryData([])
    }
  };

  const handleReset = () => {
    setForm({
      term: 'date_range',
      start_date: '',
      end_date: '',
      customer_account_number: ''
    });
    reportDataFetch()
  };

  const exportToExcel = () => {
    if (!summaryData || summaryData.length === 0) {
      toast.warning("No data to export")
      return
    }
    const worksheet = XLSX.utils.json_to_sheet(summaryData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Summary Report');
    XLSX.writeFile(workbook, 'customer_summary_report.xlsx');
    toast.success("Report exported successfully")
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 p-6">
        <form className="bg-gray-800 p-6 rounded shadow-xl w-full lg:w-1/2 flex flex-col gap-4">
          <div className="w-full mx-auto bg-white p-6 rounded shadow">
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
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">From:</label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">To:</label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">Customer Ac No:</label>
              <input
                type="text"
                name="customer_account_number"
                value={form.customer_account_number}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Generate Report
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

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
                <th className="border px-2 py-2">Milk Quantity</th>
                <th className="border px-2 py-2">Total Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {!summaryData || summaryData.length === 0 ? (
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
                    <td className="border px-2 py-2 text-center">{item.customer_account_number}</td>
                    <td className="border px-2 py-2 text-center">{item.customer_name}</td>
                    <td className="border px-2 py-2 text-center">{item.start_date}</td>
                    <td className="border px-2 py-2 text-center">{item.end_date}</td>
                    <td className="border px-2 py-2 text-center">{item.end_date}</td>
                    <td className="border px-2 py-2 text-center">{item.payment_total_amount?.toFixed(2)}</td>
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