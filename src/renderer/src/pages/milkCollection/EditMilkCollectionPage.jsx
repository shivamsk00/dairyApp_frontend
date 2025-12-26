import React, { useEffect, useState } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import { IoMdClose, IoMdCloseCircle } from 'react-icons/io';
import { FiAlertTriangle } from 'react-icons/fi';

const EditMilkCollectionModal = ({ isOpen, onClose, milkData, onUpdate }) => {
  const editMilkCollectionDetail = useHomeStore(state => state.editMilkCollectionDetail);
  const loading = useHomeStore(state => state.loading);
  const fetchCustomerDetailsByAccount = useHomeStore(state => state.fetchCustomerDetailsByAccount);
  const getMilkRate = useHomeStore(state => state.getMilkRate);
  const [isCustomer, setIscustomer] = useState(true);
  const [rateFieldsTouched, setRateFieldsTouched] = useState(false);
  const [showConfirmChange, setShowConfirmChange] = useState(false);

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

    if (['fat', 'snf', 'clr'].includes(name)) {
      setRateFieldsTouched(true);
    }

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
        setIscustomer(false)
        setForm((prev) => ({
          ...prev,
          name: res.data.name || '',
          careof: res.data.careof || '',
          mobile: res.data.mobile || '',
        }));
        // setCustomerWallet(res.data.wallet)

      } else {
        setIscustomer(true)
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



  const executeUpdate = async () => {
    try {
      const res = await editMilkCollectionDetail(milkData.id, form);
      if (res.status_code === 200) {
        CustomToast.success(res.message);
        setShowConfirmChange(false);
        await onUpdate();
        onClose();
      } else {
        CustomToast.error(res.message);
      }
    } catch (error) {
      console.error("Error updating milk collection:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if account number has changed
    const isAccountChanged = form.customer_account_number !== milkData.customer_account_number;

    if (isAccountChanged) {
      setShowConfirmChange(true);
    } else {
      await executeUpdate();
    }
  };


  useEffect(() => {
    const fat = form.fat?.toString().trim();
    const clr = form.clr?.toString().trim();
    const snfRaw = form.snf?.toString().trim();
    const snfForApi = snfRaw && !snfRaw.includes('.') ? `${snfRaw}.0` : snfRaw;

    // ✅ Trigger only when FAT is present, and either SNF or CLR is updated
    if ((snfForApi || clr) && fat) {

      // Check if values have actually changed from milkData
      // Convert to numbers for robust comparison
      const currentFat = parseFloat(fat || '0');
      const originalFat = parseFloat(milkData?.fat || '0');
      const currentSnf = parseFloat(snfRaw || '0');
      const originalSnf = parseFloat(milkData?.snf || '0');
      const currentClr = parseFloat(clr || '0');
      const originalClr = parseFloat(milkData?.clr || '0');

      // Check differences with a small epsilon for float safety, or just direct value check
      const isFatChanged = milkData && Math.abs(currentFat - originalFat) > 0.001;
      const isSnfChanged = milkData && Math.abs(currentSnf - originalSnf) > 0.001;
      const isClrChanged = milkData && Math.abs(currentClr - originalClr) > 0.001;

      console.log('Comparison:', {
        currentFat, originalFat, isFatChanged,
        currentSnf, originalSnf, isSnfChanged,
        currentClr, originalClr, isClrChanged,
        rateFieldsTouched
      });

      // If we have milkData AND user has NOT touched the fields, skipt fetch.
      // We rely on the touched state primarily. 
      if (milkData && !rateFieldsTouched) {
        return;
      }

      const timeout = setTimeout(() => {
        const getBaseRateFetch = async () => {
          try {
            const res = await getMilkRate(fat, clr, snfForApi);
            console.log("milk rate fetch", res);

            setForm(prev => ({
              ...prev,
              fat: res.fat || "",
              clr: res.clr || "",
              snf: res.snf || "",
              base_rate: res.rate || '',
              rate: res.rate || '', // Update displayed rate as well
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
  }, [form.fat, form.snf, form.clr, milkData, rateFieldsTouched]);



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
            { label: 'Account No', name: 'customer_account_number', },
            { label: 'Name', name: 'name', readOnly: true },
            { label: 'Care of', name: 'careof', readOnly: true },
            { label: 'Milk Type', name: 'milk_type', type: 'select', options: ['cow', 'buffalo', 'other'] },
            { label: 'Shift', name: 'shift', type: 'select', options: ['morning', 'evening', 'both'] },
            { label: 'Mobile', name: 'mobile', readOnly: true },
            { label: 'Quantity', name: 'quantity', type: 'number' },
            { label: 'FAT', name: 'fat', type: 'number' },
            { label: 'SNF', name: 'snf', type: 'number' },
            // { label: 'Base Rate', name: 'base_rate', type: 'number' },
            { label: 'Rate', name: 'rate', type: 'number' },
            { label: 'Other Price', name: 'other_price', type: 'number' },
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
                  readOnly={readOnly}
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
              className={`${isCustomer ? 'bg-gray-300' : 'bg-[#E6612A] hover:bg-orange-600'}   text-white px-6 py-2 rounded`}
              disabled={loading || isCustomer}
            >
              {loading ? "Please wait..." : "Update"}
            </button>
          </div>
        </form>

        {/* Enhanced Confirmation Modal */}
        {showConfirmChange && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200">

              {/* Header / Icon */}
              <div className="bg-amber-50 p-6 flex flex-col items-center justify-center border-b border-amber-100">
                <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
                  <FiAlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center">Confirm Account Update</h3>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  You are changing the account number from{' '}
                  <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                    {milkData.customer_account_number}
                  </span>{' '}
                  to{' '}
                  <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">
                    {form.customer_account_number}
                  </span>
                  .
                  <br /><br />
                  <span className="text-sm text-gray-500">Are you sure you want to proceed with this update?</span>
                </p>

                {/* Buttons */}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setShowConfirmChange(false);
                      onClose(); // Close the main modal as requested
                    }}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors duration-200"
                  >
                    NO, Cancel
                  </button>
                  <button
                    onClick={executeUpdate}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-200 transition-all duration-200"
                  >
                    YES, Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  );
};

export default EditMilkCollectionModal;
