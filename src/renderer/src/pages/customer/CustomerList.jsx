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
        // title="Customer List"
        columns={columns}
        data={filteredData}
        pagination
        highlightOnHover
        striped
        dense
        subHeader
        subHeaderComponent={
          <div className='flex justify-between items-center w-full'>
          <h1>Customer List</h1>
          <input
            type="text"
            placeholder="Search customer..."
            value={searchCustomer}
            onChange={(e) => handleSearch(e.target.value)}
            className="border px-3 py-1 text-sm rounded w-64 outline-none border-orange-600 "
            />
            </div>
        }
      />

      {/* Infinite Scroll Loader */}
      {loading && (
        <div className="text-center py-4 text-gray-500 font-medium">Loading more customers...</div>
      )}

      {/* View Modal */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-semibold text-indigo-800 mb-6 border-b pb-3 flex items-center gap-2">
              <User className="w-6 h-6" />
              Customer Details
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
              title="Close"
            >
              <IoMdCloseCircle size={30} />
            </button>
            <table className="w-full text-sm text-left border border-gray-200">
              <tbody>
                {[
                  ['Name', selectedCustomer.name],
                  ['Customer Type', selectedCustomer.customer_type],
                  ['Email', selectedCustomer.email],
                  ['Mobile', selectedCustomer.mobile],
                  ['Care of', selectedCustomer.careof],
                  ['Contact Person', selectedCustomer.contact_person],
                  ['Address', selectedCustomer.address],
                  ['City', selectedCustomer.city],
                  ['State', selectedCustomer.state],
                  ['Pincode', selectedCustomer.pincode],
                  ['PAN Number', selectedCustomer.pan_number],
                  ['Designation', selectedCustomer.designation],
                  ['Account Number', selectedCustomer.account_number],
                  ['Wallet', `₹${selectedCustomer.wallet}`],
                  ['Bank Account', selectedCustomer.bank_account],
                  ['IFSC Code', selectedCustomer.ifsc_code],
                  ['Subsidy Code', selectedCustomer.subsidy_code],
                  ['Total Cows', selectedCustomer.total_cows || 'N/A'],
                  ['Total Buffalos', selectedCustomer.total_buffalos || 'N/A'],
                  ['Total Animals', selectedCustomer.total_animals || 'N/A'],
                  ['Status', selectedCustomer.status === '1' ? 'Active' : 'Inactive'],
                  ['Created At', new Date(selectedCustomer.created_at).toLocaleString()]
                ].map(([label, value]) => (
                  <tr key={label} className="border-b hover:bg-gray-50">
                    <td className="font-medium text-gray-700 px-4 py-2 w-1/3 bg-gray-50">
                      {label}
                    </td>
                    <td className="px-4 py-2">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6 text-right">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-700 text-white px-5 py-2 rounded hover:bg-gray-800"
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

