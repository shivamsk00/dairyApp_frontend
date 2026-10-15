/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { NavLink } from 'react-router-dom'
import cx from '../utils/cx'

/**
 * Renders a menu/nav item as the right element for its target:
 * - `to`      → react-router NavLink (gets `activeClassName` when the route matches)
 * - `href`    → <a> opened in the system browser (the main window routes target=_blank there)
 * - otherwise → <button> calling `onClick` (e.g. window.api.openSecondWindow)
 *
 * @param {string} [to] Router path.
 * @param {boolean} [end] Exact-match the route (NavLink `end`).
 * @param {string} [href] External URL.
 * @param {() => void} [onClick]
 * @param {string} [activeClassName='is-active']
 */
const ActionLink = ({
  to,
  end,
  href,
  onClick,
  className,
  activeClassName = 'is-active',
  children,
  ...rest
}) => {
  if (to) {
    return (
      <NavLink
        to={to}
        end={end}
        onClick={onClick}
        className={({ isActive }) => cx(className, isActive && activeClassName)}
        {...rest}
      >
        {children}
      </NavLink>
    )
  }
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={onClick}
        className={className}
        {...rest}
      >
        {children}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} className={className} {...rest}>
      {children}
    </button>
  )
}

export default ActionLink
