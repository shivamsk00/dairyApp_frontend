import React, { useEffect, useState } from 'react';
import './ratechart.css';
import useHomeStore from '../../zustand/useHomeStore';



// Constants
const SNF_VALUES = [8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9.0];
const FAT_VALUES = [
 3.0,3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1,
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
        alert('Rates saved and updated!');
      } else {
        alert('Failed to fetch updated data.');
      }
    } catch (error) {
      console.error('Error saving rate chart:', error);
      alert('Error saving rates.');
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
                  <th key={snf}>{snf.toFixed(1)}</th>
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
