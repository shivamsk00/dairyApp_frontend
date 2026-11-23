/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { Milk } from 'lucide-react'
import cx from '../utils/cx'
import '../ui.css'

// Brand tile with a spinning ring around it: the one mark shared by every variant.
const Mark = ({ size = 'md' }) => {
  const box = size === 'lg' ? 'size-20' : size === 'sm' ? 'size-9' : 'size-14'
  const tile = size === 'lg' ? 'size-14' : size === 'sm' ? 'size-6' : 'size-9'
  const icon = size === 'lg' ? 26 : size === 'sm' ? 13 : 18
  return (
    <span className={cx('relative grid shrink-0 place-items-center', box)} aria-hidden="true">
      <span className="ui-loader-ring" />
      <span className={cx('ui-loader-tile grid place-items-center rounded-xl text-white', tile)}>
        <Milk size={icon} />
      </span>
    </span>
  )
}

// Grey placeholder of a typical page (title bar, stat cards, table) so the layout doesn't jump.
const PageSkeleton = () => (
  <div className="w-full space-y-5 p-3 sm:p-4 lg:p-6" aria-hidden="true">
    <div className="flex items-center justify-between gap-4">
      <div className="ui-skeleton h-6 w-44" />
      <div className="ui-skeleton hidden h-5 w-40 sm:block" />
    </div>
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="ui-skeleton h-24" />
      ))}
    </div>
    <div className="ui-skeleton h-72" />
  </div>
)

/**
 * Loading state shared by every screen. Appears after a 150 ms delay, so quick loads show nothing.
 *
 * @param {'screen'|'page'|'inline'} [variant='page']
 *   `screen` fills the window (app start, first route), `page` sits in the content area under the
 *   header (route changes), `inline` is a small spinner + label for a card or button area.
 * @param {string} [label='Loading'] Main line.
 * @param {string} [hint] Secondary line, e.g. "Preparing your dairy workspace".
 * @param {string} [brand] Brand name shown on the `screen` variant.
 */
const PageLoader = ({ variant = 'page', label = 'Loading', hint, brand, className }) => {
  if (variant === 'inline') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cx('ui-loader-delayed flex items-center justify-center gap-3 py-8', className)}
      >
        <Mark size="sm" />
        <span className="ui-text-secondary text-[13px] font-semibold">{label}…</span>
      </div>
    )
  }

  const screen = variant === 'screen'
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cx(
        screen
          ? 'ui-loader-screen ui-text-primary fixed inset-0 z-[9999] grid place-items-center'
          : 'ui-text-primary relative w-full',
        className
      )}
    >
      {!screen && (
        <div className="absolute inset-x-0 top-0 z-10 h-[3px]">
          <div className="ui-loader-track size-full !rounded-none" />
        </div>
      )}
      {!screen && <PageSkeleton />}
      <div
        className={cx(
          'ui-loader-delayed flex flex-col items-center text-center',
          screen
            ? 'w-72 gap-5'
            : 'ui-bg-raised ui-shadow-md ui-border-subtle absolute left-1/2 top-24 w-64 max-w-[calc(100%-2rem)] -translate-x-1/2 gap-3 rounded-2xl border px-6 py-5'
        )}
      >
        <Mark size={screen ? 'lg' : 'md'} />
        <div>
          {screen && brand && (
            <p className="ui-font-display mb-1 text-[22px] font-extrabold tracking-tight">
              {brand}
            </p>
          )}
          <p
            className={cx(
              'font-semibold',
              screen ? 'ui-text-secondary text-[13px]' : 'text-[13.5px]'
            )}
          >
            {label}…
          </p>
          {hint && <p className="ui-text-tertiary mt-0.5 text-[12px]">{hint}</p>}
        </div>
        {screen && <div className="ui-loader-track h-1.5 w-full" />}
      </div>
    </div>
  )
}

export default PageLoader
