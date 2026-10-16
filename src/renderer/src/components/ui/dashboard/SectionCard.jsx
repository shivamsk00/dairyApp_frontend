/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import IconBadge from '../primitives/IconBadge'
import SurfaceCard from '../primitives/SurfaceCard'
import cx from '../utils/cx'

/**
 * Card with a title row — the wrapper for dashboard charts, tables and lists.
 *
 * @param {React.ReactNode} title
 * @param {React.ReactNode} [subtitle]
 * @param {React.ComponentType} [icon] Optional icon tile before the title.
 * @param {string} [tone='primary'] Icon tile tone.
 * @param {React.ReactNode} [action] Right side of the title row (e.g. a "View all" link).
 * @param {string} [className] Grid placement, e.g. 'col-span-12 lg:col-span-8'.
 */
const SectionCard = ({ title, subtitle, icon, tone = 'primary', action, className, children }) => (
  <SurfaceCard as="section" className={cx('p-5 lg:p-6', className)}>
    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {icon && <IconBadge icon={icon} tone={tone} />}
        <div>
          <h2 className="ui-font-display text-[15px] font-bold">{title}</h2>
          {subtitle && <p className="ui-text-tertiary text-[11px]">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
    {children}
  </SurfaceCard>
)

export default SectionCard
