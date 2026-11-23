/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import cx from '../utils/cx'
import '../ui.css'

/**
 * Label + control + hint/error wrapper. Used by Input, Select, Textarea and FileInput; use it
 * directly for custom controls.
 *
 * @param {string} id Control id (the label's htmlFor).
 * @param {React.ReactNode} [label]
 * @param {boolean} [required] Shows the red asterisk. Native validation is up to the control.
 * @param {React.ReactNode} [hint] Helper text under the control.
 * @param {React.ReactNode} [error] Error text; replaces the hint and turns it red.
 * @param {string} [className] Grid placement, e.g. 'sm:col-span-2'.
 */
const Field = ({ id, label, required, hint, error, className, children }) => (
  <div className={cx('min-w-0', className)}>
    {label && (
      <label htmlFor={id} className="ui-field-label">
        {label}
        {required && (
          <span className="ml-0.5 text-[color:var(--ui-danger-500)]" aria-hidden="true">
            *
          </span>
        )}
      </label>
    )}
    {children}
    {error ? (
      <p
        id={`${id}-message`}
        role="alert"
        className="mt-1 text-[11.5px] text-[color:var(--ui-danger-600)]"
      >
        {error}
      </p>
    ) : (
      hint && (
        <p id={`${id}-message`} className="ui-text-tertiary mt-1 text-[11.5px]">
          {hint}
        </p>
      )
    )}
  </div>
)

export default Field
