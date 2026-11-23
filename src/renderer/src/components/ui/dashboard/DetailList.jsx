/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import cx from '../utils/cx'

/**
 * Label / value rows for "view details" dialogs.
 *
 * @param {Array<[string, React.ReactNode]>} items Pairs of [label, value]. Empty values show "—".
 * @param {1|2} [cols=2] Columns from the sm breakpoint.
 */
const DetailList = ({ items, cols = 2, className }) => (
  <dl className={cx('grid grid-cols-1 gap-3', cols === 2 && 'sm:grid-cols-2', className)}>
    {items.map(([label, value]) => (
      <div key={label} className="ui-bg-raised ui-border-subtle rounded-lg border px-4 py-3">
        <dt className="ui-text-tertiary text-[11px] font-semibold uppercase tracking-wide">
          {label}
        </dt>
        <dd className="mt-1 break-words text-[13px] font-medium">
          {value === '' || value == null ? <span className="ui-text-tertiary">—</span> : value}
        </dd>
      </div>
    ))}
  </dl>
)

export default DetailList
