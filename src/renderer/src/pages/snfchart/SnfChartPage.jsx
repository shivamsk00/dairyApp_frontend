import { useEffect, useState } from 'react'
import { Calculator, RotateCcw, Save } from 'lucide-react'
import Chart from './Chart'
import useHomeStore from '../../zustand/useHomeStore'
import CustomToast from '../../helper/costomeToast'
import {
  Badge,
  Breadcrumb,
  Button,
  Input,
  SectionCard,
  useDocumentTitle
} from '../../components/ui'

const DEFAULTS = { A: 4, B: 0.2, C: 0.66 }

// One message per field, or '' when the value is fine.
const validate = (values) => {
  const errors = {}
  for (const name of ['A', 'B', 'C']) {
    const raw = values[name]
    if (raw === '' || raw === null || raw === undefined) errors[name] = 'Enter a number'
    else if (isNaN(Number(raw))) errors[name] = 'Enter a valid number'
  }
  // The formula divides CLR by A.
  if (!errors.A && Number(values.A) === 0) errors.A = 'A cannot be 0 (the formula divides by A)'
  return errors
}

const SnfChartPage = () => {
  useDocumentTitle('SNF Chart')
  const [formValues, setFormValues] = useState(DEFAULTS)
  const [touched, setTouched] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveTrigger, setSaveTrigger] = useState(0)
  const snfFormulaDataFetch = useHomeStore((state) => state.snfFormulaDataFetch)
  const getSnfFormulaData = useHomeStore((state) => state.getSnfFormulaData)

  const errors = validate(formValues)
  const shown = (name) => (touched[name] ? errors[name] : undefined)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormValues({
      ...formValues,
      [name]: value
    })
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setTouched({ A: true, B: true, C: true })
    if (Object.keys(errors).length) return

    const formulaData = [
      { A: parseFloat(formValues.A) },
      { B: parseFloat(formValues.B) },
      { C: parseFloat(formValues.C) }
    ]

    setSaving(true)
    try {
      const res = await snfFormulaDataFetch(formulaData)
      if (res.status_code == 200) {
        CustomToast.success(res.message)
      } else {
        CustomToast.error(res.message)
      }

      setSaveTrigger((prev) => prev + 1)
    } catch (error) {
      CustomToast.error(error?.message || 'Failed to save the formula')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setFormValues(DEFAULTS)
    setTouched({})
  }

  useEffect(() => {
    const fetchFormula = async () => {
      const data = await getSnfFormulaData()
      if (data) {
        setFormValues({
          A: data.A,
          B: data.B,
          C: data.C
        })
      }
    }

    fetchFormula()
  }, [])

  // Worked example so the effect of A, B and C is visible while editing.
  const exampleClr = 26
  const exampleFat = 4
  const example =
    Object.keys(errors).length === 0
      ? exampleClr / Number(formValues.A) + Number(formValues.B) * exampleFat + Number(formValues.C)
      : null

  return (
    <div className="w-full ui-text-primary">
      <Breadcrumb
        title="SNF Chart"
        items={[{ label: 'Home', to: '/' }, { label: 'Milk Center' }, { label: 'SNF Chart' }]}
      />

      <div className="grid grid-cols-1 gap-5 p-3 sm:p-4 lg:grid-cols-3 lg:p-6">
        <form onSubmit={handleSave} noValidate className="lg:col-span-1">
          <SectionCard
            title="SNF Formula Settings"
            subtitle="Used to build the chart on the right"
            icon={Calculator}
            tone="primary"
          >
            <div className="ui-bg-sunken mb-4 rounded-lg px-4 py-3 text-center">
              <p className="ui-text-tertiary text-[11px] font-semibold uppercase tracking-wide">
                Formula
              </p>
              <p className="ui-font-display mt-1 text-[16px] font-bold">
                (CLR / A) + (B × FAT) + C
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Value for A"
                type="number"
                name="A"
                step="any"
                value={formValues.A}
                onChange={handleChange}
                error={shown('A')}
              />
              <Input
                label="Value for B"
                type="number"
                name="B"
                step="any"
                value={formValues.B}
                onChange={handleChange}
                error={shown('B')}
              />
              <Input
                label="Value for C"
                type="number"
                name="C"
                step="any"
                value={formValues.C}
                onChange={handleChange}
                error={shown('C')}
              />
            </div>

            <div className="ui-border-subtle mt-4 flex items-center justify-between rounded-lg border px-4 py-3">
              <span className="ui-text-tertiary text-[12px]">
                Example: CLR {exampleClr}, FAT {exampleFat.toFixed(1)}
              </span>
              {example === null ? (
                <span className="ui-text-tertiary text-[12px]">—</span>
              ) : (
                <Badge tone="primary" dot={false}>
                  SNF {(Math.round(example * 10) / 10).toFixed(1)}
                </Badge>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <Button type="submit" className="flex-1" icon={Save} loading={saving}>
                Save
              </Button>
              <Button variant="secondary" className="flex-1" icon={RotateCcw} onClick={handleReset}>
                Reset
              </Button>
            </div>
          </SectionCard>
        </form>

        <div className="lg:col-span-2">
          <Chart formValues={formValues} trigger={saveTrigger} />
        </div>
      </div>
    </div>
  )
}

export default SnfChartPage
