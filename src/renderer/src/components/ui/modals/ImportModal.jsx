/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { useEffect, useState } from 'react'
import { Check, FileCheck2, FileUp } from 'lucide-react'
import Modal from '../primitives/Modal'
import Button from '../primitives/Button'
import IconBadge from '../primitives/IconBadge'
import cx from '../utils/cx'

const initialOptions = (options) =>
  Object.fromEntries(options.map((option) => [option.id, Boolean(option.defaultChecked)]))

/**
 * File import dialog: drop zone → progress → done. The component only collects the file; the
 * caller does the actual import in `onImport`.
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {(file: File, options: Record<string, boolean>) => Promise<void> | void} onImport
 *   May return a promise; the progress step stays on screen until it settles. A rejection returns to
 *   the file step and shows the error message.
 * @param {string} [title='Import']
 * @param {string} [accept='.csv,.xlsx,.json'] Passed to the file input.
 * @param {number} [maxSizeMB=10] Files larger than this are rejected before `onImport` runs.
 * @param {string} [hint] Line under the drop zone; defaults to the accepted types and size limit.
 * @param {Array<{id: string, label: string, defaultChecked?: boolean}>} [options] Checkboxes passed
 *   back to `onImport`, e.g. [{ id: 'skipDuplicates', label: 'Skip duplicate entries', defaultChecked: true }].
 * @param {() => void} [onDownloadTemplate] Shows a "Download template" link when provided.
 * @param {number} [progress] 0–100 while importing. Without it the bar animates indeterminately.
 * @param {string} [doneMessage='Your file has been processed successfully.']
 */
const ImportModal = ({
  isOpen,
  onClose,
  onImport,
  title = 'Import',
  accept = '.csv,.xlsx,.json',
  maxSizeMB = 10,
  hint,
  options = [],
  onDownloadTemplate,
  progress,
  doneMessage = 'Your file has been processed successfully.'
}) => {
  const [step, setStep] = useState('select')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [checked, setChecked] = useState(() => initialOptions(options))

  // Start fresh every time the dialog opens.
  useEffect(() => {
    if (isOpen) {
      setStep('select')
      setFile(null)
      setError('')
      setChecked(initialOptions(options))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when opening
  }, [isOpen])

  const pickFile = (candidate) => {
    if (!candidate) return
    if (candidate.size > maxSizeMB * 1024 * 1024) {
      setFile(null)
      setError(`File is larger than ${maxSizeMB}MB.`)
      return
    }
    setError('')
    setFile(candidate)
  }

  const startImport = async () => {
    setStep('progress')
    try {
      await onImport?.(file, checked)
      setStep('done')
    } catch (err) {
      setError(err?.message || 'Import failed. Please try again.')
      setStep('select')
    }
  }

  const types = accept
    .split(',')
    .map((type) => type.replace('.', '').toUpperCase())
    .join(', ')
  const percent = typeof progress === 'number' ? Math.min(100, Math.max(0, progress)) : null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'done' ? undefined : title}
      ariaLabel={title}
      maxWidth="460px"
      dismissible={step !== 'progress'}
      className="p-5"
    >
      {step === 'select' && (
        <>
          <label
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              pickFile(event.dataTransfer.files?.[0])
            }}
            className={cx(
              'ui-bg-sunken flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-colors',
              dragging ? 'border-[color:var(--ui-primary-500)]' : 'ui-border-default'
            )}
          >
            <span className="grid size-11 place-items-center rounded-full bg-[color:var(--ui-primary-100)] text-[color:var(--ui-primary-700)]">
              <FileUp size={18} aria-hidden="true" />
            </span>
            <span className="block text-[12.5px] font-semibold">Drag &amp; drop a file here</span>
            <span className="ui-text-tertiary block text-[11.5px]">
              or <span className="ui-text-brand font-semibold">browse to upload</span>
            </span>
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={(event) => pickFile(event.target.files?.[0])}
            />
          </label>

          {file && (
            <p className="mt-3 flex items-center gap-2 text-[12px] font-semibold">
              <FileCheck2 size={13} className="text-[color:var(--ui-success-600)]" />
              <span className="truncate">{file.name}</span>
            </p>
          )}
          {error && (
            <p className="mt-3 text-[12px] font-semibold text-[color:var(--ui-danger-600)]">
              {error}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="ui-text-tertiary text-[11.5px]">
              {hint ?? `Supports ${types} · max ${maxSizeMB}MB`}
            </p>
            {onDownloadTemplate && (
              <button
                type="button"
                onClick={onDownloadTemplate}
                className="ui-text-brand shrink-0 text-[11.5px] font-semibold"
              >
                Download template
              </button>
            )}
          </div>

          {options.length > 0 && (
            <div className="mt-4 space-y-2">
              {options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-2 text-[12.5px] font-medium"
                >
                  <input
                    type="checkbox"
                    checked={checked[option.id] ?? false}
                    onChange={(event) =>
                      setChecked((current) => ({ ...current, [option.id]: event.target.checked }))
                    }
                    className="size-4 rounded accent-[color:var(--ui-primary-600)]"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          )}

          <div className="mt-5 flex items-center gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" disabled={!file} onClick={startImport}>
              Import
            </Button>
          </div>
        </>
      )}

      {step === 'progress' && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[12.5px] font-semibold">Importing…</p>
            {percent !== null && (
              <span className="ui-text-brand text-[12px] font-semibold">
                {Math.round(percent)}%
              </span>
            )}
          </div>
          <div className="ui-bg-sunken h-2 overflow-hidden rounded-full">
            <div
              className={cx(
                'ui-bg-brand h-full rounded-full transition-all',
                percent === null && 'w-1/3 animate-pulse'
              )}
              style={percent === null ? undefined : { width: `${percent}%` }}
            />
          </div>
          <p className="ui-text-tertiary mt-2 text-[11.5px]">Validating rows…</p>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center py-2 text-center">
          <IconBadge icon={Check} tone="success" size="xl" shape="circle" className="mb-3" />
          <p className="ui-font-display text-[15px] font-bold">Import complete</p>
          <p className="ui-text-tertiary mt-1 text-[12.5px]">{doneMessage}</p>
          <Button fullWidth className="mt-5" onClick={onClose}>
            Done
          </Button>
        </div>
      )}
    </Modal>
  )
}

export default ImportModal
