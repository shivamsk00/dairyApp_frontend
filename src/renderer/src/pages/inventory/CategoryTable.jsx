import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useHomeStore from '../../zustand/useHomeStore';
import { toast } from 'react-toastify';
import CustomToast from '../../helper/costomeToast';
import { FaEye, FaPen } from 'react-icons/fa';
import { FaTrashCan } from 'react-icons/fa6';
import { navigateTo } from '../../helper/navigation';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';

const CategoryTable = () => {
     const fetchCategory = useHomeStore(state => state.fetchCategory);
     const updateCategoryStatus = useHomeStore(state => state.updateCategoryStatus);
     const updateCategory = useHomeStore(state => state.updateCategory);
     const deleteCategory = useHomeStore(state => state.deleteCategory);



     const [categories, setCategories] = useState([]);

     const [selectedCategory, setSelectedCategory] = useState(null);
     const [categoryEdit, setCategoryEdit] = useState('')
     const [modalType, setModalType] = useState(null); // 'toggle', 'delete', 'edit'
     const [currentPage, setCurrentPage] = useState(1);
     const [totalPages, setTotalPages] = useState(1);
     const [maxPageButtons, setMaxPageButtons] = useState(5);

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

     const fetchCategoryData = async (page = 1) => {
          try {
               const res = await fetchCategory(page);
               console.log("response print fetch category data", res.data.data)
               if (res.status_code == 200) {
                    setCategories(res.data.data)
                    setCurrentPage(res.data.current_page);
                    setTotalPages(res.data.last_page);
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
     }

     const renderPageButtons = () => {
          const groupStart = Math.floor((currentPage - 1) / maxPageButtons) * maxPageButtons + 1;
          const groupEnd = Math.min(groupStart + maxPageButtons - 1, totalPages);

          const pages = [];

          // Always show first page
          if (groupStart > 1) {
               pages.push(
                    <button
                         key={1}
                         className={`px-3 py-1 border rounded text-sm ${currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-white'}`}
                         onClick={() => fetchCategoryData(1)}
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
                         className={`px-3 py-1 border rounded text-sm ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-white'}`}
                         onClick={() => fetchCategoryData(i)}
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
                         className={`px-3 py-1 border rounded text-sm ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-white'}`}
                         onClick={() => fetchCategoryData(totalPages)}
                    >
                         {totalPages}
                    </button>
               );
          }

          return (
               <div className="flex gap-1 flex-wrap justify-center mt-4 w-full">
                    {/* Previous Button */}
                    <button
                         className="px-3 py-1 border rounded text-sm text-white bg-gray-500 disabled:opacity-50"
                         onClick={() => fetchCategoryData(currentPage - 1)}
                         disabled={currentPage === 1}
                    >
                         <MdArrowBackIos size={18} />
                    </button>

                    {pages}

                    {/* Next Button */}
                    <button
                         className="px-3 py-1 border rounded text-sm text-white bg-gray-500 disabled:opacity-50"
                         onClick={() => fetchCategoryData(currentPage + 1)}
                         disabled={currentPage === totalPages}
                    >
                         <MdArrowForwardIos size={18} />
                    </button>
               </div>
          );
     };

     useEffect(() => {
          fetchCategoryData()
     }, [])

     return (
          <>
               <>
                    {/* Table */}


                    {/* === Bottom Table === */}
                    <div className="mt-8 w-full">
                         <h3 className="text-xl font-semibold mb-4">Product Data</h3>
                         <div className="overflow-x-auto">
                              <table className="min-w-full border border-gray-300 text-sm">
                                   <thead className="bg-gray-100">
                                        <tr>
                                             {['Sr No.', 'Category Name', 'Status', 'Action'].map(header => (
                                                  <th key={header} className="border px-2 py-1">{header}</th>
                                             ))}
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {categories.length === 0 ? (
                                             <tr>
                                                  <td colSpan="9" className="text-center text-gray-500 py-4">Data not available</td>
                                             </tr>
                                        ) : (
                                             categories.map((item, i) => (
                                                  <tr key={i}>
                                                       <td className="border px-2 py-1 text-center">{i + 1}</td>
                                                       <td className="border px-2 py-1 text-center">{item.name}</td>
                                                       <td className="border px-2 py-1 text-center">
                                                            <button
                                                                 onClick={() => openModal('toggle', item)}
                                                                 className={`px-3 py-1 rounded-full text-sm font-medium ${item.status == 1
                                                                      ? 'bg-green-100 text-green-700'
                                                                      : 'bg-red-100 text-red-700'
                                                                      }`}
                                                            >
                                                                 {item.status == 1 ? 'Active' : 'Inactive'}
                                                            </button>
                                                       </td>

                                                       <td className="border px-2 py-1 text-center">
                                                            <div className="flex gap-2 justify-center">
                                                                 <button
                                                                      className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                                                                      onClick={() => {
                                                                           openModal('edit', item)
                                                                      }}
                                                                 >
                                                                      {/* <FaEye size={14} /> */}
                                                                      <FaPen size={14} />
                                                                 </button>

                                   
                                                            </div>
                                                       </td>
                                                  </tr>
                                             ))
                                        )}
                                   </tbody>
                              </table>
                              {/* Pagination Controls */}
                              {renderPageButtons()}
                         </div>
                    </div>









               </>




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
          </>
     )
}

export default CategoryTable