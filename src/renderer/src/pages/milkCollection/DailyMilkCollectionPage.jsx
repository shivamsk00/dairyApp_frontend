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
import { BsFillPrinterFill } from 'react-icons/bs';




const DailyMilkCollectionPage = () => {



    const nav = useNavigate()
    const today = new Date().toISOString().split('T')[0];

    // function getTodayDate() {
    //     const offset = new Date().getTimezoneOffset() * 60000;
    //     return new Date(Date.now() - offset).toISOString().split("T")[0];
    // }
    // const today = getTodayDate(); // ✅ timezone-safe
    // console.log("today date", today)

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
    const [isShift, setIsShift] = useState('morning');
    const [isEditeModal, setIsEditeModal] = useState(false)
    const [collections, setCollections] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [maxPageButtons, setMaxPageButtons] = useState(5);
    const [toggle, setToggle] = useState(true)
    const [milkCollectiionAvergeData, setMilkCollectionAvergeData] = useState({
        avg_base_rate: '',
        avg_fat: 0,
        avg_snf: 0,
        milk_total: 0,
        other_price_total: 0,
        total_amount: 0,

        morning_avg_base_rate: '',
        morning_avg_fat: 0,
        morning_avg_snf: 0,
        morning_total_amount: 0,
        morning_total_milk: 0,

        evening_avg_base_rate: '',
        evening_avg_fat: 0,
        evening_avg_snf: 0,
        evening_total_amount: 0,
        evening_total_milk: 0
    });

    const [dayTotal, setDayTotal] = useState({
        morning_total_amount: 0,
        morning_total_milk: 0,
        evening_total_amount: 0,
        evening_total_milk: 0,
        total_amount: 0,
        milk_total: 0,
    })
    const [morningCollection, setMorningCollection] = useState([]);
    const [eveningCollection, setEveningCollection] = useState([]);

    const [customerWallet, setCustomerWallet] = useState(null)

    function checkTimeOfDay() {
        const now = new Date();
        const hour = now.getHours(); // Returns 0-23

        if (hour < 12) {
            setShiftValue("morning")
            setIsShift("morning")

        } else {
            setShiftValue("evening")
            setIsShift("evening")
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
            console.log("milk collection data fetch success====>", res);
            if (res.status_code == 200) {
                setCollections(res.morning);
                setMorningCollection(res.morning);
                setEveningCollection(res.evening);
                // setCurrentPage(res.data.current_page);
                // setTotalPages(res.data.last_page);
                setMilkCollectionAvergeData({
                    avg_base_rate: res.avg_base_rate || '',
                    avg_fat: res.avg_fat || '',
                    avg_snf: res.avg_snf || '',
                    milk_total: res.milk_total || '',
                    other_price_total: res.other_price_total || '',
                    total_amount: res.total_amount || '',

                    morning_avg_base_rate: res.morning_avg_base_rate || '',
                    morning_avg_fat: res.morning_avg_fat || '',
                    morning_avg_snf: res.morning_avg_snf || '',
                    morning_total_amount: res.morning_total_amount || '',
                    morning_total_milk: res.morning_total_milk || '',

                    evening_avg_base_rate: res.evening_avg_base_rate || '',
                    evening_avg_fat: res.evening_avg_fat || '',
                    evening_avg_snf: res.evening_avg_snf || '',
                    evening_total_amount: res.evening_total_amount || '',
                    evening_total_milk: res.evening_total_milk || ''
                });

                setDayTotal({
                    morning_total_amount: res.morning_total_amount || 0,
                    morning_total_milk: res.morning_total_milk || 0,
                    evening_total_amount: res.evening_total_amount || 0,
                    evening_total_milk: res.evening_total_milk || 0,
                    total_amount: res.total_amount || 0,
                    milk_total: res.milk_total || 0,

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





    // INPUT REFS
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


    // RESET FORM HANDLER
    const resetForm = () => {
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

        setTimeout(() => accRef.current?.focus(), 200);
    }






    const isDisabled = !form.name; // Disable if customer data not loaded
    return (
        <div className="w-full min-h-screen  bg-white">
            <CommonHeader heading={"Milk Collection"} />

            {/* Grid for Form and Receipt */}
            <div className="grid md:grid-cols-2 gap-10 w-full mx-auto p-4  ">
                {/* === Left: Milk Collection Form === */}
                {/* === Left: Milk Collection Form === */}

                <form onSubmit={handleSubmit} className="bg-gradient-to-br from-orange-200 via-orange-100 to-yellow-50 p-5 rounded-xl shadow-lg border border-gray-200 w-full">
                    {/* Milk Type & Shift */}


                    <div className="mb-4 flex flex-col xl:flex-row gap-4 w-full" >
                        {/* Milk Type */}
                        <div
                            // className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center bg-gradient-to-r from-gray-50 to-gray-100 shadow-xl p-3 rounded border border-gray-400 w-full xl:w-1/2"
                            className="flex flex-col sm:flex-row bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-lg border border-gray-200 shadow w-full xl:w-1/2"


                        >
                            <label className="font-semibold min-w-[90px] text-sm">Milk Type:</label>
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
                                        <span className="capitalize px-3 py-1 rounded-full border border-gray-400 text-gray-700 cursor-pointer transition-all duration-200 peer-checked:bg-[#E6612A] peer-checked:text-white peer-checked:border-[#E6612A] bg-blue-100 hover:bg-green-100 text-xs font-medium">
                                            {type}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Date + Shift */}
                        <div
                            // className="flex flex-wrap md:flex-row gap-1 sm:gap-4 items-start lg:items-center bg-slate-300 shadow-xl p-1 rounded border border-gray-400 w-full xl:w-1/2" 
                            className="flex flex-wrap md:flex-row gap-1 sm:gap-2 items-start lg:items-center bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-lg border border-gray-200 shadow w-full xl:w-1/2"


                        >

                            {/* Date Input */}
                            < div className="flex items-center gap-1 sm:w-auto" >
                                <label className="font-semibold text-sm w-fit">Date:</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    name="date"
                                    onChange={handleChange}
                                    max={today}
                                    className="px-2 py-1 rounded border border-gray-400 text-gray-700 bg-white text-sm w-full sm:w-[140px]"
                                />
                            </div>

                            {/* Shift Radio */}
                            <div div className="flex items-center gap-2 w-full sm:w-auto" >
                                <label className="font-semibold text-sm min-w-fit">Shift:</label>
                                <div className="flex gap-2 flex-wrap">
                                    {['morning', 'evening'].map((shift) => (
                                        <label key={shift} className="relative">
                                            <input
                                                type="radio"
                                                name="shift"
                                                value={shift}
                                                onKeyDown={handleKeyDown}
                                                checked={shiftValue === shift}
                                                onChange={() => setShiftValue(shift)}
                                                className="peer hidden"
                                            />
                                            <span className="capitalize px-4 py-1 rounded-full border border-gray-400 text-gray-700 cursor-pointer transition-all duration-200 peer-checked:bg-[#E6612A] peer-checked:text-white peer-checked:border-[#E6612A] bg-blue-100 hover:bg-green-100 text-sm font-medium">
                                                {shift}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div >

                        </div >
                    </div >


                    {/* Customer Info Section */}
                    <div className="bg-black from-orange-100 to-orange-200  border border-orange-300 p-2 rounded-xl shadow mb-2 space-y-1">
                        {/* Row 1 */}
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-white" >Account No</label>

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
                                                qtyRef.current?.focus();
                                            } else {
                                                setForm((prev) => ({ ...prev, name: '', careof: '', mobile: '' }));
                                            }
                                        }
                                    }}
                                    placeholder="Enter AC No"
                                    className={`w-full h-5 px-4 py-2 rounded-sm border border-gray-300  text-xs placeholder-gray-500 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition `}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-white">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    ref={nameRef}
                                    onKeyDown={(e) => e.key === 'Enter' && fatRef.current?.focus()}
                                    className={`w-full h-5 px-4 py-2 rounded-sm border border-gray-300 bg-white text-xs placeholder-gray-500 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isDisabled ? 'bg-gray-300 opacity-60' : ''}`}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white">Mobile</label>
                                <input
                                    type="text"
                                    name="mobile"
                                    value={form.mobile}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    ref={mobileRef}
                                    onKeyDown={(e) => e.key === 'Enter' && clrRef.current?.focus()}
                                    className={`w-full h-5 px-4 py-2 rounded-sm border border-gray-300 bg-white text-xs placeholder-gray-500 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isDisabled ? 'bg-gray-300 opacity-60' : ''}`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-white">Care of</label>
                                <input
                                    type="text"
                                    name="careof"
                                    value={form.careof}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    ref={careOfRef}
                                    onKeyDown={(e) => e.key === 'Enter' && snfRef.current?.focus()}
                                    className={`w-full h-5 px-4 py-2 rounded-sm border border-gray-300 bg-white text-xs placeholder-gray-500 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isDisabled ? 'bg-gray-300 opacity-60' : ''}`}
                                />
                            </div>

                        </div>

                        {/* Row 2 */}
                        <div div className="grid grid-cols-2 gap-4" >
                            <div>
                                <label className="block text-xs font-medium text-white">Quantity (Ltr)</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    ref={qtyRef}
                                    placeholder="Enter Quantity"
                                    onKeyDown={(e) => e.key === 'Enter' && nameRef.current?.focus()}
                                    required
                                    className={`w-full h-5 px-4 py-2 rounded-sm border border-gray-300 bg-white text-xs placeholder-gray-500 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isDisabled ? 'bg-gray-300 opacity-60' : ''}`}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white">FAT (%)</label>
                                <input
                                    type="number"
                                    name="fat"
                                    value={form.fat}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    ref={fatRef}
                                    placeholder="Enter FAT %"
                                    // onKeyDown={(e) => e.key === 'Enter' && mobileRef.current?.focus()}
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter') {
                                            const fat = form.fat?.trim();
                                            const clr = form.clr?.trim();
                                            const snfRaw = form.snf?.trim();

                                            // If SNF or CLR is empty → focus on SNF input and prevent fetch
                                            if (!snfRaw) {
                                                e.preventDefault();
                                                snfRef.current?.focus();
                                                return;
                                            }

                                            // If both CLR and SNF have values → fetch milk rate
                                            e.preventDefault();
                                            const snfForApi = !snfRaw.includes('.') ? `${snfRaw}.0` : snfRaw;

                                            try {
                                                const res = await getMilkRate(fat, clr, snfForApi);
                                                setForm((prev) => ({
                                                    ...prev,
                                                    fat: res.fat || "",
                                                    clr: res.clr || "",
                                                    snf: res.snf || prev.snf,
                                                    base_rate: res.rate || '',
                                                }));
                                                otherRateRef.current?.focus()
                                                res.rate
                                                    ? CustomToast.success("Rate Found", "top-center")
                                                    : CustomToast.warn("RATE not found", "top-center");


                                            } catch (err) {
                                                console.error("Rate error", err);
                                            }
                                        }
                                    }}
                                    required
                                    className={`w-full h-5 px-4 py-2 rounded-sm border border-gray-300 bg-white text-xs placeholder-gray-500 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isDisabled ? 'bg-gray-300 opacity-60' : ''}`}
                                />
                            </div>
                        </div>









                        {/* Row 3 */}
                        < div className="grid grid-cols-2 gap-4" >

                            <div>
                                <label className="block text-xs font-medium text-white">CLR</label>
                                <input
                                    type="number"
                                    name="clr"
                                    placeholder='Enter Clr'
                                    value={form.clr}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    ref={clrRef}
                                    onKeyDown={(e) => e.key === 'Enter' && careOfRef.current?.focus()}
                                    className={`w-full h-5 px-4 py-2 rounded-sm border border-gray-300 bg-white text-xs placeholder-gray-500 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isDisabled ? 'bg-gray-300 opacity-60' : ''}`}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white">SNF (%)</label>
                                <input
                                    type="text"
                                    value={form.snf}
                                    required
                                    disabled={isDisabled}
                                    className={`w-full h-5 px-4 py-2 rounded-sm border border-gray-300 bg-white text-xs placeholder-gray-500 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isDisabled ? 'bg-gray-300 opacity-60' : ''}`}
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

                        </ div>
                    </div>

                    {/* Rate & Total Section */}


                    <div className="bg-black from-orange-100 to-orange-200 p-2 rounded-xl border border-orange-300 shadow-sm mb-2 grid grid-cols-2 gap-2">
                        {/* Base Rate */}
                        <div className="flex flex-col">
                            <label className="block text-xs font-medium mb-1 text-white">Base Rate (₹/Ltr)</label>
                            <input
                                type="number"
                                name="base_rate"
                                value={form.base_rate}
                                onChange={handleChange}
                                readOnly
                                ref={otherRateRef}
                                onKeyDown={(e) => e.key === 'Enter' && submitRef.current?.focus()}
                                className={`w-full h-5 px-4 py-2 rounded-sm border border-gray-300 bg-white text-xs placeholder-gray-500 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isDisabled ? 'bg-gray-300 opacity-60' : ''}`}
                            />
                        </div>

                        {/* Other Price */}
                        <div className="flex flex-col">
                            <label className="block text-xs font-medium mb-1 text-white">Other Price (₹/Ltr)</label>
                            <input
                                type="number"
                                name="other_price"
                                value={form.other_price}
                                onChange={handleChange}
                                disabled={isDisabled}
                                onKeyDown={handleKeyDown}
                                className={`w-full h-5 px-4 py-2 rounded-sm border border-gray-300 bg-white text-xs placeholder-gray-500 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isDisabled ? 'bg-gray-300 opacity-60' : ''}`}
                            />
                        </div>

                        {/* Rate */}
                        <div className="flex flex-col">
                            <label className="block text-xs font-medium mb-1 text-white">Rate (Auto)</label>
                            <input
                                type="number"
                                name="rate"
                                value={form.rate}
                                onKeyDown={handleKeyDown}
                                readOnly
                                className={`w-full h-5 px-4 py-2 rounded-sm border border-gray-300 bg-white text-xs placeholder-gray-500 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isDisabled ? 'bg-gray-300 opacity-60' : ''}`}
                            />
                        </div>

                        {/* Total Amount */}
                        <div className="flex flex-col">
                            <label className="block text-xs font-medium mb-1 text-white">Total Amount (Auto)</label>
                            <input
                                type="number"
                                name="total_amount"
                                value={form.total_amount}
                                onKeyDown={handleKeyDown}
                                readOnly
                                className={`w-full h-5 px-4 py-2 rounded-sm border border-gray-300 bg-white text-xs placeholder-gray-500 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isDisabled ? 'bg-gray-300 opacity-60' : ''}`}
                            />
                        </div>
                    </div>


                    {/* Submit + Toggle */}
                    <div className="flex items-center gap-4">
                        <ToggleButton label="Print" enabled={toggle} onToggle={(val) => setToggle(val)} />
                        <input
                            type="submit"
                            disabled={isDisabled}
                            value="Submit"
                            className="px-4 py-1 rounded-sm bg-[#E6612A] text-white font-medium hover:bg-blue-700 transition-all shadow disabled:opacity-50"
                            ref={submitRef}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSubmit();
                                    setTimeout(() => accRef.current?.focus(), 300);
                                }
                            }}
                        />
                        <div className='px-4 py-1 bg-gray-300 text-black  rounded-lg cursor-pointer' onClick={resetForm}>Reset</div>
                    </div>
                </form>






                <div className="flex flex-col gap-6   w-full bg-gradient-to-br from-orange-200 via-orange-100 to-yellow-50 p-6 rounded-xl shadow-2xl">

                    {/* Day Total Card */}
                    <div className="w-full rounded-xl border border-orange-300 shadow-xl overflow-hidden">
                        {/* Header Bar */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2">
                            <h2 className="text-white font-bold text-lg">Day Total</h2>
                        </div>

                        {/* Grid Content */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-6 text-sm text-gray-800">
                            {/* Shift Morning */}
                            <div className="bg-orange-50 p-4 rounded shadow-inner border border-orange-200">
                                <div className="font-medium border-b border-orange-300 mb-2 text-orange-700">Shift Morning</div>
                                <div className="flex justify-between mb-1">
                                    <span>Milk Total :</span>
                                    <span>{dayTotal?.morning_total_milk.toFixed(2)} Kg</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span>Rs. Total :</span>
                                    <span>₹ {dayTotal?.morning_total_amount.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Shift Evening */}
                            <div className="bg-orange-50 p-4 rounded shadow-inner border border-orange-200">
                                <div className="font-medium border-b border-orange-300 mb-2 text-orange-700">Shift Evening</div>
                                <div className="flex justify-between mb-1">
                                    <span>Milk Total :</span>
                                    <span>{dayTotal?.evening_total_milk.toFixed(2)} Kg</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span>Rs. Total :</span>
                                    <span>₹ {dayTotal?.evening_total_amount.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Total Today */}
                            <div className="bg-orange-50 p-4 rounded shadow-inner border border-orange-200">
                                <div className="font-medium border-b border-orange-300 mb-2 text-orange-700">Total Today</div>
                                <div className="flex justify-between mb-1">
                                    <span>Milk Total :</span>
                                    <span>{dayTotal?.milk_total.toFixed(2)} Kg</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span>Rs. Total :</span>
                                    <span>₹ {dayTotal?.total_amount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Receipt Section */}
                    {/* <div className="w-full rounded-xl border border-orange-300 shadow-xl overflow-hidden">
                        
                        <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2">
                            <h3 className="text-white font-bold text-lg">Customer Receipt</h3>
                        </div>

                       
                        <div className="bg-white p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                           
                            <table className="w-full text-sm text-left border border-orange-200 rounded-sm overflow-hidden">
                                <tbody>
                                    {[
                                        ['Milk Type', milkType || '-'],
                                        ['Account No', form.customer_account_number || '-'],
                                        ['Name', form.name || '-'],
                                        ['Care Of', form.careof || '-'],
                                        ['Mobile', form.mobile || '-'],
                                    ].map(([label, value]) => (
                                        <tr key={label} className="border-b hover:bg-orange-50">
                                            <td className="font-medium text-orange-800 px-4 py-2 w-1/3 bg-orange-100">{label}</td>
                                            <td className="px-4 py-2">{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            
                            <table className="w-full text-sm text-left border border-orange-200 rounded-sm overflow-hidden">
                                <tbody>
                                    {[
                                        ['Quantity', form.quantity ? `${form.quantity} Ltr` : '-'],
                                        ['FAT', form.fat || '-'],
                                        ['SNF', form.snf || '-'],
                                        ['Rate', form.rate ? `₹${form.rate}` : '-'],
                                        ['Total Amount', form.total_amount ? `₹${form.total_amount}` : '-'],
                                    ].map(([label, value]) => (
                                        <tr key={label} className="border-b hover:bg-orange-50">
                                            <td className="font-medium text-orange-800 px-4 py-2 w-1/3 bg-orange-100">{label}</td>
                                            <td className="px-4 py-2">{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div> */}
                </div>





            </div>



            {/* === Bottom Table === */}
            <div className="mt-4 m-auto w-[98%] bg-gradient-to-br from-orange-200 via-orange-100 to-yellow-50 shadow-lg  p-4 rounded-xl border border-dashed" >
                <h3 className="text-xl  mb-4 text-slate-600 font-semibold">Milk Daily Collections</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead className="bg-orange-400 text-slate-100">
                            <tr>
                                {['SR NO.', 'AC No', 'Name', 'Date', 'SHIFT', 'QTY', 'FAT', 'SNF', 'Rate', 'Other Rate', 'Total Amount', 'Balance', 'Action'].map(header => (
                                    <th key={header} className="border px-2 py-1">{header}</th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>


                            {



                                morningCollection.length === 0 && eveningCollection.length === 0 ? (
                                    <tr>
                                        <td colSpan="13" className="text-center text-gray-500 py-4">
                                            Data not available
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {



                                            isShift == 'morning' && morningCollection.length > 0 && (
                                                <>
                                                    <tr className="bg-slate-100 font-semibold">
                                                        <td colSpan="13" className="text-center px-2 py-2 font-bold">
                                                            Morning Collection
                                                        </td>
                                                    </tr>
                                                    {morningCollection.map((item, i) => (
                                                        <tr
                                                            key={`morning-${i}`}
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
                                                            <td className="border px-2 py-1 text-center">{item?.customer?.wallet || 0}</td>
                                                            <td className="border px-2 py-1 text-center">
                                                                <div className="flex gap-2 justify-center">
                                                                    <button className="bg-blue-700 text-white px-2 py-1 rounded text-xs" onClick={() => handlePrint(item)}>
                                                                        <BsFillPrinterFill size={12} color="#fff" />
                                                                    </button>
                                                                    <button className="bg-green-500 text-white px-2 py-1 rounded text-xs" onClick={() => { setSelectedCustomer(item); setIsModalOpen(true); }}>
                                                                        <FaEye size={12} />
                                                                    </button>
                                                                    <button className="bg-yellow-500 text-white px-2 py-1 rounded text-xs" onClick={() => { setSelectedCustomer(item); setIsEditeModal(true); }}>
                                                                        <FaPen size={14} />
                                                                    </button>
                                                                    <button className="bg-red-600 text-white px-2 py-1 rounded text-xs" onClick={() => { setDeleteId(item.id); setShowConfirmModal(true); }}>
                                                                        <FaTrashCan size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </>
                                            )}

                                        {

                                            isShift === 'evening' && eveningCollection.length > 0 && (
                                                <>
                                                    <tr className="bg-slate-100 font-semibold">
                                                        <td colSpan="13" className="text-center font-bold px-2 py-2 text-slate-600">
                                                            Evening Collection
                                                        </td>
                                                    </tr>
                                                    {eveningCollection.map((item, i) => (
                                                        <tr
                                                            key={`evening-${i}`}
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
                                                            <td className="border px-2 py-1 text-center">{item?.customer?.wallet || 'Customer not available'}</td>
                                                            <td className="border px-2 py-1 text-center">
                                                                <div className="flex gap-2 justify-center">
                                                                    <button className="bg-blue-700 text-white px-2 py-1 rounded text-xs" onClick={() => handlePrint(item)}>
                                                                        <BsFillPrinterFill size={12} color="#fff" />
                                                                    </button>
                                                                    <button className="bg-green-500 text-white px-2 py-1 rounded text-xs" onClick={() => { setSelectedCustomer(item); setIsModalOpen(true); }}>
                                                                        <FaEye size={12} />
                                                                    </button>
                                                                    <button className="bg-yellow-500 text-white px-2 py-1 rounded text-xs" onClick={() => { setSelectedCustomer(item); setIsEditeModal(true); }}>
                                                                        <FaPen size={14} />
                                                                    </button>
                                                                    <button className="bg-red-600 text-white px-2 py-1 rounded text-xs" onClick={() => { setDeleteId(item.id); setShowConfirmModal(true); }}>
                                                                        <FaTrashCan size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </>
                                            )}
                                    </>
                                )}
                        </tbody>


                        {/* <tbody>
                            {morningCollection.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="text-center text-gray-500 py-4">
                                        Data not available
                                    </td>
                                </tr>
                            ) : (
                                morningCollection.map((item, i) => (
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
                                                    className="bg-blue-700 text-white px-2 py-1 rounded text-xs"
                                                    onClick={() => {
                                                        handlePrint(item);
                                                    }}
                                                >
                                                    <BsFillPrinterFill size={12} color='#fff' />
                                                </button>
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

                        </tbody> */}
                    </table>

                    <div className=' w-full flex justify-between items-center p-2 bg-yellow-200 '>
                        <div className='text-sm flex-1 font-semibold text-gray-700 flex justify-center items-center gap-2'>
                            <p className='font-bold'>Ave. Fat</p>
                            <p className='font-bold'>{isShift == 'morning' ? milkCollectiionAvergeData?.morning_avg_fat : milkCollectiionAvergeData?.evening_avg_fat}</p>
                        </div>
                        <div className='text-sm flex-1 font-semibold text-gray-700 flex justify-center items-center gap-2'>
                            <p className='font-bold'>Ave. Snf</p>
                            <p className='font-bold'>{isShift == 'morning' ? milkCollectiionAvergeData?.morning_avg_snf : milkCollectiionAvergeData?.evening_avg_snf}</p>
                        </div>
                        <div className='text-sm flex-1 font-semibold text-gray-700 flex justify-center items-center gap-2'>
                            <p className='font-bold'>Ave. Base Rate</p>
                            <p className='font-bold'>₹{isShift == 'morning' ? milkCollectiionAvergeData?.morning_avg_base_rate : milkCollectiionAvergeData?.evening_avg_base_rate}</p>
                        </div>

                        <div className='text-sm flex-1 font-semibold text-gray-700 flex justify-center items-center gap-2'>
                            <p className='font-bold'>Other Price</p>
                            <p className='font-bold'>₹{Number(milkCollectiionAvergeData?.other_price_total).toFixed(2) || 0}</p>
                        </div>


                        <div className='text-sm flex-1 font-semibold text-gray-700 flex justify-center items-center gap-2'>
                            <p className='font-bold'>Milk Total</p>
                            <p className='font-bold'>{isShift == 'morning' ? Number(milkCollectiionAvergeData?.morning_total_milk).toFixed(2) || 0 : Number(milkCollectiionAvergeData?.evening_total_milk).toFixed(2) || 0} KG</p>
                        </div>
                        <div className='text-sm flex-1  text-gray-700 flex justify-center items-center gap-2'>
                            <p className='font-bold'>Total Amount</p>
                            <p className='font-bold'>₹{isShift == 'morning' ? Number(milkCollectiionAvergeData?.morning_total_amount).toFixed(2) : Number(milkCollectiionAvergeData?.evening_total_amount).toFixed(2)}</p>
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
                            <IosmCloseCircle size={30} />
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
