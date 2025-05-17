import React, { useState } from 'react';
import './ratechart.css';
import useHomeStore from '../../zustand/useHomeStore,js';


// Constants
const SNF_VALUES = [8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9.0];
const FAT_VALUES = [
  3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1,
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
          rate: cell.rate !== '' ? parseFloat(cell.rate) : '', // optionally convert to number
        })),
      }));

      await rateChartDataFetch({ rateData: cleanedData });
      alert('Rates saved successfully!');
    } catch (error) {
      console.error('Error saving rate chart:', error);
      alert('Error saving rates.');
    }
  };

  return (
    <div className="rateChartContainer">
      <div className="snfChartBox">
        <div className='saveBtn'>
          <button onClick={handleSave}>Save</button>
        </div>
        <h1 className="chartTitle">SNF Rate Chart</h1>
        <div className="tableWrapper">
          <table className="snfChartTable">
            <thead>
              <tr>
                <th>FAT / SNF</th>
                {SNF_VALUES.map(snf => (
                  <th key={snf}>{snf}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rateData.map((row, fatIndex) => (
                <tr key={fatIndex}>
                  <td>{row.fat}</td>
                  {row.snfRates.map((cell, snfIndex) => (
                    <td key={snfIndex}>
                      <input
                        type="text"
                        value={cell.rate}
                        onChange={(e) =>
                          handleChange(fatIndex, snfIndex, e.target.value)
                        }
                        className="editableInput"
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
};

export default RateChartPage;
