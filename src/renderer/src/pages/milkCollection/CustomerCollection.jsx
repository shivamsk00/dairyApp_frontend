import React, { useEffect, useState } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';

const CustomerCollection = () => {
    const fetchCustomerDetailsByAccount = useHomeStore(state => state.fetchCustomerDetailsByAccount);


    const [form, setForm] = useState({
        account_number: '',
        name: '',
        spouse: '',
        product: '',
        ghee: '',
        pricePerUnit: '',
        quantity: '',
        price: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
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






    return (
        <div className="flex flex-col lg:flex-row gap-6 p-6">
            {/* Left Form */}
            <form className="bg-gray-800 p-6 rounded shadow-xl w-full lg:w-1/2 flex flex-col gap-4 ">
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
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-white">Spouse</label>
                        <input
                            name="careof"
                            value={form.careof}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-white">Product</label>
                        <select
                            name="product"
                            value={form.product}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 bg-white  w-full"
                        >
                            <option value="">Select Product</option>
                            <option value="Ghee">Ghee</option>
                            <option value="Paneer">Gatta</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-white">Ghee</label>
                        <input
                            name="ghee"
                            value={form.ghee}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-white">Price (Ltr/Gm)</label>
                        <input
                            name="pricePerUnit"
                            value={form.pricePerUnit}
                            onChange={handleChange}
                            type="number"
                            className="border rounded px-3 py-2  w-full"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-white">Quantity</label>
                        <input
                            name="quantity"
                            value={form.quantity}
                            onChange={handleChange}
                            type="number"
                            className="border rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-white">Price</label>
                        <input
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            type="number"
                            className="border rounded px-3 py-2  w-full"
                        />
                    </div>
                </div>

                <input
                    type="submit"
                    value="Submit"
                    className="mt-6 w-24 text-white py-1 rounded bg-blue-600 cursor-pointer"
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
