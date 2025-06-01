
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useHomeStore from '../../zustand/useHomeStore';
import { toast } from 'react-toastify';
import CustomToast from '../../helper/costomeToast';
import CategoryTable from './CategoryTable';
import StockTable from './StockTable';
import ProductTable from './ProductTable';
import { navigateTo } from '../../helper/navigation';

const InventoryPage = () => {
  const [inventoryType, setInventoryType] = useState('Categories');
  const remberSelectedTable = (type) => {
    localStorage.setItem("seletedTableBtn", type)
    setInventoryType(type)
  }

  useEffect(() => {
    const selectedBtn = localStorage.getItem("seletedTableBtn") || "Categories"
    setInventoryType(selectedBtn)

  }, [inventoryType])


  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 items-center">
          {/* <label className="font-semibold block mr-2">Pages:</label> */}
          {['Categories', 'Stocks', 'Products'].map((type) => (
            <label key={type} className="relative">
              <input
                type="radio"
                name="inventoryType"
                value={type}
                checked={inventoryType === type}
                onChange={() => remberSelectedTable(type)}
                className="peer hidden"
              />
              <span className="capitalize px-4 py-1 rounded-full border border-gray-400 text-gray-700 cursor-pointer transition-all duration-200 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 hover:bg-blue-100">
                {type}
              </span>
            </label>
          ))}
        </div>
        <div className="flex justify-center items-center mb-4 gap-2">

          <button onClick={() => navigateTo("/addcategory")} className=" text-white px-4 py-2 rounded ">
            Add Category
          </button>
          <button onClick={() => navigateTo("/addStock")} className=" text-white px-4 py-2 rounded ">
            Add Stock
          </button>
          <button onClick={() => navigateTo("/AddProductPage")} className=" text-white px-4 py-2 rounded ">
            Add Product
          </button>
        </div>
      </div>


      {
        inventoryType === 'Categories' ? <CategoryTable /> : inventoryType === "Stocks" ? (
          <StockTable />
        ) : (
          <ProductTable />
        )
      }

    </div>
  );
};

export default InventoryPage;
