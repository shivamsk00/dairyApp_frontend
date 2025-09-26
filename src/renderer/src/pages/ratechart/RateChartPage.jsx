import React, { useEffect, useState, useRef } from 'react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import * as XLSX from 'xlsx';

// Constants - Updated to match your database structure
const SNF_VALUES = [];
for (let i = 7.2; i <= 10.2; i += 0.1) {
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
            // Fixed key generation to match database structure
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

// Fixed import function to handle snf_X_Y format headers
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

  // Main load handler
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
      
      // Get sheet range
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
      console.log("🔍 Sheet range:", range);

      // Read header row directly
      const headerRow = [];
      const headerRowIndex = range.s.r; // First row
      
      console.log("🔍 Reading header row at index:", headerRowIndex);
      
      // Read all columns in the header row
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
        const cell = sheet[cellAddress];
        
        let cellValue = '';
        if (cell) {
          if (cell.t === 'n') { // number
            cellValue = cell.v;
          } else if (cell.t === 's') { // string
            cellValue = cell.v;
          } else if (cell.w) { // formatted value
            cellValue = cell.w;
          } else if (cell.v !== undefined) {
            cellValue = cell.v;
          }
        }
        
        console.log(`🔍 Cell ${cellAddress}: type=${cell?.t}, value=${cellValue}, raw=${cell?.v}`);
        headerRow.push(cellValue);
      }

      console.log("🔍 Complete header row:", headerRow);

      if (headerRow.length === 0) {
        throw new Error("No header row data found");
      }

      // Process SNF headers (skip first column which should be FAT/SNF label)
      const rawSnfHeaders = headerRow.slice(1);
      console.log("🔍 Raw SNF headers:", rawSnfHeaders);

      // Function to convert snf_X_Y format to decimal number
      const convertSnfHeaderToNumber = (header) => {
        if (typeof header !== 'string') return null;
        
        // Check if it matches snf_X_Y pattern
        const match = header.match(/^snf_(\d+)_(\d+)$/);
        if (match) {
          const wholePart = parseInt(match[1]);
          const decimalPart = parseInt(match[2]);
          const result = parseFloat(`${wholePart}.${decimalPart}`);
          console.log(`🔍 Converted "${header}" to ${result}`);
          return result;
        }
        
        // Try to parse as direct number
        const directNumber = parseFloat(header);
        if (!isNaN(directNumber)) {
          console.log(`🔍 Direct number "${header}" = ${directNumber}`);
          return directNumber;
        }
        
        console.log(`🔍 Could not parse header "${header}"`);
        return null;
      };

      // Process headers with conversion
      const processedHeaders = [];
      for (let i = 0; i < rawSnfHeaders.length; i++) {
        const val = rawSnfHeaders[i];
        
        console.log(`🔍 Processing header ${i}: "${val}" (type: ${typeof val})`);
        
        // Skip empty values
        if (val === null || val === undefined || val === '') {
          console.log(`🔍 Skipping empty header at index ${i}`);
          continue;
        }

        // Convert snf_X_Y format to decimal
        const numVal = convertSnfHeaderToNumber(val);
        
        if (numVal === null || isNaN(numVal) || numVal <= 0) {
          console.warn(`🔍 Invalid header at index ${i}: "${val}" -> ${numVal}`);
          continue;
        }
        
        // Round to 1 decimal place
        const rounded = parseFloat(numVal.toFixed(1));
        processedHeaders.push({ index: i, value: rounded, original: val });
        console.log(`🔍 Added valid header: ${rounded} (from "${val}") at index ${i}`);
      }

      console.log("🔍 Final processed headers:", processedHeaders);

      if (processedHeaders.length === 0) {
        throw new Error(`No valid SNF headers found. Raw headers were: ${rawSnfHeaders.slice(0, 10).join(', ')}... Expected format: snf_8_0, snf_8_1, etc. or direct numbers like 8.0, 8.1, etc.`);
      }

      // Validate against expected SNF range
      const minExpected = 7.2;
      const maxExpected = 10.2;
      const validHeaders = processedHeaders.filter(h => h.value >= minExpected && h.value <= maxExpected);
      
      console.log(`🔍 Headers in valid range (${minExpected}-${maxExpected}):`, validHeaders);

      if (validHeaders.length === 0) {
        throw new Error(`No SNF headers found in expected range ${minExpected}-${maxExpected}. Found: ${processedHeaders.map(h => `${h.value} (from "${h.original}")`).join(', ')}`);
      }

      // Create header mapping
      const headerMapping = validHeaders.map(h => ({
        excelIndex: h.index + 1, // +1 because we skipped first column
        snfValue: h.value,
        originalHeader: h.original
      }));

      console.log("🔍 Header mapping:", headerMapping);

      // Read data rows directly
      const dataRows = [];
      console.log(`🔍 Reading data rows from ${range.s.r + 1} to ${range.e.r}`);

      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        const rowData = [];
        
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = sheet[cellAddress];
          
          let cellValue = '';
          if (cell) {
            if (cell.t === 'n') { // number
              cellValue = cell.v;
            } else if (cell.t === 's') { // string
              cellValue = cell.v;
            } else if (cell.w) { // formatted value
              cellValue = cell.w;
            } else if (cell.v !== undefined) {
              cellValue = cell.v;
            }
          }
          
          rowData.push(cellValue);
        }
        
        // Only add rows that have some data
        if (rowData.some(val => val !== null && val !== undefined && val !== '')) {
          dataRows.push(rowData);
        }
      }

      console.log(`🔍 Read ${dataRows.length} data rows`);
      if (dataRows.length > 0) {
        console.log("🔍 Sample data rows:", dataRows.slice(0, 3));
      }

      // Build rate data using header mapping
      const newRateData = FAT_VALUES.map(fat => {
        // Find matching row in Excel data
        const matchingRowIndex = dataRows.findIndex(row => {
          if (!row || !row[0]) return false;
          
          const fatVal = safeToNumber(row[0]);
          if (fatVal === null) return false;
          
          return Math.abs(parseFloat(fatVal.toFixed(1)) - fat) < 0.01;
        });

        let rowData = [];
        if (matchingRowIndex !== -1) {
          rowData = dataRows[matchingRowIndex] || [];
        }

        return {
          fat,
          snfRates: SNF_VALUES.map((snf) => {
            let rate = '';
            
            // Find the corresponding column in Excel data using header mapping
            const mappingEntry = headerMapping.find(m => Math.abs(m.snfValue - snf) < 0.01);
            
            if (mappingEntry && mappingEntry.excelIndex < rowData.length) {
              const cellValue = rowData[mappingEntry.excelIndex];
              
              if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                const numValue = safeToNumber(cellValue);
                if (numValue !== null) {
                  rate = cellValue.toString();
                }
              }
            }
            
            return { snf, rate };
          }),
        };
      });

      // Count populated cells for feedback
      const populatedCells = newRateData.reduce((count, row) => 
        count + row.snfRates.filter(cell => cell.rate !== '').length, 0
      );

      console.log(`🔍 Import complete: ${populatedCells} cells populated out of ${newRateData.length * SNF_VALUES.length} total cells`);
      console.log(`🔍 Header mapping used:`, headerMapping.map(m => `${m.originalHeader} -> ${m.snfValue}`));

      setRateData(newRateData);
      CustomToast.success(`Excel data imported successfully! Processed ${dataRows.length} data rows, populated ${populatedCells} cells. Mapped ${headerMapping.length} SNF columns.`);
      
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
        // Header row - match the format from your screenshot
        ['FAT / SNF', ...SNF_VALUES.map(snf => snf.toFixed(1))],
        // Data rows
        ...rateData.map(row => [
          row.fat.toFixed(1),
          ...row.snfRates.map(cell => cell.rate || '')
        ])
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(exportData);
      
      // Add some styling to match your format
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      
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
