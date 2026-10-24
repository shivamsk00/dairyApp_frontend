/* eslint-disable react/prop-types -- Var is an internal helper */
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

// Each value has its own colour, reused in the formula so it is obvious which input does what.
const VARIABLES = [
  { name: 'A', tone: 'primary', title: 'Divisor', hint: 'CLR is divided by this' },
  { name: 'B', tone: 'accent', title: 'FAT factor', hint: 'Multiplies the FAT' },
  { name: 'C', tone: 'info', title: 'Constant', hint: 'Added at the end' }
]

const Var = ({ tone, children }) => (
  <span
    className={`ui-soft-${tone} inline-flex items-center rounded-md px-2 py-0.5 font-extrabold`}
  >
    {children}
  </span>
)

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
  const valid = Object.keys(errors).length === 0
  const part1 = valid ? exampleClr / Number(formValues.A) : null
  const part2 = valid ? Number(formValues.B) * exampleFat : null
  const part3 = valid ? Number(formValues.C) : null
  const example = valid ? part1 + part2 + part3 : null
  const fix = (n, d = 2) => (Math.round(n * 10 ** d) / 10 ** d).toFixed(d)

  return (
    <div className="w-full ui-text-primary">
      <Breadcrumb
        title="SNF Chart"
        items={[{ label: 'Home', to: '/' }, { label: 'Milk Center' }, { label: 'SNF Chart' }]}
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <form onSubmit={handleSave} noValidate>
          <SectionCard
            title="SNF Formula Settings"
            subtitle="Used to build the chart below"
            icon={Calculator}
            tone="primary"
          >
            <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              {/* Left: the three values */}
              <div className="ui-border-subtle flex flex-col rounded-xl border p-5">
                <p className="ui-text-tertiary mb-4 text-[11px] font-bold uppercase tracking-wider">
                  Formula values
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {VARIABLES.map(({ name, tone, title, hint }) => (
                    <Input
                      key={name}
                      label={
                        <span className="inline-flex items-center gap-2">
                          <Badge
                            tone={tone}
                            dot={false}
                            className="!px-2 !py-0.5 !text-[11px] !font-extrabold"
                          >
                            {name}
                          </Badge>
                          {title}
                        </span>
                      }
                      type="number"
                      name={name}
                      step="any"
                      value={formValues[name]}
                      onChange={handleChange}
                      error={shown(name)}
                      hint={hint}
                    />
                  ))}
                </div>
                <div className="ui-border-subtle mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                  <span className="ui-text-tertiary text-[12px]">
                    The chart below previews your values. Save to keep them.
                  </span>
                  <div className="flex gap-2">
                    <Button type="submit" icon={Save} loading={saving}>
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      icon={RotateCcw}
                      onClick={handleReset}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right: the formula with colour-matched variables and a worked example */}
              <div className="flex flex-col rounded-xl border border-[color:var(--ui-primary-100)] bg-gradient-to-br from-[color:var(--ui-primary-50)] to-white p-5">
                <p className="ui-text-tertiary mb-3 text-[11px] font-bold uppercase tracking-wider">
                  Formula
                </p>
                <p className="ui-font-display flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[19px] font-extrabold">
                  <span>(CLR</span>
                  <span className="ui-text-tertiary">/</span>
                  <Var tone="primary">A</Var>
                  <span>)</span>
                  <span className="ui-text-tertiary">+</span>
                  <span>(</span>
                  <Var tone="accent">B</Var>
                  <span className="ui-text-tertiary">×</span>
                  <span>FAT)</span>
                  <span className="ui-text-tertiary">+</span>
                  <Var tone="info">C</Var>
                </p>

                <div className="ui-border-subtle mt-4 border-t pt-4">
                  <p className="ui-text-tertiary mb-2 text-[11px] font-semibold uppercase tracking-wide">
                    Example · CLR {exampleClr}, FAT {exampleFat.toFixed(1)}
                  </p>
                  {valid ? (
                    <div className="space-y-1.5 text-[13px]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="ui-text-secondary">
                          {exampleClr} ÷ <Var tone="primary">{formValues.A}</Var>
                        </span>
                        <span className="font-semibold tabular-nums">{fix(part1)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="ui-text-secondary">
                          <Var tone="accent">{formValues.B}</Var> × {exampleFat.toFixed(1)}
                        </span>
                        <span className="font-semibold tabular-nums">+ {fix(part2)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="ui-text-secondary">
                          <Var tone="info">{formValues.C}</Var>
                        </span>
                        <span className="font-semibold tabular-nums">+ {fix(part3)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="ui-text-tertiary text-[12.5px]">
                      Enter valid values for A, B and C to see an example.
                    </p>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <span className="text-[12px] font-bold uppercase tracking-wide">
                    Result · SNF
                  </span>
                  <span className="ui-font-display text-[26px] font-extrabold leading-none text-[color:var(--ui-primary-700)]">
                    {example === null ? '—' : fix(example, 1)}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>
        </form>

        <Chart formValues={formValues} trigger={saveTrigger} />
      </div>
    </div>
  )
}

export default SnfChartPage
