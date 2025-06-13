import React, { useState, useEffect } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import useDailyMilkSaleStore from '../../zustand/useDailyMilkSaleStore';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { FaEye, FaPen } from 'react-icons/fa';
import { FaTrashCan } from 'react-icons/fa6';
import EditeMilkSale from './EditeMilkSale';

const MilkSalesPage = () => {
  const today = new Date().toISOString().split('T')[0];
  const fetchCustomerDetailsByAccount = useHomeStore(state => state.fetchCustomerDetailsByAccount);
  const dailyMilkSaleSubmit = useDailyMilkSaleStore(state => state.submitDailyMilkSale)
  const getDailyMilkSaleData = useDailyMilkSaleStore(state => state.getDailyMilkSaleData)
  const updateDailyMilkData = useDailyMilkSaleStore(state => state.updateDailyMilkData)
  const deleteDailyMilkSaleRecordByID = useDailyMilkSaleStore(state => state.deleteDailyMilkSaleRecordByID)
  const [customerWallet, setCustomerWallet] = useState(null)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [maxPageButtons, setMaxPageButtons] = useState(5);
  const [dailyMilkCollectionData, setDailyMilkCollectionData] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditeModal, setIsEditeModal] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    account_number: '',
    customer_name: '',
    sale_date: today,
    shift: '',
    milk_type: '',
    quentity: '',
    rate_per_liter: '',
    total_amount: '',
    payment_mode: '',
    notes: '',
  });




  // Total calculate on quantity or rate change
  useEffect(() => {
    const { quentity, rate_per_liter } = form;
    if (quentity && rate_per_liter) {
      const total = parseFloat(quentity) * parseFloat(rate_per_liter);
      setForm(prev => ({ ...prev, total_amount: total.toFixed(2) }));
    } else {
      setForm(prev => ({ ...prev, total_amount: '' }));
    }
  }, [form.quentity, form.rate_per_liter]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };




  // Debounced fetch on account number input
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (form.account_number) {
        fetchCustomerDetailByAccountNumber(form.account_number);
      } else {
        setForm((prev) => ({
          ...prev,
          name: '',
          careof: '',
          mobile: '',
        }));
      }
    }, 500); // wait 500ms after user stops typing

    return () => clearTimeout(timeout); // cleanup on next input
  }, [form.account_number]);



  // FETCH ALL CUSTOMER
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


  const handleDailyMilkSubmit = async (e) => {
    e.preventDefault();
    const dailyMilkSaleData = {
      "customer_account_number": form.account_number,
      "customer_name": form.name,
      "sale_date": form.sale_date,
      "shift": form.shift,
      "milk_type": form.milk_type,
      "quentity": form.quentity,
      "rate_per_liter": form.rate_per_liter,
      "total_amount": form.total_amount,
      "payment_mode": form.payment_mode,
      "notes": form.notes
    }

    // console.log("final daily milk data submit===>", dailyMilkSaleData)
    try {
      const res = await dailyMilkSaleSubmit(dailyMilkSaleData);
      console.log("submited data", res)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        CustomToast.success(res.response)
        fetchDailyMilkSaleData()
        setForm({
          customer_account_number: '',
          customer_name: '',
          sale_date: today,
          shift: '',
          milk_type: '',
          quentity: '',
          rate_per_liter: '',
          total_amount: '',
          payment_mode: '',
          notes: '',
        })
      } else {
        CustomToast.success(res.message)

      }
    } catch (error) {
      console.log("ERROR IN SUBMIT API ", error)

    }
  }


  // ALL DAILY MILK SALE FETCH 

  const fetchDailyMilkSaleData = async () => {
    try {
      const res = await getDailyMilkSaleData()
      console.log("fetch all milk daily collection sale data====>", res)
      if (res) {

        setDailyMilkCollectionData(res.data)
        CustomToast.success(res.message)
        setCurrentPage(res.data.current_page);
        setTotalPages(res.data.last_page);
      } else {

        CustomToast.error(res.message)
      }


    } catch (error) {
      console.error('ERROR IN DAILY MILK SALE FETCH DATA API', error)
    }
  }



  const handleUpdate = async (updatedData) => {
    console.log('Updated Data:', updatedData);
    setIsEditModalOpen(false);

    try {
      const res = await updateDailyMilkData(selectedCustomer.id, updatedData);
      console.log("response update data", res)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        fetchDailyMilkSaleData()
      } else {
        CustomToast.error(res.message)
        console.log("response", res)
      }
    } catch (error) {

    }




  };


  // delete record by id

  const handleRemove = async () => {
    try {
      const res = await deleteDailyMilkSaleRecordByID(deleteId)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        fetchDailyMilkSaleData()
      }
      else {

        CustomToast.success(res.message)
      }

    } catch (error) {

    }
  }






  useEffect(() => {
    fetchDailyMilkSaleData()
  }, [])



  // REDNDER BUTTONS 
  const renderPageButtons = () => {
    const groupStart = Math.floor((currentPage - 1) / maxPageButtons) * maxPageButtons + 1;
    const groupEnd = Math.min(groupStart + maxPageButtons - 1, totalPages);

    const pages = [];
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

    return (
      <div className="flex gap-1 flex-wrap justify-center mt-4 w-full">
        {/* Previous Page Button */}
        <button
          className="px-3 py-1 border rounded text-sm text-white bg-gray-500 hover:bg-gray-600 disabled:opacity-50"
          onClick={() => fetchMilkCollectionDetails(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <MdArrowBackIos size={18} />
        </button>

        {/* Page Number Buttons */}
        {pages}

        {/* Next Page Button */}
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


  return (
    <div className="w-full mx-auto p-6 mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Milk Sale Entry</h2>

      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Left: Form (50%) */}
        <form onSubmit={handleDailyMilkSubmit} className="w-full space-y-4 bg-white p-6 rounded-lg shadow">
          {/* Account No. & Sale Date in One Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Account Number</label>
              <input
                type="text"
                name="account_number"
                value={form.account_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Sale Date</label>
              <input
                type="date"
                name="sale_date"
                value={form.sale_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                name="customer_name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
              />
            </div>

            {/* <div>
              <label className="block mb-1 font-medium">Care Of</label>
              <input
                type="text"
                name="careof"
                value={form.careof}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
              />
            </div> */}
          </div>

          {/* Rest of the fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Shift</label>
              <select
                name="shift"
                value={form.shift}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
              >
                <option value="">Select Shift</option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Milk Type</label>
              <select
                name="milk_type"
                value={form.milk_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
              >
                <option value="">Select Type</option>
                <option value="cow">Cow</option>
                <option value="buffalo">Buffalo</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Quantity (L)</label>
              <input
                type="number"
                name="quentity"
                value={form.quentity}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Rate per Liter (₹)</label>
              <input
                type="number"
                name="rate_per_liter"
                value={form.rate_per_liter}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Payment Mode</label>
              <select
                name="payment_mode"
                value={form.payment_mode}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
              >
                <option value="">Select Payment Mode</option>
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Notes</label>
              <input
                type="text"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
              />
            </div>
          </div>

          {/* Total Amount */}
          <div>
            <label className="block mb-1 font-medium">Total Amount (₹)</label>
            <input
              type="text"
              name="total_amount"
              value={form.total_amount}
              readOnly
              className="w-full px-4 py-2 border rounded bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Submit
          </button>
        </form>

        {/* Right: Summary Box (50%) */}
        <div className="w-full md:w-1/2 bg-yellow-100 border border-yellow-400 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-yellow-800 mb-4 text-center">Sale Summary</h3>

          {/* Wallet Balance */}
          <div className="mb-4 text-right">
            <span className="inline-block bg-white text-green-600 px-4 py-2 rounded shadow font-bold">
              Wallet Balance: <span className={customerWallet < 0 ? "text-red-500 font-bold" : "text-green-600 font-bold"}> ₹{customerWallet}</span>
            </span>
          </div>

          {/* Summary Table */}
          <table className="w-full text-sm text-gray-700">
            <tbody>
              <tr className="border-b-2 border-black">
                <td className="py-2 font-semibold w-1/2">Account No:</td>
                <td className="py-2">{form.account_number || '--'}</td>
              </tr>
              <tr className="border-b-2 border-black">
                <td className="py-2 font-semibold">Name:</td>
                <td className="py-2">{form.name || '--'}</td>
              </tr>
              <tr className="border-b-2 border-black">
                <td className="py-2 font-semibold">Care Of:</td>
                <td className="py-2">{form.careof || '--'}</td>
              </tr>
              <tr className="border-b-2 border-black">
                <td className="py-2 font-semibold">Sale Date:</td>
                <td className="py-2">{form.sale_date || '--'}</td>
              </tr>
              <tr className="border-b-2 border-black">
                <td className="py-2 font-semibold">Shift:</td>
                <td className="py-2 capitalize">{form.shift || '--'}</td>
              </tr>
              <tr className="border-b-2 border-black">
                <td className="py-2 font-semibold">Milk Type:</td>
                <td className="py-2 capitalize">{form.milk_type || '--'}</td>
              </tr>
              <tr className="border-b-2 border-black">
                <td className="py-2 font-semibold">Quantity (L):</td>
                <td className="py-2">{form.quentity || '--'}</td>
              </tr>
              <tr className="border-b-2 border-black">
                <td className="py-2 font-semibold">Rate (₹/L):</td>
                <td className="py-2">₹{form.rate_per_liter || '--'}</td>
              </tr>
              <tr className="border-b-2 border-black">
                <td className="py-2 font-semibold">Payment Mode:</td>
                <td className="py-2 capitalize">{form.payment_mode || '--'}</td>
              </tr>
              <tr className="border-b-2 border-black">
                <td className="py-2 font-semibold">Notes:</td>
                <td className="py-2">{form.notes || '--'}</td>
              </tr>
              <tr className="border-b-2 border-black font-bold text-green-700">
                <td className="py-2">Total Amount:</td>
                <td className="py-2">₹{form.total_amount || '--'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* === Bottom Table === */}
      <div className="mt-8 w-full">
        <h3 className="text-xl font-semibold mb-4">Submitted Daily Milk Collections</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                {[
                  'SR NO.','Acc No.','Customer Name', 'Date', 'Milk Type', 'Qty (Ltr)', 'Rate (₹)', 'Amount (₹)',
                  'Shift', 'Payment Mode', 'Notes', 'Action'
                ].map((header) => (
                  <th key={header} className="border px-2 py-1 text-center">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dailyMilkCollectionData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center text-gray-500 py-4">
                    कोई डेटा उपलब्ध नहीं है
                  </td>
                </tr>
              ) : (
                dailyMilkCollectionData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'} hover:bg-gray-50`}
                  >
                    <td className="border px-2 py-1 text-center">{index + 1}</td>
                    <td className="border px-2 py-1 text-center">{item.customer_account_number}</td>
                    <td className="border px-2 py-1 text-center">{item.customer_name}</td>
                    <td className="border px-2 py-1 text-center">{item.sale_date}</td>
                    <td className="border px-2 py-1 text-center capitalize">{item.milk_type}</td>
                    <td className="border px-2 py-1 text-center">{item.quentity}</td>
                    <td className="border px-2 py-1 text-center">{item.rate_per_liter}</td>
                    <td className="border px-2 py-1 text-center">₹{item.total_amount}</td>
                    <td className="border px-2 py-1 text-center capitalize">{item.shift}</td>
                    <td className="border px-2 py-1 text-center capitalize">{item.payment_mode}</td>
                    <td className="border px-2 py-1 text-center">{item.notes}</td>
                    <td className="border px-2 py-1 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                          onClick={() => {
                            setSelectedCustomer(item);
                            setIsModalOpen(true);
                          }}
                          title="View"
                        >
                          <FaEye size={14} />
                        </button>
                        <button
                          className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                          onClick={() => {
                            setSelectedCustomer(item);
                            setIsEditModalOpen(true);
                          }}
                          title="Edit"
                        >
                          <FaPen size={14} />
                        </button>
                        <button
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                          onClick={() => {
                            setDeleteId(item.id);
                            setShowConfirmModal(true);
                          }}
                          title="Delete"
                        >
                          <FaTrashCan size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {renderPageButtons()}

      {/* EDIT MODAL SHOW  */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          // Optional: clicking outside modal closes it
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-1/2 p-6 relative"
            onClick={(e) => e.stopPropagation()} // prevent close on inside click
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
          >
            <EditeMilkSale
              dailyMilkSaleId={selectedCustomer}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditModalOpen(false)}
            />
          </div>
        </div>
      )}



      {/* VIEW DETAILS MODAL */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
              Milk Sale Details
            </h2>
            <table className="w-full text-sm text-left border border-gray-200">
              <tbody>
                {[
                  ['Sale Date', selectedCustomer.sale_date],
                  ['Shift', selectedCustomer.shift],
                  ['Milk Type', selectedCustomer.milk_type],
                  ['Quantity (Ltr)', selectedCustomer.quentity],
                  ['Rate per Liter (₹)', selectedCustomer.rate_per_liter],
                  ['Total Amount (₹)', selectedCustomer.total_amount],
                  ['Payment Mode', selectedCustomer.payment_mode],
                  ['Notes', selectedCustomer.notes || '—'],
                  ['Created At', new Date(selectedCustomer.created_at).toLocaleString()],
                ].map(([label, value], idx) => (
                  <tr key={label} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                    <td className="font-medium px-4 py-2 w-1/3">{label}</td>
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


      {/* DELETE MODAL */}
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
                  handleRemove();
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


    </div>
  );
};

export default MilkSalesPage;
