import React, { useEffect, useState } from 'react'
import { FaSearch, FaEye, FaPen } from 'react-icons/fa'
import { User, Phone, Mail, MapPin } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'

const CmSubsidyList = () => {
  const getAllCustomer = useHomeStore((state) => state.getAllCustomer)
  
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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

  useEffect(() => {
    fetchCustomersWithSubsidy()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - Simplified version */}
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

            {/* Right side - Add Customer button */}
            {/* <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors">
              <span className="text-lg">+</span>
              Add Customer
            </button> */}
          </div>

          {/* Search bar only */}
          <div className="flex items-center gap-4">
            {/* Search input */}
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
              <span className="ml-3 text-gray-600">Loading CM subsidy customers...</span>
            </div>
          </div>
        </div>
      )}

   
      

      {/* Main Table - Show ALL customers without pagination - CENTERED DATA */}
      {!loading && (
        <div className="mx-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-center p-4 text-sm font-semibold text-gray-700 w-16">Sr.</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-700">Acc. No.</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-700">Customer Name</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-700">CM Subsidy Code</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-700">Mobile</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-700">Address</th>
                    <th className="text-center p-4 text-sm font-semibold text-gray-700">Wallet</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <div className="text-lg">
                          {searchTerm ? 'No customers found matching your search' : 'No customers with CM subsidy codes found'}
                        </div>
                        <div className="text-sm mt-1">
                          {customers.length === 0 
                            ? "No customers have valid CM subsidy codes in the database" 
                            : "Try adjusting your search criteria"}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // Show ALL filtered customers (no pagination limit) - ALL CENTERED
                    filteredCustomers.map((customer, index) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        {/* Serial Number - CENTERED */}
                        <td className="p-4 text-center">
                          <span className="text-gray-700 font-medium">{index + 1}</span>
                        </td>

                        {/* Account Number - CENTERED */}
                        <td className="p-4 text-center">
                          <span className="text-blue-600 font-medium">{customer.account_number}</span>
                        </td>

                        {/* Customer Name - CENTERED */}
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

                        {/* CM Subsidy Code - CENTERED */}
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg text-sm font-mono text-blue-800 border border-blue-200">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            {customer.subsidy_code}
                          </span>
                        </td>

                        {/* Mobile - CENTERED */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a href={`tel:${customer.mobile}`} className="text-gray-700 hover:text-blue-600 transition-colors">
                              {customer.mobile}
                            </a>
                          </div>
                        </td>

                        {/* Address - CENTERED */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <div className="text-sm text-gray-700 text-center">
                              <div>{customer.address || customer.city}</div>
                              {customer.city && customer.address && customer.city !== customer.address && (
                                <div className="text-xs text-gray-500">{customer.city}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Wallet - CENTERED */}
                        <td className="p-4 text-center">
                          <span className="text-green-600 font-semibold">
                            ₹{parseFloat(customer.wallet || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary footer showing total count */}
            {filteredCustomers.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600 text-center">
                  Showing all {filteredCustomers.length} customers with CM Subsidy Codes
                  {searchTerm && ` matching "${searchTerm}"`}
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
