import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonBackButton from '../../components/CommonBackButton';
import useHomeStore from '../../zustand/useHomeStore';
import { toast } from 'react-toastify';
import CustomToast from '../../helper/costomeToast';

const AddCategoriesPage = () => {
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const addCategory = useHomeStore(state => state.addCategory);
    const loading = useHomeStore(state => state.loading);

    const nav = useNavigate();

    const handleAddCategory = async (e) => {
        e.preventDefault(); // Prevent form default submit behavior

        if (!categoryName.trim()) {
            setError('Category name is required');
            return;
        }

        const categoryData = { name: categoryName };

        try {
            const res = await addCategory(categoryData);
            console.log("add category response", res);
            if (res.status_code === 200) {
                CustomToast.success(res.message)
                nav(-1);
                setError('');
                setShowSuccessModal(true);
            } else {
                CustomToast.error(res.message)
            }
        } catch (error) {
            console.error("ERROR IN CATEGORY CREATE", error);
        }
    };

    const handleModalClose = () => {
        setShowSuccessModal(false);
        setCategoryName('');
    };

    return (
        <div className="p-6 w-full min-h-screen bg-gray-50 relative">
            <CommonBackButton heading="Add Category" />

            <div className="max-w-2xl w-full mx-auto bg-white p-6 rounded shadow mt-12">
                <h2 className="text-2xl font-bold mb-6">Add New Category</h2>

                {/* FORM */}
                <form onSubmit={handleAddCategory}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Category Name</label>
                        <input
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter category name"
                        />
                        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                    </div>

                    <div className="flex justify-start">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`py-2 px-6 rounded bg-blue-500 text-white ${loading && 'bg-gray-600'}`}
                        >
                            {loading ? "Please wait.." : "Add Category"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-md text-center w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-4 text-green-600">
                            Category added successfully!
                        </h3>
                        <button
                            onClick={handleModalClose}
                            className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddCategoriesPage;
