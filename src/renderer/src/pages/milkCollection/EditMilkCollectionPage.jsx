import React, { useEffect, useState } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import { IoMdClose } from 'react-icons/io';

const EditMilkCollectionModal = ({ isOpen, onClose, milkData }) => {
  const editMilkCollectionDetail = useHomeStore(state => state.editMilkCollectionDetail);
  const loading = useHomeStore(state => state.loading);
  const fetchCustomerDetailsByAccount = useHomeStore(state => state.fetchCustomerDetailsByAccount);
  const getMilkRate = useHomeStore(state => state.getMilkRate);

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
        shift: milkData.shift || '',
        date: milkData.date
      });
    }
  }, [milkData]);





  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(prev => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // When quantity or base_rate changes, update total_amount
      if (name === 'quantity' || name === 'base_rate') {
        const quantity = parseFloat(name === 'quantity' ? value : updated.quantity);
        const baseRate = parseFloat(name === 'base_rate' ? value : updated.base_rate);

        if (!isNaN(quantity) && !isNaN(baseRate)) {
          updated.total_amount = (quantity * baseRate).toFixed(2);
        } else {
          updated.total_amount = '';
        }
      }

      return updated;
    });
  };








  // FETCH ALL CUSTOMER
  const fetchCustomerDetailByAccountNumber = async (accountNo) => {
    // console.log('Fetching customer details for:', accountNo);
    try {
      const res = await fetchCustomerDetailsByAccount(accountNo); // Your zustand API call
      console.log('Customer response:', res);
      if (res.status_code == 200) {
        // CustomToast.success(res.message)
        setForm((prev) => ({
          ...prev,
          name: res.data.name || '',
          careof: res.data.careof || '',
          mobile: res.data.mobile || '',
        }));
        // setCustomerWallet(res.data.wallet)

      } else {

        CustomToast.error(res.message)
        setForm((prev) => ({
          ...prev,
          name: '',
          careof: '',
          mobile: '',
        }));
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      setForm((prev) => ({
        ...prev,
        name: '',
        careof: '',
        mobile: '',
      }));
    }
  };

  // Debounced fetch on account number input
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (form.customer_account_number) {
        fetchCustomerDetailByAccountNumber(form.customer_account_number);
      } else {
        setForm((prev) => ({
          ...prev,
          name: '',
          careof: '',
          mobile: '',
        }));
      }
    }, 500); // wait 500ms after user stops typing

    return () => clearTimeout(timeout); // cleanup on next input
  }, [form.customer_account_number]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await editMilkCollectionDetail(milkData.id, form);
      if (res.status_code == 200) {

        // CustomToast.success(res.message);
        onClose(); // close modal after success
      } else {
        CustomToast.error(res.message);
      }
    } catch (error) {
      CustomToast.error("Error updating milk collection.");
    }
  };


  useEffect(() => {
    const fat = form.fat?.trim();
    const clr = form.clr?.trim();
    const snf = form.snf?.trim();

    // ✅ Trigger only when FAT is present, and either SNF or CLR is updated
    if ((snf || clr) && fat) {
      const timeout = setTimeout(() => {
        const getBaseRateFetch = async () => {
          try {
            const res = await getMilkRate(fat, clr, snf);
            console.log("milk rate fetch", res);

            setForm(prev => ({
              ...prev,
              fat: res.fat || "",
              clr: res.clr || "",
              snf: res.snf || "",
              base_rate: res.rate || '',
            }));

            // 🎯 Prioritize meaningful feedback
            if (res.rate) {
              // CustomToast.success("Rate Found", "top-center");
            } else {
              if (!res.fat) CustomToast.warn("FAT not found", "top-center");
              if (!res.snf) CustomToast.warn("SNF not found", "top-center");
              if (!res.clr) CustomToast.warn("CLR not found", "top-center");
              CustomToast.warn("RATE not found", "top-center");
            }
          } catch (error) {
            console.error("Error fetching milk rate:", error);
          }
        };

        getBaseRateFetch();
      }, 800); // Slightly quicker feedback

      return () => clearTimeout(timeout);
    }
  }, [form.fat, form.snf, form.clr]);



  // Calculate rate and total_amount automatically
  useEffect(() => {
    const { fat, snf, base_rate, other_price, quantity } = form;
    const f = parseFloat(fat) || 0;
    const s = parseFloat(snf) || 0;
    const b = parseFloat(base_rate) || 0;
    const o = parseFloat(other_price) || 0;
    const q = parseFloat(quantity) || 0;
    const rate = q * b;
    const total_amount = rate + o;

    setForm((prev) => ({
      ...prev,
      rate: rate.toFixed(2),
      total_amount: total_amount.toFixed(2),
    }));
  }, [form.fat, form.snf, form.base_rate, form.other_price, form.quantity]);
















  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white max-w-4xl w-full max-h-[70vh] overflow-y-scroll p-8 rounded-lg relative">
        <button
          className="absolute top-2 p-2 rounded-md right-4 text-xl"
          onClick={onClose}
        >
          <IoMdClose />
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-center">Edit Milk Collection</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {[
            { label: 'Date', name: 'date', type: "date" },
            { label: 'Account No', name: 'customer_account_number' },
            { label: 'Name', name: 'name' },
            { label: 'Care of', name: 'careof' },
            { label: 'Milk Type', name: 'milk_type', type: 'select', options: ['cow', 'buffalo', 'other'] },
            { label: 'Shift', name: 'shift', type: 'select', options: ['morning', 'evening', 'both'] },
            { label: 'Mobile', name: 'mobile' },
            { label: 'Quantity', name: 'quantity', type: 'number' },
            { label: 'FAT', name: 'fat', type: 'number' },
            { label: 'SNF', name: 'snf', type: 'number' },
            // { label: 'Base Rate', name: 'base_rate', type: 'number' },
            { label: 'Rate', name: 'rate', type: 'number' },
            { label: 'Total Amount', name: 'total_amount', type: 'number' },
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
              className="bg-[#E6612A] hover:bg-orange-600 text-white px-6 py-2 rounded"
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
