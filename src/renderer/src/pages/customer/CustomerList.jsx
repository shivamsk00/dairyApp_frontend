import React, { useEffect, useRef, useState } from 'react'
import './customer.css'
import { FaDotCircle, FaEye, FaPen, FaTrashAlt, FaSave, FaTimes, FaEdit, FaBuilding } from 'react-icons/fa'
import { User, Phone, MapPin, Building2, CreditCard, Mail, UserCheck, Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useHomeStore from '../../zustand/useHomeStore'
import { IoMdCloseCircle } from 'react-icons/io'
import CustomToast from '../../helper/costomeToast'
import DataTable from 'react-data-table-component'

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

  // Updated inline editing states based on API response
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

  // Enhanced edit functionality based on actual API response
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
      console.log('Saving customer data:', editFormData)

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

  useEffect(() => {
    fetchAllCustomerData()
  }, [])

  useEffect(() => {
    setFilteredData(rowData)
  }, [rowData])

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

  // Updated Table Columns based on API response structure
  const columns = [
    {
      name: 'Sr No.',
      cell: (row, index) => (
        <div className="text-center font-medium text-gray-700">
          {index + 1}
        </div>
      ),
      width: '70px',
      center: true
    },
    {
      name: 'Account No.',
      cell: (row) => (
        <div className="py-2" style={{ minWidth: '120px' }}>
          {editingRowId === row.id ? (
            <input
              type="text"
              disabled={true}
              value={editFormData.account_number}
              onChange={(e) => handleInputChange('account_number', e.target.value)}
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Account No."
            />
          ) : (
            <div className="font-medium text-blue-600">{row.account_number}</div>
          )}
        </div>
      ),
      sortable: true,
      width: '120px'
    },
    {
      name: 'Customer Name',
      cell: (row) => (
        <div className="py-2" style={{ minWidth: '180px' }}>
          {editingRowId === row.id ? (
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Customer Name"
            />
          ) : (
            <div className="font-medium text-gray-800 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              {row.name.slice(0, 15)}{row.name.length > 15 ? '...' : ''}
            </div>
          )}
        </div>
      ),
      sortable: true,
      width: '180px'
    },
    // {
    //   name: 'Customer Type',
    //   cell: (row) => (
    //     <div className="py-2" style={{ minWidth: '130px' }}>
    //       {editingRowId === row.id ? (
    //         <select
    //           value={editFormData.customer_type}
    //           onChange={(e) => handleInputChange('customer_type', e.target.value)}
    //           className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    //         >
    //           <option value="">Select Type</option>
    //           <option value="Seller">Seller</option>
    //           <option value="Buyer">Buyer</option>
    //           <option value="Regular">Regular</option>
    //           <option value="Premium">Premium</option>
    //         </select>
    //       ) : (
    //         <div className="flex items-center gap-2 text-gray-700">
    //           <FaBuilding className="w-4 h-4 text-gray-500" />
    //           <span className={`px-2 py-1 rounded text-xs font-medium ${
    //             row.customer_type === 'Seller' ? 'bg-green-100 text-green-700' :
    //             row.customer_type === 'Buyer' ? 'bg-blue-100 text-blue-700' :
    //             'bg-gray-100 text-gray-700'
    //           }`}>
    //             {row.customer_type || 'N/A'}
    //           </span>
    //         </div>
    //       )}
    //     </div>
    //   ),
    //   width: '130px'
    // },
    {
      name: 'Mobile',
      cell: (row) => (
        <div className="py-2" style={{ minWidth: '130px' }}>
          {editingRowId === row.id ? (
            <input
              type="tel"
              value={editFormData.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Mobile Number"
              maxLength="10"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="w-4 h-4 text-gray-500" />
              {row.mobile}
            </div>
          )}
        </div>
      ),
      sortable: true,
      width: '130px'
    },
    {
      name: 'Email',
      cell: (row) => (
        <div className="py-2" style={{ minWidth: '180px' }}>
          {editingRowId === row.id ? (
            <input
              type="email"
              value={editFormData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Email Address"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-700 text-sm">
              <Mail className="w-4 h-4 text-gray-500" />
              {row.email || 'N/A'}
            </div>
          )}
        </div>
      ),
      width: '180px'
    },
    {
      name: 'Care Of',
      cell: (row) => (
        <div className="py-2" style={{ minWidth: '150px' }}>
          {editingRowId === row.id ? (
            <input
              type="text"
              value={editFormData.careof}
              onChange={(e) => handleInputChange('careof', e.target.value)}
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Care Of"
            />
          ) : (
            <div className="text-gray-700 text-sm">{row.careof || 'N/A'}</div>
          )}
        </div>
      ),
      width: '150px'
    },
    {
      name: 'Address',
      cell: (row) => (
        <div className="py-2" style={{ minWidth: '200px' }}>
          {editingRowId === row.id ? (
            <textarea
              value={editFormData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              placeholder="Address"
              rows="2"
            />
          ) : (
            <div className="flex items-start gap-2 text-gray-700 text-sm">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2" title={row.address}>{row.address || 'N/A'}</span>
            </div>
          )}
        </div>
      ),
      width: '200px'
    },
    {
      name: 'City',
      cell: (row) => (
        <div className="py-2" style={{ minWidth: '120px' }}>
          {editingRowId === row.id ? (
            <input
              type="text"
              value={editFormData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="City"
            />
          ) : (
            <div className="text-gray-700 text-sm">{row.city || 'N/A'}</div>
          )}
        </div>
      ),
      width: '120px'
    },
    {
      name: 'State',
      cell: (row) => (
        <div className="py-2" style={{ minWidth: '120px' }}>
          {editingRowId === row.id ? (
            <input
              type="text"
              value={editFormData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="State"
            />
          ) : (
            <div className="text-gray-700 text-sm">{row.state || 'N/A'}</div>
          )}
        </div>
      ),
      width: '120px'
    },
    {
      name: 'Pincode',
      cell: (row) => (
        <div className="py-2" style={{ minWidth: '100px' }}>
          {editingRowId === row.id ? (
            <input
              type="text"
              value={editFormData.pincode}
              onChange={(e) => handleInputChange('pincode', e.target.value)}
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Pincode"
              maxLength="6"
            />
          ) : (
            <div className="text-gray-700 text-sm">{row.pincode || 'N/A'}</div>
          )}
        </div>
      ),
      width: '100px'
    },
    {
      name: 'Bank Account',
      cell: (row) => (
        <div className="py-2" style={{ minWidth: '150px' }}>
          {editingRowId === row.id ? (
            <input
              type="text"
              value={editFormData.bank_account}
              onChange={(e) => handleInputChange('bank_account', e.target.value)}
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Bank Account"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-700 text-sm">
              <CreditCard className="w-4 h-4 text-gray-500" />
              {row.bank_account || 'N/A'}
            </div>
          )}
        </div>
      ),
      width: '150px'
    },
    {
      name: 'IFSC Code',
      cell: (row) => (
        <div className="py-2" style={{ minWidth: '120px' }}>
          {editingRowId === row.id ? (
            <input
              type="text"
              value={editFormData.ifsc_code}
              onChange={(e) => handleInputChange('ifsc_code', e.target.value)}
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="IFSC Code"
            />
          ) : (
            <div className="text-gray-700 text-sm font-mono">{row.ifsc_code || 'N/A'}</div>
          )}
        </div>
      ),
      width: '120px'
    },
    {
      name: 'Subsidy Code',
      cell: (row) => (
        <div className="py-2" style={{ minWidth: '130px' }}>
          {editingRowId === row.id ? (
            <input
              type="text"
              value={editFormData.subsidy_code}
              onChange={(e) => handleInputChange('subsidy_code', e.target.value)}
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Subsidy Code"
            />
          ) : (
            <div className="text-gray-700 text-sm">{row.subsidy_code || 'N/A'}</div>
          )}
        </div>
      ),
      width: '130px'
    },
    {
      name: 'Wallet Balance',
      cell: (row) => (
        <div className="py-2" style={{ minWidth: '130px' }}>
          {editingRowId === row.id ? (
            <input
              type="number"
              value={editFormData.wallet}
              onChange={(e) => handleInputChange('wallet', e.target.value)}
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Wallet Amount"
              min="0"
              step="0.01"
            />
          ) : (
            <div className="text-green-600 font-bold text-sm flex items-center gap-1">
              ₹{parseFloat(row.wallet || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          )}
        </div>
      ),
      width: '130px'
    },
    {
      name: 'Status',
      cell: (row) => (
        <div className="py-2" style={{ minWidth: '120px' }}>
          {editingRowId === row.id ? (
            <select
              value={editFormData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          ) : (
            <div className="flex gap-2 items-center">
              <FaDotCircle color={row.status == '1' ? '#10b981' : '#ef4444'} />
              <span className={`text-sm font-medium px-2 py-1 rounded ${row.status == '1' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                {row.status == '1' ? 'Active' : 'Inactive'}
              </span>
            </div>
          )}
        </div>
      ),
      center: true,
      width: '120px'
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex gap-1 items-center justify-center py-2 sticky-column" style={{ minWidth: '70px', position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 5, boxShadow: '-2px 0 4px rgba(0,0,0,0.1)' }}>
          {editingRowId === row.id ? (
            <div className="flex gap-1">
              <button
                onClick={handleEditSave}
                disabled={isSaving}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1 disabled:opacity-50 whitespace-nowrap"
                title="Save Changes"
              >
                <FaSave className="w-3 h-3" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleEditCancel}
                disabled={isSaving}
                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1 disabled:opacity-50 whitespace-nowrap"
                title="Cancel Edit"
              >
                <FaTimes className="w-3 h-3" />
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-1">
              <button
                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors duration-200"
                onClick={() => {
                  fetchCustomerDetail(row.id)
                  setIsModalOpen(true)
                }}
                title="View Details"
              >
                <FaEye className="w-3 h-3" />
              </button>
              <button
                className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs transition-colors duration-200"
                onClick={() => handleEditClick(row)}
                title="Edit Inline"
              >
                <FaEdit className="w-3 h-3" />
              </button>
              {/* <button
                className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs transition-colors duration-200"
                onClick={() => nav('/editCustomer', { state: row })}
                title="Edit Full Form"
              >
                <FaPen className="w-3 h-3" />
              </button> */}
              {/* <button
                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors duration-200"
                onClick={() => {
                  setCustomerToDelete(row)
                  setIsConfirmOpen(true)
                }}
                title="Delete Customer"
              >
                <FaTrashAlt className="w-3 h-3" />
              </button> */}
            </div>
          )}
        </div>
      ),
      // right: true,
      allowOverflow: true,
      flex: "100px"
    }
  ]

  const handleSearch = (value) => {
    setSearchCustomer(value)

    const filtered = rowData.filter((item) => {
      const val = value.toLowerCase()
      return (
        item.name?.toLowerCase().includes(val) ||
        item.account_number?.toString().includes(val) ||
        item.mobile?.toString().includes(val) ||
        item.email?.toLowerCase().includes(val) ||
        item.city?.toLowerCase().includes(val) ||
        item.state?.toLowerCase().includes(val) ||
        item.customer_type?.toLowerCase().includes(val)
      )
    })

    setFilteredData(filtered)
  }

  return (
    <div ref={scrollRef} className="overflow-y-auto overflow-x-auto p-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex justify-between w-[60%] items-center mb-6 bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <User className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
            <p className="text-sm text-gray-600">Manage your customer database with inline editing</p>
          </div>
        </div>
        <button
          onClick={() => nav('/addCustomer')}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 font-medium"
        >
          <User className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Enhanced DataTable with proper horizontal scroll */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Fixed Header */}
        <div className="flex justify-between items-center w-full p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">Customer List</h2>
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
              {filteredData.length} customers
            </span>
            {editingRowId && (
              <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                Editing Mode Active
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchCustomer}
              onChange={(e) => handleSearch(e.target.value)}
              className="border-2 border-gray-300 focus:border-orange-500 px-4 py-2 text-sm rounded-full w-80 outline-none transition-colors duration-200 pl-12"
            />
            <div className="absolute left-4 top-2.5 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Table Container with horizontal scroll */}
        <div className="w-full overflow-x-auto" style={{ maxHeight: '70vh' }}>
          <div style={{ width: "65%" }}>
            <DataTable
              columns={columns}
              data={filteredData}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 50, 100]}
              highlightOnHover
              striped
              dense={false}
              customStyles={{
                headCells: {
                  style: {
                    backgroundColor: '#f8fafc',
                    color: '#1f2937',
                    fontWeight: '600',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    borderBottom: '2px solid #e5e7eb',
                    padding: '12px 8px',
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content'
                  },
                },
                cells: {
                  style: {
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    textOverflow: 'clip',
                    minWidth: 'fit-content',
                    padding: '8px'
                  }
                },
                rows: {
                  style: {
                    backgroundColor: 'white',
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'all 0.2s ease',
                    minHeight: '60px',
                    '&:hover': {
                      backgroundColor: '#fef3f2',
                    },
                  },
                },
                table: {
                  style: {
                    width: '100%',
                    minWidth: '2500px'
                  },
                },
                pagination: {
                  style: {
                    backgroundColor: '#f8fafc',
                    borderTop: '2px solid #e5e7eb',
                    padding: '16px',
                    minWidth: '100%'
                  },
                },
              }}
              progressPending={loading}
              progressComponent={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="ml-3 text-gray-600">Loading customers...</span>
                </div>
              }
              noDataComponent={
                <div className="flex flex-col items-center justify-center py-12">
                  <User className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No customers found</p>
                  <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                </div>
              }
            />
          </div>
        </div>
      </div>
      {/* Enhanced Customer View Modal */}
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

                {/* Status Badge */}
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

            {/* Modal Content - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">

              {/* Customer Type & Wallet Section */}
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

              {/* Main Content Grid */}
              <div className="p-6">

                {/* Personal Information Section */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      label="Contact Person"
                      value={selectedCustomer.contact_person}
                      icon={<UserCheck className="w-4 h-4" />}
                    />
                    <InfoCard
                      label="Designation"
                      value={selectedCustomer.designation}
                      icon={<Briefcase className="w-4 h-4" />}
                    />
                  </div>
                </div>

                {/* Address Information Section */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Address Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                      <InfoCard
                        label="Full Address"
                        value={selectedCustomer.address}
                        icon={<MapPin className="w-4 h-4" />}
                      />
                    </div>
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
                  </div>
                </div>

                {/* Financial Information Section */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Financial Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoCard
                      label="Bank Account Number"
                      value={selectedCustomer.bank_account}
                      icon={<CreditCard className="w-4 h-4" />}
                    />
                    <InfoCard
                      label="IFSC Code"
                      value={selectedCustomer.ifsc_code}
                      icon={<Building2 className="w-4 h-4" />}
                    />
                    <InfoCard
                      label="Subsidy Code"
                      value={selectedCustomer.subsidy_code}
                    />
                  </div>
                </div>

                {/* Animal Information Section (if available) */}
                {(selectedCustomer.total_cows || selectedCustomer.total_buffalos || selectedCustomer.total_animals) && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <FaCow className="w-5 h-5 text-yellow-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Livestock Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InfoCard
                        label="Total Cows"
                        value={selectedCustomer.total_cows || '0'}
                        icon={<FaCow className="w-4 h-4" />}
                      />
                      <InfoCard
                        label="Total Buffalos"
                        value={selectedCustomer.total_buffalos || '0'}
                      />
                      <InfoCard
                        label="Total Animals"
                        value={selectedCustomer.total_animals || '0'}
                      />
                    </div>
                  </div>
                )}

                {/* Identity Information Section */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Identity Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      label="Aadhar Number"
                      value={selectedCustomer.aadhar_number}
                    />
                    <InfoCard
                      label="Jan Aadhar Number"
                      value={selectedCustomer.jan_aadhar_number}
                    />
                  </div>
                </div>

                {/* Bank Document Section */}
                {selectedCustomer.bank_image && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <CreditCard className="w-5 h-5 text-red-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Bank Document</h3>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <div className="text-center">
                        <img
                          src={selectedCustomer.bank_image}
                          alt="Bank Document"
                          className="max-h-64 max-w-full mx-auto object-contain rounded-lg shadow-md border"
                        />
                        <p className="text-sm text-gray-600 mt-2">Bank Document Copy</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Account Timeline</h3>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Account Created:</span>
                        <span className="text-sm text-gray-600">
                          {new Date(selectedCustomer.created_at).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Last Updated:</span>
                        <span className="text-sm text-gray-600">
                          {new Date(selectedCustomer.updated_at).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Customer ID:</span>
                        <span className="text-sm text-gray-600 font-mono">#{selectedCustomer.id}</span>
                      </div>
                    </div>
                  </div>
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

    </div>
  )
}

export default CustomerList


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
              {/* Special formatting for specific fields */}
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