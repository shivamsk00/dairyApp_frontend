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
    const [toggle, setToggle] = useState(true)
    const [milkCollectiionAvergeData, setMilkCollectionAvergeData] = useState({
        avg_base_rate: '',
        avg_fat: '',
        avg_snf: '',
        milk_total: '',
        other_price_total: '',
        total_amount: '',
    });


    const [customerWallet, setCustomerWallet] = useState(null)

    function checkTimeOfDay() {
        const now = new Date();
        const hour = now.getHours(); // Returns 0-23

        if (hour < 12) {
            setShiftValue("morning")

        } else {
            setShiftValue("evening")
        }
    }



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

    // FETCH PER CUSTOMER
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

    // useEffect(() => {
    //     const fat = form.fat?.trim();
    //     const clr = form.clr?.trim();
    //     const snfRaw = form.snf?.trim();

    //     // Don't proceed if no FAT or no SNF/CLR
    //     if (!(fat && (snfRaw || clr))) return;

    //     const timeout = setTimeout(() => {
    //         const getBaseRateFetch = async () => {
    //             try {
    //                 // 👇 Use `.0` only for fetching (do not change UI)
    //                 const snfForApi = snfRaw && !snfRaw.includes('.') ? `${snfRaw}.0` : snfRaw;

    //                 const res = await getMilkRate(fat, clr, snfForApi);
    //                 console.log("milk rate fetch", res);

    //                 setForm(prev => ({
    //                     ...prev,
    //                     fat: res.fat || "",
    //                     clr: res.clr || "",
    //                     snf: res.snf || prev.snf,
    //                     base_rate: res.rate || '',
    //                 }));

    //                 if (res.rate) {
    //                     CustomToast.success("Rate Found", "top-center");
    //                 } else {
    //                     if (!res.fat) CustomToast.warn("FAT not found", "top-center");
    //                     if (!res.snf) CustomToast.warn("SNF not found", "top-center");
    //                     if (!res.clr) CustomToast.warn("CLR not found", "top-center");
    //                     CustomToast.warn("RATE not found", "top-center");
    //                 }
    //             } catch (error) {
    //                 console.error("Error fetching milk rate:", error);
    //             }
    //         };

    //         getBaseRateFetch();
    //     }, 800);

    //     return () => clearTimeout(timeout);
    // }, [form.fat, form.snf, form.clr]);



    // useEffect(() => {
    //     const fat = form.fat?.trim();
    //     const clr = form.clr?.trim();
    //     const snf = form.snf?.trim();

    //     // ✅ Trigger only when FAT is present, and either SNF or CLR is updated
    //     if ((snf || clr) && fat) {
    //         const timeout = setTimeout(() => {
    //             const getBaseRateFetch = async () => {
    //                 try {
    //                     const res = await getMilkRate(fat, clr, snf);
    //                     console.log("milk rate fetch", res);

    //                     setForm(prev => ({
    //                         ...prev,
    //                         fat: res.fat || "",
    //                         clr: res.clr || "",
    //                         snf: res.snf || "",
    //                         base_rate: res.rate || '',
    //                     }));

    //                     // 🎯 Prioritize meaningful feedback
    //                     if (res.rate) {
    //                         CustomToast.success("Rate Found", "top-center");
    //                     } else {
    //                         if (!res.fat) CustomToast.warn("FAT not found", "top-center");
    //                         if (!res.snf) CustomToast.warn("SNF not found", "top-center");
    //                         if (!res.clr) CustomToast.warn("CLR not found", "top-center");
    //                         CustomToast.warn("RATE not found", "top-center");
    //                     }
    //                 } catch (error) {
    //                     console.error("Error fetching milk rate:", error);
    //                 }
    //             };

    //             getBaseRateFetch();
    //         }, 800); // Slightly quicker feedback

    //         return () => clearTimeout(timeout);
    //     }
    // }, [form.fat, form.snf, form.clr]);



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
    // useEffect(() => {
    //     const timeout = setTimeout(() => {
    //         if (form.customer_account_number) {
    //             fetchCustomerDetailByAccountNumber(form.customer_account_number);
    //         } else {
    //             setForm((prev) => ({
    //                 ...prev,
    //                 name: '',
    //                 careof: '',
    //                 mobile: '',
    //             }));
    //         }
    //     }, 500); // wait 500ms after user stops typing

    //     return () => clearTimeout(timeout); // cleanup on next input
    // }, [form.customer_account_number]);




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
        e.preventDefault();
        form.shift = shiftValue
        form.milk_type = milkType
        setCustomerWallet(null)
        console.log("form value", form)
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
                setTimeout(() => accRef.current?.focus(), 300);
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
                setCollections(res.data);
                setCurrentPage(res.data.current_page);
                setTotalPages(res.data.last_page);
                setMilkCollectionAvergeData({
                    avg_base_rate: res.avg_base_rate || '',
                    avg_fat: res.avg_fat || '',
                    avg_snf: res.avg_snf || '',
                    milk_total: res.milk_total || '',
                    other_price_total: res.other_price_total || '',
                    total_amount: res.total_amount || '',
                })


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





    const renderPageButtons = () => {
        const groupStart = Math.floor((currentPage - 1) / maxPageButtons) * maxPageButtons + 1;
        const groupEnd = Math.min(groupStart + maxPageButtons - 1, totalPages);

        const pages = [];

        // Always show first page
        if (groupStart > 1) {
            pages.push(
                <button
                    key={1}
                    className={`px-3 py-1 border rounded text-sm ${currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                    onClick={() => fetchMilkCollectionDetails(1)}
                >
                    1
                </button>
            );

            if (groupStart > 2) {
                pages.push(<span key="start-ellipsis" className="px-2 text-gray-500">...</span>);
            }
        }

        // Middle buttons
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

        // Always show last page
        if (groupEnd < totalPages) {
            if (groupEnd < totalPages - 1) {
                pages.push(<span key="end-ellipsis" className="px-2 text-gray-500">...</span>);
            }

            pages.push(
                <button
                    key={totalPages}
                    className={`px-3 py-1 border rounded text-sm ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                    onClick={() => fetchMilkCollectionDetails(totalPages)}
                >
                    {totalPages}
                </button>
            );
        }

        return (
            <div className="flex gap-1 flex-wrap justify-center mt-4 w-full">
                {/* Previous Button */}
                <button
                    className="px-3 py-1 border rounded text-sm text-white bg-gray-500 hover:bg-gray-600 disabled:opacity-50"
                    onClick={() => fetchMilkCollectionDetails(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <MdArrowBackIos size={18} />
                </button>

                {pages}

                {/* Next Button */}
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

    // When Enter press Then cursor going to next empty input filed
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const form = e.target.form;
            const inputs = Array.from(form.querySelectorAll('input'))
                .filter(input =>
                    !input.disabled &&
                    !input.readOnly &&
                    input.type !== 'hidden' &&
                    input.offsetParent !== null // skip hidden by CSS
                );

            const currentIndex = inputs.indexOf(e.target);

            // Check if all inputs are filled
            const allFilled = inputs.every(input => input.value.trim() !== '');

            if (allFilled) {
                // Submit the form if all inputs are filled
                form.requestSubmit(); // HTML5 API that triggers submit handler
            } else {
                // Find the next empty input after current one
                for (let i = currentIndex + 1; i < inputs.length; i++) {
                    if (inputs[i].value.trim() === '') {
                        inputs[i].focus();
                        return;
                    }
                }

                // If no empty input is found ahead, loop back from start
                for (let i = 0; i < currentIndex; i++) {
                    if (inputs[i].value.trim() === '') {
                        inputs[i].focus();
                        return;
                    }
                }
            }
        }
    };





    useEffect(() => {
        checkTimeOfDay();

    }, [])



    const accRef = useRef(null);
    const qtyRef = useRef(null);
    const nameRef = useRef(null);
    const fatRef = useRef(null);
    const mobileRef = useRef(null);
    const clrRef = useRef(null);
    const careOfRef = useRef(null);
    const snfRef = useRef(null);
    const otherRateRef = useRef(null);
    const submitRef = useRef(null);




    const isDisabled = !form.name; // Disable if customer data not loaded
    return (
        <div className="w-full min-h-screen  bg-gradient-to-r from-slate-900 to-slate-800">
            <CommonHeader heading={"Milk Collection"} />

            {/* Grid for Form and Receipt */}
            <div className="grid md:grid-cols-2 gap-10 w-full mx-auto p-4  ">
                {/* === Left: Milk Collection Form === */}
                {/* === Left: Milk Collection Form === */}
                <form onSubmit={handleSubmit} className="bg-slate-800 p-3 h-auto rounded shadow-md w-full border border-dashed" style={{ width: '100%' }}>
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
                                            onKeyDown={handleKeyDown}
                                            className="peer hidden"
                                        />
                                        <span className="capitalize px-2  rounded-full border border-gray-400 text-gray-700 cursor-pointer transition-all duration-200 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 bg-blue-100 hover:bg-green-100">
                                            {type}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>


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
                                    onKeyDown={handleKeyDown}
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
                                                onKeyDown={handleKeyDown}
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
                                {/* <input
                                    type="text"
                                    name="customer_account_number"
                                    value={form.customer_account_number}
                                    onChange={handleChange}
                                    // Always enabled
                                    onKeyDown={handleKeyDown}
                                    className=" w-full border rounded  px-4 mt-1 "
                                /> */}

                                <input
                                    type="text"
                                    name="customer_account_number"
                                    value={form.customer_account_number}
                                    onChange={(e) => setForm({ ...form, customer_account_number: e.target.value })}
                                    ref={accRef}
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const accNo = form.customer_account_number.trim();
                                            if (accNo) {
                                                await fetchCustomerDetailByAccountNumber(accNo);
                                                isDisabled && qtyRef.current?.focus();
                                            } else {
                                                setForm((prev) => ({ ...prev, name: '', careof: '', mobile: '' }));
                                            }
                                        }
                                    }}
                                    placeholder="Enter Account Number"
                                    className=" w-full border rounded  px-4 mt-1 "
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
                                    ref={qtyRef}
                                    onKeyDown={(e) => e.key === 'Enter' && nameRef.current?.focus()}
                                    required
                                    className={`w-full border rounded px-4 ${isDisabled ? 'bg-slate-400 opacity-50' : 'bg-white'} `}
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
                                    ref={nameRef}
                                    onKeyDown={(e) => e.key === 'Enter' && fatRef.current?.focus()}
                                    className={`w-full border rounded  px-4 ${isDisabled ? 'bg-slate-400 opacity-50' : 'bg-white'} `}
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
                                    ref={fatRef}
                                    onKeyDown={(e) => e.key === 'Enter' && mobileRef.current?.focus()}
                                    required
                                    className={`w-full border rounded  px-4 ${isDisabled ? 'bg-slate-400 opacity-50' : 'bg-white'} `}
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
                                    ref={mobileRef}
                                    onKeyDown={(e) => e.key === 'Enter' && clrRef.current?.focus()}
                                    className={`w-full border rounded  px-4 ${isDisabled ? 'bg-slate-400 opacity-50' : 'bg-white'} `}
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
                                    ref={clrRef}
                                    onKeyDown={(e) => e.key === 'Enter' && careOfRef.current?.focus()}
                                    className={`w-full border rounded  px-4 ${isDisabled ? 'bg-slate-400 opacity-50' : 'bg-white'} `}
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
                                    ref={careOfRef}
                                    onKeyDown={(e) => e.key === 'Enter' && snfRef.current?.focus()}
                                    className={`w-full border rounded  px-4 ${isDisabled ? 'bg-slate-400 opacity-50' : 'bg-white'} `}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium ">SNF (%)</label>
                                {/* <input
                                    type="number"
                                    name="snf"
                                    value={form.snf}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    onKeyDown={handleKeyDown}
                                    required
                                    className={`w-full border rounded  px-4 ${isDisabled ? 'bg-slate-400 opacity-50' : 'bg-white'} `}
                                /> */}
                                <input
                                    type="text"
                                    value={form.snf}
                                    required
                                    disabled={isDisabled}
                                    className={`w-full border rounded  px-4 ${isDisabled ? 'bg-slate-400 opacity-50' : 'bg-white'} `}
                                    name="snf"
                                    onChange={(e) => setForm({ ...form, snf: e.target.value })}
                                    ref={snfRef}
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const fat = form.fat?.trim();
                                            const clr = form.clr?.trim();
                                            const snfRaw = form.snf?.trim();
                                            if (!(fat && (clr || snfRaw))) return;
                                            const snfForApi = snfRaw && !snfRaw.includes('.') ? `${snfRaw}.0` : snfRaw;
                                            try {
                                                const res = await getMilkRate(fat, clr, snfForApi);
                                                setForm((prev) => ({
                                                    ...prev,
                                                    fat: res.fat || "",
                                                    clr: res.clr || "",
                                                    snf: res.snf || prev.snf,
                                                    base_rate: res.rate || '',
                                                }));
                                                res.rate
                                                    ? CustomToast.success("Rate Found", "top-center")
                                                    : CustomToast.warn("RATE not found", "top-center");
                                            } catch (err) {
                                                console.error("Rate error", err);
                                            }
                                            otherRateRef.current?.focus();
                                        }
                                    }}
                                    placeholder="Enter SNF"
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
                                    ref={otherRateRef}
                                    onKeyDown={(e) => e.key === 'Enter' && submitRef.current?.focus()}
                                    className=" w-full border rounded  px-4 bg-orange-100"
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
                                    onKeyDown={handleKeyDown}
                                    className=" w-full border rounded  px-4 bg-orange-100 "
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white">Rate (Auto)</label>
                                <input
                                    type="number"
                                    name="rate"
                                    value={form.rate}
                                    onKeyDown={handleKeyDown}
                                    readOnly
                                    className=" w-full border rounded  px-4 bg-orange-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white">Total Amount (Auto)</label>
                                <input
                                    type="number"
                                    name="total_amount"
                                    value={form.total_amount}
                                    onKeyDown={handleKeyDown}
                                    readOnly
                                    className=" w-full border rounded  px-4 bg-orange-100"
                                />
                            </div>
                        </div>


                    </div>
                    {/* Submit Button */}
                    <div className="mt-1 flex items-center gap-4">
                        {/* Print Toggle Checkbox */}
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
                            ref={submitRef}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSubmit();
                                    setTimeout(() => accRef.current?.focus(), 300);
                                }
                            }}
                        />
                    </div>


                </form>

                <div className="bg-gray-50 p-6 rounded shadow-md  h-fit border border-dashed border-slate-700" style={{ width: '100%' }}>
                    {/* {
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
                    } */}

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
            <div className="mt-4 m-auto w-[98%] bg-slate-700 shadow-lg  p-4 rounded-xl border border-dashed" >
                <h3 className="text-xl font-semibold mb-4 text-white">Submitted Collections</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead className="bg-slate-800 text-white">
                            <tr>
                                {['SR NO.', 'AC No', 'Name', 'Date', 'SHIFT', 'QTY', 'FAT', 'SNF', 'Rate', 'Other Rate', 'Total Amount', 'Balance', 'Action'].map(header => (
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
                                        <td className="border px-2 py-1 text-center">{item.customer_account_number}</td>
                                        <td className="border px-2 py-1 text-center">{item.name}</td>
                                        <td className="border px-2 py-1 text-center">{item.date}</td>
                                        <td className="border px-2 py-1 text-center">{item.shift}</td>
                                        <td className="border px-2 py-1 text-center">{item.quantity}</td>
                                        <td className="border px-2 py-1 text-center">{item.fat}</td>
                                        <td className="border px-2 py-1 text-center">{item.snf}</td>
                                        <td className="border px-2 py-1 text-center">{item.base_rate}</td>
                                        <td className="border px-2 py-1 text-center">{item.other_price}</td>
                                        <td className="border px-2 py-1 text-center">{item.total_amount}</td>

                                        <td className="border px-2 py-1 text-center">{item.customer.wallet}</td>
                                        <td className="border px-2 py-1 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                                                    onClick={() => {
                                                        setSelectedCustomer(item);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <FaEye size={12} />
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
                    <div className=' w-full flex justify-between items-center p-2 bg-yellow-100'>
                        <div className='text-sm flex-1 font-semibold text-gray-700 flex justify-center items-center gap-2'>
                            <p className='font-bold'>Ave. Fat</p>
                            <p className='font-bold'>{milkCollectiionAvergeData.avg_fat}</p>
                        </div>
                        <div className='text-sm flex-1 font-semibold text-gray-700 flex justify-center items-center gap-2'>
                            <p className='font-bold'>Ave. Snf</p>
                            <p className='font-bold'>{milkCollectiionAvergeData.avg_snf}</p>
                        </div>
                        <div className='text-sm flex-1 font-semibold text-gray-700 flex justify-center items-center gap-2'>
                            <p className='font-bold'>Ave. Base Rate</p>
                            <p className='font-bold'>₹{milkCollectiionAvergeData.avg_base_rate}</p>
                        </div>

                        <div className='text-sm flex-1 font-semibold text-gray-700 flex justify-center items-center gap-2'>
                            <p className='font-bold'>Other Price</p>
                            <p className='font-bold'>₹{milkCollectiionAvergeData.other_price_total || 0}</p>
                        </div>
                        <div className='text-sm flex-1  text-gray-700 flex justify-center items-center gap-2'>
                            <p className='font-bold'>Total Amount</p>
                            <p className='font-bold'>₹{Number(milkCollectiionAvergeData.total_amount).toFixed(2)}</p>
                        </div>
                    </div>

                    {/* <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 text-sm text-gray-800 font-semibold px-4 py-2 border-t border-gray-300 flex flex-wrap gap-4 justify-start items-center z-50">
                        <p>MLT - Milk Type, B.R - Base Rate, C - Count, A - Average, S - Sum</p>
                        <div className="flex gap-6 flex-wrap">
                            <p>A - 8</p>
                            <p>A - 44.12</p>
                            <p>A - 626</p>
                            <p>S - 142.11</p>
                            <p>S - 4883.77 + 0</p>
                            <p>A - 35.13</p>
                            <p>S - 4883.75</p>
                        </div>
                    </div> */}
                </div>
            </div>
            {/* {renderPageButtons()} */}

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
