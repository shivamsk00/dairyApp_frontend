/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import IconBadge from '../primitives/IconBadge'
import '../ui.css'

// Ticks on its own so the page above does not re-render every second.
const LiveClock = () => {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return (
    <span className="ui-bg-sunken inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold tabular-nums">
      <Clock size={14} aria-hidden="true" />
      {now.toLocaleString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })}
    </span>
  )
}

/**
 * Title bar for pages that open in their own Electron window (no sidebar or header around them):
 * icon tile, title and a live clock.
 *
 * @param {string} title
 * @param {React.ComponentType} icon lucide-react icon.
 * @param {'primary'|'success'|'warning'|'danger'|'info'|'accent'|'neutral'} [tone='primary']
 * @param {React.ReactNode} [children] Extra content on the right, before the clock.
 */
const WindowHeader = ({ title, icon, tone = 'primary', children }) => (
  <div className="ui-bg-sunken ui-border-subtle flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
    <div className="flex items-center gap-3">
      <IconBadge icon={icon} tone={tone} />
      <h1 className="ui-font-display text-[16px] font-extrabold uppercase tracking-wide">
        {title}
      </h1>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      {children}
      <LiveClock />
    </div>
  </div>
)

export default WindowHeader
