/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import cx from '../utils/cx'
import '../ui.css'

const SIZES = {
  sm: { box: 'size-7', icon: 13 },
  md: { box: 'size-9', icon: 16 },
  lg: { box: 'size-11', icon: 18 },
  xl: { box: 'size-14', icon: 24 }
}

/**
 * Icon on a solid gradient tile — used for KPI cards, notifications, favourites and dialogs.
 *
 * @param {React.ComponentType} icon Icon component, e.g. a lucide-react icon.
 * @param {'primary'|'success'|'warning'|'danger'|'info'|'accent'|'neutral'} [tone='primary']
 * @param {'sm'|'md'|'lg'|'xl'} [size='md']
 * @param {'rounded'|'circle'} [shape='rounded']
 * @param {'solid'|'tint'} [variant='solid'] `tint` is a soft background with a coloured icon.
 */
const IconBadge = ({
  icon: Icon,
  tone = 'primary',
  size = 'md',
  shape = 'rounded',
  variant = 'solid',
  className
}) => {
  const { box, icon } = SIZES[size] ?? SIZES.md
  return (
    <span
      className={cx(
        'grid shrink-0 place-items-center',
        box,
        shape === 'circle' ? 'rounded-full' : 'rounded-lg',
        `ui-${variant}-${tone}`,
        className
      )}
    >
      <Icon size={icon} aria-hidden="true" />
    </span>
  )
}

export default IconBadge
