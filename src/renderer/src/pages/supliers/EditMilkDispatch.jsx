import React, { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import CustomToast from '../../helper/costomeToast';
import useDailyMilkDispatchStore from '../../zustand/useMilkDispatchStore';

const EditMilkDispatchModal = ({ isOpen, onClose, milkDispatchData }) => {
    console.log("milkDispatch data", milkDispatchData)
    const updateMilkDispatch = useDailyMilkDispatchStore(state => state.updateMilkDispatch)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        dispatch_date: '',
        head_dairy_id: '',
        shift: '',
        vehicle_no: '',
        total_qty: '',
        total_amount: '',
        notes: '',
        milk_details: [],
    });

    useEffect(() => {
        if (milkDispatchData) {
            setForm({
                dispatch_date: formatDateForInput(milkDispatchData.dispatch_date),
                head_dairy_id: milkDispatchData.head_dairy.id,
                shift: milkDispatchData.shift,
                vehicle_no: milkDispatchData.vehicle_no,
                total_qty: milkDispatchData.total_qty,
                total_amount: milkDispatchData.total_amount,
                notes: milkDispatchData.notes || '',
                milk_details: milkDispatchData.milk_details || [],
            });
        }
    }, [milkDispatchData]);

    const formatDateForInput = (dateString) => {
        const d = new Date(dateString);
        return d.toISOString().split('T')[0];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleMilkDetailChange = (index, field, value) => {
        const updatedDetails = [...form.milk_details];
        updatedDetails[index][field] = value;

        // Optionally recalculate amount
        if (['qty', 'rate'].includes(field)) {
            const qty = parseFloat(updatedDetails[index].qty || 0);
            const rate = parseFloat(updatedDetails[index].rate || 0);
            updatedDetails[index].amount = (qty * rate).toFixed(2);
        }

        setForm(prev => ({
            ...prev,
            milk_details: updatedDetails,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true)
            const res = await updateMilkDispatch(milkDispatchData?.id, form);
            console.log("response ====>", res)
            if (res.status_code == 200) {
                CustomToast.success(res.message)
                setLoading(false)
                onClose()
            } else {
                CustomToast.error(res.message)

            }
        } catch (error) {
            console.log("ERROR IN UPDATE EDITMILKDISPATCH", error)
            setLoading(false)
        } finally {
            setLoading(false)
        }

    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-5 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-lg w-1/2  p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Edit Milk Dispatch</h2>

                    <button
                        className=" top-2 p-2 rounded-md right-4 text-white text-xl"
                        onClick={onClose}
                    >
                        <IoMdClose />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Dispatch Date</label>
                        <input
                            type="date"
                            name="dispatch_date"
                            value={form.dispatch_date}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Header Dairy</label>
                        <input
                            type="text"
                            name="head_dairy_id"
                            value={form.head_dairy_id}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Shift</label>
                        <select
                            name="shift"
                            value={form.shift}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded"
                            required
                        >
                            <option value="" disabled>Select shift</option>
                            <option value="morning">Morning</option>
                            <option value="evening">Evening</option>
                        </select>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Milk Details</h3>
                        {form.milk_details.map((detail, index) => (
                            <div key={index} className="mb-4 border p-3 rounded-md bg-gray-50">
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    <div>
                                        <label className="block text-sm">Milk Type</label>
                                        <input
                                            type="text"
                                            value={detail.milk_type}
                                            readOnly
                                            className="w-full border px-2 py-1 rounded bg-gray-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm">Qty (L)</label>
                                        <input
                                            type="number"
                                            value={detail.qty}
                                            onChange={e => handleMilkDetailChange(index, 'qty', e.target.value)}
                                            className="w-full border px-2 py-1 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm">Fat</label>
                                        <input
                                            type="number"
                                            value={detail.fat}
                                            onChange={e => handleMilkDetailChange(index, 'fat', e.target.value)}
                                            className="w-full border px-2 py-1 rounded"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-sm">SNF</label>
                                        <input
                                            type="number"
                                            value={detail.snf}
                                            onChange={e => handleMilkDetailChange(index, 'snf', e.target.value)}
                                            className="w-full border px-2 py-1 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm">Rate</label>
                                        <input
                                            type="number"
                                            value={detail.rate}
                                            onChange={e => handleMilkDetailChange(index, 'rate', e.target.value)}
                                            className="w-full border px-2 py-1 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm">Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={detail.amount}
                                            readOnly
                                            className="w-full border px-2 py-1 rounded bg-gray-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Vehicle No</label>
                        <input
                            type="text"
                            name="vehicle_no"
                            value={form.vehicle_no}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded"
                            required
                        />
                    </div>

                    <div className="flex space-x-4">
                        <div className="w-1/2">
                            <label className="block mb-1 font-medium">Total Quantity (L)</label>
                            <input
                                type="number"
                                name="total_qty"
                                value={form.total_qty}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded"
                                required
                            />
                        </div>

                        <div className="w-1/2">
                            <label className="block mb-1 font-medium">Total Amount (₹)</label>
                            <input
                                type="number"
                                name="total_amount"
                                value={form.total_amount}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded"
                                required
                            />
                        </div>
                    </div>

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

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {loading ? "Updating..." : "Upadate"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMilkDispatchModal;
