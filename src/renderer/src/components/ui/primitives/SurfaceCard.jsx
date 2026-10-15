/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import cx from '../utils/cx'
import '../ui.css'

/**
 * Base card surface. Pass layout and padding through `className`.
 *
 * @param {boolean} [interactive] Lift and deepen the shadow on hover.
 * @param {string} [as='div'] Element to render, e.g. 'article' or 'section'.
 */
const SurfaceCard = ({ interactive = false, as: Tag = 'div', className, children, ...rest }) => (
  <Tag className={cx('ui-card', interactive && 'ui-card-interactive', className)} {...rest}>
    {children}
  </Tag>
)

export default SurfaceCard
