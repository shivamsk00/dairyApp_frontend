import React, { useEffect, useState } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import CommonBackButton from '../../components/CommonBackButton';
import { useLocation, useNavigate } from 'react-router-dom';

const EditProductPage = () => {
  const nav = useNavigate();
  const { state } = useLocation();
  const { productId } = state;

  const fetchCategory = useHomeStore(state => state.fetchCategory);
  const editProductDetailsFetch = useHomeStore(state => state.editProductDetailsFetch);
  const updateProduct = useHomeStore(state => state.updateProduct);

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    category: '',
    name: '',
    unit: '',     // 🟢 Combined field for value + type
    price: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const fetchProductEditData = async () => {
    try {
      const res = await editProductDetailsFetch(productId);
      setFormData({
        category: res.data.category_id,
        name: res.data.name,
        unit: res.data.unit,     // 🟢 like '1 Ltr'
        price: res.data.price,
      });
    } catch (error) {
      console.error("ERROR FETCHING PRODUCT", error);
    }
  };

  const getAllCategory = async () => {
    try {
      const res = await fetchCategory();
      if (res.status_code == 200) {
        setCategories(res.data.data);
      } else {
        CustomToast.error(res.message);
      }
    } catch (error) {
      console.error("ERROR FETCHING CATEGORIES", error);
    }
  };

  useEffect(() => {
    getAllCategory();
    fetchProductEditData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        category_id: formData.category,
        name: formData.name,
        unit: formData.unit,  // 🟢 no combination needed
        price: formData.price,
      };

      const res = await updateProduct(productId, productData);
      if (res.status_code == 200) {
        CustomToast.success(res.message);
        nav(-1);
      }
    } catch (error) {
      console.log("ERROR IN UPDATE PRODUCT", error);
    }
  };

  return (
    <>
      <div className="w-full px-4 md:px-6 py-3 text-left">
        <CommonBackButton heading="Edit Product" />
      </div>
      <div className="w-full px-4 md:px-6 lg:w-1/2 mx-auto py-6 shadow-xl m-3 rounded-lg bg-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-white">Edit Product</h2>

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
              <input
                type="text"
                name="unit"
                placeholder="e.g., 1 Ltr, 500 gm"
                value={formData.unit}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
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

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditProductPage;
