import React, { useState, useEffect, useRef } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import { toast } from 'react-toastify';
import { FaEye, FaPen } from 'react-icons/fa';
import { FaTrashCan } from 'react-icons/fa6';
import CustomToast from '../../helper/costomeToast';
import { IoMdCloseCircle } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import EditCustomerModal from '../customer/EditCustomerPage';
import EditMilkCollectionModal from './EditMilkCollectionPage';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import CommonHeader from '../../components/CommonHeader';
import ToggleButton from '../../components/ToggleButton';




const DailyMilkCollectionPage = () => {
    const nav = useNavigate()
    const today = new Date().toISOString().split('T')[0];
    const fetchCustomerDetailsByAccount = useHomeStore(state => state.fetchCustomerDetailsByAccount);
    const submitMilkCollection = useHomeStore(state => state.submitMilkCollection);
    const getMilkCollectionRecord = useHomeStore(state => state.getMilkCollectionRecord);
    const deleteMilkCollection = useHomeStore(state => state.deleteMilkCollection);
    const getMilkRate = useHomeStore(state => state.getMilkRate);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [milkType, setMilkType] = useState('cow');
    const [shiftValue, setShiftValue] = useState('morning');
    const [isEditeModal, setIsEditeModal] = useState(false)
    const [collections, setCollections] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [maxPageButtons, setMaxPageButtons] = useState(5);
    const [toggle, setToggle] = useState(false)

    const [customerWallet, setCustomerWallet] = useState(null)
    const [form, setForm] = useState({
        customer_account_number: '',
        name: '',
        careof: '',
        mobile: '',
        quantity: '',
        clr: '',
        fat: '',
        snf: '',
        base_rate: '',
        other_price: '0',
        rate: '',
        total_amount: '',
        milk_type: "",
        shift: "",
        date: today,
        print: false,
    });

    // FETCH ALL CUSTOMER
    const fetchCustomerDetailByAccountNumber = async (accountNo) => {
        // console.log('Fetching customer details for:', accountNo);
        try {
            const res = await fetchCustomerDetailsByAccount(accountNo); // Your zustand API call
            console.log('Customer response:', res);
            if (res.status_code == 200) {
                CustomToast.success(res.message)
                setForm((prev) => ({
                    ...prev,
                    name: res.data.name || '',
                    careof: res.data.careof || '',
                    mobile: res.data.mobile || '',
                }));
                setCustomerWallet(res.data.wallet)

            } else {

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



    // 
    useEffect(() => {
        const fat = form.fat?.trim();
        const clr = form.clr?.trim();
        const snf = form.snf?.trim();

        if ((clr || snf) && fat) {
            const timeout = setTimeout(() => {
                const getBaseRateFetch = async () => {
                    try {
                        const res = await getMilkRate(fat, clr, snf);
                        console.log("milk rate fetch", res);

                        setForm(prev => ({
                            ...prev,
                            fat: res.fat || "",
                            clr: res.clr || "",
                            snf: res.snf || "",
                            base_rate: res.rate || '',
                        }));

                        if (res.fat && res.clr && res.snf) {
                            CustomToast.success("SNF CLR AND FAT FOUND", "top-center")
                        }
                        if (res.fat == '') {
                            CustomToast.warn("FAT not found", "top-center")
                        }
                        if (res.clr == '') {
                            CustomToast.warn("CLR not found", "top-center")
                        }
                        if (res.snf == '') {
                            CustomToast.warn("SNF not found", "top-center")
                        }
                        if (res.rate == '') {
                            CustomToast.warn("RATE not found", "top-center")
                        }


                    } catch (error) {
                        console.error("Error fetching milk rate:", error);
                    }
                };

                getBaseRateFetch();
            }, 1000);

            return () => clearTimeout(timeout);
        }
    }, [form.clr, form.snf, form.fat]);




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
            rate: rate.toFixed(2),
            total_amount: total_amount.toFixed(2),
        }));
    }, [form.fat, form.snf, form.base_rate, form.other_price, form.quantity]);


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




    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm(prev => {
            let updated = { ...prev, [name]: type === 'checkbox' ? checked : value };

            if (name === "clr") {
                updated.snf = ""; // CLR input hua → SNF clear
            } else if (name === "snf") {
                updated.clr = ""; // SNF input hua → CLR clear
            }

            return updated;
        });



    };

    const handleSubmit = async (e) => {
        form.shift = shiftValue
        form.milk_type = milkType
        setCustomerWallet(null)
        console.log("form value", form)
        e.preventDefault();
        try {
            const res = await submitMilkCollection(form);
            console.log("submited milk collection response", res)
            if (res.status_code == 200) {

                if (toggle) {
                    handlePrint(form)
                }



                CustomToast.success(res.message)
                setForm({
                    customer_account_number: '',
                    name: '',
                    careof: '',
                    mobile: '',
                    quantity: '',
                    clr: '',
                    fat: '',
                    snf: '',
                    base_rate: '',
                    other_price: '0',
                    rate: '',
                    total_amount: '',
                    milk_type: '',
                    date: today,
                })
                fetchMilkCollectionDetails()
            } else {

                CustomToast.error(res.message || res.errors)

            }
        } catch (error) {
            CustomToast.success(error)

        }

    };

    const fetchMilkCollectionDetails = async (page = 1) => {
        try {
            const res = await getMilkCollectionRecord(page);
            console.log("milk collection data fetch success", res);
            if (res.status_code == 200) {
                setCollections(res.data.data);
                setCurrentPage(res.data.current_page);
                setTotalPages(res.data.last_page);
            } else {
                CustomToast.error(res.message);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchMilkCollectionDetails()
    }, [isEditeModal])



    const handleRemove = async (id) => {
        try {
            const res = await deleteMilkCollection(id);
            if (res.status_code == 200) {
                CustomToast.success(res.message)
                fetchMilkCollectionDetails()
            } else {
                CustomToast.success(res.message)

            }
        } catch (error) {

        }
    };



    // REDNDER BUTTONS 
    const renderPageButtons = () => {
        const groupStart = Math.floor((currentPage - 1) / maxPageButtons) * maxPageButtons + 1;
        const groupEnd = Math.min(groupStart + maxPageButtons - 1, totalPages);

        const pages = [];
        for (let i = groupStart; i <= groupEnd; i++) {
            pages.push(
                <button
                    key={i}
                    className={`px-3 py-1 border rounded text-sm ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                    onClick={() => fetchMilkCollectionDetails(i)}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="flex gap-1 flex-wrap justify-center mt-4 w-full">
                {/* Previous Page Button */}
                <button
                    className="px-3 py-1 border rounded text-sm text-white bg-gray-500 hover:bg-gray-600 disabled:opacity-50"
                    onClick={() => fetchMilkCollectionDetails(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <MdArrowBackIos size={18} />
                </button>

                {/* Page Number Buttons */}
                {pages}

                {/* Next Page Button */}
                <button
                    className="px-3 py-1 border rounded text-sm text-white bg-gray-500 hover:bg-gray-600 disabled:opacity-50"
                    onClick={() => fetchMilkCollectionDetails(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <MdArrowForwardIos size={18} />
                </button>
            </div>
        );
    };

    // Printer button
    //     const handlePrint = () => {
    //         const slipHtml = `
    //     <html>
    //       <head>
    //         <style>
    //           @media print {
    //             body {
    //               margin: 0;
    //               font-size: 12px;
    //               padding: 0;
    //             }
    //           }
    //           body {
    //             font-family: Arial, sans-serif;
    //             padding: 10px;
    //             line-height: 1.4;
    //           }
    //           h2 {
    //             margin: 0 0 10px 0;
    //           }
    //           p {
    //             margin: 4px 0;
    //           }
    //         </style>
    //       </head>
    //       <body>
    //         <h2>Milk Slip</h2>
    //         <p>Customer Name: John Doe</p>
    //         <p>Date: 15-06-2025</p>
    //         <p>Quantity: 5 Litres</p>
    //         <p>Total: ₹150</p>
    //       </body>
    //     </html>
    //   `;

    //         // Call to main process via preload bridge
    //         window.api.printSlip(slipHtml);
    //     };


    const handlePrint = (data) => {
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
            time: localTime, // ✅ Local time here
            shift: data.shift,
            milk_type: data.milk_type,
            qty: `${data.quantity} / Ltr`,
            fat: data.fat,
            snf: data.snf,
            oth_rate: data.oth_rate || "0.00",
            base_rate: data.base_rate,
            rate: `${data.base_rate} / Ltr`,
            total: data.total_amount
        };

        window.api.printSlip(slipData);
    };












    const isDisabled = !form.name; // Disable if customer data not loaded
    return (
        <div className="w-full">




            <CommonHeader heading={"Milk Collection"} />

            {/* Grid for Form and Receipt */}
            <div className="grid md:grid-cols-2 gap-10 w-full mx-auto p-4 ">
                {/* === Left: Milk Collection Form === */}
                {/* === Left: Milk Collection Form === */}
                <form onSubmit={handleSubmit} className="bg-slate-800 p-3 rounded shadow-md w-full" style={{ width: '100%' }}>
                    {/* Milk Type & Shift in a row */}
                    <div className="mb-4 flex flex-col lg:flex-row gap-4 lg:gap-8 items-start">
                        {/* Milk Type */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center bg-slate-300 shadow-xl p-4 rounded border border-gray-400 w-full lg:w-auto">
                            <label className="font-semibold block mb-2 sm:mb-0 sm:mr-2">Milk Type:</label>
                            <div className="flex flex-wrap gap-2">
                                {['cow', 'buffalo', 'other'].map((type) => (
                                    <label key={type} className="relative">
                                        <input
                                            type="radio"
                                            name="milkType"
                                            value={type}
                                            checked={milkType === type}
                                            onChange={() => setMilkType(type)}
                                            className="peer hidden"
                                        />
                                        <span className="capitalize px-4 py-1 rounded-full border border-gray-400 text-gray-700 cursor-pointer transition-all duration-200 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 bg-blue-100 hover:bg-green-100">
                                            {type}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Shift */}
                        {/* <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center bg-slate-300 shadow-xl p-4 rounded border border-gray-400 w-full lg:w-auto">
                            <label className="font-semibold block mb-2 sm:mb-0 sm:mr-2">Shift:</label>
                            <div className="flex flex-wrap gap-2">
                                {['morning', 'evening'].map((shift) => (
                                    <label key={shift} className="relative">
                                        <input
                                            type="radio"
                                            name="shift"
                                            value={shift}
                                            checked={shiftValue === shift}
                                            onChange={() => setShiftValue(shift)}
                                            className="peer hidden"
                                        />
                                        <span className="capitalize px-4 py-1 rounded-full border border-gray-400 text-gray-700 cursor-pointer transition-all duration-200 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 bg-blue-100 hover:bg-green-100">
                                            {shift}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div> */}


                        {/* DATE + SHIFT SELECTION */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-slate-300 shadow-xl p-3 rounded border border-gray-400 w-full lg:w-auto">

                            {/* DATE INPUT */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                <label className="font-semibold">Date:</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    name="date"
                                    onChange={handleChange}
                                    max={new Date().toISOString().split('T')[0]} // max = today
                                    className="px-3 py-1 rounded border border-gray-400 text-gray-700 bg-white"
                                />
                            </div>

                            {/* SHIFT RADIO BUTTONS */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                <label className="font-semibold">Shift:</label>
                                <div className="flex flex-wrap gap-2">
                                    {['morning', 'evening'].map((shift) => (
                                        <label key={shift} className="relative">
                                            <input
                                                type="radio"
                                                name="shift"
                                                value={shift}
                                                checked={shiftValue === shift}
                                                onChange={() => {
                                                    setShiftValue(shift)
                                                    console.log("this is shift", shift)
                                                }}
                                                className="peer hidden"
                                            />
                                            <span className="capitalize px-4 py-1 rounded-full border border-gray-400 text-gray-700 cursor-pointer transition-all duration-200 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 bg-blue-100 hover:bg-green-100">
                                                {shift}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Milk + Customer Info */}
                    <div className="flex flex-col gap-4 mb-3 bg-slate-300 p-3 rounded-lg">
                        {/* Row 1: Account No & Quantity */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium " >Account No</label>
                                <input
                                    type="text"
                                    name="customer_account_number"
                                    value={form.customer_account_number}
                                    onChange={handleChange}
                                    // Always enabled
                                    className=" w-full border rounded py-1 px-4 mt-1 "
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium ">Quantity (Ltr)</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    className={`w-full border rounded py-1 px-4 ${isDisabled ? 'bg-slate-400 opacity-50' : 'bg-white'} `}
                                />
                            </div>
                        </div>

                        {/* Row 2: Name & FAT */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium ">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    className={`w-full border rounded py-1 px-4 ${isDisabled ? 'bg-slate-400 opacity-50' : 'bg-white'} `}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium ">FAT (%)</label>
                                <input
                                    type="number"
                                    name="fat"
                                    value={form.fat}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    className={`w-full border rounded py-1 px-4 ${isDisabled ? 'bg-slate-400 opacity-50' : 'bg-white'} `}
                                />
                            </div>
                        </div>

                        {/* Row 3: Mobile & CLR */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium ">Mobile</label>
                                <input
                                    type="text"
                                    name="mobile"
                                    value={form.mobile}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    className={`w-full border rounded py-1 px-4 ${isDisabled ? 'bg-slate-400 opacity-50' : 'bg-white'} `}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium ">CLR</label>
                                <input
                                    type="number"
                                    name="clr"
                                    value={form.clr}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    className={`w-full border rounded py-1 px-4 ${isDisabled ? 'bg-slate-400 opacity-50' : 'bg-white'} `}
                                />
                            </div>
                        </div>

                        {/* Row 4: careof & SNF */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium ">Care of</label>
                                <input
                                    type="text"
                                    name="careof"
                                    value={form.careof}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    className={`w-full border rounded py-1 px-4 ${isDisabled ? 'bg-slate-400 opacity-50' : 'bg-white'} `}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium ">SNF (%)</label>
                                <input
                                    type="number"
                                    name="snf"
                                    value={form.snf}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    className={`w-full border rounded py-1 px-4 ${isDisabled ? 'bg-slate-400 opacity-50' : 'bg-white'} `}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rate & Price Section */}
                    <div className="mt-2  bg-orange-800 shadow-xl p-4 rounded border border-gray-400">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white">Base Rate (₹/Ltr)</label>
                                <input
                                    type="number"
                                    name="base_rate"
                                    value={form.base_rate}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    className=" w-full border rounded py-1 px-4 bg-orange-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white">Other Price (₹/Ltr)</label>
                                <input
                                    type="number"
                                    name="other_price"
                                    value={form.other_price}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    className=" w-full border rounded py-1 px-4 bg-orange-100 "
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white">Rate (Auto)</label>
                                <input
                                    type="number"
                                    name="rate"
                                    value={form.rate}
                                    readOnly
                                    className=" w-full border rounded py-1 px-4 bg-orange-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white">Total Amount (Auto)</label>
                                <input
                                    type="number"
                                    name="total_amount"
                                    value={form.total_amount}
                                    readOnly
                                    className=" w-full border rounded py-1 px-4 bg-orange-100"
                                />
                            </div>
                        </div>


                    </div>
                    {/* Submit Button */}
                    <div className="mt-1 flex items-center gap-4">
                        {/* Print Toggle Checkbox */}
                        {/* <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="print"
                                checked={form.print || false}
                                onChange={handleChange}
                                className="peer hidden"
                            />
                            <span className="relative inline-block w-10 h-6 bg-gray-300 rounded-full transition-colors duration-200 peer-checked:bg-blue-600">
                                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-[24px]"></span>
                            </span>
                            <span className="ml-2 text-sm font-medium text-white">Print</span>
                        </label> */}

                        <ToggleButton
                            label="Print"
                            enabled={toggle}
                            onToggle={(val) => setToggle(val)}
                        />

                        {/* Submit Button */}
                        <input
                            type="submit"
                            disabled={isDisabled}
                            className={`px-3 text-white py-1 rounded bg-blue-600 cursor-pointer ${isDisabled && 'opacity-50 cursor-not-allowed'}`}
                            value="Submit"
                        />
                    </div>


                </form>

                <div className="bg-gray-50 p-6 rounded shadow-md border h-fit" style={{ width: '100%' }}>
                    {
                        customerWallet && (
                            <div className=" bg-gradient-to-r w-1/2 from-yellow-100 via-yellow-50 to-yellow-100 border border-yellow-300 rounded-xl p-3 mb-3 shadow-lg flex  space-x-3 font-semibold justify-between ">
                                <p className="text-xl font-bold">
                                    Customer Wallet
                                </p>
                                <p className={customerWallet < 0 ? "text-xl text-red-700 font-bold" : "text-xl text-green-600 font-bold"} >
                                    ₹ {customerWallet}
                                </p>
                            </div>
                        )
                    }

                    <h3 className="text-lg font-bold mb-4">Customer Receipt</h3>

                    <table className="w-full text-sm text-left border border-gray-300">
                        <tbody>
                            {[
                                ['Milk Type', milkType || '-'],
                                ['Account No', form.customer_account_number || '-'],
                                ['Name', form.name || '-'],
                                ['careof', form.careof || '-'],
                                ['Mobile', form.mobile || '-'],
                                ['Quantity', form.quantity ? `${form.quantity} Ltr` : '-'],
                                ['FAT', form.fat || '-'],
                                ['SNF', form.snf || '-'],
                                ['Rate', form.rate ? `₹${form.rate}` : '-'],
                                ['Total Amount', form.total_amount ? `₹${form.total_amount}` : '-'],
                            ].map(([label, value]) => (
                                <tr key={label} className="border-b hover:bg-gray-50">
                                    <td className="font-medium text-gray-700 px-4 py-2 w-1/3 bg-gray-100">{label}</td>
                                    <td className="px-4 py-2">{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>



            {/* === Bottom Table === */}
            <div className="mt-8 w-full">
                <h3 className="text-xl font-semibold mb-4">Submitted Collections</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                {['SR NO.', 'Date', 'Milk Type', 'AC No', 'Name', 'QTY', 'FAT', 'SNF', 'SHIFT', 'Rate', 'Total Amount', 'Action'].map(header => (
                                    <th key={header} className="border px-2 py-1">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {collections.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="text-center text-gray-500 py-4">
                                        Data not available
                                    </td>
                                </tr>
                            ) : (
                                collections.map((item, i) => (
                                    <tr
                                        key={i}
                                        className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-300'} hover:bg-gray-100`}
                                    >
                                        <td className="border px-2 py-1 text-center">{i + 1}</td>
                                        <td className="border px-2 py-1 text-center">{item.date}</td>
                                        <td className="border px-2 py-1 text-center">{item.milk_type}</td>
                                        <td className="border px-2 py-1 text-center">{item.customer_account_number}</td>
                                        <td className="border px-2 py-1 text-center">{item.name}</td>
                                        <td className="border px-2 py-1 text-center">{item.quantity}</td>
                                        <td className="border px-2 py-1 text-center">{item.fat}</td>
                                        <td className="border px-2 py-1 text-center">{item.snf}</td>
                                        <td className="border px-2 py-1 text-center">{item.shift}</td>
                                        <td className="border px-2 py-1 text-center">{item.base_rate}</td>
                                        <td className="border px-2 py-1 text-center">
                                            {(item.base_rate * item.quantity).toFixed(2)}
                                        </td>
                                        <td className="border px-2 py-1 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                                                    onClick={() => {
                                                        setSelectedCustomer(item);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <FaEye size={14} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedCustomer(item);
                                                        setIsEditeModal(true);
                                                    }}
                                                    className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                                                >
                                                    <FaPen size={14} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDeleteId(item.id);
                                                        setShowConfirmModal(true);
                                                    }}
                                                    className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                                                >
                                                    <FaTrashCan size={14} />
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
            {renderPageButtons()}

            {isModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 p-6 relative overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
                            Milk Collection Details
                        </h2>

                        {/* Close Button */}
                        {/* <div
                            onClick={() => setIsModalOpen(false)}
                            className="absolute bg-white top-4 right-4 text-xxl cursor-pointer"
                            title="Close"
                        >
                            <IoMdCloseCircle size={30} />
                        </div> */}

                        {/* Milk Collection Info Table */}
                        <table className="w-full text-sm text-left border border-gray-200">
                            <tbody>
                                {[
                                    ['Name', selectedCustomer.name],
                                    ['Mobile', selectedCustomer.mobile],
                                    ['careof', selectedCustomer.careof],
                                    ['Account Number', selectedCustomer.customer_account_number],
                                    ['Milk Type', selectedCustomer.milk_type],
                                    ['Quantity (Ltr)', selectedCustomer.quantity],
                                    ['FAT (%)', selectedCustomer.fat],
                                    ['SNF (%)', selectedCustomer.snf],
                                    ['CLR', selectedCustomer.clr],
                                    ['Base Rate (₹)', selectedCustomer.base_rate],
                                    ['Other Price (₹)', selectedCustomer.other_price],
                                    ['Rate (Base + Other)', (parseFloat(selectedCustomer.base_rate) + parseFloat(selectedCustomer.other_price)).toFixed(2)],
                                    ['Total amount (₹)', (parseFloat(selectedCustomer.quantity) * (parseFloat(selectedCustomer.base_rate) + parseFloat(selectedCustomer.other_price))).toFixed(2)],
                                    ['Created At', new Date(selectedCustomer.created_at).toLocaleString()],
                                ].map(([label, value], index) => (
                                    <tr key={label} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-200'} hover:bg-gray-100`}>
                                        <td className="font-medium text-gray-700 px-4 py-2 w-1/3">{label}</td>
                                        <td className="px-4 py-2">{value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Close Button */}
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

            {showConfirmModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-sm">
                        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                        <p className="text-sm text-gray-700 mb-6">Are you sure you want to delete this item?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleRemove(deleteId);
                                    setShowConfirmModal(false);
                                    setDeleteId(null);
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <EditMilkCollectionModal
                isOpen={isEditeModal}
                onClose={() => setIsEditeModal(false)}
                milkData={selectedCustomer}
            />


        </div>

    );
};

export default DailyMilkCollectionPage;
