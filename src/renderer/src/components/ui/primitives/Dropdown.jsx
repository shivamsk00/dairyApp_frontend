/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { useEffect, useRef, useState } from 'react'
import cx from '../utils/cx'
import '../ui.css'

/**
 * Click-to-open menu panel that closes on outside click, Esc, or when an item is chosen.
 *
 * @param {(props: {open: boolean, toggle: () => void}) => React.ReactNode} trigger
 *   Renders the toggle; spread nothing — call `toggle` from your button's onClick.
 * @param {(close: () => void) => React.ReactNode | React.ReactNode} children
 *   Menu content. Pass a function to receive `close` (e.g. to close after an action).
 * @param {'start'|'end'} [align='end'] Which edge of the trigger the panel lines up with.
 * @param {string} [panelClassName] Width / padding for the panel, e.g. 'w-56 p-1.5'.
 */
const Dropdown = ({
  trigger,
  children,
  align = 'end',
  panelClassName = 'w-56 p-1.5',
  className
}) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div ref={rootRef} className={cx('relative', className)}>
      {trigger({ open, toggle: () => setOpen((value) => !value) })}
      {open && (
        <div
          role="menu"
          className={cx(
            'ui-card ui-shadow-xl absolute z-50 mt-2',
            align === 'end' ? 'right-0' : 'left-0',
            panelClassName
          )}
        >
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  )
}

export default Dropdown
