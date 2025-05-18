import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./customer.css"
import { FaArrowLeft } from 'react-icons/fa';
import CommonBackButton from '../../components/CommonBackButton';
const AddCustomerPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Customer Data:", form);
    };

    return (
        <div className="w-full p-4 addCustomerContainer">
            {/* <div className="flex justify-start items-center mb-4 gap-3">
                <button

                    onClick={() => navigate(-1)} // or navigate('/customers')
                    className="addUserBackBtn"
                >
                    <FaArrowLeft />
                </button>
                <h2 className="text-2xl font-bold">Add New Customer</h2>
            </div> */}
            <CommonBackButton heading={"Add Cutomer"} />
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
                            name="phone"
                            value={form.phone}
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
                            name="contact"
                            value={form.contact}
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
                            name="pan"
                            value={form.pan}
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
                        className="w-full addUserBtn text-white py-2 px-4 rounded "
                    >
                        Add Customer
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddCustomerPage;
