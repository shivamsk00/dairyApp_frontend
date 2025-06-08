import React, { useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import useDailyMilkDispatchStore from '../../zustand/useMilkDispatchStore';
import CustomToast from '../../helper/costomeToast';
import useHomeStore from '../../zustand/useHomeStore';

const MilkDispatchPage = () => {
  const submitMilkDispatch = useDailyMilkDispatchStore(state => state.submitMilkDispatch)
  const getMilkRate = useHomeStore(state => state.getMilkRate);
  const today = new Date().toISOString().split('T')[0];
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

  // const handleMilkDetailChange = (index, e) => {
  //   const { name, value } = e.target;
  //   const updatedDetails = [...form.milk_details];
  //   updatedDetails[index][name] = value;

  //   const { qty, rate } = updatedDetails[index];
  //   if (qty && rate) {
  //     updatedDetails[index].amount = (parseFloat(qty) * parseFloat(rate)).toFixed(2);
  //   } else {
  //     updatedDetails[index].amount = '';
  //   }

  //   setForm(prev => ({ ...prev, milk_details: updatedDetails }));
  // };

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
              <input
                type="text"
                name="head_dairy_id"
                value={form.head_dairy_id}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border rounded"
              />
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
                <th className="p-1 border">Type</th>
                <th className="p-1 border">Qty</th>
                <th className="p-1 border">Fat</th>
                <th className="p-1 border">SNF</th>
                <th className="p-1 border">Rate</th>
                <th className="p-1 border">Amount</th>
              </tr>
            </thead>
            <tbody>
              {form.milk_details.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-1 border">{item.milk_type || '--'}</td>
                  <td className="p-1 border">{item.qty || '--'}</td>
                  <td className="p-1 border">{item.fat || '--'}</td>
                  <td className="p-1 border">{item.snf || '--'}</td>
                  <td className="p-1 border">₹{item.rate || '--'}</td>
                  <td className="p-1 border">₹{item.amount || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MilkDispatchPage;
