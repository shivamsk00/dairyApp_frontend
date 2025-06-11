import React, { useEffect, useState } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import DateFormate from '../../helper/DateFormate';
import Preloading from '../../components/Preloading';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import CommonHeader from '../../components/CommonHeader';
import { TfiExport } from 'react-icons/tfi';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
const CustomerCollection = () => {
    const fetchCustomerDetailsByAccount = useHomeStore(state => state.fetchCustomerDetailsByAccount);
    const fetchCategory = useHomeStore(state => state.fetchCategory)
    const fetchProductByCategoryId = useHomeStore(state => state.fetchProductByCategoryId)
    const productSaleSubmit = useHomeStore(state => state.productSaleSubmit)
    const allSoldProducts = useHomeStore(state => state.getAllSoldProducts)
    const [allProductCategory, setAllProductCategory] = useState([])
    const [allProducts, setAllProducts] = useState([])
    const today = new Date().toISOString().split('T')[0];
    const [allsoldproducts, setAllsoldproducts] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [maxPageButtons, setMaxPageButtons] = useState(5);
    const [loading, setLoading] = useState(false)


    // Sold Products Api Response
    const soldproductAllDataFetch = async (page = 1) => {
        try {
            setLoading(true)
            const res = await allSoldProducts(page);
            console.log("fetch all sold products ", res)
            if (res.status_code == 200) {
                setAllsoldproducts(res.data.data)
                // setCollections(res.data.data);
                setCurrentPage(res.data.current_page);
                setTotalPages(res.data.last_page);
                setLoading(false)
            } else {
                console.log("response errro", res)
                setLoading(false)
            }

        } catch (error) {
            console.log("ERROR IN FETCH ALL SOLD PRODUCT ", error)
            setLoading(false)

        } finally {

            setLoading(false)
        }



    }

    useEffect(() => {
        soldproductAllDataFetch()
    }, [])



    const [form, setForm] = useState({
        account_number: '',
        name: '',
        careof: '',
        date: today,
        category_id: '',
        product_id: '',
        product_price: '',
        qty: 0,
        total: ''
    });

    const handleChange = async (e) => {
        const { name, value } = e.target;

        if (name === 'category_id') {
            setForm(prev => ({
                ...prev,
                category_id: value,
                product_id: '',
                product_price: '',
                qty: '',
                total: ''
            }));

            if (value) {
                try {
                    const res = await fetchProductByCategoryId(value);
                    setAllProducts(res.data);
                    console.log("fetch product details===>", res.data)
                } catch (error) {
                    console.log("Error fetching products:", error);
                }
            } else {
                setAllProducts([]);
            }

        } else if (name === 'product_id') {
            setForm(prev => ({
                ...prev,
                product_id: value
            }));

            const selected = allProducts.find(p => p.id == value);
            if (selected) {
                const newPrice = selected.price;
                const newQty = form.qty || 0;
                const newTotal = newPrice * newQty;

                setForm(prev => ({
                    ...prev,
                    product_price: newPrice,
                    total: newTotal
                }));
            }

        } else if (name === 'qty') {
            const newQty = parseFloat(value) || '';
            const price = parseFloat(form.product_price) || 0;
            const newTotal = newQty * price;

            setForm(prev => ({
                ...prev,
                qty: newQty,
                total: newTotal
            }));

        } else {
            setForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };


    useEffect(() => {
        const timeout = setTimeout(() => {
            if (form.account_number) {
                fetchCustomerDetailByAccountNumber(form.account_number);
            } else {
                setForm((prev) => ({
                    ...prev,
                    name: '',
                    careof: '',
                    mobile: '',
                }));
            }
        }, 500); // wait 500ms after user stops typing

        return () => clearTimeout(timeout); // cleanup on next input
    }, [form.account_number]);



    // FETCH ALL CUSTOMER
    const fetchCustomerDetailByAccountNumber = async (accountNo) => {
        // console.log('Fetching customer details for:', accountNo);
        try {
            const res = await fetchCustomerDetailsByAccount(accountNo); // Your zustand API call
            console.log('Customer response:', res);
            if (res.status_code == 200) {
                CustomToast.success(res.message)
                setForm((prev) => ({
                    ...prev,
                    name: res.data.name || '',
                    careof: res.data.careof || '',
                    mobile: res.data.mobile || '',
                }));
            } else {

                CustomToast.error(res.message)
                setForm((prev) => ({
                    ...prev,
                    name: '',
                    careof: '',
                    mobile: '',
                }));
            }
        } catch (error) {
            console.error('Error fetching customer details:', error);
            setForm((prev) => ({
                ...prev,
                name: '',
                careof: '',
                mobile: '',
            }));
        }
    };


    useEffect(() => {
        fetchAllProductCategory()
    }, [])

    const fetchAllProductCategory = async () => {
        try {
            const res = await fetchCategory()
            setAllProductCategory(res.data.data)
        } catch (error) {
            console.log("ERROR IN FETCHING CATEGORY", error)
        }
    }

    // Export to Excel
    const exportToExcel = () => {
        if (!allsoldproducts?.length) {
            toast.warning("No data to export");
            return;
        }

        console.log("allsoldproducts", allsoldproducts)
        const dataToExport = allsoldproducts.map(entry => ({
            Acc_No: entry.customer.account_number,
            Name: entry.customer.name,
            Careof: entry.customer.careof,
            Date: entry.date,
            Category: entry.category_id,
            Ptoduct: entry.product_id,
            Product_price: entry.product_price,
            Quantity: entry.qty,
            Total: entry.total,
        }));

        console.log("dataToExport===>", dataToExport)
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Collection Report');
        XLSX.writeFile(workbook, 'customer_collection_report.xlsx');
        toast.success("Report exported successfully");
    };


    const handleSubmitProduct = async (e) => {
        e.preventDefault();

        const customerCollectionData = {
            customer_account_number: form.account_number,
            name: form.name,
            date: DateFormate(form.date),
            category_id: form.category_id,
            product_id: form.product_id,
            product_price: form.product_price,
            qty: form.qty,
            total: form.total
        };

        try {
            const res = await productSaleSubmit(customerCollectionData);
            if (res.status_code === 200) {
                CustomToast.success(res.message);

                // Reset form
                setForm({
                    account_number: '',
                    name: '',
                    careof: '',
                    date: today,
                    category_id: '',
                    product_id: '',
                    product_price: '',
                    qty: 0,
                    total: ''
                });

                // Clear the product list
                setAllProducts([]);

                // 🔁 Update the sold products table immediately
                await soldproductAllDataFetch();
            } else {
                CustomToast.error(res.message, "bottom-center");
            }
        } catch (error) {
            console.error("Error submitting product sale:", error);
            CustomToast.error("Something went wrong while submitting!");
        }
    };




    // BUTTONS RENDERS FOR PAGINATION
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
                    onClick={() => soldproductAllDataFetch(1)}
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
                    onClick={() => soldproductAllDataFetch(i)}
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
                    onClick={() => soldproductAllDataFetch(totalPages)}
                >
                    {totalPages}
                </button>
            );
        }

        return (
            <div className="flex gap-1 flex-wrap justify-start p-3 mt-4 w-full">
                {/* Previous Button */}
                <button
                    className="px-3 py-1 border rounded text-sm text-white bg-gray-500 hover:bg-gray-600 disabled:opacity-50"
                    onClick={() => soldproductAllDataFetch(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <MdArrowBackIos size={18} />
                </button>

                {pages}

                {/* Next Button */}
                <button
                    className="px-3 py-1 border rounded text-sm text-white bg-gray-500 hover:bg-gray-600 disabled:opacity-50"
                    onClick={() => soldproductAllDataFetch(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <MdArrowForwardIos size={18} />
                </button>
            </div>
        );
    };






    return (
        <>

            <CommonHeader heading={"Products Sold"} />
            <div className="flex flex-col lg:flex-row gap-6 p-6">
                {/* Left Form */}
                <form onSubmit={handleSubmitProduct} className="bg-gray-800 p-6 rounded shadow-xl w-full h-1/2 lg:w-1/2 flex flex-col gap-4 ">

                    {/* DATE INPUT */}
                    <div className="">
                        {/* <label className="font-semibold text-white">Date:</label> */}

                        <input
                            type="date"
                            value={form.date}
                            name="date"
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]} // max = today
                            className="px-3 w-52 py-1 rounded border border-gray-400 text-gray-700 bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-white">Account No</label>
                            <input
                                name="account_number"
                                value={form.account_number}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 bg-white  w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-white">Name</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 bg-white  w-full"
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-white">Care of</label>
                            <input
                                name="careof"
                                value={form.careof}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 w-full"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-white">Category</label>

                            <select
                                name="category_id"
                                value={form.category_id}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 bg-white  w-full"

                            >
                                <option value="">Select Category</option>
                                {allProductCategory.map((cate) => (
                                    <option key={cate.id} value={cate.id}>{cate.name}</option>
                                ))}
                            </select>
                        </div>

                    </div>




                    <div className="grid grid-cols-2 gap-4">

                        {/* Product id */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-white">Product</label>



                            <select
                                name="product_id"
                                value={form.product_id}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 bg-white  w-full"

                            >
                                <option value="">Select Product</option>
                                {allProducts.map((prod) => (
                                    <option key={prod.id} value={prod.id}>{prod.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-white">Price</label>
                            <input
                                name="product_price"
                                value={form.product_price}
                                onChange={handleChange}
                                type="text"
                                readOnly
                                className="border rounded px-3 py-2  w-full"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-white">Quantity</label>
                            <input
                                name="qty"
                                value={form.qty}
                                onChange={handleChange}
                                type="number"
                                className="border rounded px-3 py-2 w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-white">Total Price</label>
                            <input
                                name="total"
                                value={form.total}
                                onChange={handleChange}
                                type="number"
                                className="border rounded px-3 py-2  w-full"
                                readOnly
                            />
                        </div>
                    </div>

                    <input
                        type="submit"
                        value="Submit"
                        disabled={form.account_number == '' ? true : false}
                        className={form.account_number == '' ? `mt-6 w-24 text-white py-1 rounded bg-gray-400 opacity-60 cursor-not-allowed` : `mt-6 w-24 text-white py-1 rounded bg-blue-600 cursor-pointer`}
                    />
                </form>

                {/* Right Info Panel */}
                {/* <div className="w-full lg:w-1/2 flex flex-col gap-4 border p-3 bg-gray-800 rounded-md">
                Date Filter
                <div className="flex flex-wrap gap-4 items-center">
                    <input type="date" className="border px-3 w-1/4 py-1 rounded" placeholder="From" />
                    <input type="date" className="border  px-3 w-1/4  py-1 rounded" placeholder="To" />
                    <button className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-700">Search</button>
                </div>

                Purchase Summary
                <div className="bg-gray-300 p-4 rounded shadow-xl mt-2 flex-1">
                    Header Info
                    <div className="mb-4">
                        <p className="font-semibold mb-1">Account No: 12345</p>
                        <p className="font-semibold mb-1">Name: Shivam</p>
                    </div>

                    Product Table
                    <table className="w-full text-left border border-gray-400 bg-white rounded overflow-hidden">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="py-2 px-3 border-b border-gray-400">Item</th>
                                <th className="py-2 px-3 border-b border-gray-400">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-2 px-3 border-b border-gray-300">Ghee</td>
                                <td className="py-2 px-3 border-b border-gray-300">2 L</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-3 border-b border-gray-300">Paneer</td>
                                <td className="py-2 px-3 border-b border-gray-300">1 Kg</td>
                            </tr>
                        </tbody>
                    </table>

                    Summary
                    <div className="flex flex-col items-end mt-4 text-sm">
                        <p className="font-semibold">Total Purchased Items: 3</p>
                        <p className="font-semibold text-lg">Total Price: ₹1300</p>
                    </div>
                </div>

                Export/Share Buttons
                <div className="flex justify-end gap-4 mt-4">
                    <button className="bg-yellow-500 text-white px-4 py-2 rounded shadow-lg hover:bg-yellow-600">Export Excel</button>
                    <button className="bg-green-500 text-white px-4 py-2 rounded shadow-lg hover:bg-green-600">Share WhatsApp</button>
                </div>
            </div> */}

                {/* Bottom Table */}
                <div className=" w-full border">
                    {/* Export/Share Buttons */}


                    {/* <h3 className="text-2xl font-bold text-gray-700 mb-4 text-center">All Sold Products</h3> */}

                    <div className="overflow-x-auto rounded-xl shadow-lg">
                        <div className="flex justify-start bg-slate-800 p-3">
                            <button onClick={exportToExcel} className="bg-orange-500 flex items-center justify-center gap-3 text-white px-5 py-2 rounded shadow-md hover:bg-yellow-600 transition">
                                <TfiExport /> Export Excel
                            </button>
                        </div>
                        <table className="min-w-full border border-gray-300 text-sm bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
                            <thead className="bg-gradient-to-r from-yellow-400 to-yellow-200 text-white">
                                <tr>
                                    {['Sr No.', 'Acc No.', 'Customer', 'Product', 'Category', 'Price', 'Qty', 'Total', 'Unit', 'Date',].map((header) => (
                                        <th key={header} className="border px-4 py-3 text-sm text-black  font-bold tracking-wide text-center uppercase">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            {
                                loading ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan={10} className="py-10 text-center">
                                                <Preloading />
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    <tbody className='w-full'>
                                        {
                                            allsoldproducts.map((item, i) => (
                                                <tr key={i} className="hover:bg-yellow-50 transition-all duration-300">
                                                    <td className="border px-4 py-2 text-center font-medium">{i + 1}</td>
                                                    <td className="border px-4 py-2 text-center text-indigo-700 font-medium">{item.customer_account_number || '-'}</td>
                                                    <td className="border px-4 py-2 text-center text-indigo-700 font-medium">{item.customer?.name || '-'}</td>
                                                    <td className="border px-4 py-2 text-center">{item.product?.name || '-'}</td>
                                                    <td className="border px-4 py-2 text-center">{item.category?.name || '-'}</td>
                                                    <td className="border px-4 py-2 text-center text-green-700 font-semibold">₹{item.product_price}</td>
                                                    <td className="border px-4 py-2 text-center">{item.qty}</td>
                                                    <td className="border px-4 py-2 text-center text-blue-700 font-bold">₹{item.total}</td>
                                                    <td className="border px-4 py-2 text-center">{item.product?.unit || '-'}</td>
                                                    <td className="border px-4 py-2 text-center text-sm text-gray-600">{item.date}</td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                )
                            }
                        </table>

                        {/* Pagination Controls */}
                        {renderPageButtons()}
                    </div>
                </div>



            </div>
        </>
    );
};

export default CustomerCollection;
