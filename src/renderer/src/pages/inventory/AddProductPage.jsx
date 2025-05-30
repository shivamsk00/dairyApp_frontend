import React, { useEffect, useState } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import CommonBackButton from '../../components/CommonBackButton';

const AddProductPage = () => {
    const fetchCategory = useHomeStore(state => state.fetchCategory);
    const addProduct = useHomeStore(state => state.addProduct);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        category: '',
        name: '',
        unitValue: '',
        unitType: '',
        price: '',
    });

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const getAllCategory = async () => {
        try {
            const res = await fetchCategory();
            if (res.status_code == 200) {
                setCategories(res.data.data); // Assuming array in res.data.data
                console.log("Fetched categories", res.data.data);
            } else {
                CustomToast.error(res.message);
            }
        } catch (error) {
            console.log("ERROR IN FETCH CATEGORY IN ADD PRODUCT PAGE", error);
        }
    };

    useEffect(() => {
        getAllCategory();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const combinedUnit = `${formData.unitValue} ${formData.unitType}`;
        const finalData = { ...formData, unit: combinedUnit };

        const productData = {
            "category_id": finalData.category,
            "name": finalData.name,
            "unit": finalData.unit,
            "price": finalData.price
        }

        try {
            const res = await addProduct(productData);
            if (res.status_code == 200) {
                CustomToast.success(res.message);

                setFormData({
                    category: '',
                    name: '',
                    unitValue: '',
                    unitType: '',
                    price: '',
                })
            } else {

                CustomToast.error(res.message);
            }
        } catch (error) {
            console.log("ERROR IN SAVE PRODUCT ", error)
        }

        // API call here
    };


    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     const combinedUnit = `${formData.unitValue} ${formData.unitType}`;
    //     const finalData = { ...formData, unit: combinedUnit };
    //     console.log('Form submitted:', finalData);
    //     // API call with finalData
    // };

    return (
        <>

            <div className="w-full px-4 md:px-6 py-3 text-left">
                <CommonBackButton heading="Add Product" />
            </div>
            <div className="w-full px-4 md:px-6 lg:w-1/2 mx-auto py-6 shadow-xl m-3 rounded-lg bg-slate-700">
                <h2 className="text-2xl font-bold mb-6 text-white">Add Product</h2>

                <form onSubmit={handleSubmit} className="space-y-6 w-full">
                    {/* Row 1: Category and Product Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium text-white">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            >
                                <option value="">Select Category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-white">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Row 2: Product Unit and Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium text-white">Product Unit</label>
                            <div className="flex gap-2">
                                {/* Unit Quantity */}
                                <input
                                    type="number"
                                    name="unitValue"
                                    placeholder="e.g., 1, 500"
                                    value={formData.unitValue}
                                    onChange={handleChange}
                                    required
                                    className="w-1/2 border border-gray-300 rounded px-3 py-2"
                                />

                                {/* Unit Type */}
                                <select
                                    name="unitType"
                                    value={formData.unitType}
                                    onChange={handleChange}
                                    required
                                    className="w-1/2 border border-gray-300 rounded px-3 py-2"
                                >
                                    <option value="">Select Unit</option>
                                    <option value="Ltr">Ltr</option>
                                    <option value="KG">KG</option>
                                    <option value="gm">gm</option>
                                    <option value="ml">ml</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-white">Product Price</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
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

export default AddProductPage;
