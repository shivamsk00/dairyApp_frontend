/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { Loader2 } from 'lucide-react'
import cx from '../utils/cx'
import '../ui.css'

/**
 * Gradient action button.
 *
 * @param {'primary'|'secondary'|'danger'|'success'|'warning'|'info'} [variant='primary']
 * @param {'sm'|'md'} [size='md']
 * @param {React.ComponentType} [icon] Leading icon component, e.g. a lucide-react icon.
 * @param {boolean} [loading] Shows a spinner and disables the button.
 * @param {boolean} [fullWidth]
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  fullWidth = false,
  type = 'button',
  disabled,
  className,
  children,
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={cx(
      'ui-btn inline-flex',
      `ui-btn-${variant}`,
      size === 'sm' && 'ui-btn-sm',
      fullWidth && 'w-full',
      className
    )}
    {...rest}
  >
    {loading ? (
      <Loader2 size={13} className="animate-spin" />
    ) : (
      Icon && <Icon size={13} aria-hidden="true" />
    )}
    {children}
  </button>
)

export default Button
