import React, { useEffect, useState } from 'react';
import './ratechart.css';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';



// Constants
// const SNF_VALUES = [8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9.0];
const SNF_VALUES = [];
for (let i = 7.5; i <= 9.0; i += 0.1) {
  SNF_VALUES.push(parseFloat(i.toFixed(1)));
}
const FAT_VALUES = [
  3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1,
  4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0, 5.1,
  5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6.0, 6.1,
  6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 7.0, 7.1,
  7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.0, 8.1,
  8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9.0, 9.1,
  9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 10.0
];

// Empty initialData
const initialData = FAT_VALUES.map(fat => ({
  fat,
  snfRates: SNF_VALUES.map(snf => ({ snf, rate: '' })),
}));

const RateChartPage = () => {
  const [rateData, setRateData] = useState(initialData);
  const rateChartDataFetch = useHomeStore(state => state.rateChartDataFetch);
  const fetchRateChartData = useHomeStore(state => state.fetchRateChartData); // new zustand method

  const handleChange = (fatIndex, snfIndex, value) => {
    const updated = [...rateData];
    updated[fatIndex].snfRates[snfIndex].rate = value;
    setRateData(updated);
  };

  const handleSave = async () => {
    try {
      const cleanedData = rateData.map(row => ({
        fat: row.fat,
        snfRates: row.snfRates.map(cell => ({
          snf: cell.snf,
          rate: cell.rate !== '' ? parseFloat(cell.rate) : '',
        })),
      }));

      console.log("clenateData", cleanedData)

      // return

      const updatedData = await rateChartDataFetch({ rateData: cleanedData });

      if (updatedData) {
        // Transform API response into the same format used by frontend
        const transformedData = updatedData.map(item => ({
          fat: parseFloat(item.fat),
          snfRates: SNF_VALUES.map(snf => {
            const key = `snf_${snf.toFixed(1).replace('.', '_')}`;
            return {
              snf,
              rate: item[key] ?? '',
            };
          }),
        }));

        setRateData(transformedData);
        CustomToast.success("Rates saved and updated!")
      } else {
        // alert('Failed to fetch updated data.');
        CustomToast.error("Failed to fetch updated data.")

      }
    } catch (error) {
      // console.error('Error saving rate chart:', error);
      // alert('Error saving rates.');
    }
  };

  // Data show in Frontend table
  // useEffect(() => {
  //   const loadData = async () => {
  //     const data = await fetchRateChartData();
  //     if (data) {
  //       const transformedData = data.map(item => ({
  //         fat: parseFloat(item.fat),
  //         snfRates: SNF_VALUES.map(snf => {
  //           const key = `snf_${snf.toFixed(1).replace('.', '_')}`;
  //           return {
  //             snf,
  //             rate: item[key] ?? '',
  //           };
  //         }),
  //       }));

  //       setRateData(transformedData);
  //     }
  //   };

  //   loadData();
  // }, []);


  useEffect(() => {
    const loadData = async () => {
      const data = await fetchRateChartData();
      console.log("Fetched data from backend:", data);

      // Merge backend data with full FAT list
      const mergedData = FAT_VALUES.map(fatValue => {
        const matched = data?.find(item => parseFloat(item.fat) === fatValue);

        return {
          fat: fatValue,
          snfRates: SNF_VALUES.map(snf => {
            const key = `snf_${snf.toFixed(1).replace('.', '_')}`;
            return {
              snf,
              rate: matched ? matched[key] ?? '' : '', // If no value, show blank
            };
          }),
        };
      });

      setRateData(mergedData);
    };

    loadData();
  }, []);

  return (
    <div className="h-[93%] flex flex-col p-4">
      {/* Save button and header */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
        >
          Save
        </button>
      </div>
      <h1 className="text-xl font-bold mb-2">SNF Rate Chart</h1>

      {/* Scrollable Table Container */}
      <div className="overflow-auto border border-gray-500 rounded">
        <div className="min-w-max"> {/* horizontal scroll wrapper */}
          <table className="border-collapse text-sm min-w-full">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="sticky left-0  text-white border bg-slate-500 border-gray-300 px-1 py-1 z-20">
                  FAT / SNF
                </th>
                {SNF_VALUES.map((snf) => (
                  <th
                    key={snf}
                    className="border border-gray-300 px-1 py-1 text-center bg-slate-500 text-white"
                  >
                    {snf.toFixed(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='bg-slate-700' >
              {rateData.map((row, fatIndex) => (
                <tr key={fatIndex}>
                  <td className="sticky left-0 bg-slate-500 text-white text-center border border-gray-300 px-1 py-1 font-medium z-10" style={{width:'60px'}}>
                    {row.fat}
                  </td>
                  {row.snfRates.map((cell, snfIndex) => (
                    <td key={snfIndex} className="border border-gray-300 " >
                      <input
                      style={{width:'60px'}}
                        type="text"
                        value={cell.rate}
                        onChange={(e) =>
                          handleChange(fatIndex, snfIndex, e.target.value)
                        }
                        className=" text-sm text-center text-white  rounded px-1 py-1 focus:outline-none focus:ring-2 bg-slate-700 focus:ring-blue-400"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );



  // return (
  //   <div className="rateChartContainer">
  //     <div className="snfChartBox">
  //       <div className='saveBtn'>
  //         <button onClick={handleSave}>Save</button>
  //       </div>
  //       <h1 className="chartTitle">SNF Rate Chart</h1>
  //       <div className="tableWrapper">
  //         <table className="snfChartTable">
  //           <thead>
  //             <tr>
  //               <th>FAT / SNF</th>
  //               {SNF_VALUES.map(snf => (
  //                 <th key={snf}>{snf.toFixed(1)}</th>
  //               ))}
  //             </tr>
  //           </thead>
  //           <tbody>
  //             {rateData.map((row, fatIndex) => (
  //               <tr key={fatIndex}>
  //                 <td>{row.fat}</td>
  //                 {row.snfRates.map((cell, snfIndex) => (
  //                   <td key={snfIndex}>
  //                     <input
  //                       type="text"
  //                       value={cell.rate}
  //                       onChange={(e) =>
  //                         handleChange(fatIndex, snfIndex, e.target.value)
  //                       }
  //                       className="editableInput"
  //                     />
  //                   </td>
  //                 ))}
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     </div>
  //   </div>
  // );
};


export default RateChartPage;
