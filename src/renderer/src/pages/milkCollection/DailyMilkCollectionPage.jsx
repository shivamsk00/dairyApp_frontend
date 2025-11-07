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
import '../../assets/scrollbar.css'

const DairyMilkCollectionPage = () => {
    const nav = useNavigate()
    const today = new Date().toISOString().split('T')[0];

    const fetchCustomerDetailsByAccount = useHomeStore(state => state.fetchCustomerDetailsByAccount);
    const submitMilkCollection = useHomeStore(state => state.submitMilkCollection);
    const getMilkCollectionRecord = useHomeStore(state => state.getMilkCollectionRecord);
    const deleteMilkCollection = useHomeStore(state => state.deleteMilkCollection);
    const getMilkRate = useHomeStore(state => state.getMilkRate);

    // State variables
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
        const hour = now.getHours();

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
        try {
            const res = await fetchCustomerDetailsByAccount(accountNo);
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

    // Auto-calculate rate and total amount
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Only clear name when account number changes - NOT other fields
        if (name === 'customer_account_number') {
            setForm(prev => ({
                ...prev,
                [name]: value,
                name: ''  // Only clear name field
            }));
            return;
        }

        setForm(prev => {
            let updated = { ...prev, [name]: type === 'checkbox' ? checked : value };

            if (name === "clr") {
                updated.snf = "";
            } else if (name === "snf") {
                updated.clr = "";
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
            console.log("submitted milk collection response", res)
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
            CustomToast.error(error)
        }
    };

    const fetchMilkCollectionDetails = async (page = 1) => {
        try {
            const res = await getMilkCollectionRecord(page);
            console.log("milk collection data fetch success====>");
            if (res.status_code == 200) {
                setCollections(res.morning);
                setMorningCollection(res.morning);
                setEveningCollection(res.evening);
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

    // PRINT HANDLER
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
            time: `${localTime}(${shift})`,
            qty: `${data.quantity} / Ltr`,
            fat: data.fat,
            snf: data.snf,
            rate: `${data.base_rate} / Ltr`,
            total: data.total_amount
        };

        window.api.printSlip(slipData);
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

    // Enhanced keyboard navigation with auto-fetch
    const handleAccountKeyDown = async (e) => {
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
    };

    const handleQuantityKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const accNo = form.customer_account_number.trim();
            if (accNo && !form.name) {
                await fetchCustomerDetailByAccountNumber(accNo);
            }
            fatRef.current?.focus();
        }
    };

    const handleQuantityFocus = async () => {
        const accNo = form.customer_account_number.trim();
        if (accNo && !form.name) {
            await fetchCustomerDetailByAccountNumber(accNo);
        }
    };

    const handleFatKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const accNo = form.customer_account_number.trim();
            if (accNo && !form.name) {
                await fetchCustomerDetailByAccountNumber(accNo);
            }
            snfRef.current?.focus();
        }
    };

    const handleSnfKeyDown = async (e) => {
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
    };

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

    return (
        <div className="w-full h-screen bg-white flex flex-col overflow-hidden">
            <CommonHeader heading={"Daily Milk Collection"} />

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* === Left: Form Section === */}
                <div className="w-full lg:w-[400px] xl:w-[450px] bg-gradient-to-br from-blue-200 to-indigo-100 border-r border-gray-200 flex flex-col overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-4 flex-1 overflow-y-auto scrollable-table hide-scrollbar" style={{ height: 'calc(100vh - 64px)' }}>
                        {/* Milk Type & Shift */}
                        <div className="flex gap-4 ">
                            {/* Milk Type */}
                            <div className="w-1/2 ">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Milk Type:</label>
                                <div className="flex gap-1">
                                    {['cow', 'buffalo', 'other'].map((type) => (
                                        <label key={type} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="milkType"
                                                value={type}
                                                checked={milkType === type}
                                                onChange={() => setMilkType(type)}
                                                className="mr-1"
                                            />
                                            <span className="capitalize text-sm">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Date */}
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    name="date"
                                    onChange={handleChange}
                                    max={today}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                            </div>
                        </div>

                        {/* Shift */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Shift:</label>
                            <div className="flex gap-4">
                                {['morning', 'evening'].map((shift) => (
                                    <label key={shift} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="shift"
                                            value={shift}
                                            checked={shiftValue === shift}
                                            onChange={() => setShiftValue(shift)}
                                            className="mr-1"
                                        />
                                        <span className="capitalize text-sm">{shift}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Customer Details */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    disabled
                                    ref={nameRef}
                                    className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100 text-gray-600 text-sm"
                                    placeholder="Auto-filled"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account No *</label>
                                <input
                                    type="text"
                                    name="customer_account_number"
                                    value={form.customer_account_number}
                                    onChange={handleChange}
                                    ref={accRef}
                                    onKeyDown={handleAccountKeyDown}
                                    placeholder="Account No"
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    required
                                />
                            </div>



                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Care of</label>
                                <input
                                    type="text"
                                    name="careof"
                                    value={form.careof}
                                    onChange={handleChange}
                                    disabled
                                    ref={careOfRef}
                                    className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100 text-gray-600 text-sm"
                                    placeholder="Auto-filled"
                                />
                            </div>

                            {/* Quantity - NOT DISABLED, with fetch on focus */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Ltr) *</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    ref={qtyRef}
                                    onKeyDown={handleQuantityKeyDown}
                                    onFocus={handleQuantityFocus}  // Fetch on focus
                                    placeholder="Quantity"
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                                <input
                                    type="text"
                                    name="mobile"
                                    value={form.mobile}
                                    onChange={handleChange}
                                    disabled
                                    ref={mobileRef}
                                    className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100 text-gray-600 text-sm"
                                    placeholder="Auto-filled"
                                />
                            </div>



                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">FAT (%) *</label>
                                <input
                                    type="number"
                                    name="fat"
                                    value={form.fat}
                                    onChange={handleChange}
                                    ref={fatRef}
                                    onKeyDown={handleFatKeyDown}
                                    placeholder="FAT %"
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CLR</label>
                                <input
                                    type="number"
                                    name="clr"
                                    placeholder="CLR"
                                    value={form.clr}
                                    onChange={handleChange}
                                    ref={clrRef}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SNF (%) *</label>
                                <input
                                    type="text"
                                    value={form.snf}
                                    required
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    name="snf"
                                    onChange={handleChange}
                                    ref={snfRef}
                                    onKeyDown={handleSnfKeyDown}
                                    placeholder="SNF %"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Base Rate (₹/Ltr)</label>
                                <input
                                    type="number"
                                    name="base_rate"
                                    value={form.base_rate}
                                    onChange={handleChange}
                                    readOnly
                                    className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100 text-gray-600 text-sm"
                                    placeholder="Auto-calculated"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Other Price (₹)</label>
                                <input
                                    type="number"
                                    name="other_price"
                                    value={form.other_price}
                                    onChange={handleChange}
                                    ref={otherRateRef}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rate (Auto)</label>
                                <input
                                    type="number"
                                    name="rate"
                                    value={form.rate}
                                    readOnly
                                    className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100 text-gray-600 text-sm"
                                    placeholder="Auto-calculated"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                                <input
                                    type="number"
                                    name="total_amount"
                                    value={form.total_amount}
                                    readOnly
                                    className="w-full px-2 py-1 border border-gray-300 rounded bg-green-100 text-green-800 text-sm font-semibold"
                                    placeholder="Auto-calculated"
                                />
                            </div>
                        </div>

                        {/* Submit Section */}
                        <div className="flex items-center justify-between pt-4">
                            <ToggleButton
                                label="Auto Print"
                                enabled={toggle}
                                onToggle={(val) => setToggle(val)}
                            />

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded"
                                >
                                    Reset
                                </button>

                                <button
                                    type="submit"
                                    ref={submitRef}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>

                        {/* Customer Wallet Display */}
                        {customerWallet !== null && (
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-blue-800">Wallet Balance:</span>
                                    <span className="text-lg font-bold text-blue-600">₹{customerWallet}</span>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* === Right: Day Total + Table === */}
                <div className="w-full lg:flex-1 flex flex-col overflow-hidden">
                    {/* Day Total Card */}
                    <div className="bg-white border-b border-gray-300 p-3 sm:p-4 flex-shrink-0">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Daily Summary</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                            {/* Morning */}
                            <div className="bg-blue-500 p-3 rounded border border-orange-200">
                                <h3 className="font-semibold text-white mb-2">Morning</h3>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-white">
                                        <span>Milk:</span>
                                        <span className="font-semibold">{dayTotal?.morning_total_milk.toFixed(2)} L</span>
                                    </div>
                                    <div className="flex justify-between text-white">
                                        <span>Amount:</span>
                                        <span className="font-bold text-white">₹{dayTotal?.morning_total_amount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Evening */}
                            <div className="bg-orange-500 p-3 rounded border border-purple-200">
                                <h3 className="font-semibold text-white mb-2">Evening</h3>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-white">
                                        <span>Milk:</span>
                                        <span className="font-semibold">{dayTotal?.evening_total_milk.toFixed(2)} L</span>
                                    </div>
                                    <div className="flex justify-between text-white">
                                        <span>Amount:</span>
                                        <span className="font-bold text-white">₹{dayTotal?.evening_total_amount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="bg-green-500 p-3 rounded border border-green-200">
                                <h3 className="font-semibold text-white mb-2">Total</h3>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-white">
                                        <span>Milk:</span>
                                        <span className="font-semibold">{dayTotal?.milk_total.toFixed(2)} L</span>
                                    </div>
                                    <div className="flex justify-between text-white">
                                        <span>Amount:</span>
                                        <span className="font-bold text-white">₹{dayTotal?.total_amount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Table */}
                    <div className="flex flex-col flex-1 relative overflow-hidden">
                        {/* Fixed Header */}
                        <div className="bg-black border-b w-full min-w-[1000px] sticky top-0 z-10">
                            <table className="w-full text-xl table-fixed">
                                <colgroup>
                                    <col style={{ width: '40px' }} />     {/* SR */}
                                    <col style={{ width: '80px' }} />     {/* AC No */}
                                    <col style={{ width: '120px' }} />    {/* Name */}
                                    <col style={{ width: '80px' }} />     {/* Date */}
                                    <col style={{ width: '60px' }} />     {/* Shift */}
                                    <col style={{ width: '60px' }} />     {/* Qty */}
                                    <col style={{ width: '50px' }} />     {/* FAT */}
                                    <col style={{ width: '50px' }} />     {/* SNF */}
                                    <col style={{ width: '70px' }} />     {/* Rate */}
                                    <col style={{ width: '60px' }} />     {/* Other */}
                                    <col style={{ width: '70px' }} />     {/* Total */}
                                    <col style={{ width: '70px' }} />     {/* Balance */}
                                    <col style={{ width: '130px' }} />    {/* Actions */}
                                </colgroup>
                                <thead>
                                    <tr>
                                        {['SR', 'AC No', 'Name', 'Date', 'Shift', 'Qty', 'FAT', 'SNF', 'Rate', 'Other', 'Total', 'Balance', 'Actions'].map(header => (
                                            <th key={header} className="px-2 py-2 text-center text-[16px] font-bold text-white truncate">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                            </table>
                        </div>

                        {/* Scrollable Body with bottom padding for footer space */}
                        <div className="flex-1 overflow-auto scrollable-table pb-28">
                            <div className="min-w-[1000px]">
                                <table className="w-full text-xl table-fixed">
                                    <colgroup>
                                        <col style={{ width: '40px' }} />     {/* SR */}
                                        <col style={{ width: '80px' }} />     {/* AC No */}
                                        <col style={{ width: '120px' }} />    {/* Name */}
                                        <col style={{ width: '80px' }} />     {/* Date */}
                                        <col style={{ width: '60px' }} />     {/* Shift */}
                                        <col style={{ width: '60px' }} />     {/* Qty */}
                                        <col style={{ width: '50px' }} />     {/* FAT */}
                                        <col style={{ width: '50px' }} />     {/* SNF */}
                                        <col style={{ width: '70px' }} />     {/* Rate */}
                                        <col style={{ width: '60px' }} />     {/* Other */}
                                        <col style={{ width: '70px' }} />     {/* Total */}
                                        <col style={{ width: '70px' }} />     {/* Balance */}
                                        <col style={{ width: '130px' }} />    {/* Actions */}
                                    </colgroup>
                                    <tbody>
                                        {morningCollection.length === 0 && eveningCollection.length === 0 ? (
                                            <tr>
                                                <td colSpan="13" className="text-center text-gray-500 py-8">
                                                    No data available
                                                </td>
                                            </tr>
                                        ) : (
                                            <>
                                                {isShift === 'morning' && morningCollection.length > 0 && (
                                                    <>
                                                        <tr className="bg-orange-100">
                                                            <td colSpan="13" className="px-2 py-2 text-center font-semibold text-blue-800 text-xs">
                                                                Morning Collection ({morningCollection.length})
                                                            </td>
                                                        </tr>
                                                        {morningCollection.map((item, i) => (
                                                            <tr key={`morning-${i}`} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                                                                <td className="px-2 py-1 text-[14px] font-bold truncate">{i + 1}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold  text-blue-600 truncate">{item.customer_account_number}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold truncate" title={item.name}>{item.name}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold truncate">{item.date}</td>
                                                                <td className="px-2 py-1 truncate">
                                                                    <span className="px-1 py-0.5 text-[14px] font-bold bg-orange-100 text-orange-800 rounded block text-center">
                                                                        {item.shift}
                                                                    </span>
                                                                </td>
                                                                <td className="px-2 py-1 text-[14px] font-bold  truncate">{item.quantity}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold truncate">{item.fat}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold truncate">{item.snf}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold text-green-600 truncate">₹{item.base_rate}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold truncate">₹{item.other_price}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold  text-green-700 truncate">₹{item.total_amount}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold text-blue-600 truncate">₹{item?.customer?.wallet || 0}</td>
                                                                <td className="px-2 py-1">
                                                                    <div className="flex gap-0.5 justify-center">
                                                                        <button
                                                                            className="p-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200 transition-colors"
                                                                            onClick={() => handlePrint(item)}
                                                                            title="Print"
                                                                        >
                                                                            <BsFillPrinterFill size={16} />
                                                                        </button>
                                                                        <button
                                                                            className="p-1 bg-green-100 text-green-600 rounded text-xs hover:bg-green-200 transition-colors"
                                                                            onClick={() => { setSelectedCustomer(item); setIsModalOpen(true); }}
                                                                            title="View"
                                                                        >
                                                                            <FaEye size={16} />
                                                                        </button>
                                                                        <button
                                                                            className="p-1 bg-yellow-100 text-yellow-600 rounded text-xs hover:bg-yellow-200 transition-colors"
                                                                            onClick={() => { setSelectedCustomer(item); setIsEditeModal(true); }}
                                                                            title="Edit"
                                                                        >
                                                                            <FaPen size={16} />
                                                                        </button>
                                                                        <button
                                                                            className="p-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 transition-colors"
                                                                            onClick={() => { setDeleteId(item.id); setShowConfirmModal(true); }}
                                                                            title="Delete"
                                                                        >
                                                                            <FaTrashCan size={16} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </>
                                                )}

                                                {isShift === 'evening' && eveningCollection.length > 0 && (
                                                    <>
                                                        <tr className="bg-purple-100">
                                                            <td colSpan="13" className="px-2 py-2 text-center font-semibold text-purple-800 text-xs">
                                                                Evening Collection ({eveningCollection.length})
                                                            </td>
                                                        </tr>
                                                        {eveningCollection.map((item, i) => (
                                                            <tr key={`evening-${i}`} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                                                                <td className="px-2 py-1 text-[14px] font-bold  truncate">{i + 1}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold   text-blue-600 truncate">{item.customer_account_number}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold truncate" title={item.name}>{item.name}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold  truncate">{item.date}</td>
                                                                <td className="px-2 py-1 truncate">
                                                                    <span className="px-1 py-0.5 text-[14px] font-bold  bg-purple-100 text-purple-800 rounded block text-center">
                                                                        {item.shift}
                                                                    </span>
                                                                </td>
                                                                <td className="px-2 py-1 text-[14px] font-bold   truncate">{item.quantity}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold  truncate">{item.fat}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold  truncate">{item.snf}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold  text-green-600 truncate">₹{item.base_rate}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold  truncate">₹{item.other_price}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold   text-green-700 truncate">₹{item.total_amount}</td>
                                                                <td className="px-2 py-1 text-[14px] font-bold  text-blue-600 truncate">₹{item?.customer?.wallet || 0}</td>
                                                                <td className="px-2 py-1">
                                                                    <div className="flex gap-0.5 justify-center">
                                                                        <button
                                                                            className="p-1 bg-blue-100 text-blue-600 rounded text-[14px] font-bold  hover:bg-blue-200 transition-colors"
                                                                            onClick={() => handlePrint(item)}
                                                                            title="Print"
                                                                        >
                                                                            <BsFillPrinterFill size={16} />
                                                                        </button>
                                                                        <button
                                                                            className="p-1 bg-green-100 text-green-600 rounded text-[14px] font-bold  hover:bg-green-200 transition-colors"
                                                                            onClick={() => { setSelectedCustomer(item); setIsModalOpen(true); }}
                                                                            title="View"
                                                                        >
                                                                            <FaEye size={16} />
                                                                        </button>
                                                                        <button
                                                                            className="p-1 bg-yellow-100 text-yellow-600 rounded text-[14px] font-bold  hover:bg-yellow-200 transition-colors"
                                                                            onClick={() => { setSelectedCustomer(item); setIsEditeModal(true); }}
                                                                            title="Edit"
                                                                        >
                                                                            <FaPen size={16} />
                                                                        </button>
                                                                        <button
                                                                            className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                                                            onClick={() => { setDeleteId(item.id); setShowConfirmModal(true); }}
                                                                            title="Delete"
                                                                        >
                                                                            <FaTrashCan size={16} />
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
                                </table>
                            </div>
                        </div>

                        {/* Completely Fixed Footer at Bottom - Will NOT scroll */}
                        <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t z-10">
                            <div className="p-3">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-4 sm:p-6 relative overflow-y-auto max-h-[90vh] m-auto">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
                            Milk Collection Details
                        </h2>

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
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-sm mx-auto">
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

export default DairyMilkCollectionPage;


// import React, { useState, useEffect, useRef } from 'react'
// import useHomeStore from '../../zustand/useHomeStore'
// import { toast } from 'react-toastify'
// import { FaEye, FaPen, FaSync, FaPlus } from 'react-icons/fa'
// import { FaTrashCan } from 'react-icons/fa6'
// import CustomToast from '../../helper/costomeToast'
// import { IoMdCloseCircle } from 'react-icons/io'
// import { useNavigate } from 'react-router-dom'
// import EditCustomerModal from '../customer/EditCustomerPage'
// import EditMilkCollectionModal from './EditMilkCollectionPage'
// import { BsFillPrinterFill } from 'react-icons/bs'
// import '../../assets/scrollbar.css'

// const DairyMilkCollectionPage = () => {
//     const nav = useNavigate()
//     const today = new Date().toISOString().split('T')[0]

//     const fetchCustomerDetailsByAccount = useHomeStore(state => state.fetchCustomerDetailsByAccount)
//     const submitMilkCollection = useHomeStore(state => state.submitMilkCollection)
//     const getMilkCollectionRecord = useHomeStore(state => state.getMilkCollectionRecord)
//     const deleteMilkCollection = useHomeStore(state => state.deleteMilkCollection)
//     const getMilkRate = useHomeStore(state => state.getMilkRate)

//     const [isModalOpen, setIsModalOpen] = useState(false)
//     const [selectedCustomer, setSelectedCustomer] = useState(null)
//     const [deleteId, setDeleteId] = useState(null)
//     const [showConfirmModal, setShowConfirmModal] = useState(false)
//     const [milkType, setMilkType] = useState('cow')
//     const [shiftValue, setShiftValue] = useState('morning')
//     const [isShift, setIsShift] = useState('morning')
//     const [isEditeModal, setIsEditeModal] = useState(false)
//     const [collections, setCollections] = useState([])
//     const [toggle, setToggle] = useState(true)
//     const [milkCollectiionAvergeData, setMilkCollectionAvergeData] = useState({})
//     const [dayTotal, setDayTotal] = useState({
//         morning_total_amount: 0,
//         morning_total_milk: 0,
//         evening_total_amount: 0,
//         evening_total_milk: 0,
//         total_amount: 0,
//         milk_total: 0,
//     })
//     const [morningCollection, setMorningCollection] = useState([])
//     const [eveningCollection, setEveningCollection] = useState([])
//     const [customerWallet, setCustomerWallet] = useState(null)
//     const [refreshing, setRefreshing] = useState(false)

//     const [form, setForm] = useState({
//         customer_account_number: '',
//         name: '',
//         careof: '',
//         mobile: '',
//         quantity: '',
//         clr: '',
//         fat: '',
//         snf: '',
//         base_rate: '',
//         other_price: '0',
//         rate: '',
//         total_amount: '',
//         milk_type: '',
//         shift: '',
//         date: today,
//         print: false,
//     })

//     // CHECK TIME OF DAY
//     function checkTimeOfDay() {
//         const now = new Date()
//         const hour = now.getHours()
//         if (hour < 12) {
//             setShiftValue('morning')
//             setIsShift('morning')
//         } else {
//             setShiftValue('evening')
//             setIsShift('evening')
//         }
//     }

//     // FETCH CUSTOMER DETAILS
//     const fetchCustomerDetailByAccountNumber = async (accountNo) => {
//         try {
//             const res = await fetchCustomerDetailsByAccount(accountNo)
//             if (res.status_code == 200) {
//                 CustomToast.success(res.message)
//                 setForm((prev) => ({
//                     ...prev,
//                     name: res.data.name || '',
//                     careof: res.data.careof || '',
//                     mobile: res.data.mobile || '',
//                 }))
//                 setCustomerWallet(res.data.wallet)
//             } else {
//                 CustomToast.error(res.message)
//                 setForm((prev) => ({
//                     ...prev,
//                     name: '',
//                     careof: '',
//                     mobile: '',
//                 }))
//             }
//         } catch (error) {
//             console.error('Error fetching customer details:', error)
//         }
//     }

//     // AUTO-CALCULATE RATE
//     useEffect(() => {
//         const { fat, snf, base_rate, other_price, quantity } = form
//         const f = parseFloat(fat) || 0
//         const s = parseFloat(snf) || 0
//         const b = parseFloat(base_rate) || 0
//         const o = parseFloat(other_price) || 0
//         const q = parseFloat(quantity) || 0
//         const rate = q * b
//         const total_amount = rate + o

//         setForm((prev) => ({
//             ...prev,
//             rate: rate.toFixed(2),
//             total_amount: total_amount.toFixed(2),
//         }))
//     }, [form.fat, form.snf, form.base_rate, form.other_price, form.quantity])

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target

//         if (name === 'customer_account_number') {
//             setForm(prev => ({
//                 ...prev,
//                 [name]: value,
//                 name: ''
//             }))
//             return
//         }

//         setForm(prev => {
//             let updated = { ...prev, [name]: type === 'checkbox' ? checked : value }
//             if (name === 'clr') {
//                 updated.snf = ''
//             } else if (name === 'snf') {
//                 updated.clr = ''
//             }
//             return updated
//         })
//     }

//     const handleSubmit = async (e) => {
//         e.preventDefault()
//         form.shift = shiftValue
//         form.milk_type = milkType
//         setCustomerWallet(null)

//         try {
//             const res = await submitMilkCollection(form)
//             if (res.status_code == 200) {
//                 if (toggle) {
//                     handlePrint(form)
//                 }
//                 CustomToast.success(res.message)
//                 setForm({
//                     customer_account_number: '',
//                     name: '',
//                     careof: '',
//                     mobile: '',
//                     quantity: '',
//                     clr: '',
//                     fat: '',
//                     snf: '',
//                     base_rate: '',
//                     other_price: '0',
//                     rate: '',
//                     total_amount: '',
//                     milk_type: '',
//                     date: today,
//                 })
//                 fetchMilkCollectionDetails()
//                 setTimeout(() => accRef.current?.focus(), 300)
//             } else {
//                 CustomToast.error(res.message || res.errors)
//             }
//         } catch (error) {
//             CustomToast.error(error)
//         }
//     }

//     const fetchMilkCollectionDetails = async (page = 1) => {
//         try {
//             const res = await getMilkCollectionRecord(page)
//             if (res.status_code == 200) {
//                 setCollections(res.morning)
//                 setMorningCollection(res.morning)
//                 setEveningCollection(res.evening)
//                 setDayTotal({
//                     morning_total_amount: res.morning_total_amount || 0,
//                     morning_total_milk: res.morning_total_milk || 0,
//                     evening_total_amount: res.evening_total_amount || 0,
//                     evening_total_milk: res.evening_total_milk || 0,
//                     total_amount: res.total_amount || 0,
//                     milk_total: res.milk_total || 0,
//                 })
//             } else {
//                 CustomToast.error(res.message)
//             }
//         } catch (error) {
//             console.error('Error fetching data:', error)
//         }
//     }

//     useEffect(() => {
//         checkTimeOfDay()
//         fetchMilkCollectionDetails()
//     }, [])

//     useEffect(() => {
//         fetchMilkCollectionDetails()
//     }, [isEditeModal])

//     const handleRemove = async (id) => {
//         try {
//             const res = await deleteMilkCollection(id)
//             if (res.status_code == 200) {
//                 CustomToast.success(res.message)
//                 fetchMilkCollectionDetails()
//             } else {
//                 CustomToast.error(res.message)
//             }
//         } catch (error) {
//             console.error('Error deleting:', error)
//         }
//     }

//     const handlePrint = (data) => {
//         const shift = data.shift === 'morning' ? 'M' : 'E'
//         const now = new Date()
//         const localTime = now.toLocaleTimeString('en-IN', {
//             hour: '2-digit',
//             minute: '2-digit',
//             hour12: true
//         })

//         const slipData = {
//             account_no: data.customer_account_number,
//             customer: data.name,
//             date: data.date,
//             time: `${localTime}(${shift})`,
//             qty: `${data.quantity} / Ltr`,
//             fat: data.fat,
//             snf: data.snf,
//             rate: `${data.base_rate} / Ltr`,
//             total: data.total_amount
//         }

//         if (window.api) {
//             window.api.printSlip(slipData)
//         }
//     }

//     const resetForm = () => {
//         setForm({
//             customer_account_number: '',
//             name: '',
//             careof: '',
//             mobile: '',
//             quantity: '',
//             clr: '',
//             fat: '',
//             snf: '',
//             base_rate: '',
//             other_price: '0',
//             rate: '',
//             total_amount: '',
//             milk_type: '',
//             date: today,
//         })
//         setTimeout(() => accRef.current?.focus(), 200)
//     }

//     const accRef = useRef(null)
//     const qtyRef = useRef(null)
//     const nameRef = useRef(null)
//     const fatRef = useRef(null)
//     const mobileRef = useRef(null)
//     const clrRef = useRef(null)
//     const careOfRef = useRef(null)
//     const snfRef = useRef(null)
//     const otherRateRef = useRef(null)
//     const submitRef = useRef(null)

//     const handleAccountKeyDown = async (e) => {
//         if (e.key === 'Enter') {
//             e.preventDefault()
//             const accNo = form.customer_account_number.trim()
//             if (accNo) {
//                 await fetchCustomerDetailByAccountNumber(accNo)
//                 qtyRef.current?.focus()
//             }
//         }
//     }

//     const handleQuantityKeyDown = async (e) => {
//         if (e.key === 'Enter') {
//             e.preventDefault()
//             fatRef.current?.focus()
//         }
//     }

//     const handleFatKeyDown = (e) => {
//         if (e.key === 'Enter') {
//             e.preventDefault()
//             snfRef.current?.focus()
//         }
//     }

//     const handleSnfKeyDown = async (e) => {
//         if (e.key === 'Enter') {
//             e.preventDefault()
//             const fat = form.fat?.trim()
//             const clr = form.clr?.trim()
//             const snfRaw = form.snf?.trim()

//             if (!(fat && (clr || snfRaw))) return

//             const snfForApi = snfRaw && !snfRaw.includes('.') ? `${snfRaw}.0` : snfRaw

//             try {
//                 const res = await getMilkRate(fat, clr, snfForApi)
//                 setForm((prev) => ({
//                     ...prev,
//                     fat: res.fat || '',
//                     clr: res.clr || '',
//                     snf: res.snf || prev.snf,
//                     base_rate: res.rate || '',
//                 }))
//                 res.rate
//                     ? CustomToast.success('Rate Found', 'top-center')
//                     : CustomToast.warn('RATE not found', 'top-center')
//             } catch (err) {
//                 console.error('Rate error', err)
//             }
//             otherRateRef.current?.focus()
//         }
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
//             {/* Background Blobs */}
//             <div className="fixed inset-0 overflow-hidden pointer-events-none">
//                 <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
//                 <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
//                 <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
//             </div>

//             <div className="relative z-10 h-screen flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
//                 {/* ========== LEFT: FORM SECTION ========== */}
//                 <div className="w-full lg:w-[420px] bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-400/30 flex flex-col overflow-hidden">
//                     {/* Header */}
//                     <div className="p-6 bg-gradient-to-r from-slate-700/50 to-purple-700/50 border-b border-cyan-400/30 flex-shrink-0">
//                         <h1 className="text-3xl font-black text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text">
//                             🥛 Milk Collection
//                         </h1>
//                         <p className="text-cyan-200 text-sm mt-2 font-semibold">Track daily dairy records</p>
//                     </div>

//                     {/* Form */}
//                     <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 scrollable-table">
//                         {/* Milk Type & Date */}
//                         <div className="space-y-3">
//                             <label className="block text-sm font-bold text-cyan-300 uppercase tracking-wider">🐄 Milk Type</label>
//                             <div className="flex gap-3">
//                                 {['cow', 'buffalo', 'other'].map((type) => (
//                                     <label key={type} className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105"
//                                         style={{
//                                             borderColor: milkType === type ? '#06b6d4' : 'rgba(6, 182, 212, 0.2)',
//                                             backgroundColor: milkType === type ? 'rgba(6, 182, 212, 0.1)' : 'rgba(15, 23, 42, 0.5)'
//                                         }}
//                                     >
//                                         <input
//                                             type="radio"
//                                             name="milkType"
//                                             value={type}
//                                             checked={milkType === type}
//                                             onChange={() => setMilkType(type)}
//                                             className="hidden"
//                                         />
//                                         <span className="text-white font-bold capitalize text-sm">{type}</span>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Date */}
//                         <div>
//                             <label className="block text-sm font-bold text-cyan-300 mb-3 uppercase tracking-wider">📅 Date</label>
//                             <input
//                                 type="date"
//                                 value={form.date}
//                                 name="date"
//                                 onChange={handleChange}
//                                 max={today}
//                                 className="w-full px-4 py-3 rounded-xl border-2 border-cyan-400/30 bg-slate-700/50 text-white font-bold outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
//                             />
//                         </div>

//                         {/* Shift */}
//                         <div>
//                             <label className="block text-sm font-bold text-cyan-300 mb-3 uppercase tracking-wider">⏰ Shift</label>
//                             <div className="flex gap-3">
//                                 {['morning', 'evening'].map((shift) => (
//                                     <label key={shift} className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105"
//                                         style={{
//                                             borderColor: shiftValue === shift ? '#06b6d4' : 'rgba(6, 182, 212, 0.2)',
//                                             backgroundColor: shiftValue === shift ? 'rgba(6, 182, 212, 0.1)' : 'rgba(15, 23, 42, 0.5)'
//                                         }}
//                                     >
//                                         <input
//                                             type="radio"
//                                             name="shift"
//                                             value={shift}
//                                             checked={shiftValue === shift}
//                                             onChange={() => setShiftValue(shift)}
//                                             className="hidden"
//                                         />
//                                         <span className="text-white font-bold capitalize text-sm">{shift === 'morning' ? '🌅 Morning' : '🌆 Evening'}</span>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Customer Details Grid */}
//                         <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-2 border-cyan-400/30 rounded-2xl p-4 space-y-3">
//                             <p className="text-cyan-300 font-bold text-xs uppercase tracking-wider">👤 Customer Info</p>

//                             <input
//                                 type="text"
//                                 name="customer_account_number"
//                                 value={form.customer_account_number}
//                                 onChange={handleChange}
//                                 ref={accRef}
//                                 onKeyDown={handleAccountKeyDown}
//                                 placeholder="Account Number *"
//                                 className="w-full px-4 py-3 rounded-xl border-2 border-cyan-400/30 bg-slate-700/50 text-white font-bold outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all placeholder-slate-400"
//                                 required
//                             />

//                             <input
//                                 type="text"
//                                 name="name"
//                                 value={form.name}
//                                 onChange={handleChange}
//                                 disabled
//                                 ref={nameRef}
//                                 className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-700/30 text-slate-400 font-bold text-sm"
//                                 placeholder="Auto-filled"
//                             />

//                             <input
//                                 type="text"
//                                 name="careof"
//                                 value={form.careof}
//                                 onChange={handleChange}
//                                 disabled
//                                 ref={careOfRef}
//                                 className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-700/30 text-slate-400 font-bold text-sm"
//                                 placeholder="Care of"
//                             />

//                             <input
//                                 type="text"
//                                 name="mobile"
//                                 value={form.mobile}
//                                 onChange={handleChange}
//                                 disabled
//                                 ref={mobileRef}
//                                 className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-700/30 text-slate-400 font-bold text-sm"
//                                 placeholder="Mobile"
//                             />
//                         </div>

//                         {/* Milk Details */}
//                         <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-2 border-green-400/30 rounded-2xl p-4 space-y-3">
//                             <p className="text-green-300 font-bold text-xs uppercase tracking-wider">🥛 Milk Details</p>

//                             <input
//                                 type="number"
//                                 name="quantity"
//                                 value={form.quantity}
//                                 onChange={handleChange}
//                                 ref={qtyRef}
//                                 onKeyDown={handleQuantityKeyDown}
//                                 placeholder="Quantity (Ltr) *"
//                                 className="w-full px-4 py-3 rounded-xl border-2 border-green-400/30 bg-slate-700/50 text-white font-bold outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all"
//                                 required
//                             />

//                             <div className="grid grid-cols-2 gap-3">
//                                 <input
//                                     type="number"
//                                     name="fat"
//                                     value={form.fat}
//                                     onChange={handleChange}
//                                     ref={fatRef}
//                                     onKeyDown={handleFatKeyDown}
//                                     placeholder="FAT (%)*"
//                                     className="w-full px-4 py-3 rounded-xl border-2 border-green-400/30 bg-slate-700/50 text-white font-bold outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all"
//                                     required
//                                 />

//                                 <input
//                                     type="number"
//                                     name="clr"
//                                     placeholder="CLR"
//                                     value={form.clr}
//                                     onChange={handleChange}
//                                     ref={clrRef}
//                                     className="w-full px-4 py-3 rounded-xl border-2 border-green-400/30 bg-slate-700/50 text-white font-bold outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all"
//                                 />
//                             </div>

//                             <input
//                                 type="text"
//                                 value={form.snf}
//                                 required
//                                 className="w-full px-4 py-3 rounded-xl border-2 border-green-400/30 bg-slate-700/50 text-white font-bold outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all"
//                                 name="snf"
//                                 onChange={handleChange}
//                                 ref={snfRef}
//                                 onKeyDown={handleSnfKeyDown}
//                                 placeholder="SNF (%)*"
//                             />
//                         </div>

//                         {/* Price Details */}
//                         <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-400/30 rounded-2xl p-4 space-y-3">
//                             <p className="text-purple-300 font-bold text-xs uppercase tracking-wider">💰 Amount</p>

//                             <input
//                                 type="number"
//                                 name="base_rate"
//                                 value={form.base_rate}
//                                 onChange={handleChange}
//                                 readOnly
//                                 className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-700/30 text-slate-400 font-bold text-sm"
//                                 placeholder="Auto-calculated"
//                             />

//                             <input
//                                 type="number"
//                                 name="other_price"
//                                 value={form.other_price}
//                                 onChange={handleChange}
//                                 ref={otherRateRef}
//                                 className="w-full px-4 py-3 rounded-xl border-2 border-purple-400/30 bg-slate-700/50 text-white font-bold outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
//                                 placeholder="Other Price"
//                             />

//                             <div className="grid grid-cols-2 gap-3">
//                                 <input
//                                     type="number"
//                                     name="rate"
//                                     value={form.rate}
//                                     readOnly
//                                     className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-700/30 text-slate-400 font-bold text-sm"
//                                     placeholder="Auto-rate"
//                                 />

//                                 <input
//                                     type="number"
//                                     name="total_amount"
//                                     value={form.total_amount}
//                                     readOnly
//                                     className="w-full px-4 py-3 rounded-xl border-2 border-yellow-400/30 bg-yellow-500/20 text-yellow-300 font-bold text-sm"
//                                     placeholder="Total"
//                                 />
//                             </div>
//                         </div>

//                         {/* Customer Wallet */}
//                         {customerWallet !== null && (
//                             <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-5 border border-indigo-400/50 shadow-lg transform hover:scale-105 transition-all">
//                                 <p className="text-indigo-200 font-bold text-sm uppercase mb-2">💳 Wallet Balance</p>
//                                 <p className="text-4xl font-black text-white">₹{customerWallet}</p>
//                             </div>
//                         )}

//                         {/* Buttons */}
//                         <div className="flex gap-3 pt-4">
//                             <button
//                                 type="button"
//                                 onClick={resetForm}
//                                 className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
//                             >
//                                 🔄 Reset
//                             </button>

//                             <button
//                                 type="submit"
//                                 ref={submitRef}
//                                 className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
//                             >
//                                 <FaPlus /> Submit
//                             </button>
//                         </div>
//                     </form>
//                 </div>

//                 {/* ========== RIGHT: STATS & TABLE ========== */}
//                 <div className="flex-1 flex flex-col gap-4 overflow-hidden">
//                     {/* Daily Summary Cards */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
//                         <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl shadow-2xl border border-blue-400/30 transform hover:scale-105 transition-all">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-blue-200 font-bold text-xs uppercase tracking-wider">🌅 Morning</p>
//                                     <p className="text-4xl font-black text-white mt-3">{dayTotal?.morning_total_milk?.toFixed(2)}L</p>
//                                     <p className="text-blue-200 mt-2 font-bold">₹{dayTotal?.morning_total_amount?.toFixed(2)}</p>
//                                 </div>
//                                 <div className="text-6xl opacity-30">🐄</div>
//                             </div>
//                         </div>

//                         <div className="p-6 bg-gradient-to-br from-orange-600 to-amber-800 rounded-3xl shadow-2xl border border-orange-400/30 transform hover:scale-105 transition-all">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-orange-200 font-bold text-xs uppercase tracking-wider">🌆 Evening</p>
//                                     <p className="text-4xl font-black text-white mt-3">{dayTotal?.evening_total_milk?.toFixed(2)}L</p>
//                                     <p className="text-orange-200 mt-2 font-bold">₹{dayTotal?.evening_total_amount?.toFixed(2)}</p>
//                                 </div>
//                                 <div className="text-6xl opacity-30">🐃</div>
//                             </div>
//                         </div>

//                         <div className="p-6 bg-gradient-to-br from-green-600 to-emerald-800 rounded-3xl shadow-2xl border border-green-400/30 transform hover:scale-105 transition-all">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-green-200 font-bold text-xs uppercase tracking-wider">📊 Total</p>
//                                     <p className="text-4xl font-black text-white mt-3">{dayTotal?.milk_total?.toFixed(2)}L</p>
//                                     <p className="text-green-200 mt-2 font-bold">₹{dayTotal?.total_amount?.toFixed(2)}</p>
//                                 </div>
//                                 <div className="text-6xl opacity-30">💰</div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Records Table */}
//                     <div className="flex-1 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-400/30 overflow-hidden flex flex-col">
//                         {/* Table Header */}
//                         <div className="p-6 bg-gradient-to-r from-slate-700/50 to-purple-700/50 border-b border-cyan-400/30 flex items-center justify-between flex-shrink-0">
//                             <h2 className="text-3xl font-black text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text">
//                                 📋 Collection Records
//                             </h2>
//                             <button
//                                 onClick={() => fetchMilkCollectionDetails()}
//                                 className={`px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 ${refreshing ? 'animate-pulse' : ''}`}
//                             >
//                                 <FaSync className={refreshing ? 'animate-spin' : ''} /> Refresh
//                             </button>
//                         </div>

//                         {/* Table */}
//                         <div className="flex-1 overflow-x-auto scrollable-table">
//                             <table className="w-full text-sm">
//                                 <thead className="bg-gradient-to-r from-slate-700 to-blue-700 border-b-2 border-cyan-400/30 sticky top-0">
//                                     <tr>
//                                         {['SR', 'AC#', 'Name', 'Date', 'Shift', 'Qty', 'FAT', 'SNF', 'Rate', 'Other', 'Total', 'Wallet', 'Actions'].map(header => (
//                                             <th key={header} className="px-4 py-4 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider whitespace-nowrap">
//                                                 {header}
//                                             </th>
//                                         ))}
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-cyan-400/20">
//                                     {morningCollection.length === 0 && eveningCollection.length === 0 ? (
//                                         <tr>
//                                             <td colSpan="13" className="px-6 py-16 text-center">
//                                                 <div className="flex flex-col items-center">
//                                                     <div className="text-6xl mb-4">🐄</div>
//                                                     <p className="text-2xl font-bold text-white mb-2">No records yet</p>
//                                                     <p className="text-slate-400 font-semibold">Start adding milk collection entries</p>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ) : (
//                                         <>
//                                             {isShift === 'morning' && morningCollection.length > 0 && (
//                                                 <>
//                                                     <tr className="bg-orange-500/20 border-b-2 border-orange-400/30">
//                                                         <td colSpan="13" className="px-4 py-3 text-center font-bold text-orange-300 text-sm uppercase tracking-wider">
//                                                             🌅 Morning Collection ({morningCollection.length})
//                                                         </td>
//                                                     </tr>
//                                                     {morningCollection.map((item, i) => (
//                                                         <tr key={`morning-${i}`} className={`${i % 2 === 0 ? 'bg-slate-800/50' : 'bg-slate-700/50'} hover:bg-cyan-500/10 transition-colors`}>
//                                                             <td className="px-4 py-4 text-sm font-bold text-slate-300">{i + 1}</td>
//                                                             <td className="px-4 py-4 text-sm font-bold text-cyan-400">{item.customer_account_number}</td>
//                                                             <td className="px-4 py-4 text-sm font-semibold text-white truncate">{item.name}</td>
//                                                             <td className="px-4 py-4 text-sm text-slate-300">{item.date}</td>
//                                                             <td className="px-4 py-4">
//                                                                 <span className="px-3 py-1 text-xs font-bold bg-orange-500/30 text-orange-300 rounded-full border border-orange-500/50">
//                                                                     {item.shift}
//                                                                 </span>
//                                                             </td>
//                                                             <td className="px-4 py-4 text-sm font-bold text-green-400">{item.quantity}L</td>
//                                                             <td className="px-4 py-4 text-sm text-slate-300">{item.fat}</td>
//                                                             <td className="px-4 py-4 text-sm text-slate-300">{item.snf}</td>
//                                                             <td className="px-4 py-4 text-sm font-bold text-blue-400">₹{item.base_rate}</td>
//                                                             <td className="px-4 py-4 text-sm text-slate-300">₹{item.other_price}</td>
//                                                             <td className="px-4 py-4 text-sm font-bold text-yellow-400">₹{item.total_amount}</td>
//                                                             <td className="px-4 py-4 text-sm font-bold text-purple-400">₹{item?.customer?.wallet || 0}</td>
//                                                             <td className="px-4 py-4">
//                                                                 <div className="flex gap-2">
//                                                                     <button
//                                                                         className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all transform hover:scale-110"
//                                                                         onClick={() => handlePrint(item)}
//                                                                         title="Print"
//                                                                     >
//                                                                         <BsFillPrinterFill size={14} />
//                                                                     </button>
//                                                                     <button
//                                                                         className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all transform hover:scale-110"
//                                                                         onClick={() => { setSelectedCustomer(item); setIsModalOpen(true); }}
//                                                                         title="View"
//                                                                     >
//                                                                         <FaEye size={14} />
//                                                                     </button>
//                                                                     <button
//                                                                         className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all transform hover:scale-110"
//                                                                         onClick={() => { setSelectedCustomer(item); setIsEditeModal(true); }}
//                                                                         title="Edit"
//                                                                     >
//                                                                         <FaPen size={14} />
//                                                                     </button>
//                                                                     <button
//                                                                         className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all transform hover:scale-110"
//                                                                         onClick={() => { setDeleteId(item.id); setShowConfirmModal(true); }}
//                                                                         title="Delete"
//                                                                     >
//                                                                         <FaTrashCan size={14} />
//                                                                     </button>
//                                                                 </div>
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </>
//                                             )}

//                                             {isShift === 'evening' && eveningCollection.length > 0 && (
//                                                 <>
//                                                     <tr className="bg-purple-500/20 border-b-2 border-purple-400/30">
//                                                         <td colSpan="13" className="px-4 py-3 text-center font-bold text-purple-300 text-sm uppercase tracking-wider">
//                                                             🌆 Evening Collection ({eveningCollection.length})
//                                                         </td>
//                                                     </tr>
//                                                     {eveningCollection.map((item, i) => (
//                                                         <tr key={`evening-${i}`} className={`${i % 2 === 0 ? 'bg-slate-800/50' : 'bg-slate-700/50'} hover:bg-cyan-500/10 transition-colors`}>
//                                                             <td className="px-4 py-4 text-sm font-bold text-slate-300">{i + 1}</td>
//                                                             <td className="px-4 py-4 text-sm font-bold text-cyan-400">{item.customer_account_number}</td>
//                                                             <td className="px-4 py-4 text-sm font-semibold text-white truncate">{item.name}</td>
//                                                             <td className="px-4 py-4 text-sm text-slate-300">{item.date}</td>
//                                                             <td className="px-4 py-4">
//                                                                 <span className="px-3 py-1 text-xs font-bold bg-purple-500/30 text-purple-300 rounded-full border border-purple-500/50">
//                                                                     {item.shift}
//                                                                 </span>
//                                                             </td>
//                                                             <td className="px-4 py-4 text-sm font-bold text-green-400">{item.quantity}L</td>
//                                                             <td className="px-4 py-4 text-sm text-slate-300">{item.fat}</td>
//                                                             <td className="px-4 py-4 text-sm text-slate-300">{item.snf}</td>
//                                                             <td className="px-4 py-4 text-sm font-bold text-blue-400">₹{item.base_rate}</td>
//                                                             <td className="px-4 py-4 text-sm text-slate-300">₹{item.other_price}</td>
//                                                             <td className="px-4 py-4 text-sm font-bold text-yellow-400">₹{item.total_amount}</td>
//                                                             <td className="px-4 py-4 text-sm font-bold text-purple-400">₹{item?.customer?.wallet || 0}</td>
//                                                             <td className="px-4 py-4">
//                                                                 <div className="flex gap-2">
//                                                                     <button
//                                                                         className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all transform hover:scale-110"
//                                                                         onClick={() => handlePrint(item)}
//                                                                         title="Print"
//                                                                     >
//                                                                         <BsFillPrinterFill size={14} />
//                                                                     </button>
//                                                                     <button
//                                                                         className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all transform hover:scale-110"
//                                                                         onClick={() => { setSelectedCustomer(item); setIsModalOpen(true); }}
//                                                                         title="View"
//                                                                     >
//                                                                         <FaEye size={14} />
//                                                                     </button>
//                                                                     <button
//                                                                         className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all transform hover:scale-110"
//                                                                         onClick={() => { setSelectedCustomer(item); setIsEditeModal(true); }}
//                                                                         title="Edit"
//                                                                     >
//                                                                         <FaPen size={14} />
//                                                                     </button>
//                                                                     <button
//                                                                         className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all transform hover:scale-110"
//                                                                         onClick={() => { setDeleteId(item.id); setShowConfirmModal(true); }}
//                                                                         title="Delete"
//                                                                     >
//                                                                         <FaTrashCan size={14} />
//                                                                     </button>
//                                                                 </div>
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </>
//                                             )}
//                                         </>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* VIEW MODAL */}
//             {isModalOpen && selectedCustomer && (
//                 <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
//                     <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl p-8 border border-cyan-400/30 max-h-[90vh] overflow-y-auto">
//                         <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-6 border-b border-cyan-400/30 pb-4">
//                             🥛 Milk Collection Details
//                         </h2>

//                         <div className="grid grid-cols-2 gap-6">
//                             {[
//                                 ['Name', selectedCustomer.name, '👤'],
//                                 ['Account #', selectedCustomer.customer_account_number, '🔢'],
//                                 ['Mobile', selectedCustomer.mobile, '📱'],
//                                 ['Care Of', selectedCustomer.careof, '👥'],
//                                 ['Milk Type', selectedCustomer.milk_type, '🐄'],
//                                 ['Quantity', `${selectedCustomer.quantity}L`, '📏'],
//                                 ['FAT %', selectedCustomer.fat, '🧈'],
//                                 ['SNF %', selectedCustomer.snf, '🥛'],
//                                 ['CLR', selectedCustomer.clr || 'N/A', '📊'],
//                                 ['Base Rate', `₹${selectedCustomer.base_rate}`, '💰'],
//                                 ['Other Price', `₹${selectedCustomer.other_price}`, '💵'],
//                                 ['Total Amount', `₹${selectedCustomer.total_amount}`, '✅'],
//                             ].map(([label, value, emoji], index) => (
//                                 <div key={label} className="bg-gradient-to-br from-slate-700/50 to-purple-700/50 border border-cyan-400/20 rounded-xl p-4">
//                                     <p className="text-cyan-300 font-bold text-sm uppercase tracking-wider mb-1">{emoji} {label}</p>
//                                     <p className="text-white font-black text-lg">{value}</p>
//                                 </div>
//                             ))}
//                         </div>

//                         <div className="mt-8 flex gap-4">
//                             <button
//                                 onClick={() => setIsModalOpen(false)}
//                                 className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-bold rounded-xl transition-all transform hover:scale-105"
//                             >
//                                 Close
//                             </button>
//                             <button
//                                 onClick={() => handlePrint(selectedCustomer)}
//                                 className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
//                             >
//                                 <BsFillPrinterFill /> Print
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* DELETE CONFIRMATION MODAL */}
//             {showConfirmModal && (
//                 <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
//                     <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-8 border border-red-400/30">
//                         <div className="text-center mb-6">
//                             <div className="text-6xl mb-4">⚠️</div>
//                             <h2 className="text-2xl font-black text-white mb-2">Confirm Delete</h2>
//                             <p className="text-slate-400 font-semibold">This action cannot be undone</p>
//                         </div>

//                         <div className="flex gap-4">
//                             <button
//                                 onClick={() => setShowConfirmModal(false)}
//                                 className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-bold rounded-xl transition-all transform hover:scale-105"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={() => {
//                                     handleRemove(deleteId)
//                                     setShowConfirmModal(false)
//                                     setDeleteId(null)
//                                 }}
//                                 className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all transform hover:scale-105"
//                             >
//                                 Delete
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Edit Modal Component */}
//             <EditMilkCollectionModal
//                 isOpen={isEditeModal}
//                 onClose={() => setIsEditeModal(false)}
//                 milkData={selectedCustomer}
//             />

//             <style>{`
//                 @keyframes blob {
//                     0%, 100% { transform: translate(0, 0) scale(1); }
//                     33% { transform: translate(30px, -50px) scale(1.1); }
//                     66% { transform: translate(-20px, 20px) scale(0.9); }
//                 }
//                 .animate-blob { animation: blob 7s infinite; }
//                 .animation-delay-2000 { animation-delay: 2s; }
//                 .animation-delay-4000 { animation-delay: 4s; }
//                 .scrollable-table::-webkit-scrollbar { width: 8px; height: 8px; }
//                 .scrollable-table::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
//                 .scrollable-table::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.5); border-radius: 4px; }
//                 .scrollable-table::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.8); }
//             `}</style>
//         </div>
//     )
// }

// export default DairyMilkCollectionPage



// import React, { useState, useEffect, useRef } from 'react'
// import useHomeStore from '../../zustand/useHomeStore'
// import { toast } from 'react-toastify'
// import { FaEye, FaPen, FaSync, FaPlus, FaClock } from 'react-icons/fa'
// import { FaTrashCan } from 'react-icons/fa6'
// import CustomToast from '../../helper/costomeToast'
// import { IoMdCloseCircle } from 'react-icons/io'
// import { useNavigate } from 'react-router-dom'
// import EditMilkCollectionModal from './EditMilkCollectionPage'
// import { BsFillPrinterFill } from 'react-icons/bs'
// import '../../assets/scrollbar.css'

// const DairyMilkCollectionPage = () => {
//     const nav = useNavigate()
//     const today = new Date().toISOString().split('T')[0]

//     const fetchCustomerDetailsByAccount = useHomeStore(state => state.fetchCustomerDetailsByAccount)
//     const submitMilkCollection = useHomeStore(state => state.submitMilkCollection)
//     const getMilkCollectionRecord = useHomeStore(state => state.getMilkCollectionRecord)
//     const deleteMilkCollection = useHomeStore(state => state.deleteMilkCollection)
//     const getMilkRate = useHomeStore(state => state.getMilkRate)

//     const [isModalOpen, setIsModalOpen] = useState(false)
//     const [selectedCustomer, setSelectedCustomer] = useState(null)
//     const [deleteId, setDeleteId] = useState(null)
//     const [showConfirmModal, setShowConfirmModal] = useState(false)
//     const [milkType, setMilkType] = useState('cow')
//     const [shiftValue, setShiftValue] = useState('morning')
//     const [isShift, setIsShift] = useState('morning')
//     const [isEditeModal, setIsEditeModal] = useState(false)
//     const [collections, setCollections] = useState([])
//     const [toggle, setToggle] = useState(true)
//     const [dayTotal, setDayTotal] = useState({
//         morning_total_amount: 0,
//         morning_total_milk: 0,
//         evening_total_amount: 0,
//         evening_total_milk: 0,
//         total_amount: 0,
//         milk_total: 0,
//     })
//     const [morningCollection, setMorningCollection] = useState([])
//     const [eveningCollection, setEveningCollection] = useState([])
//     const [customerWallet, setCustomerWallet] = useState(null)
//     const [currentTime, setCurrentTime] = useState(new Date())

//     const [form, setForm] = useState({
//         customer_account_number: '',
//         name: '',
//         careof: '',
//         mobile: '',
//         quantity: '',
//         clr: '',
//         fat: '',
//         snf: '',
//         base_rate: '',
//         other_price: '0',
//         rate: '',
//         total_amount: '',
//         milk_type: '',
//         shift: '',
//         date: today,
//     })

//     // Update time every second
//     useEffect(() => {
//         const timer = setInterval(() => setCurrentTime(new Date()), 1000)
//         return () => clearInterval(timer)
//     }, [])

//     function checkTimeOfDay() {
//         const hour = new Date().getHours()
//         setShiftValue(hour < 12 ? 'morning' : 'evening')
//         setIsShift(hour < 12 ? 'morning' : 'evening')
//     }

//     const fetchCustomerDetailByAccountNumber = async (accountNo) => {
//         try {
//             const res = await fetchCustomerDetailsByAccount(accountNo)
//             if (res.status_code == 200) {
//                 CustomToast.success(res.message)
//                 setForm((prev) => ({
//                     ...prev,
//                     name: res.data.name || '',
//                     careof: res.data.careof || '',
//                     mobile: res.data.mobile || '',
//                 }))
//                 setCustomerWallet(res.data.wallet)
//             } else {
//                 CustomToast.error(res.message)
//             }
//         } catch (error) {
//             console.error('Error:', error)
//         }
//     }

//     useEffect(() => {
//         const { fat, snf, base_rate, other_price, quantity } = form
//         const q = parseFloat(quantity) || 0
//         const b = parseFloat(base_rate) || 0
//         const o = parseFloat(other_price) || 0
//         const rate = q * b
//         const total = rate + o

//         setForm((prev) => ({
//             ...prev,
//             rate: rate.toFixed(2),
//             total_amount: total.toFixed(2),
//         }))
//     }, [form.fat, form.snf, form.base_rate, form.other_price, form.quantity])

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target
//         if (name === 'customer_account_number') {
//             setForm(prev => ({ ...prev, [name]: value, name: '' }))
//             return
//         }
//         setForm(prev => {
//             let updated = { ...prev, [name]: type === 'checkbox' ? checked : value }
//             if (name === 'clr') updated.snf = ''
//             else if (name === 'snf') updated.clr = ''
//             return updated
//         })
//     }

//     const handleSubmit = async (e) => {
//         e.preventDefault()
//         form.shift = shiftValue
//         form.milk_type = milkType

//         try {
//             const res = await submitMilkCollection(form)
//             if (res.status_code == 200) {
//                 if (toggle) handlePrint(form)
//                 CustomToast.success(res.message)
//                 resetForm()
//                 fetchMilkCollectionDetails()
//                 accRef.current?.focus()
//             } else {
//                 CustomToast.error(res.message)
//             }
//         } catch (error) {
//             CustomToast.error(error)
//         }
//     }

//     const fetchMilkCollectionDetails = async () => {
//         try {
//             const res = await getMilkCollectionRecord(1)
//             if (res.status_code == 200) {
//                 setMorningCollection(res.morning)
//                 setEveningCollection(res.evening)
//                 setDayTotal({
//                     morning_total_amount: res.morning_total_amount || 0,
//                     morning_total_milk: res.morning_total_milk || 0,
//                     evening_total_amount: res.evening_total_amount || 0,
//                     evening_total_milk: res.evening_total_milk || 0,
//                     total_amount: res.total_amount || 0,
//                     milk_total: res.milk_total || 0,
//                 })
//             }
//         } catch (error) {
//             console.error('Error:', error)
//         }
//     }

//     useEffect(() => {
//         checkTimeOfDay()
//         fetchMilkCollectionDetails()
//     }, [])

//     useEffect(() => {
//         fetchMilkCollectionDetails()
//     }, [isEditeModal])

//     const handleRemove = async (id) => {
//         try {
//             const res = await deleteMilkCollection(id)
//             if (res.status_code == 200) {
//                 CustomToast.success(res.message)
//                 fetchMilkCollectionDetails()
//             }
//         } catch (error) {
//             console.error('Error:', error)
//         }
//     }

//     const handlePrint = (data) => {
//         const slip = {
//             account_no: data.customer_account_number,
//             customer: data.name,
//             date: data.date,
//             qty: `${data.quantity}L`,
//             fat: data.fat,
//             snf: data.snf,
//             rate: `₹${data.base_rate}`,
//             total: `₹${data.total_amount}`
//         }
//         if (window.api) window.api.printSlip(slip)
//     }

//     const resetForm = () => {
//         setForm({
//             customer_account_number: '',
//             name: '',
//             careof: '',
//             mobile: '',
//             quantity: '',
//             clr: '',
//             fat: '',
//             snf: '',
//             base_rate: '',
//             other_price: '0',
//             rate: '',
//             total_amount: '',
//             milk_type: '',
//             date: today,
//         })
//         setCustomerWallet(null)
//         accRef.current?.focus()
//     }

//     const accRef = useRef(null)
//     const qtyRef = useRef(null)
//     const fatRef = useRef(null)
//     const snfRef = useRef(null)
//     const otherRateRef = useRef(null)

//     const handleAccountKeyDown = async (e) => {
//         if (e.key === 'Enter') {
//             e.preventDefault()
//             const accNo = form.customer_account_number.trim()
//             if (accNo) {
//                 await fetchCustomerDetailByAccountNumber(accNo)
//                 qtyRef.current?.focus()
//             }
//         }
//     }

//     const handleQuantityKeyDown = (e) => {
//         if (e.key === 'Enter') {
//             e.preventDefault()
//             fatRef.current?.focus()
//         }
//     }

//     const handleFatKeyDown = (e) => {
//         if (e.key === 'Enter') {
//             e.preventDefault()
//             snfRef.current?.focus()
//         }
//     }

//     const handleSnfKeyDown = async (e) => {
//         if (e.key === 'Enter') {
//             e.preventDefault()
//             const fat = form.fat?.trim()
//             const clr = form.clr?.trim()
//             const snf = form.snf?.trim()

//             if (fat && (clr || snf)) {
//                 try {
//                     const res = await getMilkRate(fat, clr, snf)
//                     if (res.rate) {
//                         setForm((prev) => ({
//                             ...prev,
//                             fat: res.fat || '',
//                             clr: res.clr || '',
//                             snf: res.snf || '',
//                             base_rate: res.rate || '',
//                         }))
//                         CustomToast.success('Rate found')
//                     } else {
//                         CustomToast.warn('Rate not found')
//                     }
//                 } catch (err) {
//                     console.error('Error:', err)
//                 }
//             }
//             otherRateRef.current?.focus()
//         }
//     }

//     const StatCard = ({ title, value, subvalue, icon, gradient }) => (
//         <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-lg border border-white/10 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}>
//             <div className="flex items-start justify-between">
//                 <div className="flex-1">
//                     <p className="text-white/70 text-sm font-medium tracking-wide">{title}</p>
//                     <p className="text-4xl font-bold text-white mt-2">{value}</p>
//                     {subvalue && <p className="text-white/60 text-sm mt-1">{subvalue}</p>}
//                 </div>
//                 <div className="text-4xl opacity-20">{icon}</div>
//             </div>
//         </div>
//     )

//     const FormInput = ({ label, name, type = 'text', placeholder, value, onChange, onKeyDown, disabled = false, ref }) => (
//         <div className="space-y-2">
//             <label className="text-sm font-semibold text-slate-600">{label}</label>
//             <input
//                 ref={ref}
//                 type={type}
//                 name={name}
//                 value={value}
//                 onChange={onChange}
//                 onKeyDown={onKeyDown}
//                 placeholder={placeholder}
//                 disabled={disabled}
//                 className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 text-sm font-medium
//                     ${disabled 
//                         ? 'border-slate-200 bg-slate-100 text-slate-400' 
//                         : 'border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
//                     }`}
//             />
//         </div>
//     )

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//             {/* Soft Floating Background */}
//             <div className="fixed inset-0 pointer-events-none overflow-hidden">
//                 <div className="absolute top-20 right-20 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
//                 <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
//             </div>

//             <div className="relative z-10 min-h-screen p-6 lg:p-8">
//                 {/* Top Bar */}
//                 <div className="mb-8 flex items-center justify-between">
//                     <div>
//                         <h1 className="text-4xl font-bold text-slate-800">Dairy Collection</h1>
//                         <p className="text-slate-500 mt-1">Track your daily milk records</p>
//                     </div>
//                     <div className="text-center bg-white rounded-2xl px-8 py-4 shadow-lg border border-slate-100">
//                         <div className="flex items-center gap-2 text-slate-600 mb-2">
//                             <FaClock size={16} />
//                             <span className="text-sm font-medium">Live Time</span>
//                         </div>
//                         <p className="text-3xl font-bold text-slate-800">
//                             {currentTime.toLocaleTimeString('en-IN', { 
//                                 hour: '2-digit', 
//                                 minute: '2-digit',
//                                 hour12: true
//                             })}
//                         </p>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                     {/* LEFT: FORM */}
//                     <div className="lg:col-span-1">
//                         <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sticky top-8">
//                             <div className="mb-8">
//                                 <h2 className="text-2xl font-bold text-slate-800">New Entry</h2>
//                                 <p className="text-slate-500 text-sm mt-1">Add milk collection record</p>
//                                 <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-3"></div>
//                             </div>

//                             <form onSubmit={handleSubmit} className="space-y-6">
//                                 {/* Milk Type */}
//                                 <div className="space-y-3">
//                                     <label className="text-sm font-semibold text-slate-600">Milk Type</label>
//                                     <div className="grid grid-cols-3 gap-3">
//                                         {['cow', 'buffalo', 'other'].map((type) => (
//                                             <button
//                                                 key={type}
//                                                 type="button"
//                                                 onClick={() => setMilkType(type)}
//                                                 className={`py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
//                                                     milkType === type
//                                                         ? 'bg-blue-500 text-white shadow-lg'
//                                                         : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                                                 }`}
//                                             >
//                                                 {type.charAt(0).toUpperCase() + type.slice(1)}
//                                             </button>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 {/* Shift */}
//                                 <div className="space-y-3">
//                                     <label className="text-sm font-semibold text-slate-600">Shift</label>
//                                     <div className="grid grid-cols-2 gap-3">
//                                         {['morning', 'evening'].map((shift) => (
//                                             <button
//                                                 key={shift}
//                                                 type="button"
//                                                 onClick={() => setShiftValue(shift)}
//                                                 className={`py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
//                                                     shiftValue === shift
//                                                         ? 'bg-amber-500 text-white shadow-lg'
//                                                         : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                                                 }`}
//                                             >
//                                                 {shift === 'morning' ? '🌅 Morning' : '🌆 Evening'}
//                                             </button>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 {/* Date */}
//                                 <FormInput
//                                     label="Date"
//                                     name="date"
//                                     type="date"
//                                     value={form.date}
//                                     onChange={handleChange}
//                                 />

//                                 {/* Customer Section */}
//                                 <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 space-y-4 border border-blue-100">
//                                     <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">Customer</p>
//                                     <FormInput
//                                         ref={accRef}
//                                         label="Account Number"
//                                         name="customer_account_number"
//                                         placeholder="Enter account #"
//                                         value={form.customer_account_number}
//                                         onChange={handleChange}
//                                         onKeyDown={handleAccountKeyDown}
//                                     />
//                                     <FormInput
//                                         label="Name"
//                                         name="name"
//                                         value={form.name}
//                                         disabled
//                                         onChange={handleChange}
//                                     />
//                                     <FormInput
//                                         label="Phone"
//                                         name="mobile"
//                                         value={form.mobile}
//                                         disabled
//                                         onChange={handleChange}
//                                     />
//                                 </div>

//                                 {/* Milk Collection */}
//                                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 space-y-4 border border-green-100">
//                                     <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">Milk Details</p>
//                                     <FormInput
//                                         ref={qtyRef}
//                                         label="Quantity (Ltr)"
//                                         name="quantity"
//                                         type="number"
//                                         placeholder="0.00"
//                                         value={form.quantity}
//                                         onChange={handleChange}
//                                         onKeyDown={handleQuantityKeyDown}
//                                     />
//                                     <div className="grid grid-cols-2 gap-3">
//                                         <FormInput
//                                             ref={fatRef}
//                                             label="FAT %"
//                                             name="fat"
//                                             type="number"
//                                             placeholder="0.0"
//                                             value={form.fat}
//                                             onChange={handleChange}
//                                             onKeyDown={handleFatKeyDown}
//                                         />
//                                         <FormInput
//                                             ref={snfRef}
//                                             label="SNF %"
//                                             name="snf"
//                                             type="number"
//                                             placeholder="0.0"
//                                             value={form.snf}
//                                             onChange={handleChange}
//                                             onKeyDown={handleSnfKeyDown}
//                                         />
//                                     </div>
//                                 </div>

//                                 {/* Amount Section */}
//                                 <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 space-y-4 border border-purple-100">
//                                     <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">Amount</p>
//                                     <FormInput
//                                         label="Base Rate (₹)"
//                                         name="base_rate"
//                                         type="number"
//                                         value={form.base_rate}
//                                         disabled
//                                     />
//                                     <FormInput
//                                         ref={otherRateRef}
//                                         label="Other Price (₹)"
//                                         name="other_price"
//                                         type="number"
//                                         placeholder="0.00"
//                                         value={form.other_price}
//                                         onChange={handleChange}
//                                     />
//                                     <div className="grid grid-cols-2 gap-3">
//                                         <FormInput
//                                             label="Total Rate"
//                                             name="rate"
//                                             value={form.rate}
//                                             disabled
//                                         />
//                                         <FormInput
//                                             label="Final Total"
//                                             name="total_amount"
//                                             value={form.total_amount}
//                                             disabled
//                                         />
//                                     </div>
//                                 </div>

//                                 {/* Wallet Balance */}
//                                 {customerWallet !== null && (
//                                     <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl p-5 border-2 border-cyan-300">
//                                         <p className="text-sm font-bold text-slate-700 mb-2">Wallet Balance</p>
//                                         <p className="text-3xl font-black text-blue-600">₹{customerWallet}</p>
//                                     </div>
//                                 )}

//                                 {/* Buttons */}
//                                 <div className="flex gap-3 pt-6 border-t border-slate-200">
//                                     <button
//                                         type="button"
//                                         onClick={resetForm}
//                                         className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
//                                     >
//                                         Reset
//                                     </button>
//                                     <button
//                                         type="submit"
//                                         className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
//                                     >
//                                         <FaPlus size={16} /> Submit
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>

//                     {/* RIGHT: RECORDS */}
//                     <div className="lg:col-span-2 space-y-6">
//                         {/* Summary Stats */}
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                             <StatCard
//                                 title="Morning Milk"
//                                 value={`${dayTotal?.morning_total_milk?.toFixed(2)}L`}
//                                 subvalue={`₹${dayTotal?.morning_total_amount?.toFixed(2)}`}
//                                 icon="🌅"
//                                 gradient="from-amber-100 to-orange-100"
//                             />
//                             <StatCard
//                                 title="Evening Milk"
//                                 value={`${dayTotal?.evening_total_milk?.toFixed(2)}L`}
//                                 subvalue={`₹${dayTotal?.evening_total_amount?.toFixed(2)}`}
//                                 icon="🌆"
//                                 gradient="from-blue-100 to-purple-100"
//                             />
//                             <StatCard
//                                 title="Total Today"
//                                 value={`${dayTotal?.milk_total?.toFixed(2)}L`}
//                                 subvalue={`₹${dayTotal?.total_amount?.toFixed(2)}`}
//                                 icon="💰"
//                                 gradient="from-green-100 to-emerald-100"
//                             />
//                         </div>

//                         {/* Table */}
//                         <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
//                             <div className="p-8 border-b border-slate-100 flex items-center justify-between">
//                                 <div>
//                                     <h2 className="text-2xl font-bold text-slate-800">Collection Records</h2>
//                                     <p className="text-slate-500 text-sm mt-1">Today's entries</p>
//                                 </div>
//                                 <button
//                                     onClick={() => fetchMilkCollectionDetails()}
//                                     className="p-3 hover:bg-slate-100 rounded-xl transition-all duration-300"
//                                     title="Refresh"
//                                 >
//                                     <FaSync className="text-slate-600 text-xl" />
//                                 </button>
//                             </div>

//                             <div className="overflow-x-auto">
//                                 <table className="w-full">
//                                     <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
//                                         <tr>
//                                             {['SR', 'Account', 'Name', 'Date', 'Shift', 'Qty', 'FAT', 'SNF', 'Total', 'Wallet', 'Actions'].map(header => (
//                                                 <th key={header} className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
//                                                     {header}
//                                                 </th>
//                                             ))}
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y divide-slate-100">
//                                         {morningCollection.length === 0 && eveningCollection.length === 0 ? (
//                                             <tr>
//                                                 <td colSpan="11" className="px-6 py-16 text-center">
//                                                     <p className="text-slate-500 font-medium">No records found</p>
//                                                 </td>
//                                             </tr>
//                                         ) : (
//                                             <>
//                                                 {isShift === 'morning' && morningCollection.map((item, i) => (
//                                                     <tr key={`m-${i}`} className="hover:bg-blue-50 transition-colors duration-200">
//                                                         <td className="px-6 py-4 text-sm font-bold text-slate-600">{i + 1}</td>
//                                                         <td className="px-6 py-4 text-sm font-bold text-blue-600">{item.customer_account_number}</td>
//                                                         <td className="px-6 py-4 text-sm font-semibold text-slate-700">{item.name}</td>
//                                                         <td className="px-6 py-4 text-sm text-slate-500">{item.date}</td>
//                                                         <td className="px-6 py-4"><span className="px-3 py-1 text-xs font-bold bg-amber-100 text-amber-700 rounded-lg">Morning</span></td>
//                                                         <td className="px-6 py-4 text-sm font-bold text-green-600">{item.quantity}L</td>
//                                                         <td className="px-6 py-4 text-sm text-slate-600">{item.fat}</td>
//                                                         <td className="px-6 py-4 text-sm text-slate-600">{item.snf}</td>
//                                                         <td className="px-6 py-4 text-sm font-bold text-indigo-600">₹{item.total_amount}</td>
//                                                         <td className="px-6 py-4 text-sm font-bold text-slate-700">₹{item?.customer?.wallet || 0}</td>
//                                                         <td className="px-6 py-4">
//                                                             <div className="flex gap-2">
//                                                                 <button onClick={() => handlePrint(item)} className="p-2 hover:bg-blue-100 rounded-lg transition-all text-blue-600" title="Print"><BsFillPrinterFill /></button>
//                                                                 <button onClick={() => { setSelectedCustomer(item); setIsModalOpen(true); }} className="p-2 hover:bg-green-100 rounded-lg transition-all text-green-600" title="View"><FaEye /></button>
//                                                                 <button onClick={() => { setSelectedCustomer(item); setIsEditeModal(true); }} className="p-2 hover:bg-amber-100 rounded-lg transition-all text-amber-600" title="Edit"><FaPen /></button>
//                                                                 <button onClick={() => { setDeleteId(item.id); setShowConfirmModal(true); }} className="p-2 hover:bg-red-100 rounded-lg transition-all text-red-600" title="Delete"><FaTrashCan /></button>
//                                                             </div>
//                                                         </td>
//                                                     </tr>
//                                                 ))}

//                                                 {isShift === 'evening' && eveningCollection.map((item, i) => (
//                                                     <tr key={`e-${i}`} className="hover:bg-purple-50 transition-colors duration-200">
//                                                         <td className="px-6 py-4 text-sm font-bold text-slate-600">{i + 1}</td>
//                                                         <td className="px-6 py-4 text-sm font-bold text-blue-600">{item.customer_account_number}</td>
//                                                         <td className="px-6 py-4 text-sm font-semibold text-slate-700">{item.name}</td>
//                                                         <td className="px-6 py-4 text-sm text-slate-500">{item.date}</td>
//                                                         <td className="px-6 py-4"><span className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-lg">Evening</span></td>
//                                                         <td className="px-6 py-4 text-sm font-bold text-green-600">{item.quantity}L</td>
//                                                         <td className="px-6 py-4 text-sm text-slate-600">{item.fat}</td>
//                                                         <td className="px-6 py-4 text-sm text-slate-600">{item.snf}</td>
//                                                         <td className="px-6 py-4 text-sm font-bold text-indigo-600">₹{item.total_amount}</td>
//                                                         <td className="px-6 py-4 text-sm font-bold text-slate-700">₹{item?.customer?.wallet || 0}</td>
//                                                         <td className="px-6 py-4">
//                                                             <div className="flex gap-2">
//                                                                 <button onClick={() => handlePrint(item)} className="p-2 hover:bg-blue-100 rounded-lg transition-all text-blue-600" title="Print"><BsFillPrinterFill /></button>
//                                                                 <button onClick={() => { setSelectedCustomer(item); setIsModalOpen(true); }} className="p-2 hover:bg-green-100 rounded-lg transition-all text-green-600" title="View"><FaEye /></button>
//                                                                 <button onClick={() => { setSelectedCustomer(item); setIsEditeModal(true); }} className="p-2 hover:bg-amber-100 rounded-lg transition-all text-amber-600" title="Edit"><FaPen /></button>
//                                                                 <button onClick={() => { setDeleteId(item.id); setShowConfirmModal(true); }} className="p-2 hover:bg-red-100 rounded-lg transition-all text-red-600" title="Delete"><FaTrashCan /></button>
//                                                             </div>
//                                                         </td>
//                                                     </tr>
//                                                 ))}
//                                             </>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* VIEW MODAL */}
//             {isModalOpen && selectedCustomer && (
//                 <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
//                     <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 border border-slate-100 transform transition-all duration-300 animate-in">
//                         <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">Collection Details</h2>

//                         <div className="grid grid-cols-2 gap-6 mb-8">
//                             {[
//                                 ['Account', selectedCustomer.customer_account_number],
//                                 ['Name', selectedCustomer.name],
//                                 ['Mobile', selectedCustomer.mobile],
//                                 ['Milk Type', selectedCustomer.milk_type],
//                                 ['Quantity', `${selectedCustomer.quantity}L`],
//                                 ['FAT %', selectedCustomer.fat],
//                                 ['SNF %', selectedCustomer.snf],
//                                 ['Total Amount', `₹${selectedCustomer.total_amount}`],
//                             ].map(([label, value]) => (
//                                 <div key={label} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
//                                     <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">{label}</p>
//                                     <p className="text-lg font-bold text-slate-800">{value}</p>
//                                 </div>
//                             ))}
//                         </div>

//                         <div className="flex gap-4">
//                             <button
//                                 onClick={() => setIsModalOpen(false)}
//                                 className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all duration-300"
//                             >
//                                 Close
//                             </button>
//                             <button
//                                 onClick={() => handlePrint(selectedCustomer)}
//                                 className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
//                             >
//                                 <BsFillPrinterFill /> Print
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* DELETE MODAL */}
//             {showConfirmModal && (
//                 <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
//                     <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 border border-slate-100 text-center">
//                         <div className="text-5xl mb-4">⚠️</div>
//                         <h2 className="text-2xl font-bold text-slate-800 mb-2">Delete Record?</h2>
//                         <p className="text-slate-600 mb-8">This action cannot be undone</p>

//                         <div className="flex gap-4">
//                             <button
//                                 onClick={() => setShowConfirmModal(false)}
//                                 className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all duration-300"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={() => {
//                                     handleRemove(deleteId)
//                                     setShowConfirmModal(false)
//                                 }}
//                                 className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all duration-300"
//                             >
//                                 Delete
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Edit Modal */}
//             <EditMilkCollectionModal
//                 isOpen={isEditeModal}
//                 onClose={() => setIsEditeModal(false)}
//                 milkData={selectedCustomer}
//             />

//             <style>{`
//                 @keyframes fadeIn {
//                     from { opacity: 0; transform: translateY(10px); }
//                     to { opacity: 1; transform: translateY(0); }
//                 }
//                 .animate-in { animation: fadeIn 0.3s ease-out; }
//                 *::-webkit-scrollbar { width: 8px; }
//                 *::-webkit-scrollbar-track { background: transparent; }
//                 *::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
//                 *::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
//             `}</style>
//         </div>
//     )
// }

// export default DairyMilkCollectionPage


// import React, { useState, useEffect, useRef } from 'react'
// import useHomeStore from '../../zustand/useHomeStore'
// import { FaEye, FaPen, FaSync, FaPlus } from 'react-icons/fa'
// import { FaTrashCan } from 'react-icons/fa6'
// import CustomToast from '../../helper/costomeToast'
// import EditMilkCollectionModal from './EditMilkCollectionPage'
// import { BsFillPrinterFill } from 'react-icons/bs'

// const DairyMilkCollectionPage = () => {
//     const today = new Date().toISOString().split('T')[0]

//     const fetchCustomerDetailsByAccount = useHomeStore(state => state.fetchCustomerDetailsByAccount)
//     const submitMilkCollection = useHomeStore(state => state.submitMilkCollection)
//     const getMilkCollectionRecord = useHomeStore(state => state.getMilkCollectionRecord)
//     const deleteMilkCollection = useHomeStore(state => state.deleteMilkCollection)
//     const getMilkRate = useHomeStore(state => state.getMilkRate)

//     const [isModalOpen, setIsModalOpen] = useState(false)
//     const [selectedCustomer, setSelectedCustomer] = useState(null)
//     const [deleteId, setDeleteId] = useState(null)
//     const [showConfirmModal, setShowConfirmModal] = useState(false)
//     const [milkType, setMilkType] = useState('cow')
//     const [shiftValue, setShiftValue] = useState('morning')
//     const [isShift, setIsShift] = useState('morning')
//     const [isEditeModal, setIsEditeModal] = useState(false)
//     const [dayTotal, setDayTotal] = useState({
//         morning_total_amount: 0,
//         morning_total_milk: 0,
//         evening_total_amount: 0,
//         evening_total_milk: 0,
//         total_amount: 0,
//         milk_total: 0,
//     })
//     const [morningCollection, setMorningCollection] = useState([])
//     const [eveningCollection, setEveningCollection] = useState([])
//     const [customerWallet, setCustomerWallet] = useState(null)
//     const [currentTime, setCurrentTime] = useState(new Date())

//     const [form, setForm] = useState({
//         customer_account_number: '',
//         name: '',
//         careof: '',
//         mobile: '',
//         quantity: '',
//         clr: '',
//         fat: '',
//         snf: '',
//         base_rate: '',
//         other_price: '0',
//         rate: '',
//         total_amount: '',
//         milk_type: '',
//         shift: '',
//         date: today,
//     })

//     useEffect(() => {
//         const timer = setInterval(() => setCurrentTime(new Date()), 1000)
//         return () => clearInterval(timer)
//     }, [])

//     const checkTimeOfDay = () => {
//         const hour = new Date().getHours()
//         setShiftValue(hour < 12 ? 'morning' : 'evening')
//         setIsShift(hour < 12 ? 'morning' : 'evening')
//     }

//     const fetchCustomerDetailByAccountNumber = async (accountNo) => {
//         try {
//             const res = await fetchCustomerDetailsByAccount(accountNo)
//             if (res.status_code == 200) {
//                 setForm((prev) => ({
//                     ...prev,
//                     name: res.data.name || '',
//                     careof: res.data.careof || '',
//                     mobile: res.data.mobile || '',
//                 }))
//                 setCustomerWallet(res.data.wallet)
//             }
//         } catch (error) {
//             console.error('Error:', error)
//         }
//     }

//     useEffect(() => {
//         const { quantity, base_rate, other_price } = form
//         const q = parseFloat(quantity) || 0
//         const b = parseFloat(base_rate) || 0
//         const o = parseFloat(other_price) || 0
//         const rate = q * b
//         const total = rate + o

//         setForm((prev) => ({
//             ...prev,
//             rate: rate.toFixed(2),
//             total_amount: total.toFixed(2),
//         }))
//     }, [form.quantity, form.base_rate, form.other_price])

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target
//         if (name === 'customer_account_number') {
//             setForm(prev => ({ ...prev, [name]: value, name: '' }))
//             return
//         }
//         setForm(prev => {
//             let updated = { ...prev, [name]: type === 'checkbox' ? checked : value }
//             if (name === 'clr') updated.snf = ''
//             else if (name === 'snf') updated.clr = ''
//             return updated
//         })
//     }

//     const handleSubmit = async (e) => {
//         e.preventDefault()
//         form.shift = shiftValue
//         form.milk_type = milkType

//         try {
//             const res = await submitMilkCollection(form)
//             if (res.status_code == 200) {
//                 CustomToast.success(res.message)
//                 resetForm()
//                 fetchMilkCollectionDetails()
//                 accRef.current?.focus()
//             }
//         } catch (error) {
//             CustomToast.error(error)
//         }
//     }

//     const fetchMilkCollectionDetails = async () => {
//         try {
//             const res = await getMilkCollectionRecord(1)
//             if (res.status_code == 200) {
//                 setMorningCollection(res.morning)
//                 setEveningCollection(res.evening)
//                 setDayTotal({
//                     morning_total_amount: res.morning_total_amount || 0,
//                     morning_total_milk: res.morning_total_milk || 0,
//                     evening_total_amount: res.evening_total_amount || 0,
//                     evening_total_milk: res.evening_total_milk || 0,
//                     total_amount: res.total_amount || 0,
//                     milk_total: res.milk_total || 0,
//                 })
//             }
//         } catch (error) {
//             console.error('Error:', error)
//         }
//     }

//     useEffect(() => {
//         checkTimeOfDay()
//         fetchMilkCollectionDetails()
//     }, [])

//     useEffect(() => {
//         fetchMilkCollectionDetails()
//     }, [isEditeModal])

//     const handleRemove = async (id) => {
//         try {
//             const res = await deleteMilkCollection(id)
//             if (res.status_code == 200) {
//                 CustomToast.success(res.message)
//                 fetchMilkCollectionDetails()
//             }
//         } catch (error) {
//             console.error('Error:', error)
//         }
//     }

//     const handlePrint = (data) => {
//         const slip = {
//             account_no: data.customer_account_number,
//             customer: data.name,
//             date: data.date,
//             qty: `${data.quantity}L`,
//             fat: data.fat,
//             snf: data.snf,
//             rate: `₹${data.base_rate}`,
//             total: `₹${data.total_amount}`
//         }
//         if (window.api) window.api.printSlip(slip)
//     }

//     const resetForm = () => {
//         setForm({
//             customer_account_number: '',
//             name: '',
//             careof: '',
//             mobile: '',
//             quantity: '',
//             clr: '',
//             fat: '',
//             snf: '',
//             base_rate: '',
//             other_price: '0',
//             rate: '',
//             total_amount: '',
//             milk_type: '',
//             date: today,
//         })
//         setCustomerWallet(null)
//         accRef.current?.focus()
//     }

//     const accRef = useRef(null)
//     const qtyRef = useRef(null)
//     const fatRef = useRef(null)
//     const snfRef = useRef(null)
//     const otherRateRef = useRef(null)

//     const handleAccountKeyDown = async (e) => {
//         if (e.key === 'Enter') {
//             e.preventDefault()
//             if (form.customer_account_number.trim()) {
//                 await fetchCustomerDetailByAccountNumber(form.customer_account_number.trim())
//                 qtyRef.current?.focus()
//             }
//         }
//     }

//     // Compact Stat Card
//     const StatCard = ({ title, value, subvalue, gradient }) => (
//         <div className={`bg-gradient-to-br ${gradient} rounded-lg p-3 shadow-md border border-white/20 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}>
//             <p className="text-white/70 text-xs font-medium">{title}</p>
//             <p className="text-2xl font-bold text-white mt-1">{value}</p>
//             {subvalue && <p className="text-white/60 text-xs mt-0.5">{subvalue}</p>}
//         </div>
//     )

//     // Compact Input
//     const FormInput = ({ label, name, type = 'text', placeholder, value, onChange, onKeyDown, disabled = false, ref }) => (
//         <div className="space-y-1">
//             <label className="text-xs font-bold text-slate-600">{label}</label>
//             <input
//                 ref={ref}
//                 type={type}
//                 name={name}
//                 value={value}
//                 onChange={onChange}
//                 onKeyDown={onKeyDown}
//                 placeholder={placeholder}
//                 disabled={disabled}
//                 className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all
//                     ${disabled
//                         ? 'border-slate-200 bg-slate-100 text-slate-400'
//                         : 'border-slate-300 bg-white hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none'
//                     }`}
//             />
//         </div>
//     )

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
//             {/* Header */}
//             <div className="mb-4 flex items-center justify-between">
//                 <div>
//                     <h1 className="text-2xl font-bold text-slate-800">🥛 Dairy Collection</h1>
//                     <p className="text-xs text-slate-500 mt-0.5">Track milk records</p>
//                 </div>
//                 <div className="text-center bg-white rounded-xl px-4 py-2 shadow-md border border-slate-100">
//                     <p className="text-xs font-medium text-slate-600">Current Time</p>
//                     <p className="text-lg font-bold text-slate-800">
//                         {currentTime.toLocaleTimeString('en-IN', {
//                             hour: '2-digit',
//                             minute: '2-digit',
//                             hour12: true
//                         })}
//                     </p>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
//                 {/* LEFT: FORM - COMPACT */}
//                 <div className="lg:col-span-1">
//                     <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 sticky top-4">
//                         <div className="mb-4 pb-3 border-b-2 border-blue-500">
//                             <h2 className="text-lg font-bold text-slate-800">New Entry</h2>
//                             <p className="text-xs text-slate-500 mt-0.5">Add collection record</p>
//                         </div>

//                         <form onSubmit={handleSubmit} className="space-y-4">
//                             {/* Milk Type */}
//                             <div className="space-y-2">
//                                 <label className="text-xs font-bold text-slate-600">Milk Type</label>
//                                 <div className="grid grid-cols-3 gap-2">
//                                     {['cow', 'buffalo', 'other'].map((type) => (
//                                         <button
//                                             key={type}
//                                             type="button"
//                                             onClick={() => setMilkType(type)}
//                                             className={`py-1.5 rounded-lg font-bold text-xs transition-all ${milkType === type
//                                                     ? 'bg-blue-500 text-white shadow-md'
//                                                     : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                                                 }`}
//                                         >
//                                             {type === 'cow' ? '🐄' : type === 'buffalo' ? '🐃' : '🥛'}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* Shift */}
//                             <div className="space-y-2">
//                                 <label className="text-xs font-bold text-slate-600">Shift</label>
//                                 <div className="grid grid-cols-2 gap-2">
//                                     {['morning', 'evening'].map((shift) => (
//                                         <button
//                                             key={shift}
//                                             type="button"
//                                             onClick={() => setShiftValue(shift)}
//                                             className={`py-1.5 rounded-lg font-bold text-xs transition-all ${shiftValue === shift
//                                                     ? shift === 'morning' ? 'bg-amber-500 text-white shadow-md' : 'bg-purple-500 text-white shadow-md'
//                                                     : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                                                 }`}
//                                         >
//                                             {shift === 'morning' ? '🌅 M' : '🌆 E'}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* Date */}
//                             <FormInput
//                                 label="Date"
//                                 name="date"
//                                 type="date"
//                                 value={form.date}
//                                 onChange={handleChange}
//                             />

//                             {/* Customer Section */}
//                             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 space-y-2 border border-blue-100">
//                                 <p className="text-xs font-bold text-blue-700">👤 Customer</p>
//                                 <FormInput
//                                     ref={accRef}
//                                     label="Account #"
//                                     name="customer_account_number"
//                                     placeholder="Enter A/C"
//                                     value={form.customer_account_number}
//                                     onChange={handleChange}
//                                     onKeyDown={handleAccountKeyDown}
//                                 />
//                                 <FormInput
//                                     label="Name"
//                                     name="name"
//                                     value={form.name}
//                                     disabled
//                                     onChange={handleChange}
//                                 />
//                                 <FormInput
//                                     label="Phone"
//                                     name="mobile"
//                                     value={form.mobile}
//                                     disabled
//                                     onChange={handleChange}
//                                 />
//                             </div>

//                             {/* Milk Details */}
//                             <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 space-y-2 border border-green-100">
//                                 <p className="text-xs font-bold text-green-700">🥛 Milk</p>
//                                 <FormInput
//                                     ref={qtyRef}
//                                     label="Qty (L)"
//                                     name="quantity"
//                                     type="number"
//                                     placeholder="0.00"
//                                     value={form.quantity}
//                                     onChange={handleChange}
//                                 />
//                                 <div className="grid grid-cols-2 gap-2">
//                                     <FormInput
//                                         ref={fatRef}
//                                         label="FAT %"
//                                         name="fat"
//                                         type="number"
//                                         placeholder="0.0"
//                                         value={form.fat}
//                                         onChange={handleChange}
//                                     />
//                                     <FormInput
//                                         ref={snfRef}
//                                         label="SNF %"
//                                         name="snf"
//                                         type="number"
//                                         placeholder="0.0"
//                                         value={form.snf}
//                                         onChange={handleChange}
//                                     />
//                                 </div>
//                             </div>

//                             {/* Amount */}
//                             <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 space-y-2 border border-purple-100">
//                                 <p className="text-xs font-bold text-purple-700">💰 Amount</p>
//                                 <FormInput
//                                     label="Base Rate"
//                                     name="base_rate"
//                                     type="number"
//                                     value={form.base_rate}
//                                     disabled
//                                 />
//                                 <FormInput
//                                     ref={otherRateRef}
//                                     label="Other Price"
//                                     name="other_price"
//                                     type="number"
//                                     placeholder="0.00"
//                                     value={form.other_price}
//                                     onChange={handleChange}
//                                 />
//                                 <div className="grid grid-cols-2 gap-2">
//                                     <FormInput
//                                         label="Total Rate"
//                                         name="rate"
//                                         value={form.rate}
//                                         disabled
//                                     />
//                                     <FormInput
//                                         label="Final Total"
//                                         name="total_amount"
//                                         value={form.total_amount}
//                                         disabled
//                                     />
//                                 </div>
//                             </div>

//                             {/* Wallet */}
//                             {customerWallet !== null && (
//                                 <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg p-3 border-2 border-cyan-300">
//                                     <p className="text-xs font-bold text-blue-700">💳 Wallet</p>
//                                     <p className="text-2xl font-black text-blue-600 mt-1">₹{customerWallet}</p>
//                                 </div>
//                             )}

//                             {/* Buttons */}
//                             <div className="flex gap-2 pt-3 border-t border-slate-200">
//                                 <button
//                                     type="button"
//                                     onClick={resetForm}
//                                     className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-sm transition-all"
//                                 >
//                                     Reset
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-lg text-sm shadow-md transition-all flex items-center justify-center gap-1"
//                                 >
//                                     <FaPlus size={12} /> Submit
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>

//                 {/* RIGHT: RECORDS - COMPACT */}
//                 <div className="lg:col-span-3 space-y-4">
//                     {/* Summary Stats - Compact */}
//                     <div className="grid grid-cols-3 gap-3">
//                         <StatCard
//                             title="🌅 Morning"
//                             value={`${dayTotal?.morning_total_milk?.toFixed(2)}L`}
//                             subvalue={`₹${dayTotal?.morning_total_amount?.toFixed(2)}`}
//                             gradient="from-amber-400 to-orange-500"
//                         />
//                         <StatCard
//                             title="🌆 Evening"
//                             value={`${dayTotal?.evening_total_milk?.toFixed(2)}L`}
//                             subvalue={`₹${dayTotal?.evening_total_amount?.toFixed(2)}`}
//                             gradient="from-blue-400 to-purple-500"
//                         />
//                         <StatCard
//                             title="📊 Total"
//                             value={`${dayTotal?.milk_total?.toFixed(2)}L`}
//                             subvalue={`₹${dayTotal?.total_amount?.toFixed(2)}`}
//                             gradient="from-green-400 to-emerald-500"
//                         />
//                     </div>

//                     {/* Table - Compact */}
//                     <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
//                         <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100">
//                             <h2 className="text-sm font-bold text-slate-800">📋 Records</h2>
//                             <button
//                                 onClick={() => fetchMilkCollectionDetails()}
//                                 className="p-1.5 hover:bg-slate-200 rounded-lg transition-all"
//                                 title="Refresh"
//                             >
//                                 <FaSync className="text-slate-600 text-sm" />
//                             </button>
//                         </div>

//                         <div className="overflow-x-auto">
//                             <table className="w-full text-xs">
//                                 <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
//                                     <tr>
//                                         {['SR', 'A/C', 'Name', 'Date', 'Shift', 'Qty', 'FAT', 'SNF', 'Total', 'Wallet', 'Act'].map(h => (
//                                             <th key={h} className="px-2 py-2 text-left font-bold text-slate-700">{h}</th>
//                                         ))}
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-slate-100">
//                                     {morningCollection.length === 0 && eveningCollection.length === 0 ? (
//                                         <tr>
//                                             <td colSpan="11" className="px-4 py-6 text-center text-slate-500 text-xs">
//                                                 No records found
//                                             </td>
//                                         </tr>
//                                     ) : (
//                                         <>
//                                             {isShift === 'morning' && morningCollection.map((item, i) => (
//                                                 <tr key={`m-${i}`} className="hover:bg-blue-50 transition-colors">
//                                                     <td className="px-2 py-2 font-bold text-slate-600">{i + 1}</td>
//                                                     <td className="px-2 py-2 font-bold text-blue-600">{item.customer_account_number}</td>
//                                                     <td className="px-2 py-2 font-semibold text-slate-700 truncate">{item.name}</td>
//                                                     <td className="px-2 py-2 text-slate-600">{item.date}</td>
//                                                     <td className="px-2 py-2"><span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 rounded">M</span></td>
//                                                     <td className="px-2 py-2 font-bold text-green-600">{item.quantity}L</td>
//                                                     <td className="px-2 py-2 text-slate-600">{item.fat}</td>
//                                                     <td className="px-2 py-2 text-slate-600">{item.snf}</td>
//                                                     <td className="px-2 py-2 font-bold text-indigo-600">₹{item.total_amount}</td>
//                                                     <td className="px-2 py-2 font-bold text-slate-700">₹{item?.customer?.wallet || 0}</td>
//                                                     <td className="px-2 py-2">
//                                                         <div className="flex gap-1">
//                                                             <button onClick={() => handlePrint(item)} className="p-1 hover:bg-blue-100 rounded text-blue-600 text-xs" title="Print"><BsFillPrinterFill /></button>
//                                                             <button onClick={() => { setSelectedCustomer(item); setIsModalOpen(true); }} className="p-1 hover:bg-green-100 rounded text-green-600 text-xs" title="View"><FaEye /></button>
//                                                             <button onClick={() => { setSelectedCustomer(item); setIsEditeModal(true); }} className="p-1 hover:bg-amber-100 rounded text-amber-600 text-xs" title="Edit"><FaPen /></button>
//                                                             <button onClick={() => { setDeleteId(item.id); setShowConfirmModal(true); }} className="p-1 hover:bg-red-100 rounded text-red-600 text-xs" title="Delete"><FaTrashCan /></button>
//                                                         </div>
//                                                     </td>
//                                                 </tr>
//                                             ))}

//                                             {isShift === 'evening' && eveningCollection.map((item, i) => (
//                                                 <tr key={`e-${i}`} className="hover:bg-purple-50 transition-colors">
//                                                     <td className="px-2 py-2 font-bold text-slate-600">{i + 1}</td>
//                                                     <td className="px-2 py-2 font-bold text-blue-600">{item.customer_account_number}</td>
//                                                     <td className="px-2 py-2 font-semibold text-slate-700 truncate">{item.name}</td>
//                                                     <td className="px-2 py-2 text-slate-600">{item.date}</td>
//                                                     <td className="px-2 py-2"><span className="px-2 py-0.5 text-xs font-bold bg-purple-100 text-purple-700 rounded">E</span></td>
//                                                     <td className="px-2 py-2 font-bold text-green-600">{item.quantity}L</td>
//                                                     <td className="px-2 py-2 text-slate-600">{item.fat}</td>
//                                                     <td className="px-2 py-2 text-slate-600">{item.snf}</td>
//                                                     <td className="px-2 py-2 font-bold text-indigo-600">₹{item.total_amount}</td>
//                                                     <td className="px-2 py-2 font-bold text-slate-700">₹{item?.customer?.wallet || 0}</td>
//                                                     <td className="px-2 py-2">
//                                                         <div className="flex gap-1">
//                                                             <button onClick={() => handlePrint(item)} className="p-1 hover:bg-blue-100 rounded text-blue-600 text-xs" title="Print"><BsFillPrinterFill /></button>
//                                                             <button onClick={() => { setSelectedCustomer(item); setIsModalOpen(true); }} className="p-1 hover:bg-green-100 rounded text-green-600 text-xs" title="View"><FaEye /></button>
//                                                             <button onClick={() => { setSelectedCustomer(item); setIsEditeModal(true); }} className="p-1 hover:bg-amber-100 rounded text-amber-600 text-xs" title="Edit"><FaPen /></button>
//                                                             <button onClick={() => { setDeleteId(item.id); setShowConfirmModal(true); }} className="p-1 hover:bg-red-100 rounded text-red-600 text-xs" title="Delete"><FaTrashCan /></button>
//                                                         </div>
//                                                     </td>
//                                                 </tr>
//                                             ))}
//                                         </>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* VIEW MODAL - Compact */}
//             {isModalOpen && selectedCustomer && (
//                 <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
//                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 border border-slate-100">
//                         <h2 className="text-lg font-bold text-slate-800 mb-4 pb-3 border-b">Details</h2>

//                         <div className="grid grid-cols-2 gap-3 mb-6">
//                             {[
//                                 ['A/C', selectedCustomer.customer_account_number],
//                                 ['Name', selectedCustomer.name],
//                                 ['Phone', selectedCustomer.mobile],
//                                 ['Qty', `${selectedCustomer.quantity}L`],
//                                 ['FAT %', selectedCustomer.fat],
//                                 ['SNF %', selectedCustomer.snf],
//                                 ['Total', `₹${selectedCustomer.total_amount}`],
//                                 ['Type', selectedCustomer.milk_type],
//                             ].map(([label, value]) => (
//                                 <div key={label} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200">
//                                     <p className="text-xs font-bold text-slate-600">{label}</p>
//                                     <p className="text-sm font-bold text-slate-800 mt-0.5">{value}</p>
//                                 </div>
//                             ))}
//                         </div>

//                         <div className="flex gap-2">
//                             <button
//                                 onClick={() => setIsModalOpen(false)}
//                                 className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-sm"
//                             >
//                                 Close
//                             </button>
//                             <button
//                                 onClick={() => handlePrint(selectedCustomer)}
//                                 className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-1"
//                             >
//                                 <BsFillPrinterFill size={12} /> Print
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* DELETE MODAL - Compact */}
//             {showConfirmModal && (
//                 <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
//                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 border border-slate-100 text-center">
//                         <div className="text-4xl mb-3">⚠️</div>
//                         <h2 className="text-lg font-bold text-slate-800 mb-1">Delete?</h2>
//                         <p className="text-xs text-slate-600 mb-5">Cannot be undone</p>

//                         <div className="flex gap-2">
//                             <button
//                                 onClick={() => setShowConfirmModal(false)}
//                                 className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-sm"
//                             >
//                                 No
//                             </button>
//                             <button
//                                 onClick={() => {
//                                     handleRemove(deleteId)
//                                     setShowConfirmModal(false)
//                                 }}
//                                 className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-sm"
//                             >
//                                 Yes
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Edit Modal */}
//             <EditMilkCollectionModal
//                 isOpen={isEditeModal}
//                 onClose={() => setIsEditeModal(false)}
//                 milkData={selectedCustomer}
//             />
//         </div>
//     )
// }

// export default DairyMilkCollectionPage
