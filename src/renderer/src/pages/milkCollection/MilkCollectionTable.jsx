/* eslint-disable react/prop-types -- props are documented by usage in DailyMilkCollectionPage */
import React from 'react'
import { Eye, Pencil, Printer, Trash2 } from 'lucide-react'
import { Badge, DataTable, IconButton } from '../../components/ui'

const MilkCollectionTable = ({
  morningCollection,
  eveningCollection,
  isShift,
  handlePrint,
  setSelectedCustomer,
  setIsModalOpen,
  setIsEditeModal,
  setDeleteId,
  setShowConfirmModal,
  avgFat,
  avgSnf
}) => {
  const list = isShift === 'morning' ? morningCollection : eveningCollection
  const tone = isShift === 'morning' ? 'accent' : 'primary'

  const openView = (item) => {
    setSelectedCustomer(item)
    setIsModalOpen(true)
  }

  const columns = [
    { key: 'sr', header: '#' },
    {
      key: 'customer_account_number',
      header: 'AC No',
      render: (item) => (
        <span className="ui-text-brand font-bold">{item.customer_account_number}</span>
      )
    },
    {
      key: 'name',
      header: 'Name',
      render: (item) => (
        <span className="font-semibold" title={item.name}>
          {item.name}
        </span>
      )
    },
    { key: 'date', header: 'Date' },
    {
      key: 'shift',
      header: 'Shift',
      render: (item) => (
        <Badge tone={tone} dot={false}>
          {item.shift}
        </Badge>
      )
    },
    { key: 'quantity', header: 'Qty', className: 'text-right' },
    { key: 'fat', header: 'FAT', className: 'text-right' },
    { key: 'snf', header: 'SNF', className: 'text-right' },
    {
      key: 'base_rate',
      header: 'Rate',
      className: 'text-right',
      render: (item) => `₹${item.base_rate}`
    },
    {
      key: 'other_price',
      header: 'Other',
      className: 'text-right',
      render: (item) => `₹${item.other_price}`
    },
    {
      key: 'total_amount',
      header: 'Total',
      className: 'text-right',
      render: (item) => (
        <span className="font-bold text-[color:var(--ui-success-600)]">₹{item.total_amount}</span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex justify-end gap-0.5">
          <IconButton
            icon={Printer}
            label="Print"
            iconSize={15}
            className="!size-8"
            onClick={() => handlePrint(item)}
          />
          <IconButton
            icon={Eye}
            label="View"
            iconSize={15}
            className="!size-8"
            onClick={() => openView(item)}
          />
          <IconButton
            icon={Pencil}
            label="Edit"
            iconSize={15}
            className="!size-8"
            onClick={() => {
              setSelectedCustomer(item)
              setIsEditeModal(true)
            }}
          />
          <IconButton
            icon={Trash2}
            label="Delete"
            iconSize={15}
            className="!size-8 hover:!text-[color:var(--ui-danger-600)]"
            onClick={() => {
              setDeleteId(item.id)
              setShowConfirmModal(true)
            }}
          />
        </div>
      )
    }
  ]

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone={tone} dot={false}>
          {isShift === 'morning' ? 'Morning' : 'Evening'} collection · {list.length}
        </Badge>
        <span className="ui-text-tertiary text-[12.5px]">Average FAT</span>
        <span className="text-[13px] font-bold">{avgFat ?? '-'}</span>
        <span className="ui-text-tertiary ml-2 text-[12.5px]">Average SNF</span>
        <span className="text-[13px] font-bold">{avgSnf ?? '-'}</span>
      </div>
      <DataTable
        stickyHeader
        className="max-h-[60vh] overflow-y-auto px-1"
        minWidth="900px"
        columns={columns}
        rows={list.map((item, i) => ({ ...item, sr: i + 1 }))}
        onRowClick={openView}
        emptyMessage="No data available"
      />
    </div>
  )
}

export default React.memo(MilkCollectionTable)
