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
    const editCustomerValueGet = useHomeStore(state => state.editCustomerValueGet);
    const loading = useHomeStore(state => state.loading);

    const customer = location.state;
    console.log('Customer data:', customer);

    const [customerData, setCustomerData] = useState({
        customer_type: '',
        name: '',
        email: '',
        mobile: '',
        careof: '',
        contact_person: '',
        address: '',
        city: '',
        state: '',
        wallet: '',
        pincode: '',
        designation: '',
        account_number: '',
        bank_account: '',
        ifsc_code: '',
        subsidy_code: ''

    });


    const fetchCustomerEditData = async () => {
        try {
            const res = await editCustomerValueGet({ customer_id: customer.id });
            const customerData = res.data;

            console.log("Response from editCustomerValueGet====>", res);
            if (res.status_code == 200) {
                setCustomerData({
                    customer_type: customerData.customer_type || '',
                    name: customerData.name || '',
                    email: customerData.email || '',
                    mobile: customerData.mobile || '',
                    careof: customerData.careof || '',
                    contact_person: customerData.contact_person || '',
                    addcustomerDatas: customerData.addcustomerDatas || '',
                    address: customer.address || '',
                    city: customerData.city || '',
                    state: customerData.state || '',
                    wallet: customerData.wallet || '',
                    pincode: customerData.pincode || '',
                    designation: customerData.designation || '',
                    account_number: customerData.account_number || '',
                    bank_account: customerData.bank_account,
                    ifsc_code: customerData.ifsc_code,
                    subsidy_code: customerData.subsidy_code
                });
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error('Error fetching customer data');
        }
    }

    useEffect(() => {
        fetchCustomerEditData();
    }, [])




    // useEffect(() => {
    //     if (!customer) {
    //         toast.error('No customer data provided.');
    //         navigate('/customer');
    //     } else {
    //         setCustomerData({
    //             customer_type: customer.customer_type || '',
    //             name: customer.name || '',
    //             email: customer.email || '',
    //             mobile: customer.mobile || '',
    //             careof: customer.careof || '',
    //             contact_person: customer.contact_person || '',
    //             address: customer.address || '',
    //             city: customer.city || '',
    //             state: customer.state || '',
    //             wallet: customer.wallet || '',
    //             pincode: customer.pincode || '',
    //             designation: customer.designation || '',
    //             account_number: customer.account_number || '',
    //         });
    //     }
    // }, [customer]);






    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomerData(prev => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e) => {
        console.log("customerData", customerData)
        e.preventDefault();
        // return
        try {
            const res = await updateCustomer(customer.id, customerData);
            if (res.status_code === 200) {
                CustomToast.success(res.message);
                navigate('/customer');
            } else {
                CustomToast.error(res.message);
            }
        } catch (err) {
            toast.error('Error updating customer');
        }
    };

    return (
        <div className="w-full px-4 sm:px-8 py-10 bg-gray-100 min-h-screen">
            <CommonBackButton heading={"Edit Customer"} />

            <div className="max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-xl border border-gray-200">
                <h1 className="text-3xl font-semibold mb-8 text-center text-indigo-700">
                    Update Customer Details
                </h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { label: 'Account Number', name: 'account_number' },
                        { label: 'Customer Type', name: 'customer_type' },
                        { label: 'Name', name: 'name' },
                        { label: 'Bank Account', name: 'bank_account', type: 'number', },
                        { label: 'IFSC Code', name: 'ifsc_code' },
                        { label: 'Subsidy Code', name: 'subsidy_code', type: 'number' },
                        { label: 'Email', name: 'email' },
                        { label: 'Mobile', name: 'mobile', type: 'number', },
                        { label: 'Contact Person', name: 'contact_person' },
                        { label: 'Address', name: 'address' },
                        { label: 'City', name: 'city' },
                        { label: 'State', name: 'state' },
                        { label: 'Wallet', name: 'wallet', type: 'number' },
                        { label: 'Care of', name: 'careof' },
                        { label: 'Pincode', name: 'pincode', type: 'number' },
                        { label: 'Designation', name: 'designation' },
                    ].map(({ label, name, type }) => (
                        <div key={name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {label}
                            </label>

                            {name === 'customer_type' ? (
                                <select
                                    name="customer_type"
                                    value={customerData.customer_type || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="Buyer">Buyer</option>
                                    <option value="Seller">Seller</option>
                                </select>
                            ) : (
                                <input
                                    type={type || 'text'}
                                    name={name}
                                    value={customerData[name] || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder={`Enter ${label.toLowerCase()}`}
                                />
                            )}
                        </div>
                    ))}

                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 rounded-md text-white font-medium transition duration-200  ${loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            {loading ? 'Please wait...' : 'Update Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCustomerPage;
