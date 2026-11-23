import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CommonBackButton = ({ heading }) => {
  const nav = useNavigate();
  return (
    <div className="flex items-center gap-4 mb-6">
      <button
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 bg-indigo-100 hover:bg-indigo-200 px-4 py-2 rounded-md transition duration-200 shadow-sm"
        onClick={() => nav(-1)}
      >
        <FaArrowLeft className="text-sm" />
        <span className="font-medium">Back</span>
      </button>
      {heading && (
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          {heading}
        </h2>
      )}
    </div>
  );
};

export default CommonBackButton;
