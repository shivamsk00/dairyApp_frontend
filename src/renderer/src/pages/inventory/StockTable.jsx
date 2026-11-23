import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Boxes, Eye, Pencil, Trash2 } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import {
  Badge,
  Button,
  DataTable,
  DeleteConfirmModal,
  DetailList,
  IconBadge,
  IconButton,
  Modal,
  Pagination,
  SectionCard
} from '../../components/ui'
import { StatusToggle } from './inventoryShared'
import { usePagedList } from './usePagedList'

const productName = (item) =>
  item?.product?.name || (
    <span className="font-medium text-[color:var(--ui-danger-600)]">Product Removed</span>
  )

const StockTable = () => {
  const nav = useNavigate()
  const getAllProductStock = useHomeStore((state) => state.getAllProductStock)
  const deleteProductStock = useHomeStore((state) => state.deleteProductStock)
  const { rows, page, pageCount, loading, load } = usePagedList(getAllProductStock)

  const [selectedStock, setSelectedStock] = useState(null)
  const [modalType, setModalType] = useState(null) // 'view' | 'delete'
  const [busy, setBusy] = useState(false)

  const openModal = (type, stock) => {
    setSelectedStock(stock)
    setModalType(type)
  }
  const closeModal = () => {
    setSelectedStock(null)
    setModalType(null)
  }

  const handleDelete = async () => {
    setBusy(true)
    try {
      const res = await deleteProductStock(selectedStock.id)
      if (res?.status_code == 200) {
        CustomToast.success(res.message)
        closeModal()
        load(page)
      } else {
        CustomToast.error(res?.message || 'Failed to delete the stock entry')
      }
    } catch (error) {
      console.error('ERROR IN STOCK DELETE', error)
      CustomToast.error('Failed to delete the stock entry')
    } finally {
      setBusy(false)
    }
  }

  const columns = [
    { key: 'sr', header: 'Sr No.' },
    {
      key: 'product',
      header: 'Product Name',
      render: (item) => <span className="font-semibold">{productName(item)}</span>
    },
    { key: 'quantity', header: 'Quantity', className: 'text-right' },
    { key: 'date', header: 'Date' },
    {
      key: 'stock_type',
      header: 'Stock Type',
      render: (item) => (
        <Badge
          tone={String(item.stock_type).toUpperCase() === 'IN' ? 'success' : 'warning'}
          dot={false}
        >
          {item.stock_type}
        </Badge>
      )
    },
    // The old "toggle" here called the *product* status endpoint with the stock id (flipping an unrelated
    // product), and there is no stock-status endpoint, so the status is shown read-only.
    { key: 'status', header: 'Status', render: (item) => <StatusToggle status={item.status} /> },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-right',
      render: (item) => (
        <div className="flex justify-end gap-0.5">
          <IconButton
            icon={Eye}
            label="View details"
            iconSize={15}
            className="!size-8"
            onClick={() => openModal('view', item)}
          />
          <IconButton
            icon={Pencil}
            label="Edit"
            iconSize={15}
            className="!size-8"
            onClick={() => nav('/editStock', { state: { stockId: item.id } })}
          />
          <IconButton
            icon={Trash2}
            label="Delete"
            iconSize={15}
            className="!size-8 hover:!text-[color:var(--ui-danger-600)]"
            onClick={() => openModal('delete', item)}
          />
        </div>
      )
    }
  ]

  const tableRows = rows.map((item, i) => ({ ...item, sr: i + 1 }))

  return (
    <SectionCard title="Stock Data" subtitle="Stock in and out" icon={Boxes} tone="primary">
      <DataTable
        columns={columns}
        rows={loading ? [] : tableRows}
        emptyMessage={loading ? 'Loading…' : 'Data not available'}
        minWidth="720px"
        onRowClick={(item) => openModal('view', item)}
      />
      <Pagination page={page} pageCount={pageCount} onPageChange={load} className="mt-2" />

      <Modal
        isOpen={modalType === 'view' && !!selectedStock}
        onClose={closeModal}
        ariaLabel="Stock details"
        maxWidth="36rem"
        className="flex max-h-[90vh] flex-col overflow-hidden"
      >
        {selectedStock && (
          <>
            <div className="ui-border-subtle flex items-center gap-4 border-b px-6 py-5">
              <IconBadge icon={Boxes} tone="primary" size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="ui-font-display text-[17px] font-extrabold">Stock Details</h2>
                <p className="ui-text-tertiary truncate text-[12.5px]">
                  {selectedStock?.product?.name || 'Product Removed'}
                </p>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              <DetailList
                items={[
                  ['Product Name', selectedStock?.product?.name || 'Product Removed'],
                  ['Quantity', selectedStock.quantity],
                  ['Stock Type', selectedStock.stock_type],
                  ['Date', selectedStock.date],
                  [
                    'Created At',
                    selectedStock.created_at
                      ? new Date(selectedStock.created_at).toLocaleString()
                      : ''
                  ]
                ]}
              />
            </div>
            <div className="ui-border-subtle flex justify-end gap-2 border-t px-6 py-4">
              <Button
                icon={Pencil}
                onClick={() => nav('/editStock', { state: { stockId: selectedStock.id } })}
              >
                Edit
              </Button>
              <Button variant="secondary" onClick={closeModal}>
                Close
              </Button>
            </div>
          </>
        )}
      </Modal>

      <DeleteConfirmModal
        isOpen={modalType === 'delete'}
        loading={busy}
        onClose={closeModal}
        onConfirm={handleDelete}
        title="Delete Stock Entry"
        message={
          selectedStock &&
          `Are you sure you want to delete this stock entry for ${selectedStock?.product?.name || 'a removed product'}?`
        }
      />
    </SectionCard>
  )
}

export default StockTable
