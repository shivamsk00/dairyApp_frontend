import React, { useState, useEffect } from 'react';

const dummyCustomers = {
    '1001': { name: 'Ramesh', spouse: 'Sita', mobile: '9876543210' },
    '1002': { name: 'Suresh', spouse: 'Gita', mobile: '8765432109' },
    '1003': { name: 'Naresh', spouse: 'Rita', mobile: '7654321098' },
};

const DailyMilkCollectionPage = () => {
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

    useEffect(() => {
        const { fat, snf, baseRate, otherPrice, quantity } = form;
        const f = parseFloat(fat) || 0;
        const s = parseFloat(snf) || 0;
        const b = parseFloat(baseRate) || 0;
        const o = parseFloat(otherPrice) || 0;
        const q = parseFloat(quantity) || 0;
        const rate = (f + s) * b + o;
        const amount = rate * q;

        setForm((prev) => ({
            ...prev,
            rate: rate.toFixed(2),
            amount: amount.toFixed(2),
        }));
    }, [form.fat, form.snf, form.baseRate, form.otherPrice, form.quantity]);

    useEffect(() => {
        const customer = dummyCustomers[form.accountNo];
        if (customer) {
            setForm((prev) => ({
                ...prev,
                ...customer,
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                name: '',
                spouse: '',
                mobile: '',
            }));
        }
    }, [form.accountNo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setCollections((prev) => [...prev, { milkType, ...form }]);
        setForm({
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
    };

    const handleRemove = (index) => {
        setCollections(prev => prev.filter((_, i) => i !== index));
    };

    const isDisabled = !dummyCustomers[form.accountNo];

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
                <h3> DUMMY ACCOUNT NUMBER(1001, 1002, 1003)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column - Customer Info */}

                    <div className="space-y-4">
                        {[
                            { name: 'accountNo', label: 'Account No' },
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

                    {/* Right Column - Milk Info */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { name: 'quantity', label: 'Quantity (Ltr)' },
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
                    className={`mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    Submit Collection
                </button>
            </form>

            {/* Table after submission */}
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
                                        <td className="border px-2 py-1 text-sm">{item.milkType}</td>
                                        <td className="border px-2 py-1 text-sm">{item.accountNo}</td>
                                        <td className="border px-2 py-1 text-sm">{item.name}</td>
                                        <td className="border px-2 py-1 text-sm">{item.quantity}</td>
                                        <td className="border px-2 py-1 text-sm">{item.fat}</td>
                                        <td className="border px-2 py-1 text-sm">{item.snf}</td>
                                        <td className="border px-2 py-1 text-sm">{item.rate}</td>
                                        <td className="border px-2 py-1 text-sm">{item.amount}</td>
                                        <td className="border px-2 py-1 text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                                                    onClick={() => alert(`Viewing: ${item.accountNo}`)}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    className="px-2 py-1 text-xs bg-yellow-500 text-white rounded"
                                                    onClick={() => alert(`Editing: ${item.accountNo}`)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                                                    onClick={() => handleRemove(i)}
                                                >
                                                    Remove
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
