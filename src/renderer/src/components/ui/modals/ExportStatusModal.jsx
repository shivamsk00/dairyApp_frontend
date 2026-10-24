/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { Check, Loader2 } from 'lucide-react'
import Modal from '../primitives/Modal'
import Button from '../primitives/Button'
import IconBadge from '../primitives/IconBadge'

/**
 * Small progress dialog for one-click exports: a spinner while `status` is 'loading', then a
 * success state. Cannot be dismissed while loading.
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {'loading'|'done'} status
 * @param {string} [format='PDF'] Shown in the copy, e.g. "Exporting as PDF…".
 * @param {string} [doneMessage='Your file has been downloaded.']
 */
const ExportStatusModal = ({
  isOpen,
  onClose,
  status,
  format = 'PDF',
  doneMessage = 'Your file has been downloaded.'
}) => {
  const loading = status === 'loading'
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={loading ? `Exporting as ${format}` : `${format} export ready`}
      maxWidth="320px"
      dismissible={!loading}
      className="flex flex-col items-center p-6 text-center"
    >
      {loading ? (
        <>
          <span className="mb-3 grid size-11 place-items-center rounded-full bg-[color:var(--ui-primary-100)]">
            <Loader2 size={18} className="ui-text-brand animate-spin" aria-hidden="true" />
          </span>
          <p className="ui-font-display text-[14px] font-bold">Exporting as {format}…</p>
          <p className="ui-text-tertiary mt-1 text-[12.5px]">This will only take a moment.</p>
        </>
      ) : (
        <>
          <IconBadge icon={Check} tone="success" size="lg" shape="circle" className="mb-3" />
          <p className="ui-font-display text-[14px] font-bold">{format} export ready</p>
          <p className="ui-text-tertiary mb-5 mt-1 text-[12.5px]">{doneMessage}</p>
          <Button fullWidth onClick={onClose}>
            Close
          </Button>
        </>
      )}
    </Modal>
  )
}

export default ExportStatusModal
