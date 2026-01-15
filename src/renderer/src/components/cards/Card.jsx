import React from 'react';
import { FaDatabase, FaRupeeSign, FaUser } from 'react-icons/fa';
import { FaMoneyBillTrendUp } from 'react-icons/fa6';

const Card = ({ data }) => {
  const getIcon = () => {
    switch (data.title) {
      case 'Customer':
        return <FaUser className="text-blue-500 text-2xl" />;
      case 'Today Milk Purchase':
        return <FaMoneyBillTrendUp className="text-green-500 text-2xl" />;
      case 'Today Milk Sale':
        return <FaMoneyBillTrendUp className="text-red-500 text-2xl" />;
      case 'Inventory':
        return <FaDatabase className="text-purple-500 text-2xl" />;
      default:
        return <FaRupeeSign className="text-gray-500 text-2xl" />;
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-4 w-full max-w-xs flex items-center justify-between gap-4 hover:shadow-lg transition">
      <div className="flex flex-col justify-center">
        <h3 className="text-sm text-gray-500 mb-1 font-medium">{data.title}</h3>
        <h1 className="text-xl font-semibold text-gray-800">{data.total}</h1>
      </div>
      <div className="bg-gray-100 p-3 rounded-full">
        {getIcon()}
      </div>
    </div>
  );
};

export default Card;
