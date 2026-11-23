/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import cx from '../utils/cx'
import '../ui.css'

/**
 * On/off toggle with an optional label.
 *
 * @param {boolean} checked
 * @param {(checked: boolean) => void} onChange
 * @param {React.ReactNode} [label]
 * @param {boolean} [disabled]
 */
const Switch = ({ checked, onChange, label, disabled = false, className }) => (
  <label
    className={cx(
      'inline-flex cursor-pointer select-none items-center gap-2.5',
      disabled && 'cursor-not-allowed opacity-60',
      className
    )}
  >
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        checked ? 'bg-[color:var(--ui-primary-600)]' : 'bg-[color:var(--ui-neutral-300)]'
      )}
    >
      <span
        className={cx(
          'absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-5'
        )}
      />
    </button>
    {label && <span className="text-[12.5px] font-semibold">{label}</span>}
  </label>
)

export default Switch
