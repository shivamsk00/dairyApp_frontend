

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
import EditCustomerCollectionModal from './EditCustomerCollection';

const CustomerCollection = () => {
    const fetchCustomerDetailsByAccount = useHomeStore(state => state.fetchCustomerDetailsByAccount);
    const fetchCategory = useHomeStore(state => state.fetchCategory);
    const fetchProductByCategoryId = useHomeStore(state => state.fetchProductByCategoryId);
    const productSaleSubmit = useHomeStore(state => state.productSaleSubmit);
    const allSoldProducts = useHomeStore(state => state.getAllSoldProducts);
    const getDeleteProducts = useHomeStore(state => state.getDeleteProducts);
    const allProductGet = useHomeStore(state => state.allProductGet);
    const addProductStock = useHomeStore(state => state.addProductStock);

    const [allProductCategory, setAllProductCategory] = useState([]);
    const [allProductList, setAllProductList] = useState([]);
    const today = new Date().toISOString().split('T')[0];
    const [allsoldproducts, setAllsoldproducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [deleteId, setDeleteId] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isEditeModal, setIsEditeModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Stock Update States
    const [showStockModal, setShowStockModal] = useState(false);
    const [stockToUpdate, setStockToUpdate] = useState({ product_id: '', name: '', quantity: '' });

    // Search/Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');

    const [form, setForm] = useState({
        account_number: '',
        transaction_type: '',
        name: '',
        careof: '',
        date: today,
    });

    // ✅ Multiple Products State
    const [products, setProducts] = useState([
        {
            category_id: '',
            product_id: '',
            product_price: '',
            qty: 0,
            total: '',
            allProducts: [],
            selectedProduct: null
        }
    ]);

    const [grandTotal, setGrandTotal] = useState(0);

    // Calculate grand total
    useEffect(() => {
        const total = products.reduce((sum, prod) => sum + (parseFloat(prod.total) || 0), 0);
        setGrandTotal(total);
    }, [products]);

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
    }, [isEditeModal]);

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

    // Handle customer form change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Handle product change
    const handleProductChange = async (index, field, value) => {
        const updatedProducts = [...products];

        if (field === 'category_id') {
            updatedProducts[index] = {
                ...updatedProducts[index],
                category_id: value,
                product_id: '',
                product_price: '',
                qty: 0,
                total: '',
                allProducts: []
            };

            if (value) {
                try {
                    const res = await fetchProductByCategoryId(value);
                    updatedProducts[index].allProducts = res.data;
                } catch (error) {
                    console.log("Error fetching products:", error);
                }
            }
        } else if (field === 'product_id') {
            updatedProducts[index].product_id = value;
            const selected = updatedProducts[index].allProducts.find(p => p.id == value);
            
            // Safe stock matching from allProductList which contains nested 'stocks' array
            let available_stock = 0;
            try {
                if (Array.isArray(allProductList)) {
                    const productWithStock = allProductList.find(p => p.id == value);
                    if (productWithStock && Array.isArray(productWithStock.stocks) && productWithStock.stocks.length > 0) {
                        // Use the quantity from the first stock entry as shown in your screenshot
                        available_stock = productWithStock.stocks[0].quantity || 0;
                    }
                }
            } catch (e) { console.error("Stock matching error", e); }

            updatedProducts[index].selectedProduct = selected ? {
                ...selected,
                available_stock: available_stock
            } : null;
            
            if (selected) {
                const newPrice = selected.price;
                const qty = updatedProducts[index].qty || 0;
                updatedProducts[index].product_price = newPrice;
                updatedProducts[index].total = qty * newPrice;
            }
        } else if (field === 'qty') {
            const qty = parseFloat(value) || 0;
            if (qty < 0) return;
            const price = parseFloat(updatedProducts[index].product_price) || 0;
            updatedProducts[index].qty = qty;
            updatedProducts[index].total = (qty * price).toFixed(2);
        } else if (field === 'product_price') {
            const price = parseFloat(value) || 0;
            if (price < 0) return;
            const qty = parseFloat(updatedProducts[index].qty) || 0;
            updatedProducts[index].product_price = value;
            updatedProducts[index].total = (qty * price).toFixed(2);
        } else {
            updatedProducts[index][field] = value;
        }

        setProducts(updatedProducts);
    };

    // Add product row
    const addProductRow = () => {
        setProducts([...products, {
            category_id: '',
            product_id: '',
            product_price: '',
            qty: 0,
            total: '',
            allProducts: [],
            selectedProduct: null
        }]);
    };

    // Remove product row
    const removeProductRow = (index) => {
        if (products.length > 1) {
            const updatedProducts = products.filter((_, i) => i !== index);
            setProducts(updatedProducts);
        } else {
            CustomToast.warning("At least one product is required");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (form.account_number.trim()) {
                fetchCustomerDetailByAccountNumber(form.account_number);
            }
        }
    };

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

    const fetchCustomerDetailByAccountNumber = async (accountNo) => {
        try {
            const res = await fetchCustomerDetailsByAccount(accountNo);
            if (res.status_code == 200) {
                CustomToast.success(res.message);
                setForm((prev) => ({
                    ...prev,
                    name: res.data.name || '',
                    careof: res.data.careof || '',
                }));
            } else {
                CustomToast.error(res.message);
                setForm((prev) => ({
                    ...prev,
                    name: '',
                    careof: '',
                }));
            }
        } catch (error) {
            console.error('Error fetching customer details:', error);
        }
    };

    const fetchAllProductCategory = async () => {
        try {
            const res = await fetchCategory();
            setAllProductCategory(res.data.data);
        } catch (error) {
            console.log("ERROR IN FETCHING CATEGORY", error);
        }
    };

    const fetchAllProducts = async () => {
        try {
            const res = await allProductGet();
            if (res.status_code == 200) {
                // Ensure we have an array, handle different potential response structures
                const productsArray = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setAllProductList(productsArray);
            }
        } catch (error) {
            console.error("Error fetching all products:", error);
        }
    };

    useEffect(() => {
        fetchAllProductCategory();
        fetchAllProducts();
    }, []);

    // ✅ Sync selectedProduct in sidebar when allProductList updates
    useEffect(() => {
        if (allProductList.length > 0) {
            setProducts(prevProducts => prevProducts.map(p => {
                if (p.product_id && p.selectedProduct) {
                    const latestProductData = allProductList.find(item => item.id == p.product_id);
                    if (latestProductData && Array.isArray(latestProductData.stocks) && latestProductData.stocks.length > 0) {
                        return {
                            ...p,
                            selectedProduct: {
                                ...p.selectedProduct,
                                available_stock: latestProductData.stocks[0].quantity || 0
                            }
                        };
                    }
                }
                return p;
            }));
        }
    }, [allProductList]);

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
        XLSX.writeFile(workbook, 'customer_collection_report.xlsx');
        toast.success("Report exported successfully");
    };



    //////////////    Submit Function  ///////////////
    const handleSubmitProduct = async (e) => {
        e.preventDefault();

        // Validate products
        const invalidProduct = products.find(p =>
            !p.category_id || !p.product_id || !p.qty || p.qty <= 0
        );

        if (invalidProduct) {
            CustomToast.error("Please fill all product details");
            return;
        }

        if (!form.account_number || !form.transaction_type) {
            CustomToast.error("Please select transaction type");
            return;
        }

        const customerCollectionData = {
            customer_account_number: form.account_number,
            date: form.date,
            transaction_type: form.transaction_type,
            products: products.map(p => ({
                category_id: parseInt(p.category_id),
                product_id: parseInt(p.product_id),
                product_price: parseFloat(p.product_price),
                qty: parseFloat(p.qty),
                total: parseFloat(p.total)
            }))
        };

        console.log('📤 Submitting Data:', customerCollectionData);

        try {
            const res = await productSaleSubmit(customerCollectionData);
            console.log('✅ Response:', res);

            // ✅ Fixed: Check if response exists first
            if (res && res.status_code === 200) {
                CustomToast.success(res.message);

                // Reset form
                setForm({
                    account_number: '',
                    name: '',
                    careof: '',
                    date: today,
                    transaction_type: ''
                });

                setProducts([{
                    category_id: '',
                    product_id: '',
                    product_price: '',
                    qty: 0,
                    total: '',
                    allProducts: []
                }]);

                await soldproductAllDataFetch();
                await fetchAllProducts(); // Instant stock refresh after sale
            } else {
                CustomToast.error(res?.message || 'Failed to submit sale');
            }
        } catch (error) {
            console.error("❌ Submit Error:", error);

            // Better error handling
            if (error.response) {
                // Server responded with error
                CustomToast.error(error.response.data?.message || `Error: ${error.response.status}`);
            } else if (error.request) {
                // Request made but no response
                CustomToast.error("Server not responding. Please check your connection.");
            } else {
                // Other errors
                CustomToast.error("Failed to submit sale");
            }
        }
    };

    const handleUpdateStock = async () => {
        if (!stockToUpdate.quantity || stockToUpdate.quantity <= 0) {
            toast.warning("Please enter a valid quantity");
            return;
        }

        try {
            const res = await addProductStock({
                product_id: stockToUpdate.product_id,
                quantity: stockToUpdate.quantity,
                date: today,
                stock_type: 'IN'
            });

            if (res.status_code === 200) {
                toast.success("Stock updated successfully");
                setShowStockModal(false);
                setStockToUpdate({ product_id: '', name: '', quantity: '' });
                await fetchAllProducts(); // Refresh stocks
            } else {
                toast.error(res.message || "Failed to update stock");
            }
        } catch (error) {
            console.error("Stock Update Error:", error);
            toast.error("Failed to update stock");
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-8xl mx-auto">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600  shadow-lg">
                            <FaShoppingCart className="text-white text-xl" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-xl font-bold text-slate-800">Product Sales</h1>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Compact Form Section */}
                    <div className="flex-1">
                        <form onSubmit={handleSubmitProduct} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 mb-4">
                    {/* Form Header */}
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-200">
                        <HiDocumentText className="text-indigo-600 text-lg" />
                        <h2 className="text-lg font-bold text-slate-800">New Sale Entry</h2>
                    </div>

                    {/* Customer Information - Compact Grid */}
                    <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <FaUser className="text-indigo-600 text-sm" />
                            <h3 className="text-sm font-semibold text-slate-700">Customer Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Account Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="account_number"
                                    value={form.account_number}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                                    placeholder="Enter account"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
                                <input
                                    name="name"
                                    value={form.name}
                                    readOnly
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-slate-50 text-slate-600"
                                    placeholder="Auto-filled"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Care Of</label>
                                <input
                                    name="careof"
                                    value={form.careof}
                                    readOnly
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-slate-50 text-slate-600"
                                    placeholder="Auto-filled"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    max={today}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Transaction Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="transaction_type"
                                    value={form.transaction_type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                                >
                                    <option value="">Select Type</option>
                                    <option value="cash">💵 Cash</option>
                                    <option value="borrow">📋 Borrow</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Products Section - Compact */}
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <FaBoxOpen className="text-indigo-600 text-sm" />
                                <h3 className="text-sm font-semibold text-slate-700">Product Details</h3>
                            </div>
                            <button
                                type="button"
                                onClick={addProductRow}
                                className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg font-semibold shadow transition-all"
                            >
                                <FaPlus size={12} />
                                Add More Product
                            </button>
                        </div>

                        <div className="space-y-2">
                            {products.map((product, index) => (
                                <div key={index} className="p-2 bg-slate-50 rounded-lg border border-slate-200 relative">
                                    {products.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeProductRow(index)}
                                            className="absolute -top-1 -right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all"
                                        >
                                            <FaTrash size={10} />
                                        </button>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Category <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={product.category_id}
                                                onChange={(e) => handleProductChange(index, 'category_id', e.target.value)}
                                                disabled={allProductCategory.length === 0}
                                                className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none disabled:bg-slate-100"
                                            >
                                                <option value="">{allProductCategory.length === 0 ? 'Loading Categories...' : 'Select Category'}</option>
                                                {allProductCategory.map((cate) => (
                                                    <option key={cate.id} value={cate.id}>{cate.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Product <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={product.product_id}
                                                onChange={(e) => handleProductChange(index, 'product_id', e.target.value)}
                                                className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
                                            >
                                                <option value="">Select Product</option>
                                                {product.allProducts.map((prod) => (
                                                    <option key={prod.id} value={prod.id}>{prod.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Price</label>
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">₹</span>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={product.product_price}
                                                    onChange={(e) => handleProductChange(index, 'product_price', e.target.value)}
                                                    className="w-full pl-5 pr-2 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-600 font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Quantity <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="any"
                                                value={product.qty}
                                                onChange={(e) => handleProductChange(index, 'qty', e.target.value)}
                                                onKeyDown={(e) => {
                                                    // Prevent minus key
                                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Total</label>
                                            <input
                                                value={`₹ ${product.total || '0.00'}`}
                                                readOnly
                                                className="w-full px-2 py-1.5 text-xs rounded-md border border-indigo-300 bg-indigo-50 text-indigo-700 font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Compact Grand Total */}
                        <div className="mt-2 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-700">Grand Total:</span>
                                <span className="text-lg font-bold text-indigo-600">₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Compact Submit Button */}
                    <button
                        type="submit"
                        disabled={!form.account_number || !form.transaction_type}
                        className={`w-full py-2 text-sm rounded-lg font-bold shadow-md transition-all ${form.account_number && form.transaction_type
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                            Submit Sale Entry
                        </button>
                    </form>
                </div>

                {/* Right Side - Product Stock Info */}
                <div className="lg:w-80">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sticky top-4 h-fit max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                            <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600">
                                <FaBoxOpen size={18} />
                            </div>
                            <h3 className="font-bold text-slate-800">Product Info & Stock</h3>
                        </div>

                        <div className="space-y-4">
                            {products.filter(p => p.selectedProduct).length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                                        <FaSearch className="text-slate-300 text-2xl" />
                                    </div>
                                    <p className="text-sm text-slate-500">Select a product to view its current stock details</p>
                                </div>
                            ) : (
                                products.map((p, idx) => p.selectedProduct && (
                                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-right-2 duration-300">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">Item {idx + 1}</span>
                                            
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm mb-2">{p.selectedProduct.name}</h4>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm min-h-[50px] flex flex-col justify-center relative group">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Available Stock</p>
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-base font-black ${Number(p.selectedProduct.available_stock || 0) <= 5 ? 'text-red-600' : 'text-emerald-600'} !text-opacity-100`}>
                                                        {p.selectedProduct.available_stock ?? '0'}
                                                    </p>
                                                    <button 
                                                        onClick={() => {
                                                            setStockToUpdate({ product_id: p.selectedProduct.id, name: p.selectedProduct.name, quantity: '' });
                                                            setShowStockModal(true);
                                                        }}
                                                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                        title="Quick Update Stock"
                                                    >
                                                        <FaPlus size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Price</p>
                                                <p className="text-sm font-black text-indigo-600">₹{p.selectedProduct.price}</p>
                                            </div>
                                        </div>

                                        {p.qty > 0 && (
                                            <div className="mt-2 pt-2 border-t border-slate-200">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-500">After Sale Stock:</span>
                                                    <span className={`font-bold ${(p.selectedProduct.available_stock - p.qty) < 0 ? 'text-red-600' : 'text-slate-700'}`}>
                                                        {(p.selectedProduct.available_stock - p.qty).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-200">
                    <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                                    <HiDocumentText className="text-white text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Sales History</h2>
                                    <p className="text-[10px] text-slate-600">Total: {filteredProducts.length} entries</p>
                                </div>
                            </div>
                            <button
                                onClick={exportToExcel}
                                className="flex items-center gap-2 px-4 py-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm  font-semibold shadow-lg"
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
                                className="px-4 py-3  border-2 border-slate-200 focus:border-indigo-500 outline-none transition-all bg-white"
                            >
                                <option value="all">All Fields</option>
                                <option value="name">Customer Name</option>
                                <option value="account">Account Number</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
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
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.transaction_type === 'cash' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                        }`}>
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
                                                            className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-700  transition-all"
                                                        >
                                                            <FaPen size={10} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setDeleteId(item.id);
                                                                setShowConfirmModal(true);
                                                            }}
                                                            className="p-2 bg-red-100 hover:bg-red-200 text-red-700  transition-all"
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
                                                        {searchQuery ? 'Try adjusting your search filters' : 'Start by adding a new sale entry above'}
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
            {isEditeModal && (
                <EditCustomerCollectionModal
                    isOpen={isEditeModal}
                    onClose={() => setIsEditeModal(false)}
                    productData={selectedCustomer}
                />
            )}

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
        {/* Quick Stock Update Modal */}
        {showStockModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                        <h3 className="font-bold flex items-center gap-2">
                            <FaBoxOpen /> Quick Stock Update
                        </h3>
                        <p className="text-indigo-100 text-[10px] mt-1">{stockToUpdate.name}</p>
                    </div>
                    <div className="p-6">
                        <label className="block text-xs font-semibold text-slate-700 mb-2">Quantity to Add (IN)</label>
                        <input
                            type="number"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-lg font-bold"
                            placeholder="Enter quantity"
                            value={stockToUpdate.quantity}
                            onChange={(e) => setStockToUpdate({ ...stockToUpdate, quantity: e.target.value })}
                            autoFocus
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowStockModal(false)}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateStock}
                                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all"
                            >
                                Update Stock
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <EditCustomerCollectionModal
            isOpen={isEditeModal}
            onClose={() => setIsEditeModal(false)}
            customerData={selectedCustomer}
            onUpdate={soldproductAllDataFetch}
        />
        </div>
    );
};

export default CustomerCollection;
