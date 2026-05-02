

import React, { useEffect, useState } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import DateFormate from '../../helper/DateFormate';
import { TfiExport } from 'react-icons/tfi';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaUser, FaCalendarAlt, FaBoxOpen, FaSearch, FaPlus, FaTrash } from 'react-icons/fa';
import { FaPen, FaTrashCan } from 'react-icons/fa6';
import { HiDocumentText } from 'react-icons/hi2';
import EditCustomerCollectionModal from '../milkCollection/EditCustomerCollection';

const ProductCorrection = () => {
    const allSoldProducts = useHomeStore(state => state.getAllSoldProducts);
    const getDeleteProducts = useHomeStore(state => state.getDeleteProducts);

    const today = new Date().toISOString().split('T')[0];
    const [allsoldproducts, setAllsoldproducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [deleteId, setDeleteId] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isEditeModal, setIsEditeModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Search/Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Fetch sold products
    const soldproductAllDataFetch = async () => {
        try {
            setLoading(true);
            const res = await allSoldProducts();
            if (res.status_code == 200) {
                setAllsoldproducts(res.data);
                setFilteredProducts(res.data);
            } else {
                setAllsoldproducts([]);
                setFilteredProducts([]);
            }
        } catch (error) {
            console.error("ERROR IN FETCH ALL SOLD PRODUCT", error);
            setAllsoldproducts([]);
            setFilteredProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        soldproductAllDataFetch();
    }, []);

    // Search/Filter Logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredProducts(allsoldproducts);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = allsoldproducts.filter(item => {
            if (filterType === 'name') {
                return item.customer?.name?.toLowerCase().includes(query);
            } else if (filterType === 'account') {
                return item.customer_account_number?.toString().includes(query);
            } else {
                return (
                    item.customer?.name?.toLowerCase().includes(query) ||
                    item.customer_account_number?.toString().includes(query) ||
                    item.product?.name?.toLowerCase().includes(query)
                );
            }
        });
        setFilteredProducts(filtered);
    }, [searchQuery, filterType, allsoldproducts]);

    const handleRemove = async (id) => {
        try {
            const res = await getDeleteProducts(id);
            if (res.status_code == 200) {
                CustomToast.success(res.message);
                soldproductAllDataFetch();
            } else {
                CustomToast.error(res.message);
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const exportToExcel = () => {
        if (!filteredProducts?.length) {
            toast.warning("No data to export");
            return;
        }

        const dataToExport = filteredProducts.map((entry, index) => ({
            'Sr. No': index + 1,
            'Account No': entry.customer_account_number,
            'Customer Name': entry.customer?.name || '',
            'Product': entry.product?.name || '',
            'Category': entry.category?.name || '',
            'Price': entry.product_price,
            'Quantity': entry.qty,
            'Total': entry.total,
            'Date': entry.date,
            'Transaction Type': entry.transaction_type
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        worksheet['!cols'] = [
            { wch: 8 }, { wch: 15 }, { wch: 20 }, { wch: 20 },
            { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
            { wch: 12 }, { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Product Sales');
        XLSX.writeFile(workbook, 'product_sales_report.xlsx');
        toast.success("Report exported successfully");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-8xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-200">
                    <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                                    <FaShoppingCart className="text-white text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Product Sales Correction</h2>
                                    <p className="text-[10px] text-slate-600">Total: {filteredProducts.length} entries</p>
                                </div>
                            </div>
                            <button
                                onClick={exportToExcel}
                                className="flex items-center gap-2 px-4 py-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-semibold shadow-lg"
                            >
                                <TfiExport size={12} />
                                Export Excel
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name, account, or product..."
                                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                                />
                            </div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-3 border-2 border-slate-200 focus:border-indigo-500 outline-none transition-all bg-white"
                            >
                                <option value="all">All Fields</option>
                                <option value="name">Customer Name</option>
                                <option value="account">Account Number</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="text-lg font-semibold text-slate-600 mt-6">Loading sales data...</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-slate-100 to-slate-200 sticky top-0 z-10">
                                    <tr>
                                        {['Sr', 'Account', 'Customer', 'Product', 'Category', 'Price', 'Qty', 'Total', 'Date', 'Type', 'Actions'].map((header) => (
                                            <th key={header} className="px-3 py-2 text-left text-[10px] font-bold text-slate-700 uppercase">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((item, i) => (
                                            <tr key={item.id} className="hover:bg-indigo-50 transition-colors">
                                                <td className="px-3 py-2 text-[10px] font-semibold text-slate-600">{i + 1}</td>
                                                <td className="px-3 py-2 text-[10px] font-bold text-indigo-600">{item.customer_account_number}</td>
                                                <td className="px-3 py-2 text-[10px] font-semibold text-slate-700">{item.customer?.name || '-'}</td>
                                                <td className="px-3 py-2 text-[10px] text-slate-700">{item.product?.name || '-'}</td>
                                                <td className="px-3 py-2 text-[10px] text-slate-600">{item.category?.name || '-'}</td>
                                                <td className="px-3 py-2 text-[10px] font-bold text-green-600">₹{item.product_price}</td>
                                                <td className="px-3 py-2 text-[10px] font-semibold text-slate-700">{item.qty}</td>
                                                <td className="px-3 py-2 text-[10px] font-bold text-blue-600">₹{item.total}</td>
                                                <td className="px-3 py-2 text-[10px] text-slate-600">{item.date}</td>
                                                <td className="px-3 py-2">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.transaction_type === 'cash' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {item.transaction_type === 'cash' ? '💵 Cash' : '📋 Borrow'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCustomer(item);
                                                                setIsEditeModal(true);
                                                            }}
                                                            className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-700 transition-all"
                                                        >
                                                            <FaPen size={10} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setDeleteId(item.id);
                                                                setShowConfirmModal(true);
                                                            }}
                                                            className="p-2 bg-red-100 hover:bg-red-200 text-red-700 transition-all"
                                                        >
                                                            <FaTrashCan size={10} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="11" className="px-6 py-24 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="p-6 bg-slate-100 rounded-full mb-4">
                                                        <FaShoppingCart className="text-slate-400 text-5xl" />
                                                    </div>
                                                    <p className="text-xl font-bold text-slate-700 mb-2">No sales found</p>
                                                    <p className="text-sm text-slate-500">
                                                        {searchQuery ? 'Try adjusting your search filters' : 'No product sales recorded yet'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <EditCustomerCollectionModal
                isOpen={isEditeModal}
                onClose={() => setIsEditeModal(false)}
                productData={selectedCustomer}
                onUpdate={soldproductAllDataFetch}
            />

            {/* Delete Confirmation Modal */}
            {showConfirmModal && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
                    onClick={() => {
                        setShowConfirmModal(false);
                        setDeleteId(null);
                    }}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center mb-6">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                                <FaTrashCan className="text-red-600 text-3xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Confirm Deletion</h2>
                            <p className="text-slate-600">
                                Are you sure you want to delete this sale entry? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setDeleteId(null);
                                }}
                                className="flex-1 px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 font-semibold text-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleRemove(deleteId);
                                    setShowConfirmModal(false);
                                    setDeleteId(null);
                                }}
                                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold shadow-lg"
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

export default ProductCorrection;