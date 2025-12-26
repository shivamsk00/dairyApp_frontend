import React, { useEffect, useState } from 'react';
import sampleImage from '../../assets/login_img.png';
import { colors } from '../../constant/constant';
import useHomeStore from '../../zustand/useHomeStore';
import DateFormate from '../../helper/DateFormate';
import DataTable from 'react-data-table-component';
import { FaEye, FaPen, FaTrashAlt, FaSearch, FaFilter, FaDownload } from 'react-icons/fa';
import { IoMdCloseCircle } from 'react-icons/io';
import { BsFillPrinterFill } from 'react-icons/bs';
import { MdDateRange, MdPerson, MdAttachMoney, MdLocalDrink } from 'react-icons/md';
import EditMilkCollectionModal from '../milkCollection/EditMilkCollectionPage';
import CustomToast from '../../helper/costomeToast';

const MilkCorrectionPage = () => {
    const getMilkCorrectionData = useHomeStore(state => state.getMilkCorrectionData);
    const deleteMilkCollection = useHomeStore(state => state.deleteMilkCollection);
    const today = new Date().toISOString().split('T')[0];
    const [loading, setLoading] = useState(false);
    const [selection, setSelection] = useState('all');
    const [milkData, setMilkData] = useState([]);
    const [searchCustomer, setSearchCustomer] = useState('');
    const [form, setForm] = useState({
        start_date: today,
        end_date: today,
        customer_account_number: ''
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedMilkEntry, setSelectedMilkEntry] = useState(null);
    const [milkToDelete, setMilkToDelete] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editableEntry, setEditableEntry] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalMilk, setTotalMilk] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [averageFat, setAverageFat] = useState(0);
    const [averageSnf, setAvrageSnf] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectionChange = (value) => {
        setSelection(value);
        if (value === 'all') {
            setForm(prev => ({ ...prev, customer_account_number: '' }));
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        try {
            setLoading(true);
            const payload = {
                start_date: DateFormate(form.start_date),
                end_date: DateFormate(form.end_date),
                data_type: selection,
                customer_account_number: selection === 'customer' ? form.customer_account_number : ''
            };

            const res = await getMilkCorrectionData(payload);
            if (res?.status_code == 200 && res.data?.milk_collections) {
                setMilkData(res.data.milk_collections);
                setTotalMilk(res.data.totalMilk || 0);
                setTotalAmount(res.data.totalAmount || 0);
                setAverageFat(res.data.averageFat || 0);
                setAvrageSnf(res.data.averageSnf || 0);
            }
        } catch (error) {
            console.log("ERROR IN MILK CORRECTION PAGE ==>", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearchCustomer(text);
    };

    const filteredData = milkData.filter(item =>
        item.customer_account_number?.toLowerCase().includes(searchCustomer.toLowerCase())
    );

    const handlePrint = (data) => {
        const shift = data.shift === 'morning' ? 'M' : 'E';
        const now = new Date();
        const localTime = now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const slipData = {
            account_no: data.customer_account_number,
            customer: data.name,
            date: data.date,
            time: `${localTime}(${shift})`,
            qty: `${data.quantity} / Ltr`,
            fat: data.fat,
            snf: data.snf,
            rate: `${data.base_rate} / Ltr`,
            other_price: data.other_price,
            total: data.total_amount
        };

        window.api.printSlip(slipData);
    };

    const columns = [
        {
            name: 'SR NO.',
            cell: (row, index) => (
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                </div>
            ),
            width: '80px',
            sortable: false,
            center: true
        },
        {
            name: 'Account No.',
            selector: row => row.customer_account_number,
            sortable: true,
            cell: row => (
                <div className="font-medium text-gray-900">
                    {row.customer_account_number}
                </div>
            )
        },
        {
            name: 'Date',
            selector: row => row.date,
            sortable: true,
            cell: row => (
                <div className="text-sm text-gray-600">
                    {new Date(row.date).toLocaleDateString('en-IN')}
                </div>
            )
        },
        {
            name: 'Type',
            selector: row => row.milk_type,
            sortable: true,
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.milk_type === 'cow'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {row.milk_type}
                </span>
            )
        },
        {
            name: 'Shift',
            selector: row => row.shift,
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.shift === 'morning'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-purple-100 text-purple-800'
                    }`}>
                    {row.shift === 'morning' ? 'M' : 'E'}
                </span>
            )
        },
        {
            name: 'Qty (L)',
            selector: row => row.quantity,
            cell: row => (
                <div className="font-medium text-blue-600">
                    {row.quantity}
                </div>
            )
        },
        {
            name: 'FAT',
            selector: row => row.fat,
            cell: row => (
                <div className="text-sm font-medium">
                    {row.fat}
                </div>
            )
        },
        {
            name: 'SNF',
            selector: row => row.snf,
            cell: row => (
                <div className="text-sm font-medium">
                    {row.snf}
                </div>
            )
        },
        {
            name: 'Rate',
            selector: row => row.base_rate,
            cell: row => (
                <div className="font-medium text-green-600">
                    ₹{row.base_rate}
                </div>
            )
        },
        {
            name: 'Other Rate',
            selector: row => row.other_price,
            cell: row => (
                <div className="font-medium text-green-600">
                    ₹{row.other_price}
                </div>
            )
        },
        {
            name: 'Amount',
            selector: row => row.total_amount,
            cell: row => (
                <div className="font-semibold text-green-700">
                    ₹{row.total_amount}
                </div>
            )
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="flex gap-1 items-center justify-center">
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200 shadow-sm"
                        onClick={() => handlePrint(row)}
                        title="Print"
                    >
                        <BsFillPrinterFill size={12} />
                    </button>
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors duration-200 shadow-sm"
                        onClick={() => {
                            setSelectedMilkEntry(row);
                            setIsModalOpen(true);
                        }}
                        title="View Details"
                    >
                        <FaEye size={12} />
                    </button>
                    <button
                        className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-lg transition-colors duration-200 shadow-sm"
                        onClick={() => {
                            setEditableEntry(row);
                            setIsEditModalOpen(true);
                        }}
                        title="Edit"
                    >
                        <FaPen size={12} />
                    </button>
                    <button
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors duration-200 shadow-sm"
                        onClick={() => {
                            setMilkToDelete(row);
                            setIsConfirmOpen(true);
                        }}
                        title="Delete"
                    >
                        <FaTrashAlt size={12} />
                    </button>
                </div>
            ),
            center: true,
            width: '160px'
        }
    ];

    const handleRemove = async () => {
        try {
            const res = await deleteMilkCollection(milkToDelete?.id);
            if (res.status_code == 200) {
                CustomToast.success(res.message);
                setIsConfirmOpen(false);
                setMilkToDelete(null);
                await handleSubmit();
            } else {
                CustomToast.error(res.message);
            }
        } catch (error) {
            console.log("ERROR IN MILK CORRECTION DELETE ROW DATA", error);
        }
    };

    // Custom table styles
    const customTableStyles = {
        header: {
            style: {
                minHeight: '56px',
                backgroundColor: '#f8fafc',
                borderBottom: '2px solid #e2e8f0'
            },
        },
        headRow: {
            style: {
                backgroundColor: '#f1f5f9',
                borderBottom: '1px solid #cbd5e1',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
            },
        },
        rows: {
            style: {
                minHeight: '60px',
                fontSize: '13px',
                '&:hover': {
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer'
                }
            },
            stripedStyle: {
                backgroundColor: '#f9fafb'
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                            <MdLocalDrink className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Milk Correction Dashboard</h1>
                            <p className="text-gray-600">Manage and track milk collection data</p>
                        </div>
                    </div>

                    {/* Enhanced Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Date Range Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <MdDateRange className="h-4 w-4 text-blue-500" />
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={form.start_date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <MdDateRange className="h-4 w-4 text-blue-500" />
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={form.end_date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                                    required
                                />
                            </div>
                        </div>

                        {/* Filter Options */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <FaFilter className="h-4 w-4 text-blue-500" />
                                Filter Options
                            </label>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="selection"
                                        value="all"
                                        checked={selection === 'all'}
                                        onChange={() => handleSelectionChange('all')}
                                        className="w-4 h-4 text-blue-600 border-2 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">All Records</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="selection"
                                        value="customer"
                                        checked={selection === 'customer'}
                                        onChange={() => handleSelectionChange('customer')}
                                        className="w-4 h-4 text-blue-600 border-2 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">By Customer</span>
                                </label>
                            </div>
                        </div>

                        {/* Customer Account Number */}
                        {selection === 'customer' && (
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <MdPerson className="h-4 w-4 text-blue-500" />
                                    Customer Account Number
                                </label>
                                <input
                                    type="number"
                                    name="customer_account_number"
                                    value={form.customer_account_number}
                                    onChange={handleChange}
                                    placeholder="Enter account number"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                                    required
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processing...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <FaSearch className="h-4 w-4" />
                                    Search Records
                                </div>
                            )}
                        </button>
                    </form>
                </div>

                {/* Data Table Section */}
                {milkData.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                <h2 className="text-xl font-bold text-gray-900">Milk Collection Records</h2>
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search by account number..."
                                        value={searchCustomer}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 w-full sm:w-64"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <DataTable
                                columns={columns}
                                data={filteredData}
                                pagination
                                paginationPerPage={10}
                                paginationRowsPerPageOptions={[10, 20, 50, 100]}
                                highlightOnHover
                                striped
                                responsive
                                customStyles={customTableStyles}
                                noDataComponent={
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="text-gray-400 mb-2">
                                            <MdLocalDrink className="h-12 w-12" />
                                        </div>
                                        <p className="text-gray-500 font-medium">No records found</p>
                                    </div>
                                }
                            />
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                {totalMilk > 0 && totalAmount > 0 && averageFat > 0 && averageSnf > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Total Milk</p>
                                    <p className="text-2xl font-bold">{totalMilk.toFixed(2)} L</p>
                                </div>
                                <MdLocalDrink className="h-8 w-8 text-blue-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Total Amount</p>
                                    <p className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</p>
                                </div>
                                <MdAttachMoney className="h-8 w-8 text-green-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-amber-100 text-sm font-medium">Avg FAT</p>
                                    <p className="text-2xl font-bold">{averageFat}</p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-amber-200 flex items-center justify-center">
                                    <span className="text-amber-800 font-bold text-sm">F</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Avg SNF</p>
                                    <p className="text-2xl font-bold">{averageSnf}</p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center">
                                    <span className="text-purple-800 font-bold text-sm">S</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced View Modal */}
            {isModalOpen && selectedMilkEntry && (
                <div className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-xl">
                                        <FaEye className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Record Details</h2>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                                >
                                    <IoMdCloseCircle className="h-6 w-6 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    ['Record ID', selectedMilkEntry.id],
                                    ['Account Number', selectedMilkEntry.customer_account_number],
                                    ['Date', new Date(selectedMilkEntry.date).toLocaleDateString('en-IN')],
                                    ['Milk Type', selectedMilkEntry.milk_type],
                                    ['Shift', selectedMilkEntry.shift],
                                    ['Quantity (Ltr)', selectedMilkEntry.quantity],
                                    ['FAT (%)', selectedMilkEntry.fat],
                                    ['SNF (%)', selectedMilkEntry.snf],
                                    ['Rate (₹/Ltr)', selectedMilkEntry.base_rate],
                                    ['Other Price (₹/Ltr)', selectedMilkEntry.other_price],
                                    ['Total Amount (₹)', selectedMilkEntry.total_amount],
                                    ['Created At', new Date(selectedMilkEntry.created_at).toLocaleString('en-IN')]
                                ].map(([label, value]) => (
                                    <div key={label} className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
                                        <p className="text-lg font-semibold text-gray-900">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 rounded-b-2xl border-t border-gray-200 p-6">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors duration-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <EditMilkCollectionModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditableEntry(null);
                }}
                milkData={editableEntry}
               onUpdate={() => handleSubmit()}
            />

            {/* Enhanced Delete Confirmation Modal */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <FaTrashAlt className="h-5 w-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Record</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this milk collection record? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => {
                                        setIsConfirmOpen(false);
                                        setMilkToDelete(null);
                                    }}
                                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRemove}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors duration-200"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MilkCorrectionPage;
