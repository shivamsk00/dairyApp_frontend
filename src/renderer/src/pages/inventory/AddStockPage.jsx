


import React, { useEffect, useState } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import CommonBackButton from '../../components/CommonBackButton';
import { goBack } from '../../helper/navigation';

const AddStockPage = () => {
    const allProductGet = useHomeStore(state => state.allProductGet);
    const addProductStock = useHomeStore(state => state.addProductStock);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        product_id: '',
        stock_type: '',
        quantity: '',
        date: '',
    });

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const getAllProductData = async () => {
        try {
            const res = await allProductGet();
            if (res.status_code == 200) {
                setCategories(res.data.data); // Assuming array in res.data.data
                console.log("Fetched All product get ", res.data.data);
            } else {
                CustomToast.error(res.message);
            }
        } catch (error) {
            console.log("ERROR IN FETCH CATEGORY IN ADD PRODUCT PAGE", error);
        }
    };

    useEffect(() => {
        getAllProductData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const productData = {
            "product_id": formData.product_id,
            "stock_type": formData.stock_type,
            "quantity": formData.quantity,
            "date": formData.date
        }

        try {
            const res = await addProductStock(productData);
            if (res.status_code == 200) {
                CustomToast.success(res.message);

                goBack()
                setFormData({
                    product_id: '',
                    stock_type: '',
                    quantity: '',
                    date: '',
                })
            } else {

                CustomToast.error(res.message);
            }
        } catch (error) {
            console.log("ERROR IN SAVE PRODUCT ", error)
        }

        // API call here
    };


    return (
        <>

            <div className="w-full px-4 md:px-6 py-3 text-left">
                <CommonBackButton heading="Add Product Stock" />
            </div>
            <div className="w-full px-4 md:px-6 lg:w-1/2 mx-auto py-6 shadow-xl m-3 rounded-lg bg-slate-700">
                <h2 className="text-2xl font-bold mb-6 text-white">Add Product Stock</h2>

                <form onSubmit={handleSubmit} className="space-y-6 w-full">
                    {/* Row 1: Category and Product Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium text-white">Product Name</label>
                            <select
                                name="product_id"
                                value={formData.product_id}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            >
                                <option value="">Select Product</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-white">Stock Quantity</label>
                            <input
                                type="text"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Row 2: Product Unit and Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium text-white">Stock IN/OUT</label>
                            <div className="flex">
                                <select
                                    name="stock_type"
                                    value={formData.stock_type}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                >
                                    <option value="">Select Unit</option>
                                    <option value="IN">IN</option>
                                    <option value="OUT">OUT</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-white">Entry Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                max={new Date().toISOString().split("T")[0]} // 👈 Prevent future date
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-6 py-2 rounded transition"
                        >
                            Add Product
                        </button>
                    </div>
                </form>
            </div>
        </>

    );
};

export default AddStockPage;
