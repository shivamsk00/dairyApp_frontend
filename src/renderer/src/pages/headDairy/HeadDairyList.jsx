import React, { useEffect, useState } from 'react';
import "./headDairy.css"
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import { FaDotCircle, FaEye, FaPen, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useHomeStore from '../../zustand/useHomeStore';
import { IoMdCloseCircle } from 'react-icons/io';
import { toast } from 'react-toastify';
import CustomToast from '../../helper/costomeToast';
import Preloading from '../../components/Preloading';

const columnHelper = createColumnHelper();

const HeadDairyList = () => {
    const nav = useNavigate();
    const getAllHeadDairyMaster = useHomeStore(state => state.getAllHeadDairyMaster);
    const deleteHeadDairyMaster = useHomeStore(state => state.deleteHeadDairyMaster);
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(false); // 👈 Add loading state
    const [selectedHeadDairy, setSelectedHeadDairy] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [headDairyToDelete, setHeadDairyToDelete] = useState(null);



    const fetchAllHeadDairyData = async () => {
        try {
            setLoading(true); // 👈 Start loading
            const res = await getAllHeadDairyMaster();
            if (res.status_code == 200) {
                setRowData(res.data);
                console.log("all Head Dairy Data fetch", res)
            }

            else {
                CustomToast.error(res.message);
            }



        } catch (error) {
            console.error("Failed to fetch Head Dairy Masters", error);
        } finally {
            setLoading(false); // 👈 End loading
        }
    };

    useEffect(() => {
        fetchAllHeadDairyData();
    }, []);

    const confirmDeleteHeadDairyMaster = async () => {
        try {
            const res = await deleteHeadDairyMaster(headDairyToDelete?.id);
            if (res.status_code == 200) {
                CustomToast.success(res.message)
                fetchAllHeadDairyData();
            } else {
                CustomToast.error(res.message)

            }
        } catch (error) {
            CustomToast.error(res.message)
            console.log("ERROR IN DELETE FUN IN Head Dairy LIST", error);
        } finally {
            setIsConfirmOpen(false); ``
            setHeadDairyToDelete(null);
        }
    };
    const columns = [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('dairy_name', {
            header: 'Head Dairy Name',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('mobile', {
            header: 'Mobile',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('contact_person', {
            header: 'Contact Person',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('address', {
            header: 'Address',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('wallet', {
            header: 'Wallet',
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
                            setSelectedHeadDairy(row.original);
                            setIsModalOpen(true);
                        }}
                    >
                        <FaEye />
                    </button>
                    <button
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                        onClick={() => nav("/editHeadDairy", { state: row.original })}
                    >
                        <FaPen />
                    </button>
                    <button
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                        onClick={() => {
                            setHeadDairyToDelete(row.original);
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
    });



    return (
        <div className="overflow-x-auto p-4">
            <div className="addUser_totalUser">
                <div className="totalUserCount text-md mb-2 p-2 text-white">
                    Total Head Dairy Master: {rowData.length}
                </div>
                <button onClick={() => nav("/headDairy")}>
                    Add Head Dairy Master
                </button>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="text-center py-10 text-lg font-semibold text-gray-600 h-full flex">
                    <Preloading />
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
                                        <td key={cell.id} className="px-4 py-2 border text-center">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {/* {renderPageButtons()} */}
                </>
            )}


            {/* THIS MODAL  */}
            {isModalOpen && selectedHeadDairy && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 p-6 relative overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Head Dairy Details</h2>

                        {/* <div
                            onClick={() => setIsModalOpen(false)}
                            className="absolute bg-white top-4 right-4 text-xxl cursor-pointer"
                            title="Close"
                        >
                            <IoMdCloseCircle size={30} />
                        </div> */}

                        <table className="w-full text-sm text-left border border-gray-200">
                            <tbody>
                                {[
                                    ['Name', selectedHeadDairy.dairy_name],
                                    ['Mobile', selectedHeadDairy.mobile],
                                    ['Contact Person', selectedHeadDairy.contact_person],
                                    ['Address', selectedHeadDairy.address],
                                    ['Wallet', selectedHeadDairy.wallet],
                                    ['Status', selectedHeadDairy.status === "1" ? 'Active' : 'Inactive'],
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
                                className="bg-gray-700 text-white px-5 py-2 rounded hover:bg-gray-800"
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
                                onClick={confirmDeleteHeadDairyMaster}
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

export default HeadDairyList;
