import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useHomeStore from '../../zustand/useHomeStore';
import { toast } from 'react-toastify';
import CustomToast from '../../helper/costomeToast';
import { FaEye, FaPen } from 'react-icons/fa';
import { FaTrashCan } from 'react-icons/fa6';

const ProductTable = () => {
  const nav = useNavigate()
  const allProductGet = useHomeStore(state => state.allProductGet)
  const updateProductStatus = useHomeStore(state => state.updateProductStatus)
  const deleteProduct = useHomeStore(state => state.deleteProduct)
  const [modalType, setModalType] = useState(null); // 'toggle', 'delete', 'edit'
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productEdit, setProductEdit] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [selectedCustomer, setSelectedProduct] = useState(null);


  const productAllDataFetch = async () => {
    try {
      const res = await allProductGet();
      console.log("fetch all product ", res)
      if (res.status_code == 200) {
        setProducts(res.data.data)
      } else {
        console.log("response errro", res)
      }

    } catch (error) {
      console.log("ERROR IN FETCH ALL PRODUCT ")

    }
  }

  useEffect(() => {
    productAllDataFetch()
  }, [])



  const openModal = (type, product) => {
    setSelectedProduct(product);
    setModalType(type);
    setProductEdit(product.name)
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setModalType(null);
  };



  // UPDATE CATEGORY STATUS
  const handleToggleStatus = async () => {
    try {
      const res = await updateProductStatus(selectedProduct.id);
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
        // fetchCategoryData()
        productAllDataFetch()
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
      const res = await deleteProduct(selectedProduct.id);
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        closeModal();
        productAllDataFetch()
      } else {
        CustomToast.error(res.message)

      }

    } catch (error) {
      console.log("ERROR IN CATEGORY DELETE FUNCTION", error)
    }
  };


  // CATEGORY UPDATE
  const handleEdit = async () => {

    console.log("productEdit", productEdit)

    console.log("selectedProduct", selectedProduct)
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



  return (
    <>
      {/* Table */}


      {/* === Bottom Table === */}
      <div className="mt-8 w-full">
        <h3 className="text-xl font-semibold mb-4">Product Data</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                {['Sr No.', 'Product', 'Category', 'Price', 'Unit', 'Status', 'Action'].map(header => (
                  <th key={header} className="border px-2 py-1">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-gray-500 py-4">Data not available</td>
                </tr>
              ) : (
                products.map((item, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1 text-center">{i + 1}</td>
                    <td className="border px-2 py-1 text-center">{item.name}</td>
                    <td className="border px-2 py-1 text-center">{item.category.name}</td>
                    <td className="border px-2 py-1 text-center">₹{item.price}</td>
                    <td className="border px-2 py-1 text-center">{item.unit}</td>
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
                            setSelectedProduct(item);
                            setIsModalOpen(true);
                          }}
                        >
                          <FaEye size={14} />
                        </button>
                        <button onClick={() => nav("/editProduct", { state: { productId: item.id } })} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"><FaPen size={14} /></button>
                        <button
                          onClick={() => {
                            openModal("delete", item)
                          }}
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                        >
                          <FaTrashCan size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {isModalOpen && setSelectedProduct && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
              Product Details
            </h2>

            {/* Close Button */}
            {/* <div
                            onClick={() => setIsModalOpen(false)}
                            className="absolute bg-white top-4 right-4 text-xxl cursor-pointer"
                            title="Close"
                        >
                            <IoMdCloseCircle size={30} />
                        </div> */}

            {/* Milk Collection Info Table */}
            <table className="w-full text-sm text-left border border-gray-200">
              <tbody>
                {[
                  ['Product Name', selectedProduct.name],
                  ['Category Name', selectedProduct.category.name],
                  ['Price', `₹${selectedProduct.price}`],
                  ['Unit', selectedProduct.unit],
                  ['Stocks', selectedProduct.stocks.length],
                  ['Status', selectedProduct.status == 1 ? <span className='text-green-700 font-bold'>Active</span> : <span className='text-red-700 font-bold'>Inactive</span>],
                  ['Created At', new Date(selectedProduct.created_at).toLocaleString()],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b hover:bg-gray-50">
                    <td className="font-medium text-gray-700 px-4 py-2 w-1/3 bg-gray-50">{label}</td>
                    <td className="px-4 py-2">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Close Button */}
            <div className="mt-6 text-right">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-700 text-white px-5 py-2 rounded hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}





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
                  <strong>{selectedProduct.name}</strong> as{' '}
                  <strong>
                    {selectedProduct.active ? 'Inactive' : 'Active'}
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
                  <strong>{selectedProduct.name}</strong>?
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


          </div>
        </div>
      )}
    </>
  )
}

export default ProductTable