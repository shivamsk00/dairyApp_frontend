import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import useHomeStore from '../../zustand/useHomeStore';
import { toast } from 'react-toastify';
import MergedReportTable from './MergedReportTable';

// 🔹 Helpers: must come before usage
const getToday = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getWeekRange = () => {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 1 = Monday
  const diffToMonday = today.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(today.setDate(diffToMonday));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0]
  };
};

const getMonthRange = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    start: firstDay.toISOString().split('T')[0],
    end: lastDay.toISOString().split('T')[0]
  };
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
};

const ReportsPage = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [form, setForm] = useState({
    term: 'date_range',
    start_date: getToday(),
    end_date: getToday(),
    customer_account_number: ''
  });

  const reportCustomer = useHomeStore(state => state.reportCustomer);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (form.term === 'this_week') {
      const { start, end } = getWeekRange();
      setForm(prev => ({ ...prev, start_date: start, end_date: end }));
    } else if (form.term === 'this_month') {
      const { start, end } = getMonthRange();
      setForm(prev => ({ ...prev, start_date: start, end_date: end }));
    } else if (form.term === 'date_range') {
      const today = getToday();
      setForm(prev => ({ ...prev, start_date: today, end_date: today }));
    }
  }, [form.term]);

  const formatInputDate = (isoDateStr) => {
    if (!isoDateStr) return '';
    const [yyyy, mm, dd] = isoDateStr.split('-');
    return `${dd}-${mm}-${yyyy}`;
  };

  const handleGenerate = async () => {
    const payload = {
      ...form,
      start_date: formatInputDate(form.start_date),
      end_date: formatInputDate(form.end_date)
    };

    try {
      const res = await reportCustomer(payload);
      if (res?.status_code === 200 && res?.data) {
        setSummaryData(res.data);
        toast.success("Report generated successfully");
      } else {
        setSummaryData(null);
        toast.error(res?.message || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
      setSummaryData(null);
    }
  };

  const handleReset = () => {
    const today = getToday();
    setForm({
      term: 'date_range',
      start_date: today,
      end_date: today,
      customer_account_number: ''
    });
    setSummaryData(null);
  };

  const exportToExcel = () => {
    if (!summaryData?.milk_collections?.length) {
      toast.warning("No data to export");
      return;
    }

    const dataToExport = summaryData.milk_collections.map(entry => ({
      Date: formatDate(entry.date),
      Shift: entry.shift,
      Milk_Type: entry.milk_type,
      Quantity: entry.quantity,
      CLR: entry.clr,
      Fat: entry.fat,
      SNF: entry.snf,
      Base_Rate: entry.base_rate,
      Total_Amount: entry.total_amount,
      Name: entry.name,
      Care_Of: entry.careof,
      Mobile: entry.mobile
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Milk Collection Report');
    XLSX.writeFile(workbook, 'milk_collection_report.xlsx');
    toast.success("Report exported successfully");
  };

  const isFormValid = form.customer_account_number && form.start_date && form.end_date;

  // Report All Data
  
  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <form className="bg-gray-800 text-white p-6 rounded shadow-xl w-full lg:w-1/2 flex flex-col gap-4">
          <div className="bg-white text-black p-6 rounded shadow">
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
                readOnly={form.term !== 'date_range'}
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
                readOnly={form.term !== 'date_range'}
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
                disabled={!isFormValid}
                className={`text-white px-4 py-2 rounded ${isFormValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
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

        {summaryData && (
          <div className="mt-4 max-w-lg mx-auto h-48 bg-yellow-100 border border-yellow-300 rounded-xl p-6 shadow-lg flex flex-col justify-center space-y-4 font-semibold text-right">
            <p className="text-xl">
              Total Milk Collected: <span className="text-green-700 font-bold">{summaryData.total_milk_collections} L</span>
            </p>
            <p className="text-xl">
              Total Amount:
              <span className="text-green-700 font-bold">
                ₹{Number(summaryData.milk_total_amount).toFixed(2)}
              </span>
            </p>
            <p className="text-xl">
              Wallet Balance:{" "}
              <span className={summaryData.customer_wallet < 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                ₹{Number(summaryData.customer_wallet).toFixed(2)}
              </span>
            </p>

          </div>
        )}
      </div>

      {/* {summaryData && (
        <div className="mt-12 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Milk Collection Report</h3>
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
                  <th className="border px-2 py-2">Acc No.</th>
                  <th className="border px-2 py-2">Name</th>
                  <th className="border px-2 py-2">C/O</th>
                  <th className="border px-2 py-2">Mobile</th>
                  <th className="border px-2 py-2">Date</th>
                  <th className="border px-2 py-2">Shift</th>
                  <th className="border px-2 py-2">Milk Type</th>
                  <th className="border px-2 py-2">Quantity</th>
                  <th className="border px-2 py-2">CLR</th>
                  <th className="border px-2 py-2">Fat</th>
                  <th className="border px-2 py-2">SNF</th>
                  <th className="border px-2 py-2">Base Rate</th>
                  <th className="border px-2 py-2">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {summaryData.milk_collections.map((entry, index) => (
                  <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'} hover:bg-gray-200`}>
                    <td className="border px-2 py-2 text-center">{entry.customer_account_number}</td>
                    <td className="border px-2 py-2 text-center">{entry.name}</td>
                    <td className="border px-2 py-2 text-center">{entry.careof}</td>
                    <td className="border px-2 py-2 text-center">{entry.mobile}</td>
                    <td className="border px-2 py-2 text-center">{formatDate(entry.date)}</td>
                    <td className="border px-2 py-2 text-center">{entry.shift}</td>
                    <td className="border px-2 py-2 text-center">{entry.milk_type}</td>
                    <td className="border px-2 py-2 text-center">{entry.quantity}</td>
                    <td className="border px-2 py-2 text-center">{entry.clr}</td>
                    <td className="border px-2 py-2 text-center">{entry.fat}</td>
                    <td className="border px-2 py-2 text-center">{entry.snf}</td>
                    <td className="border px-2 py-2 text-center">{entry.base_rate}</td>
                    <td className="border px-2 py-2 text-center">{entry.total_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )} */}

      {summaryData && <MergedReportTable summaryData={summaryData} />}

    </div>
  );
};

export default ReportsPage;
