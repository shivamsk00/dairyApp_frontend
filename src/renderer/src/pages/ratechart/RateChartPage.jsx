/* eslint-disable react/prop-types -- RateRow is internal to this page */
import { memo, useCallback, useEffect, useState, useRef } from 'react'
import {
  CircleCheck,
  Columns3,
  Download,
  IndianRupee,
  Loader2,
  Rows3,
  Save,
  ScanText,
  Undo2,
  Upload,
  X
} from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import * as XLSX from 'xlsx'
import {
  Breadcrumb,
  Button,
  KpiCard,
  Modal,
  SurfaceCard,
  todayISO,
  useDocumentTitle
} from '../../components/ui'
import logExport from '../../helper/auditExport'
import { scanRateImage } from '../../helper/ocrRateChart'
import ImageCropper, { FULL_CROP } from '../../components/ImageCropper'
import { UNREADABLE } from '../../helper/ocrParse'

// Constants - Fixed to handle 7.2 to 10.2 range properly
const SNF_VALUES = []
for (let i = 8.0; i <= 9.5; i += 0.1) {
  SNF_VALUES.push(parseFloat(i.toFixed(1)))
}
const FAT_VALUES = Array.from({ length: 71 }, (_, i) => parseFloat((3.0 + i * 0.1).toFixed(1)))

const initialData = FAT_VALUES.map((fat) => ({
  fat,
  snfRates: SNF_VALUES.map((snf) => ({ snf, rate: '' }))
}))

const isInvalidRate = (value) =>
  value !== '' && value !== null && value !== undefined && isNaN(Number(value))

// One FAT row of the grid. Memoised: typing in a cell re-renders only that row, not all 71.
// `marks` says which cells a scan filled ('ocr') or wants checked ('check'); editing a cell clears its mark.
const RateRow = memo(function RateRow({ row, fatIndex, marks, onChange }) {
  return (
    <tr className="hover:bg-[color:var(--ui-surface-sunken)]">
      <td className="ui-bg-sunken ui-border-subtle sticky left-0 z-10 border-b border-r px-3 py-1.5 text-center font-bold">
        {row.fat.toFixed(1)}
      </td>
      {row.snfRates.map((cell, snfIndex) => (
        <td key={snfIndex} className="ui-border-subtle border-b p-0">
          <input
            type="text"
            inputMode="decimal"
            value={cell.rate}
            onChange={(e) => onChange(fatIndex, snfIndex, e.target.value)}
            aria-label={`Rate for FAT ${row.fat.toFixed(1)}, SNF ${cell.snf.toFixed(1)}`}
            aria-invalid={isInvalidRate(cell.rate) || undefined}
            data-mark={marks?.[snfIndex]}
            placeholder="0"
            className="h-9 w-full min-w-[64px] border-0 bg-transparent px-1 text-center outline-none transition-colors placeholder:text-[color:var(--ui-neutral-300)] focus:bg-[color:var(--ui-primary-50)] focus:shadow-[inset_0_0_0_2px_var(--ui-primary-500)] data-[mark=ocr]:bg-[color:var(--ui-warning-50)] data-[mark=check]:bg-[color:var(--ui-danger-50)] data-[mark=check]:font-bold aria-[invalid=true]:bg-[color:var(--ui-danger-50)] aria-[invalid=true]:text-[color:var(--ui-danger-700)]"
          />
        </td>
      ))}
    </tr>
  )
})

const RateChartPage = () => {
  useDocumentTitle('SNF Rate Chart')
  const [rateData, setRateData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [debugging, setDebugging] = useState(false)
  const rateChartDataFetch = useHomeStore((state) => state.rateChartDataFetch)
  const fetchRateChartData = useHomeStore((state) => state.fetchRateChartData)
  const fileInputRef = useRef(null)
  const scanInputRef = useRef(null)
  // Picture scan: progress, the result summary, the grid before the scan (for Undo) and the cell marks.
  const [scan, setScan] = useState({ state: 'idle' })
  const [marks, setMarks] = useState({})
  const beforeScanRef = useRef(null)
  // The picture chosen for scanning, shown with a crop box before it is read.
  const [picture, setPicture] = useState(null) // { file, url, width, height }
  const [crop, setCrop] = useState(FULL_CROP)

  // Release the preview address only when the picture changes or goes away (not when its size loads).
  const pictureUrl = picture?.url
  useEffect(() => () => pictureUrl && URL.revokeObjectURL(pictureUrl), [pictureUrl])

  // Utility function to safely convert value to number
  const safeToNumber = (value) => {
    if (value === null || value === undefined || value === '') return null
    if (typeof value === 'number') return value
    const numVal = parseFloat(value)
    return isNaN(numVal) ? null : numVal
  }

  const handleChange = useCallback((fatIndex, snfIndex, value) => {
    setMarks((prev) => {
      if (!prev[fatIndex]?.[snfIndex]) return prev
      const { [snfIndex]: _reviewed, ...rest } = prev[fatIndex]
      return { ...prev, [fatIndex]: rest }
    })
    setRateData((prev) =>
      prev.map((row, i) =>
        i !== fatIndex
          ? row
          : {
              ...row,
              snfRates: row.snfRates.map((cell, j) =>
                j === snfIndex ? { ...cell, rate: value } : cell
              )
            }
      )
    )
  }, [])

  // Fill the grid from a picture of a price list. Nothing is saved until the user presses Save.
  const handlePickPicture = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      CustomToast.error('Please choose a picture (JPG or PNG).')
      return
    }
    if (file.size > 25 * 1024 * 1024) {
      CustomToast.error('That picture is too large (limit 25 MB).')
      return
    }
    setPicture({ file, url: URL.createObjectURL(file), width: 0, height: 0 })
    setCrop(FULL_CROP)
    setScan({ state: 'crop' })
  }

  const cancelPicture = () => {
    setPicture(null)
    setScan({ state: 'idle' })
  }

  // Step 2: read the (cropped) picture.
  const handleScan = async () => {
    if (!picture) return
    const { file } = picture
    setScan({ state: 'working', percent: 3, text: 'Preparing the picture…' })
    try {
      const result = await scanRateImage(file, (stage) => {
        if (stage.step === 'prepare') setScan({ state: 'working', percent: 5, text: 'Preparing the picture…' })
        if (stage.step === 'read')
          setScan({
            state: 'working',
            percent: 8 + Math.round(((stage.done || 0) / (stage.total || 1)) * 88),
            text: stage.total ? `Reading the table… ${stage.done || 0} of ${stage.total}` : 'Reading the table…'
          })
        if (stage.step === 'check') setScan({ state: 'working', percent: 98, text: 'Checking the numbers…' })
      }, crop)
      if (result.error) {
        // Stay on the picture, so the box can be adjusted and the scan tried again.
        setScan({ state: 'crop', message: result.error })
        return
      }

      // Put the prices into the grid (only SNF columns and FAT rows the grid has).
      const nextMarks = {}
      let filled = 0
      let needCheck = 0
      const next = rateData.map((row) => ({ ...row, snfRates: row.snfRates.map((c) => ({ ...c })) }))
      for (const scanned of result.rows) {
        const fatIndex = Math.round((scanned.fat - FAT_VALUES[0]) * 10)
        if (fatIndex < 0 || fatIndex >= next.length) continue
        scanned.cells.forEach((value, j) => {
          const snfIndex = SNF_VALUES.findIndex((v) => Math.abs(v - result.snfColumns[j]) < 0.01)
          if (snfIndex === -1 || value === null) return
          const flagged = value === UNREADABLE || result.flagged.has(`${scanned.fat}|${j}`)
          if (value !== UNREADABLE) {
            next[fatIndex].snfRates[snfIndex].rate = value
            filled++
          }
          if (flagged) needCheck++
          nextMarks[fatIndex] = { ...(nextMarks[fatIndex] || {}), [snfIndex]: flagged ? 'check' : 'ocr' }
        })
      }
      beforeScanRef.current = rateData
      setPicture(null)
      setRateData(next)
      setMarks(nextMarks)
      setScan({
        state: 'done',
        filled,
        needCheck,
        missing: result.missing,
        range: `${result.rows[0].fat.toFixed(1)} – ${result.rows[result.rows.length - 1].fat.toFixed(1)}`
      })
    } catch (error) {
      console.error('Scan failed:', error)
      setScan({ state: 'crop', message: 'The picture could not be read. Adjust the box, or try a clearer or larger picture.' })
    }
  }

  const undoScan = () => {
    if (beforeScanRef.current) setRateData(beforeScanRef.current)
    beforeScanRef.current = null
    setMarks({})
    setScan({ state: 'idle' })
  }

  const handleSave = async () => {
    // A non-numeric cell would otherwise be silently saved as empty.
    const invalid = rateData.reduce(
      (n, row) => n + row.snfRates.filter((c) => isInvalidRate(c.rate)).length,
      0
    )
    if (invalid > 0) {
      CustomToast.error(
        `${invalid} ${invalid === 1 ? 'cell has' : 'cells have'} a value that is not a number (highlighted in red).`
      )
      return
    }
    setLoading(true)
    try {
      const cleanedData = rateData.map((row) => ({
        fat: row.fat,
        snfRates: row.snfRates.map((cell) => ({
          snf: cell.snf,
          rate: cell.rate !== '' ? safeToNumber(cell.rate) || '' : ''
        }))
      }))

      const updatedData = await rateChartDataFetch({ rateData: cleanedData })

      if (updatedData) {
        const transformedData = updatedData.map((item) => ({
          fat: parseFloat(item.fat),
          snfRates: SNF_VALUES.map((snf) => {
            const key = `snf_${snf.toFixed(1).replace('.', '_')}`
            return {
              snf,
              rate: item[key] ?? ''
            }
          })
        }))

        setRateData(transformedData)
        setMarks({})
        beforeScanRef.current = null
        setScan((s) => (s.state === 'done' ? { state: 'idle' } : s))
        CustomToast.success('Rates saved and updated!')
      } else {
        CustomToast.error('Failed to fetch updated data.')
      }
    } catch (error) {
      console.error('Error saving rate chart:', error)
      CustomToast.error('Error saving rates.')
    } finally {
      setLoading(false)
    }
  }

  // Flexible import function that works with any SNF columns
  const handleImport = (event) => {
    const file = event.target.files[0]

    if (!file) {
      CustomToast.error('No file selected.')
      return
    }

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (
      !validTypes.includes(file.type) &&
      !file.name.endsWith('.xlsx') &&
      !file.name.endsWith('.xls')
    ) {
      CustomToast.error('Please select a valid Excel file (.xlsx or .xls)')
      return
    }

    setDebugging(true)
    console.log('🔍 Starting file read process...')

    const reader = new FileReader()

    reader.onerror = (error) => {
      console.error('❌ FileReader error:', error)
      CustomToast.error('Error reading file')
      setDebugging(false)
    }

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)

        if (data.length === 0) {
          throw new Error('File is empty or corrupted')
        }

        const workbook = XLSX.read(data, { type: 'array' })

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('No sheets found in the Excel file')
        }

        const sheet = workbook.Sheets[workbook.SheetNames[0]]

        // Convert to JSON with proper handling
        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          raw: true,
          defval: ''
        })

        if (jsonData.length < 2) {
          throw new Error('Excel file needs at least header row and one data row')
        }

        // Get headers - Excel structure: [empty/label, 8, 8.1, 8.2, ...]
        const headers = jsonData[0]

        // Skip first column and get all SNF headers
        const snfHeaders = headers.slice(1).filter((h) => h !== null && h !== undefined && h !== '')

        if (snfHeaders.length === 0) {
          throw new Error('No SNF headers found in first row')
        }

        // Create mapping for available headers with flexible matching
        const headerMap = new Map()
        snfHeaders.forEach((header, index) => {
          let numericValue

          if (typeof header === 'number') {
            numericValue = header
          } else if (typeof header === 'string') {
            numericValue = parseFloat(header.trim())
          }

          if (!isNaN(numericValue) && numericValue > 0) {
            // Round to 1 decimal place to handle precision issues
            const roundedValue = parseFloat(numericValue.toFixed(1))
            headerMap.set(roundedValue, index + 1) // +1 because we skip first column
          } else {
            console.warn(`🔍 Skipping invalid header: "${header}"`)
          }
        })

        if (headerMap.size === 0) {
          throw new Error(`No valid numeric headers found. Headers were: ${snfHeaders.join(', ')}`)
        }

        // Check how many of our expected SNF values match
        const matchedSnfValues = SNF_VALUES.filter((snf) => headerMap.has(snf))

        if (matchedSnfValues.length === 0) {
          // No exact matches, let's see what we can use
          const availableHeaders = Array.from(headerMap.keys()).sort((a, b) => a - b)

          CustomToast.error(
            `Excel headers (${availableHeaders.join(', ')}) don't match expected SNF range (${SNF_VALUES[0]} to ${SNF_VALUES[SNF_VALUES.length - 1]}). Please check your Excel file headers.`
          )
          return
        }

        // Process data rows
        const dataRows = jsonData.slice(1)

        // Filter out empty rows
        const validDataRows = dataRows.filter(
          (row) =>
            row &&
            row.length > 0 &&
            row.some((cell) => cell !== null && cell !== undefined && cell !== '')
        )

        if (validDataRows.length > 0) {
          console.log('🔍 Sample data rows:', validDataRows.slice(0, 3))
        }

        // Build new rate data
        const newRateData = FAT_VALUES.map((fat) => {
          // Find row with matching FAT value
          const excelRow = validDataRows.find((row) => {
            const rowFat = safeToNumber(row[0])
            if (rowFat === null) return false

            const difference = Math.abs(rowFat - fat)
            const isMatch = difference < 0.01

            if (isMatch) {
              console.log(`🔍 Found match for FAT ${fat}: Excel row has ${rowFat}`)
            }

            return isMatch
          })

          return {
            fat,
            snfRates: SNF_VALUES.map((snf) => {
              let rate = ''

              // Check if this SNF value exists in Excel headers
              if (headerMap.has(snf) && excelRow) {
                const columnIndex = headerMap.get(snf)
                const cellValue = excelRow[columnIndex]

                if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                  const numValue = safeToNumber(cellValue)
                  if (numValue !== null) {
                    rate = cellValue.toString()
                  }
                }
              }

              return { snf, rate }
            })
          }
        })

        // Count imported cells
        let importedCells = 0

        newRateData.forEach((row) => {
          row.snfRates.forEach((cell) => {
            if (headerMap.has(cell.snf)) {
              if (cell.rate !== '') {
                importedCells++
              }
            }
          })
        })

        if (importedCells === 0) {
          const availableHeaders = Array.from(headerMap.keys()).sort((a, b) => a - b)
          const expectedHeaders = matchedSnfValues.sort((a, b) => a - b)

          throw new Error(
            `No data imported!\n` +
              `Excel headers found: ${availableHeaders.join(', ')}\n` +
              `Matching expected headers: ${expectedHeaders.join(', ')}\n` +
              `Valid data rows: ${validDataRows.length}\n` +
              `Please check that your Excel file has numeric data in the matching columns.`
          )
        }

        setRateData(newRateData)
        CustomToast.success(
          `Successfully imported ${importedCells} values from ${validDataRows.length} rows! (${matchedSnfValues.length}/${SNF_VALUES.length} columns matched)`
        )

        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } catch (error) {
        console.error('❌ Import Error:', error)
        CustomToast.error(`Import failed: ${error.message}`)
      } finally {
        setDebugging(false)
      }
    }

    reader.readAsArrayBuffer(file)
  }

  const handleExport = () => {
    try {
      // Prepare data for export
      const exportData = [
        // Header row
        ['FAT / SNF', ...SNF_VALUES.map((snf) => snf.toFixed(1))],
        // Data rows
        ...rateData.map((row) => [
          row.fat.toFixed(1),
          ...row.snfRates.map((cell) => cell.rate || '')
        ])
      ]

      const worksheet = XLSX.utils.aoa_to_sheet(exportData)

      // Set column widths
      const colWidths = [{ wch: 10 }] // FAT column
      for (let i = 0; i < SNF_VALUES.length; i++) {
        colWidths.push({ wch: 8 }) // SNF columns
      }
      worksheet['!cols'] = colWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rate Chart')

      const filename = `SNF_Rate_Chart_${todayISO()}.xlsx`
      XLSX.writeFile(workbook, filename)
      logExport('Rate Chart', 'xlsx')

      CustomToast.success(`Data exported successfully as ${filename}!`)
    } catch (error) {
      console.error('Export error:', error)
      CustomToast.error('Failed to export data.')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const data = await fetchRateChartData()
        if (data && data.length > 0) {
          const merged = FAT_VALUES.map((fat) => {
            const match = data.find((item) => Math.abs(parseFloat(item.fat) - fat) < 0.01)
            return {
              fat,
              snfRates: SNF_VALUES.map((snf) => {
                const key = `snf_${snf.toFixed(1).replace('.', '_')}`
                return { snf, rate: match ? (match[key] ?? '') : '' }
              })
            }
          })
          setRateData(merged)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        CustomToast.error('Failed to load rate chart data.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [fetchRateChartData])

  const filledCount = rateData.reduce(
    (sum, row) =>
      sum + row.snfRates.filter((cell) => cell.rate !== '' && cell.rate !== null).length,
    0
  )
  const totalCells = FAT_VALUES.length * SNF_VALUES.length

  return (
    <div className="w-full ui-text-primary">
      <Breadcrumb
        title="SNF Rate Chart"
        items={[{ label: 'Home', to: '/' }, { label: 'Milk Center' }, { label: 'Rate Chart' }]}
        actions={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={handleImport}
              id="excel-input"
            />
            <input
              ref={scanInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handlePickPicture}
              id="ocr-input"
            />
            <Button
              size="sm"
              variant="secondary"
              icon={ScanText}
              disabled={scan.state === 'working'}
              onClick={() => scanInputRef.current?.click()}
            >
              Scan picture
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={Upload}
              loading={debugging}
              onClick={() => fileInputRef.current?.click()}
            >
              {debugging ? 'Processing…' : 'Import Excel'}
            </Button>
            <Button size="sm" variant="secondary" icon={Download} onClick={handleExport}>
              Export Excel
            </Button>
            <Button size="sm" icon={Save} loading={loading} onClick={handleSave}>
              Save
            </Button>
          </>
        }
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <KpiCard
            label="FAT Rows"
            value={FAT_VALUES.length}
            icon={Rows3}
            tone="info"
            details={[
              {
                label: 'Range',
                value: `${FAT_VALUES[0].toFixed(1)} – ${FAT_VALUES[FAT_VALUES.length - 1].toFixed(1)}`
              }
            ]}
          />
          <KpiCard
            label="SNF Columns"
            value={SNF_VALUES.length}
            icon={Columns3}
            tone="primary"
            details={[
              {
                label: 'Range',
                value: `${SNF_VALUES[0].toFixed(1)} – ${SNF_VALUES[SNF_VALUES.length - 1].toFixed(1)}`
              }
            ]}
          />
          <KpiCard
            label="Rates Filled"
            value={filledCount}
            icon={CircleCheck}
            tone="success"
            details={[{ label: 'Of', value: totalCells }]}
          />
          <KpiCard
            label="Coverage"
            value={`${totalCells ? Math.round((filledCount / totalCells) * 100) : 0}%`}
            icon={IndianRupee}
            tone="accent"
            details={[{ label: 'Empty cells', value: totalCells - filledCount }]}
          />
        </div>

        {scan.state !== 'idle' && scan.state !== 'crop' && (
          <SurfaceCard className="p-4" role="status" aria-live="polite">
            {scan.state === 'working' && (
              <>
                <div className="flex items-center gap-2 text-[13px] font-semibold">
                  <Loader2 size={15} className="animate-spin" aria-hidden="true" /> {scan.text}
                </div>
                <div className="ui-bg-sunken mt-2 h-2 overflow-hidden rounded-full">
                  <div className="ui-bg-brand h-full rounded-full transition-all duration-300" style={{ width: `${scan.percent}%` }} />
                </div>
              </>
            )}
            {scan.state === 'error' && (
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] text-[color:var(--ui-danger-600)]">{scan.message}</p>
                <Button size="sm" variant="secondary" icon={X} onClick={() => setScan({ state: 'idle' })}>
                  Close
                </Button>
              </div>
            )}
            {scan.state === 'done' && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1 text-[13px]">
                  <p className="font-bold">
                    Scan finished: {scan.filled} prices filled (FAT {scan.range}). Nothing is saved yet.
                  </p>
                  <p className="ui-text-secondary">
                    <span className="mr-1 inline-block size-3 rounded-sm align-middle bg-[color:var(--ui-warning-50)] ring-1 ring-[color:var(--ui-warning-500)]" />
                    yellow = read from the picture.{' '}
                    <span className="mr-1 inline-block size-3 rounded-sm align-middle bg-[color:var(--ui-danger-50)] ring-1 ring-[color:var(--ui-danger-500)]" />
                    red = please check
                    {scan.needCheck ? ` (${scan.needCheck} price${scan.needCheck === 1 ? '' : 's'})` : ''}. Editing a price clears its colour.
                  </p>
                  {scan.missing.length > 0 && (
                    <p className="text-[color:var(--ui-danger-600)]">
                      Rows not read, fill them by hand: FAT {scan.missing.map((f) => f.toFixed(1)).join(', ')}.
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="secondary" icon={Undo2} onClick={undoScan}>
                    Undo scan
                  </Button>
                  <Button size="sm" variant="secondary" icon={X} onClick={() => setScan({ state: 'idle' })}>
                    Hide
                  </Button>
                </div>
              </div>
            )}
          </SurfaceCard>
        )}

        <SurfaceCard className="overflow-hidden">
          <div className="ui-scroll-thin max-h-[68vh] overflow-auto">
            <table className="ui-stripe-rows w-full border-separate border-spacing-0 text-[12.5px]">
              <thead>
                <tr>
                  <th className="ui-bg-sunken ui-border-subtle ui-text-secondary sticky left-0 top-0 z-30 min-w-[84px] border-b border-r px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide">
                    FAT / SNF
                  </th>
                  {SNF_VALUES.map((snf) => (
                    <th
                      key={snf}
                      className="ui-bg-sunken ui-border-subtle ui-text-secondary sticky top-0 z-20 min-w-[64px] whitespace-nowrap border-b px-2 py-2.5 text-center text-[11px] font-bold"
                    >
                      {snf.toFixed(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rateData.map((row, fatIndex) => (
                  <RateRow key={row.fat} row={row} fatIndex={fatIndex} marks={marks[fatIndex]} onChange={handleChange} />
                ))}
              </tbody>
            </table>
          </div>
        </SurfaceCard>
      </div>

      {/* Picture preview with the crop box. Mounted only while a picture is waiting to be read. */}
      <Modal
        isOpen={scan.state === 'crop' && !!picture}
        onClose={cancelPicture}
        title="Choose the part to read"
        maxWidth="56rem"
        className="space-y-3"
      >
        {picture && (
          <>
            <p className="ui-text-secondary text-[12.5px]">
              Drag the box to move it, drag its corners or sides to resize it, or drag on the picture to draw a new
              one. Keep the row of SNF numbers (8.3, 8.4, …) at the top and the FAT numbers on the left, and leave out
              the title and the notes at the bottom.
            </p>
            <ImageCropper
              src={picture.url}
              crop={crop}
              onChange={setCrop}
              onLoad={(size) => setPicture((p) => (p ? { ...p, ...size } : p))}
            />
            {scan.message && <p className="text-[13px] text-[color:var(--ui-danger-600)]">{scan.message}</p>}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="ui-text-tertiary text-[12px]">
                {picture.width
                  ? `Selected: ${Math.round(crop.w * picture.width)} × ${Math.round(crop.h * picture.height)} px of ${picture.width} × ${picture.height}`
                  : ' '}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setCrop(FULL_CROP)}>
                  Whole picture
                </Button>
                <Button size="sm" variant="secondary" icon={X} onClick={cancelPicture}>
                  Cancel
                </Button>
                <Button size="sm" icon={ScanText} onClick={handleScan}>
                  Read table
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal>

      <Modal
        isOpen={loading}
        onClose={() => {}}
        dismissible={false}
        ariaLabel="Processing"
        maxWidth="260px"
        className="flex items-center gap-3 p-5"
      >
        <Loader2 size={20} className="ui-text-brand animate-spin" aria-hidden="true" />
        <span className="text-[13px] font-semibold">Processing…</span>
      </Modal>
    </div>
  )
}

export default RateChartPage
