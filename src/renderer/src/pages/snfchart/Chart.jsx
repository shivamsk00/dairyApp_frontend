import React, { useEffect, useState } from 'react';

const Chart = ({ formValues, trigger }) => {
     const clrValues = Array.from({ length: 9 }, (_, i) => 22 + i); // 22 to 30
     const fatValues = Array.from({ length: 71 }, (_, i) => (3.0 + i * 0.1).toFixed(1)); // 3.0 to 10.0

     const [snfTable, setSnfTable] = useState([]);

     const calculateSnf = (clr, fat, A, B, C) => {
          const snf = (clr / A) + (B * fat) + Number(C);
          return (Math.round(snf * 10) / 10).toFixed(1); // round to one decimal, always show .0
     };

     useEffect(() => {
          const table = fatValues.map(fat => {
               return clrValues.map(clr => {
                    const snf = calculateSnf(clr, parseFloat(fat), formValues.A, formValues.B, formValues.C);
                    return snf;
               });
          });
          setSnfTable(table);
     }, [formValues, trigger]); // recalculate when formValues or trigger changes

     return (
          <section style={{ padding: '20px' }}>
               <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>SNF Chart</h2>
               <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'center' }}>
                    <thead>
                         <tr>
                              <th>FAT \ CLR</th>
                              {clrValues.map(clr => (
                                   <th key={clr}>{clr}</th>
                              ))}
                         </tr>
                    </thead>
                    <tbody>
                         {fatValues.map((fat, rowIdx) => (
                              <tr key={fat}>
                                   <td>{fat}</td>
                                   {clrValues.map((clr, colIdx) => (
                                        <td key={clr}>{snfTable[rowIdx]?.[colIdx]}</td>
                                   ))}
                              </tr>
                         ))}
                    </tbody>
               </table>
          </section>
     );
};

export default Chart;
