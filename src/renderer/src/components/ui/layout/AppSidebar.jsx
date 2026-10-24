/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Database,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'
import ActionLink from '../primitives/ActionLink'
import Avatar from '../primitives/Avatar'
import IconBadge from '../primitives/IconBadge'
import cx from '../utils/cx'
import '../ui.css'

const isActivePath = (to, pathname, end) => {
  if (!to) return false
  if (end || to === '/') return pathname === to
  return pathname === to || pathname.startsWith(to.endsWith('/') ? to : `${to}/`)
}

const itemKey = (item) => item.id ?? item.to ?? item.label

const containsActive = (item, pathname) =>
  (item.children ?? []).some((child) => isActivePath(child.to, pathname, child.end))
// Note: `child.active` (window-opening items) only highlights the row; it doesn't auto-open the menu.

const SidebarBadge = ({ badge }) =>
  badge ? (
    <span
      className={cx(
        'ml-auto rounded-full px-1.5 text-[10px] font-bold leading-[1.4]',
        `ui-soft-${badge.tone ?? 'accent'}`
      )}
    >
      {badge.label}
    </span>
  ) : null

/**
 * Dark navigation sidebar.
 *
 * Layout: on lg+ screens it reserves its width in a flex row (250px, or 84px when collapsed — a
 * collapsed sidebar expands over the content on hover). Below lg it is an off-canvas drawer
 * controlled by `mobileOpen` / `onMobileClose`.
 *
 * @param {Array<{title?: string, items: NavItem[]}>} sections
 *   NavItem: { id?, label, icon?: React.ComponentType, to?, end?, href?, onClick?, disabled?, active?,
 *   badge?: {label, tone?}, children?: NavItem[] }. Items with `children` render as a submenu that
 *   opens automatically when one of its routes is active.
 * @param {React.ReactNode} [logo] Shown when expanded.
 * @param {React.ReactNode} [logoCollapsed] Shown when collapsed (e.g. an icon-only mark).
 * @param {boolean} [collapsed]
 * @param {(collapsed: boolean) => void} [onCollapsedChange] Shows the expand / shrink toggle button.
 * @param {boolean} [mobileOpen]
 * @param {() => void} [onMobileClose]
 * @param {{title?: string, visibleCount?: number, items: Array<{label: string,
 *   icon: React.ComponentType, tone?: string, to?: string, href?: string, onClick?: () => void}>}} [favorites]
 *   Quick-access tiles above the menu.
 * @param {{label: string, value: number, max: number, valueLabel?: string, actionLabel?: string,
 *   onAction?: () => void}} [usage] Meter card above the user row (e.g. storage, SMS credits).
 * @param {{name: string, role?: string, avatar?: string, badge?: string}} [user]
 * @param {React.ReactNode} [footer] Shown at the bottom when expanded (e.g. version / copyright).
 * @param {React.ReactNode} [footerCollapsed] Shown at the bottom when collapsed.
 * @param {() => void} [onUserClick]
 * @param {() => void} [onSignOut]
 */
const AppSidebar = ({
  sections = [],
  logo,
  logoCollapsed,
  collapsed = false,
  onCollapsedChange,
  mobileOpen = false,
  onMobileClose,
  favorites,
  usage,
  user,
  footer,
  footerCollapsed,
  onUserClick,
  onSignOut
}) => {
  const { pathname } = useLocation()
  const [hovered, setHovered] = useState(false)
  const [openIds, setOpenIds] = useState(() => new Set())
  const [showAllFavorites, setShowAllFavorites] = useState(false)
  const expanded = !collapsed || hovered || mobileOpen

  // Open the submenu that contains the current route, and close the mobile drawer on navigation.
  useEffect(() => {
    const active = sections
      .flatMap((section) => section.items)
      .filter((item) => containsActive(item, pathname))
      .map(itemKey)
    if (active.length) setOpenIds((current) => new Set([...current, ...active]))
    onMobileClose?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- react to route changes only
  }, [pathname])

  const toggleOpen = (key) =>
    setOpenIds((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const favoriteItems = favorites?.items ?? []
  const visibleFavorites = showAllFavorites
    ? favoriteItems
    : favoriteItems.slice(0, favorites?.visibleCount ?? 2)
  const hiddenFavorites = favoriteItems.length - visibleFavorites.length

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onMobileClose} />
      )}
      <div
        className={cx(
          'relative w-0 shrink-0 transition-[width] duration-[250ms]',
          collapsed ? 'lg:w-[84px]' : 'lg:w-[250px]'
        )}
      >
        <aside
          aria-label="Sidebar"
          onMouseEnter={() => collapsed && setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={cx(
            'ui-sidebar-scope fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-[color:var(--ui-sidebar-border)] ui-sidebar-surface transition-[width,transform] duration-[250ms] lg:absolute',
            mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            expanded ? 'lg:w-[250px]' : 'ui-sidebar-collapsed lg:w-[84px]',
            collapsed && hovered && 'ui-shadow-xl'
          )}
        >
          <div
            className={cx(
              'flex h-16 shrink-0 items-center border-b border-[color:var(--ui-sidebar-border)] px-4',
              expanded ? 'justify-between' : 'justify-center'
            )}
          >
            <div className="flex min-w-0 items-center px-2.5">
              {expanded ? logo : (logoCollapsed ?? logo)}
            </div>
            {onCollapsedChange && expanded && (
              <button
                type="button"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                onClick={() => {
                  setHovered(false)
                  onCollapsedChange(!collapsed)
                }}
                className="ui-icon-btn hidden !size-8 shrink-0 !text-[color:var(--ui-sidebar-fg-60)] hover:!bg-[color:var(--ui-sidebar-tint-12)] hover:!text-[color:var(--ui-sidebar-text-active)] lg:inline-flex"
              >
                {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
              </button>
            )}
          </div>

          <nav
            aria-label="Sidebar navigation"
            className="ui-scroll-thin mt-1 flex-1 overflow-y-auto px-3 pb-4"
          >
            {expanded && favoriteItems.length > 0 && (
              <div className="pt-2">
                <p className="px-1.5 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-[color:var(--ui-sidebar-fg-40)]">
                  {favorites.title ?? 'Favorites'}
                </p>
                <div className="grid grid-cols-2 gap-2 pb-1">
                  {visibleFavorites.map((item) => (
                    <ActionLink
                      key={itemKey(item)}
                      to={item.to}
                      end={item.to === '/'}
                      href={item.href}
                      onClick={item.onClick}
                      className="ui-favorite-tile"
                    >
                      <IconBadge icon={item.icon} tone={item.tone ?? 'primary'} />
                      <span className="w-full truncate text-center text-[11px] font-medium">
                        {item.label}
                      </span>
                    </ActionLink>
                  ))}
                </div>
                {favoriteItems.length > (favorites.visibleCount ?? 2) && (
                  <button
                    type="button"
                    onClick={() => setShowAllFavorites((value) => !value)}
                    className="mt-1 flex w-full items-center justify-center gap-1 py-1 text-[11px] font-semibold text-[color:var(--ui-primary-400)]"
                  >
                    {showAllFavorites ? 'Show less' : `View ${hiddenFavorites} more`}
                    <ChevronDown size={10} className={cx(showAllFavorites && 'rotate-180')} />
                  </button>
                )}
              </div>
            )}

            {sections.map((section, sectionIndex) => (
              <ul key={section.title ?? sectionIndex} className="space-y-0.5">
                {section.title && expanded && (
                  <li className="ui-sidebar-group-title">{section.title}</li>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon
                  const key = itemKey(item)
                  if (item.children?.length) {
                    const open = expanded && openIds.has(key)
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          title={expanded ? undefined : item.label}
                          onClick={() => toggleOpen(key)}
                          className={cx(
                            'ui-sidebar-link',
                            containsActive(item, pathname) && 'is-active'
                          )}
                        >
                          {Icon && <Icon size={16} aria-hidden="true" />}
                          {expanded && <span className="truncate">{item.label}</span>}
                          {expanded && (
                            <ChevronRight
                              size={11}
                              className={cx('ml-auto transition-transform', open && 'rotate-90')}
                            />
                          )}
                        </button>
                        {open && (
                          <ul className="ui-sidebar-submenu">
                            {item.children.map((child) => (
                              <li
                                key={itemKey(child)}
                                className={cx(
                                  (child.active || isActivePath(child.to, pathname, child.end)) &&
                                    'is-active'
                                )}
                              >
                                <ActionLink
                                  to={child.to}
                                  end={child.end ?? child.to === '/'}
                                  href={child.href}
                                  onClick={child.onClick}
                                  disabled={child.disabled}
                                  className="ui-sidebar-link"
                                >
                                  <span className="truncate">{child.label}</span>
                                  {child.disabled && (
                                    <span className="ml-auto size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  )}
                                  <SidebarBadge badge={child.badge} />
                                </ActionLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  }
                  return (
                    <li key={key}>
                      <ActionLink
                        to={item.to}
                        end={item.end ?? item.to === '/'}
                        href={item.href}
                        onClick={item.onClick}
                        title={expanded ? undefined : item.label}
                        className="ui-sidebar-link"
                      >
                        {Icon && <Icon size={16} aria-hidden="true" />}
                        {expanded && <span className="truncate">{item.label}</span>}
                        {expanded && <SidebarBadge badge={item.badge} />}
                      </ActionLink>
                    </li>
                  )
                })}
              </ul>
            ))}
          </nav>

          {expanded && usage && (
            <div className="shrink-0 px-3 pb-2">
              <div className="rounded-xl border border-[color:var(--ui-sidebar-border)] bg-[color:var(--ui-sidebar-tint-4)] p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[color:var(--ui-sidebar-text-active)]">
                    <Database size={12} className="text-[color:var(--ui-primary-400)]" />
                    {usage.label}
                  </span>
                  <span className="text-[10.5px] font-semibold text-[color:var(--ui-sidebar-text)]">
                    {usage.valueLabel ?? `${usage.value} / ${usage.max}`}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--ui-sidebar-tint-8)]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--ui-primary-400),var(--ui-accent-500))]"
                    style={{ width: `${Math.min(100, (usage.value / usage.max) * 100 || 0)}%` }}
                  />
                </div>
                {usage.actionLabel && (
                  <button
                    type="button"
                    onClick={usage.onAction}
                    className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-semibold text-[color:var(--ui-primary-400)]"
                  >
                    {usage.actionLabel}
                    <ArrowRight size={9} />
                  </button>
                )}
              </div>
            </div>
          )}

          {user && (
            <div className="shrink-0 border-t border-[color:var(--ui-sidebar-border)] p-3">
              <div
                className={cx(
                  'flex w-full items-center gap-2.5 rounded-lg bg-[color:var(--ui-sidebar-tint-4)] p-2',
                  !expanded && 'justify-center'
                )}
              >
                <button
                  type="button"
                  onClick={onUserClick}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  title={expanded ? undefined : user.name}
                >
                  <Avatar
                    name={user.name}
                    src={user.avatar}
                    className="size-8"
                    online
                    ringClassName="border-[color:var(--ui-sidebar-bg)]"
                  />
                  {expanded && (
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="block truncate text-[12.5px] font-semibold text-[color:var(--ui-sidebar-text-active)]">
                          {user.name}
                        </span>
                        {user.badge && (
                          <span className="ui-soft-accent shrink-0 rounded px-1 py-px text-[8.5px] font-bold uppercase tracking-wide">
                            {user.badge}
                          </span>
                        )}
                      </span>
                      {user.role && (
                        <span className="block truncate text-[10.5px] text-[color:var(--ui-sidebar-text)]">
                          {user.role}
                        </span>
                      )}
                    </span>
                  )}
                </button>
                {expanded && onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    title="Sign out"
                    aria-label="Sign out"
                    className="ui-icon-btn inline-flex !size-7 shrink-0 !text-[color:var(--ui-sidebar-fg-60)] hover:!bg-[color:var(--ui-sidebar-tint-12)] hover:!text-[color:var(--ui-sidebar-text-active)]"
                  >
                    <LogOut size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
          {(expanded ? footer : footerCollapsed) && (
            <div className="shrink-0 border-t border-[color:var(--ui-sidebar-border)] px-3 py-3 text-center">
              {expanded ? footer : footerCollapsed}
            </div>
          )}
        </aside>
      </div>
    </>
  )
}

export default AppSidebar
