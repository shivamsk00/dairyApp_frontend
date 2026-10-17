/* eslint-disable react/prop-types -- FontScaleControl and PreviewSidebar are internal to this page */
import { useState } from 'react'
import { Building2, Check, Palette, RotateCcw, Save, Type, UserRound } from 'lucide-react'
import useAuthStore from '../../zustand/useAuthStore'
import CustomToast from '../../helper/costomeToast'
import {
  DEFAULT_SCALES,
  FONT_PRESETS,
  MAX_SCALE,
  MIN_SCALE,
  resetFontScales,
  setFontScales,
  useFontScales
} from '../../helper/fontScale'
import { SIDEBAR_THEMES, setSidebarTheme, useSidebarTheme } from '../../helper/sidebarTheme'
import { loadSettings, saveSettings } from './settingsStorage'
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Input,
  SectionCard,
  SegmentedControl,
  useDocumentTitle
} from '../../components/ui'

const percent = (scale) => Math.round(scale * 100)

// Presets + a fine-tune slider for one scale (whole software, or the sidebar on top of it).
const FontScaleControl = ({ title, hint, value, onChange, label }) => (
  <div className="ui-border-subtle rounded-lg border p-4">
    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
      <div>
        <p className="text-[13.5px] font-bold">{title}</p>
        <p className="ui-text-tertiary text-[12px]">{hint}</p>
      </div>
      <Badge tone={value === 1 ? 'neutral' : 'primary'} dot={false}>
        {percent(value)}%{value === 1 ? ' · Default' : ''}
      </Badge>
    </div>
    <SegmentedControl
      ariaLabel={`${title} size`}
      options={FONT_PRESETS}
      value={FONT_PRESETS.some((p) => p.value === value) ? value : ''}
      onChange={onChange}
    />
    <div className="mt-4 flex items-center gap-3">
      <span className="ui-text-tertiary text-[12px] font-semibold">A</span>
      <input
        type="range"
        aria-label={`${label} (percent)`}
        min={percent(MIN_SCALE)}
        max={percent(MAX_SCALE)}
        step={5}
        value={percent(value)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="ui-range flex-1 cursor-pointer"
      />
      <span className="ui-text-tertiary text-[18px] font-semibold">A</span>
    </div>
  </div>
)

const PreviewSidebar = () => (
  <div className="ui-sidebar-scope ui-sidebar-surface w-full max-w-[16rem] rounded-lg border border-[color:var(--ui-sidebar-border)] p-3">
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--ui-sidebar-group)]">
      Main
    </p>
    {['Dashboard', 'Milk Center', 'Customers'].map((item, i) => (
      <div
        key={item}
        className={`rounded-md px-2.5 py-1.5 text-[13.5px] font-medium ${i === 0 ? 'bg-[color:var(--ui-sidebar-tint-8)] text-[color:var(--ui-sidebar-text-active)]' : 'text-[color:var(--ui-sidebar-text)]'}`}
      >
        {item}
      </div>
    ))}
  </div>
)

// A small sidebar drawn in the given theme (the colours come from the data-sidebar-theme attribute).
const ThemePreview = ({ theme }) => (
  <div
    data-sidebar-theme={theme}
    className="ui-sidebar-surface w-full rounded-lg border border-[color:var(--ui-sidebar-border)] p-2.5"
  >
    <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--ui-sidebar-group)]">
      Main
    </p>
    <div className="rounded-md bg-[color:var(--ui-sidebar-tint-8)] px-2 py-1 text-[12px] font-semibold text-[color:var(--ui-sidebar-text-active)]">
      Dashboard
    </div>
    <div className="px-2 py-1 text-[12px] font-medium text-[color:var(--ui-sidebar-text)]">
      Milk Center
    </div>
    <div className="px-2 py-1 text-[12px] font-medium text-[color:var(--ui-sidebar-text)]">
      Customers
    </div>
  </div>
)

const Setting = () => {
  useDocumentTitle('Settings')
  const user = useAuthStore((state) => state.user)
  const scales = useFontScales()
  const sidebarTheme = useSidebarTheme()
  const [settings, setSettings] = useState(loadSettings)

  const owner = {
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || ''
  }

  const set = (name, value) => setSettings((prev) => ({ ...prev, [name]: value }))
  const handleChange = (e) => set(e.target.name, e.target.value)

  const handleSave = (e) => {
    e.preventDefault()
    try {
      saveSettings(settings)
      CustomToast.success('Settings saved on this computer')
    } catch {
      CustomToast.error('Could not save the settings')
    }
  }

  return (
    <div className="ui-text-primary w-full">
      <Breadcrumb title="Settings" items={[{ label: 'Home', to: '/' }, { label: 'Settings' }]} />

      <form
        onSubmit={handleSave}
        noValidate
        className="mx-auto max-w-6xl space-y-5 p-3 sm:p-4 lg:p-6"
      >
        <SectionCard
          title="Business Info"
          subtitle="Owner details come from your account"
          icon={Building2}
          tone="primary"
        >
          <div className="mb-5 flex flex-wrap items-center gap-4">
            <Avatar name={owner.name || owner.email || 'Owner'} className="size-14 text-[18px]" />
            <div className="min-w-[8rem] flex-1">
              <p className="ui-font-display text-[17px] font-extrabold">{owner.name || 'Owner'}</p>
              <p className="ui-text-tertiary text-[12.5px]">Account owner</p>
            </div>
            <Badge tone="info" icon={UserRound} dot={false}>
              From your account
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Owner Name"
              type="text"
              value={owner.name}
              readOnly
              disabled
              placeholder="—"
            />
            <Input
              label="Email Address"
              type="email"
              value={owner.email}
              readOnly
              disabled
              placeholder="—"
            />
            <Input
              label="Contact Number"
              type="tel"
              value={owner.mobile}
              readOnly
              disabled
              placeholder="—"
            />
            <Input
              label="Dairy Name"
              type="text"
              name="dairyName"
              value={settings.dairyName}
              onChange={handleChange}
              placeholder="Dairy Name"
            />
            <Input
              label="Address"
              type="text"
              name="address"
              value={settings.address}
              onChange={handleChange}
              placeholder="Address"
              fieldClassName="md:col-span-2"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Font Size"
          subtitle="Make the text bigger or smaller. Changes apply instantly and are remembered on this computer."
          icon={Type}
          tone="accent"
          action={
            <Button
              type="button"
              size="sm"
              variant="secondary"
              icon={RotateCcw}
              disabled={
                scales.base === DEFAULT_SCALES.base && scales.sidebar === DEFAULT_SCALES.sidebar
              }
              onClick={() => {
                resetFontScales()
                CustomToast.success('Font sizes reset to default')
              }}
            >
              Reset to default
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <FontScaleControl
                title="Whole software"
                hint="Pages, forms, tables, header and footer"
                label="Whole software font size"
                value={scales.base}
                onChange={(value) => setFontScales({ base: value })}
              />
              <p className="ui-text-secondary ui-bg-sunken rounded-lg p-4 text-[14px]">
                The quick brown fox jumps over the lazy dog — ₹1,250.00 · 12.5 L · FAT 4.1 / SNF 8.6
              </p>
            </div>
            <div className="space-y-3">
              <FontScaleControl
                title="Sidebar"
                hint="The menu on the left, on top of the software size"
                label="Sidebar font size"
                value={scales.sidebar}
                onChange={(value) => setFontScales({ sidebar: value })}
              />
              <PreviewSidebar />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Sidebar Colour"
          subtitle="Choose the colour of the menu on the left. Applies instantly."
          icon={Palette}
          tone="info"
        >
          <div
            role="radiogroup"
            aria-label="Sidebar colour"
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {SIDEBAR_THEMES.map((theme) => {
              const selected = sidebarTheme === theme.value
              return (
                <button
                  key={theme.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setSidebarTheme(theme.value)}
                  className={`rounded-xl border-2 p-3 text-left transition-colors ${selected ? 'border-[color:var(--ui-primary-500)] bg-[color:var(--ui-primary-50)]' : 'ui-border-subtle hover:border-[color:var(--ui-border-strong)]'}`}
                >
                  <ThemePreview theme={theme.value} />
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[13.5px] font-bold">{theme.label}</p>
                      <p className="ui-text-tertiary text-[12px]">{theme.hint}</p>
                    </div>
                    {selected && (
                      <Badge tone="primary" icon={Check} dot={false}>
                        Selected
                      </Badge>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </SectionCard>

        <div className="flex justify-end">
          <Button type="submit" icon={Save}>
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  )
}

export default Setting
