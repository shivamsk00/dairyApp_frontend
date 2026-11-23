/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { CircleHelp } from 'lucide-react'
import Modal from '../primitives/Modal'
import Button from '../primitives/Button'
import IconBadge from '../primitives/IconBadge'

/**
 * Generic confirmation dialog (approve, archive, change status…). The tone colours the icon and the
 * confirm button.
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {() => void} onConfirm
 * @param {string} [title='Confirm']
 * @param {React.ReactNode} [message]
 * @param {React.ComponentType} [icon=CircleHelp] lucide-react icon.
 * @param {'primary'|'success'|'warning'|'danger'|'info'} [tone='primary']
 * @param {string} [confirmLabel='Confirm']
 * @param {boolean} [loading]
 * @param {React.ReactNode} [children] Extra content between the message and the buttons (e.g. a select).
 */
const ConfirmActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  icon = CircleHelp,
  tone = 'primary',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  children
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    ariaLabel={title}
    maxWidth="360px"
    dismissible={!loading}
    className="flex flex-col items-center p-6 text-center"
  >
    <IconBadge icon={icon} tone={tone} variant="tint" size="lg" shape="circle" className="mb-4" />
    <p className="ui-font-display mb-1 text-[15px] font-bold">{title}</p>
    {message && <p className="ui-text-tertiary mb-4 text-[12.5px]">{message}</p>}
    {children}
    <div className="flex w-full items-center gap-2">
      <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button variant={tone} className="flex-1" onClick={onConfirm} loading={loading}>
        {confirmLabel}
      </Button>
    </div>
  </Modal>
)

export default ConfirmActionModal
