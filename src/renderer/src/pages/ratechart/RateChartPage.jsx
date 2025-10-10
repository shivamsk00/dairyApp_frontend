import React, { useEffect, useState, useRef } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import * as XLSX from 'xlsx';

// Constants - Fixed to handle 7.2 to 10.2 range properly
const SNF_VALUES = [];
for (let i = 8.0; i <= 9.5; i += 0.1) {
  SNF_VALUES.push(parseFloat(i.toFixed(1)));
}
const FAT_VALUES = Array.from({ length: 71 }, (_, i) => parseFloat((3.0 + i * 0.1).toFixed(1)));

const initialData = FAT_VALUES.map(fat => ({
  fat,
  snfRates: SNF_VALUES.map(snf => ({ snf, rate: '' })),
}));

const RateChartPage = () => {
  const [rateData, setRateData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [debugging, setDebugging] = useState(false);
  const rateChartDataFetch = useHomeStore(state => state.rateChartDataFetch);
  const fetchRateChartData = useHomeStore(state => state.fetchRateChartData);
  const fileInputRef = useRef(null);

  // Utility function to safely convert value to number
  const safeToNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return value;
    const numVal = parseFloat(value);
    return isNaN(numVal) ? null : numVal;
  };

  // Utility function to safely call toFixed
  const safeToFixed = (value, digits = 1) => {
    const numVal = safeToNumber(value);
    return numVal !== null ? parseFloat(numVal.toFixed(digits)) : null;
  };

  const handleChange = (fatIndex, snfIndex, value) => {
    const updated = [...rateData];
    updated[fatIndex].snfRates[snfIndex].rate = value;
    setRateData(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const cleanedData = rateData.map(row => ({
        fat: row.fat,
        snfRates: row.snfRates.map(cell => ({
          snf: cell.snf,
          rate: cell.rate !== '' ? safeToNumber(cell.rate) || '' : '',
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
    } finally {
      setLoading(false);
    }
  };

  // Flexible import function that works with any SNF columns
  const handleImport = (event) => {
    const file = event.target.files[0];
    
    console.log("🔍 Import Debug - File selected:", file);
    
    if (!file) {
      CustomToast.error("No file selected.");
      return;
    }

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      CustomToast.error("Please select a valid Excel file (.xlsx or .xls)");
      return;
    }

    setDebugging(true);
    console.log("🔍 Starting file read process...");

    const reader = new FileReader();
    
    reader.onerror = (error) => {
      console.error("❌ FileReader error:", error);
      CustomToast.error("Error reading file");
      setDebugging(false);
    };

    reader.onload = (e) => {
      console.log("✅ FileReader onload triggered");
      
      try {
        const data = new Uint8Array(e.target.result);
        console.log("🔍 Data length:", data.length);
        
        if (data.length === 0) {
          throw new Error("File is empty or corrupted");
        }

        const workbook = XLSX.read(data, { type: 'array' });
        console.log("🔍 Workbook sheets:", workbook.SheetNames);
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error("No sheets found in the Excel file");
        }

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON with proper handling
        const jsonData = XLSX.utils.sheet_to_json(sheet, { 
          header: 1,
          raw: true,
          defval: ''
        });

        console.log("🔍 Excel Data Preview:", jsonData.slice(0, 3));
        console.log("🔍 Total Excel rows:", jsonData.length);

        if (jsonData.length < 2) {
          throw new Error("Excel file needs at least header row and one data row");
        }

        // Get headers - Excel structure: [empty/label, 8, 8.1, 8.2, ...]
        const headers = jsonData[0];
        console.log("🔍 Raw Headers:", headers);
        
        // Skip first column and get all SNF headers
        const snfHeaders = headers.slice(1).filter(h => h !== null && h !== undefined && h !== '');
        console.log("🔍 Found SNF Headers:", snfHeaders);
        console.log("🔍 SNF Headers types:", snfHeaders.map(h => `${h} (${typeof h})`));

        if (snfHeaders.length === 0) {
          throw new Error("No SNF headers found in first row");
        }

        // Create mapping for available headers with flexible matching
        const headerMap = new Map();
        snfHeaders.forEach((header, index) => {
          let numericValue;
          
          if (typeof header === 'number') {
            numericValue = header;
          } else if (typeof header === 'string') {
            numericValue = parseFloat(header.trim());
          }
          
          if (!isNaN(numericValue) && numericValue > 0) {
            // Round to 1 decimal place to handle precision issues
            const roundedValue = parseFloat(numericValue.toFixed(1));
            headerMap.set(roundedValue, index + 1); // +1 because we skip first column
            console.log(`🔍 Mapped header "${header}" -> ${roundedValue} at column ${index + 1}`);
          } else {
            console.warn(`🔍 Skipping invalid header: "${header}"`);
          }
        });

        console.log("🔍 Header Mapping:", Array.from(headerMap.entries()));

        if (headerMap.size === 0) {
          throw new Error(`No valid numeric headers found. Headers were: ${snfHeaders.join(', ')}`);
        }

        // Check how many of our expected SNF values match
        const matchedSnfValues = SNF_VALUES.filter(snf => headerMap.has(snf));
        console.log("🔍 Matched SNF values from our range:", matchedSnfValues);
        
        if (matchedSnfValues.length === 0) {
          // No exact matches, let's see what we can use
          const availableHeaders = Array.from(headerMap.keys()).sort((a, b) => a - b);
          console.log("🔍 Available headers in Excel:", availableHeaders);
          console.log("🔍 Expected SNF range:", `${SNF_VALUES[0]} to ${SNF_VALUES[SNF_VALUES.length - 1]}`);
          
          CustomToast.error(`Excel headers (${availableHeaders.join(', ')}) don't match expected SNF range (${SNF_VALUES[0]} to ${SNF_VALUES[SNF_VALUES.length - 1]}). Please check your Excel file headers.`);
          return;
        }

        // Process data rows
        const dataRows = jsonData.slice(1);
        console.log("🔍 Processing", dataRows.length, "data rows");

        // Filter out empty rows
        const validDataRows = dataRows.filter(row => 
          row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell !== '')
        );

        console.log("🔍 Valid data rows:", validDataRows.length);
        if (validDataRows.length > 0) {
          console.log("🔍 Sample data rows:", validDataRows.slice(0, 3));
        }

        // Build new rate data
        const newRateData = FAT_VALUES.map(fat => {
          // Find row with matching FAT value
          const excelRow = validDataRows.find(row => {
            const rowFat = safeToNumber(row[0]);
            if (rowFat === null) return false;
            
            const difference = Math.abs(rowFat - fat);
            const isMatch = difference < 0.01;
            
            if (isMatch) {
              console.log(`🔍 Found match for FAT ${fat}: Excel row has ${rowFat}`);
            }
            
            return isMatch;
          });

          return {
            fat,
            snfRates: SNF_VALUES.map(snf => {
              let rate = '';
              
              // Check if this SNF value exists in Excel headers
              if (headerMap.has(snf) && excelRow) {
                const columnIndex = headerMap.get(snf);
                const cellValue = excelRow[columnIndex];
                
                if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                  const numValue = safeToNumber(cellValue);
                  if (numValue !== null) {
                    rate = cellValue.toString();
                    console.log(`🔍 Set rate for FAT ${fat}, SNF ${snf}: "${rate}"`);
                  }
                }
              }
              
              return { snf, rate };
            })
          };
        });

        // Count imported cells
        let importedCells = 0;
        let totalPossibleCells = 0;
        
        newRateData.forEach(row => {
          row.snfRates.forEach(cell => {
            if (headerMap.has(cell.snf)) {
              totalPossibleCells++;
              if (cell.rate !== '') {
                importedCells++;
              }
            }
          });
        });

        console.log("🔍 Import Summary:");
        console.log("- Available headers in Excel:", snfHeaders.length);
        console.log("- Matched headers with our range:", matchedSnfValues.length);  
        console.log("- Valid data rows:", validDataRows.length);
        console.log("- Total possible cells:", totalPossibleCells);
        console.log("- Imported cells:", importedCells);
        console.log("- Import success rate:", totalPossibleCells > 0 ? `${((importedCells/totalPossibleCells)*100).toFixed(1)}%` : '0%');

        if (importedCells === 0) {
          const availableHeaders = Array.from(headerMap.keys()).sort((a, b) => a - b);
          const expectedHeaders = matchedSnfValues.sort((a, b) => a - b);
          
          throw new Error(
            `No data imported!\n` +
            `Excel headers found: ${availableHeaders.join(', ')}\n` +
            `Matching expected headers: ${expectedHeaders.join(', ')}\n` +
            `Valid data rows: ${validDataRows.length}\n` +
            `Please check that your Excel file has numeric data in the matching columns.`
          );
        }

        setRateData(newRateData);
        CustomToast.success(`Successfully imported ${importedCells} values from ${validDataRows.length} rows! (${matchedSnfValues.length}/${SNF_VALUES.length} columns matched)`);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
      } catch (error) {
        console.error('❌ Import Error:', error);
        CustomToast.error(`Import failed: ${error.message}`);
      } finally {
        setDebugging(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleExport = () => {
    try {
      // Prepare data for export
      const exportData = [
        // Header row
        ['FAT / SNF', ...SNF_VALUES.map(snf => snf.toFixed(1))],
        // Data rows
        ...rateData.map(row => [
          row.fat.toFixed(1),
          ...row.snfRates.map(cell => cell.rate || '')
        ])
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(exportData);
      
      // Set column widths
      const colWidths = [{ wch: 10 }]; // FAT column
      for (let i = 0; i < SNF_VALUES.length; i++) {
        colWidths.push({ wch: 8 }); // SNF columns
      }
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rate Chart');
      
      const filename = `SNF_Rate_Chart_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);
      
      CustomToast.success(`Data exported successfully as ${filename}!`);
    } catch (error) {
      console.error('Export error:', error);
      CustomToast.error("Failed to export data.");
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      setRateData(initialData);
      CustomToast.success("Data cleared successfully!");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchRateChartData();
        if (data && data.length > 0) {
          const merged = FAT_VALUES.map(fat => {
            const match = data.find(item => Math.abs(parseFloat(item.fat) - fat) < 0.01);
            return {
              fat,
              snfRates: SNF_VALUES.map(snf => {
                const key = `snf_${snf.toFixed(1).replace('.', '_')}`;
                return { snf, rate: match ? match[key] ?? '' : '' };
              }),
            };
          });
          setRateData(merged);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        CustomToast.error("Failed to load rate chart data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchRateChartData]);

  return (
    <div className="h-screen flex flex-col p-4 bg-gray-100">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">SNF Rate Chart</h1>
        
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={handleImport}
            id="excel-input"
          />
          <label 
            htmlFor="excel-input" 
            className={`px-4 py-2 rounded cursor-pointer transition-colors duration-200 flex items-center gap-2 text-white ${
              debugging 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {debugging ? '🔄 Processing...' : '📥 Import Excel'}
          </label>
          
          <button
            onClick={handleExport}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors duration-200 flex items-center gap-2"
          >
            📤 Export Excel
          </button>
          
          {/* <button
            onClick={handleClear}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors duration-200 flex items-center gap-2"
          >
            🗑️ Clear
          </button> */}
          
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-4 py-2 rounded text-white transition-colors duration-200 flex items-center gap-2 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? '⏳ Saving...' : '💾 Save'}
          </button>
        </div>
      </div>

      {/* Debug Info */}
      {debugging && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
            <span className="text-yellow-800 font-medium">Processing Excel file... Check browser console for detailed logs.</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-lg font-medium">Processing...</span>
            </div>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-full overflow-auto">
          <table className="w-full border-collapse text-sm">
            {/* Sticky Header */}
            <thead className="sticky top-0 z-20 bg-slate-700 text-white">
              <tr>
                <th className="sticky left-0 z-30 bg-slate-800 px-3 py-2 border border-gray-300 text-center font-semibold min-w-[100px]">
                  FAT / SNF
                </th>
                {SNF_VALUES.map((snf) => (
                  <th 
                    key={snf} 
                    className="px-2 py-2 border border-gray-300 text-center font-semibold min-w-[70px] whitespace-nowrap"
                  >
                    {snf.toFixed(1)}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {rateData.map((row, fatIndex) => (
                <tr 
                  key={fatIndex} 
                  className={`${fatIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-150`}
                >
                  {/* Sticky FAT Column */}
                  <td className="sticky left-0 z-10 bg-slate-200 px-3 py-2 text-center font-medium border border-gray-300 shadow-sm">
                    {row.fat.toFixed(1)}
                  </td>

                  {/* SNF Rate Cells */}
                  {row.snfRates.map((cell, snfIndex) => (
                    <td key={snfIndex} className="border border-gray-300 p-0">
                      <input
                        type="text"
                        value={cell.rate}
                        onChange={(e) => handleChange(fatIndex, snfIndex, e.target.value)}
                        className="w-full h-full min-w-[70px] px-2 py-2 text-center border-none outline-none bg-transparent focus:bg-blue-50 focus:ring-2 focus:ring-blue-400 focus:ring-inset transition-all duration-150"
                        placeholder="0"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-sm text-gray-600 flex justify-between">
        <span>Total Rows: {FAT_VALUES.length} | Total Columns: {SNF_VALUES.length + 1}</span>
        <span>FAT Range: {FAT_VALUES[0]} - {FAT_VALUES[FAT_VALUES.length - 1]} | SNF Range: {SNF_VALUES[0]} - {SNF_VALUES[SNF_VALUES.length - 1]}</span>
      </div>
    </div>
  );
};

export default RateChartPage;
