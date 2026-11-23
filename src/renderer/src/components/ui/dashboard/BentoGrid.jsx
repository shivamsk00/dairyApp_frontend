/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import cx from '../utils/cx'

/**
 * Responsive dashboard grid: 1 column on small screens, 6 from `sm`, 12 from `lg`.
 * Size children with col-span classes, e.g. 'col-span-12 sm:col-span-6 lg:col-span-3'.
 */
const BentoGrid = ({ className, children }) => (
  <div className={cx('grid grid-cols-1 gap-5 sm:grid-cols-6 lg:grid-cols-12', className)}>
    {children}
  </div>
)

export default BentoGrid
