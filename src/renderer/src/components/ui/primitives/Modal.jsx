/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import ReactModal from 'react-modal'
import { X } from 'lucide-react'
import IconButton from './IconButton'
import cx from '../utils/cx'
import '../ui.css'

// Same app element the existing CustomerList modal registers; lets react-modal hide the app from
// screen readers while a dialog is open.
if (typeof document !== 'undefined' && document.getElementById('root')) {
  ReactModal.setAppElement('#root')
}

/**
 * Dialog shell built on react-modal: overlay, focus handling, Esc / overlay-click to close, and the
 * design-system dialog styling (accent bar, rise animation).
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {string} [title] Renders a header row with a close button.
 * @param {string} [ariaLabel] Accessible name when there is no title.
 * @param {string} [maxWidth='28rem'] Any CSS length.
 * @param {boolean} [dismissible=true] Allow Esc / overlay click / close button.
 * @param {string} [className] Classes for the dialog body (padding, alignment).
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  ariaLabel,
  maxWidth = '28rem',
  dismissible = true,
  className,
  children
}) => (
  <ReactModal
    isOpen={isOpen}
    onRequestClose={dismissible ? onClose : undefined}
    shouldCloseOnEsc={dismissible}
    shouldCloseOnOverlayClick={dismissible}
    closeTimeoutMS={200}
    contentLabel={title || ariaLabel}
    overlayClassName={{
      base: 'ui-modal-overlay',
      afterOpen: 'ui-modal-overlay--open',
      beforeClose: 'ui-modal-overlay--closing'
    }}
    className={{
      base: cx('ui-modal-dialog', className),
      afterOpen: 'ui-modal-dialog--open',
      beforeClose: ''
    }}
    style={{ content: { maxWidth } }}
  >
    {title && (
      <div className="mb-4 flex items-center justify-between">
        <h2 className="ui-font-display text-[15px] font-bold">{title}</h2>
        {dismissible && <IconButton icon={X} label="Close" onClick={onClose} />}
      </div>
    )}
    {children}
  </ReactModal>
)

export default Modal
