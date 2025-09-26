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

  // Fixed Import Function with detailed debugging
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
    
    // Add error handler
    reader.onerror = (error) => {
      console.error("❌ FileReader error:", error);
      CustomToast.error("Error reading file");
      setDebugging(false);
    };

    // Add loadstart handler for debugging
    reader.onloadstart = () => {
      console.log("🔍 FileReader started loading...");
    };

    // Add progress handler for debugging
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        console.log(`🔍 Loading progress: ${(event.loaded / event.total * 100).toFixed(2)}%`);
      }
    };

    // Main load handler with comprehensive error handling
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
        const jsonData = XLSX.utils.sheet_to_json(sheet, { 
          header: 1, 
          defval: '',
          raw: false // This ensures all values are strings initially
        });

        console.log("🔍 Raw JSON data:", jsonData.slice(0, 3)); // Show first 3 rows

        if (jsonData.length < 2) {
          throw new Error("Excel file must have at least 2 rows (header + data)");
        }

        // Process headers with better error handling
        const headerRow = jsonData[0];
        console.log("🔍 Header row:", headerRow);
        
        if (!headerRow || headerRow.length < 2) {
          throw new Error("Invalid header row in Excel file");
        }

        // Extract and validate SNF headers with improved logic
        const rawSnfHeaders = headerRow.slice(1);
        console.log("🔍 Raw SNF headers:", rawSnfHeaders);
        
        const excelSnfValues = rawSnfHeaders
          .map(val => {
            // Handle different input formats
            if (val === null || val === undefined || val === '') return null;
            
            // Try to parse as number
            let numVal;
            if (typeof val === 'string') {
              // Remove any extra whitespace
              val = val.trim();
              numVal = parseFloat(val);
            } else if (typeof val === 'number') {
              numVal = val;
            } else {
              return null;
            }
            
            if (isNaN(numVal)) return null;
            
            // Round to 1 decimal place
            return parseFloat(numVal.toFixed(1));
          })
          .filter(val => val !== null);

        console.log("🔍 Processed SNF headers:", excelSnfValues);

        const expectedSnfValues = SNF_VALUES.map(snf => parseFloat(snf.toFixed(1)));
        console.log("🔍 Expected SNF values:", expectedSnfValues.slice(0, 5), "...");

        // More flexible header matching
        if (excelSnfValues.length !== expectedSnfValues.length) {
          throw new Error(`SNF column count mismatch. Expected: ${expectedSnfValues.length}, Found: ${excelSnfValues.length}`);
        }

        // Check if headers match with some tolerance
        const tolerance = 0.01;
        const headersMatch = excelSnfValues.every((snf, i) => {
          const expected = expectedSnfValues[i];
          const diff = Math.abs(snf - expected);
          return diff < tolerance;
        });

        if (!headersMatch) {
          const mismatchDetails = excelSnfValues.map((found, i) => ({
            index: i,
            expected: expectedSnfValues[i],
            found,
            match: Math.abs(found - expectedSnfValues[i]) < tolerance
          })).filter(item => !item.match);
          
          console.log("🔍 Header mismatches:", mismatchDetails);
          throw new Error(`SNF headers don't match expected values. First few mismatches: ${mismatchDetails.slice(0, 3).map(m => `Col ${m.index}: expected ${m.expected}, found ${m.found}`).join(', ')}`);
        }

        // Process data rows
        const dataRows = jsonData.slice(1);
        console.log("🔍 Processing", dataRows.length, "data rows");

        const newRateData = FAT_VALUES.map(fat => {
          // Find matching row in Excel data
          const matchingRowIndex = dataRows.findIndex(row => {
            if (!row || !row[0]) return false;
            
            const fatVal = parseFloat(row[0]);
            if (isNaN(fatVal)) return false;
            
            return Math.abs(parseFloat(fatVal.toFixed(1)) - fat) < 0.01;
          });

          let rowData = [];
          if (matchingRowIndex !== -1) {
            rowData = dataRows[matchingRowIndex].slice(1);
          }

          return {
            fat,
            snfRates: SNF_VALUES.map((snf, i) => {
              let rate = '';
              
              if (i < rowData.length && rowData[i] !== undefined && rowData[i] !== '') {
                const cellValue = rowData[i];
                const numValue = safeToNumber(cellValue);
                
                if (numValue !== null) {
                  rate = cellValue.toString();
                }
              }
              
              return { snf, rate };
            }),
          };
        });

        console.log("🔍 Processed rate data sample:", newRateData.slice(0, 2));

        setRateData(newRateData);
        CustomToast.success(`Excel data imported successfully! Processed ${dataRows.length} rows.`);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
      } catch (error) {
        console.error('❌ Import processing error:', error);
        CustomToast.error(`Import failed: ${error.message}`);
      } finally {
        setDebugging(false);
      }
    };

    // Start reading the file
    console.log("🔍 Starting to read file as ArrayBuffer...");
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
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rate Chart');
      
      XLSX.writeFile(workbook, `SNF_Rate_Chart_${new Date().toISOString().split('T')[0]}.xlsx`);
      CustomToast.success("Data exported successfully!");
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
          
          <button
            onClick={handleClear}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors duration-200 flex items-center gap-2"
          >
            🗑️ Clear
          </button>
          
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
            <span className="text-yellow-800 font-medium">Processing Excel file... Check console for detailed logs.</span>
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
