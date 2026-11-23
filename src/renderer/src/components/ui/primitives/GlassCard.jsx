/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import cx from '../utils/cx'
import '../ui.css'

/**
 * Frosted-glass card (backdrop blur + translucent white). Use it over a photo or an illustration; on a
 * plain background it just looks like a pale card.
 *
 * @param {string} [as='div'] Element to render.
 * @param {'light'|'frost'} [variant='light'] `light` is a pale translucent card with dark text. `frost` is the
 *   richer look: tinted, strongly blurred, with a luminous edge and white text (fields and buttons inside
 *   restyle themselves). Put it over a photo.
 * @param {string} [className] Size and padding classes.
 */
const GlassCard = ({ as: Tag = 'div', variant = 'light', className, children, ...rest }) => (
  <Tag className={cx(variant === 'frost' ? 'ui-glass-frost' : 'ui-glass', className)} {...rest}>
    {children}
  </Tag>
)

export default GlassCard
