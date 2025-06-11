import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useHomeStore from '../../zustand/useHomeStore';
import CommonBackButton from '../../components/CommonBackButton';
import CustomToast from '../../helper/costomeToast';

const EditCustomerPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const updateCustomer = useHomeStore(state => state.updateCustomer);
    const loading = useHomeStore(state => state.loading);

    const customer = location.state;

    const [customerData, setCustomerData] = useState({
        customer_type: '',
        name: '',
        email: '',
        mobile: '',
        contact_person: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        designation: '',
        account_number: '',
    });

    useEffect(() => {
        if (!customer) {
            toast.error('No customer data provided.');
            navigate('/customer');
        } else {
            setCustomerData({
                customer_type: customer.customer_type || '',
                name: customer.name || '',
                email: customer.email || '',
                mobile: customer.mobile || '',
                contact_person: customer.contact_person || '',
                address: customer.address || '',
                city: customer.city || '',
                state: customer.state || '',
                pincode: customer.pincode || '',
                designation: customer.designation || '',
                account_number: customer.account_number || '',
            });
        }
    }, [customer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomerData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await updateCustomer(customer.id, customerData);
            if (res.status_code == 200) {
                CustomToast.success(res.message)

                navigate('/customer');
            } else {
                CustomToast.error(res.message)
            }
        } catch (err) {
            toast.error('Error updating customer');
        }
    };

    return (
        <div className="w-full px-4 sm:px-8 py-10 bg-gray-100 min-h-screen">
            <CommonBackButton heading={"Cutomer Edit"} />
            <div className="max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-lg">
                <h1 className="text-2xl font-semibold mb-6 text-center">Edit Customer</h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                        { label: 'Customer Type', name: 'customer_type' },
                        { label: 'Name', name: 'name' },
                        { label: 'Email', name: 'email' },
                        { label: 'Mobile', name: 'mobile' },
                        { label: 'Contact Person', name: 'contact_person' },
                        { label: 'Address', name: 'address' },
                        { label: 'City', name: 'city' },
                        { label: 'State', name: 'state' },
                        { label: 'Pincode', name: 'pincode' },
                        { label: 'Designation', name: 'designation' },
                        { label: 'Account Number', name: 'account_number' },
                    ].map(({ label, name }) => (
                        <div key={name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

                            {name === 'customer_type' ? (
                                <select
                                    name="customer_type"
                                    value={customerData.customer_type}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Choose</option>
                                    <option value="Buyer">Buyer</option>
                                    <option value="Seller">Seller</option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name={name}
                                    value={customerData[name]}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Enter ${label.toLowerCase()}`}
                                />
                            )}
                        </div>
                    ))}

                    <div className="col-span-1 sm:col-span-2 flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className=" text-white px-6 py-2 rounded transition"
                        >
                            {loading ? 'please wait...' : 'Update Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCustomerPage;
