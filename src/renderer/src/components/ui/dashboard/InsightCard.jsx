/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import Badge from '../primitives/Badge'
import Button from '../primitives/Button'
import cx from '../utils/cx'

const ICON_TONE = {
  primary: 'text-[color:var(--ui-primary-500)]',
  success: 'text-[color:var(--ui-success-500)]',
  warning: 'text-[color:var(--ui-warning-500)]',
  danger: 'text-[color:var(--ui-danger-500)]',
  info: 'text-[color:var(--ui-info-500)]',
  accent: 'text-[color:var(--ui-accent-500)]'
}

/**
 * Recommendation / alert tile: tag, short text and an optional action button.
 *
 * @param {string} tag e.g. "Action Needed"
 * @param {'primary'|'success'|'warning'|'danger'|'info'|'accent'} [tone='primary']
 * @param {React.ComponentType} [icon]
 * @param {React.ReactNode} children The insight text.
 * @param {string} [actionLabel]
 * @param {() => void} [onAction]
 */
const InsightCard = ({
  tag,
  tone = 'primary',
  icon: Icon,
  children,
  actionLabel,
  onAction,
  className
}) => (
  <div className={cx('ui-bg-raised ui-border-subtle rounded-xl border p-4', className)}>
    <div className="mb-2 flex items-center justify-between">
      <Badge tone={tone}>{tag}</Badge>
      {Icon && <Icon size={13} className={ICON_TONE[tone]} aria-hidden="true" />}
    </div>
    <div className="text-[12.5px] font-medium leading-snug">{children}</div>
    {actionLabel && (
      <Button variant="secondary" size="sm" fullWidth className="mt-3" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
)

export default InsightCard
