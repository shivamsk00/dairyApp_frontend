import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Package, Pencil, Trash2 } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import {
  Button,
  ConfirmActionModal,
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

const ProductTable = () => {
  const nav = useNavigate()
  const allProductGet = useHomeStore((state) => state.allProductGet)
  const updateProductStatus = useHomeStore((state) => state.updateProductStatus)
  const deleteProduct = useHomeStore((state) => state.deleteProduct)
  const { rows, page, pageCount, loading, load } = usePagedList(allProductGet)

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalType, setModalType] = useState(null) // 'toggle' | 'delete' | 'view'
  const [busy, setBusy] = useState(false)

  const openModal = (type, product) => {
    setSelectedProduct(product)
    setModalType(type)
  }
  const closeModal = () => {
    setSelectedProduct(null)
    setModalType(null)
  }

  const run = async (action, failure) => {
    setBusy(true)
    try {
      const res = await action()
      if (res?.status_code == 200) {
        CustomToast.success(res.message)
        closeModal()
        load(page)
      } else {
        CustomToast.error(res?.message || failure)
      }
    } catch (error) {
      console.error(failure, error)
      CustomToast.error(failure)
    } finally {
      setBusy(false)
    }
  }

  const columns = [
    { key: 'sr', header: 'Sr No.' },
    {
      key: 'name',
      header: 'Product',
      render: (item) => <span className="font-semibold">{item.name}</span>
    },
    { key: 'category', header: 'Category', render: (item) => item.category?.name },
    { key: 'price', header: 'Price', className: 'text-right', render: (item) => `₹${item.price}` },
    { key: 'unit', header: 'Unit' },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusToggle status={item.status} onClick={() => openModal('toggle', item)} />
      )
    },
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
            onClick={() => nav('/editProduct', { state: { productId: item.id } })}
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
    <SectionCard title="Product Data" subtitle="Everything you sell" icon={Package} tone="primary">
      <DataTable
        columns={columns}
        rows={loading ? [] : tableRows}
        emptyMessage={loading ? 'Loading…' : 'Data not available'}
        minWidth="720px"
        onRowClick={(item) => openModal('view', item)}
      />
      <Pagination page={page} pageCount={pageCount} onPageChange={load} className="mt-2" />

      <Modal
        isOpen={modalType === 'view' && !!selectedProduct}
        onClose={closeModal}
        ariaLabel="Product details"
        maxWidth="36rem"
        className="flex max-h-[90vh] flex-col overflow-hidden"
      >
        {selectedProduct && (
          <>
            <div className="ui-border-subtle flex items-center gap-4 border-b px-6 py-5">
              <IconBadge icon={Package} tone="primary" size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="ui-font-display text-[17px] font-extrabold">Product Details</h2>
                <p className="ui-text-tertiary truncate text-[12.5px]">{selectedProduct.name}</p>
              </div>
              <StatusToggle status={selectedProduct.status} />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              <DetailList
                items={[
                  ['Product Name', selectedProduct.name],
                  ['Category Name', selectedProduct.category?.name],
                  ['Price', `₹${selectedProduct.price}`],
                  ['Unit', selectedProduct.unit],
                  ['Stocks', selectedProduct?.stocks?.length || 0],
                  [
                    'Created At',
                    selectedProduct.created_at
                      ? new Date(selectedProduct.created_at).toLocaleString()
                      : ''
                  ]
                ]}
              />
            </div>
            <div className="ui-border-subtle flex justify-end gap-2 border-t px-6 py-4">
              <Button
                icon={Pencil}
                onClick={() => nav('/editProduct', { state: { productId: selectedProduct.id } })}
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

      <ConfirmActionModal
        isOpen={modalType === 'toggle'}
        loading={busy}
        onClose={closeModal}
        onConfirm={() =>
          run(() => updateProductStatus(selectedProduct.id), 'Failed to update the status')
        }
        tone="warning"
        title="Change Status"
        message={
          selectedProduct && (
            <>
              Mark <strong>{selectedProduct.name}</strong> as{' '}
              <strong>{selectedProduct.status == 1 ? 'Inactive' : 'Active'}</strong>?
            </>
          )
        }
      />

      <DeleteConfirmModal
        isOpen={modalType === 'delete'}
        loading={busy}
        onClose={closeModal}
        onConfirm={() =>
          run(() => deleteProduct(selectedProduct.id), 'Failed to delete the product')
        }
        title="Delete Product"
        message={selectedProduct && `Are you sure you want to delete ${selectedProduct.name}?`}
      />
    </SectionCard>
  )
}

export default ProductTable
