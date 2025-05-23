import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import CommonBackButton from '../../components/CommonBackButton';

const EditMilkCollectionPage = () => {
  const nav = useNavigate()
  const location = useLocation();
  const milkData = location.state?.milkData || {};
  console.log("milkData", milkData)
  const editMilkCollectionDetail = useHomeStore(state => state.editMilkCollectionDetail)
  const loading = useHomeStore(state => state.loading)
  const [form, setForm] = useState({
    milk_type: '',
    customer_account_number: '',
    name: '',
    spouse: '',
    mobile: '',
    quantity: '',
    fat: '',
    clr: '',
    snf: '',
    base_rate: '',
    other_price: '',
    rate: '',
    amount: '',
    shift: ''
  });

  useEffect(() => {
    if (milkData) {
      setForm({
        milk_type: milkData.milk_type || '',
        customer_account_number: milkData.customer_account_number || '',
        name: milkData.name || '',
        spouse: milkData.spouse || '',
        mobile: milkData.mobile || '',
        quantity: milkData.quantity || '',
        fat: milkData.fat || '',
        clr: milkData.clr || '',
        snf: milkData.snf || '',
        base_rate: milkData.base_rate || '',
        other_price: milkData.other_price || '',
        rate: milkData.base_rate || '',
        amount: milkData.quantity * milkData.base_rate || '',
        shift: 'morning'
      });
    }
  }, [milkData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: update API call here
    try {
      const res = await editMilkCollectionDetail(milkData.id, form);
      console.log("update response", res)
      CustomToast.success(res.message)
      nav(-1)

    } catch (error) {

    }
    console.log('Updated form:', form);
  };

  return (
    <div className="w-full mx-auto p-6  rounded ">

      <CommonBackButton />
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 bg-white shadow-md p-6 gap-x-6 gap-y-4 w-full"
      >
        {/* Milk Type */}
        <div className="col-span-2">
          <label className="block font-semibold mb-1">Milk Type:</label>
          <select
            name="milk_type"
            value={form.milk_type}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select milk type</option>
            <option value="cow">Cow</option>
            <option value="buffalo">Buffalo</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Shift */}
        <div className="col-span-2">
          <label className="block font-semibold mb-1">Shift:</label>
          <select
            name="shift"
            value={form.shift}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select shift</option>
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
            <option value="both">Both</option>
          </select>
        </div>

        {/* Account No */}
        <div>
          <label className="block font-semibold mb-1">Account No:</label>
          <input
            type="text"
            name="customer_account_number"
            value={form.customer_account_number}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded bg-gray-100"
            readOnly
          />
        </div>

        {/* Name */}
        <div>
          <label className="block font-semibold mb-1">Name:</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Spouse */}
        <div>
          <label className="block font-semibold mb-1">Spouse:</label>
          <input
            type="text"
            name="spouse"
            value={form.spouse}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Mobile */}
        <div>
          <label className="block font-semibold mb-1">Mobile:</label>
          <input
            type="text"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block font-semibold mb-1">Quantity (Ltr):</label>
          <input
            type="number"
            step="0.01"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* FAT */}
        <div>
          <label className="block font-semibold mb-1">FAT (%):</label>
          <input
            type="number"
            step="0.01"
            name="fat"
            value={form.fat}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* CLR */}
        <div>
          <label className="block font-semibold mb-1">CLR:</label>
          <input
            type="number"
            step="0.01"
            name="clr"
            value={form.clr}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* SNF */}
        <div>
          <label className="block font-semibold mb-1">SNF (%):</label>
          <input
            type="number"
            step="0.01"
            name="snf"
            value={form.snf}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Base Rate */}
        <div>
          <label className="block font-semibold mb-1">Base Rate (₹/Ltr):</label>
          <input
            type="number"
            step="0.01"
            name="base_rate"
            value={form.base_rate}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Other Price */}
        <div>
          <label className="block font-semibold mb-1">Other Price (₹/Ltr):</label>
          <input
            type="number"
            step="0.01"
            name="other_price"
            value={form.other_price}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Rate (read-only) */}
        <div>
          <label className="block font-semibold mb-1">Rate (Auto):</label>
          <input
            type="number"
            step="0.01"
            name="rate"
            value={form.rate}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        {/* Amount (read-only) */}
        <div>
          <label className="block font-semibold mb-1">Amount (Auto):</label>
          <input
            type="number"
            step="0.01"
            name="amount"
            value={form.amount}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        {/* Submit Button spans both columns */}
        <button
          type="submit"
          className="col-span-2  text-white py-2 rounded transition"
        >
          {
            loading ? "please wait " : "Update Milk Collection"
          }

        </button>
      </form>
    </div>
  );
};

export default EditMilkCollectionPage;
