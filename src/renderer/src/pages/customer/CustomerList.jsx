import { useEffect, useState } from 'react'
import './customer.css'
import {
  ArrowDown,
  ArrowUp,
  Building2,
  ChevronsUpDown,
  CreditCard,
  Eye,
  IndianRupee,
  Mail,
  MapPin,
  Milk,
  Pencil,
  Phone,
  Save,
  Search,
  ShoppingBag,
  Ticket,
  User,
  UserCheck,
  UserPlus,
  Users,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  DataTable,
  DeleteConfirmModal,
  IconBadge,
  IconButton,
  Input,
  KpiCard,
  Modal,
  PageLoader,
  Pagination,
  SelectDropdown,
  SurfaceCard,
  useDocumentTitle
} from '../../components/ui'

const CustomerList = () => {
  useDocumentTitle('Customers')
  const nav = useNavigate()
  const getAllCustomer = useHomeStore((state) => state.getAllCustomer)
  const deleteCustomer = useHomeStore((state) => state.deleteCustomer)
  const editCustomerValueGet = useHomeStore((state) => state.editCustomerValueGet)
  const updateCustomer = useHomeStore((state) => state.updateCustomer)

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

  // Edit Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editModalCustomerId, setEditModalCustomerId] = useState(null)
  const [editModalLoading, setEditModalLoading] = useState(false)
  const [editModalSaving, setEditModalSaving] = useState(false)
  const [editModalData, setEditModalData] = useState({
    account_number: '',
    customer_type: '',
    name: '',
    careof: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    wallet: '',
    pincode: '',
    bank_account: '',
    ifsc_code: '',
    subsidy_code: '',
    contact_person: '',
    designation: '',
    total_cows: '',
    total_buffalos: '',
    total_animals: '',
    farmer_code: '',
    status: '1'
  })

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
    setEditFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  // Edit Modal handlers
  const handleEditModalOpen = async (customer) => {
    setIsEditModalOpen(true)
    setEditModalLoading(true)
    setEditModalCustomerId(customer.id)
    try {
      const res = await editCustomerValueGet({ customer_id: customer.id })
      if (res.status_code === 200) {
        const d = res.data
        setEditModalData({
          account_number: d.account_number || '',
          customer_type: d.customer_type || '',
          name: d.name || '',
          careof: d.careof || '',
          mobile: d.mobile || '',
          email: d.email || '',
          address: d.address || '',
          city: d.city || '',
          state: d.state || '',
          wallet: d.wallet || '',
          pincode: d.pincode || '',
          bank_account: d.bank_account || '',
          ifsc_code: d.ifsc_code || '',
          subsidy_code: d.subsidy_code || '',
          contact_person: d.contact_person || '',
          designation: d.designation || '',
          total_cows: d.total_cows || '',
          total_buffalos: d.total_buffalos || '',
          total_animals: d.total_animals || '',
          farmer_code: d.farmer_code || '',
          status: d.status || '1'
        })
      } else {
        CustomToast.error(res.message || 'Failed to fetch customer details')
        setIsEditModalOpen(false)
      }
    } catch (error) {
      console.error('Edit modal fetch error:', error)
      CustomToast.error('Failed to load customer data')
      setIsEditModalOpen(false)
    } finally {
      setEditModalLoading(false)
    }
  }

  const handleEditModalChange = (field, value) => {
    setEditModalData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEditModalSave = async () => {
    setEditModalSaving(true)
    try {
      const res = await updateCustomer(editModalCustomerId, editModalData)
      if (res.status_code === 200) {
        CustomToast.success('Customer updated successfully!')
        setIsEditModalOpen(false)
        setEditModalCustomerId(null)
        setEditModalData({
          account_number: '',
          customer_type: '',
          name: '',
          careof: '',
          mobile: '',
          email: '',
          address: '',
          city: '',
          state: '',
          wallet: '',
          pincode: '',
          bank_account: '',
          ifsc_code: '',
          subsidy_code: '',
          contact_person: '',
          designation: '',
          total_cows: '',
          total_buffalos: '',
          total_animals: '',
          farmer_code: '',
          status: '1'
        })
        fetchAllCustomerData()
      } else {
        CustomToast.error(res.message || 'Failed to update customer')
      }
    } catch (error) {
      console.error('Edit modal save error:', error)
      CustomToast.error('Failed to update customer')
    } finally {
      setEditModalSaving(false)
    }
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setEditModalCustomerId(null)
    setEditModalData({
      account_number: '',
      customer_type: '',
      name: '',
      careof: '',
      mobile: '',
      email: '',
      address: '',
      city: '',
      state: '',
      wallet: '',
      pincode: '',
      bank_account: '',
      ifsc_code: '',
      subsidy_code: '',
      contact_person: '',
      designation: '',
      total_cows: '',
      total_buffalos: '',
      total_animals: '',
      farmer_code: '',
      status: '1'
    })
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
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  useEffect(() => {
    fetchAllCustomerData()
  }, [])

  useEffect(() => {
    setFilteredData(rowData)
  }, [rowData])

  const openDetails = (id) => {
    // Clear the previous customer first so the dialog never flashes someone else's details.
    setSelectedCustomer(null)
    setIsModalOpen(true)
    fetchCustomerDetail(id)
  }

  const money = (value) =>
    `₹${parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // Headline numbers use the full list, not the current search.
  const sellers = rowData.filter((c) => c.customer_type === 'Seller').length
  const buyers = rowData.filter((c) => c.customer_type === 'Buyer').length
  const walletTotal = rowData.reduce((sum, c) => sum + parseFloat(c.wallet || 0), 0)

  const sortHeader = (label, field) => {
    const active = sortConfig.key === field
    const Icon = !active ? ChevronsUpDown : sortConfig.direction === 'asc' ? ArrowUp : ArrowDown
    return (
      <button
        type="button"
        onClick={() => handleSort(field)}
        className="inline-flex items-center gap-1 uppercase"
        aria-label={`Sort by ${label}`}
      >
        {label}
        <Icon size={12} className={active ? 'ui-text-brand' : 'opacity-50'} aria-hidden="true" />
      </button>
    )
  }

  const editing = (row) => editingRowId === row.id
  // Compact inputs for editing inside a table row.
  const cell = 'w-full !min-h-8 !px-2 !py-1 !text-[12px]'

  const columns = [
    {
      key: 'sr',
      header: 'Sr.',
      render: (row) => <span className="ui-text-tertiary">{filteredData.indexOf(row) + 1}</span>
    },
    {
      key: 'account_number',
      header: sortHeader('Acc. No.', 'account_number'),
      render: (row) =>
        editing(row) ? (
          <Input
            className={cell}
            type="text"
            disabled
            value={editFormData.account_number}
            readOnly
          />
        ) : (
          <span className="ui-text-brand font-semibold">{row.account_number}</span>
        )
    },
    {
      key: 'name',
      header: sortHeader('Customer', 'name'),
      render: (row) =>
        editing(row) ? (
          <Input
            className={cell}
            type="text"
            placeholder="Customer Name"
            value={editFormData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        ) : (
          <div className="flex items-center gap-2.5">
            <Avatar name={row.name || 'C'} className="size-8 text-[11px]" />
            <div className="min-w-0">
              <div className="font-semibold">{row.name}</div>
              {row.careof && <div className="ui-text-tertiary text-[11px]">c/o {row.careof}</div>}
            </div>
          </div>
        )
    },
    {
      key: 'subsidy_code',
      header: sortHeader('Subsidy Code', 'subsidy_code'),
      render: (row) =>
        editing(row) ? (
          <Input
            className={cell}
            type="text"
            placeholder="Subsidy Code"
            value={editFormData.subsidy_code}
            onChange={(e) => handleInputChange('subsidy_code', e.target.value)}
          />
        ) : row.subsidy_code ? (
          <span className="font-mono text-[12px]">{row.subsidy_code}</span>
        ) : (
          <span className="ui-text-tertiary italic">N/A</span>
        )
    },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (row) =>
        editing(row) ? (
          <Input
            className={cell}
            type="tel"
            maxLength="10"
            placeholder="Mobile Number"
            value={editFormData.mobile}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
          />
        ) : (
          <a
            href={`tel:${row.mobile}`}
            className="inline-flex items-center gap-1.5 hover:text-[color:var(--ui-primary-600)]"
          >
            <Phone size={12} className="ui-text-tertiary" aria-hidden="true" />
            {row.mobile}
          </a>
        )
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) =>
        editing(row) ? (
          <Input
            className={cell}
            type="email"
            placeholder="Email Address"
            value={editFormData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        ) : row.email ? (
          <a
            href={`mailto:${row.email}`}
            className="inline-flex max-w-[190px] items-center gap-1.5 hover:text-[color:var(--ui-primary-600)]"
          >
            <Mail size={12} className="ui-text-tertiary shrink-0" aria-hidden="true" />
            <span className="truncate">{row.email}</span>
          </a>
        ) : (
          <span className="ui-text-tertiary italic">N/A</span>
        )
    },
    {
      key: 'wallet',
      header: 'Wallet',
      className: 'text-right',
      render: (row) =>
        editing(row) ? (
          <Input
            className={cell}
            type="number"
            min="0"
            step="0.01"
            placeholder="Wallet Amount"
            value={editFormData.wallet}
            onChange={(e) => handleInputChange('wallet', e.target.value)}
          />
        ) : (
          <span className="font-bold text-[color:var(--ui-success-600)]">{money(row.wallet)}</span>
        )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) =>
        editing(row) ? (
          <div className="flex justify-end gap-1.5">
            <Button
              size="sm"
              variant="success"
              icon={Save}
              loading={isSaving}
              onClick={handleEditSave}
            >
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={X}
              disabled={isSaving}
              onClick={handleEditCancel}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-0.5">
            <IconButton
              icon={Eye}
              label="View details"
              iconSize={15}
              className="!size-8"
              onClick={() => openDetails(row.id)}
            />
            <IconButton
              icon={Pencil}
              label="Edit inline"
              iconSize={15}
              className="!size-8"
              onClick={() => handleEditClick(row)}
            />
          </div>
        )
    }
  ]

  const typeTone = (type) => (type === 'Seller' ? 'success' : type === 'Buyer' ? 'info' : 'neutral')

  const editFields = [
    { label: 'Account Number', name: 'account_number', disabled: true },
    { label: 'Customer Type', name: 'customer_type', isSelect: true },
    { label: 'Name', name: 'name' },
    { label: 'Care Of', name: 'careof' },
    { label: 'Mobile', name: 'mobile', type: 'number' },
    { label: 'Email', name: 'email', type: 'email' },
    { label: 'Address', name: 'address' },
    { label: 'City', name: 'city' },
    { label: 'State', name: 'state' },
    { label: 'Pincode', name: 'pincode', type: 'number' },
    { label: 'Wallet', name: 'wallet', type: 'number' },
    { label: 'Contact Person', name: 'contact_person' },
    { label: 'Designation', name: 'designation' },
    { label: 'Bank Account', name: 'bank_account', type: 'number' },
    { label: 'IFSC Code', name: 'ifsc_code' },
    { label: 'Subsidy Code', name: 'subsidy_code' },
    { label: 'Farmer Code', name: 'farmer_code' },
    { label: 'Total Cows', name: 'total_cows', type: 'number' },
    { label: 'Total Buffalos', name: 'total_buffalos', type: 'number' },
    { label: 'Total Animals', name: 'total_animals', type: 'number' }
  ]

  return (
    <div className="w-full ui-text-primary">
      <Breadcrumb
        title="Customers"
        items={[{ label: 'Home', to: '/' }, { label: 'Customers' }]}
        actions={
          <Button size="sm" icon={UserPlus} onClick={() => nav('/addCustomer')}>
            Add Customer
          </Button>
        }
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <KpiCard
            className="col-span-2 lg:col-span-1"
            label="Total Customers"
            value={rowData.length}
            icon={Users}
            tone="info"
          />
          <KpiCard
            label="Sellers"
            value={sellers}
            icon={Milk}
            tone="primary"
            details={[
              {
                label: 'Supply milk',
                value: `${rowData.length ? Math.round((sellers / rowData.length) * 100) : 0}%`
              }
            ]}
          />
          <KpiCard
            label="Buyers"
            value={buyers}
            icon={ShoppingBag}
            tone="accent"
            details={[
              {
                label: 'Buy from dairy',
                value: `${rowData.length ? Math.round((buyers / rowData.length) * 100) : 0}%`
              }
            ]}
          />
          <KpiCard
            className="col-span-2 lg:col-span-1"
            label="Total Wallet Balance"
            value={money(walletTotal)}
            icon={IndianRupee}
            tone="success"
          />
        </div>

        <SurfaceCard className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={15}
                className="ui-text-tertiary pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                type="search"
                aria-label="Search customers"
                placeholder="Search by name, account number, mobile, email, subsidy code…"
                value={searchCustomer}
                onChange={(e) => handleSearch(e.target.value)}
                className="!pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="ui-text-tertiary text-[12px] font-medium">Show</span>
                <SelectDropdown
                  aria-label="Rows per page"
                  fieldClassName="w-24"
                  options={[10, 20, 50, 100].map((n) => ({ value: n, label: String(n) }))}
                  value={itemsPerPage}
                  onChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1)
                  }}
                />
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
            <span className="ui-text-tertiary">
              <strong className="ui-text-secondary">{filteredData.length}</strong> customers
              {searchCustomer && ' match your search'}
            </span>
            {editingRowId && <Badge tone="warning">Editing mode active</Badge>}
          </div>
        </SurfaceCard>

        {loading && (
          <SurfaceCard>
            <PageLoader variant="inline" label="Loading customers" className="!py-12" />
          </SurfaceCard>
        )}

        {!loading && currentData.length === 0 && (
          <SurfaceCard className="px-6 py-14 text-center">
            <IconBadge
              icon={Users}
              tone="neutral"
              variant="tint"
              size="xl"
              shape="circle"
              className="mx-auto mb-3"
            />
            <p className="ui-font-display text-[15px] font-bold">No customers found</p>
            <p className="ui-text-tertiary mt-1 text-[12.5px]">
              Try adjusting your search or add a new customer.
            </p>
          </SurfaceCard>
        )}

        {!loading && currentData.length > 0 && (
          <SurfaceCard className="overflow-hidden">
            <DataTable
              className="max-h-[62vh] overflow-y-auto px-2"
              minWidth="980px"
              columns={columns}
              rows={currentData}
              onRowClick={(row) => {
                if (!editing(row)) openDetails(row.id)
              }}
              rowClassName={(row) => (editing(row) ? 'bg-[color:var(--ui-primary-50)]' : undefined)}
            />
            <Pagination
              page={currentPage}
              pageSize={itemsPerPage}
              total={filteredData.length}
              onPageChange={setCurrentPage}
              itemLabel="customers"
            />
          </SurfaceCard>
        )}
      </div>

      {/* Customer details */}
      <Modal
        isOpen={isModalOpen && !!selectedCustomer}
        onClose={() => setIsModalOpen(false)}
        ariaLabel="Customer details"
        maxWidth="64rem"
        className="flex max-h-[90vh] flex-col overflow-hidden"
      >
        {selectedCustomer && (
          <>
            <div className="ui-border-subtle flex items-center gap-4 border-b px-6 py-5">
              <Avatar name={selectedCustomer.name || 'C'} className="size-12" />
              <div className="min-w-0 flex-1">
                <h2 className="ui-font-display truncate text-[18px] font-extrabold">
                  {selectedCustomer.name}
                </h2>
                <p className="ui-text-tertiary text-[12.5px]">
                  Account No: {selectedCustomer.account_number}
                </p>
              </div>
              <Badge tone={selectedCustomer.status === '1' ? 'success' : 'danger'}>
                {selectedCustomer.status === '1' ? 'Active customer' : 'Inactive customer'}
              </Badge>
              <IconButton icon={X} label="Close" onClick={() => setIsModalOpen(false)} />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="ui-bg-sunken grid grid-cols-2 gap-4 px-6 py-4 lg:grid-cols-4">
                <div>
                  <p className="ui-text-tertiary text-[11px] font-semibold uppercase tracking-wide">
                    Customer type
                  </p>
                  <Badge
                    tone={typeTone(selectedCustomer.customer_type)}
                    icon={Building2}
                    className="mt-1.5"
                  >
                    {selectedCustomer.customer_type || 'Regular'}
                  </Badge>
                </div>
                <div>
                  <p className="ui-text-tertiary text-[11px] font-semibold uppercase tracking-wide">
                    CM subsidy code
                  </p>
                  <p className="mt-1.5 font-mono text-[13px] font-bold">
                    {selectedCustomer.subsidy_code || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="ui-text-tertiary text-[11px] font-semibold uppercase tracking-wide">
                    Wallet balance
                  </p>
                  <p className="ui-font-display mt-1 text-[20px] font-extrabold text-[color:var(--ui-success-600)]">
                    {money(selectedCustomer.wallet)}
                  </p>
                </div>
                <div>
                  <p className="ui-text-tertiary text-[11px] font-semibold uppercase tracking-wide">
                    Member since
                  </p>
                  <p className="mt-1.5 text-[13px] font-medium">
                    {selectedCustomer.created_at && !isNaN(new Date(selectedCustomer.created_at))
                      ? new Date(selectedCustomer.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                      : '—'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 p-6 md:grid-cols-2 lg:grid-cols-3">
                <InfoItem label="Full Name" value={selectedCustomer.name} icon={User} />
                <InfoItem label="Care Of" value={selectedCustomer.careof} icon={UserCheck} />
                <InfoItem
                  label="Mobile Number"
                  value={selectedCustomer.mobile}
                  icon={Phone}
                  href={`tel:${selectedCustomer.mobile}`}
                />
                <InfoItem
                  label="Email Address"
                  value={selectedCustomer.email}
                  icon={Mail}
                  href={`mailto:${selectedCustomer.email}`}
                />
                <InfoItem label="Address" value={selectedCustomer.address} icon={MapPin} />
                <InfoItem label="City" value={selectedCustomer.city} />
                <InfoItem label="State" value={selectedCustomer.state} />
                <InfoItem label="Pincode" value={selectedCustomer.pincode} />
                <InfoItem
                  label="Bank Account"
                  value={selectedCustomer.bank_account}
                  icon={CreditCard}
                  mono
                />
                <InfoItem
                  label="IFSC Code"
                  value={selectedCustomer.ifsc_code}
                  icon={Building2}
                  mono
                />
                <InfoItem
                  label="CM Subsidy Code"
                  value={selectedCustomer.subsidy_code}
                  icon={Ticket}
                  mono
                />
                <InfoItem label="Aadhar Number" value={selectedCustomer.aadhar_number} />
              </div>
            </div>

            <div className="ui-border-subtle flex items-center justify-between gap-3 border-t px-6 py-4">
              <span className="ui-text-tertiary hidden items-center gap-2 text-[12px] sm:flex">
                <Building2 size={14} aria-hidden="true" /> Customer profile — complete information
              </span>
              <div className="ml-auto flex gap-2">
                <Button
                  icon={Pencil}
                  onClick={() => {
                    setIsModalOpen(false)
                    handleEditModalOpen(selectedCustomer)
                  }}
                >
                  Edit Customer
                </Button>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* Delete confirmation */}
      <DeleteConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false)
          setCustomerToDelete(null)
        }}
        onConfirm={confirmDeleteCustomer}
        title="Delete Customer"
        message={
          <>
            Are you sure you want to delete <strong>{customerToDelete?.name}</strong>? This action
            cannot be undone.
          </>
        }
      />
      {/* Edit customer */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        ariaLabel="Edit customer"
        maxWidth="56rem"
        dismissible={!editModalSaving}
        className="flex max-h-[90vh] flex-col overflow-hidden"
      >
        <div className="ui-border-subtle flex items-center gap-3 border-b px-6 py-4">
          <IconBadge icon={Pencil} tone="primary" />
          <div className="min-w-0 flex-1">
            <h2 className="ui-font-display text-[16px] font-bold">Edit Customer</h2>
            <p className="ui-text-tertiary truncate text-[12px]">
              {editModalData.name && editModalData.account_number
                ? `${editModalData.name} — A/c: ${editModalData.account_number}`
                : 'Loading customer data…'}
            </p>
          </div>
          <IconButton
            icon={X}
            label="Close"
            disabled={editModalSaving}
            onClick={handleEditModalClose}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {editModalLoading ? (
            <PageLoader variant="inline" label="Loading customer data" className="!py-16" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {editFields.map(({ label, name, type, isSelect, disabled }) =>
                isSelect ? (
                  <SelectDropdown
                    key={name}
                    label={label}
                    name={name}
                    options={[
                      { value: 'Buyer', label: 'Buyer' },
                      { value: 'Seller', label: 'Seller' }
                    ]}
                    value={editModalData[name] || ''}
                    placeholder="Select"
                    onChange={(value) => handleEditModalChange(name, value)}
                  />
                ) : (
                  <Input
                    key={name}
                    label={label}
                    type={type || 'text'}
                    name={name}
                    value={editModalData[name] || ''}
                    onChange={(e) => handleEditModalChange(name, e.target.value)}
                    disabled={disabled}
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                )
              )}
            </div>
          )}
        </div>

        <div className="ui-border-subtle flex justify-end gap-2 border-t px-6 py-4">
          <Button variant="secondary" disabled={editModalSaving} onClick={handleEditModalClose}>
            Cancel
          </Button>
          <Button
            icon={Save}
            loading={editModalSaving}
            disabled={editModalLoading}
            onClick={handleEditModalSave}
          >
            {editModalSaving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default CustomerList

// One labelled value in the details dialog.
// eslint-disable-next-line react/prop-types
const InfoItem = ({ label, value, icon: Icon, href, mono }) => {
  const isImage = typeof value === 'string' && /\.(jpe?g|png|webp|gif)$/i.test(value)
  return (
    <div className="ui-bg-raised ui-border-subtle rounded-lg border p-4">
      <div className="mb-1.5 flex items-center gap-2">
        {Icon && <Icon size={14} className="ui-text-tertiary" aria-hidden="true" />}
        <p className="ui-text-tertiary text-[11px] font-semibold uppercase tracking-wide">
          {label}
        </p>
      </div>
      {isImage ? (
        <img
          src={value}
          alt={label}
          className="ui-border-subtle max-h-32 w-full rounded-lg border object-cover"
        />
      ) : value ? (
        <p
          className={`break-words text-[13px] font-medium leading-relaxed ${mono ? 'font-mono' : ''}`}
        >
          {href ? (
            <a href={href} className="ui-text-brand hover:underline">
              {value}
            </a>
          ) : (
            value
          )}
        </p>
      ) : (
        <p className="ui-text-tertiary text-[13px] italic">Not provided</p>
      )}
    </div>
  )
}
