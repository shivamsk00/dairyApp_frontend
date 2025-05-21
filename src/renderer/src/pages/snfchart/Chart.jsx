import React, { useEffect, useState } from 'react';
import useHomeStore from '../../zustand/useHomeStore';

const Chart = ({ formValues, trigger }) => {
     const snfChartDataFetch = useHomeStore(state => state.snfChartDataFetch);

     const clrValues = Array.from({ length: 9 }, (_, i) => 22 + i); // 22 to 30
     const fatValues = Array.from({ length: 71 }, (_, i) => (3.0 + i * 0.1).toFixed(1)); // 3.0 to 10.0

     const [snfTable, setSnfTable] = useState([]);

     const calculateSnf = (clr, fat, A, B, C) => {
          const snf = (clr / A) + (B * fat) + Number(C);
          return (Math.round(snf * 10) / 10).toFixed(1); // round to one decimal
     };

     // Recalculate SNF table whenever formula values or trigger change
     useEffect(() => {
          // Prevent calculation if formula values are invalid
          if (
               isNaN(formValues.A) ||
               isNaN(formValues.B) ||
               isNaN(formValues.C)
          ) {
               setSnfTable([]); // Reset table if formula is invalid
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

               await snfChartDataFetch(transformedData);
               alert('SNF Formula & chart are updated successfully.');
          } catch (error) {
               console.error('Error sending SNF data:', error);
               alert('Failed to update SNF chart.');
          }
     };

     useEffect(() => {
          if (trigger > 0) {
               fetchSnfData();
          }
     }, [trigger]);

     return (
          <section className="p-6 bg-gray-50">
               <h2 className="text-2xl font-semibold text-center mb-6">SNF Chart</h2>
               <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
                    <table className="min-w-full table-auto border-collapse text-sm">
                         <thead className="bg-gray-200">
                              <tr>
                                   <th className="px-6 py-4 border-b text-left text-sm font-medium text-gray-700">FAT \ CLR</th>
                                   {clrValues.map(clr => (
                                        <th key={clr} className="px-6 py-4 border-b text-sm font-medium text-gray-700">
                                             {clr}
                                        </th>
                                   ))}
                              </tr>
                         </thead>
                         <tbody>
                              {fatValues.map((fat, rowIdx) => (
                                   <tr key={fat} className="border-b">
                                        <td className="px-6 py-4 text-sm text-gray-800">{fat}</td>
                                        {clrValues.map((clr, colIdx) => (
                                             <td key={clr} className="px-6 py-4 text-sm text-gray-800 text-center">
                                                  {/* ✅ Avoid undefined value warning */}
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
