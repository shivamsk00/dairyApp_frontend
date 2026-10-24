/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { useEffect, useState } from 'react'
import { Braces, Check, Download, FileDown, FileText, FileType, Sheet } from 'lucide-react'
import Modal from '../primitives/Modal'
import Button from '../primitives/Button'
import IconBadge from '../primitives/IconBadge'
import cx from '../utils/cx'

const DEFAULT_FORMATS = [
  { value: 'CSV', icon: FileText },
  { value: 'Excel', icon: Sheet },
  { value: 'PDF', icon: FileType },
  { value: 'JSON', icon: Braces }
]

const DEFAULT_SCOPES = [
  { value: 'all', label: 'All records' },
  { value: 'filtered', label: 'Current filtered view' }
]

/**
 * Export dialog: choose a format and scope → ready state. The caller generates the file in
 * `onExport` (for example with the `xlsx` package already used by the app).
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {(format: string, scope: string) => Promise<void> | void} onExport A rejection keeps the
 *   form open and shows the error message.
 * @param {string} [title='Export']
 * @param {Array<{value: string, label?: string, icon?: React.ComponentType}>} [formats]
 *   Defaults to CSV, Excel, PDF and JSON.
 * @param {Array<{value: string, label: string, count?: number}>} [scopes]
 *   Defaults to "All records" and "Current filtered view". `count` is shown in brackets.
 * @param {(format: string) => void} [onDownload] Adds a "Download File" button to the ready state.
 */
const ExportModal = ({
  isOpen,
  onClose,
  onExport,
  title = 'Export',
  formats = DEFAULT_FORMATS,
  scopes = DEFAULT_SCOPES,
  onDownload
}) => {
  const [format, setFormat] = useState(formats[0]?.value)
  const [scope, setScope] = useState(scopes[0]?.value)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setFormat(formats[0]?.value)
      setScope(scopes[0]?.value)
      setBusy(false)
      setDone(false)
      setError('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when opening
  }, [isOpen])

  const startExport = async () => {
    setBusy(true)
    setError('')
    try {
      await onExport?.(format, scope)
      setDone(true)
    } catch (err) {
      setError(err?.message || 'Export failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={done ? undefined : title}
      ariaLabel={title}
      maxWidth="440px"
      dismissible={!busy}
      className="p-5"
    >
      {done ? (
        <div className="flex flex-col items-center py-4 text-center">
          <IconBadge icon={Check} tone="success" size="xl" shape="circle" className="mb-3" />
          <p className="ui-font-display text-[15px] font-bold">{format} export ready</p>
          <p className="ui-text-tertiary mt-1 text-[12.5px]">
            {onDownload ? 'Your file is ready to download.' : 'Your export has finished.'}
          </p>
          <div className="mt-5 flex w-full items-center gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Close
            </Button>
            {onDownload && (
              <Button className="flex-1" icon={Download} onClick={() => onDownload(format)}>
                Download File
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <p className="ui-text-tertiary mb-2 text-[11.5px] font-semibold uppercase tracking-wide">
            Format
          </p>
          <div
            className="mb-4 grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${Math.min(formats.length, 4)}, minmax(0, 1fr))`
            }}
          >
            {formats.map(({ value, label, icon: Icon = FileText }) => (
              <button
                key={value}
                type="button"
                aria-pressed={format === value}
                onClick={() => setFormat(value)}
                className={cx(
                  'flex flex-col items-center gap-1.5 rounded-lg p-2.5 transition-colors',
                  format === value ? 'ui-bg-brand' : 'ui-bg-sunken ui-text-secondary'
                )}
              >
                <Icon size={16} aria-hidden="true" />
                <span className="text-[11px] font-semibold">{label ?? value}</span>
              </button>
            ))}
          </div>

          <p className="ui-text-tertiary mb-2 text-[11.5px] font-semibold uppercase tracking-wide">
            Scope
          </p>
          <div className="mb-4 space-y-2">
            {scopes.map((option) => (
              <label
                key={option.value}
                className="ui-bg-sunken flex cursor-pointer items-center gap-2 rounded-lg p-2 text-[12.5px] font-medium"
              >
                <input
                  type="radio"
                  name="ui-export-scope"
                  checked={scope === option.value}
                  onChange={() => setScope(option.value)}
                  className="accent-[color:var(--ui-primary-600)]"
                />
                {option.label}
                {typeof option.count === 'number' && (
                  <span className="ui-text-tertiary">({option.count})</span>
                )}
              </label>
            ))}
          </div>

          {error && (
            <p className="mb-3 text-[12px] font-semibold text-[color:var(--ui-danger-600)]">
              {error}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button className="flex-1" icon={FileDown} loading={busy} onClick={startExport}>
              Export
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}

export default ExportModal
