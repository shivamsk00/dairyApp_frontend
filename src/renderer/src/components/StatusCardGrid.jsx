import React from 'react';

const StatusCardGrid = ({ data = [] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {data.map((item, idx) => (
        <div
          key={idx}
          className="flex justify-between items-center bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition"
        >
          <div>
            <h4 className="text-sm font-medium text-gray-700">{item.label}</h4>
            <div className="text-indigo-600 text-xl font-semibold">{item.count}</div>
          </div>
          <div className="bg-orange-100 p-3 rounded-xl text-orange-500 text-xl">
            {item.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusCardGrid;
