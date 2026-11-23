/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { Trash2 } from 'lucide-react'
import Modal from '../primitives/Modal'
import Button from '../primitives/Button'
import IconBadge from '../primitives/IconBadge'

/**
 * "Are you sure?" dialog for destructive actions.
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {() => void} onConfirm Called when the user confirms; close the modal yourself when done.
 * @param {string} [title='Delete Item?']
 * @param {React.ReactNode} [message='This action cannot be undone.']
 * @param {string} [confirmLabel='Delete']
 * @param {boolean} [loading] Disables both buttons and shows a spinner while deleting.
 */
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    ariaLabel={title}
    maxWidth="360px"
    dismissible={!loading}
    className="flex flex-col items-center p-6 text-center"
  >
    <IconBadge
      icon={Trash2}
      tone="danger"
      variant="tint"
      size="xl"
      shape="circle"
      className="mb-3"
    />
    <p className="ui-font-display text-[15px] font-bold">{title}</p>
    <p className="ui-text-tertiary mt-1.5 text-[12.5px]">{message}</p>
    <div className="mt-5 flex w-full items-center gap-3">
      <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button variant="danger" fullWidth onClick={onConfirm} loading={loading}>
        {confirmLabel}
      </Button>
    </div>
  </Modal>
)

export default DeleteConfirmModal
