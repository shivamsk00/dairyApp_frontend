/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import Badge from '../primitives/Badge'
import IconBadge from '../primitives/IconBadge'
import SurfaceCard from '../primitives/SurfaceCard'
import cx from '../utils/cx'

/**
 * Metric card: icon, label, big value, optional change badge, chart slot and detail rows.
 *
 * @param {string} label e.g. "Milk collected"
 * @param {React.ReactNode} value e.g. "1,240 L"
 * @param {React.ComponentType} [icon]
 * @param {'primary'|'success'|'warning'|'danger'|'info'|'accent'|'neutral'} [tone='primary']
 * @param {{value: string, direction?: 'up'|'down', positive?: boolean}} [change]
 *   `positive` decides the colour (defaults to direction === 'up').
 * @param {Array<{label: string, value: React.ReactNode}>} [details] Small rows under the value.
 * @param {React.ReactNode} [children] Chart slot (e.g. a react-apexcharts sparkline).
 * @param {string} [className] Grid placement, e.g. 'col-span-12 sm:col-span-6 lg:col-span-3'.
 */
const KpiCard = ({
  label,
  value,
  icon,
  tone = 'primary',
  change,
  details = [],
  children,
  className
}) => {
  const up = change?.direction !== 'down'
  const positive = change?.positive ?? up
  return (
    <SurfaceCard as="article" interactive className={cx('ui-animate-rise-in p-4', className)}>
      <div className="flex items-start justify-between gap-2">
        {icon && <IconBadge icon={icon} tone={tone} />}
        {change && (
          <Badge tone={positive ? 'success' : 'danger'} icon={up ? ArrowUpRight : ArrowDownRight}>
            {change.value}
          </Badge>
        )}
      </div>
      <h2 className="ui-text-tertiary mt-2.5 text-[11.5px]">{label}</h2>
      <h3 className="ui-font-display mt-0.5 text-[24px] font-extrabold leading-none">{value}</h3>
      {children && <div className="-ml-1 mt-2">{children}</div>}
      {details.length > 0 && (
        <ul className="ui-text-tertiary mt-2 space-y-1 text-[11px]">
          {details.map((detail) => (
            <li key={detail.label} className="flex items-center justify-between">
              <span>{detail.label}</span>
              <span className="ui-text-secondary font-semibold">{detail.value}</span>
            </li>
          ))}
        </ul>
      )}
    </SurfaceCard>
  )
}

export default KpiCard
