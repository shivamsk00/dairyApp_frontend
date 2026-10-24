/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import cx from '../utils/cx'
import '../ui.css'

/**
 * Button row that stays visible at the bottom of the scrolling area while a long form is open.
 * Put Cancel / Save buttons inside; they are right-aligned.
 */
const FormActions = ({ className, children }) => (
  <div
    className={cx(
      'ui-card ui-shadow-lg sticky bottom-3 z-20 flex flex-wrap items-center justify-end gap-2 px-4 py-3',
      className
    )}
  >
    {children}
  </div>
)

export default FormActions
