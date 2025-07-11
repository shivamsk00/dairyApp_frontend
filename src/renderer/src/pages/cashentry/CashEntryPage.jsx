import React, { useEffect, useState } from 'react';
import CustomToast from '../../helper/costomeToast';
import useHomeStore from '../../zustand/useHomeStore';
import DateFormate from '../../helper/DateFormate';

const CashEntryPage = () => {
  const today = new Date().toISOString().split('T')[0];

  const [entryType, setEntryType] = useState('');
  const [headDairies, setHeadDairies] = useState([]);

  const [form, setForm] = useState({
    customer_account_number: '',
    head_dairy_id: '',
    date: today,
    amount: '',
    credit_debit_mode: '',
    note: '',
  });

  const fetchHeadDairies = useHomeStore(state => state.fetchHeadDairies);
  const submitCashEntry = useHomeStore(state => state.submitCashEntry); // create this in zustand

  useEffect(() => {
    const loadHeadDairies = async () => {
      try {
        const res = await fetchHeadDairies();
        if (res.status_code === 200) {
          setHeadDairies(res.data.data);
        }
      } catch (error) {
        console.log("Error fetching head dairies", error);
      }
    };

    loadHeadDairies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!entryType) return CustomToast.error("Please select entry type");
    if (entryType === 'customer' && !form.customer_account_number.trim()) return CustomToast.error("Enter account number");
    if (entryType === 'head_dairy' && !form.head_dairy_id) return CustomToast.error("Select head dairy");

    try {
    //   const payload = {
    //     ...form,
    //     date: DateFormate(form.date),
    //     head_dairy_id: entryType === 'head_dairy' ? form.head_dairy_id : null,
    //     customer_account_number: entryType === 'customer' ? form.customer_account_number : null,
    //   };
 const payload = {
  date: DateFormate(form.date),
  amount: form.amount,
  credit_debit_mode: form.credit_debit_mode || null,
  note: form.note,
  customer_account_number: entryType === 'customer' ? form.customer_account_number : null,
  head_dairy_id: entryType === 'head_dairy' ? form.head_dairy_id : null,
};
      const res = await submitCashEntry(payload);

      if (res.status_code === 200) {
        CustomToast.success(res.message);
        setForm({
          customer_account_number: '',
          head_dairy_id: '',
          date: today,
          amount: '',
          credit_debit_mode: '',
          note: '',
        });
        setEntryType('');
      } else {
        CustomToast.error(res.message);
      }
    } catch (error) {
      console.log("Submission error", error);
      CustomToast.error("Failed to submit cash entry");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4 text-center">Cash Entry</h2>

      {/* Entry Type */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">Entry For:</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="entryType"
              value="customer"
              checked={entryType === 'customer'}
              onChange={() => {
                setEntryType('customer');
                setForm(prev => ({ ...prev, head_dairy_id: '' }));
              }}
            />
            Customer
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="entryType"
              value="head_dairy"
              checked={entryType === 'head_dairy'}
              onChange={() => {
                setEntryType('head_dairy');
                setForm(prev => ({ ...prev, customer_account_number: '' }));
              }}
            />
            Head Dairy
          </label>
        </div>
      </div>

      {/* Conditional Input */}
      {entryType === 'customer' && (
        <div className="mb-4">
          <label className="block font-medium mb-1">Customer Account No</label>
          <input
            type="text"
            name="customer_account_number"
            value={form.customer_account_number}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter account number"
          />
        </div>
      )}

      {entryType === 'head_dairy' && (
        <div className="mb-4">
          <label className="block font-medium mb-1">Select Head Dairy</label>
          <select
            name="head_dairy_id"
            value={form.head_dairy_id}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Select --</option>
            {headDairies.map(dairy => (
              <option key={dairy.id} value={dairy.id}>{dairy.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Date */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          max={today}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {/* Amount */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Amount</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {/* Credit/Debit Mode */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Mode</label>
        <select
          name="credit_debit_mode"
          value={form.credit_debit_mode}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">-- Select --</option>
          <option value="received">Received</option>
          <option value="given">Given</option>
        </select>
      </div>

      {/* Note */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Note</label>
        <textarea
          name="note"
          value={form.note}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          rows={3}
          placeholder="Enter note"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Submit
      </button>
    </div>
  );
};

export default CashEntryPage;
