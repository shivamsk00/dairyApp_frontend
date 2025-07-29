import React, { use, useEffect, useRef, useState } from 'react'
import './customer.css'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table'
import { FaDotCircle, FaEye, FaPen, FaTrashAlt } from 'react-icons/fa'
import { User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useHomeStore from '../../zustand/useHomeStore'
import { IoMdCloseCircle } from 'react-icons/io'
import CustomToast from '../../helper/costomeToast'
import Preloading from '../../components/Preloading'
import InputFeild from '../../components/InputFeild'
import DataTable from 'react-data-table-component';

const columnHelper = createColumnHelper()

const CustomerList = () => {
  const nav = useNavigate()
  const getAllCustomer = useHomeStore((state) => state.getAllCustomer)
  const deleteCustomer = useHomeStore((state) => state.deleteCustomer)
  const editCustomerValueGet = useHomeStore((state) => state.editCustomerValueGet)
  const scrollRef = useRef(null)
  const [totalPages, setTotalPages] = useState(null)

  const [rowData, setRowData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState(null)
  const [searchCustomer, setSearchCustomer] = useState('')
  const [filteredData, setFilteredData] = useState([]);

  //  const fetchAllCustomerData = async () => {
  //   if (loading ) return; // 🛑 prevent duplicate fetch

  //   try {
  //     setLoading(true);
  //     const res = await getAllCustomer();

  //     if (res.status_code == 200) {
  //       const newData = res.data.data;

  //       if (Array.isArray(newData) && newData.length > 0) {
  //         setRowData(prev => {
  //           const existingIds = new Set(prev.map(item => item.id)); // 🔍 existing IDs
  //           const filteredNewData = newData.filter(item => !existingIds.has(item.id)); // 🧹 remove duplicates
  //           return [...prev, ...filteredNewData];
  //         });

  //         setCurrentPage(res.data.current_page);
  //         setHasMore(res.data.current_page < res.data.last_page); // ✅ Stop if last
  //         console.log('data', newData);
  //       } else {
  //         console.log('No new data received.');
  //       }
  //     } else {
  //       CustomToast.error(res.message);
  //     }
  //   } catch (err) {
  //     console.error("Fetch error", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchAllCustomerData = async () => {
    if (loading) return

    try {
      setLoading(true)
      const res = await getAllCustomer(searchCustomer)

      if (res.status_code == 200) {
        const newData = res.data // ✅ Corrected line
        setRowData(newData)
        // if (Array.isArray(newData) && newData.length > 0) {
        //   setRowData(prev => {
        //     const existingIds = new Set(prev.map(item => item.id));
        //     const filteredNewData = newData.filter(item => !existingIds.has(item.id));
        //     return [...prev, ...filteredNewData];
        //   });
        //   console.log("Fetched customer data:", newData);
        // } else {
        //   console.log("No new data received.");
        // }
      } else {
        CustomToast.error(res.message || 'Failed to fetch data')
      }
    } catch (err) {
      console.error('Fetch error', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCutomerDetail = async (id) => {
    try {
      const res = await editCustomerValueGet({ customer_id: id })
      const customerData = res.data
      setSelectedCustomer(customerData)
    } catch (error) {
      console.log('ERROR IN FETCH CUSTOMER DETAIL', error)
    }
  }

  useEffect(() => {
    fetchAllCustomerData(1)
  }, [])

  useEffect(() => {
    const scrollContainer = scrollRef.current

    const handleScroll = () => {
      if (!scrollContainer) return
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer

      const nearBottom = scrollTop + clientHeight >= scrollHeight - 100

      if (nearBottom && hasMore && !loading) {
        fetchAllCustomerData(currentPage + 1)
      }
    }

    scrollContainer?.addEventListener('scroll', handleScroll)
    return () => scrollContainer?.removeEventListener('scroll', handleScroll)
  }, [currentPage, hasMore, loading])

  const confirmDeleteCustomer = async () => {
    try {
      const res = await deleteCustomer(customerToDelete?.id)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        setRowData([])
        fetchAllCustomerData(1)
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



  useEffect(() => {
    setFilteredData(rowData); // set filtered data initially
  }, [rowData]);







  // TABLE CONFIG
  // const columns = [
  //   columnHelper.display({
  //     id: 'srNo',
  //     header: 'Sr No.',
  //     cell: ({ row }) => row.index + 1
  //   }),
  //   columnHelper.accessor('account_number', {
  //     header: 'Account No.',
  //     cell: (info) => info.getValue()
  //   }),
  //   columnHelper.accessor('name', {
  //     header: 'Customer Name',
  //     cell: (info) => info.getValue()
  //   }),
  //   columnHelper.accessor('mobile', {
  //     header: 'Phone',
  //     cell: (info) => info.getValue()
  //   }),
  //   columnHelper.display({
  //     id: 'status',
  //     header: 'Status',
  //     cell: ({ row }) => (
  //       <div className="flex gap-3 items-center">
  //         <FaDotCircle color={row.original.status == 1 ? 'green' : 'red'} />
  //         <span>{row.original.status == 1 ? 'Active' : 'Inactive'}</span>
  //       </div>
  //     )
  //   }),

  //   columnHelper.display({
  //     id: 'actions',
  //     header: 'Actions',
  //     cell: ({ row }) => (
  //       <div className="flex items-center gap-2 justify-center">
  //         <button
  //           className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
  //           onClick={() => {
  //             fetchCutomerDetail(row.original.id)
  //             setIsModalOpen(true)
  //           }}
  //         >
  //           <FaEye />
  //         </button>
  //         <button
  //           className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
  //           onClick={() => nav('/editCustomer', { state: row.original })}
  //         >
  //           <FaPen />
  //         </button>
  //         <button
  //           className="px-2 py-1 bg-red-500 text-white rounded text-xs"
  //           onClick={() => {
  //             setCustomerToDelete(row.original)
  //             setIsConfirmOpen(true)
  //           }}
  //         >
  //           <FaTrashAlt />
  //         </button>
  //       </div>
  //     )
  //   })
  // ]


  // Table Columns for RDT
  const columns = [
    {
      name: 'Sr No.',
      cell: (row, index) => index + 1,
      width: '80px',
      center: true
    },
    {
      name: 'Account No.',
      selector: row => row.account_number,
      sortable: true
    },
    {
      name: 'Customer Name',
      selector: row => row.name,
      sortable: true
    },
    {
      name: 'Phone',
      selector: row => row.mobile,
      sortable: true
    },
    {
      name: 'Status',
      cell: row => (
        <div className="flex gap-2 items-center">
          <FaDotCircle color={row.status == 1 ? 'green' : 'red'} />
          <span>{row.status == 1 ? 'Active' : 'Inactive'}</span>
        </div>
      ),
      center: true
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="flex gap-2 items-center justify-center">
          <button
            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
            onClick={() => {
              fetchCutomerDetail(row.id);
              setIsModalOpen(true);
            }}
          >
            <FaEye />
          </button>
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
            onClick={() => nav('/editCustomer', { state: row })}
          >
            <FaPen />
          </button>
          <button
            className="px-2 py-1 bg-red-500 text-white rounded text-xs"
            onClick={() => {
              setCustomerToDelete(row);
              setIsConfirmOpen(true);
            }}
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
      center: true
    }
  ];


  const handleSearch = (value) => {
    setSearchCustomer(value);

    const filtered = rowData.filter((item) => {
      const val = value.toLowerCase();
      return (
        item.name?.toLowerCase().includes(val) ||
        item.account_number?.toString().includes(val)
      );
    });

    setFilteredData(filtered);
  };






  const table = useReactTable({
    data: rowData,
    columns,
    getCoreRowModel: getCoreRowModel()
  })



  // const InfoCard = ({ label, value }) => (
  //  <div className="bg-black from-sky-600 text-white rounded-lg p-3 shadow-md">

  //     <p className="text-white text-xs uppercase mb-1">{label}</p>
  //     <p className="font-medium text-white break-words">{value}</p>
  //   </div>
  // );

  const InfoCard = ({ label, value }) => {
    console.log("Value in InfoCard:", value);
    const isImage = typeof value === 'string' && (value.endsWith('.jpg') || value.endsWith('.jpeg') || value.endsWith('.png') || value.endsWith('.webp') || value.endsWith('.gif'));

    return (
      <div className="bg-slate-800 text-white rounded-lg p-3 shadow-md">
        <p className="text-xs uppercase font-semibold mb-1 text-white/80">{label}</p>
        {isImage ? (
          <img
            src={value}
            alt={label}
            className="rounded border border-white/30 shadow max-h-36 object-contain"
          />
        ) : (
          <p className="font-medium text-white break-words">{value}</p>
        )}

      </div>
    );
  };







  return (
    <div ref={scrollRef} className="overflow-y-auto overflow-x-auto p-4   text-slate-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-orange-50 border border-orange-200 rounded-lg px-6 py-4 shadow-sm">

        <button
          onClick={() => nav('/addCustomer')}
          className="bg-[#E6612A] hover:bg-orange-400 text-white px-4 py-2 rounded shadow-sm"
        >
          + Add Customer
        </button>
      </div>

      {/* <div onKeyDown={(e) => {
        if (e.key === "Enter") {

          fetchAllCustomerData()
        }

      }}>
        <input
          type="text"
          placeholder="Search customer..."
          className="border border-gray-600 px-2 my-2 rounded outline-none focus:ring-2 focus:ring-blue-500 "
          onChange={(e) => setSearchCustomer(e.target.value)}
          value={searchCustomer}
        />
      </div> */}

      {/* Table */}
      {/* <table className="min-w-full border text-sm bg-white rounded shadow overflow-hidden">
        <thead className="bg-indigo-50 text-indigo-700 uppercase text-xs font-semibold">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 border">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-indigo-50 transition">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 border text-center">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table> */}



      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        highlightOnHover
        striped
        dense
        customStyles={{
          headCells: {
            style: {
              backgroundColor: '#f8f9fa',
              color: '#333',
              fontWeight: 'bold',
              fontSize: '14px',
              textTransform: 'uppercase',
            },
          },
          rows: {
            style: {
              backgroundColor: 'white',
              borderBottom: '1px solid #eaeaea',
              transition: '0.2s',
              '&:hover': {
                backgroundColor: '#fff5f0',
              },
            },
          },
        }}
        subHeader
        subHeaderComponent={
          <div className="flex justify-between items-center w-full">
            <h1 className="text-xl font-bold text-gray-800">Customer List</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search customer..."
                value={searchCustomer}
                onChange={(e) => handleSearch(e.target.value)}
                className="border px-3 py-2 text-sm rounded-full w-64 outline-none border-orange-600 focus:ring-2 focus:ring-orange-300 pl-10"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                🔍
              </span>
            </div>
          </div>
        }
      />


      {/* Infinite Scroll Loader */}
      {loading && (
        <div className="text-center py-4 text-gray-500 font-medium">Loading more customers...</div>
      )}

      {/* View Modal */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
          <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
              title="Close"
            >
              <IoMdCloseCircle size={32} />
            </button>

            <h2 className="text-2xl font-bold text-orange-600 mb-4 flex items-center gap-2">
              <User className="w-6 h-6" />
              Customer Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 text-sm text-gray-800">

              {/* PERSONAL INFO */}
              <InfoCard label="Name" value={selectedCustomer.name} />
              <InfoCard label="Customer Type" value={selectedCustomer.customer_type} />
              <InfoCard label="Email" value={selectedCustomer.email} />
              <InfoCard label="Mobile" value={selectedCustomer.mobile} />
              <InfoCard label="Care of" value={selectedCustomer.careof} />
              <InfoCard label="Contact Person" value={selectedCustomer.contact_person} />
              <InfoCard label="Designation" value={selectedCustomer.designation} />

              {/* ADDRESS INFO */}
              <InfoCard label="Address" value={selectedCustomer.address} />
              <InfoCard label="City" value={selectedCustomer.city} />
              <InfoCard label="State" value={selectedCustomer.state} />
              <InfoCard label="Pincode" value={selectedCustomer.pincode} />

              {/* BANK & DOCUMENTS */}
              <InfoCard label="PAN Number" value={selectedCustomer.pan_number} />
              <InfoCard label="Account Number" value={selectedCustomer.account_number} />
              <InfoCard label="Bank Account" value={selectedCustomer.bank_account} />
              <InfoCard label="IFSC Code" value={selectedCustomer.ifsc_code} />
              <InfoCard label="Subsidy Code" value={selectedCustomer.subsidy_code} />
              {/* <InfoCard label="Bank Copy" value={`${selectedCustomer.bank_image}`} /> */}

              {/* ANIMAL INFO */}
              <InfoCard label="Total Cows" value={selectedCustomer.total_cows || 'N/A'} />
              <InfoCard label="Total Buffalos" value={selectedCustomer.total_buffalos || 'N/A'} />
              <InfoCard label="Total Animals" value={selectedCustomer.total_animals || 'N/A'} />

              {/* STATUS & META */}
              <InfoCard
                label="Status"
                value={
                  <span className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${selectedCustomer.status === '1'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {selectedCustomer.status === '1' ? 'Active' : 'Inactive'}
                  </span>
                }
              />
              <InfoCard label="Aadhar Number" value={selectedCustomer.aadhar_number} />
              <InfoCard label="Jan Aadhar" value={selectedCustomer.jan_aadhar_number} />
              <InfoCard label="Wallet" value={`₹${selectedCustomer.wallet}`} />
              <InfoCard label="Created At" value={new Date(selectedCustomer.created_at).toLocaleString()} />

            </div>
            <div className="h-36 flex flex-col gap-3 items-start justify-start mt-4 rounded-lg">
              <h1 className='font-bold'>Bank Copy</h1>
              <img
                src={selectedCustomer.bank_image}
                alt={'bank image copy'}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Confirm Delete Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6 text-center relative">
            <h2 className="text-lg font-semibold mb-4 text-red-700">
              Are you sure you want to delete?
            </h2>
            <p className="text-gray-700 mb-6">This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCustomer}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerList

