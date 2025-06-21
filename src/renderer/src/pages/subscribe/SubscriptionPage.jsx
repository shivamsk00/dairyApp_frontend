import React, { useState } from 'react';

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('Standard');

  const plans = [
    {
      name: 'Basic',
      duration: '3 Months',
      offerPrice: 1799,
      price: 1499,
      features: [
        'Daily Milk Collection',
        'Customer Management',
        'Slip Print Feature',
        'Rate Chart Access',
      ],
      extras: ['Single Device Access'],
      terms: [
        'Valid for one device only.',
        'No refund after activation.',
        'Basic support via email.',
      ],
    },
    {
      name: 'Standard',
      duration: '6 Months',
      offerPrice: 3199,
      price: 2499,
      features: [
        'Everything in Basic',
        'Milk Sale & Purchase Reports',
        'Inventory Management',
        'Expense Tracking',
      ],
      extras: ['2 Devices Access', 'WhatsApp Support'],
      terms: [
        '2 device login allowed.',
        'Data backup every 15 days.',
        'Support via WhatsApp and Email.',
      ],
    },
    {
      name: 'Premium',
      duration: '12 Months',
      offerPrice: 5499,
      price: 3999,
      features: [
        'Everything in Standard',
        'Multi-user Access',
        'Priority Support',
        'Monthly Backup & Updates',
      ],
      extras: ['Multi Device Access', 'Dedicated Support Manager'],
      terms: [
        'Unlimited device access.',
        'Priority support (within 2 hours).',
        'Monthly software updates included.',
        'Free training and setup help.',
      ],
    },
  ];

  const selected = plans.find(plan => plan.name === selectedPlan);

  const getDiscountPercent = (offer, final) => {
    return Math.round(((offer - final) / offer) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Choose Your Subscription Plan
      </h1>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan, index) => {
          const isSelected = plan.name === selectedPlan;
          const discountPercent = getDiscountPercent(plan.offerPrice, plan.price);

          return (
            <div
              key={index}
              onClick={() => setSelectedPlan(plan.name)}
              className={`cursor-pointer bg-white rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl ${
                isSelected
                  ? 'border-4 border-indigo-500 bg-indigo-50 shadow-2xl scale-[1.03]'
                  : 'border border-gray-200 shadow-sm'
              }`}
            >
              <div>
                <h2 className="text-2xl font-semibold text-center text-indigo-600 mb-2">
                  {plan.name}
                </h2>
                <p className="text-center text-gray-600 mb-1">{plan.duration}</p>

                {/* Price display */}
                <div className="text-center mb-2">
                  <p className="text-gray-500 line-through text-sm">₹{plan.offerPrice}</p>
                  <p className="text-3xl font-bold text-gray-900">₹{plan.price}</p>
                </div>

                <p className="text-center text-sm text-green-600 font-medium mb-4">
                  {discountPercent}% OFF
                </p>

                <ul className="text-gray-700 space-y-2 mb-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      ✅ <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-sm text-gray-600 mb-6">
                  <p className="font-semibold mb-1">Extras:</p>
                  <ul className="list-disc pl-5">
                    {plan.extras.map((extra, i) => (
                      <li key={i}>{extra}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                className={`mt-auto py-2 px-4 rounded-lg transition font-medium ${
                  isSelected
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {isSelected ? 'Selected' : 'Subscribe'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Terms & Conditions Section */}
      <div className="mt-10 max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold text-indigo-700 mb-4">
          Terms & Conditions for {selected.name} Plan
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
          {selected.terms.map((term, i) => (
            <li key={i}>{term}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SubscriptionPage;
