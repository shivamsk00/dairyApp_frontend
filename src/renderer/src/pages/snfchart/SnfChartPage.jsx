import React, { useState } from 'react';
import Chart from './Chart';

const SnfChartPage = () => {
    const [formValues, setFormValues] = useState({
        A: 4,
        B: 0.2,
        C: 0.66,
    });

    const [saveTrigger, setSaveTrigger] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSaveTrigger((prev) => prev + 1); // trigger Chart to recalculate
        alert(`Saved!\nA: ${formValues.A}, B: ${formValues.B}, C: ${formValues.C}`);
    };

    const handleReset = () => {
        setFormValues({
            A: 4,
            B: 0.2,
            C: 0.66,
        });
    };

    return (
        <>
            <section className="container mx-auto p-6">
                <div className="flex justify-center items-center mb-8">
                    <form
                        onSubmit={handleSave}
                        className="w-full max-w-md p-6 border rounded-lg shadow-md bg-gray-50"
                    >
                        <h2 className="text-xl font-semibold text-center mb-6">SNF Formula</h2>
                        <p className="text-center text-sm mb-6">(CLR / A) + (B * FAT) + C</p>

                        <label className="block text-sm font-medium mb-2">A:</label>
                        <input
                            type="number"
                            name="A"
                            value={formValues.A}
                            onChange={handleChange}
                            step="any"
                            className="w-full p-3 mb-4 border rounded-lg text-sm"
                        />

                        <label className="block text-sm font-medium mb-2">B:</label>
                        <input
                            type="number"
                            name="B"
                            value={formValues.B}
                            onChange={handleChange}
                            step="any"
                            className="w-full p-3 mb-4 border rounded-lg text-sm"
                        />

                        <label className="block text-sm font-medium mb-2">C:</label>
                        <input
                            type="number"
                            name="C"
                            value={formValues.C}
                            onChange={handleChange}
                            step="any"
                            className="w-full p-3 mb-6 border rounded-lg text-sm"
                        />

                        <div className="flex justify-between items-center">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                <Chart formValues={formValues} trigger={saveTrigger} />
            </section>
        </>
    );
};

export default SnfChartPage;
