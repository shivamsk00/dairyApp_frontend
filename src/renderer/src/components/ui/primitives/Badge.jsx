/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import cx from '../utils/cx'
import '../ui.css'

/**
 * Small status label.
 *
 * @param {'primary'|'success'|'warning'|'danger'|'info'|'accent'|'neutral'} [tone='primary']
 * @param {React.ComponentType} [icon] Optional leading icon; without one a status dot is shown.
 * @param {boolean} [dot=true] Show the leading dot when there is no icon.
 */
const Badge = ({ tone = 'primary', icon: Icon, dot = true, className, children }) => (
  <span className={cx('ui-badge inline-flex', `ui-soft-${tone}`, className)}>
    {Icon ? (
      <Icon size={10} aria-hidden="true" />
    ) : (
      dot && <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
    )}
    {children}
  </span>
)

export default Badge
