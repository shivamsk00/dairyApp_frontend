import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useHomeStore from '../../zustand/useHomeStore';
import { toast } from 'react-toastify';
import CustomToast from '../../helper/costomeToast';

const CategoriesPage = () => {

    const fetchCategory = useHomeStore(state => state.fetchCategory);
    const updateCategoryStatus = useHomeStore(state => state.updateCategoryStatus);
    const updateCategory = useHomeStore(state => state.updateCategory);
    const deleteCategory = useHomeStore(state => state.deleteCategory);


    const nav = useNavigate()
    const [categories, setCategories] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryEdit, setCategoryEdit] = useState('')
    const [modalType, setModalType] = useState(null); // 'toggle', 'delete', 'edit'

    const openModal = (type, category) => {
        setSelectedCategory(category);
        setModalType(type);
        setCategoryEdit(category.name)
    };

    const closeModal = () => {
        setSelectedCategory(null);
        setModalType(null);
    };

    // UPDATE CATEGORY STATUS
    const handleToggleStatus = async () => {
        try {
            const res = await updateCategoryStatus(selectedCategory.id);
            console.log("status update", res)
            if (res.status_code == 200) {
                toast(res.message, {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    type: 'success'

                });
                closeModal();
                fetchCategoryData()
            } else {
                toast(res.message, {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    type: 'error'

                });
            }
        } catch (error) {
            toast(error, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                type: 'error'

            });

        }

    };

    const handleDelete = async () => {
        try {
            const res = await deleteCategory(selectedCategory.id);
            if (res.status_code == 200) {
                CustomToast.success(res.message)
                fetchCategoryData()
                closeModal()
            } else {
                CustomToast.error(res.message)

            }

        } catch (error) {
            console.log("ERROR IN CATEGORY DELETE FUNCTION", error)
        }
    };


    // CATEGORY UPDATE
    const handleEdit = async () => {

        console.log("categoryEdit", categoryEdit)
        console.log("selectedCategory", selectedCategory)
        try {
            const res = await updateCategory(selectedCategory.id, { name: categoryEdit });
            // console.log("edit category ", res)
            if (res.status_code == 200) {
                toast(res.message, {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    type: 'success'

                });
                closeModal();
                fetchCategoryData()

            } else {
                toast(res.message, {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    type: 'error'

                });

            }

        } catch (error) {
            console.log("ERROR IN CATEGORY UPDATE", error);
            toast(error, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                type: 'error'

            });

        }
    };

    const fetchCategoryData = async () => {
        try {
            const res = await fetchCategory();
            console.log("response print fetch category data", res)
            setCategories(res.data.data)


        } catch (error) {
            toast(error, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                type: 'error'

            });

        }
    }

    useEffect(() => {
        fetchCategoryData()
    }, [])



    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Categories</h1>
                <button onClick={() => nav("/addcategory")} className=" text-white px-4 py-2 rounded ">
                    Add Category
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full  shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left py-3 px-4 font-semibold text-sm">Category Name</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">{category.name}</td>
                                <td className="py-3 px-4">
                                    <button
                                        onClick={() => openModal('toggle', category)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${category.status == 1
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {category.status == 1 ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="py-3 px-4 space-x-2">
                                    <button
                                        onClick={() => openModal('edit', category)}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => openModal('delete', category)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modalType && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        {/* TOGGLE MODAL */}
                        {modalType === 'toggle' && (
                            <>
                                <h2 className="text-lg font-semibold mb-4">Change Status</h2>
                                <p className="mb-6">
                                    Are you sure you want to mark{' '}
                                    <strong>{selectedCategory.name}</strong> as{' '}
                                    <strong>
                                        {selectedCategory.active ? 'Inactive' : 'Active'}
                                    </strong>
                                    ?
                                </p>
                                <div className="flex justify-end gap-2">
                                    <button
                                        className="px-4 py-2 rounded bg-gray-300"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded bg-blue-600 text-white"
                                        onClick={handleToggleStatus}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </>
                        )}

                        {/* DELETE MODAL */}
                        {modalType === 'delete' && (
                            <>
                                <h2 className="text-lg font-semibold mb-4 text-red-600">
                                    Confirm Delete
                                </h2>
                                <p className="mb-6">
                                    Are you sure you want to delete{' '}
                                    <strong>{selectedCategory.name}</strong>?
                                </p>
                                <div className="flex justify-end gap-2">
                                    <button
                                        className="px-4 py-2 rounded bg-gray-300"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded bg-red-600 text-white"
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}

                        {/* EDIT MODAL */}
                        {modalType === 'edit' && (
                            <>
                                <h2 className="text-lg font-semibold mb-4">Edit Category</h2>
                                <input
                                    type="text"
                                    className="w-full border p-2 rounded mb-4"
                                    defaultValue={categoryEdit}
                                    onChange={(e) => setCategoryEdit(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        className="px-4 py-2 rounded bg-gray-300"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded bg-green-600 text-white"
                                        onClick={handleEdit}
                                    >
                                        Save
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
