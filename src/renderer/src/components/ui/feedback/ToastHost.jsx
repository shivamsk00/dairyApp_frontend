import { ToastContainer } from 'react-toastify'
import { Frown, Info, Loader2, Meh, Smile, X } from 'lucide-react'
import cx from '../utils/cx'
import '../ui.css'

// A face for the two outcomes people care about most, and the bold title shown over the message.
const TONES = {
  success: { icon: Smile, tone: 'success', title: 'Successful' },
  error: { icon: Frown, tone: 'danger', title: 'Oh snap' },
  warning: { icon: Meh, tone: 'warning', title: 'Heads up' },
  info: { icon: Info, tone: 'info', title: 'Good to know' },
  default: { icon: Info, tone: 'primary', title: 'Notice' }
}

/**
 * Drop-in replacement for react-toastify's <ToastContainer />, styled with the kit: a white card with a
 * coloured strip on top, a face icon, a bold title ("Successful", "Oh snap"...) over the message, and a
 * close button. Several toasts pile up as a stack (hover the stack to spread them out).
 *
 * Mount it once at the root. Every `toast.*()` call in the app is restyled — including calls that
 * ask for `theme: 'colored'` or `'dark'` — so existing call sites need no changes.
 * Any ToastContainer prop (position, autoClose, limit…) can be passed to override the defaults.
 */
const ToastHost = (props) => (
  <ToastContainer
    position="top-right"
    autoClose={3500}
    limit={5}
    stacked
    closeOnClick
    pauseOnHover
    draggable
    theme="light"
    toastClassName={({ type, defaultClassName }) =>
      cx(defaultClassName, 'ui-toast', `ui-toast-${type ?? 'default'}`)
    }
    progressClassName={({ defaultClassName }) => cx(defaultClassName, 'ui-toast-progress')}
    icon={({ type, isLoading }) => {
      // The icon and the title are both returned here: react-toastify puts the message itself right
      // after them, and the grid in ui.css lays the three out as icon | title over message.
      if (isLoading) {
        return (
          <>
            <span className="ui-toast-icon ui-toast-icon-primary">
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            </span>
            <strong className="ui-toast-title">Please wait</strong>
          </>
        )
      }
      const { icon: Icon, tone, title } = TONES[type] ?? TONES.default
      return (
        <>
          <span className={`ui-toast-icon ui-toast-icon-${tone}`}>
            <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <strong className="ui-toast-title">{title}</strong>
        </>
      )
    }}
    closeButton={({ closeToast }) => (
      <button
        type="button"
        className="ui-toast-close"
        aria-label="Close notification"
        onClick={closeToast}
      >
        <X size={15} aria-hidden="true" />
      </button>
    )}
    {...props}
  />
)

export default ToastHost
