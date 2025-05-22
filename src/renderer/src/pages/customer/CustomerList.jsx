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
import { useNavigate } from 'react-router-dom';
import useHomeStore from '../../zustand/useHomeStore';
import { IoMdCloseCircle } from 'react-icons/io';
import { toast } from 'react-toastify';

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



    const fetchAllCustomerData = async () => {
        try {
            setLoading(true); // 👈 Start loading
            const res = await getAllCustomer();
            if (res.status_code == 200) {
                setRowData(res.data.data);
                console.log("all customer fetch", res)
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
                toast(res.message, {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    type: 'success'

                });
                fetchAllCustomerData();
            } else {
                toast(res.message, {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    type: 'error'

                });
            }
        } catch (error) {
            toast(error.response.message, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                type: 'error'

            });
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
        columnHelper.accessor('pan_number', {
            header: 'Pan Card',
            cell: info => info.getValue(),
        }),
        columnHelper.display({
            id: "status",
            header: 'Status',
            cell: ({ row }) => (
                <div className="flex gap-3 justify-start items-center">
                    <FaDotCircle color={row.original.status == 1 ? 'green' : 'red'} />
                    <h1>{row.original.status == 1 ? 'Active' : 'Inactive'}</h1>
                </div>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
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



    return (
        <div className="overflow-x-auto p-4">
            <div className="addUser_totalUser">
                <div className="totalUserCount text-md mb-2 p-2 text-white">
                    Total Customers: {rowData.length}
                </div>
                <button onClick={() => nav("/addCustomer")}>
                    Add User
                </button>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="text-center py-10 text-lg font-semibold text-gray-600">
                    Loading customers...
                </div>
            ) : (
                <>
                    <table className="min-w-full border text-sm">
                        <thead className="bg-gray-100">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-4 py-2 border">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-4 py-2 border">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-sm">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </div>
                        <div className="space-x-2">
                            <button
                                className="px-2 py-1 bg-gray-200 rounded cursor-pointer"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Previous
                            </button>
                            <button
                                className="px-2 py-1 bg-gray-200 rounded cursor-pointer"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}

            {isModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 p-6 relative overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Customer Details</h2>

                        <div
                            onClick={() => setIsModalOpen(false)}
                            className="absolute bg-white top-4 right-4 text-xxl cursor-pointer"
                            title="Close"
                        >
                            <IoMdCloseCircle size={30} />
                        </div>

                        <table className="w-full text-sm text-left border border-gray-200">
                            <tbody>
                                {[
                                    ['Name', selectedCustomer.name],
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
                                        <td className="font-medium text-gray-700 px-4 py-2 w-1/3 bg-gray-50">{label}</td>
                                        <td className="px-4 py-2">{value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className=" text-white px-5 py-2 rounded transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isConfirmOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6 text-center relative">
                        <h2 className="text-lg font-semibold mb-4">Are you sure you want to delete?</h2>
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
