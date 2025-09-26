import React, { useEffect, useState, useRef } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import * as XLSX from 'xlsx';

// Constants
const SNF_VALUES = [];
for (let i = 6.8; i <= 10.2; i += 0.1) {
  SNF_VALUES.push(parseFloat(i.toFixed(1)));
}
const FAT_VALUES = Array.from({ length: 71 }, (_, i) => parseFloat((3.0 + i * 0.1).toFixed(1)));

const initialData = FAT_VALUES.map(fat => ({
  fat,
  snfRates: SNF_VALUES.map(snf => ({ snf, rate: '' })),
}));

const RateChartPage = () => {
  const [rateData, setRateData] = useState(initialData);
  const rateChartDataFetch = useHomeStore(state => state.rateChartDataFetch);
  const fetchRateChartData = useHomeStore(state => state.fetchRateChartData);
  const fileInputRef = useRef(null);

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

      const updatedData = await rateChartDataFetch({ rateData: cleanedData });

      if (updatedData) {
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
        CustomToast.success("Rates saved and updated!");
      } else {
        CustomToast.error("Failed to fetch updated data.");
      }
    } catch (error) {
      console.error('Error saving rate chart:', error);
      CustomToast.error("Error saving rates.");
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return CustomToast.error("No file selected.");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (jsonData.length < 2) return CustomToast.error("Excel file is empty or invalid.");

        const excelSnfValues = jsonData[0].slice(1).map(val => parseFloat(val.toFixed(1)));
        const expectedSnfValues = SNF_VALUES.map(snf => parseFloat(snf.toFixed(1)));

        const headersMatch = excelSnfValues.every((snf, i) => !isNaN(snf) && snf === expectedSnfValues[i]);

        if (!headersMatch) {
          CustomToast.error("SNF headers in Excel do not match expected values.");
          return;
        }

        const newRateData = FAT_VALUES.map(fat => {
          const rowIndex = jsonData.slice(1).findIndex(row => parseFloat(row[0]?.toFixed(1)) === fat);
          const rowData = rowIndex !== -1 ? jsonData[rowIndex + 1].slice(1) : [];

          return {
            fat,
            snfRates: SNF_VALUES.map((snf, i) => ({
              snf,
              rate: rowData[i] !== undefined && rowData[i] !== '' ? rowData[i].toString() : '',
            })),
          };
        });

        setRateData(newRateData);
        CustomToast.success("Excel data imported and table updated!");
        fileInputRef.current.value = '';
      } catch (error) {
        console.error(error);
        CustomToast.error("Failed to import Excel file.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchRateChartData();
      const merged = FAT_VALUES.map(fat => {
        const match = data?.find(item => parseFloat(item.fat) === fat);
        return {
          fat,
          snfRates: SNF_VALUES.map(snf => {
            const key = `snf_${snf.toFixed(1).replace('.', '_')}`;
            return { snf, rate: match ? match[key] ?? '' : '' };
          }),
        };
      });
      setRateData(merged);
    };
    loadData();
  }, []);

  return (
    <div className="h-[93%] p-4 flex flex-col">
      <div className="flex justify-end gap-2 mb-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls"
          className="hidden"
          onChange={handleImport}
          id="excel-input"
        />
        <label htmlFor="excel-input" className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded cursor-pointer">
          Import Excel
        </label>
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
        >
          Save
        </button>
      </div>

      <h1 className="text-lg font-semibold mb-3">SNF Rate Chart</h1>

      <div className="w-[80%] h-[70%] overflow-auto top-48 border fixed border-gray-400 rounded-md">
        <div className="w-full overflow-auto">
          <table className="table-auto min-w-full text-sm">
            <thead className="sticky top-0 bg-slate-600 text-white z-10">
              <tr>
                <th className="sticky left-0 z-20 bg-slate-700 px-2 py-1 border border-gray-400 text-center">
                  FAT / SNF
                </th>
                {SNF_VALUES.map((snf) => (
                  <th key={snf} className="px-2 py-1 border border-gray-400 text-center whitespace-nowrap">
                    {snf.toFixed(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-slate-800 text-white">
              {rateData.map((row, fatIndex) => (
                <tr key={fatIndex}>
                  <td className="sticky left-0 z-10 bg-slate-700 px-2 py-1 text-center font-medium border border-gray-400">
                    {row.fat}
                  </td>
                  {row.snfRates.map((cell, snfIndex) => (
                    <td key={snfIndex} className="border border-gray-500">
                      <input
                        type="text"
                        value={cell.rate}
                        onChange={(e) => handleChange(fatIndex, snfIndex, e.target.value)}
                        className="w-16 bg-slate-800 border-none outline-none text-white text-center py-1 rounded focus:ring-2 focus:ring-blue-400"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



      {/* <div className="overflow-auto border border-gray-400 rounded-md h-full">
        <table className="table-auto min-w-max text-sm">
          <thead className="sticky top-0 bg-slate-600 text-white z-10">
            <tr>
              <th className="sticky left-0 z-20 bg-slate-700 px-2 py-1 border border-gray-400 text-center">
                FAT / SNF
              </th>
              {SNF_VALUES.map(snf => (
                <th key={snf} className="px-2 py-1 border border-gray-400 text-center">
                  {snf.toFixed(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-slate-800 text-white">
            {rateData.map((row, fatIndex) => (
              <tr key={fatIndex}>
                <td className="sticky left-0 z-10 bg-slate-700 px-2 py-1 text-center font-medium border border-gray-400">
                  {row.fat}
                </td>
                {row.snfRates.map((cell, snfIndex) => (
                  <td key={snfIndex} className="border border-gray-500">
                    <input
                      type="text"
                      value={cell.rate}
                      onChange={(e) => handleChange(fatIndex, snfIndex, e.target.value)}
                      className="w-16 bg-slate-800 border-none outline-none text-white text-center py-1 rounded focus:ring-2 focus:ring-blue-400"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
    </div>
  );
};

export default RateChartPage;
