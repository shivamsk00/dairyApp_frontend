import React, { useEffect, useState } from 'react';
import sampleImage from '../../assets/login_img.png';
import { colors } from '../../constant/constant';
import useHomeStore from '../../zustand/useHomeStore';
import DateFormate from '../../helper/DateFormate';
import DataTable from 'react-data-table-component';
import { FaEye, FaPen, FaTrashAlt } from 'react-icons/fa';
import { IoMdCloseCircle } from 'react-icons/io';
import EditMilkCollectionModal from '../milkCollection/EditMilkCollectionPage';
import CustomToast from '../../helper/costomeToast';
import { BsFillPrinterFill } from 'react-icons/bs';

const MilkCorrectionPage = () => {
    const getMilkCorrectionData = useHomeStore(state => state.getMilkCorrectionData);
    const deleteMilkCollection = useHomeStore(state => state.deleteMilkCollection);
    const today = new Date().toISOString().split('T')[0];
    const [loading, setLoading] = useState(false)
    const [selection, setSelection] = useState('all');
    const [milkData, setMilkData] = useState([]);
    const [searchCustomer, setSearchCustomer] = useState('');
    const [form, setForm] = useState({
        start_date: today,
        end_date: today,
        customer_account_number: ''
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedMilkEntry, setSelectedMilkEntry] = useState(null);
    const [milkToDelete, setMilkToDelete] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editableEntry, setEditableEntry] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalMilk, setTotalMilk] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [averageFat, setAverageFat] = useState(0);
    const [averageSnf, setAvrageSnf] = useState(0);


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
        if (e) e.preventDefault(); // ✅ prevent error when called without event

        try {
            setLoading(true)
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
                setTotalMilk(res.data.totalMilk || 0);
                setTotalAmount(res.data.totalAmount || 0);
                setAverageFat(res.data.averageFat || 0);
                setAvrageSnf(res.data.averageSnf || 0);
                setLoading(false)
            }

        } catch (error) {
            console.log("ERROR IN MILK CORRECTION PAGE ==>", error)
            setLoading(false)

        } finally {
            setLoading(false)

        }

    };

    const handleSearch = (text) => {
        setSearchCustomer(text);
    };

    const filteredData = milkData.filter(item =>
        item.customer_account_number?.toLowerCase().includes(searchCustomer.toLowerCase())
    );

    // PRINT HANLDER
    const handlePrint = (data) => {
        const shift = data.shift === 'morning' ? 'M' : 'E';
        const now = new Date();
        const localTime = now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const slipData = {
            account_no: data.customer_account_number,
            customer: data.name,
            date: data.date,
            time: `${localTime}(${shift})`, // ✅ Local time here
            // shift: data.shift,
            // milk_type: data.milk_type,
            qty: `${data.quantity} / Ltr`,
            fat: data.fat,
            snf: data.snf,
            // oth_rate: data.oth_rate || "0.00",
            // base_rate: data.base_rate,
            rate: `${data.base_rate} / Ltr`,
            total: data.total_amount
        };

        window.api.printSlip(slipData);
    };


    const columns = [
        {
            name: 'SR NO.',
            cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
            width: '100px',
            sortable: false
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
                    <button className="bg-blue-700 text-white px-2 py-1 rounded text-xs" onClick={() => handlePrint(row)}>
                        <BsFillPrinterFill size={12} color="#fff" />
                    </button>
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
                            setMilkToDelete(row);
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


    // DELETE RECORD 
    const handleRemove = async (id) => {
        console.log("milkToDelete?.id", milkToDelete?.id)
        try {
            const res = await deleteMilkCollection(milkToDelete?.id);
            console.log("respone===> ", res)
            if (res.status_code == 200) {
                CustomToast.success(res.message)
                setIsConfirmOpen(false);
                setMilkToDelete(null);
                await handleSubmit()
            } else {
                CustomToast.success(res.message)

            }
        } catch (error) {
            console.log("ERROR IN MILK CORRECTION DELETE ROW DATA", error)
        }
    };







    return (
        <div className="h-full p-5  flex flex-col gap-5">
            {/* Form Section */}
            <div className="w-full md:w-1/2 md:pr-6 ">
                <div className="bg-gradient-to-br from-orange-200 via-orange-100 to-yellow-50 rounded-xl shadow-lg p-6 w-full">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Milk Correction</h2>
                    <form onSubmit={handleSubmit} className="space-y-2">
                        {/* From and To Date in one row */}
                        <div className="flex flex-col md:flex-row gap-2">
                            {/* Start Date */}
                            <div className="w-full">
                                <label className="block text-[13px] font-medium text-gray-600 mb-1">From Date</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={form.start_date}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-1 text-[13px]"
                                    required
                                />
                            </div>

                            {/* End Date */}
                            <div className="w-full">
                                <label className="block text-[13px] font-medium text-gray-600 mb-1">To Date</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={form.end_date}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-1 text-[13px]"
                                    required
                                />
                            </div>
                        </div>

                        {/* Radio Buttons */}
                        <div>
                            <span className="block text-[13px] font-medium text-gray-600 mb-2">Select Option</span>
                            <div className="flex gap-2">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="selection"
                                        value="all"
                                        checked={selection === 'all'}
                                        onChange={() => handleSelectionChange('all')}
                                        className="text-blue-600 text-[13px]"
                                    />
                                    <span className="ml-2 text-[13px]">All</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="selection"
                                        value="customer"
                                        checked={selection === 'customer'}
                                        onChange={() => handleSelectionChange('customer')}
                                        className="text-blue-600 text-[13px]"
                                    />
                                    <span className="ml-2 text-[13px]">By Customer</span>
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
                                disabled={loading}
                                style={{ background: loading ? "#777" : colors.buttonColor }}
                                type="submit"
                                className={"w-full text-white py-2 rounded hover:opacity-90 transition"}
                            >
                                {
                                    loading ? "Please waite..." : "  Submit"
                                }
                            </button>
                        </div>
                    </form>

                </div>
            </div>


            {
                milkData.length > 0 && (
                    <div className=' shadow-xl h-1/1 overflow-y-auto overflow-x-hidden rounded-lg p-4 bg-white'>
                        {/* <DataTable
                            columns={columns}
                            data={filteredData}
                            pagination
                            highlightOnHover
                            striped
                            dense
                            responsive
                            onChangePage={(page) => setCurrentPage(page)}
                            onChangeRowsPerPage={(newPerPage, page) => {
                                setRowsPerPage(newPerPage);
                                setCurrentPage(page);
                            }}
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
                        /> */}


                        <DataTable
                            columns={columns}
                            data={filteredData}
                            highlightOnHover
                            striped
                            dense
                            responsive
                            subHeader
                            subHeaderComponent={
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full">
                                    <h1 className="text-base sm:text-lg font-semibold text-gray-800">
                                        Milk Collection Summary
                                    </h1>
                                    <input
                                        type="text"
                                        placeholder="Search by account number..."
                                        value={searchCustomer}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="border px-3 py-2 text-sm rounded w-full sm:w-64 outline-none border-orange-600"
                                    />
                                </div>
                            }
                        />
                    </div>
                )
            }

            {
                totalMilk > 0 && totalAmount > 0 && averageFat > 0 && averageSnf > 0 && (
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 bg-white rounded shadow border">
                        <div className="text-base sm:text-lg font-medium text-gray-700">
                            Total Milk: <span className="font-semibold text-blue-700">{totalMilk.toFixed(2)} Ltr</span>
                        </div>
                        <div className="text-base sm:text-lg font-medium text-gray-700">
                            Avg Fat: <span className="font-semibold text-blue-700">{averageFat} </span>
                        </div>
                        <div className="text-base sm:text-lg font-medium text-gray-700">
                            Avg SNF: <span className="font-semibold text-blue-700">{averageSnf} </span>
                        </div>

                        <div className="text-base sm:text-lg font-medium text-gray-700">
                            Total Amount: <span className="font-semibold text-green-700">₹ {totalAmount.toFixed(2)}</span>
                        </div>
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

            <EditMilkCollectionModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setEditableEntry(null);
                }}
                milkData={editableEntry}
                onUpdate={handleSubmit}
            />


            {/* DELETE MODAL */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6 text-center relative">
                        <h2 className="text-lg font-semibold mb-4 text-red-700">
                            Are you sure you want to delete?
                        </h2>
                        <p className="text-gray-700 mb-6">This action cannot be undone.</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => {
                                    setIsConfirmOpen(false);
                                    setMilkToDelete(null);
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRemove}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default MilkCorrectionPage;
