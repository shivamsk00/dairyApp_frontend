/* eslint-disable react/prop-types -- props are documented below */
import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import {
  Banknote,
  Download,
  HandCoins,
  IndianRupee,
  Pencil,
  Search,
  ShoppingCart,
  Trash2
} from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import EditCustomerCollectionModal from '../milkCollection/EditCustomerCollection'
import {
  Badge,
  Button,
  DataTable,
  DeleteConfirmModal,
  IconBadge,
  IconButton,
  Input,
  KpiCard,
  PageLoader,
  Pagination,
  SectionCard,
  SelectDropdown
} from '../../components/ui'
import logExport from '../../helper/auditExport'

const FILTER_TYPES = [
  { value: 'all', label: 'All Fields' },
  { value: 'name', label: 'Customer Name' },
  { value: 'account', label: 'Account Number' }
]
const PAGE_SIZE = 25

/**
 * Sold-products list shared by Product Correction and Product Sell: search, KPI cards, paged table,
 * Excel export, edit dialog and delete confirmation. It loads the data itself.
 *
 * @param {string} [title='Sold Products']
 * @param {string} [exportFileName='product_sales_report.xlsx']
 * @param {boolean} [showKpis=true]
 * @param {number} [refreshToken] Change it to make the panel reload (e.g. after a new sale).
 * @param {() => void} [onChanged] Called after an edit or delete so the page can refresh related data.
 */
const SoldProductsPanel = ({
  title = 'Sold Products',
  exportFileName = 'product_sales_report.xlsx',
  showKpis = true,
  refreshToken = 0,
  onChanged
}) => {
  const allSoldProducts = useHomeStore((state) => state.getAllSoldProducts)
  const getDeleteProducts = useHomeStore((state) => state.getDeleteProducts)

  const [allsoldproducts, setAllsoldproducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [isEditeModal, setIsEditeModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [page, setPage] = useState(1)

  const soldproductAllDataFetch = async () => {
    try {
      setLoading(true)
      const res = await allSoldProducts()
      setAllsoldproducts(res.status_code == 200 ? res.data : [])
    } catch (error) {
      console.error('ERROR IN FETCH ALL SOLD PRODUCT', error)
      setAllsoldproducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    soldproductAllDataFetch()
  }, [refreshToken])

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return allsoldproducts
    return allsoldproducts.filter((item) => {
      if (filterType === 'name') return item.customer?.name?.toLowerCase().includes(query)
      if (filterType === 'account') return item.customer_account_number?.toString().includes(query)
      return (
        item.customer?.name?.toLowerCase().includes(query) ||
        item.customer_account_number?.toString().includes(query) ||
        item.product?.name?.toLowerCase().includes(query)
      )
    })
  }, [allsoldproducts, searchQuery, filterType])

  const stats = useMemo(
    () => ({
      total: filteredProducts.reduce((sum, item) => sum + Number(item.total || 0), 0),
      cash: filteredProducts.filter((item) => item.transaction_type === 'cash').length,
      borrow: filteredProducts.filter((item) => item.transaction_type !== 'cash').length
    }),
    [filteredProducts]
  )

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const pageRows = filteredProducts
    .slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
    .map((item, i) => ({ ...item, sr: (current - 1) * PAGE_SIZE + i + 1 }))

  const handleRemove = async (id) => {
    setDeleting(true)
    try {
      const res = await getDeleteProducts(id)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        soldproductAllDataFetch()
        onChanged?.()
      } else {
        CustomToast.error(res.message)
      }
    } catch (error) {
      console.error('Delete error:', error)
      CustomToast.error('Failed to delete the sale entry')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const exportToExcel = () => {
    if (!filteredProducts?.length) {
      CustomToast.warn('No data to export')
      return
    }

    const dataToExport = filteredProducts.map((entry, index) => ({
      'Sr. No': index + 1,
      'Account No': entry.customer_account_number,
      'Customer Name': entry.customer?.name || '',
      Product: entry.product?.name || '',
      Category: entry.category?.name || '',
      Price: entry.product_price,
      Quantity: entry.qty,
      Total: entry.total,
      Date: entry.date,
      'Transaction Type': entry.transaction_type
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 }
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Product Sales')
    XLSX.writeFile(workbook, exportFileName)
    logExport('Product Sales', 'xlsx')
    CustomToast.success('Report exported successfully')
  }

  const openEdit = (item) => {
    setSelectedCustomer(item)
    setIsEditeModal(true)
  }

  const columns = [
    { key: 'sr', header: '#' },
    {
      key: 'customer_account_number',
      header: 'Account',
      render: (item) => (
        <span className="ui-text-brand font-bold">{item.customer_account_number}</span>
      )
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (item) => <span className="font-semibold">{item.customer?.name || '-'}</span>
    },
    { key: 'product', header: 'Product', render: (item) => item.product?.name || '-' },
    { key: 'category', header: 'Category', render: (item) => item.category?.name || '-' },
    {
      key: 'product_price',
      header: 'Price',
      className: 'text-right',
      render: (item) => `₹${item.product_price}`
    },
    { key: 'qty', header: 'Qty', className: 'text-right' },
    {
      key: 'total',
      header: 'Total',
      className: 'text-right',
      render: (item) => (
        <span className="font-bold text-[color:var(--ui-success-600)]">₹{item.total}</span>
      )
    },
    { key: 'date', header: 'Date' },
    {
      key: 'transaction_type',
      header: 'Type',
      render: (item) => (
        <Badge tone={item.transaction_type === 'cash' ? 'success' : 'warning'} dot={false}>
          {item.transaction_type === 'cash' ? 'Cash' : 'Borrow'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex justify-end gap-0.5">
          <IconButton
            icon={Pencil}
            label="Edit"
            iconSize={15}
            className="!size-8"
            onClick={() => openEdit(item)}
          />
          <IconButton
            icon={Trash2}
            label="Delete"
            iconSize={15}
            className="!size-8 hover:!text-[color:var(--ui-danger-600)]"
            onClick={() => setDeleteId(item.id)}
          />
        </div>
      )
    }
  ]

  return (
    <>
      {showKpis && (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <KpiCard
            label="Entries"
            value={filteredProducts.length}
            icon={ShoppingCart}
            tone="primary"
          />
          <KpiCard
            label="Total sales"
            value={`₹${stats.total.toFixed(2)}`}
            icon={IndianRupee}
            tone="success"
          />
          <KpiCard label="Cash sales" value={stats.cash} icon={Banknote} tone="accent" />
          <KpiCard label="Borrowed" value={stats.borrow} icon={HandCoins} tone="warning" />
        </div>
      )}

      <SectionCard
        title={title}
        subtitle={
          searchQuery
            ? `${filteredProducts.length} of ${allsoldproducts.length} entries`
            : `${allsoldproducts.length} product sale entries`
        }
        icon={ShoppingCart}
        tone="info"
        action={
          <Button size="sm" icon={Download} variant="secondary" onClick={exportToExcel}>
            Export Excel
          </Button>
        }
      >
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_14rem]">
          <Input
            type="text"
            aria-label="Search sales"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search by name, account, or product..."
          />
          <SelectDropdown
            ariaLabel="Search field"
            options={FILTER_TYPES}
            value={filterType}
            onChange={(value) => {
              setFilterType(value)
              setPage(1)
            }}
          />
        </div>

        {loading ? (
          <PageLoader variant="inline" label="Loading sales data" />
        ) : (
          <>
            <DataTable
              stickyHeader
              className="max-h-[60vh] overflow-y-auto px-1"
              minWidth="980px"
              columns={columns}
              rows={pageRows}
              emptyMessage={
                <span className="inline-flex flex-col items-center gap-1">
                  <IconBadge icon={Search} tone="neutral" variant="tint" />
                  <strong>No sales found</strong>
                  <span>
                    {searchQuery
                      ? 'Try adjusting your search filters'
                      : 'No product sales recorded yet'}
                  </span>
                </span>
              }
            />
            <Pagination
              page={current}
              pageSize={PAGE_SIZE}
              total={filteredProducts.length}
              onPageChange={setPage}
              itemLabel="entries"
              className="mt-2"
            />
          </>
        )}
      </SectionCard>

      <EditCustomerCollectionModal
        isOpen={isEditeModal}
        onClose={() => setIsEditeModal(false)}
        productData={selectedCustomer}
        onUpdate={async () => {
          await soldproductAllDataFetch()
          onChanged?.()
        }}
      />

      <DeleteConfirmModal
        isOpen={deleteId !== null}
        loading={deleting}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleRemove(deleteId)}
        title="Delete Sale Entry"
        message="Are you sure you want to delete this sale entry? This action cannot be undone."
      />
    </>
  )
}

export default SoldProductsPanel
