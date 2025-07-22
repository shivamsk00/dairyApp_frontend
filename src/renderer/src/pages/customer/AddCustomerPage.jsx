import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./customer.css";
import { FaArrowLeft } from 'react-icons/fa';
import CommonBackButton from '../../components/CommonBackButton';
import useHomeStore from '../../zustand/useHomeStore';
import { toast } from 'react-toastify';
import CustomToast from '../../helper/costomeToast';

const AddCustomerPage = () => {
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();

    const addCustomer = useHomeStore(state => state.addCustomer);

    const [form, setForm] = useState({
        customer_type: '',
        name: '',
        mobile: '',
        careof: '',
        email: '',
        address: '',
        city: '',
        pincode: '',
        contact_person: '',
        designation: '',
        // pan_number: '',
        state: '',
        bank_account: '',
        ifsc_code: '',
        subsidy_code: "",
        total_cows:"",
        total_buffalos: "",
        total_animals: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        console.log("form data print ==>", form)

        try {
            const res = await addCustomer(form);
            console.log("API Response:", res);

            if (res.status_code == 200) {
                setShowSuccessModal(true);

                // Optional: Clear the form
                setForm({
                    customer_type: '',
                    name: '',
                    mobile: '',
                    email: '',
                    careof: '',
                    address: '',
                    city: '',
                    pincode: '',
                    contact_person: '',
                    designation: '',
                    // pan_number: '',
                    state: '',
                    bank_account: '',
                    ifsc_code: '',
                    subsidy_code: "",
                    total_cows: "",
                    total_buffalos: "",
                    total_animals: ""
                });
                CustomToast.success(res.message)
                // Navigate to /customer after 2 seconds
                navigate('/customer');
            } else {
                CustomToast.error(res.message)
            }
        } catch (error) {
            console.error('Error adding customer:', error);
            setError('An unexpected error occurred.');
        }
    };



    return (
        <div className="w-full p-4 addCustomerContainer">
            <CommonBackButton heading={"Add Customer"} />

            {error && (
                <div className="text-red-600 font-medium mb-4">{error}</div>
            )}

            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-md text-center space-y-4">
                        <h2 className="text-xl font-semibold text-green-600">Customer Added Successfully</h2>
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            onClick={() => navigate('/customer')}
                        >
                            Go to Customer List
                        </button>
                    </div>
                </div>
            )}


            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6 w-full space-y-4">
                {/* Name and Phone */}
                <div className="w-full flex flex-col md:flex-row gap-4">
                    <div className="w-full">
                        <label htmlFor="customer_type" className="block text-sm font-medium text-gray-700">
                            Customer Type <span className="text-red-600 text-xl">*</span>
                        </label>
                        <select
                            name="customer_type"
                            id="customer_type"
                            onChange={handleChange}
                            value={form.customer_type}
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                            required
                        >
                            <option value="">Choose</option>
                            <option value="Buyer">Buyer</option>
                            <option value="Seller">Seller</option>
                        </select>

                        {/* <input
                            type="text"
                            name="name"
                            
                           
                            required
                            
                        /> */}
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">
                            Customer Name <span className='text-red-600 text-xl'>*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">
                            Phone <span className='text-red-600 text-xl'>*</span>
                        </label>
                        <input
                            maxLength={10}
                            type="text"
                            name="mobile"
                            value={form.mobile}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                </div>

                {/* BANK ACCOUNT DETAILS */}
                <div className="w-full flex flex-col md:flex-row gap-4">
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">Bank Account</label>
                        <input
                            type="text"
                            name="bank_account"
                            value={form.bank_account}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                    {/* Careof */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">IFC Code</label>
                        <input
                            type="text"
                            name="ifsc_code"
                            value={form.ifsc_code}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">Subsidy Code</label>
                        <input
                            type="text"
                            name="subsidy_code"
                            value={form.subsidy_code}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                </div>


                {/* Email and Care of */}
                <div className="w-full flex flex-col md:flex-row gap-4">
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                    {/* Careof */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">Care of</label>
                        <input
                            type="text"
                            name="careof"
                            value={form.careof}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                </div>
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700">
                        Address <span className='text-red-600 text-xl'>*</span>
                    </label>
                    <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                </div>

                {/* Extra Fields Row */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                            type="text"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pincode</label>
                        <input
                            type="text"
                            name="pincode"
                            value={form.pincode}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                        <input
                            maxLength={10}
                            type="text"
                            name="contact_person"
                            value={form.contact_person}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Designation</label>
                        <input
                            type="text"
                            name="designation"
                            value={form.designation}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                  
                    <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input
                            type="text"
                            name="state"
                            value={form.state}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Total Cows</label>
                        <input
                            type="number"
                            name="total_cows"
                            value={form.total_cows}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                        </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mt-2">Total Buffalos</label>
                        <input
                            type="number"
                            name="total_buffalos"
                            value={form.total_buffalos}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mt-2">Total Animals</label>
                        <input
                            type="number"
                            name="total_animals"
                            value={form.total_animals}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="w-full">
                    <button
                        type="submit"
                        className="w-full bg-[#E6612A] text-white py-2 px-4 rounded"
                    >
                        Add Customer
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddCustomerPage;