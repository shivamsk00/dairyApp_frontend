import React, { useState } from 'react';
import sampleImage from '../../assets/login_img.png';
import { colors } from '../../constant/constant';
import useHomeStore from '../../zustand/useHomeStore';
import DateFormate from '../../helper/DateFormate';
import DataTable from 'react-data-table-component';
import { FaEye, FaPen, FaTrashAlt } from 'react-icons/fa';
import { IoMdCloseCircle } from 'react-icons/io';

const MilkCorrectionPage = () => {
    const getMilkCorrectionData = useHomeStore(state => state.getMilkCorrectionData);

    const [selection, setSelection] = useState('all');
    const [milkData, setMilkData] = useState([]);
    const [searchCustomer, setSearchCustomer] = useState('');
    const [form, setForm] = useState({
        start_date: '',
        end_date: '',
        customer_account_number: ''
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedMilkEntry, setSelectedMilkEntry] = useState(null);
    const [milkToDelete, setMilkToDelete] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editableEntry, setEditableEntry] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectionChange = (value) => {
        setSelection(value);
        if (value === 'all') {
            setForm(prev => ({ ...prev, customer_account_number: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            start_date: DateFormate(form.start_date),
            end_date: DateFormate(form.end_date),
            data_type: selection,
            customer_account_number: selection === 'customer' ? form.customer_account_number : ''
        };

        console.log('Final Payload ===>', payload);
        const res = await getMilkCorrectionData(payload);
        console.log('Response ===>', res);
        if (res?.status_code == 200 && res.data?.milk_collections) {
            setMilkData(res.data.milk_collections);
        }
    };


    const handleSearch = (text) => {
        setSearchCustomer(text);
    };

    const filteredData = milkData.filter(item =>
        item.customer_account_number?.toLowerCase().includes(searchCustomer.toLowerCase())
    );



    const columns = [
        {
            name: 'ID',
            selector: row => row.id,
            sortable: true,
            width: '70px'
        },
        {
            name: 'Account Number',
            selector: row => row.customer_account_number,
            sortable: true,
        },
        {
            name: 'Date',
            selector: row => row.date,
            sortable: true,
        },
        {
            name: 'Milk Type',
            selector: row => row.milk_type,
            sortable: true,
        },
        {
            name: 'Shift',
            selector: row => row.shift,
        },
        {
            name: 'Quantity (Ltr)',
            selector: row => row.quantity,
        },
        {
            name: 'FAT',
            selector: row => row.fat,
        },
        {
            name: 'SNF',
            selector: row => row.snf,
        },
        {
            name: 'Rate',
            selector: row => row.base_rate,
        },
        {
            name: 'Amount',
            selector: row => row.total_amount,
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="flex gap-2 items-center justify-center">
                    <button
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                        onClick={() => {
                            setSelectedMilkEntry(row);
                            setIsModalOpen(true);
                        }}
                    >
                        <FaEye />
                    </button>
                    <button
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                        onClick={() => {
                            setEditableEntry(row);
                            setIsEditModalOpen(true);
                        }}
                    >
                        <FaPen />
                    </button>
                    <button
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                        onClick={() => {
                            setCustomerToDelete(row);
                            setIsConfirmOpen(true);
                        }}
                    >
                        <FaTrashAlt />
                    </button>
                </div>
            ),
            center: true
        }
    ];






    return (
        <div className="h-full p-5  flex flex-col gap-5">
            {/* Form Section */}
            <div className="w-full md:w-1/2 md:pr-6">
                <div className="bg-gradient-to-br from-orange-200 via-orange-100 to-yellow-50 rounded-xl shadow-lg p-6 w-full">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Milk Correction</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">From Date</label>
                            <input
                                type="date"
                                name="start_date"
                                value={form.start_date}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">To Date</label>
                            <input
                                type="date"
                                name="end_date"
                                value={form.end_date}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>

                        {/* Radio Buttons */}
                        <div>
                            <span className="block text-sm font-medium text-gray-600 mb-2">Select Option</span>
                            <div className="flex gap-6">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="selection"
                                        value="all"
                                        checked={selection === 'all'}
                                        onChange={() => handleSelectionChange('all')}
                                        className="text-blue-600"
                                    />
                                    <span className="ml-2">All</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="selection"
                                        value="customer"
                                        checked={selection === 'customer'}
                                        onChange={() => handleSelectionChange('customer')}
                                        className="text-blue-600"
                                    />
                                    <span className="ml-2">By Customer</span>
                                </label>
                            </div>
                        </div>

                        {/* Conditional Input for Account Number */}
                        {selection === 'customer' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Enter Account Number</label>
                                <input
                                    type="number"
                                    name="customer_account_number"
                                    value={form.customer_account_number}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    required
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                style={{ background: colors.buttonColor }}
                                type="submit"
                                className="w-full text-white py-2 rounded hover:opacity-90 transition"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>


            {
                filteredData.length > 0 && (
                    <div className='w-full shadow-xl p-4'>
                        <DataTable
                            columns={columns}
                            data={filteredData}
                            pagination
                            highlightOnHover
                            striped
                            dense
                            responsive
                            subHeader
                            subHeaderComponent={
                                <div className="flex justify-between items-center w-full">
                                    <h1 className="text-lg font-semibold">Milk Collection Summary</h1>
                                    <input
                                        type="text"
                                        placeholder="Search by account number..."
                                        value={searchCustomer}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="border px-3 py-1 text-sm rounded w-64 outline-none border-orange-600"
                                    />
                                </div>
                            }
                        />
                    </div>
                )
            }


            {/* VIEW DETAIL MODAL  */}
            {isModalOpen && selectedMilkEntry && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 p-6 relative overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-semibold text-orange-600 mb-6 border-b pb-3 flex items-center gap-2">
                            <FaEye className="w-6 h-6" />
                            Milk Collection Details
                        </h2>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
                            title="Close"
                        >
                            <IoMdCloseCircle size={30} />
                        </button>
                        <table className="w-full text-sm text-left border border-gray-200">
                            <tbody>
                                {[
                                    ['ID', selectedMilkEntry.id],
                                    ['Account Number', selectedMilkEntry.customer_account_number],
                                    ['Date', selectedMilkEntry.date],
                                    ['Milk Type', selectedMilkEntry.milk_type],
                                    ['Shift', selectedMilkEntry.shift],
                                    ['Quantity (Ltr)', selectedMilkEntry.quantity],
                                    ['FAT', selectedMilkEntry.fat],
                                    ['SNF', selectedMilkEntry.snf],
                                    ['Rate', selectedMilkEntry.base_rate],
                                    ['Amount', selectedMilkEntry.total_amount],
                                    ['Created At', new Date(selectedMilkEntry.created_at).toLocaleString()],
                                ].map(([label, value]) => (
                                    <tr key={label} className="border-b hover:bg-gray-50">
                                        <td className="font-medium text-gray-700 px-4 py-2 w-1/3 bg-gray-50">{label}</td>
                                        <td className="px-4 py-2">{value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-700 text-white px-5 py-2 rounded hover:bg-gray-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* EDIT MODAL  */}
            {isEditModalOpen && editableEntry && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 p-6 relative">
                        <h2 className="text-2xl font-semibold text-blue-600 mb-6 border-b pb-3 flex items-center gap-2">
                            <FaPen className="w-5 h-5" />
                            Edit Milk Entry
                        </h2>
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
                            title="Close"
                        >
                            <IoMdCloseCircle size={30} />
                        </button>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                console.log('Updated Entry:', editableEntry);
                                setIsEditModalOpen(false);
                                // You can call update API here if needed
                            }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            {/* Editable fields */}
                            {[
                                { label: 'Date', name: 'date', type: 'date' },
                                { label: 'Milk Type', name: 'milk_type', type: 'text' },
                                { label: 'Shift', name: 'shift', type: 'select' },  // 👈 updated type
                                { label: 'Quantity (Ltr)', name: 'quantity', type: 'number' },
                                { label: 'FAT', name: 'fat', type: 'number' },
                                { label: 'SNF', name: 'snf', type: 'number' },
                                { label: 'Rate', name: 'base_rate', type: 'number' },
                                { label: 'Amount', name: 'total_amount', type: 'number' },
                            ].map(({ label, name, type }) => (
                                <div key={name}>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>

                                    {type === 'select' ? (
                                        <select
                                            name={name}
                                            value={editableEntry[name] || ''}
                                            onChange={(e) => setEditableEntry({ ...editableEntry, [name]: e.target.value })}
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                            required
                                        >
                                            <option value="">Select Shift</option>
                                            <option value="morning">Morning</option>
                                            <option value="evening">Evening</option>
                                        </select>
                                    ) : (
                                        <input
                                            type={type}
                                            name={name}
                                            value={editableEntry[name] || ''}
                                            onChange={(e) => setEditableEntry({ ...editableEntry, [name]: e.target.value })}
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                            required
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="sm:col-span-2 text-right mt-4">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
};

export default MilkCorrectionPage;
