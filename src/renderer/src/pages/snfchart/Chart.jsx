/* eslint-disable react/prop-types -- internal component; props are documented by usage */
import { useEffect, useState } from 'react'
import { FileText, Grid3x3 } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import { Badge, Button, DataTable, SectionCard } from '../../components/ui'
import { exportTablePdf } from '../../helper/tablePdf'

const clrValues = Array.from({ length: 9 }, (_, i) => 22 + i) // 22 to 30
const fatValues = Array.from({ length: 71 }, (_, i) => (3.0 + i * 0.1).toFixed(1)) // 3.0 to 10.0

const Chart = ({ formValues, trigger }) => {
  const snfChartDataFetch = useHomeStore((state) => state.snfChartDataFetch)

  const [snfTable, setSnfTable] = useState([])

  const calculateSnf = (clr, fat, A, B, C) => {
    const snf = clr / A + B * fat + Number(C)
    return (Math.round(snf * 10) / 10).toFixed(1) // round to one decimal
  }

  useEffect(() => {
    if (
      isNaN(formValues.A) ||
      isNaN(formValues.B) ||
      isNaN(formValues.C) ||
      Number(formValues.A) === 0
    ) {
      setSnfTable([])
      return
    }

    const table = fatValues.map((fat) => {
      return clrValues.map((clr) => {
        const snf = calculateSnf(clr, parseFloat(fat), formValues.A, formValues.B, formValues.C)
        return snf
      })
    })

    setSnfTable(table)
  }, [formValues, trigger])

  const fetchSnfData = async () => {
    try {
      const transformedData = fatValues.map((fat, rowIdx) => {
        const row = { fat: parseFloat(fat) }
        clrValues.forEach((clr, colIdx) => {
          row[`clr_${clr}`] = parseFloat(snfTable[rowIdx]?.[colIdx] ?? 0)
        })
        return row
      })

      const res = await snfChartDataFetch(transformedData)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
      } else {
        CustomToast.error(res.message)
      }
    } catch (error) {
      console.error('Error sending SNF data:', error)
      CustomToast.error('Failed to update SNF chart.')
    }
  }

  useEffect(() => {
    if (trigger > 0) {
      fetchSnfData()
    }
  }, [trigger])

  // The chart as shown (the saved values are not needed: it is worked out from A, B and C)
  const exportPdf = () =>
    exportTablePdf({
      report: 'SNF Chart',
      landscape: false,
      dense: true,
      title: 'SNF Chart',
      details: [
        ['Formula', '(CLR / A) + (B x FAT) + C'],
        ['A, B, C', `${formValues.A}, ${formValues.B}, ${formValues.C}`]
      ],
      columns: [
        { header: 'FAT / CLR', key: true, get: (row) => row.fat },
        ...clrValues.map((clr, j) => ({ header: String(clr), align: 'c', get: (row) => row.cells[j] ?? '' }))
      ],
      rows: snfTable.length ? rows : []
    })

  const rows = fatValues.map((fat, rowIdx) => ({ id: fat, fat, cells: snfTable[rowIdx] ?? [] }))
  const columns = [
    {
      key: 'fat',
      header: 'FAT / CLR',
      render: (row) => <span className="font-bold">{row.fat}</span>
    },
    ...clrValues.map((clr, colIdx) => ({
      key: `clr-${clr}`,
      header: clr,
      className: 'text-center',
      render: (row) => row.cells[colIdx] ?? ''
    }))
  ]

  return (
    <SectionCard
      title="SNF Chart"
      subtitle="SNF for every FAT (3.0–10.0) and CLR (22–30) combination"
      icon={Grid3x3}
      tone="info"
      action={
        <div className="flex items-center gap-2">
          <Badge tone="neutral" dot={false}>
            {fatValues.length} × {clrValues.length}
          </Badge>
          <Button size="sm" variant="secondary" icon={FileText} onClick={exportPdf}>
            Export PDF
          </Button>
        </div>
      }
    >
      <DataTable
        stickyHeader
        striped
        className="max-h-[64vh] overflow-y-auto"
        minWidth="760px"
        columns={columns}
        rows={snfTable.length ? rows : []}
        emptyMessage="Enter valid A, B and C values to see the chart"
      />
    </SectionCard>
  )
}

export default Chart
