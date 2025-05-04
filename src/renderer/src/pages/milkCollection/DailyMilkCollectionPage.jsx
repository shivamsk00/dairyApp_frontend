import React, { useState } from 'react';

const DailyMilkCollectionPage = () => {
    const [milkType, setMilkType] = useState('cow');
    const [form, setForm] = useState({
        quantity: '',
        clr: '',
        fat: '',
        snf: '',
        baseRate: '',
        otherPrice: '',
        accountNo: '',
        name: '',
        spouse: '',
        mobile: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Milk Collection:', { milkType, ...form });
    };

    return (
        <div className="w-full p-4">
            <h2 className="text-2xl font-bold mb-4">Daily Milk Collection</h2>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-6">
                {/* Milk Type Selection */}
                <div className="flex gap-6 items-center">
                    <label className="font-semibold">Milk Type:</label>
                    {['cow', 'buffalo', 'other'].map(type => (
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

                {/* Input Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Quantity (Ltr)</label>
                        <input
                            type="number"
                            name="quantity"
                            value={form.quantity}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">CLR</label>
                        <input
                            type="number"
                            name="clr"
                            value={form.clr}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">FAT (%)</label>
                        <input
                            type="number"
                            name="fat"
                            value={form.fat}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">SNF (%)</label>
                        <input
                            type="number"
                            name="snf"
                            value={form.snf}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Base Rate (₹/Ltr)</label>
                        <input
                            type="number"
                            name="baseRate"
                            value={form.baseRate}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Other Price (₹/Ltr)</label>
                        <input
                            type="number"
                            name="otherPrice"
                            value={form.otherPrice}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded px-3 py-2"
                        />
                    </div>
                </div>

                {/* Side Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Account No</label>
                        <input
                            type="text"
                            name="accountNo"
                            value={form.accountNo}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Spouse</label>
                        <input
                            type="text"
                            name="spouse"
                            value={form.spouse}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Mobile</label>
                        <input
                            type="text"
                            name="mobile"
                            value={form.mobile}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded px-3 py-2"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full text-white py-2 rounded"
                >
                    Submit Collection
                </button>
            </form>
        </div>
    );
};

export default DailyMilkCollectionPage;
