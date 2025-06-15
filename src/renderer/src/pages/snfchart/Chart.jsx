import React, { useEffect, useState } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';

const Chart = ({ formValues, trigger }) => {
     const snfChartDataFetch = useHomeStore(state => state.snfChartDataFetch);

     const clrValues = Array.from({ length: 9 }, (_, i) => 22 + i); // 22 to 30
     const fatValues = Array.from({ length: 71 }, (_, i) => (3.0 + i * 0.1).toFixed(1)); // 3.0 to 10.0

     const [snfTable, setSnfTable] = useState([]);

     const calculateSnf = (clr, fat, A, B, C) => {
          const snf = (clr / A) + (B * fat) + Number(C);
          return (Math.round(snf * 10) / 10).toFixed(1); // round to one decimal
     };

     useEffect(() => {
          if (isNaN(formValues.A) || isNaN(formValues.B) || isNaN(formValues.C)) {
               setSnfTable([]);
               return;
          }

          const table = fatValues.map(fat => {
               return clrValues.map(clr => {
                    const snf = calculateSnf(clr, parseFloat(fat), formValues.A, formValues.B, formValues.C);
                    return snf;
               });
          });

          setSnfTable(table);
     }, [formValues, trigger]);

     const fetchSnfData = async () => {
          try {
               const transformedData = fatValues.map((fat, rowIdx) => {
                    const row = { fat: parseFloat(fat) };
                    clrValues.forEach((clr, colIdx) => {
                         row[`clr_${clr}`] = parseFloat(snfTable[rowIdx]?.[colIdx] ?? 0);
                    });
                    return row;
               });

               const res = await snfChartDataFetch(transformedData);
               if (res.status_code == 200) {
                    CustomToast.success(res.message);
               } else {
                    CustomToast.error(res.message);
               }
          } catch (error) {
               console.error('Error sending SNF data:', error);
               CustomToast.error("Failed to update SNF chart.");
          }
     };

     useEffect(() => {
          if (trigger > 0) {
               fetchSnfData();
          }
     }, [trigger]);

     return (
          <section className="bg-gray-900 rounded-xl mt-10 p-4">
               <h2 className="text-xl font-semibold text-white text-center mb-4">SNF Chart</h2>
               <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="table-auto min-w-[900px] w-full text-sm text-white">
                         <thead className="bg-gray-800">
                              <tr>
                                   <th className="px-4 py-2 text-left border border-gray-700">FAT / CLR</th>
                                   {clrValues.map(clr => (
                                        <th
                                             key={clr}
                                             className="px-4 py-2 text-center border border-gray-700 font-medium"
                                        >
                                             {clr}
                                        </th>
                                   ))}
                              </tr>
                         </thead>
                         <tbody>
                              {fatValues.map((fat, rowIdx) => (
                                   <tr
                                        key={fat}
                                        className="even:bg-gray-800 odd:bg-gray-700 border-b border-gray-600"
                                   >
                                        <td className="px-4 py-2 border border-gray-600">{fat}</td>
                                        {clrValues.map((clr, colIdx) => (
                                             <td
                                                  key={`${fat}-${clr}`}
                                                  className="px-4 py-2 text-center border border-gray-600"
                                             >
                                                  {snfTable[rowIdx]?.[colIdx] ?? ''}
                                             </td>
                                        ))}
                                   </tr>
                              ))}
                         </tbody>
                    </table>
               </div>
          </section>
     );
};

export default Chart;
