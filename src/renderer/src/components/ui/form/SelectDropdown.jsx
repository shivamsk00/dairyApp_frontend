/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import Field from './Field'
import cx from '../utils/cx'
import '../ui.css'

/**
 * Custom dropdown list for choosing one option, or several with `multiple`.
 *
 * Keyboard: ArrowUp/Down move, Home/End jump, Enter or Space choose, Esc closes, Tab leaves.
 * Works inside native forms: it renders a hidden input (named `name`) so `required` validation
 * and FormData still work.
 *
 * @param {Array<{value: string|number, label: string, description?: string, disabled?: boolean}>} options
 * @param {string|number|Array<string|number>} value Single: one value ('' for none). Multiple: an array.
 * @param {(value: string|number|Array<string|number>) => void} onChange Gets the new value (an
 *   array when `multiple`). It is not a DOM event.
 * @param {boolean} [multiple] Allow several selections; the list stays open while choosing.
 * @param {boolean} [searchable] Adds a filter box at the top of the list.
 * @param {boolean} [clearable] Shows a clear button when something is selected.
 * @param {string} [placeholder='Select…']
 * @param {string} [searchPlaceholder='Search…']
 * @param {string} [emptyText='No options found']
 * @param {string} [name] Name of the hidden input.
 * @param {boolean} [required] Native required validation + asterisk.
 * @param {boolean} [requiredMark] Asterisk only.
 * @param {boolean} [disabled]
 * Also takes label, hint, error, fieldClassName, className and id like Input.
 */
const SelectDropdown = ({
  options = [],
  value,
  onChange,
  multiple = false,
  searchable = false,
  clearable = false,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'No options found',
  name,
  required,
  requiredMark,
  disabled = false,
  label,
  hint,
  error,
  fieldClassName,
  className,
  id
}) => {
  const auto = useId()
  const controlId = id ?? auto
  const listId = `${controlId}-listbox`
  const optionId = (index) => `${controlId}-option-${index}`

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [openUp, setOpenUp] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const searchRef = useRef(null)
  const listRef = useRef(null)

  const selected = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value === '' || value == null
      ? []
      : [value]
  const isSelected = (optionValue) => selected.some((item) => String(item) === String(optionValue))
  const selectedOptions = options.filter((option) => isSelected(option.value))

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return options
    return options.filter((option) =>
      `${option.label} ${option.description ?? ''}`.toLowerCase().includes(term)
    )
  }, [options, query])

  const firstEnabled = (from, step) => {
    for (let i = from; i >= 0 && i < visible.length; i += step) {
      if (!visible[i].disabled) return i
    }
    return -1
  }

  const openList = () => {
    if (disabled || open) return
    // Open upwards when there is little room below and more above.
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      const below = window.innerHeight - rect.bottom
      setOpenUp(below < 280 && rect.top > below)
    }
    setQuery('')
    const firstSelected = options.findIndex(
      (option) => isSelected(option.value) && !option.disabled
    )
    setActive(
      firstSelected >= 0
        ? firstSelected
        : Math.max(
            0,
            options.findIndex((o) => !o.disabled)
          )
    )
    setOpen(true)
  }

  const closeList = (refocus = true) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus()
  }, [open, searchable])

  // Keep the highlighted option in view while arrowing through a long list.
  useEffect(() => {
    if (open) document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- optionId is derived from controlId
  }, [active, open, visible])

  const choose = (option) => {
    if (!option || option.disabled) return
    if (multiple) {
      onChange(
        isSelected(option.value)
          ? selected.filter((item) => String(item) !== String(option.value))
          : [...selected, option.value]
      )
    } else {
      onChange(option.value)
      closeList()
    }
  }

  const move = (step) => {
    const next = firstEnabled(active + step, step)
    if (next >= 0) setActive(next)
  }

  const onKeyDown = (event) => {
    const onTrigger = event.target === triggerRef.current
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!open) openList()
        else move(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!open) openList()
        else move(-1)
        break
      case 'Home':
        if (open && !searchable) {
          event.preventDefault()
          setActive(Math.max(0, firstEnabled(0, 1)))
        }
        break
      case 'End':
        if (open && !searchable) {
          event.preventDefault()
          setActive(Math.max(0, firstEnabled(visible.length - 1, -1)))
        }
        break
      case 'Enter':
        event.preventDefault()
        if (open) choose(visible[active])
        else openList()
        break
      case ' ':
        if (onTrigger) {
          event.preventDefault()
          if (open) choose(visible[active])
          else openList()
        }
        break
      case 'Escape':
        if (open) {
          event.preventDefault()
          event.stopPropagation()
          closeList()
        }
        break
      case 'Tab':
        setOpen(false)
        break
      default:
    }
  }

  const clearAll = (event) => {
    event.stopPropagation()
    onChange(multiple ? [] : '')
  }

  const hiddenValue = multiple ? selected.join(',') : (selected[0] ?? '')

  return (
    <Field
      id={controlId}
      label={label}
      required={required || requiredMark}
      hint={hint}
      error={error}
      className={fieldClassName}
    >
      <div ref={rootRef} className="relative" onKeyDown={onKeyDown}>
        <div
          ref={triggerRef}
          id={controlId}
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-disabled={disabled || undefined}
          aria-invalid={error ? true : undefined}
          aria-activedescendant={open && visible.length ? optionId(active) : undefined}
          onClick={() => (open ? closeList(false) : openList())}
          className={cx(
            'ui-input flex cursor-pointer items-center gap-2',
            multiple && selected.length > 0 && 'py-1.5',
            disabled && 'cursor-not-allowed opacity-60',
            className
          )}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {selectedOptions.length === 0 && (
              <span className="ui-text-tertiary truncate">{placeholder}</span>
            )}
            {!multiple && selectedOptions[0] && (
              <span className="truncate">{selectedOptions[0].label}</span>
            )}
            {multiple &&
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="ui-badge inline-flex ui-soft-primary gap-1 !pr-1"
                >
                  {option.label}
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={`Remove ${option.label}`}
                    disabled={disabled}
                    onClick={(event) => {
                      event.stopPropagation()
                      choose(option)
                    }}
                    className="inline-grid size-4 place-items-center rounded-sm hover:bg-black/10"
                  >
                    <X size={11} aria-hidden="true" />
                  </button>
                </span>
              ))}
          </div>
          {clearable && selected.length > 0 && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Clear selection"
              onClick={clearAll}
              className="ui-icon-btn inline-flex !size-6 shrink-0"
            >
              <X size={13} aria-hidden="true" />
            </button>
          )}
          <ChevronDown
            size={15}
            className={cx('ui-text-tertiary shrink-0 transition-transform', open && 'rotate-180')}
            aria-hidden="true"
          />
        </div>

        {/* Lets native `required` validation and FormData see the selection. */}
        <input
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          required={required}
          value={hiddenValue}
          onChange={() => {}}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full opacity-0"
        />

        {open && (
          <div
            className={cx(
              'ui-card ui-shadow-xl absolute inset-x-0 z-50 overflow-hidden',
              openUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
            )}
          >
            {searchable && (
              <div className="ui-border-subtle flex items-center gap-2 border-b px-3 py-2">
                <Search size={14} className="ui-text-tertiary shrink-0" aria-hidden="true" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setActive(0)
                  }}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  aria-controls={listId}
                  aria-activedescendant={visible.length ? optionId(active) : undefined}
                  autoComplete="off"
                  className="w-full border-0 bg-transparent text-[13px] outline-none"
                />
              </div>
            )}
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-multiselectable={multiple || undefined}
              className="ui-scroll-thin max-h-60 overflow-y-auto p-1"
            >
              {visible.length === 0 && (
                <li className="ui-text-tertiary px-3 py-6 text-center text-[12.5px]">
                  {emptyText}
                </li>
              )}
              {visible.map((option, index) => {
                const chosen = isSelected(option.value)
                return (
                  <li
                    key={option.value}
                    id={optionId(index)}
                    role="option"
                    aria-selected={chosen}
                    aria-disabled={option.disabled || undefined}
                    onMouseEnter={() => !option.disabled && setActive(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => choose(option)}
                    className={cx(
                      'flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px]',
                      index === active && 'ui-bg-sunken',
                      option.disabled && 'cursor-not-allowed opacity-45',
                      chosen && 'font-semibold'
                    )}
                  >
                    {multiple && (
                      <span
                        className={cx(
                          'grid size-4 shrink-0 place-items-center rounded border',
                          chosen
                            ? 'ui-bg-brand border-transparent'
                            : 'ui-border-default bg-transparent'
                        )}
                        aria-hidden="true"
                      >
                        {chosen && <Check size={11} strokeWidth={3} />}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.description && (
                        <span className="ui-text-tertiary block truncate text-[11.5px] font-normal">
                          {option.description}
                        </span>
                      )}
                    </span>
                    {!multiple && chosen && (
                      <Check size={14} className="ui-text-brand shrink-0" aria-hidden="true" />
                    )}
                  </li>
                )
              })}
            </ul>
            {multiple && (
              <div className="ui-border-subtle ui-text-tertiary flex items-center justify-between border-t px-3 py-1.5 text-[11.5px]">
                <span>{selected.length} selected</span>
                {selected.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange([])}
                    className="ui-text-brand font-semibold"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Field>
  )
}

export default SelectDropdown
