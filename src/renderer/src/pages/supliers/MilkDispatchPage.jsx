import React, { useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import useDailyMilkDispatchStore from '../../zustand/useMilkDispatchStore';
import useMilkDispatchStore from '../../zustand/useMilkDispatchStore';
import CustomToast from '../../helper/costomeToast';
import useHomeStore from '../../zustand/useHomeStore';
import { FaDotCircle, FaEye, FaPen, FaTrashAlt } from 'react-icons/fa';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';

const MilkDispatchPage = () => {
  const submitMilkDispatch = useDailyMilkDispatchStore(state => state.submitMilkDispatch)
  const getHeadDairyMilkData = useDailyMilkDispatchStore(state => state.getHeadDairyMilkData)
  const getAllHeadDairyMaster = useHomeStore(state => state.getAllHeadDairyMaster);
  const deleteHeadDairyMilkDispatch = useMilkDispatchStore(state => state.deleteHeadDairyMilkDispatch);
  const getMilkRate = useHomeStore(state => state.getMilkRate);
  const today = new Date().toISOString().split('T')[0];
  const [headDairies, setHeadDairies] = useState([]);
  const [isEditeModal, setIsEditeModal] = useState(false)
  const [collections, setCollections] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [maxPageButtons, setMaxPageButtons] = useState(5);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHeadDairy, setSelectedHeadDairy] = useState(null);
  const [headDairyToDelete, setHeadDairyToDelete] = useState(null);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [selectedDairy, setSelectedDairy] = useState(null);
  // const [rowData, setRowData] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [form, setForm] = useState({
    dispatch_date: today,
    shift: '',
    head_dairy_id: '',
    vehicle_no: '',
    total_qty: '',
    total_amount: '',
    notes: '',
    milk_details: [
      { milk_type: '', qty: '', fat: '', snf: '', rate: '', amount: '' },
    ],
  });



  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllHeadDairyMaster();
      console.log('Dairy Id', res);
      setHeadDairies(res.data);

    };
    fetchData();
  }, []);


  // Auto calculate total qty and amount
  useEffect(() => {
    const totalQty = form.milk_details.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const totalAmount = form.milk_details.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    setForm(prev => ({
      ...prev,
      total_qty: totalQty,
      total_amount: totalAmount.toFixed(2),
    }));
  }, [form.milk_details]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };



  let snfRateFetchTimeout;

  const handleMilkDetailChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDetails = [...form.milk_details];
    updatedDetails[index][name] = value;

    const { qty, fat, clr, rate } = updatedDetails[index];

    // ✅ Calculate amount if qty & rate are present
    if (qty && rate) {
      updatedDetails[index].amount = (parseFloat(qty) * parseFloat(rate)).toFixed(2);
    } else {
      updatedDetails[index].amount = '';
    }

    // ✅ Debounce rate fetch on SNF input
    if (name === 'snf') {
      clearTimeout(snfRateFetchTimeout);

      // 👇 Only continue if SNF is a valid float
      const snfValue = parseFloat(value);
      const isValidSNF = !isNaN(snfValue) && value.includes('.');

      if (!fat) {
        CustomToast.error('⚠️ Please enter FAT value first to fetch rate');
      } else if (isValidSNF) {
        snfRateFetchTimeout = setTimeout(async () => {
          try {
            const result = await getMilkRate(fat, clr || '', snfValue);
            console.log("result print ====>", result);

            if (result?.rate) {
              updatedDetails[index].rate = parseFloat(result.rate).toFixed(2);
              if (qty) {
                updatedDetails[index].amount = (parseFloat(qty) * result.rate).toFixed(2);
              }

              // ✅ Set updated form after rate is fetched
              setForm(prev => {
                const updatedMilkDetails = [...prev.milk_details];
                updatedMilkDetails[index] = updatedDetails[index];
                return { ...prev, milk_details: updatedMilkDetails };
              });
            } else {
              CustomToast.error('❌ Rate not found for given values');
            }
          } catch (error) {
            console.error('❌ Error fetching milk rate:', error);
            CustomToast.error('❌ Error fetching milk rate');
          }
        }, 500);
      }
    }

    // ✅ Immediate form update for all cases
    setForm(prev => ({ ...prev, milk_details: updatedDetails }));
  };

  const addMilkDetailRow = () => {
    setForm(prev => ({
      ...prev,
      milk_details: [
        ...prev.milk_details,
        { milk_type: '', qty: '', fat: '', snf: '', rate: '', amount: '' },
      ],
    }));
  };

  const removeMilkDetailRow = (index) => {
    if (form.milk_details.length > 1) {
      const updated = [...form.milk_details];
      updated.splice(index, 1);
      setForm(prev => ({ ...prev, milk_details: updated }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚚 Dispatch Form:', form);
    // TODO: Submit API call
    try {
      const res = await submitMilkDispatch(form);
      console.log("respone milk dispatch", res)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        fetchMilkCollectionDetails();
        // ✅ Reset form after submit
        setForm({
          dispatch_date: today,
          shift: '',
          head_dairy_id: '',
          vehicle_no: '',
          total_qty: '',
          total_amount: '',
          notes: '',
          milk_details: [
            { milk_type: '', qty: '', fat: '', snf: '', rate: '', amount: '' },
          ],
        });
      } else {
        CustomToast.success(res.message)

      }
    } catch (error) {
      console.log("ERROR IN SUBMIT MILK DISPATCH", error)

    }


  };

  // All Data Coming Through this API ////////////////////////////////////////////////
  const fetchMilkCollectionDetails = async (page = 1) => {
    try {
      const res = await getHeadDairyMilkData(page);
      console.log("Head Dairy milk collection data fetch success", res);
      if (res.status_code == 200) {
        setCollections(res.data.data);
        setCurrentPage(res.data.current_page);
        setTotalPages(res.data.last_page);
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

  // Delete Api/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const confirmDeleteHeadDairyMilkDispatch = async () => {
    try {
      const res = await deleteHeadDairyMilkDispatch(headDairyToDelete?.id);
      if (res.status_code == 200) {
        CustomToast.success(res.message)
        fetchMilkCollectionDetails();
      } else {
        CustomToast.error(res.message)

      }
    } catch (error) {
      CustomToast.error(res.message)
      console.log("ERROR IN DELETE FUN IN Head Dairy LIST", error);
    } finally {
      setIsConfirmOpen(false); ``
      setHeadDairyToDelete(null);
    }
  };

  // Update Api/////////////////////////////////////////////////////////////////////////////////////////////////////
  
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
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Milk Dispatch Entry</h2>

      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Left Form */}
        <form onSubmit={handleSubmit} className="w-full md:w-1/2 bg-white p-6 rounded shadow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Dispatch Date</label>
              <input
                type="date"
                name="dispatch_date"
                value={form.dispatch_date}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-medium">Shift</label>
              <select
                name="shift"
                value={form.shift}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="">Select</option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
              </select>
            </div>
            <div>
              <label className="block font-medium">Head Dairy ID</label>
              <select
                name="head_dairy_id"
                value={form.head_dairy_id}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border rounded"
                required
              >
                <option value="">Choose Head Dairy</option>
                {headDairies.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.dairy_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium">Vehicle No.</label>
              <input
                type="text"
                name="vehicle_no"
                value={form.vehicle_no}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleFormChange}
              rows="2"
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <hr />

          <h3 className="text-lg font-semibold mb-1">Milk Details</h3>
          {form.milk_details.map((item, index) => (
            <div key={index} className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-2 items-center">
              <select
                name="milk_type"
                value={item.milk_type}
                onChange={(e) => handleMilkDetailChange(index, e)}
                className="px-2 py-1 border rounded"
              >
                <option value="">Type</option>
                <option value="cow">Cow</option>
                <option value="buffalo">Buffalo</option>
                <option value="mixed">Mixed</option>
              </select>
              <input
                type="number"
                name="qty"
                placeholder="Qty"
                value={item.qty}
                onChange={(e) => handleMilkDetailChange(index, e)}
                className="px-2 py-1 border rounded"
              />
              <input
                type="number"
                name="fat"
                placeholder="Fat"
                value={item.fat}
                onChange={(e) => handleMilkDetailChange(index, e)}
                className="px-2 py-1 border rounded"
              />
              <input
                type="text"
                name="snf"
                placeholder="SNF"
                value={item.snf}
                onChange={(e) => handleMilkDetailChange(index, e)}
                className="px-2 py-1 border rounded"
              />
              <input
                type="number"
                name="rate"
                placeholder="Rate"
                value={item.rate}
                onChange={(e) => handleMilkDetailChange(index, e)}
                className="px-2 py-1 border rounded"
              />
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={item.amount}
                readOnly
                className="px-2 py-1 border rounded bg-gray-100"
              />
              {form.milk_details.length > 1 && index > 0 && (
                <button
                  type="button"
                  onClick={() => removeMilkDetailRow(index)}
                  className="text-white bg-red-700 w-10 h-8 rounded-md hover:bg-red-900  font-bold text-xl flex items-center justify-center "
                  title="Remove Row"
                >
                  <IoMdClose size={25} />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addMilkDetailRow}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          >
            + Add Row
          </button>

          <div className="mt-4">
            <label className="block font-medium">Total Quantity</label>
            <input
              type="text"
              value={form.total_qty}
              readOnly
              className="w-full px-4 py-2 border rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="block font-medium">Total Amount</label>
            <input
              type="text"
              value={form.total_amount}
              readOnly
              className="w-full px-4 py-2 border rounded bg-gray-100"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mt-4"
          >
            Submit
          </button>
        </form>

        {/* Right Summary Box */}
        <div className="w-full md:w-1/2 bg-yellow-100 border border-yellow-300 p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-4 text-center text-yellow-800">Dispatch Summary</h3>
          <table className="w-full text-sm text-gray-700">
            <tbody>
              <tr className="border-b-2 border-black"><td className="py-2 font-medium">Dispatch Date:</td><td>{form.dispatch_date || '--'}</td></tr>
              <tr className="border-b-2 border-black"><td className="py-2 font-medium">Shift:</td><td>{form.shift || '--'}</td></tr>
              <tr className="border-b-2 border-black"><td className="py-2 font-medium">Head Dairy ID:</td><td>{form.head_dairy_id || '--'}</td></tr>
              <tr className="border-b-2 border-black"><td className="py-2 font-medium">Vehicle No:</td><td>{form.vehicle_no || '--'}</td></tr>
              <tr className="border-b-2 border-black font-bold text-green-700"><td className="py-1 font-bold">Total Qty:</td><td className='font-bold'>{form.total_qty || '0'}</td></tr>
              <tr className="border-b-2 border-black font-bold text-green-700"><td className="py-1 font-bold">Total Amount:</td><td className='font-bold'>₹{form.total_amount || '0.00'}</td></tr>
              <tr className="border-b-2 border-black"><td className="py-1 font-medium">Notes:</td><td>{form.notes || '--'}</td></tr>
            </tbody>
          </table>

          <hr className="my-4" />
          <h4 className="text-lg font-semibold mb-2">Milk Details</h4>
          <table className="w-full border text-xs">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-1 border">Head Dairy</th>
                <th className="p-1 border">Date</th>
                <th className="p-1 border">Shift</th>
                <th className="p-1 border">Type</th>
                <th className="p-1 border">Qty</th>
                <th className="p-1 border">Fat</th>
                <th className="p-1 border">SNF</th>
                <th className="p-1 border">Rate</th>
                <th className="p-1 border">Amount</th>
                <th className="p-1 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-1 border">{item.dairy_name || '--'}</td>
                  <td className="p-1 border">{item.dispatch_date || '--'}</td>
                  <td className="p-1 border">{item.shift || '--'}</td>
                  <td className="p-1 border">{item.milk_details[0].milk_type || '--'}</td>
                  <td className="p-1 border">{item.milk_details[0].qty || '--'}</td>
                  <td className="p-1 border">{item.milk_details[0].fat || '--'}</td>
                  <td className="p-1 border">{item.milk_details[0].snf || '--'}</td>
                  <td className="p-1 border">₹{item.milk_details[0].rate || '--'}</td>
                  <td className="p-1 border">₹{item.milk_details[0].amount || '--'}</td>
                  <td className="p-1 border text-center space-x-1"> {/* Added space-x-1 for spacing */}
                    <button
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition"
                      onClick={() => {
                          setIsModalOpen(true);
                        setSelectedHeadDairy(item);
                      }}
                      
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                      onClick={() => {
                            setSelectedDairy(item);
                            setIsEditModalOpen(true);
                          }}
                      title="Edit"
                    >
                      <FaPen />
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                      onClick={() => {
                        
                        setHeadDairyToDelete(item); // Corrected: use 'item' instead of 'row.original'
                        setIsConfirmOpen(true);
                      }}
                      title="Delete"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
            {renderPageButtons()}
          </table>
        </div>
      </div>

      {/* THIS MODAL  */}
      {isModalOpen && selectedHeadDairy && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 p-6 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Milk Dispatch Entry Details</h2>

            <table className="w-full text-sm text-left border border-gray-200">
              <tbody>
                {[
                  ['Name', selectedHeadDairy.dairy_name],
                  ['Date', selectedHeadDairy.dispatch_date],
                  ['Shift', selectedHeadDairy.shift],
                  ['Vehicle No.', selectedHeadDairy.vehicle_no],
                  ['Total Qty', selectedHeadDairy.total_qty],
                  ['Total Amount', selectedHeadDairy.total_amount],
                  // ['Status', selectedHeadDairy.status === "1" ? 'Active' : 'Inactive'],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b hover:bg-gray-50">
                    <td className="font-medium text-gray-700 px-4 py-2 w-1/3 bg-gray-50">{label}</td>
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

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6 text-center relative">
            <h2 className="text-lg font-semibold mb-4">Are you sure you want to delete?</h2>
            <p className="text-gray-700 mb-6">This action cannot be undone.</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteHeadDairyMilkDispatch}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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

export default MilkDispatchPage;
