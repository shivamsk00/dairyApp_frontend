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
  const [isLoading, setLoading] = useState(false);
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

  const handleGenerate = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      start_date: formatInputDate(form.start_date),
      end_date: formatInputDate(form.end_date)
    };

    setLoading(true);
    try {
      const res = await reportCustomer(payload);
      if (res?.status_code == 200 && res?.data) {
        console.log("report data", res.data);

        setSummaryData(res.data);
        toast.success("Report generated successfully");
        setLoading(false);
      } else {
        setSummaryData(null);
        toast.error(res?.message || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
      setSummaryData(null);
      setLoading(false);
    } finally {
      setLoading(false);
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
      CLR: entry.clr || 'N/A',
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

  // Calculate average Fat and SNF
  const calculateAverages = () => {
    if (!summaryData?.milk_collections?.length) return { avgFat: 0, avgSNF: 0 };

    const totalFat = summaryData.milk_collections.reduce((sum, entry) => sum + parseFloat(entry.fat || 0), 0);
    const totalSNF = summaryData.milk_collections.reduce((sum, entry) => sum + parseFloat(entry.snf || 0), 0);
    const count = summaryData.milk_collections.length;

    return {
      avgFat: (totalFat / count).toFixed(2),
      avgSNF: (totalSNF / count).toFixed(2)
    };
  };

  const isFormValid = form.customer_account_number && form.start_date && form.end_date;
  const { avgFat, avgSNF } = calculateAverages();

  return (
    <div className="p-2">
      <div className="flex flex-col lg:flex-row gap-2">
        <form
          className="w-full lg:w-1/2 flex flex-col gap-2"
          onSubmit={handleGenerate}
        >
          <div className="bg-white text-black p-6 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-orange-600 mb-4">Customer Milk Collection Report</h2>

            {/* From and To Date - 1st Row */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="w-full">
                <label className="block text-sm font-medium mb-1 text-gray-700">From:</label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  readOnly={form.term !== 'date_range'}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium mb-1 text-gray-700">To:</label>
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  readOnly={form.term !== 'date_range'}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Select Term and Account No - 2nd Row */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="w-full">
                <label className="block text-sm font-medium mb-1 text-gray-700">Select Term:</label>
                <select
                  name="term"
                  value={form.term}
                  onChange={handleChange}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="date_range">Date Range</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                </select>
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium mb-1 text-gray-700">Customer Ac No:</label>
                <input
                  type="text"
                  name="customer_account_number"
                  value={form.customer_account_number}
                  onChange={handleChange}
                  placeholder="Enter Customer Account Number"
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${isFormValid && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Please wait...</span>
                  </div>
                ) : (
                  "Generate Report"
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>

              {summaryData && (
                <button
                  type="button"
                  onClick={exportToExcel}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export Excel</span>
                </button>
              )}
            </div>
          </div>
        </form>


        {/* Enhanced Summary Card with Fat and SNF */}
        {summaryData && (
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-indigo-800">
                📊 Report Summary
              </h3>

              {/* Customer Details */}
              <div className=" rounded-lg p-3">
                <div className="flex flex-col space-y-2 items-center">
                  <div className="flex space-x-2 items-center">
                    <span className="text-sm text-gray-600">Customer:</span>
                    <span className="font-semibold text-indigo-700">{summaryData.customer_name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <span className="text-sm text-gray-600">Account No:</span>
                    <span className="font-bold text-indigo-800 bg-indigo-100 px-2 py-1 rounded-md text-sm">
                      {summaryData.milk_collections?.[0]?.customer_account_number || form.customer_account_number || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Milk Collection Summary */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  🥛 Milk Collection
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Quantity:</span>
                    <span className="font-bold text-blue-600">
                      {summaryData?.total_milk_collections?.toFixed(2)} L
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Milk Amount:</span>
                    <span className="font-bold text-green-600">
                      ₹{Number(summaryData.milk_total_amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Fat:</span>
                    <span className="font-bold text-yellow-600">
                      {avgFat}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg SNF:</span>
                    <span className="font-bold text-purple-600">
                      {avgSNF}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  💰 Financial Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Sales:</span>
                    <span className="font-bold text-orange-600">
                      ₹{Number(summaryData.product_total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-indigo-600">
                      ₹{Number(summaryData.net_milk_balance || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-700 font-medium">Current Balance:</span>
                    <span className={`font-bold ${Number(summaryData.customer_wallet) < 0
                      ? 'text-red-600'
                      : 'text-green-600'
                      }`}>
                      ₹{Number(summaryData.customer_wallet).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {summaryData && <MergedReportTable summaryData={summaryData} />}
    </div>
  );
};

export default ReportsPage;
