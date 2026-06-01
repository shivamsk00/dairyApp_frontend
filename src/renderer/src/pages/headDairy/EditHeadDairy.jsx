import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useHomeStore from '../../zustand/useHomeStore';
import CommonBackButton from '../../components/CommonBackButton';
import CustomToast from '../../helper/costomeToast';

const EditHeadDairy = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const updateHeadDairyMaster = useHomeStore(state => state.updateHeadDairyMaster);
    const loading = useHomeStore(state => state.loading);

    const headDairy = location.state;

    const [headDairyData, setHeadDairyData] = useState({
       
        dairy_name: '',
        mobile: '',
        contact_person: '',
        address: '',
      
    });

    useEffect(() => {
        if (!headDairy) {
            toast.error('No Head Dairy data provided.');
            navigate('/alldairymaster');
        } else {
            setHeadDairyData({
                dairy_name: headDairy.dairy_name || '',
                mobile: headDairy.mobile || '',
                contact_person: headDairy.contact_person || '',
                address: headDairy.address || '',
               
            });
        }
    }, [headDairy]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setHeadDairyData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await updateHeadDairyMaster(headDairy.id, headDairyData);
            if (res.status_code == 200) {
                CustomToast.success(res.message)

                navigate('/alldairymaster');
            } else {
                CustomToast.error(res.message)
            }
        } catch (err) {
            toast.error('Error updating Dairy Master');
        }
    };

    return (
        <div className="w-full px-4 sm:px-8 py-10 bg-gray-100 min-h-screen">
            <CommonBackButton heading={"Head Dairy Master Edit"} />
            <div className="max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-lg">
                <h1 className="text-2xl font-semibold mb-6 text-center">Edit Head Dairy Master</h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                       
                        { label: 'Head Dairy Name', name: 'dairy_name' },
                        { label: 'Mobile', name: 'mobile' },
                        { label: 'Contact Person', name: 'contact_person' },
                        { label: 'Address', name: 'address' },
                       
                    ].map(({ label, name }) => (
                        <div key={name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

                           
                                <input
                                    type="text"
                                    name={name}
                                    value={headDairyData[name]}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Enter ${label.toLowerCase()}`}
                                />
                            
                        </div>
                    ))}

                    <div className="col-span-1 sm:col-span-2 flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className=" text-white px-6 py-2 rounded transition"
                        >
                            {loading ? 'please wait...' : 'Update Dairy Master'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditHeadDairy;
