/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  Languages,
  LogOut,
  Maximize,
  Menu,
  MessagesSquare,
  Minimize,
  Monitor,
  Moon,
  Plus,
  Search,
  SunMedium
} from 'lucide-react'
import ActionLink from '../primitives/ActionLink'
import Avatar from '../primitives/Avatar'
import Dropdown from '../primitives/Dropdown'
import IconBadge from '../primitives/IconBadge'
import IconButton from '../primitives/IconButton'
import cx from '../utils/cx'
import '../ui.css'

const THEMES = [
  { value: 'light', label: 'Light', icon: SunMedium },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor }
]

const MENU_ITEM =
  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium hover:bg-[color:var(--ui-surface-sunken)]'
const CHIP =
  'relative grid size-7 place-items-center rounded-full transition-transform hover:scale-105'

const useFullscreen = () => {
  const [active, setActive] = useState(() => Boolean(document.fullscreenElement))
  useEffect(() => {
    const sync = () => setActive(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])
  const toggle = () =>
    document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen()
  return [active, toggle]
}

const MenuLink = ({ item, close }) => {
  const Icon = item.icon
  return (
    <ActionLink
      to={item.to}
      href={item.href}
      onClick={() => {
        close()
        item.onClick?.()
      }}
      activeClassName=""
      className={cx(MENU_ITEM, item.tone === 'danger' && 'text-[color:var(--ui-danger-600)]')}
    >
      {Icon && <IconBadge icon={Icon} tone={item.tone ?? 'primary'} variant="tint" size="sm" />}
      {item.label}
    </ActionLink>
  )
}

const NotificationsMenu = ({ notifications, close }) => {
  const [filter, setFilter] = useState('all')
  const { items = [], onMarkAllRead, onViewAll, onItemClick } = notifications
  const unread = items.filter((item) => item.unread).length
  const shown = filter === 'unread' ? items.filter((item) => item.unread) : items

  return (
    <>
      <div className="relative overflow-hidden bg-[linear-gradient(155deg,var(--ui-primary-700),var(--ui-primary-950)_75%)] px-4 pb-3.5 pt-4">
        <div className="flex items-center gap-2">
          <span className="ui-font-display text-[14.5px] font-bold text-white">Notifications</span>
          {unread > 0 && (
            <span className="rounded-full bg-white/20 px-1.5 text-[10px] font-bold leading-[19px] text-white">
              {unread} new
            </span>
          )}
        </div>
        <div className="mt-3.5 flex items-center gap-1.5">
          {['all', 'unread'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cx(
                'rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize',
                filter === value
                  ? 'bg-white text-[color:var(--ui-primary-800)]'
                  : 'bg-white/[0.14] text-white/85'
              )}
            >
              {value}
            </button>
          ))}
          {onMarkAllRead && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="ml-auto text-[11px] font-semibold text-white/85"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="ui-scroll-thin max-h-96 overflow-y-auto">
        {shown.length === 0 && (
          <p className="ui-text-tertiary px-4 py-6 text-center text-[12.5px]">
            You&apos;re all caught up
          </p>
        )}
        {shown.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              close()
              onItemClick?.(item)
            }}
            className="relative flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[color:var(--ui-surface-sunken)]"
          >
            {item.unread && (
              <span className="absolute left-1.5 top-5 size-1.5 rounded-full bg-[color:var(--ui-primary-500)]" />
            )}
            {item.avatar ? (
              <Avatar name={item.title} src={item.avatar} />
            ) : (
              <IconBadge
                icon={item.icon ?? Bell}
                tone={item.tone ?? 'primary'}
                className="rounded-xl"
              />
            )}
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-2">
                <span className="text-[12.5px] font-semibold leading-snug">{item.title}</span>
                <span className="ui-text-tertiary shrink-0 text-[10.5px]">{item.time}</span>
              </span>
              {item.message && (
                <span className="ui-text-secondary mt-0.5 block text-[12px]">{item.message}</span>
              )}
              {item.tag && (
                <span
                  className={cx(
                    'mt-1.5 inline-flex rounded px-1.5 py-0.5 text-[9.5px] font-semibold',
                    `ui-tint-${item.tone ?? 'primary'}`
                  )}
                >
                  {item.tag}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {onViewAll && (
        <button
          type="button"
          onClick={() => {
            close()
            onViewAll()
          }}
          className="ui-border-subtle ui-text-brand flex w-full items-center justify-center gap-1.5 border-t py-2.5 text-[12px] font-semibold"
        >
          View all notifications
          <ArrowRight size={11} aria-hidden="true" />
        </button>
      )}
    </>
  )
}

/**
 * Sticky top bar. Every block is optional and only renders when its props are passed.
 *
 * @param {() => void} [onMenuClick] Mobile sidebar toggle (shown below the lg breakpoint).
 * @param {React.ReactNode} [logo] Shown next to the mobile toggle.
 * @param {{placeholder?: string, shortcut?: string, onClick: () => void}} [search]
 *   Search pill — typically opens the CommandPalette.
 * @param {Array<{label: string, icon?: React.ComponentType, to?: string, href?: string,
 *   onClick?: () => void}>} [quickActions] "Quick Create" menu.
 * @param {string} [quickActionsLabel='Quick Create']
 * @param {'light'|'dark'|'system'} [theme]
 * @param {(theme: string) => void} [onThemeChange] Shows the theme menu.
 * @param {Array<{code: string, label: string, flag?: string}>} [languages]
 * @param {string} [language]
 * @param {(code: string) => void} [onLanguageChange] Shows the language menu.
 * @param {boolean} [showFullscreen] Fullscreen toggle (works for the Electron window).
 * @param {() => void} [onMessagesClick] Messages button — typically opens the ChatDrawer.
 * @param {boolean} [hasUnreadMessages]
 * @param {{items: Array<{id: string, title: string, message?: React.ReactNode, time?: string,
 *   icon?: React.ComponentType, avatar?: string, tone?: string, tag?: string, unread?: boolean}>,
 *   onMarkAllRead?: () => void, onViewAll?: () => void, onItemClick?: (item) => void}} [notifications]
 * @param {{name: string, role?: string, email?: string, avatar?: string, badge?: string}} [user]
 * @param {Array<{label: string, icon?: React.ComponentType, tone?: string, to?: string,
 *   href?: string, onClick?: () => void}>} [userMenu]
 * @param {() => void} [onSignOut] Adds "Sign Out" at the bottom of the profile menu.
 * @param {React.ReactNode} [children] Extra content after the search pill.
 */
const AppHeader = ({
  onMenuClick,
  logo,
  search,
  quickActions = [],
  quickActionsLabel = 'Quick Create',
  theme,
  onThemeChange,
  languages = [],
  language,
  onLanguageChange,
  showFullscreen = false,
  onMessagesClick,
  hasUnreadMessages = false,
  notifications,
  user,
  userMenu = [],
  onSignOut,
  children
}) => {
  const [fullscreen, toggleFullscreen] = useFullscreen()
  const ThemeIcon = THEMES.find((item) => item.value === theme)?.icon ?? SunMedium
  const hasToolbar =
    (onLanguageChange && languages.length > 0) || showFullscreen || onMessagesClick || notifications

  return (
    <header className="ui-header ui-text-primary sticky top-0 z-30">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,var(--ui-primary-500)_20%,var(--ui-accent-500)_50%,var(--ui-primary-500)_80%,transparent)] opacity-[0.55]" />

      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        {onMenuClick && (
          <IconButton
            icon={Menu}
            label="Open menu"
            iconSize={18}
            className="lg:hidden"
            onClick={onMenuClick}
          />
        )}
        {logo && <div className="shrink-0 lg:hidden">{logo}</div>}

        {search && (
          <button
            type="button"
            onClick={search.onClick}
            className="ui-bg-sunken ui-border-subtle group hidden h-10 w-full max-w-[240px] items-center gap-2.5 rounded-full border pe-3.5 ps-1.5 transition-all hover:shadow-sm md:flex xl:max-w-[280px]"
          >
            <span className="ui-tint-primary grid size-7 shrink-0 place-items-center rounded-full">
              <Search size={13} aria-hidden="true" />
            </span>
            <span className="ui-text-tertiary flex-1 truncate text-start text-[13px] font-medium">
              {search.placeholder ?? 'Search…'}
            </span>
            <kbd className="ui-kbd shrink-0 text-[10px]">{search.shortcut ?? 'Ctrl K'}</kbd>
          </button>
        )}

        {children}

        <div className="ml-auto flex items-center gap-2.5 lg:gap-3">
          {quickActions.length > 0 && (
            <Dropdown
              trigger={({ toggle }) => (
                <>
                  <button
                    type="button"
                    onClick={toggle}
                    className="ui-bg-brand hidden h-10 items-center gap-2 rounded-full pe-3 ps-3.5 text-[12.5px] font-semibold transition-all hover:-translate-y-px sm:inline-flex"
                  >
                    <Plus size={13} aria-hidden="true" />
                    <span>{quickActionsLabel}</span>
                    <ChevronDown size={11} className="opacity-80" aria-hidden="true" />
                  </button>
                  <IconButton
                    icon={Plus}
                    label={quickActionsLabel}
                    className="sm:hidden"
                    onClick={toggle}
                  />
                </>
              )}
            >
              {(close) =>
                quickActions.map((item) => <MenuLink key={item.label} item={item} close={close} />)
              }
            </Dropdown>
          )}

          {onThemeChange && (
            <Dropdown
              panelClassName="w-44 p-1.5"
              trigger={({ toggle }) => (
                <button
                  type="button"
                  aria-label="Theme"
                  onClick={toggle}
                  className={cx(CHIP, 'ui-tint-warning')}
                >
                  <ThemeIcon size={13.5} aria-hidden="true" />
                </button>
              )}
            >
              {(close) =>
                THEMES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    className={MENU_ITEM}
                    onClick={() => {
                      close()
                      onThemeChange(value)
                    }}
                  >
                    <Icon size={15} aria-hidden="true" />
                    {label}
                    {theme === value && <Check size={12} className="ml-auto" aria-hidden="true" />}
                  </button>
                ))
              }
            </Dropdown>
          )}

          {hasToolbar && (
            <div className="ui-bg-raised ui-border-subtle ui-shadow-sm hidden h-10 items-center gap-1 rounded-full border px-1.5 sm:flex">
              {onLanguageChange && languages.length > 0 && (
                <Dropdown
                  panelClassName="w-44 p-1.5"
                  trigger={({ toggle }) => (
                    <button
                      type="button"
                      aria-label="Language"
                      onClick={toggle}
                      className={cx(CHIP, 'ui-tint-info')}
                    >
                      <Languages size={13.5} aria-hidden="true" />
                    </button>
                  )}
                >
                  {(close) =>
                    languages.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        className={MENU_ITEM}
                        onClick={() => {
                          close()
                          onLanguageChange(item.code)
                        }}
                      >
                        {item.flag && <span>{item.flag}</span>}
                        {item.label}
                        {language === item.code && (
                          <Check size={12} className="ml-auto" aria-hidden="true" />
                        )}
                      </button>
                    ))
                  }
                </Dropdown>
              )}

              {showFullscreen && (
                <button
                  type="button"
                  aria-label="Toggle fullscreen"
                  onClick={toggleFullscreen}
                  className={cx(CHIP, 'ui-tint-neutral')}
                >
                  {fullscreen ? <Minimize size={13.5} /> : <Maximize size={13.5} />}
                </button>
              )}

              {onMessagesClick && (
                <button
                  type="button"
                  aria-label="Messages"
                  onClick={onMessagesClick}
                  className={cx(CHIP, 'ui-tint-accent')}
                >
                  <MessagesSquare size={13.5} aria-hidden="true" />
                  {hasUnreadMessages && (
                    <span className="absolute right-0.5 top-0.5 size-1.5 rounded-full border-[1.5px] border-white bg-[color:var(--ui-accent-500)]" />
                  )}
                </button>
              )}

              {notifications && (
                <Dropdown
                  panelClassName="w-96 overflow-hidden !p-0"
                  trigger={({ toggle }) => (
                    <button
                      type="button"
                      aria-label="Notifications"
                      onClick={toggle}
                      className={cx(CHIP, 'ui-tint-danger')}
                    >
                      <Bell size={13.5} aria-hidden="true" />
                      {notifications.items?.some((item) => item.unread) && (
                        <span className="absolute right-0.5 top-0.5 size-1.5 rounded-full border-[1.5px] border-white bg-[color:var(--ui-danger-500)]" />
                      )}
                    </button>
                  )}
                >
                  {(close) => <NotificationsMenu notifications={notifications} close={close} />}
                </Dropdown>
              )}
            </div>
          )}

          {user && (
            <Dropdown
              panelClassName="w-72 overflow-hidden !p-0"
              trigger={({ toggle }) => (
                <button
                  type="button"
                  onClick={toggle}
                  className="ui-border-subtle flex h-10 items-center gap-2 rounded-full border pe-2.5 ps-1 transition-colors hover:bg-[color:var(--ui-surface-sunken)]"
                >
                  <Avatar name={user.name} src={user.avatar} className="size-7 text-[10px]" />
                  <span className="hidden flex-col items-start leading-none lg:flex">
                    <span className="text-[12px] font-semibold">{user.name}</span>
                    {user.role && <span className="ui-text-tertiary text-[10px]">{user.role}</span>}
                  </span>
                  <ChevronDown
                    size={10}
                    className="ui-text-tertiary hidden lg:block"
                    aria-hidden="true"
                  />
                </button>
              )}
            >
              {(close) => (
                <>
                  <div className="relative overflow-hidden bg-[linear-gradient(155deg,var(--ui-primary-700),var(--ui-primary-950)_75%)] px-4 pb-3.5 pt-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} src={user.avatar} className="size-11" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="ui-font-display block truncate text-[14px] font-bold text-white">
                            {user.name}
                          </span>
                          {user.badge && (
                            <span className="shrink-0 rounded-full bg-white/[0.18] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                              {user.badge}
                            </span>
                          )}
                        </span>
                        {user.email && (
                          <span className="block truncate text-[11.5px] text-white/70">
                            {user.email}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  {userMenu.length > 0 && (
                    <div className="p-1.5">
                      {userMenu.map((item) => (
                        <MenuLink key={item.label} item={item} close={close} />
                      ))}
                    </div>
                  )}
                  {onSignOut && (
                    <>
                      <div className="mx-3 h-px bg-[color:var(--ui-border-subtle)]" />
                      <div className="p-1.5">
                        <MenuLink
                          item={{
                            label: 'Sign Out',
                            icon: LogOut,
                            tone: 'danger',
                            onClick: onSignOut
                          }}
                          close={close}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </Dropdown>
          )}
        </div>
      </div>
    </header>
  )
}

export default AppHeader
