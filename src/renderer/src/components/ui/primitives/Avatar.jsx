/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import cx from '../utils/cx'
import '../ui.css'

const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'U'

/**
 * Round avatar: the image when `src` is given, otherwise the name's initials.
 *
 * @param {string} name Used for alt text and initials.
 * @param {string} [src]
 * @param {string} [className] Size classes, e.g. 'size-8' (default 'size-9').
 * @param {boolean} [online] Shows a green presence dot.
 * @param {string} [ringClassName] Border colour for the presence dot, matching the background.
 */
const Avatar = ({
  name,
  src,
  className = 'size-9',
  online = false,
  ringClassName = 'border-white'
}) => (
  <span className="relative inline-flex shrink-0">
    {src ? (
      <img src={src} alt={name} className={cx('rounded-full object-cover', className)} />
    ) : (
      <span
        aria-label={name}
        className={cx(
          'ui-solid-primary grid place-items-center rounded-full text-[12px] font-bold',
          className
        )}
      >
        {initials(name)}
      </span>
    )}
    {online && (
      <span
        className={cx(
          'absolute bottom-0 right-0 size-2.5 rounded-full border-2 bg-[color:var(--ui-success-500)]',
          ringClassName
        )}
      />
    )}
  </span>
)

export default Avatar
