/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import cx from '../utils/cx'
import '../ui.css'

/**
 * Lightweight, styled table for dashboard cards (top items, recent entries…). For sorting,
 * pagination or large data sets keep using @tanstack/react-table / react-data-table-component,
 * which the app already ships.
 *
 * @param {Array<{key: string, header: React.ReactNode, render?: (row) => React.ReactNode,
 *   className?: string}>} columns Without `render`, the cell shows row[key].
 * @param {Array<object>} rows
 * @param {(row, index: number) => string | number} [rowKey] Defaults to row.id, then the index.
 * @param {React.ReactNode} [emptyMessage='No records']
 * @param {string} [minWidth] e.g. '760px' to scroll horizontally on narrow screens.
 * @param {(row) => string | undefined} [rowClassName] Extra classes per row (e.g. highlight one being edited).
 * @param {boolean} [stickyHeader] Keeps the header row visible while the table scrolls vertically (give the
 *   table a max height through `className`, e.g. 'max-h-[60vh] overflow-y-auto').
 * @param {(row) => void} [onRowClick] Makes rows clickable (and keyboard-focusable: Enter/Space). Clicks on
 *   links, buttons and form controls inside a row are ignored, so cell actions keep working.
 */
// Clicks that belong to something inside the row (a link, button or field) are not row clicks.
const INTERACTIVE = 'a, button, input, select, textarea, label, [role="combobox"]'

const DataTable = ({
  columns,
  rows = [],
  rowKey,
  rowClassName,
  onRowClick,
  stickyHeader = false,
  emptyMessage = 'No records',
  minWidth,
  className
}) => (
  <div className={cx('ui-scroll-thin -mx-1 overflow-x-auto', className)}>
    <table
      className={cx('ui-data-table w-full', stickyHeader && 'ui-data-table-sticky')}
      style={minWidth ? { minWidth } : undefined}
    >
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col" className={column.className}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="ui-text-tertiary !py-8 text-center">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row, index) => (
            <tr
              key={rowKey ? rowKey(row, index) : (row.id ?? index)}
              className={cx(
                onRowClick && 'cursor-pointer hover:bg-[color:var(--ui-surface-sunken)]',
                rowClassName?.(row)
              )}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={
                onRowClick
                  ? (event) => {
                      if (!event.target.closest(INTERACTIVE)) onRowClick(row)
                    }
                  : undefined
              }
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.target !== event.currentTarget) return
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onRowClick(row)
                      }
                    }
                  : undefined
              }
            >
              {columns.map((column) => (
                <td key={column.key} className={column.className}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
)

export default DataTable
