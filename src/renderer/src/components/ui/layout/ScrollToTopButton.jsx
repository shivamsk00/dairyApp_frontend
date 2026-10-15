/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import cx from '../utils/cx'
import '../ui.css'

const resolveTarget = (target) => {
  if (!target) return window
  if (typeof target === 'string') return document.querySelector(target)
  return target.current ?? null
}

/**
 * Floating "back to top" button that appears once the target has scrolled past `threshold`.
 *
 * @param {string | React.RefObject<HTMLElement>} [target] Scrolling element — a CSS selector or a
 *   ref. Defaults to the window. (The app's Layout scrolls inside its <main>, so pass 'main' there.)
 * @param {number} [threshold=300] Pixels scrolled before the button shows.
 * @param {boolean} [bounce] Gently bounce the arrow.
 */
const ScrollToTopButton = ({ target, threshold = 300, bounce = false }) => {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const scroller = resolveTarget(target)
    if (!scroller) return undefined
    const read = () =>
      setShown((scroller === window ? window.scrollY : scroller.scrollTop) > threshold)
    read()
    scroller.addEventListener('scroll', read, { passive: true })
    return () => scroller.removeEventListener('scroll', read)
  }, [target, threshold])

  if (!shown) return null

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => resolveTarget(target)?.scrollTo({ top: 0, behavior: 'smooth' })}
      className="ui-bg-brand fixed bottom-6 right-6 z-50 grid size-11 place-items-center rounded-full shadow-lg transition-all hover:scale-105"
    >
      <ArrowUp size={16} className={cx(bounce && 'ui-animate-bounce-soft')} aria-hidden="true" />
    </button>
  )
}

export default ScrollToTopButton
