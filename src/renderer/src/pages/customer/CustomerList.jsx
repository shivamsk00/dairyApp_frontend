import React, { useEffect, useRef, useState } from 'react'
import './customer.css'
import { FaDotCircle, FaEye, FaPen, FaTrashAlt, FaSave, FaTimes, FaEdit, FaBuilding, FaPlus, FaSearch, FaFilter, FaTicketAlt } from 'react-icons/fa'
import { User, Phone, MapPin, Building2, CreditCard, Mail, UserCheck, Briefcase, MoreHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useHomeStore from '../../zustand/useHomeStore'
import { IoMdCloseCircle } from 'react-icons/io'
import CustomToast from '../../helper/costomeToast'

const CustomerList = () => {
  const nav = useNavigate()
  const getAllCustomer = useHomeStore((state) => state.getAllCustomer)
  const deleteCustomer = useHomeStore((state) => state.deleteCustomer)
  const editCustomerValueGet = useHomeStore((state) => state.editCustomerValueGet)
  const updateCustomer = useHomeStore((state) => state.updateCustomer)

  const scrollRef = useRef(null)
  const [rowData, setRowData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState(null)
  const [searchCustomer, setSearchCustomer] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [viewMode, setViewMode] = useState('table') // 'table' or 'card'

  // Updated inline editing states
  const [editingRowId, setEditingRowId] = useState(null)
  const [editFormData, setEditFormData] = useState({
    account_number: '',
    subsidy_code: '',
    customer_type: '',
    name: '',
    careof: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    bank_account: '',
    ifsc_code: '',
    pincode: '',
    contact_person: '',
    designation: '',
    total_cows: '',
    total_buffalos: '',
    total_animals: '',
    aadhar_number: '',
    jan_aadhar_number: '',
    state: '',
    wallet: '',
    status: '1'
  })
  const [isSaving, setIsSaving] = useState(false)

  // Data fetching functions (keeping your original logic)
  const fetchAllCustomerData = async () => {
    if (loading) return

    try {
      setLoading(true)
      const res = await getAllCustomer(searchCustomer)

      if (res.status_code == 200) {
        const newData = res.data
        setRowData(newData)
      } else {
        CustomToast.error(res.message || 'Failed to fetch data')
      }
    } catch (err) {
      console.error('Fetch error', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerDetail = async (id) => {
    try {
      const res = await editCustomerValueGet({ customer_id: id })
      const customerData = res.data
      setSelectedCustomer(customerData)
    } catch (error) {
      console.log('ERROR IN FETCH CUSTOMER DETAIL', error)
    }
  }

  // Edit functions (keeping your original logic)
  const handleEditClick = async (row) => {
    try {
      setIsSaving(true)
      const res = await editCustomerValueGet({ customer_id: row.id })

      if (res.status_code === 200) {
        const customerData = res.data

        setEditingRowId(row.id)
        setEditFormData({
          account_number: customerData.account_number || '',
          subsidy_code: customerData.subsidy_code || '',
          customer_type: customerData.customer_type || '',
          name: customerData.name || '',
          careof: customerData.careof || '',
          mobile: customerData.mobile || '',
          email: customerData.email || '',
          address: customerData.address || '',
          city: customerData.city || '',
          bank_account: customerData.bank_account || '',
          ifsc_code: customerData.ifsc_code || '',
          pincode: customerData.pincode || '',
          contact_person: customerData.contact_person || '',
          designation: customerData.designation || '',
          total_cows: customerData.total_cows || '',
          total_buffalos: customerData.total_buffalos || '',
          total_animals: customerData.total_animals || '',
          aadhar_number: customerData.aadhar_number || '',
          jan_aadhar_number: customerData.jan_aadhar_number || '',
          state: customerData.state || '',
          wallet: customerData.wallet || '',
          status: customerData.status || '1'
        })
      } else {
        CustomToast.error('Failed to fetch customer details')
      }
    } catch (error) {
      console.error('Edit error:', error)
      CustomToast.error('Failed to load customer data')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditCancel = () => {
    setEditingRowId(null)
    setEditFormData({
      account_number: '',
      subsidy_code: '',
      customer_type: '',
      name: '',
      careof: '',
      mobile: '',
      email: '',
      address: '',
      city: '',
      bank_account: '',
      ifsc_code: '',
      pincode: '',
      contact_person: '',
      designation: '',
      total_cows: '',
      total_buffalos: '',
      total_animals: '',
      aadhar_number: '',
      jan_aadhar_number: '',
      state: '',
      wallet: '',
      status: '1'
    })
  }

  const handleEditSave = async () => {
    setIsSaving(true)
    try {
      const res = await updateCustomer(editingRowId, editFormData)

      if (res.status_code === 200) {
        CustomToast.success('Customer updated successfully!')
        setEditingRowId(null)
        setEditFormData({})
        fetchAllCustomerData()
      } else {
        CustomToast.error(res.message || 'Failed to update customer')
      }
    } catch (error) {
      console.error('Update error:', error)
      CustomToast.error('Failed to update customer')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const confirmDeleteCustomer = async () => {
    try {
      const res = await deleteCustomer(customerToDelete?.id)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        fetchAllCustomerData()
      } else {
        CustomToast.error(res.message)
      }
    } catch (error) {
      CustomToast.error('Failed to delete customer')
      console.error(error)
    } finally {
      setIsConfirmOpen(false)
      setCustomerToDelete(null)
    }
  }

  // Search and filter functions
  const handleSearch = (value) => {
    setSearchCustomer(value)
    setCurrentPage(1)

    const filtered = rowData.filter((item) => {
      const val = value.toLowerCase()
      return (
        item.name?.toLowerCase().includes(val) ||
        item.account_number?.toString().includes(val) ||
        item.mobile?.toString().includes(val) ||
        item.email?.toLowerCase().includes(val) ||
        item.subsidy_code?.toLowerCase().includes(val) ||
        item.customer_type?.toLowerCase().includes(val)
      )
    })

    setFilteredData(filtered)
  }

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })

    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
      return 0
    })
    setFilteredData(sortedData)
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  useEffect(() => {
    fetchAllCustomerData()
  }, [])

  useEffect(() => {
    setFilteredData(rowData)
  }, [rowData])

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Title and Info */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <User className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Customer Management</h1>
                <p className="text-gray-600 mt-1">Manage and view customer information with advanced features</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>Total: {filteredData.length} customers</span>
                  {editingRowId && (
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full animate-pulse">
                      Editing Mode Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => nav('/addCustomer')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-md transition-all duration-200 flex items-center gap-2 font-medium"
              >
                <FaPlus className="w-4 h-4" />
                Add Customer
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mt-6 pt-6 border-t border-gray-200">
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, account number, mobile, email, subsidy code..."
                value={searchCustomer}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
              />
            </div>

            {/* Items per page */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'card'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-gray-600">Loading customers...</span>
          </div>
        </div>
      )}

      {/* Responsive Table View */}
      {!loading && viewMode === 'table' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto overflow-y-auto h-[65vh] table-scrollbar table-scroll-bg">
              <table className="w-full">
                {/* Table Header - Sticky */}
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="text-left p-4 border-b font-semibold text-gray-700 w-16">Sr.</th>
                    <th
                      className="text-left p-4 border-b font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 min-w-[120px]"
                      onClick={() => handleSort('account_number')}
                    >
                      <div className="flex items-center gap-2">
                        Acc. No.
                        {sortConfig.key === 'account_number' && (
                          <span className="text-orange-500">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-left p-4 border-b font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 min-w-[180px]"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Customer Name
                        {sortConfig.key === 'name' && (
                          <span className="text-orange-500">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-left p-4 border-b font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 min-w-[130px]"
                      onClick={() => handleSort('subsidy_code')}
                    >
                      <div className="flex items-center gap-2">
                        Subsidy Code
                        {sortConfig.key === 'subsidy_code' && (
                          <span className="text-orange-500">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="text-left p-4 border-b font-semibold text-gray-700 min-w-[120px]">Mobile</th>
                    <th className="text-left p-4 border-b font-semibold text-gray-700 min-w-[160px]">Email</th>
                    <th className="text-left p-4 border-b font-semibold text-gray-700 min-w-[180px]">Address</th>
                    <th className="text-left p-4 border-b font-semibold text-gray-700 min-w-[100px]">Wallet</th>
                    <th className="text-center p-4 border-b font-semibold text-gray-700 w-32 sticky right-0 bg-gray-50">Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {currentData.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-gray-50 border-b transition-colors ${editingRowId === row.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                    >
                      {/* Serial Number */}
                      <td className="p-4 text-gray-600 font-medium">
                        {startIndex + index + 1}
                      </td>

                      {/* Account Number */}
                      <td className="p-4">
                        {editingRowId === row.id ? (
                          <input
                            type="text"
                            disabled={true}
                            value={editFormData.account_number}
                            onChange={(e) => handleInputChange('account_number', e.target.value)}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-100 cursor-not-allowed"
                            placeholder="Account No."
                          />
                        ) : (
                          <div className="font-medium text-blue-600">{row.account_number}</div>
                        )}
                      </td>

                      {/* Customer Name */}
                      <td className="p-4">
                        {editingRowId === row.id ? (
                          <input
                            type="text"
                            value={editFormData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Customer Name"
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{row.name}</div>
                              {row.careof && (
                                <div className="text-xs text-gray-500">c/o {row.careof}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* CM Subsidy Code */}
                      <td className="p-4">
                        {editingRowId === row.id ? (
                          <input
                            type="text"
                            value={editFormData.subsidy_code}
                            onChange={(e) => handleInputChange('subsidy_code', e.target.value)}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Subsidy Code"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-700">
                            <FaTicketAlt className="w-4 h-4 text-gray-500" />
                            <span className="font-mono text-sm">
                              {row.subsidy_code || <span className="text-gray-400 italic">N/A</span>}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Mobile */}
                      <td className="p-4">
                        {editingRowId === row.id ? (
                          <input
                            type="tel"
                            value={editFormData.mobile}
                            onChange={(e) => handleInputChange('mobile', e.target.value)}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Mobile Number"
                            maxLength="10"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <a href={`tel:${row.mobile}`} className="hover:text-blue-600 transition-colors">
                              {row.mobile}
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Email */}
                      <td className="p-4">
                        {editingRowId === row.id ? (
                          <input
                            type="email"
                            value={editFormData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Email Address"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Mail className="w-4 h-4 text-gray-500" />
                            {row.email ? (
                              <a href={`mailto:${row.email}`} className="hover:text-blue-600 transition-colors text-sm truncate max-w-[140px]">
                                {row.email}
                              </a>
                            ) : (
                              <span className="text-gray-400 italic text-sm">N/A</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Address */}
                      <td className="p-4">
                        {editingRowId === row.id ? (
                          <textarea
                            value={editFormData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                            placeholder="Address"
                            rows="2"
                          />
                        ) : (
                          <div className="flex items-start gap-2 text-gray-700">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <div className="line-clamp-2 max-w-[160px]" title={row.address}>
                                {row.address || 'N/A'}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Wallet */}
                      <td className="p-4">
                        {editingRowId === row.id ? (
                          <input
                            type="number"
                            value={editFormData.wallet}
                            onChange={(e) => handleInputChange('wallet', e.target.value)}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Wallet Amount"
                            min="0"
                            step="0.01"
                          />
                        ) : (
                          <div className="text-green-600 font-bold text-sm">
                            ₹{parseFloat(row.wallet || 0).toLocaleString('en-IN', {
                              minimumFractionDigits: 2
                            })}
                          </div>
                        )}
                      </td>

                      {/* Actions - Sticky */}
                      <td className="p-4 sticky right-0 bg-white border-l border-gray-200">
                        <div className="flex items-center justify-center gap-1">
                          {editingRowId === row.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={handleEditSave}
                                disabled={isSaving}
                                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Save Changes"
                              >
                                <FaSave className="w-3 h-3" />
                                {isSaving ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={handleEditCancel}
                                disabled={isSaving}
                                className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition-colors duration-200 flex items-center gap-1 disabled:opacity-50"
                                title="Cancel Edit"
                              >
                                <FaTimes className="w-3 h-3" />
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              <button
                                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                                onClick={() => {
                                  fetchCustomerDetail(row.id)
                                  setIsModalOpen(true)
                                }}
                                title="View Details"
                              >
                                <FaEye className="w-3 h-3" />
                              </button>
                              <button
                                className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200"
                                onClick={() => handleEditClick(row)}
                                title="Edit Inline"
                              >
                                <FaEdit className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Responsive Cards (lg:hidden) */}
          <div className="lg:hidden">
            <div className="space-y-4 p-4">
              {currentData.map((customer, index) => (
                <div key={customer.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold">
                        {startIndex + index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{customer.name}</h3>
                        <p className="text-xs text-blue-600">A/c: {customer.account_number}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                        onClick={() => {
                          fetchCustomerDetail(customer.id)
                          setIsModalOpen(true)
                        }}
                        title="View Details"
                      >
                        <FaEye className="w-3 h-3" />
                      </button>
                      <button
                        className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200"
                        onClick={() => handleEditClick(customer)}
                        title="Edit"
                      >
                        <FaEdit className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-3 h-3" />
                      <a href={`tel:${customer.mobile}`} className="hover:text-blue-600">
                        {customer.mobile}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaTicketAlt className="w-3 h-3" />
                      <span className="truncate">{customer.subsidy_code || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{customer.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 font-bold">
                      <span>₹</span>
                      <span>{parseFloat(customer.wallet || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {customer.address && (
                    <div className="mt-2 flex items-start gap-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{customer.address}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* No Data State */}
          {currentData.length === 0 && !loading && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No customers found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria or add a new customer</p>
            </div>
          )}

          {/* Pagination */}
          {filteredData.length > itemsPerPage && (
            <div className="bg-gray-50 px-4 lg:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-gray-700 text-center sm:text-left">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} customers
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${currentPage === page
                              ? 'text-orange-600 bg-orange-100'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-gray-400">...</span>
                    }
                    return null
                  })}
                </div>

                {/* Mobile page indicator */}
                <div className="sm:hidden text-sm text-gray-600 px-3 py-2">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Card View */}
      {!loading && viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentData.map((customer) => (
            <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-blue-600">{customer.account_number}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaTicketAlt className="w-4 h-4" />
                  <span className="font-mono">{customer.subsidy_code || 'No subsidy code'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{customer.mobile}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{customer.address || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Wallet Balance:</span>
                  <span className="text-green-600 font-bold">
                    ₹{parseFloat(customer.wallet || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  onClick={() => {
                    fetchCustomerDetail(customer.id)
                    setIsModalOpen(true)
                  }}
                >
                  <FaEye className="w-3 h-3" />
                  View
                </button>
                {/* <button
                  className="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  onClick={() => handleEditClick(customer)}
                >
                  <FaEdit className="w-3 h-3" />
                  Edit
                </button> */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Detail Modal (keeping your original modal code but updated) */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white">
                    <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
                    <p className="text-orange-100 text-sm">Account No: {selectedCustomer.account_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${selectedCustomer.status === '1'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    <FaDotCircle className="w-3 h-3" />
                    {selectedCustomer.status === '1' ? 'Active Customer' : 'Inactive Customer'}
                  </span>

                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-white hover:text-red-200 transition-colors duration-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                    title="Close"
                  >
                    <IoMdCloseCircle size={28} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Customer Type</p>
                      <span className={`inline-block mt-1 px-4 py-2 rounded-lg font-medium ${selectedCustomer.customer_type === 'Seller' ? 'bg-green-100 text-green-700' :
                          selectedCustomer.customer_type === 'Buyer' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        <FaBuilding className="inline w-4 h-4 mr-2" />
                        {selectedCustomer.customer_type || 'Regular'}
                      </span>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-semibold">CM Subsidy Code</p>
                      <div className="mt-1 text-sm font-bold text-purple-600 font-mono">
                        {selectedCustomer.subsidy_code || 'N/A'}
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Wallet Balance</p>
                      <div className="mt-1 text-2xl font-bold text-green-600 flex items-center gap-1">
                        <span>₹</span>
                        <span>{parseFloat(selectedCustomer.wallet || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Member Since</p>
                      <div className="mt-1 text-sm font-medium text-gray-700">
                        {new Date(selectedCustomer.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Details Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoCard
                    label="Full Name"
                    value={selectedCustomer.name}
                    icon={<User className="w-4 h-4" />}
                  />
                  <InfoCard
                    label="Care Of"
                    value={selectedCustomer.careof}
                    icon={<UserCheck className="w-4 h-4" />}
                  />
                  <InfoCard
                    label="Mobile Number"
                    value={selectedCustomer.mobile}
                    icon={<Phone className="w-4 h-4" />}
                  />
                  <InfoCard
                    label="Email Address"
                    value={selectedCustomer.email}
                    icon={<Mail className="w-4 h-4" />}
                  />
                  <InfoCard
                    label="Address"
                    value={selectedCustomer.address}
                    icon={<MapPin className="w-4 h-4" />}
                  />
                  <InfoCard
                    label="City"
                    value={selectedCustomer.city}
                  />
                  <InfoCard
                    label="State"
                    value={selectedCustomer.state}
                  />
                  <InfoCard
                    label="Pincode"
                    value={selectedCustomer.pincode}
                  />
                  <InfoCard
                    label="Bank Account"
                    value={selectedCustomer.bank_account}
                    icon={<CreditCard className="w-4 h-4" />}
                  />
                  <InfoCard
                    label="IFSC Code"
                    value={selectedCustomer.ifsc_code}
                    icon={<Building2 className="w-4 h-4" />}
                  />
                  <InfoCard
                    label="CM Subsidy Code"
                    value={selectedCustomer.subsidy_code}
                    icon={<FaTicketAlt className="w-4 h-4" />}
                  />
                  <InfoCard
                    label="Aadhar Number"
                    value={selectedCustomer.aadhar_number}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
                <span>Customer Profile - Complete Information</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    nav('/editCustomer', { state: selectedCustomer })
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium"
                >
                  <FaPen className="w-4 h-4" />
                  Edit Customer
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrashAlt className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Customer</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{customerToDelete?.name}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setIsConfirmOpen(false)
                    setCustomerToDelete(null)
                  }}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCustomer}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerList

// InfoCard component for modal
const InfoCard = ({ label, value, icon }) => {
  const isImage = typeof value === 'string' && (
    value.endsWith('.jpg') || value.endsWith('.jpeg') ||
    value.endsWith('.png') || value.endsWith('.webp') ||
    value.endsWith('.gif')
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-2 mb-2">
        {icon && <div className="text-gray-500">{icon}</div>}
        <p className="text-xs uppercase font-semibold text-gray-500 tracking-wide">{label}</p>
      </div>

      {isImage ? (
        <img
          src={value}
          alt={label}
          className="rounded-lg border border-gray-200 shadow-sm max-h-32 w-full object-cover"
        />
      ) : (
        <div className="break-words">
          {value ? (
            <p className="font-medium text-gray-800 leading-relaxed">
              {label.includes('Mobile') || label.includes('Phone') ? (
                <a href={`tel:${value}`} className="text-blue-600 hover:underline">
                  {value}
                </a>
              ) : label.includes('Email') ? (
                <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
                  {value}
                </a>
              ) : label.includes('Wallet') || label.includes('Balance') ? (
                <span className="text-green-600 font-bold">
                  ₹{parseFloat(value || 0).toLocaleString('en-IN', {
                    minimumFractionDigits: 2
                  })}
                </span>
              ) : label.includes('Subsidy Code') ? (
                <span className="font-mono text-sm text-purple-600">{value}</span>
              ) : label.includes('Account') && value.length > 10 ? (
                <span className="font-mono text-sm">{value}</span>
              ) : (
                value
              )}
            </p>
          ) : (
            <p className="text-gray-400 italic">Not provided</p>
          )}
        </div>
      )}
    </div>
  )
}
