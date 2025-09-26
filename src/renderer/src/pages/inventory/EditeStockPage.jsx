import React, { useEffect, useState } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import CommonBackButton from '../../components/CommonBackButton';
import { useLocation, useNavigate } from 'react-router-dom';

const EditeStockPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { stockId } = state;

  const allProductGet = useHomeStore(state => state.allProductGet);
  const getEditProductStockData = useHomeStore(state => state.getEditProductStockData);
  const updateProductStock = useHomeStore(state => state.updateProductStock); // ✅ Correct function name

  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    product_id: '',
    stock_type: '',
    quantity: '',
    date: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchProductEditData = async () => {
    try {
      const res = await getEditProductStockData(stockId);
      console.log("Fetched stock data:", res);
      if (res.status_code ==
        200 && res.data.length > 0) {
        const stock = res.data[0];

        console.log("this is stock", stock.product_id)
        setFormData({
          product_id: stock.product_id || '',
          stock_type: stock.stock_type || '',
          quantity: stock.quantity || '',
          date: stock.date?.split('T')[0] || '',
        });
      } else {
        CustomToast.error('No stock data found.');
      }
    } catch (error) {
      console.error("Error fetching stock data", error);
      CustomToast.error("Failed to load product stock.");
    } finally {
      setLoading(false);
    }
  };

  const getAllProducts = async () => {
    try {
      const res = await allProductGet();
      if (res.status_code == 200) {
        setProductData(res.data.data);

      } else {
        CustomToast.error(res.message);
      }
    } catch (error) {
      console.error("Error fetching products", error);
      CustomToast.error("Failed to load products.");
    }
  };

  useEffect(() => {
    getAllProducts();
    fetchProductEditData();
  }, []);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProductStock(stockId, formData);
      if (res.status_code === 200) {
        CustomToast.success(res.message);
        setFormData({
          product_id: '',
          stock_type: '',
          quantity: '',
          date: '',
        });
        navigate(-1); // Go back
      } else {
        CustomToast.error(res.message || "Update failed.");
      }
    } catch (error) {
      console.error("Error updating product stock", error);
      CustomToast.error("Error occurred during update.");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-white py-10">
        Loading stock data...
      </div>
    );
  }

  return (
    <>
      <div className="w-full px-4 md:px-6 py-3 text-left">
        <CommonBackButton heading="Edit Product Stock" />
      </div>

      <div className="w-full px-4 md:px-6 lg:w-1/2 mx-auto py-6 shadow-xl m-3 rounded-lg bg-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-white">Edit Product Stock</h2>

        <form onSubmit={handleUpdateSubmit} className="space-y-6 w-full">
          {/* Row 1: Product Name & Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-white">Product Name</label>
              <select
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Product</option>
                {productData.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
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
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Row 2: Stock Type & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-white">Stock Type</label>
              <select
                name="stock_type"
                value={formData.stock_type}
                onChange={handleChange}
                
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Type</option>
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium text-white">Entry Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition"
            >
              Update Product Stock
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditeStockPage;
