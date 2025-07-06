import React, { useEffect, useState } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import { IoMdClose } from 'react-icons/io';
import DateFormate from '../../helper/DateFormate';

const EditCustomerCollectionModal = ({ isOpen, onClose, productData }) => {
  const {
    fetchCustomerDetailsByAccount,
    fetchCategory,
    fetchProductByCategoryId,
    updateProductSale,
    loading,
  } = useHomeStore();

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    customer_account_number: '',
    name: '',
    careof: '',
    date: today,
    category_id: '',
    product_id: '',
    product_price: '',
    qty: '',
    total: '',
    transaction_type: '',
  });
  const [allProductCategory, setAllProductCategory] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  // Initialize form with productData
  useEffect(() => {
    if (productData) {
      setForm({
        customer_account_number: productData.customer_account_number || '',
        name: productData.customer?.name || '',
        careof: productData.customer?.careof || '',
        date: productData.date || today,
        category_id: productData.category_id || '',
        product_id: productData.product_id || '',
        product_price: productData.product_price || '',
        qty: productData.qty || '',
        total: productData.total || '',
        transaction_type: productData.transaction_type || '',
      });
      // Fetch products for the initial category
      if (productData.category_id) {
        fetchProductByCategoryId(productData.category_id).then((res) => {
          setAllProducts(res.data || []);
        });
      }
    }
  }, [productData, fetchProductByCategoryId]);

  // Fetch all product categories
  useEffect(() => {
    const fetchAllProductCategory = async () => {
      try {
        const res = await fetchCategory();
        setAllProductCategory(res.data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        CustomToast.error('Failed to fetch categories');
      }
    };
    fetchAllProductCategory();
  }, [fetchCategory]);

  // Handle input changes
  const handleChange = async (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      // Handle category change
      if (name === 'category_id') {
        updated.product_id = '';
        updated.product_price = '';
        updated.qty = '';
        updated.total = '';
        if (value) {
          fetchProductByCategoryId(value)
            .then((res) => {
              setAllProducts(res.data || []);
            })
            .catch((error) => {
              console.error('Error fetching products:', error);
              CustomToast.error('Failed to fetch products');
            });
        } else {
          setAllProducts([]);
        }
      }

      // Handle product selection
      if (name === 'product_id') {
        const selected = allProducts.find((p) => p.id == value);
        if (selected) {
          updated.product_price = selected.price || '';
          updated.total = (parseFloat(selected.price || 0) * parseFloat(updated.qty || 0)).toFixed(2);
        }
      }

      // Handle quantity change
      if (name === 'qty') {
        const qty = parseFloat(value) || 0;
        const price = parseFloat(updated.product_price) || 0;
        updated.total = (qty * price).toFixed(2);
      }

      return updated;
    });
  };

  // Fetch customer details by account number
  const fetchCustomerDetailByAccountNumber = async (accountNo) => {
    try {
      const res = await fetchCustomerDetailsByAccount(accountNo);
      if (res.status_code === 200) {
        setForm((prev) => ({
          ...prev,
          name: res.data.name || '',
          careof: res.data.careof || '',
        }));
        CustomToast.success(res.message);
      } else {
        CustomToast.error(res.message);
        setForm((prev) => ({
          ...prev,
          name: '',
          careof: '',
        }));
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      CustomToast.error('Failed to fetch customer details');
      setForm((prev) => ({
        ...prev,
        name: '',
        careof: '',
      }));
    }
  };

  // Debounced fetch for customer details
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (form.customer_account_number && form.customer_account_number !== productData?.customer_account_number) {
        fetchCustomerDetailByAccountNumber(form.customer_account_number);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [form.customer_account_number]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const customerCollectionData = {
        customer_account_number: form.customer_account_number,
        name: form.name,
        careof: form.careof,
        date: DateFormate(form.date),
        category_id: form.category_id,
        product_id: form.product_id,
        product_price: form.product_price,
        qty: form.qty,
        total: form.total,
        transaction_type: form.transaction_type,
      };

      const res = await updateProductSale(productData.id, customerCollectionData);
      if (res.status_code === 200) {
        CustomToast.success(res.message);
        onClose();
      } else {
        CustomToast.error(res.message);
      }
    } catch (error) {
      console.error('Error updating product sale:', error);
      CustomToast.error('Something went wrong while updating!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white max-w-4xl w-full max-h-[70vh] overflow-y-auto p-8 rounded-lg relative">
        <button className="absolute top-2 right-4 text-xl p-2 rounded-md" onClick={onClose}>
          <IoMdClose />
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-center">Edit Product Sale</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {[
            { label: 'Date', name: 'date', type: 'date', readOnly: false },
            { label: 'Account No', name: 'customer_account_number', type: 'text', readOnly: false },
            { label: 'Name', name: 'name', type: 'text', readOnly: true },
            { label: 'Care of', name: 'careof', type: 'text', readOnly: true },
            {
              label: 'Category',
              name: 'category_id',
              type: 'select',
              options: allProductCategory.map((cate) => ({ value: cate.id, label: cate.name })),
            },
            {
              label: 'Product',
              name: 'product_id',
              type: 'select',
              options: allProducts.map((prod) => ({ value: prod.id, label: prod.name })),
            },
            { label: 'Price', name: 'product_price', type: 'number', readOnly: true },
            { label: 'Quantity', name: 'qty', type: 'number', readOnly: false },
            { label: 'Total Price', name: 'total', type: 'number', readOnly: true },
            {
              label: 'Transaction Type',
              name: 'transaction_type',
              type: 'select',
              options: [
                { value: 'cash', label: 'Cash' },
                { value: 'borrow', label: 'Borrow' },
              ],
            },
          ].map(({ label, name, type = 'text', readOnly = false, options }) => (
            <div key={name}>
              <label className="block font-medium mb-1">{label}</label>
              {type === 'select' ? (
                <select
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded bg-white"
                >
                  <option value="">Select {label.toLowerCase()}</option>
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded bg-white"
                  readOnly={readOnly}
                  max={name === 'date' ? today : undefined}
                />
              )}
            </div>
          ))}
          <div className="col-span-2 mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
              disabled={loading}
            >
              {loading ? 'Please wait...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerCollectionModal;