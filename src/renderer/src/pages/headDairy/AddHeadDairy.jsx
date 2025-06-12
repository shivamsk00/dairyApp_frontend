import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./headDairy.css";
import { FaArrowLeft } from 'react-icons/fa';
import CommonBackButton from '../../components/CommonBackButton';
import useHomeStore from '../../zustand/useHomeStore';
import { toast } from 'react-toastify';
import CustomToast from '../../helper/costomeToast';

const AddHeadDairy = () => {
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();

    const addHeadDairy = useHomeStore(state => state.addHeadDairy);

    const [form, setForm] = useState({
        dairy_name: '',
        contact_person: '',
        mobile: '',
        address: '',

    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await addHeadDairy(form);
            console.log("API Response:", res);

            if (res.status_code == 200) {
                setShowSuccessModal(true);

                // Optional: Clear the form
                setForm({
                    dairy_name: '',
                    contact_person: '',
                    mobile: '',
                    address: '',
                });
                CustomToast.success(res.message)
                // Navigate to /customer after 2 seconds
                navigate('/alldairymaster');
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
            {/* <CommonBackButton  heading={"Add Head Dairy Master"} /> */}
            <button onClick={() => navigate('/alldairymaster')}>
                    Add Head Dairy Master
                </button>
            {error && (
                <div className="text-red-600 font-medium mb-4">{error}</div>
            )}

            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-md text-center space-y-4">
                        <h2 className="text-xl font-semibold text-green-600">Dairy Master Added Successfully</h2>
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            onClick={() => navigate('/alldairymaster')}
                        >
                            Go to Dairy Master List
                        </button>
                    </div>
                </div>
            )}


            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6 w-full space-y-4">
                {/* Name and Phone */}
                <div className="w-full flex flex-col md:flex-row gap-4">

                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">
                            Dairy Name <span className='text-red-600 text-xl'>*</span>
                        </label>
                        <input
                            type="text"
                            name="dairy_name"
                            value={form.dairy_name}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">
                            Mobile <span className='text-red-600 text-xl'>*</span>
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

                {/* Contact Person and Address */}
                <div className="w-full flex flex-col md:flex-row gap-4">
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                        <input
                            type="text"
                            name="contact_person"
                            value={form.contact_person}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                    {/* Address */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={form.address}
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
                        Add Head Dairy Master
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddHeadDairy;