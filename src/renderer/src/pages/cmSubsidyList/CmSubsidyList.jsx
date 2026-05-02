import React, { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { FaSearch, FaEye, FaPen, FaWeightHanging } from 'react-icons/fa'
import { HiDocumentText } from 'react-icons/hi'
import { User, Phone, Mail, MapPin, Calendar, BarChart3, Download } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import { toast } from 'react-toastify'

// Helper functions for date handling
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

const formatInputDate = (isoDateStr) => {
  if (!isoDateStr) return '';
  const [yyyy, mm, dd] = isoDateStr.split('-');
  return `${dd}-${mm}-${yyyy}`;
};

const CmSubsidyList = () => {
  const fetchCmSubsidyCustomerReport = useHomeStore((state) => state.fetchCmSubsidyCustomerReport)
  const getAllCustomer = useHomeStore((state) => state.getAllCustomer)

  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [reportData, setReportData] = useState([])
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [subsidyAmount, setSubsidyAmount] = useState('') // NEW: Added subsidy amount state

  // Date filter form
  const [dateForm, setDateForm] = useState({
    term: 'date_range',
    start_date: getToday(),
    end_date: getToday(),
  })

  // Fetch customers and filter only those with subsidy codes
  const fetchCustomersWithSubsidy = async () => {
    if (loading) return

    try {
      setLoading(true)
      const response = await getAllCustomer('')

      if (response && response.status_code === "200") {
        console.log('API Response:', response)

        // Filter customers who have subsidy_code (not null, not empty, not "N/A")
        const subsidyCustomers = response.data.filter(customer =>
          customer.subsidy_code &&
          customer.subsidy_code.trim() !== '' &&
          customer.subsidy_code !== null &&
          customer.subsidy_code.toLowerCase() !== 'n/a'
        )

        subsidyCustomers.sort((a, b) => {
          // Handle null or undefined subsidy_code by treating them as large numbers
          const codeA = a.subsidy_code ? Number(a.subsidy_code) : Number.MAX_SAFE_INTEGER;
          const codeB = b.subsidy_code ? Number(b.subsidy_code) : Number.MAX_SAFE_INTEGER;
          return codeA - codeB;
        });

        console.log('Subsidy Customers Found:', subsidyCustomers.length)
        console.log('Filtered Customers:', subsidyCustomers)

        setCustomers(subsidyCustomers)
        setFilteredCustomers(subsidyCustomers)
      } else {
        console.error('API Error:', response)
        CustomToast.error(response?.message || 'Failed to fetch customers')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      CustomToast.error('Failed to load customer data')
    } finally {
      setLoading(false)
    }
  }

  // Handle date form changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateForm((prev) => ({ ...prev, [name]: value }));
  };

  // Update date range based on term selection
  useEffect(() => {
    if (dateForm.term === 'this_week') {
      const { start, end } = getWeekRange();
      setDateForm(prev => ({ ...prev, start_date: start, end_date: end }));
    } else if (dateForm.term === 'this_month') {
      const { start, end } = getMonthRange();
      setDateForm(prev => ({ ...prev, start_date: start, end_date: end }));
    } else if (dateForm.term === 'date_range') {
      const today = getToday();
      setDateForm(prev => ({ ...prev, start_date: today, end_date: today }));
    }
  }, [dateForm.term]);

  // Fetch report data for all CM subsidy customers
  const handleGenerateReportData = async () => {
    try {
      setLoading(true)
      const payload = {
        start_date: formatInputDate(dateForm.start_date),
        end_date: formatInputDate(dateForm.end_date)
      };

      const response = await fetchCmSubsidyCustomerReport(payload);

      if (response && response.status_code === 200) {
        setReportData(response.data);
        toast.success("Report data loaded successfully");
      } else {
        toast.error(response?.message || "Failed to fetch report");
      }
    } catch (error) {
      console.error("Error generating report data:", error);
      toast.error("Failed to generate report data");
      setReportData([]);
    } finally {
      setLoading(false)
    }
  };

  // Reset date filter
  const handleResetDateFilter = () => {
    const today = getToday();
    setDateForm({
      term: 'date_range',
      start_date: today,
      end_date: today,
    });
    setReportData([]);
    setSubsidyAmount(''); // NEW: Reset subsidy amount
    // Reset customers to original data without report info
    setFilteredCustomers(customers.map(customer => ({
      ...customer,
      total_milk_collections: undefined,
      milk_total_amount: undefined,
      product_total_amount: undefined,
      net_milk_balance: undefined
    })));
  };

  // Search function
  const handleSearch = (value) => {
    setSearchTerm(value)

    const filtered = customers.filter((customer) => {
      const searchValue = value.toLowerCase()
      return (
        customer.name?.toLowerCase().includes(searchValue) ||
        customer.account_number?.toString().includes(searchValue) ||
        customer.subsidy_code?.toLowerCase().includes(searchValue) ||
        customer.mobile?.toString().includes(searchValue) ||
        customer.email?.toLowerCase().includes(searchValue) ||
        customer.address?.toLowerCase().includes(searchValue)
      )
    })

    setFilteredCustomers(filtered)
  }

  // NEW: Handle Excel Export
  const handleExportExcel = () => {
    if (reportData.length === 0) {
      toast.error("No data to export");
      return;
    }

    const dataToExport = reportData.map((item) => ({
      'Document Date': item.document_date,
      'Shift': item.shift === 'morning' ? 'M' : 'E',
      'Farmer code': item.farmer_code,
      'UOM': item.uom,
      'Milk Type': item.milk_type === 'cow' ? 'C' : 'B',
      'Milk Qty': item.milk_qty,
      'Fat %': item.fat,
      'SNF %': item.snf
    }));

    // Calculate totals for the footer row
    if (reportData.length > 0) {
      const totalMilkQty = reportData.reduce((sum, item) => sum + (parseFloat(item.milk_qty) || 0), 0);

      // Add empty row for spacing
      dataToExport.push({});

      // Add Total Row
      dataToExport.push({
        'Document Date': 'GRAND TOTAL',
        'Shift': '',
        'Farmer code': '',
        'UOM': '',
        'Milk Type': '',
        'Milk Qty': Number(totalMilkQty.toFixed(2)),
        'Fat %': '',
        'SNF %': ''
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CM Subsidy Customers");

    // Generate filename with date
    const fileName = `CM_Subsidy_List_${getToday()}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    toast.success("Excel file downloaded successfully");
  };

  const calculateTotals = () => {
    if (reportData.length === 0) return { totalMilk: 0, totalAmount: 0, totalProductAmount: 0, totalNetBalance: 0, totalSubsidy: 0 };

    // NEW: Filter customers with milk collections > 0
    const customersWithMilk = filteredCustomers.filter(customer => (customer.total_milk_collections || 0) > 0);
    const subsidyRate = parseFloat(subsidyAmount) || 0;

    return customersWithMilk.reduce((acc, customer) => ({
      totalMilk: acc.totalMilk + (customer.total_milk_collections || 0),
      totalAmount: acc.totalAmount + (customer.milk_total_amount || 0),
      totalProductAmount: acc.totalProductAmount + (customer.product_total_amount || 0),
      totalNetBalance: acc.totalNetBalance + (customer.net_milk_balance || 0),
      totalSubsidy: acc.totalSubsidy + ((customer.total_milk_collections || 0) * subsidyRate)
    }), { totalMilk: 0, totalAmount: 0, totalProductAmount: 0, totalNetBalance: 0, totalSubsidy: 0 });
  };

  const totals = calculateTotals();
  const isDateFormValid = dateForm.start_date && dateForm.end_date;

  // NEW: Get filtered customers with milk collections only
  const getDisplayCustomers = () => {
    if (reportData.length === 0) return filteredCustomers;
    return filteredCustomers.filter(customer => (customer.total_milk_collections || 0) > 0);
  };

  const displayCustomers = getDisplayCustomers();

  useEffect(() => {
    fetchCustomersWithSubsidy()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mx-4 mt-6 mb-3">
        <div className="p-4 ">
          <div className="flex justify-between items-start mb-3">
            {/* Left side - Title and info */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-orange-100  flex items-center justify-center">
                <User className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CM Subsidy Customer List</h1>
                {/* <p className="text-gray-600 text-sm">Customers with Chief Minister Subsidy Codes</p> */}
                <p className="text-gray-500 text-sm mt-1">Total: {filteredCustomers.length} subsidy customers</p>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-700 text-[12px] text-white px-3 py-2  font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                <Download className="w-3 h-3" />
                Export Excel
              </button>

              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="bg-blue-500 hover:bg-blue-600 text-[12px] text-white px-3 py-2  font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                <Calendar className="w-3 h-3" />
                {showDateFilter ? 'Hide' : 'Show'} Report Filter
              </button>
            </div>
          </div>

          {/* Date Filter Section */}
          {showDateFilter && (
            <div className="border border-gray-200 rounded-xl p-4  bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Milk Collection Report Generator
                </h3>

                {reportData.length > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200">
                      <HiDocumentText className="text-blue-600" />
                      <span className="text-sm font-bold text-blue-700">{reportData.length} Entries</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-100 px-3 py-1.5 rounded-lg border border-green-200">
                      <FaWeightHanging className="text-green-600 text-xs" />
                      <span className="text-sm font-bold text-green-700">
                        {reportData.reduce((acc, item) => acc + (parseFloat(item.milk_qty) || 0), 0).toFixed(2)} {reportData[0]?.uom || 'KG'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Filter Form - MODIFIED: Added subsidy input */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                {/* From Date */}
                <div>
                  <label className="block text-[12px] font-medium mb-1 text-gray-700">From Date:</label>
                  <input
                    type="date"
                    name="start_date"
                    value={dateForm.start_date}
                    onChange={handleDateChange}
                    readOnly={dateForm.term !== 'date_range'}
                    className="border border-gray-300  px-2 text-[12px] w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* To Date */}
                <div>
                  <label className="block text-[12px] font-medium mb-1 text-gray-700">To Date:</label>
                  <input
                    type="date"
                    name="end_date"
                    value={dateForm.end_date}
                    onChange={handleDateChange}
                    readOnly={dateForm.term !== 'date_range'}
                    className="border border-gray-300 px-2 text-[12px] w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Select Term */}
                <div>
                  <label className="block text-[12px] font-medium mb-1 text-gray-700">Select Term:</label>
                  <select
                    name="term"
                    value={dateForm.term}
                    onChange={handleDateChange}
                    className="border border-gray-300 px-2 py-0.5 text-[12px] w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="date_range">Date Range</option>
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                  </select>
                </div>

                {/* NEW: Subsidy Amount Input */}
                <div>
                  <label className="block text-[12px] font-medium mb-1 text-gray-700">Subsidy Amount (₹):</label>
                  <input
                    type="number"
                    value={subsidyAmount}
                    onChange={(e) => setSubsidyAmount(e.target.value)}
                    placeholder="Enter subsidy amount"
                    className="border border-gray-300 px-2 text-[12px] w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleGenerateReportData}
                    disabled={!isDateFormValid || loading}
                    className={`px-2 py-0.5 text-[12px] font-medium transition-colors flex-1 ${isDateFormValid && !loading
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-400 cursor-not-allowed text-white'
                      }`}
                  >
                    {loading ? 'Loading...' : 'Generate'}
                  </button>
                  <button
                    onClick={handleResetDateFilter}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-0.5 text-[12px] font-medium transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              {/* {reportData.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-3">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600">Total Records</div>
                    <div className="text-xl font-bold text-blue-600">{reportData.length} Entries</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600">Total Milk Qty</div>
                    <div className="text-xl font-bold text-green-600">{reportData.reduce((acc, item) => acc + (parseFloat(item.milk_qty) || 0), 0).toFixed(2)} {reportData[0]?.uom || 'KG'}</div>
                  </div>
                </div>
              )} */}
            </div>
          )}

          {/* Search bar */}
          {/* <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, account number, mobile, email, subsidy code..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
              />
            </div>
          </div> */}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mx-4">
          <div className="bg-white rounded-xl shadow-sm p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-3 text-gray-600">
                {reportData.length === 0 ? 'Loading CM subsidy customers...' : 'Generating reports for all customers...'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      {!loading && (
        <div className="mx-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto h-[65vh] table-scrollbar table-scroll-bg">
              <table className="w-full">
                <thead className=" bg-black text-white">
                  <tr>
                    <th className="text-center p-2 text-[10px] font-semibold w-16">Sr.</th>
                    {reportData.length > 0 ? (
                      <>
                        <th className="text-center p-2 text-[10px] font-semibold ">Document Date</th>
                        <th className="text-center p-2 text-[10px] font-semibold ">Shift</th>
                        <th className="text-center p-2 text-[10px] font-semibold ">Farmer Code</th>
                        <th className="text-center p-2 text-[10px] font-semibold ">UOM</th>
                        <th className="text-center p-2 text-[10px] font-semibold ">Milk Type</th>
                        <th className="text-center p-2 text-[10px] font-semibold ">Milk Qty</th>
                        <th className="text-center p-2 text-[10px] font-semibold ">Fat %</th>
                        <th className="text-center p-2 text-[10px] font-semibold ">SNF %</th>
                      </>
                    ) : (
                      <>
                        <th className="text-center p-2 text-[10px] font-semibold ">Acc. No.</th>
                        <th className="text-center p-2 text-[10px] font-semibold ">Customer Name</th>
                        <th className="text-center p-2 text-[10px] font-semibold ">CM Subsidy Code</th>
                        <th className="text-center p-2 text-[10px] font-semibold ">Mobile</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {/* MODIFIED: Use displayCustomers instead of filteredCustomers */}
                  {reportData.length === 0 ? (
                    filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          <div className="text-lg">No CM subsidy customers found</div>
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer, index) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="p-2 text-center text-[10px] font-medium">{index + 1}</td>
                          <td className="p-2 text-center text-[10px] text-blue-600 font-medium">{customer.account_number}</td>
                          <td className="p-2 text-center text-[10px] font-semibold text-gray-900">{customer.name}</td>
                          <td className="p-2 text-center">
                            <span className="px-1  bg-blue-50 rounded-lg text-[10px] font-mono text-blue-800 border border-blue-200">
                              {customer.subsidy_code}
                            </span>
                          </td>
                          <td className="p-2 text-center text-[10px] text-gray-700">{customer.mobile}</td>
                        </tr>
                      ))
                    )
                  ) : (
                    reportData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-2 text-[10px] text-center font-medium">{index + 1}</td>
                        <td className="p-2 text-[10px] text-center">{item.document_date}</td>
                        <td className="p-2 text-[10px] text-center capitalize">{item.shift === 'morning' ? 'M' : 'E'}</td>
                        <td className="p-2 text-[10px] text-center">
                          <span className="px-3 py-1 bg-blue-50 rounded-lg text-[10px] font-mono text-blue-800 border border-blue-200">
                            {item.farmer_code}
                          </span>
                        </td>
                        <td className="p-2 text-[10px] text-center">{item.uom}</td>
                        <td className="p-2 text-[10px] text-center capitalize">{item.milk_type === "cow" ? "C" : "B"}</td>
                        <td className="p-2 text-[10px] text-center font-bold text-blue-600">{item.milk_qty}</td>
                        <td className="p-2 text-[10px] text-center">{item.fat}</td>
                        <td className="p-2 text-[10px] text-center">{item.snf}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {reportData.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600 text-center font-medium">
                  Showing {reportData.length} records from {dateForm.start_date} to {dateForm.end_date}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CmSubsidyList
