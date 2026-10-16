import { useState } from 'react'
import { Layers, Pencil, Save } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import {
  Button,
  ConfirmActionModal,
  DataTable,
  IconButton,
  Input,
  Modal,
  Pagination,
  SectionCard
} from '../../components/ui'
import { StatusToggle } from './inventoryShared'
import { usePagedList } from './usePagedList'

const CategoryTable = () => {
  const fetchCategory = useHomeStore((state) => state.fetchCategory)
  const updateCategoryStatus = useHomeStore((state) => state.updateCategoryStatus)
  const updateCategory = useHomeStore((state) => state.updateCategory)
  const { rows, page, pageCount, loading, load } = usePagedList(fetchCategory)

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [modalType, setModalType] = useState(null) // 'toggle' | 'edit'
  const [categoryEdit, setCategoryEdit] = useState('')
  const [editError, setEditError] = useState('')
  const [busy, setBusy] = useState(false)

  const openModal = (type, category) => {
    setSelectedCategory(category)
    setModalType(type)
    setCategoryEdit(category.name)
    setEditError('')
  }
  const closeModal = () => {
    setSelectedCategory(null)
    setModalType(null)
  }

  const handleToggleStatus = async () => {
    setBusy(true)
    try {
      const res = await updateCategoryStatus(selectedCategory.id)
      if (res?.status_code == 200) {
        CustomToast.success(res.message)
        closeModal()
        load(page)
      } else {
        CustomToast.error(res?.message || 'Failed to update the status')
      }
    } catch (error) {
      console.error('ERROR IN CATEGORY STATUS', error)
      CustomToast.error('Failed to update the status')
    } finally {
      setBusy(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!categoryEdit.trim()) {
      setEditError('Category name is required')
      return
    }
    setBusy(true)
    try {
      const res = await updateCategory(selectedCategory.id, { name: categoryEdit })
      if (res?.status_code == 200) {
        CustomToast.success(res.message)
        closeModal()
        load(page)
      } else {
        CustomToast.error(res?.message || 'Failed to update the category')
      }
    } catch (error) {
      console.error('ERROR IN CATEGORY UPDATE', error)
      CustomToast.error('Failed to update the category')
    } finally {
      setBusy(false)
    }
  }

  const columns = [
    { key: 'sr', header: 'Sr No.' },
    {
      key: 'name',
      header: 'Category Name',
      render: (item) => <span className="font-semibold">{item.name}</span>
    },
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
        <div className="flex justify-end">
          <IconButton
            icon={Pencil}
            label="Edit"
            iconSize={15}
            className="!size-8"
            onClick={() => openModal('edit', item)}
          />
        </div>
      )
    }
  ]

  const tableRows = rows.map((item, i) => ({ ...item, sr: i + 1 }))

  return (
    <SectionCard title="Category Data" subtitle="Product categories" icon={Layers} tone="primary">
      <DataTable
        columns={columns}
        rows={loading ? [] : tableRows}
        emptyMessage={loading ? 'Loading…' : 'Data not available'}
        minWidth="480px"
      />
      <Pagination page={page} pageCount={pageCount} onPageChange={load} className="mt-2" />

      <ConfirmActionModal
        isOpen={modalType === 'toggle'}
        loading={busy}
        onClose={closeModal}
        onConfirm={handleToggleStatus}
        tone="warning"
        title="Change Status"
        message={
          selectedCategory && (
            <>
              Mark <strong>{selectedCategory.name}</strong> as{' '}
              <strong>{selectedCategory.status == 1 ? 'Inactive' : 'Active'}</strong>?
            </>
          )
        }
      />

      <Modal
        isOpen={modalType === 'edit'}
        onClose={closeModal}
        ariaLabel="Edit category"
        maxWidth="26rem"
        dismissible={!busy}
        className="p-6"
      >
        <form onSubmit={handleEdit} noValidate>
          <h2 className="ui-font-display mb-4 text-[16px] font-bold">Edit Category</h2>
          <Input
            label="Category Name"
            required
            type="text"
            value={categoryEdit}
            onChange={(e) => {
              setCategoryEdit(e.target.value)
              setEditError('')
            }}
            error={editError}
            autoFocus
          />
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" disabled={busy} onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" icon={Save} loading={busy}>
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </SectionCard>
  )
}

export default CategoryTable
