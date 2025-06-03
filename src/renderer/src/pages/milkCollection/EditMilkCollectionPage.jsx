import React, { useEffect, useState } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import { IoMdClose } from 'react-icons/io';

const EditMilkCollectionModal = ({ isOpen, onClose, milkData }) => {
  const editMilkCollectionDetail = useHomeStore(state => state.editMilkCollectionDetail);
  const loading = useHomeStore(state => state.loading);

  const [form, setForm] = useState({
    milk_type: '',
    customer_account_number: '',
    name: '',
    careof: '',
    mobile: '',
    quantity: '',
    fat: '',
    clr: '',
    snf: '',
    base_rate: '',
    other_price: '',
    rate: '',
    total_amount: '',
    shift: ''
  });

  useEffect(() => {
    if (milkData) {
      setForm({
        milk_type: milkData.milk_type || '',
        customer_account_number: milkData.customer_account_number || '',
        name: milkData.name || '',
        careof: milkData.careof || '',
        mobile: milkData.mobile || '',
        quantity: milkData.quantity || '',
        fat: milkData.fat || '',
        clr: milkData.clr || '',
        snf: milkData.snf || '',
        base_rate: milkData.base_rate || '',
        other_price: milkData.other_price || '',
        rate: milkData.base_rate || '',
        total_amount: milkData.quantity * milkData.base_rate || '',
        shift: milkData.shift || 'morning'
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
    try {
      const res = await editMilkCollectionDetail(milkData.id, form);
      CustomToast.success(res.message);
      onClose(); // close modal after success
    } catch (error) {
      CustomToast.error("Error updating milk collection.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white max-w-4xl w-full p-6 rounded-lg relative">
        <button
          className="absolute top-2 p-2 rounded-md right-4 text-white text-xl"
          onClick={onClose}
        >
          <IoMdClose />
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-center">Edit Milk Collection</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Fields (you can extract into a map if needed) */}
          {[
            { label: 'Milk Type', name: 'milk_type',readOnly:true, type: 'select', options: ['cow', 'buffalo', 'other'] },
            { label: 'Shift', name: 'shift',readOnly:true, type: 'select', options: ['morning', 'evening', 'both'] },
            { label: 'Account No', name: 'customer_account_number', readOnly: true },
            { label: 'Name',readOnly:true, name: 'name' },
            { label: 'Care of',readOnly:true, name: 'careof' },
            { label: 'Mobile',readOnly:true, name: 'mobile' },
            { label: 'Quantity',readOnly:true, name: 'quantity', type: 'number' },
            { label: 'FAT', name: 'fat',readOnly:true, type: 'number' },
            { label: 'CLR', name: 'clr',readOnly:true, type: 'number' },
            { label: 'SNF', name: 'snf',readOnly:true, type: 'number' },
            { label: 'Base Rate', name: 'base_rate',readOnly:true, type: 'number' },
            { label: 'Rate', name: 'rate', readOnly: true, type: 'number' },
            { label: 'Total Amount', name: 'total_amount', readOnly: true, type: 'number' },
          ].map(({ label, name, readOnly = false, type = 'text', options }) => (
            <div key={name}>
              <label className="block font-medium mb-1">{label}</label>
              {type === 'select' ? (
                <select
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">Select {label.toLowerCase()}</option>
                  {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
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
              {loading ? "Please wait..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMilkCollectionModal;
