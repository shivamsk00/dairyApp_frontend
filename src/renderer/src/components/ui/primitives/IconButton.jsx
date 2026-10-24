/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import cx from '../utils/cx'
import '../ui.css'

/**
 * Square, icon-only toolbar button (close buttons, header actions).
 *
 * @param {React.ComponentType} icon Icon component, e.g. a lucide-react icon.
 * @param {string} label Accessible name (also used as the tooltip).
 * @param {number} [iconSize=16]
 */
const IconButton = ({ icon: Icon, label, iconSize = 16, type = 'button', className, ...rest }) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={cx('ui-icon-btn inline-flex', className)}
    {...rest}
  >
    <Icon size={iconSize} aria-hidden="true" />
  </button>
)

export default IconButton
