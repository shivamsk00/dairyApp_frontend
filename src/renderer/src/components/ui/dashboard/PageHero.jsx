/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { Fragment } from 'react'
import '../ui.css'

/**
 * Gradient hero header for dashboards ("Welcome back, …" with inline stats and actions).
 *
 * @param {React.ReactNode} title
 * @param {React.ReactNode} [description]
 * @param {Array<{label: React.ReactNode, icon?: React.ComponentType}>} [chips] Small pills above the title.
 * @param {Array<{label: string, value: React.ReactNode}>} [stats] Inline figures under the description.
 * @param {React.ReactNode} [actions] Buttons on the right (white / translucent buttons read best).
 * @param {React.ReactNode} [meta] Small text under the actions, e.g. today's date.
 */
const PageHero = ({ title, description, chips = [], stats = [], actions, meta }) => (
  <div className="ui-animate-rise-in ui-shadow-lg relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--ui-primary-700),var(--ui-primary-950)_65%)] p-5 text-white lg:p-7">
    <span className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-white/[0.08] blur-[4px]" />
    <span className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-[color:var(--ui-accent-500)] opacity-[0.16] blur-[10px]" />
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <pattern id="ui-hero-grid" width="28" height="28" patternUnits="userSpaceOnUse">
        <path d="M28 0H0V28" fill="none" stroke="white" strokeWidth="1" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#ui-hero-grid)" />
    </svg>

    <div className="relative flex flex-wrap items-start justify-between gap-5">
      <div className="min-w-0">
        {chips.length > 0 && (
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            {chips.map(({ label, icon: Icon }, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.18] bg-white/[0.14] px-2.5 py-1 text-[10.5px] font-semibold"
              >
                {Icon && <Icon size={10} aria-hidden="true" />}
                {label}
              </span>
            ))}
          </div>
        )}
        <h1 className="ui-font-display text-[24px] font-extrabold leading-tight lg:text-[28px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-lg text-[13px] text-white/[0.78]">{description}</p>
        )}

        {stats.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            {stats.map((stat, index) => (
              <Fragment key={stat.label}>
                {index > 0 && <div className="hidden h-8 w-px bg-white/[0.18] sm:block" />}
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-wide text-white/60">
                    {stat.label}
                  </p>
                  <p className="ui-font-display mt-0.5 text-[17px] font-bold">{stat.value}</p>
                </div>
              </Fragment>
            ))}
          </div>
        )}
      </div>

      {(actions || meta) && (
        <div className="flex shrink-0 flex-col items-end gap-3">
          {actions && (
            <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>
          )}
          {meta && <p className="text-end text-[11px] text-white/65">{meta}</p>}
        </div>
      )}
    </div>
  </div>
)

export default PageHero
