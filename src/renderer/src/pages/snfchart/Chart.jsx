/* eslint-disable react/prop-types -- internal component; props are documented by usage */
import { useEffect, useState } from 'react'
import { Grid3x3 } from 'lucide-react'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import { Badge, DataTable, SectionCard } from '../../components/ui'

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
        <Badge tone="neutral" dot={false}>
          {fatValues.length} × {clrValues.length}
        </Badge>
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
