import React, { useEffect, useState } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import DateFormate from '../../helper/DateFormate';

const CustomerCollection = () => {
    const fetchCustomerDetailsByAccount = useHomeStore(state => state.fetchCustomerDetailsByAccount);
    const fetchCategory = useHomeStore(state => state.fetchCategory)
    const fetchProductByCategoryId = useHomeStore(state => state.fetchProductByCategoryId)
    const productSaleSubmit = useHomeStore(state => state.productSaleSubmit)
    const [allProductCategory, setAllProductCategory] = useState([])
    const [allProducts, setAllProducts] = useState([])
    const today = new Date().toISOString().split('T')[0];

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

    // // FETCH CATEGORY 

    // const fetchProductBycategoryId = async () => {
    //     try {
    //         const res = await fetchProductByCategoryId()
    //         console.log("fetch all category ===>", res)
    //         setAllProductCatgory(res.data.data)
    //     } catch (error) {
    //         console.log("ERROR IN FETCHING CATGORY", error)

    //     }
    // }

    // useEffect(() => {
    //     fetchAllProductCategory()
    // }, [])


    const handleSubmitProduct = async (e) => {
        e.preventDefault()
        const customerCollectionData = {
            customer_account_number: form.account_number,
            name: form.name,
            date: DateFormate(form.date),
            category_id: form.category_id,
            product_id: form.product_id,
            product_price: form.product_price,
            qty: form.qty,
            total: form.total
        }


        try {

            const res = await productSaleSubmit(customerCollectionData);
            if (res.status_code == 200) {

                console.log("product sale submited successfully", res)
                CustomToast.success(res.message)
                setForm(
                    {
                        account_number: '',
                        name: '',
                        careof: '',
                        date: today,
                        category_id: '',
                        product_id: '',
                        product_price: '',
                        qty: 0,
                        total: ''
                    }

                )

                setAllProducts([])
            }else{
                 CustomToast.error(res.message,"bottom-center")
            }


        } catch (error) {

        }

    }






    return (
        <div className="flex flex-col lg:flex-row gap-6 p-6">
            {/* Left Form */}
            <form onSubmit={handleSubmitProduct} className="bg-gray-800 p-6 rounded shadow-xl w-full lg:w-1/2 flex flex-col gap-4 ">

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
                    disabled={form.account_number == '' ? true: false}
                    className={form.account_number == '' ?  `mt-6 w-24 text-white py-1 rounded bg-gray-400 opacity-60 cursor-not-allowed`: `mt-6 w-24 text-white py-1 rounded bg-blue-600 cursor-pointer`}
                />
            </form>

            {/* Right Info Panel */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4 border p-3 bg-gray-800 rounded-md">
                {/* Date Filter */}
                <div className="flex flex-wrap gap-4 items-center">
                    <input type="date" className="border px-3 w-1/4 py-1 rounded" placeholder="From" />
                    <input type="date" className="border  px-3 w-1/4  py-1 rounded" placeholder="To" />
                    <button className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-700">Search</button>
                </div>

                {/* Purchase Summary */}
                <div className="bg-gray-300 p-4 rounded shadow-xl mt-2 flex-1">
                    {/* Header Info */}
                    <div className="mb-4">
                        <p className="font-semibold mb-1">Account No: 12345</p>
                        <p className="font-semibold mb-1">Name: Shivam</p>
                    </div>

                    {/* Product Table */}
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

                    {/* Summary */}
                    <div className="flex flex-col items-end mt-4 text-sm">
                        <p className="font-semibold">Total Purchased Items: 3</p>
                        <p className="font-semibold text-lg">Total Price: ₹1300</p>
                    </div>
                </div>

                {/* Export/Share Buttons */}
                <div className="flex justify-end gap-4 mt-4">
                    <button className="bg-yellow-500 text-white px-4 py-2 rounded shadow-lg hover:bg-yellow-600">Export Excel</button>
                    <button className="bg-green-500 text-white px-4 py-2 rounded shadow-lg hover:bg-green-600">Share WhatsApp</button>
                </div>
            </div>
        </div>
    );
};

export default CustomerCollection;
