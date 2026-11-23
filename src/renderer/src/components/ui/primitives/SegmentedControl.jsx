/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import cx from '../utils/cx'
import '../ui.css'

/**
 * Compact switch between a few views (Table | Cards).
 *
 * @param {Array<{value: string, label: string, icon?: React.ComponentType}>} options
 * @param {string} value Selected option value.
 * @param {(value: string) => void} onChange
 * @param {string} [ariaLabel]
 */
const SegmentedControl = ({ options, value, onChange, ariaLabel, className }) => (
  <div
    role="group"
    aria-label={ariaLabel}
    className={cx('ui-bg-sunken inline-flex gap-0.5 rounded-lg p-1', className)}
  >
    {options.map(({ value: optionValue, label, icon: Icon }) => {
      const selected = optionValue === value
      return (
        <button
          key={optionValue}
          type="button"
          aria-pressed={selected}
          onClick={() => onChange(optionValue)}
          className={cx(
            'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors',
            selected
              ? 'ui-bg-raised ui-text-primary ui-shadow-sm'
              : 'ui-text-tertiary hover:text-[color:var(--ui-text-primary)]'
          )}
        >
          {Icon && <Icon size={13} aria-hidden="true" />}
          {label}
        </button>
      )
    })}
  </div>
)

export default SegmentedControl
