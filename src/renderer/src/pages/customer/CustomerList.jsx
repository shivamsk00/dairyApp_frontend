import React, { useEffect, useState } from 'react';
import "./customer.css"
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import { FaDotCircle, FaEye, FaPen, FaTrashAlt } from 'react-icons/fa';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useHomeStore from '../../zustand/useHomeStore';
import { IoMdCloseCircle } from 'react-icons/io';
import { toast } from 'react-toastify';
import CustomToast from '../../helper/costomeToast';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import Preloading from '../../components/Preloading';

const columnHelper = createColumnHelper();

const CustomerList = () => {
    const nav = useNavigate();
    const getAllCustomer = useHomeStore(state => state.getAllCustomer);
    const deleteCustomer = useHomeStore(state => state.deleteCustomer);
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(false); // 👈 Add loading state
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [maxPageButtons, setMaxPageButtons] = useState(5);



    const fetchAllCustomerData = async (page = 1) => {
        try {
            setLoading(true); // 👈 Start loading
            const res = await getAllCustomer(page);
            if (res.status_code == 200) {
                setRowData(res.data.data);
                setCurrentPage(res.data.current_page);
                setTotalPages(res.data.last_page);
                console.log("all customer fetch", res)
            }

            else {
                CustomToast.error(res.message);
            }



        } catch (error) {
            console.error("Failed to fetch customers", error);
        } finally {
            setLoading(false); // 👈 End loading
        }
    };

    useEffect(() => {
        fetchAllCustomerData();
    }, []);

    const confirmDeleteCustomer = async () => {
        try {
            const res = await deleteCustomer(customerToDelete?.id);
            if (res.status_code == 200) {
                CustomToast.success(res.message)
                fetchAllCustomerData();
            } else {
                CustomToast.error(res.message)

            }
        } catch (error) {
            CustomToast.error(res.message)
            console.log("ERROR IN DELETE FUN IN CUSTOMER LIST", error);
        } finally {
            setIsConfirmOpen(false); ``
            setCustomerToDelete(null);
        }
    };

    const columns = [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('name', {
            header: 'Customer Name',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('mobile', {
            header: 'Phone',
            cell: info => info.getValue(),
        }),

        columnHelper.display({
            id: "status",
            header: 'Status',
            cell: ({ row }) => (
                <div className="flex gap-3 text-center justify-start items-center">
                    <FaDotCircle color={row.original.status == 1 ? 'green' : 'red'} />
                    <h1>{row.original.status == 1 ? 'Active' : 'Inactive'}</h1>
                </div>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center justify-center text-center gap-2">
                    <button
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition"
                        onClick={() => {
                            setSelectedCustomer(row.original);
                            setIsModalOpen(true);
                        }}
                    >
                        <FaEye />
                    </button>
                    <button
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                        onClick={() => nav("/editCustomer", { state: row.original })}
                    >
                        <FaPen />
                    </button>
                    <button
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                        onClick={() => {
                            setCustomerToDelete(row.original);
                            setIsConfirmOpen(true);
                        }}
                    >
                        <FaTrashAlt />
                    </button>
                </div>
            )
        }),
    ];

    const table = useReactTable({
        data: rowData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });


    const renderPageButtons = () => {
        const groupStart = Math.floor((currentPage - 1) / maxPageButtons) * maxPageButtons + 1;
        const groupEnd = Math.min(groupStart + maxPageButtons - 1, totalPages);

        const pages = [];

        // Always show first page
        if (groupStart > 1) {
            pages.push(
                <button
                    key={1}
                    className={`px-3 py-1 border rounded text-sm ${currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                    onClick={() => fetchAllCustomerData(1)}
                >
                    1
                </button>
            );

            if (groupStart > 2) {
                pages.push(<span key="start-ellipsis" className="px-2 text-gray-500">...</span>);
            }
        }

        // Middle buttons
        for (let i = groupStart; i <= groupEnd; i++) {
            pages.push(
                <button
                    key={i}
                    className={`px-3 py-1 border rounded text-sm ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                    onClick={() => fetchAllCustomerData(i)}
                >
                    {i}
                </button>
            );
        }

        // Always show last page
        if (groupEnd < totalPages) {
            if (groupEnd < totalPages - 1) {
                pages.push(<span key="end-ellipsis" className="px-2 text-gray-500">...</span>);
            }

            pages.push(
                <button
                    key={totalPages}
                    className={`px-3 py-1 border rounded text-sm ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                    onClick={() => fetchAllCustomerData(totalPages)}
                >
                    {totalPages}
                </button>
            );
        }

        return (
            <div className="flex gap-1 flex-wrap justify-center mt-4 w-full">
                {/* Previous Button */}
                <button
                    className="px-3 py-1 border rounded text-sm text-white bg-gray-500 hover:bg-gray-600 disabled:opacity-50"
                    onClick={() => fetchAllCustomerData(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <MdArrowBackIos size={18} />
                </button>

                {pages}

                {/* Next Button */}
                <button
                    className="px-3 py-1 border rounded text-sm text-white bg-gray-500 hover:bg-gray-600 disabled:opacity-50"
                    onClick={() => fetchAllCustomerData(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <MdArrowForwardIos size={18} />
                </button>
            </div>
        );
    };



   return (
  <div className="overflow-x-auto p-4 bg-slate-50 min-h-screen text-slate-700">
    {/* Header */}
    <div className="flex justify-between items-center mb-6 bg-indigo-100 border border-indigo-200 rounded-lg px-6 py-4 shadow-sm">
      <div className="flex items-center gap-3 text-indigo-800">
        <User className="w-6 h-6" />
        <h2 className="text-lg font-semibold">
          Total Customers: {rowData.length}
        </h2>
      </div>
      <button
        onClick={() => nav("/addCustomer")}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow-sm transition-all duration-200"
      >
        + Add Customer
      </button>
    </div>

    {/* Loading State */}
    {loading ? (
      <div className="text-center py-10 text-lg font-semibold text-gray-600 h-full flex">
        <Preloading />
      </div>
    ) : (
      <>
        <table className="min-w-full border text-sm bg-white rounded shadow overflow-hidden">
          <thead className="bg-indigo-50 text-indigo-700 uppercase text-xs font-semibold">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-3 border">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-indigo-50 transition">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 border text-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {renderPageButtons()}
      </>
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
                ['Contact Person', selectedCustomer.contact_person],
                ['Address', selectedCustomer.address],
                ['City', selectedCustomer.city],
                ['State', selectedCustomer.state],
                ['Pincode', selectedCustomer.pincode],
                ['PAN Number', selectedCustomer.pan_number],
                ['Designation', selectedCustomer.designation],
                ['Account Number', selectedCustomer.account_number],
                ['Wallet', `₹${selectedCustomer.wallet}`],
                ['Status', selectedCustomer.status === "1" ? 'Active' : 'Inactive'],
                ['Created At', new Date(selectedCustomer.created_at).toLocaleString()],
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
);
};

export default CustomerList;
