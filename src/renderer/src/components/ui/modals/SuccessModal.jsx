/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { Check } from 'lucide-react'
import Modal from '../primitives/Modal'
import Button from '../primitives/Button'
import IconBadge from '../primitives/IconBadge'

/**
 * Success acknowledgement dialog ("Saved", "Report sent"…).
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {string} [title='Done']
 * @param {React.ReactNode} [message]
 * @param {string} [buttonLabel='Okay']
 */
const SuccessModal = ({ isOpen, onClose, title = 'Done', message, buttonLabel = 'Okay' }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    ariaLabel={title}
    maxWidth="360px"
    className="flex flex-col items-center p-6 text-center"
  >
    <IconBadge icon={Check} tone="success" size="xl" shape="circle" className="mb-3" />
    <p className="ui-font-display text-[15px] font-bold">{title}</p>
    {message && <p className="ui-text-tertiary mt-1.5 text-[12.5px]">{message}</p>}
    <Button fullWidth className="mt-5" onClick={onClose}>
      {buttonLabel}
    </Button>
  </Modal>
)

export default SuccessModal
