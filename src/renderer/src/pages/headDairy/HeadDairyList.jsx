import { useEffect, useState } from 'react'
import {
  Building2,
  CircleCheck,
  Eye,
  IndianRupee,
  Loader2,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Users
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
  DetailList,
  IconBadge,
  IconButton,
  KpiCard,
  Modal,
  SurfaceCard,
  useDocumentTitle
} from '../../components/ui'

const money = (value) =>
  `₹${parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const isActive = (row) => row.status == 1

const HeadDairyList = () => {
  useDocumentTitle('Head Dairy Master')
  const nav = useNavigate()
  const getAllHeadDairyMaster = useHomeStore((state) => state.getAllHeadDairyMaster)
  const deleteHeadDairyMaster = useHomeStore((state) => state.deleteHeadDairyMaster)
  const [rowData, setRowData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedHeadDairy, setSelectedHeadDairy] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [headDairyToDelete, setHeadDairyToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAllHeadDairyData = async () => {
    try {
      setLoading(true)
      const res = await getAllHeadDairyMaster()
      if (res.status_code == 200) {
        setRowData(res.data)
      } else {
        CustomToast.error(res.message)
      }
    } catch (error) {
      console.error('Failed to fetch Head Dairy Masters', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllHeadDairyData()
  }, [])

  const confirmDeleteHeadDairyMaster = async () => {
    setDeleting(true)
    try {
      const res = await deleteHeadDairyMaster(headDairyToDelete?.id)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        fetchAllHeadDairyData()
      } else {
        CustomToast.error(res.message)
      }
    } catch (error) {
      CustomToast.error('Failed to delete head dairy')
      console.log('ERROR IN DELETE FUN IN Head Dairy LIST', error)
    } finally {
      setDeleting(false)
      setIsConfirmOpen(false)
      setHeadDairyToDelete(null)
    }
  }

  const openDetails = (row) => {
    setSelectedHeadDairy(row)
    setIsModalOpen(true)
  }

  const activeCount = rowData.filter(isActive).length
  const walletTotal = rowData.reduce((sum, row) => sum + parseFloat(row.wallet || 0), 0)

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (row) => <span className="ui-text-tertiary">{row.id}</span>
    },
    {
      key: 'dairy_name',
      header: 'Head Dairy Name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.dairy_name || 'D'} className="size-8 text-[11px]" />
          <span className="font-semibold">{row.dairy_name}</span>
        </div>
      )
    },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5">
          <Phone size={12} className="ui-text-tertiary" aria-hidden="true" />
          {row.mobile}
        </span>
      )
    },
    { key: 'contact_person', header: 'Contact Person' },
    {
      key: 'address',
      header: 'Address',
      render: (row) => <span className="block max-w-[220px] truncate">{row.address}</span>
    },
    {
      key: 'wallet',
      header: 'Wallet',
      className: 'text-right',
      render: (row) => (
        <span className="font-bold text-[color:var(--ui-success-600)]">{money(row.wallet)}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={isActive(row) ? 'success' : 'danger'}>
          {isActive(row) ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-0.5">
          <IconButton
            icon={Eye}
            label="View details"
            iconSize={15}
            className="!size-8"
            onClick={() => openDetails(row)}
          />
          <IconButton
            icon={Pencil}
            label="Edit"
            iconSize={15}
            className="!size-8"
            onClick={() => nav('/editHeadDairy', { state: row })}
          />
          <IconButton
            icon={Trash2}
            label="Delete"
            iconSize={15}
            className="!size-8 hover:!text-[color:var(--ui-danger-600)]"
            onClick={() => {
              setHeadDairyToDelete(row)
              setIsConfirmOpen(true)
            }}
          />
        </div>
      )
    }
  ]

  return (
    <div className="w-full ui-text-primary">
      <Breadcrumb
        title="Head Dairy Master"
        items={[
          { label: 'Home', to: '/' },
          { label: 'Milk Center' },
          { label: 'Head Dairy Master' }
        ]}
        actions={
          <Button size="sm" icon={Plus} onClick={() => nav('/headDairy')}>
            Add Head Dairy
          </Button>
        }
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <KpiCard label="Total Head Dairies" value={rowData.length} icon={Building2} tone="info" />
          <KpiCard label="Active" value={activeCount} icon={CircleCheck} tone="success" />
          <KpiCard
            label="Inactive"
            value={rowData.length - activeCount}
            icon={Users}
            tone="danger"
          />
          <KpiCard
            label="Total Wallet"
            value={money(walletTotal)}
            icon={IndianRupee}
            tone="accent"
          />
        </div>

        {loading && (
          <SurfaceCard className="flex items-center justify-center gap-3 p-12">
            <Loader2 size={20} className="ui-text-brand animate-spin" aria-hidden="true" />
            <span className="ui-text-secondary text-[13px]">Loading head dairies…</span>
          </SurfaceCard>
        )}

        {!loading && rowData.length === 0 && (
          <SurfaceCard className="px-6 py-14 text-center">
            <IconBadge
              icon={Building2}
              tone="neutral"
              variant="tint"
              size="xl"
              shape="circle"
              className="mx-auto mb-3"
            />
            <p className="ui-font-display text-[15px] font-bold">No head dairies yet</p>
            <p className="ui-text-tertiary mt-1 text-[12.5px]">
              Add the dairies you dispatch milk to.
            </p>
            <Button className="mt-4" icon={Plus} onClick={() => nav('/headDairy')}>
              Add Head Dairy
            </Button>
          </SurfaceCard>
        )}

        {!loading && rowData.length > 0 && (
          <SurfaceCard className="overflow-hidden">
            <DataTable
              className="px-2"
              minWidth="900px"
              columns={columns}
              rows={rowData}
              onRowClick={openDetails}
            />
          </SurfaceCard>
        )}
      </div>

      <Modal
        isOpen={isModalOpen && !!selectedHeadDairy}
        onClose={() => setIsModalOpen(false)}
        ariaLabel="Head dairy details"
        maxWidth="40rem"
        className="flex max-h-[90vh] flex-col overflow-hidden"
      >
        {selectedHeadDairy && (
          <>
            <div className="ui-border-subtle flex items-center gap-4 border-b px-6 py-5">
              <Avatar name={selectedHeadDairy.dairy_name || 'D'} className="size-12" />
              <div className="min-w-0 flex-1">
                <h2 className="ui-font-display truncate text-[18px] font-extrabold">
                  {selectedHeadDairy.dairy_name}
                </h2>
                <p className="ui-text-tertiary text-[12.5px]">Head Dairy Details</p>
              </div>
              <Badge tone={isActive(selectedHeadDairy) ? 'success' : 'danger'}>
                {isActive(selectedHeadDairy) ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              <DetailList
                items={[
                  ['Name', selectedHeadDairy.dairy_name],
                  ['Mobile', selectedHeadDairy.mobile],
                  ['Contact Person', selectedHeadDairy.contact_person],
                  ['Wallet', money(selectedHeadDairy.wallet)],
                  ['Address', selectedHeadDairy.address]
                ]}
              />
            </div>
            <div className="ui-border-subtle flex justify-end gap-2 border-t px-6 py-4">
              <Button
                icon={Pencil}
                onClick={() => {
                  setIsModalOpen(false)
                  nav('/editHeadDairy', { state: selectedHeadDairy })
                }}
              >
                Edit
              </Button>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </div>
          </>
        )}
      </Modal>

      <DeleteConfirmModal
        isOpen={isConfirmOpen}
        loading={deleting}
        onClose={() => {
          setIsConfirmOpen(false)
          setHeadDairyToDelete(null)
        }}
        onConfirm={confirmDeleteHeadDairyMaster}
        title="Delete Head Dairy"
        message={
          <>
            Are you sure you want to delete <strong>{headDairyToDelete?.dairy_name}</strong>? This
            action cannot be undone.
          </>
        }
      />
    </div>
  )
}

export default HeadDairyList
