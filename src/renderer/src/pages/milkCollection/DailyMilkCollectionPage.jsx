import React, { useState, useEffect } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import { toast } from 'react-toastify';
import { FaEye, FaPen } from 'react-icons/fa';
import { FaTrashCan } from 'react-icons/fa6';
import CustomToast from '../../helper/costomeToast';

const DailyMilkCollectionPage = () => {
    const fetchCustomerDetailsByAccount = useHomeStore(state => state.fetchCustomerDetailsByAccount);
    const submitMilkCollection = useHomeStore(state => state.submitMilkCollection);
    const getMilkRate = useHomeStore(state => state.getMilkRate);

    const [milkType, setMilkType] = useState('cow');
    const [form, setForm] = useState({
        accountNo: '',
        name: '',
        spouse: '',
        mobile: '',
        quantity: '',
        clr: '',
        fat: '',
        snf: '',
        baseRate: '',
        otherPrice: '',
        rate: '',
        amount: '',
    });
    const [collections, setCollections] = useState([]);

    const fetchCustomerDetailByAccountNumber = async (accountNo) => {
        console.log('Fetching customer details for:', accountNo);
        try {
            const res = await fetchCustomerDetailsByAccount(accountNo); // Your zustand API call
            console.log('Customer response:', res);
            if (res.status_code == 200) {
                CustomToast.success(res.message)
                setForm((prev) => ({
                    ...prev,
                    name: res.data.name || '',
                    spouse: res.data.spouse || '',
                    mobile: res.data.mobile || '',
                }));
            } else {

               CustomToast.error(res.message)
                setForm((prev) => ({
                    ...prev,
                    name: '',
                    spouse: '',
                    mobile: '',
                }));
            }
        } catch (error) {
            console.error('Error fetching customer details:', error);
            setForm((prev) => ({
                ...prev,
                name: '',
                spouse: '',
                mobile: '',
            }));
        }
    };


    useEffect(() => {
        const timeout = setTimeout(() => {
            const fat = form.fat?.trim();
            const clr = form.clr?.trim();
            const snf = form.snf;

            // Jab fat ho aur clr ya snf me se koi ek ho
            if (fat && (clr || snf)) {
                const getBaseRateFetch = async () => {
                    try {
                        const res = await getMilkRate(fat, clr, snf);
                        console.log("milk rate fetch", res);
                        if (res.status_code == 200) {
                            setForm(prev => ({
                                ...prev,
                                fat: res.fat || prev.fat,
                                clr: res.clr || prev.clr,
                                snf: res.snf || prev.snf,
                                baseRate: res.rate || '',
                            }));
                        } else {
                            setForm(prev => ({
                                ...prev,
                                fat: res.fat || prev.fat,
                                clr: res.clr || prev.clr,
                                snf: res.snf || prev.snf,
                                baseRate: res.rate || '',
                            }));
                        }
                    } catch (error) {
                        console.error("Error fetching milk rate:", error);
                    }
                };

                getBaseRateFetch();
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [form.fat]); // ✅ sirf fat input hone par chalega




    // Calculate rate and amount automatically
    useEffect(() => {
        const { fat, snf, baseRate, otherPrice, quantity } = form;
        const f = parseFloat(fat) || 0;
        const s = parseFloat(snf) || 0;
        const b = parseFloat(baseRate) || 0;
        const o = parseFloat(otherPrice) || 0;
        const q = parseFloat(quantity) || 0;
        const rate = q * b;
        const amount = rate + o;

        setForm((prev) => ({
            ...prev,
            rate: rate.toFixed(2),
            amount: amount.toFixed(2),
        }));
    }, [form.fat, form.snf, form.baseRate, form.otherPrice, form.quantity]);


    // Debounced fetch on account number input
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (form.accountNo) {
                fetchCustomerDetailByAccountNumber(form.accountNo);
            } else {
                setForm((prev) => ({
                    ...prev,
                    name: '',
                    spouse: '',
                    mobile: '',
                }));
            }
        }, 500); // wait 500ms after user stops typing

        return () => clearTimeout(timeout); // cleanup on next input
    }, [form.accountNo]);




    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await submitMilkCollection();
            if (res.status_code == 200) {

            }
        } catch (error) {

        }

        // setCollections((prev) => [...prev, { milkType, ...form }]);
        // setForm({
        //     accountNo: '',
        //     name: '',
        //     spouse: '',
        //     mobile: '',
        //     quantity: '',
        //     clr: '',
        //     fat: '',
        //     snf: '',
        //     baseRate: '',
        //     otherPrice: '',
        //     rate: '',
        //     amount: '',
        // });
    };



    const handleRemove = (index) => {
        setCollections(prev => prev.filter((_, i) => i !== index));
    };

    const isDisabled = !form.name; // Disable if customer data not loaded

    return (
        <div className="w-full p-4">
            <h2 className="text-2xl font-bold mb-4">Daily Milk Collection</h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md max-w-5xl mx-auto">
                {/* Milk Type Selection */}
                <div className="flex gap-6 items-center mb-6">
                    <label className="font-semibold">Milk Type:</label>
                    {['cow', 'buffalo', 'other'].map((type) => (
                        <label key={type} className="flex items-center gap-1 capitalize">
                            <input
                                type="radio"
                                name="milkType"
                                value={type}
                                checked={milkType === type}
                                onChange={() => setMilkType(type)}
                            />
                            {type}
                        </label>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Customer Info */}
                    <div className="space-y-4">
                        {[{ name: 'accountNo', label: 'Account No' },
                        { name: 'name', label: 'Name' },
                        { name: 'spouse', label: 'Spouse' },
                        { name: 'mobile', label: 'Mobile' },
                        ].map(({ name, label }) => (
                            <div key={name}>
                                <label className="block text-sm font-medium">{label}</label>
                                <input
                                    type="text"
                                    name={name}
                                    value={form[name]}
                                    onChange={handleChange}
                                    disabled={name !== 'accountNo' && isDisabled}
                                    className="mt-1 w-full border rounded px-3 py-2"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Milk Info */}
                    <div className="grid grid-cols-2 gap-4">
                        {[{ name: 'quantity', label: 'Quantity (Ltr)' },
                        { name: 'clr', label: 'CLR' },
                        { name: 'fat', label: 'FAT (%)' },
                        { name: 'snf', label: 'SNF (%)' },
                        { name: 'baseRate', label: 'Base Rate (₹/Ltr)' },
                        { name: 'otherPrice', label: 'Other Price (₹/Ltr)' },
                        { name: 'rate', label: 'Rate (Auto)', readOnly: true },
                        { name: 'amount', label: 'Amount (Auto)', readOnly: true },
                        ].map(({ name, label, readOnly }) => (
                            <div key={name}>
                                <label className="block text-sm font-medium">{label}</label>
                                <input
                                    type="number"
                                    name={name}
                                    value={form[name]}
                                    onChange={handleChange}
                                    readOnly={readOnly}
                                    disabled={isDisabled}
                                    className="mt-1 w-full border rounded px-3 py-2"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isDisabled}
                    className={`mt-6 w-full  text-white py-2 rounded  transition ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Submit Collection
                </button>
            </form>

            {/* Submitted Table */}
            <div className="mt-8 max-w-5xl mx-auto">
                <h3 className="text-xl font-semibold mb-4">Submitted Collections</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-2 py-1 text-sm">Milk Type</th>
                                <th className="border px-2 py-1 text-sm">Account No</th>
                                <th className="border px-2 py-1 text-sm">Name</th>
                                <th className="border px-2 py-1 text-sm">Quantity</th>
                                <th className="border px-2 py-1 text-sm">FAT</th>
                                <th className="border px-2 py-1 text-sm">SNF</th>
                                <th className="border px-2 py-1 text-sm">Rate</th>
                                <th className="border px-2 py-1 text-sm">Amount</th>
                                <th className="border px-2 py-1 text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {collections.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center text-gray-500 py-4">
                                        Data not available
                                    </td>
                                </tr>
                            ) : (
                                collections.map((item, i) => (
                                    <tr key={i}>
                                        <td className="border px-2 py-1 text-sm text-center">{item.milkType}</td>
                                        <td className="border px-2 py-1 text-sm text-center">{item.accountNo}</td>
                                        <td className="border px-2 py-1 text-sm text-center">{item.name}</td>
                                        <td className="border px-2 py-1 text-sm text-center">{item.quantity}</td>
                                        <td className="border px-2 py-1 text-sm text-center">{item.fat}</td>
                                        <td className="border px-2 py-1 text-sm text-center">{item.snf}</td>
                                        <td className="border px-2 py-1 text-sm text-center">{item.rate}</td>
                                        <td className="border px-2 py-1 text-sm text-center">{item.amount}</td>
                                        <td className="border px-2 py-1 text-sm text-center">
                                            <div className="flex gap-2 items-center justify-center">
                                                <button
                                                    className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                                                    onClick={() => alert(`Viewing: ${item.accountNo}`)}
                                                >
                                                    <FaEye size={15} />
                                                </button>
                                                <button
                                                    className="px-2 py-1 text-xs bg-yellow-500 text-white rounded"
                                                    onClick={() => alert(`Editing: ${item.accountNo}`)}
                                                >
                                                    <FaPen />
                                                </button>
                                                <button
                                                    className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                                                    onClick={() => handleRemove(i)}
                                                >
                                                    <FaTrashCan />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DailyMilkCollectionPage;
