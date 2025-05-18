import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CommonBackButton from '../../components/CommonBackButton';

const AddCategoriesPage = () => {
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const navigate = useNavigate();

    const handleAddCategory = () => {
        if (!categoryName.trim()) {
            setError('Category name is required');
            return;
        }

        // Simulate successful add
        setError('');
        setShowSuccessModal(true);
    };

    const handleModalClose = () => {
        setShowSuccessModal(false);
        setCategoryName('');
    };

    return (
        <div className="p-6 w-full min-h-screen bg-gray-50 relative">
            {/* Styled Back Arrow */}
           <CommonBackButton heading={"Add Category"} />

            <div className="max-w-2xl w-full mx-auto bg-white p-6 rounded shadow mt-12">
                <h2 className="text-2xl font-bold mb-6">Add New Category</h2>

                {/* Input Field */}
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

                {/* Add Button (Bottom Left) */}
                <div className="flex justify-start">
                    <button
                        onClick={handleAddCategory}
                        className=" text-white py-2 px-6 rounded "
                    >
                        Add Category
                    </button>
                </div>
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
