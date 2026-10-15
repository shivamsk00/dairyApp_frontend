/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Command } from 'lucide-react'
import cx from '../utils/cx'
import '../ui.css'

const TONE_TEXT = {
  primary: 'text-[color:var(--ui-primary-600)]',
  accent: 'text-[color:var(--ui-accent-500)]',
  success: 'text-[color:var(--ui-success-600)]',
  warning: 'text-[color:var(--ui-warning-600)]',
  danger: 'text-[color:var(--ui-danger-600)]',
  info: 'text-[color:var(--ui-info-600)]'
}

const matches = (item, query) =>
  `${item.label} ${item.keywords ?? ''}`.toLowerCase().includes(query.trim().toLowerCase())

/**
 * Searchable command palette (⌘K / Ctrl+K). Arrow keys move, Enter runs, Esc closes.
 * Must render inside the app's router (it navigates with react-router).
 *
 * @param {boolean} isOpen
 * @param {(open: boolean) => void} onOpenChange
 * @param {Array<{title: string, items: Array<{
 *   id: string, label: string, icon?: React.ComponentType,
 *   tone?: 'primary'|'accent'|'success'|'warning'|'danger'|'info',
 *   keywords?: string, to?: string, onSelect?: () => void }>}>} groups
 *   Items navigate to `to` and/or call `onSelect`.
 * @param {boolean} [hotkey=true] Register the global Ctrl/⌘+K shortcut.
 * @param {string} [placeholder]
 */
const CommandPalette = ({
  isOpen,
  onOpenChange,
  groups = [],
  hotkey = true,
  placeholder = 'Search pages and actions…'
}) => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!hotkey) return undefined
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onOpenChange(!isOpen)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [hotkey, isOpen, onOpenChange])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveIndex(0)
      inputRef.current?.focus()
    }
  }, [isOpen])

  const visibleGroups = useMemo(
    () =>
      groups
        .map((group) => ({ ...group, items: group.items.filter((item) => matches(item, query)) }))
        .filter((group) => group.items.length > 0),
    [groups, query]
  )
  const flatItems = visibleGroups.flatMap((group) => group.items)

  const run = (item) => {
    onOpenChange(false)
    if (item.to) navigate(item.to)
    item.onSelect?.()
  }

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      onOpenChange(false)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, flatItems.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter' && flatItems[activeIndex]) {
      event.preventDefault()
      run(flatItems[activeIndex])
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-[#0a0c0b8c] px-4 pt-24 backdrop-blur-[2px]"
      onMouseDown={(event) => event.target === event.currentTarget && onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="ui-card ui-shadow-xl ui-animate-rise-in ui-text-primary w-full max-w-xl overflow-hidden"
        onKeyDown={onKeyDown}
      >
        <div className="ui-border-subtle flex items-center gap-3 border-b px-4 py-3.5">
          <Command size={16} className="ui-text-tertiary" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            placeholder={placeholder}
            autoComplete="off"
            className="flex-1 border-0 bg-transparent text-[14px] outline-none"
          />
          <kbd className="ui-kbd">Esc</kbd>
        </div>
        <div className="ui-scroll-thin max-h-96 overflow-y-auto p-2">
          {visibleGroups.length === 0 && (
            <p className="ui-text-tertiary px-2.5 py-6 text-center text-[13px]">No results</p>
          )}
          {visibleGroups.map((group) => (
            <div key={group.title}>
              <p className="ui-text-tertiary px-2.5 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-wide">
                {group.title}
              </p>
              {group.items.map((item) => {
                const index = flatItems.indexOf(item)
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => run(item)}
                    className={cx(
                      'ui-cmdk-item flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left',
                      index === activeIndex && 'is-active'
                    )}
                  >
                    {Icon && (
                      <Icon
                        size={15}
                        className={TONE_TEXT[item.tone ?? 'primary']}
                        aria-hidden="true"
                      />
                    )}
                    <span className="text-[13px] font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default CommandPalette
