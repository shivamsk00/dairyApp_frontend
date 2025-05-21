import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./customer.css";
import { FaArrowLeft } from 'react-icons/fa';
import CommonBackButton from '../../components/CommonBackButton';
import useHomeStore from '../../zustand/useHomeStore';

const AddCustomerPage = () => {
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();

    const addCustomer = useHomeStore(state => state.addCustomer);

    const [form, setForm] = useState({
        name: '',
        mobile: '',
        email: '',
        address: '',
        city: '',
        pincode: '',
        contact_person: '',
        designation: '',
        pan_number: '',
        state: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await addCustomer(form);
            console.log("API Response:", res);

            if (res.status_code == 200) {
                setShowSuccessModal(true);

                // Optional: Clear the form
                setForm({
                    name: '',
                    phone: '',
                    email: '',
                    address: '',
                    city: '',
                    pincode: '',
                    contact: '',
                    designation: '',
                    pan: '',
                    state: '',
                });

                // Navigate to /customer after 2 seconds
                navigate('/customer');
            } else {
                setError(res?.message || 'Failed to add customer. Please try again.');
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
                            type="text"
                            name="mobile"
                            value={form.mobile}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                </div>

                {/* Email and Address */}
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
                        <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                        <input
                            type="text"
                            name="pan_number"
                            value={form.pan_number}
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
                </div>

                {/* Submit */}
                <div className="w-full">
                    <button
                        type="submit"
                        className="w-full addUserBtn text-white py-2 px-4 rounded"
                    >
                        Add Customer
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddCustomerPage;