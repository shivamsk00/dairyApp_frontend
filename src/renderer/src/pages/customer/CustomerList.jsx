import React from 'react';
import "./customer.css"
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import { FaPen, FaTrashAlt, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const columnHelper = createColumnHelper();

const data = [
    { id: 1, name: 'Ramesh', phone: '9876543210', pan: "ADER672864" },
    { id: 2, name: 'Suresh', phone: '9123456780', pan: "ADER672864" },
    { id: 3, name: 'Mahesh', phone: '9812345678', pan: "ADER672864" },
    { id: 4, name: 'Amit', phone: '9012345678', pan: "ADER672864" },
    { id: 5, name: 'Anil', phone: '9823456781', pan: "ADER672864" },
    { id: 6, name: 'Vijay', phone: '9934567890', pan: "ADER672864" },
];

const CustomerList = () => {
    const [rowData, setRowData] = React.useState(data);

    const handleRemove = (id) => {
        setRowData(prev => prev.filter(item => item.id !== id));
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
        columnHelper.accessor('phone', {
            header: 'Phone',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('pan', {
            header: 'Pan',
            cell: info => info.getValue(),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <button
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                        onClick={() => alert(`Viewing ${row.original.name}`)}
                    >
                        <FaPen />
                    </button>
                    <button
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                        onClick={() => handleRemove(row.original.id)}
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

    const nav = useNavigate()

    return (
        <div className="overflow-x-auto p-4">
            <div className="addUser_totalUser">

                <div className="totalUserCount text-md mb-2  p-2 text-white">
                    Total Customer  {rowData.length}
                </div>
                <button onClick={() =>
                    nav("/addCustomer")


                }>Add User</button>



            </div>
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
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
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
        </div>
    );
};

export default CustomerList;
