import React from 'react';

const SubscriptionHistoryPage = () => {
  // Dummy history data — replace with API response later
  const subscriptionHistory = [
    {
      id: 1,
      planName: 'Standard',
      duration: '6 Months',
      startDate: '2024-12-01',
      endDate: '2025-05-31',
      amount: '₹2499',
      status: 'Active',
    },
    {
      id: 2,
      planName: 'Basic',
      duration: '3 Months',
      startDate: '2024-08-01',
      endDate: '2024-10-31',
      amount: '₹1499',
      status: 'Expired',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">
        Subscription History
      </h1>

      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl overflow-hidden">
        <table className="w-full table-auto text-left">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-3">Plan</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Start Date</th>
              <th className="p-3">End Date</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {subscriptionHistory.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{item.planName}</td>
                <td className="p-3">{item.duration}</td>
                <td className="p-3">{item.startDate}</td>
                <td className="p-3">{item.endDate}</td>
                <td className="p-3">{item.amount}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 text-sm rounded-full font-semibold ${
                      item.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
            {subscriptionHistory.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-6 text-gray-500">
                  No subscription history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionHistoryPage;
