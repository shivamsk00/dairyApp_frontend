import { ToastContainer } from 'react-toastify'
import { Check, CircleAlert, Info, Loader2, TriangleAlert, X } from 'lucide-react'
import cx from '../utils/cx'
import '../ui.css'

const TONES = {
  success: { icon: Check, tone: 'success' },
  error: { icon: CircleAlert, tone: 'danger' },
  warning: { icon: TriangleAlert, tone: 'warning' },
  info: { icon: Info, tone: 'info' },
  default: { icon: Info, tone: 'primary' }
}

/**
 * Drop-in replacement for react-toastify's <ToastContainer />, styled with the kit (white card, tone
 * bar, gradient icon tile, matching progress bar and close button).
 *
 * Mount it once at the root. Every `toast.*()` call in the app is restyled — including calls that
 * ask for `theme: 'colored'` or `'dark'` — so existing call sites need no changes.
 * Any ToastContainer prop (position, autoClose, limit…) can be passed to override the defaults.
 */
const ToastHost = (props) => (
  <ToastContainer
    position="top-right"
    autoClose={3500}
    limit={4}
    newestOnTop
    closeOnClick
    pauseOnHover
    draggable
    theme="light"
    toastClassName={({ type, defaultClassName }) =>
      cx(defaultClassName, 'ui-toast', `ui-toast-${type ?? 'default'}`)
    }
    progressClassName={({ defaultClassName }) => cx(defaultClassName, 'ui-toast-progress')}
    icon={({ type, isLoading }) => {
      if (isLoading) {
        return (
          <span className="ui-toast-icon ui-solid-primary">
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          </span>
        )
      }
      const { icon: Icon, tone } = TONES[type] ?? TONES.default
      return (
        <span className={`ui-toast-icon ui-solid-${tone}`}>
          <Icon size={15} strokeWidth={2.5} aria-hidden="true" />
        </span>
      )
    }}
    closeButton={({ closeToast }) => (
      <button
        type="button"
        className="ui-toast-close"
        aria-label="Close notification"
        onClick={closeToast}
      >
        <X size={14} aria-hidden="true" />
      </button>
    )}
    {...props}
  />
)

export default ToastHost
