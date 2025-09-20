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
        <div className="w-full h-screen bg-white overflow-hidden">
            <CommonHeader heading={"Daily Milk Collection"} />

            <div className="flex flex-col md:flex-row w-full h-full">
                {/* === Left: Form Section === */}
                <div className="w-full md:w-[35%] bg-white border-r border-gray-300 flex flex-col">
                    <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1 overflow-y-auto">
                        {/* Milk Type & Shift */}
                        <div className="flex gap-4">
                            {/* Milk Type */}
                            <div className="w-1/2">
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
                <div className="w-full md:w-[65%] flex flex-col">
                    {/* Day Total Card */}
                    <div className="bg-white border-b border-gray-300 p-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Daily Summary</h2>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            {/* Morning */}
                            <div className="bg-orange-50 p-3 rounded border border-orange-200">
                                <h3 className="font-semibold text-orange-700 mb-2">Morning</h3>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Milk:</span>
                                        <span className="font-semibold">{dayTotal?.morning_total_milk.toFixed(2)} L</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Amount:</span>
                                        <span className="font-bold text-green-600">₹{dayTotal?.morning_total_amount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Evening */}
                            <div className="bg-purple-50 p-3 rounded border border-purple-200">
                                <h3 className="font-semibold text-purple-700 mb-2">Evening</h3>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Milk:</span>
                                        <span className="font-semibold">{dayTotal?.evening_total_milk.toFixed(2)} L</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Amount:</span>
                                        <span className="font-bold text-green-600">₹{dayTotal?.evening_total_amount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="bg-green-50 p-3 rounded border border-green-200">
                                <h3 className="font-semibold text-green-700 mb-2">Total</h3>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Milk:</span>
                                        <span className="font-semibold">{dayTotal?.milk_total.toFixed(2)} L</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Amount:</span>
                                        <span className="font-bold text-green-600">₹{dayTotal?.total_amount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex flex-col h-full">
                        {/* Fixed Header */}
                        <div className="bg-gray-50 border-b">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr>
                                        {['SR', 'AC No', 'Name', 'Date', 'Shift', 'Qty', 'FAT', 'SNF', 'Rate', 'Other', 'Total', 'Balance', 'Actions'].map(header => (
                                            <th key={header} className="px-2 py-2 text-left text-xs font-medium text-gray-600 w-auto">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                            </table>
                        </div>

                        {/* Scrollable Body */}
                        <div className="h-[65%] overflow-y-auto">
                            <table className="w-full text-sm">
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
                                                        <td colSpan="13" className="px-2 py-2 text-center font-semibold text-orange-800 text-xs">
                                                            Morning Collection ({morningCollection.length})
                                                        </td>
                                                    </tr>
                                                    {morningCollection.map((item, i) => (
                                                        <tr key={`morning-${i}`} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                                                            <td className="px-2 py-1 text-xs w-12">{i + 1}</td>
                                                            <td className="px-2 py-1 text-xs font-medium text-blue-600 w-20">{item.customer_account_number}</td>
                                                            <td className="px-2 py-1 text-xs w-32">{item.name}</td>
                                                            <td className="px-2 py-1 text-xs w-24">{item.date}</td>
                                                            <td className="px-2 py-1 w-20">
                                                                <span className="px-1 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                                                                    {item.shift}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-1 text-xs font-medium w-16">{item.quantity}</td>
                                                            <td className="px-2 py-1 text-xs w-16">{item.fat}</td>
                                                            <td className="px-2 py-1 text-xs w-16">{item.snf}</td>
                                                            <td className="px-2 py-1 text-xs text-green-600 w-20">₹{item.base_rate}</td>
                                                            <td className="px-2 py-1 text-xs w-16">₹{item.other_price}</td>
                                                            <td className="px-2 py-1 text-xs font-bold text-green-700 w-20">₹{item.total_amount}</td>
                                                            <td className="px-2 py-1 text-xs text-blue-600 w-20">₹{item?.customer?.wallet || 0}</td>
                                                            <td className="px-2 py-1 w-32">
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        className="p-1 bg-blue-100 text-blue-600 rounded text-xs"
                                                                        onClick={() => handlePrint(item)}
                                                                        title="Print"
                                                                    >
                                                                        <BsFillPrinterFill size={10} />
                                                                    </button>
                                                                    <button
                                                                        className="p-1 bg-green-100 text-green-600 rounded text-xs"
                                                                        onClick={() => { setSelectedCustomer(item); setIsModalOpen(true); }}
                                                                        title="View"
                                                                    >
                                                                        <FaEye size={10} />
                                                                    </button>
                                                                    <button
                                                                        className="p-1 bg-yellow-100 text-yellow-600 rounded text-xs"
                                                                        onClick={() => { setSelectedCustomer(item); setIsEditeModal(true); }}
                                                                        title="Edit"
                                                                    >
                                                                        <FaPen size={10} />
                                                                    </button>
                                                                    <button
                                                                        className="p-1 bg-red-100 text-red-600 rounded text-xs"
                                                                        onClick={() => { setDeleteId(item.id); setShowConfirmModal(true); }}
                                                                        title="Delete"
                                                                    >
                                                                        <FaTrashCan size={10} />
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
                                                            <td className="px-2 py-1 text-xs w-12">{i + 1}</td>
                                                            <td className="px-2 py-1 text-xs font-medium text-blue-600 w-20">{item.customer_account_number}</td>
                                                            <td className="px-2 py-1 text-xs w-32">{item.name}</td>
                                                            <td className="px-2 py-1 text-xs w-24">{item.date}</td>
                                                            <td className="px-2 py-1 w-20">
                                                                <span className="px-1 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                                                                    {item.shift}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-1 text-xs font-medium w-16">{item.quantity}</td>
                                                            <td className="px-2 py-1 text-xs w-16">{item.fat}</td>
                                                            <td className="px-2 py-1 text-xs w-16">{item.snf}</td>
                                                            <td className="px-2 py-1 text-xs text-green-600 w-20">₹{item.base_rate}</td>
                                                            <td className="px-2 py-1 text-xs w-16">₹{item.other_price}</td>
                                                            <td className="px-2 py-1 text-xs font-bold text-green-700 w-20">₹{item.total_amount}</td>
                                                            <td className="px-2 py-1 text-xs text-blue-600 w-20">₹{item?.customer?.wallet || 0}</td>
                                                            <td className="px-2 py-1 w-32">
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        className="p-1 bg-blue-100 text-blue-600 rounded text-xs"
                                                                        onClick={() => handlePrint(item)}
                                                                        title="Print"
                                                                    >
                                                                        <BsFillPrinterFill size={10} />
                                                                    </button>
                                                                    <button
                                                                        className="p-1 bg-green-100 text-green-600 rounded text-xs"
                                                                        onClick={() => { setSelectedCustomer(item); setIsModalOpen(true); }}
                                                                        title="View"
                                                                    >
                                                                        <FaEye size={10} />
                                                                    </button>
                                                                    <button
                                                                        className="p-1 bg-yellow-100 text-yellow-600 rounded text-xs"
                                                                        onClick={() => { setSelectedCustomer(item); setIsEditeModal(true); }}
                                                                        title="Edit"
                                                                    >
                                                                        <FaPen size={10} />
                                                                    </button>
                                                                    <button
                                                                        className="p-1 bg-red-100 text-red-600 rounded text-xs"
                                                                        onClick={() => { setDeleteId(item.id); setShowConfirmModal(true); }}
                                                                        title="Delete"
                                                                    >
                                                                        <FaTrashCan size={10} />
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

                        {/* Fixed Footer Statistics */}
                        <div className="bg-gray-50 border-t pt-5">
                            <table className="w-full text-sm">
                                <tfoot>
                                    <tr>
                                        <td colSpan="13" className="p-0">
                                            <div className="grid grid-cols-6 gap-4 text-xs p-3">
                                                <div className="text-center">
                                                    <p className="font-semibold text-gray-700">Avg. FAT</p>
                                                    <p className="font-bold text-blue-600">
                                                        {isShift === 'morning' ? milkCollectiionAvergeData?.morning_avg_fat : milkCollectiionAvergeData?.evening_avg_fat}%
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-semibold text-gray-700">Avg. SNF</p>
                                                    <p className="font-bold text-blue-600">
                                                        {isShift === 'morning' ? milkCollectiionAvergeData?.morning_avg_snf : milkCollectiionAvergeData?.evening_avg_snf}%
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-semibold text-gray-700">Avg. Rate</p>
                                                    <p className="font-bold text-green-600">
                                                        ₹{isShift === 'morning' ? milkCollectiionAvergeData?.morning_avg_base_rate : milkCollectiionAvergeData?.evening_avg_base_rate}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-semibold text-gray-700">Other</p>
                                                    <p className="font-bold text-orange-600">₹{Number(milkCollectiionAvergeData?.other_price_total).toFixed(2) || 0}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-semibold text-gray-700">Milk</p>
                                                    <p className="font-bold text-purple-600">
                                                        {isShift === 'morning' ? Number(milkCollectiionAvergeData?.morning_total_milk).toFixed(2) || 0 : Number(milkCollectiionAvergeData?.evening_total_milk).toFixed(2) || 0} L
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-semibold text-gray-700">Total</p>
                                                    <p className="font-bold text-green-700">
                                                        ₹{isShift === 'morning' ? Number(milkCollectiionAvergeData?.morning_total_amount).toFixed(2) : Number(milkCollectiionAvergeData?.evening_total_amount).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* All modals remain the same as original */}
            {isModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 p-6 relative overflow-y-auto max-h-[90vh]">
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

export default DairyMilkCollectionPage;
