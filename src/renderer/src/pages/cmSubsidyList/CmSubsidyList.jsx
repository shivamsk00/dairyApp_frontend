import React, { useEffect, useState } from 'react'
import { FaSearch, FaEye, FaPen } from 'react-icons/fa'
import { User, Phone, Mail, MapPin, Calendar, BarChart3 } from 'lucide-react'
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
  const getAllCustomer = useHomeStore((state) => state.getAllCustomer)
  const reportCustomer = useHomeStore((state) => state.reportCustomer)
  
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
      console.log('Starting report generation for', customers.length, 'CM subsidy customers')
      
      // Create an array of promises for all customer reports
      const reportPromises = customers.map(customer => {
        const payload = {
          term: dateForm.term,
          start_date: formatInputDate(dateForm.start_date),
          end_date: formatInputDate(dateForm.end_date),
          customer_account_number: customer.account_number
        };
        return reportCustomer(payload);
      });

      // Execute all API calls concurrently using Promise.all
      console.log('Making', reportPromises.length, 'concurrent API calls...')
      const results = await Promise.all(reportPromises);

      // Process results and extract relevant data
      const processedData = results.map((result, index) => {
        const customer = customers[index];
        
        if (result?.status_code == 200 && result?.data) {
          return {
            customer_account_number: customer.account_number,
            customer_name: customer.name,
            subsidy_code: customer.subsidy_code,
            total_milk_collections: result.data.total_milk_collections || 0,
            milk_total_amount: result.data.milk_total_amount || 0,
            product_total_amount: result.data.product_total_amount || 0,
            net_milk_balance: result.data.net_milk_balance || 0,
            customer_wallet: result.data.customer_wallet || 0,
          };
        } else {
          // Return default values if API call failed
          return {
            customer_account_number: customer.account_number,
            customer_name: customer.name,
            subsidy_code: customer.subsidy_code,
            total_milk_collections: 0,
            milk_total_amount: 0,
            product_total_amount: 0,
            net_milk_balance: 0,
            customer_wallet: customer.wallet || 0,
          };
        }
      });

      console.log('Processed report data:', processedData)
      setReportData(processedData);
      
      // Update filtered customers with report data
      const updatedCustomers = customers.map(customer => {
        const reportInfo = processedData.find(report => 
          report.customer_account_number === customer.account_number
        );
        
        return {
          ...customer,
          total_milk_collections: reportInfo?.total_milk_collections || 0,
          milk_total_amount: reportInfo?.milk_total_amount || 0,
          product_total_amount: reportInfo?.product_total_amount || 0,
          net_milk_balance: reportInfo?.net_milk_balance || 0
        };
      });
      
      setFilteredCustomers(updatedCustomers);
      
      const successfulReports = processedData.filter(data => data.total_milk_collections > 0 || data.milk_total_amount > 0).length;
      toast.success(`Report data loaded for ${processedData.length} CM subsidy customers. ${successfulReports} customers have milk collections in this period.`);
      
    } catch (error) {
      console.error("Error generating report data:", error);
      toast.error("Failed to generate report data for CM subsidy customers");
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

  // MODIFIED: Calculate totals for CM subsidy customers with subsidy
  const calculateTotals = () => {
    if (reportData.length === 0) return { totalMilk: 0, totalAmount: 0, totalProductAmount: 0, totalNetBalance: 0, totalWithSubsidy: 0 };
    
    // NEW: Filter customers with milk collections > 0
    const customersWithMilk = filteredCustomers.filter(customer => (customer.total_milk_collections || 0) > 0);
    const subsidyValue = parseFloat(subsidyAmount) || 0;
    
    return customersWithMilk.reduce((acc, customer) => ({
      totalMilk: acc.totalMilk + (customer.total_milk_collections || 0),
      totalAmount: acc.totalAmount + (customer.milk_total_amount || 0),
      totalProductAmount: acc.totalProductAmount + (customer.product_total_amount || 0),
      totalNetBalance: acc.totalNetBalance + (customer.net_milk_balance || 0),
      totalWithSubsidy: acc.totalWithSubsidy + (customer.milk_total_amount || 0) + subsidyValue // NEW: Add subsidy to milk amount
    }), { totalMilk: 0, totalAmount: 0, totalProductAmount: 0, totalNetBalance: 0, totalWithSubsidy: 0 });
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
      <div className="bg-white rounded-2xl shadow-sm mx-4 mt-6 mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            {/* Left side - Title and info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CM Subsidy Customer List</h1>
                <p className="text-gray-600 text-sm">Customers with Chief Minister Subsidy Codes</p>
                <p className="text-gray-500 text-sm mt-1">Total: {filteredCustomers.length} subsidy customers</p>
              </div>
            </div>

            {/* Right side - Date Filter Toggle */}
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              {showDateFilter ? 'Hide' : 'Show'} Report Filter
            </button>
          </div>

          {/* Date Filter Section */}
          {showDateFilter && (
            <div className="border border-gray-200 rounded-xl p-4 mb-6 bg-gray-50">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Generate Milk Collection Report for CM Subsidy Customers
              </h3>
              
              {/* Date Filter Form - MODIFIED: Added subsidy input */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                {/* From Date */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">From Date:</label>
                  <input
                    type="date"
                    name="start_date"
                    value={dateForm.start_date}
                    onChange={handleDateChange}
                    readOnly={dateForm.term !== 'date_range'}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* To Date */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">To Date:</label>
                  <input
                    type="date"
                    name="end_date"
                    value={dateForm.end_date}
                    onChange={handleDateChange}
                    readOnly={dateForm.term !== 'date_range'}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Select Term */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Select Term:</label>
                  <select
                    name="term"
                    value={dateForm.term}
                    onChange={handleDateChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="date_range">Date Range</option>
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                  </select>
                </div>

                {/* NEW: Subsidy Amount Input */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Subsidy Amount (₹):</label>
                  <input
                    type="number"
                    value={subsidyAmount}
                    onChange={(e) => setSubsidyAmount(e.target.value)}
                    placeholder="Enter subsidy amount"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleGenerateReportData}
                    disabled={!isDateFormValid || loading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex-1 ${
                      isDateFormValid && !loading
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-400 cursor-not-allowed text-white'
                    }`}
                  >
                    {loading ? 'Loading...' : 'Generate'}
                  </button>
                  <button
                    onClick={handleResetDateFilter}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* MODIFIED: Summary Cards - Updated to include subsidy */}
              {reportData.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600">Total Milk</div>
                    <div className="text-xl font-bold text-blue-600">{totals.totalMilk.toFixed(2)} L</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600">Milk Amount</div>
                    <div className="text-xl font-bold text-green-600">₹{totals.totalAmount.toFixed(2)}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600">Subsidy</div>
                    <div className="text-xl font-bold text-orange-600">₹{subsidyAmount || '0.00'}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600">Grand Total</div>
                    <div className="text-xl font-bold text-purple-600">₹{totals.totalWithSubsidy.toFixed(2)}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center gap-4">
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
          </div>
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
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-center p-4 text-sm font-semibold text-gray-700 w-16">Sr.</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-700">Acc. No.</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-700">Customer Name</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-700">CM Subsidy Code</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-700">Mobile</th>
                    {reportData.length > 0 && (
                      <>
                        <th className="text-center p-4 text-sm font-semibold text-gray-700">Total Milk (L)</th>
                        <th className="text-center p-4 text-sm font-semibold text-gray-700">Milk Amount (₹)</th>
                        <th className="text-center p-4 text-sm font-semibold text-gray-700">Subsidy (₹)</th> {/* NEW: Added Subsidy column */}
                        <th className="text-center p-4 text-sm font-semibold text-gray-700">Grand Total (₹)</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {/* MODIFIED: Use displayCustomers instead of filteredCustomers */}
                  {displayCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={reportData.length > 0 ? "9" : "5"} className="px-6 py-12 text-center text-gray-500">
                        <div className="text-lg">
                          {reportData.length > 0 
                            ? 'No customers have milk collections in the selected period'
                            : searchTerm 
                              ? 'No customers found matching your search' 
                              : 'No customers with CM subsidy codes found'
                          }
                        </div>
                        <div className="text-sm mt-1">
                          {customers.length === 0 
                            ? "No customers have valid CM subsidy codes in the database" 
                            : "Try adjusting your search criteria or date range"}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayCustomers.map((customer, index) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        {/* Serial Number */}
                        <td className="p-4 text-center">
                          <span className="text-gray-700 font-medium">{index + 1}</span>
                        </td>

                        {/* Account Number */}
                        <td className="p-4 text-center">
                          <span className="text-blue-600 font-medium">{customer.account_number}</span>
                        </td>

                        {/* Customer Name */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-orange-600" />
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-gray-900">{customer.name}</div>
                              {customer.careof && (
                                <div className="text-xs text-gray-500">c/o {customer.careof}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* CM Subsidy Code */}
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg text-sm font-mono text-blue-800 border border-blue-200">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            {customer.subsidy_code}
                          </span>
                        </td>

                        {/* Mobile */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a href={`tel:${customer.mobile}`} className="text-gray-700 hover:text-blue-600 transition-colors">
                              {customer.mobile}
                            </a>
                          </div>
                        </td>

                        {/* Report Data Columns (only show if report data exists) */}
                        {reportData.length > 0 && (
                          <>
                            {/* Total Milk */}
                            <td className="p-4 text-center">
                              <span className="text-blue-600 font-semibold">
                                {customer.total_milk_collections ? customer.total_milk_collections.toFixed(2) : '0.00'}
                              </span>
                            </td>

                            {/* Milk Amount */}
                            <td className="p-4 text-center">
                              <span className="text-green-600 font-semibold">
                                ₹{customer.milk_total_amount ? customer.milk_total_amount.toFixed(2) : '0.00'}
                              </span>
                            </td>

                            {/* NEW: Subsidy Column */}
                            <td className="p-4 text-center">
                              <span className="text-orange-600 font-semibold">
                                ₹{subsidyAmount || '0.00'}
                              </span>
                            </td>

                            {/* MODIFIED: Grand Total (Milk Amount + Subsidy) */}
                            <td className="p-4 text-center">
                              <span className="text-purple-600 font-semibold">
                                ₹{((customer.milk_total_amount || 0) + (parseFloat(subsidyAmount) || 0)).toFixed(2)}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* MODIFIED: Summary footer */}
            {displayCustomers.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600 text-center">
                  Showing {displayCustomers.length} customers with milk collections
                  {searchTerm && ` matching "${searchTerm}"`}
                  {reportData.length > 0 && (
                    <span className="ml-2 text-blue-600 font-medium">
                      | Report data from {dateForm.start_date} to {dateForm.end_date}
                    </span>
                  )}
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
