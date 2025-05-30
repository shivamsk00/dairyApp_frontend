import React, { useEffect, useState } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import CommonBackButton from '../../components/CommonBackButton';
import { useLocation } from 'react-router-dom';

const EditProductPage = () => {
  const { state } = useLocation();
  const { productId } = state
  const fetchCategory = useHomeStore(state => state.fetchCategory);
  const editProductDetailsFetch = useHomeStore(state => state.editProductDetailsFetch);
  const updateProduct = useHomeStore(state => state.updateProduct);
  const [categories, setCategories] = useState([]);

  // Simulated existing product data (replace with real API call)
  const [formData, setFormData] = useState({
    category: '',         // pre-selected category ID
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


  const fetchProductEditData = async () => {
    try {
      const res = await editProductDetailsFetch(productId)
      console.log("print product edit data", res.data)

      const productCategory = categories.find(cate => cate.id == res.data.category_id)
      console.log("productCategory", productCategory)
      setFormData({
        category: res.data.category_id,         // pre-selected category ID
        name: res.data.name,
        unitValue: res.data.unit,
        unitType: res.data.unit,
        price: res.data.price,
      })
    } catch (error) {

    }
  }


  const getAllCategory = async () => {
    try {
      const res = await fetchCategory();
      if (res.status_code == 200) {
        setCategories(res.data.data);
        console.log("category fetch", res.data.data)
      } else {
        CustomToast.error(res.message);
      }
    } catch (error) {
      console.error("ERROR FETCHING CATEGORIES", error);
    }
  };

  useEffect(() => {
    getAllCategory();
    fetchProductEditData()
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedProduct = {
      ...formData,
      unit: `${formData.unitValue} ${formData.unitType}`,
    };
    console.log("Updated product data:", updatedProduct);
    // Call update API here
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
              <div className="flex gap-2">
                <input
                  type="number"
                  name="unitValue"
                  placeholder="e.g., 1, 500"
                  value={formData.unitValue}
                  onChange={handleChange}
                  required
                  className="w-1/2 border border-gray-300 rounded px-3 py-2"
                />
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
