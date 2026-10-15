import React, { useState, useEffect } from 'react';
import useDailyMilkSaleStore from '../../zustand/useDailyMilkSaleStore';

const EditeMilkSale = ({ dailyMilkSaleId, onSubmit, onCancel }) => {
    const getDailyMilkSaleDataForEdit = useDailyMilkSaleStore(
        state => state.getDailyMilkSaleDataForEdit
    );

    const [form, setForm] = useState({
        customer_account_number: '',
        customer_name: '',
        sale_date: '',
        shift: '',
        milk_type: '',
        quentity: '',
        rate_per_liter: '',
        payment_mode: '',
        notes: '',
    });

    // Fetch data for editing
    useEffect(() => {
        const fetchEditData = async () => {
            try {
                const res = await getDailyMilkSaleDataForEdit(dailyMilkSaleId?.id);
                const {
                    customer_account_number,
                    customer_name,
                    sale_date,
                    shift,
                    milk_type,
                    quentity,
                    rate_per_liter,
                    payment_mode,
                    notes,
                } = res.data;

                setForm({
                    customer_account_number,
                    customer_name,
                    sale_date: formatDateForInput(sale_date), // e.g. 2025-06-08
                    shift,
                    milk_type: milk_type.toLowerCase(), // normalize spelling
                    quentity,
                    rate_per_liter,
                    payment_mode,
                    notes,
                });
            } catch (error) {
                console.error("Error fetching milk sale data", error);
            }
        };

        fetchEditData();
    }, [dailyMilkSaleId]);

    const formatDateForInput = (dateString) => {
        const d = new Date(dateString);
        return d.toISOString().split('T')[0]; // converts to YYYY-MM-DD
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({
            ...form,
            total_amount: (parseFloat(form.quentity || 0) * parseFloat(form.rate_per_liter || 0)).toFixed(2),
        });
    };

    const totalAmount = (
        parseFloat(form.quentity || 0) * parseFloat(form.rate_per_liter || 0)
    ).toFixed(2);

    return (
        <div className="w-full p-4 bg-white rounded shadow">
            <h2 className="text-2xl font-semibold mb-4">Edit Daily Milk Sale</h2>
            <form onSubmit={handleSubmit} className="space-y-4 w-full">

                 {/* Acc No. */}
                <div>
                    <label className="block mb-1 font-medium">Acc No.</label>
                    <input
                        type="text"
                        value={form.customer_account_number}
                        readOnly
                        className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-700"
                    />
                </div>
                 {/* Customer Name */}
                <div>
                    <label className="block mb-1 font-medium">Customer Name</label>
                    <input
                        type="text"
                        value={form.customer_name}
                        readOnly
                        className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-700"
                    />
                </div>
                {/* Sale Date */}
                <div>
                    <label className="block mb-1 font-medium">Sale Date</label>
                    <input
                        type="date"
                        name="sale_date"
                        value={form.sale_date}
                        onChange={handleChange}
                        required
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>

                {/* Shift */}
                <div>
                    
                    <label className="block mb-1 font-medium">Shift</label>
                    <select
                        name="shift"
                        value={form.shift}
                        onChange={handleChange}
                        required
                        className="w-full border px-3 py-2 rounded"
                    >
                        <option value="" disabled>Select shift</option>
                        <option value="morning">Morning</option>
                        <option value="evening">Evening</option>
                    </select>
                </div>

                {/* Milk Type */}
                <div>
                    <label className="block mb-1 font-medium">Milk Type</label>
                    <select
                        name="milk_type"
                        value={form.milk_type}
                        onChange={handleChange}
                        required
                        className="w-full border px-3 py-2 rounded"
                    >
                        <option value="" disabled>Select milk type</option>
                        <option value="cow">Cow</option>
                        <option value="buffalo">Buffalo</option>
                    </select>
                </div>

                {/* Quantity */}
                <div>
                    <label className="block mb-1 font-medium">Quantity (Ltr)</label>
                    <input
                        type="number"
                        name="quentity"
                        value={form.quentity}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>

                {/* Rate Per Liter */}
                <div>
                    <label className="block mb-1 font-medium">Rate per Liter (₹)</label>
                    <input
                        type="number"
                        name="rate_per_liter"
                        value={form.rate_per_liter}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>

                {/* Total Amount (auto) */}
                <div>
                    <label className="block mb-1 font-medium">Total Amount (₹)</label>
                    <input
                        type="text"
                        value={totalAmount}
                        readOnly
                        className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-700"
                    />
                </div>

                {/* Payment Mode */}
                <div>
                    <label className="block mb-1 font-medium">Payment Mode</label>
                    <select
                        name="payment_mode"
                        value={form.payment_mode}
                        onChange={handleChange}
                        required
                        className="w-full border px-3 py-2 rounded"
                    >
                        <option value="" disabled>Select payment mode</option>
                        <option value="cash">Cash</option>
                        <option value="online">Online</option>
                    </select>
                </div>

                {/* Notes */}
                <div>
                    <label className="block mb-1 font-medium">Notes</label>
                    <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        rows="3"
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Optional notes"
                    ></textarea>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditeMilkSale;
