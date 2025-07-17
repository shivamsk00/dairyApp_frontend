import React, { useState } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import { toast } from 'react-toastify';


const PaymentLedgerPage = () => {
  const today = new Date().toISOString().split('T')[0]
  const [summaryData, setSummaryData] = useState([]);
  const [form, setForm] = useState({
    start_date: today,
    end_date: today,
  });

  const paymentRegister = useHomeStore(state => state.paymentRegister);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatInputDate = (isoDateStr) => {
    if (!isoDateStr) return '';
    const [yyyy, mm, dd] = isoDateStr.split('-');
    return `${yyyy}-${mm}-${dd}`; // convert to dd-mm-yyyy
  };

  const handleGenerate = async () => {
    const payload = {
      ...form,
      start_date: formatInputDate(form.start_date),
      end_date: formatInputDate(form.end_date),
    };
    try {
      const res = await paymentRegister(payload);
      console.log('Response for payment register', res);
      if (res) {
        setSummaryData(res.data);
        toast.success("payment register generated successfully");
      } else {
        setSummaryData(null);
        toast.error(res?.message || "Failed to generate payment register");
      }
    } catch (error) {
      console.error("Error generating payment register:", error);
      toast.error("Failed to generate payment register");
      setSummaryData(null);
    }
  };
  const handleReset = () => {
    setForm({
      start_date: '',
      end_date: '',
    });
    setSummaryData(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };
  const isFormValid = form.start_date && form.end_date;
  return (
    <div className="flex min-h-screen">


      {/* Main Content */}
      <main className="flex-1 p-6 bg-white">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Payment Register</h1>
          <p className="text-sm">
            MS, PACCA SAHARANA, 1187 Milk Center/ Cooperative Society
            <br />
            1187, VPO: Pacca Saharana, Hanumangarh
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="border p-4 mb-4 bg-gray-50 rounded w-full max-w-md">
          <h3 className="font-medium mb-2">Generate Payment Register</h3>

          <div className="flex gap-4 mb-4">
            {/* From Date */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-700">From:</label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            {/* To Date */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-700">To:</label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-2 pt-2">
            <button
              onClick={handleGenerate}
              disabled={!isFormValid}
              className={`text-white px-4 py-2 rounded ${isFormValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              View
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Reset
            </button>
          </div>
        </div>


        {/* Report Date Range */}
        <div className="mb-4">
          <strong>Payment Register From Date:</strong>
        </div>

        {/* Table */}
        <div className="overflow-auto border rounded">
          <table className="min-w-full table-auto text-sm border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-3 py-2">Sr no.</th>
                <th className="border px-3 py-2">Ac No</th>
                <th className="border px-3 py-2">Member Name</th>
                <th className="border px-3 py-2">Total Quantity (Ltr.)</th>
                <th className="border px-3 py-2">Payable Amount</th>
                <th className="border px-3 py-2">CM Subsidy Amount</th>
                <th className="border px-3 py-2">Total Amount</th>
                <th className="border px-3 py-2">Member Sign</th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy Rows - replace with actual data map */}

              {
                summaryData && summaryData?.map((item, index) => (

                  <tr key={index}>
                    <td className="border px-3 py-2 text-center">{index + 1}</td>
                    <td className="border px-3 py-2 text-center">{item.customer_account_number}</td>
                    <td className="border px-3 py-2 text-center">{item.customer_name}</td>
                    <td className="border px-3 py-2 text-center">{item.total_milk_in_ltr.toFixed(2)}</td>
                    <td className="border px-3 py-2 text-center">{item.total_payable_amount}</td>
                    <td className="border px-3 py-2 text-center">{item.total_other_price}</td>
                    <td className="border px-3 py-2 text-center">{item.grand_total_amount_in_range}</td>
                    <td className="border px-3 py-2 text-center"></td>
                  </tr>
                ))

              }
              {/* Add more rows dynamically */}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default PaymentLedgerPage;
