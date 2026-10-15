/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '../primitives/Button'
import cx from '../utils/cx'

// 1 … 4 5 6 … 20 : always the first, last and the pages around the current one.
const pageItems = (page, pageCount) => {
  const items = []
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || (p >= page - 1 && p <= page + 1)) items.push(p)
    else if (p === page - 2 || p === page + 2) items.push(`gap-${p}`)
  }
  return items
}

/**
 * Footer for paged lists: "Showing 1 to 20 of 134 customers" plus Previous / page numbers / Next.
 *
 * @param {number} page Current page, starting at 1.
 * @param {number} pageSize
 * @param {number} total Total number of items.
 * @param {(page: number) => void} onPageChange
 * @param {string} [itemLabel='items'] Plural noun for the summary.
 */
const Pagination = ({ page, pageSize, total, onPageChange, itemLabel = 'items', className }) => {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  if (total <= pageSize) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Pagination"
      className={cx(
        'ui-border-subtle flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row',
        className
      )}
    >
      <p className="ui-text-tertiary text-[12px]">
        Showing <strong className="ui-text-secondary">{from}</strong> to{' '}
        <strong className="ui-text-secondary">{to}</strong> of{' '}
        <strong className="ui-text-secondary">{total}</strong> {itemLabel}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          icon={ChevronLeft}
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(page - 1, 1))}
        >
          Previous
        </Button>
        <div className="hidden items-center gap-1 sm:flex">
          {pageItems(page, pageCount).map((item) =>
            typeof item === 'string' ? (
              <span key={item} className="ui-text-tertiary px-1.5 text-[12px]">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onPageChange(item)}
                className={cx(
                  'min-w-8 rounded-[5px] px-2 py-1.5 text-[12px] font-semibold transition-colors',
                  item === page
                    ? 'ui-bg-brand'
                    : 'ui-text-secondary hover:bg-[color:var(--ui-surface-sunken)]'
                )}
              >
                {item}
              </button>
            )
          )}
        </div>
        <span className="ui-text-secondary px-2 text-[12px] sm:hidden">
          Page {page} of {pageCount}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page === pageCount}
          onClick={() => onPageChange(Math.min(page + 1, pageCount))}
        >
          Next
          <ChevronRight size={13} aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}

export default Pagination
